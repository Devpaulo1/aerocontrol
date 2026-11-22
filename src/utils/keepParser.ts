import {
  type ItemCategory,
  type LoanDirection,
  type TorqueTriggerType,
} from '../types/maintenance'
import { toIsoDate } from './date'

export interface ParsedItemDraft {
  category: ItemCategory
  title: string
  notes: string
  sourceLine: number
  aircraftPrefix?: string
  status?: string
  priority?: string
  measurement?: string
  manualRef?: string
  partNumber?: string
  serialNumber?: string
  relatedAircraftPrefix?: string
  direction?: LoanDirection
  returned: boolean
  provider?: string
  sentDate?: string
  expectedReturnDate?: string
  torqueValue?: string
  technicalRef?: string
  triggerType?: TorqueTriggerType
  dueHours?: number
  dueDate?: string
}

export interface KeepParseResult {
  items: ParsedItemDraft[]
  unmatched: string[]
}

interface HeaderRule {
  pattern: RegExp
  category: ItemCategory
}

const HEADER_RULES: HeaderRule[] = [
  {
    pattern: /\b(discrep|discrepancia|a-disc|a disc)\b/,
    category: 'DISCREPANCY',
  },
  { pattern: /\b(terceir|terceiros)\b/, category: 'THIRD_PARTY' },
  {
    pattern: /\b(checks?\s+de\s+torque|torque|atencao|aten[cç][aã]o)\b/,
    category: 'TORQUE_CHECK',
  },
  { pattern: /\b(emprestim|material|materiais)\b/, category: 'LOAN_MATERIAL' },
  {
    pattern: /\b(a\s+efetuar|tarefa|tarefas|checklist|pendente|pendentes)\b/,
    category: 'TASK',
  },
]

const PATTERNS = {
  partNumber: /\b(?:p\/?n|part\s+number)\s*[:=-]?\s*([a-z0-9][a-z0-9.\-/]{2,})\b/i,
  serialNumber:
    /\b(?:s\/?n|serial\s+number)\s*[:=-]?\s*([a-z0-9][a-z0-9.\-/]{2,})\b/i,
  torque:
    /\b(\d{2,4}\s*[-a]\s*\d{2,4}\s*(?:in-lbs|in\s+lbs|lb-in|ft-lbs|nm))\b/i,
  technicalRef:
    /\b((?:cf|sb|ad|service\s+bulletin)\s*-?\s*\d{4}\s*-\s*\d{1,3})\b/i,
  hours: /\b(\d+(?:[.,]\d+)?)\s*(?:h|horas)\b/i,
  date: /\b(\d{2}[/-]\d{2}[/-]\d{2,4})\b/,
  prefix: /\b((?:ps|pr|pt|pp)-[a-z]{3})\b/i,
  measurement: /\b(\d+(?:[.,]\d+)?\s*(?:mm|cm))\b/i,
  manual: /\b(?:manual|mm)\s*[:=-]?\s*([a-z0-9][a-z0-9.\-/]{3,24})\b/i,
  provider: /\b(?:oficina|fornecedor|empresa)\s*[:=-]?\s*([^,;]+)/i,
} as const

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
}

function matchHeader(line: string): HeaderRule | undefined {
  const normalized = normalize(line)
  if (normalized.length > 70 || /^[-*•\d]/.test(line.trim())) return undefined
  return HEADER_RULES.find((rule) => rule.pattern.test(normalized))
}

function extract(pattern: RegExp, value: string): [string | undefined, string] {
  const match = pattern.exec(value)
  if (!match) return [undefined, value]
  return [match[1] ?? match[0], value.replace(match[0], ' ')]
}

function parseStatus(category: ItemCategory, normalized: string): string | undefined {
  const done = /encerrad|concluid|finalizad|retornad|devolv|fechad|entregue/.test(normalized)
  const inProgress = /em\s+andamento|andamento|em\s+servico|em\s+servi[cç]o/.test(normalized)
  const waiting = /aguardando\s+pe[cç]a|aguardando\s+peca|falta\s+pe[cç]a/.test(normalized)

  switch (category) {
    case 'DISCREPANCY':
      if (done) return 'CLOSED'
      if (waiting) return 'WAITING_PART'
      if (inProgress) return 'IN_PROGRESS'
      return 'OPEN'
    case 'TASK':
      if (done) return 'DONE'
      if (inProgress) return 'IN_PROGRESS'
      return 'OPEN'
    case 'THIRD_PARTY':
      if (done) return 'RETURNED'
      if (/pront|retirada/.test(normalized)) return 'READY'
      if (inProgress) return 'IN_SERVICE'
      return 'SENT'
    default:
      return undefined
  }
}

function parsePriority(normalized: string): string | undefined {
  if (/urgent|cr[ií]tic|imediato/.test(normalized)) return 'CRITICAL'
  if (/\balta\b/.test(normalized)) return 'HIGH'
  if (/\bm[eé]dia\b/.test(normalized)) return 'MEDIUM'
  if (/\bbaixa\b/.test(normalized)) return 'LOW'
  return undefined
}

function parseDirection(normalized: string): LoanDirection | undefined {
  if (/aguardando\s+compra|comprar|aquisicao|aquisi[cç][aã]o/.test(normalized)) {
    return 'PURCHASE'
  }
  if (/recebid|canibalizad|retirad\s+de/.test(normalized)) return 'INBOUND'
  if (/emprestad|enviad|cedid|entregue\s+para/.test(normalized)) return 'OUTBOUND'
  return undefined
}

function cleanLine(value: string): string {
  return value
    .replace(/^\s*(?:[-*•+]|\d+[.)])\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildDraft(
  category: ItemCategory,
  rawLine: string,
  sourceLine: number,
): ParsedItemDraft {
  const normalized = normalize(rawLine)
  let rest = rawLine
  const [partNumber, withoutPart] = extract(PATTERNS.partNumber, rest)
  const [serialNumber, withoutSerial] = extract(PATTERNS.serialNumber, withoutPart)
  const [torqueValue, withoutTorque] = extract(PATTERNS.torque, withoutSerial)
  const [technicalRef, withoutTechnical] = extract(
    PATTERNS.technicalRef,
    withoutTorque,
  )
  const [measurement, withoutMeasurement] = extract(
    PATTERNS.measurement,
    withoutTechnical,
  )
  const [manualRef, withoutManual] = extract(PATTERNS.manual, withoutMeasurement)
  const [dateValue, withoutDate] = extract(PATTERNS.date, withoutManual)
  const [hoursValue, withoutHours] = extract(PATTERNS.hours, withoutDate)
  const [firstPrefix, withoutPrefix] = extract(PATTERNS.prefix, withoutHours)
  const [provider, withoutProvider] = extract(PATTERNS.provider, withoutPrefix)

  const returned = /devolv|retornad|concluid|encerrad/.test(normalized)
  const dueHours = hoursValue === undefined
    ? undefined
    : Number(hoursValue.replace(',', '.'))
  const dueDate = dateValue === undefined ? undefined : toIsoDate(dateValue)
  const direction = parseDirection(normalized)
  const triggerType: TorqueTriggerType | undefined =
    dueDate !== undefined ? 'DATE' : dueHours !== undefined ? 'HOURS' : undefined

  const title = withoutProvider
    .replace(/[;:,.-]+$/g, '')
    .replace(/^\s*[-:;]+/, '')
    .trim()
    .slice(0, 140)
  const fallbackTitle = cleanLine(rawLine).slice(0, 140)
  const finalTitle = title.length >= 3 ? title : fallbackTitle

  const draft: ParsedItemDraft = {
    category,
    title: finalTitle || 'Item sem descrição',
    notes: finalTitle !== cleanLine(rawLine) ? cleanLine(rawLine) : '',
    sourceLine,
    status: parseStatus(category, normalized),
    priority: parsePriority(normalized),
    measurement,
    manualRef,
    partNumber,
    serialNumber,
    direction,
    returned,
    provider,
    sentDate: dueDate,
    expectedReturnDate: dueDate,
    torqueValue,
    technicalRef,
    triggerType,
    dueHours,
    dueDate,
  }

  if (firstPrefix !== undefined) {
    if (category === 'LOAN_MATERIAL') {
      draft.relatedAircraftPrefix = firstPrefix.toUpperCase()
    } else {
      draft.aircraftPrefix = firstPrefix.toUpperCase()
    }
  }

  return draft
}

export function parseKeepNote(text: string): KeepParseResult {
  const lines = text.split(/\r?\n/)
  const items: ParsedItemDraft[] = []
  const unmatched: string[] = []
  let currentCategory: ItemCategory | undefined

  lines.forEach((line, index) => {
    const trimmed = line.trim()
    if (!trimmed || /^[-=_]{3,}$/.test(trimmed)) return

    const header = matchHeader(trimmed)
    if (header) {
      currentCategory = header.category
      const colonIndex = trimmed.indexOf(':')
      const inline = colonIndex >= 0 ? trimmed.slice(colonIndex + 1).trim() : ''
      if (inline.length > 2) {
        items.push(buildDraft(header.category, inline, index + 1))
      }
      return
    }

    const content = cleanLine(trimmed)
    if (!content) return
    if (!currentCategory) {
      unmatched.push(content)
      return
    }

    content
      .split(/\s*;\s*/)
      .map((part) => part.trim())
      .filter((part) => part.length > 1)
      .forEach((part) => {
        items.push(buildDraft(currentCategory as ItemCategory, part, index + 1))
      })
  })

  return { items, unmatched }
}

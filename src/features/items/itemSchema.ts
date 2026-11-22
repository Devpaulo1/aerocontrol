import { z } from 'zod'
import type {
  DiscrepancyStatus,
  ItemCategory,
  LoanDirection,
  MaintenanceItem,
  TaskPriority,
  TaskStatus,
  ThirdPartyStatus,
  TorqueTriggerType,
} from '../../types/maintenance'

const CATEGORY_VALUES = [
  'DISCREPANCY',
  'TASK',
  'LOAN_MATERIAL',
  'THIRD_PARTY',
  'TORQUE_CHECK',
] as const

const DISCREPANCY_STATUSES: DiscrepancyStatus[] = [
  'OPEN',
  'IN_PROGRESS',
  'WAITING_PART',
  'CLOSED',
]
const TASK_STATUSES: TaskStatus[] = ['OPEN', 'IN_PROGRESS', 'DONE']
const TASK_PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const LOAN_DIRECTIONS: LoanDirection[] = ['INBOUND', 'OUTBOUND', 'PURCHASE']
const THIRD_PARTY_STATUSES: ThirdPartyStatus[] = [
  'SENT',
  'IN_SERVICE',
  'READY',
  'RETURNED',
]
const TORQUE_TRIGGERS: TorqueTriggerType[] = ['HOURS', 'DATE']

export const itemFormSchema = z
  .object({
    category: z.enum(CATEGORY_VALUES),
    phaseId: z.string().min(1, 'Selecione a fase de manutenção.'),
    title: z.string().trim().min(3, 'Informe um título com ao menos 3 caracteres.'),
    notes: z.string(),
    status: z.string(),
    priority: z.string(),
    responsible: z.string(),
    measurement: z.string(),
    manualRef: z.string(),
    dueDate: z.string(),
    expectedReturnDate: z.string(),
    direction: z.string(),
    partNumber: z.string(),
    serialNumber: z.string(),
    relatedAircraftPrefix: z.string(),
    returned: z.boolean(),
    provider: z.string(),
    sentDate: z.string(),
    torqueValue: z.string(),
    technicalRef: z.string(),
    triggerType: z.string(),
    dueHours: z.string(),
    acknowledged: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const require = (field: keyof typeof values, message: string) => {
      if (!values[field]) {
        ctx.addIssue({ code: 'custom', path: [field], message })
      }
    }

    switch (values.category) {
      case 'DISCREPANCY':
        if (!DISCREPANCY_STATUSES.includes(values.status as DiscrepancyStatus)) {
          ctx.addIssue({
            code: 'custom',
            path: ['status'],
            message: 'Status de discrepância inválido.',
          })
        }
        require('manualRef', 'Informe a referência do manual.')
        break
      case 'TASK':
        if (!TASK_STATUSES.includes(values.status as TaskStatus)) {
          ctx.addIssue({
            code: 'custom',
            path: ['status'],
            message: 'Status de tarefa inválido.',
          })
        }
        if (!TASK_PRIORITIES.includes(values.priority as TaskPriority)) {
          ctx.addIssue({
            code: 'custom',
            path: ['priority'],
            message: 'Prioridade inválida.',
          })
        }
        require('responsible', 'Informe o responsável.')
        break
      case 'LOAN_MATERIAL':
        if (!LOAN_DIRECTIONS.includes(values.direction as LoanDirection)) {
          ctx.addIssue({
            code: 'custom',
            path: ['direction'],
            message: 'Direção do empréstimo inválida.',
          })
        }
        require('partNumber', 'Informe o part number.')
        if (
          values.direction !== 'PURCHASE' &&
          !values.relatedAircraftPrefix.trim()
        ) {
          ctx.addIssue({
            code: 'custom',
            path: ['relatedAircraftPrefix'],
            message: 'Informe a aeronave relacionada.',
          })
        }
        break
      case 'THIRD_PARTY':
        if (!THIRD_PARTY_STATUSES.includes(values.status as ThirdPartyStatus)) {
          ctx.addIssue({
            code: 'custom',
            path: ['status'],
            message: 'Status de terceiro inválido.',
          })
        }
        require('provider', 'Informe o fornecedor ou oficina.')
        require('sentDate', 'Informe a data de envio.')
        break
      case 'TORQUE_CHECK':
        if (!TORQUE_TRIGGERS.includes(values.triggerType as TorqueTriggerType)) {
          ctx.addIssue({
            code: 'custom',
            path: ['triggerType'],
            message: 'Gatilho de vencimento inválido.',
          })
        }
        require('torqueValue', 'Informe o valor de torque.')
        require('technicalRef', 'Informe a referência técnica.')
        if (values.triggerType === 'HOURS') {
          const hours = Number(values.dueHours.replace(',', '.'))
          if (!Number.isFinite(hours) || hours <= 0) {
            ctx.addIssue({
              code: 'custom',
              path: ['dueHours'],
              message: 'Informe as horas de vencimento.',
            })
          }
        } else {
          require('dueDate', 'Informe a data de vencimento.')
        }
        break
    }
  })

export type ItemFormValues = z.infer<typeof itemFormSchema>

export function emptyFormValues(
  category: ItemCategory,
  phaseId: string,
): ItemFormValues {
  const defaults: ItemFormValues = {
    category,
    phaseId,
    title: '',
    notes: '',
    status: 'OPEN',
    priority: 'MEDIUM',
    responsible: '',
    measurement: '',
    manualRef: '',
    dueDate: '',
    expectedReturnDate: '',
    direction: 'INBOUND',
    partNumber: '',
    serialNumber: '',
    relatedAircraftPrefix: '',
    returned: false,
    provider: '',
    sentDate: '',
    torqueValue: '',
    technicalRef: '',
    triggerType: 'HOURS',
    dueHours: '',
    acknowledged: false,
  }

  switch (category) {
    case 'DISCREPANCY':
      return { ...defaults, status: 'OPEN' }
    case 'TASK':
      return { ...defaults, status: 'OPEN', priority: 'MEDIUM' }
    case 'LOAN_MATERIAL':
      return { ...defaults, direction: 'INBOUND' }
    case 'THIRD_PARTY':
      return { ...defaults, status: 'SENT' }
    case 'TORQUE_CHECK':
      return { ...defaults, triggerType: 'HOURS' }
  }
}

export function formValuesFromItem(item: MaintenanceItem): ItemFormValues {
  const base: ItemFormValues = {
    ...emptyFormValues(item.category, item.phaseId),
    title: item.title,
    notes: item.notes ?? '',
  }

  switch (item.category) {
    case 'DISCREPANCY':
      return {
        ...base,
        status: item.status,
        measurement: item.measurement ?? '',
        manualRef: item.manualRef ?? '',
        dueDate: item.dueDate ?? '',
      }
    case 'TASK':
      return {
        ...base,
        status: item.status,
        priority: item.priority,
        responsible: item.responsible ?? '',
        dueDate: item.dueDate ?? '',
      }
    case 'LOAN_MATERIAL':
      return {
        ...base,
        direction: item.direction,
        partNumber: item.partNumber,
        serialNumber: item.serialNumber ?? '',
        relatedAircraftPrefix: item.relatedAircraftPrefix ?? '',
        expectedReturnDate: item.expectedReturnDate ?? '',
        returned: item.returned,
      }
    case 'THIRD_PARTY':
      return {
        ...base,
        provider: item.provider,
        sentDate: item.sentDate,
        expectedReturnDate: item.expectedReturnDate ?? '',
        status: item.status,
      }
    case 'TORQUE_CHECK':
      return {
        ...base,
        torqueValue: item.torqueValue,
        technicalRef: item.technicalRef ?? '',
        triggerType: item.triggerType,
        dueHours: item.dueHours !== undefined ? String(item.dueHours) : '',
        dueDate: item.dueDate ?? '',
        acknowledged: item.acknowledged,
      }
  }
}

export function itemFromFormValues(
  values: ItemFormValues,
  context: { id: string; aircraftId: string; createdAt: string },
): MaintenanceItem {
  const base = {
    id: context.id,
    aircraftId: context.aircraftId,
    phaseId: values.phaseId,
    title: values.title.trim(),
    notes: values.notes.trim() || undefined,
    createdAt: context.createdAt,
    updatedAt: new Date().toISOString(),
  }
  const dueDate = values.dueDate || undefined

  switch (values.category) {
    case 'DISCREPANCY':
      return {
        ...base,
        category: 'DISCREPANCY',
        status: values.status as DiscrepancyStatus,
        measurement: values.measurement.trim() || undefined,
        manualRef: values.manualRef.trim(),
        dueDate,
      }
    case 'TASK':
      return {
        ...base,
        category: 'TASK',
        status: values.status as TaskStatus,
        priority: values.priority as TaskPriority,
        responsible: values.responsible.trim(),
        dueDate,
      }
    case 'LOAN_MATERIAL':
      return {
        ...base,
        category: 'LOAN_MATERIAL',
        direction: values.direction as LoanDirection,
        partNumber: values.partNumber.trim(),
        serialNumber: values.serialNumber.trim() || undefined,
        relatedAircraftPrefix: values.relatedAircraftPrefix.trim() || undefined,
        expectedReturnDate: values.expectedReturnDate || undefined,
        returned: values.returned,
      }
    case 'THIRD_PARTY':
      return {
        ...base,
        category: 'THIRD_PARTY',
        provider: values.provider.trim(),
        sentDate: values.sentDate,
        expectedReturnDate: values.expectedReturnDate || undefined,
        status: values.status as ThirdPartyStatus,
      }
    case 'TORQUE_CHECK':
      return {
        ...base,
        category: 'TORQUE_CHECK',
        torqueValue: values.torqueValue.trim(),
        technicalRef: values.technicalRef.trim(),
        triggerType: values.triggerType as TorqueTriggerType,
        dueHours:
          values.triggerType === 'HOURS'
            ? Number(values.dueHours.replace(',', '.'))
            : undefined,
        dueDate: values.triggerType === 'DATE' ? dueDate : undefined,
        acknowledged: values.acknowledged,
      }
  }
}

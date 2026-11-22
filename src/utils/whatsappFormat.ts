import {
  type Aircraft,
  type ItemCategory,
  type MaintenanceItem,
  CATEGORY_LABELS,
} from '../types/maintenance'
import { formatDate } from './date'
import { isCompleted } from './maintenanceRules'

const CATEGORY_ORDER: ItemCategory[] = [
  'DISCREPANCY',
  'TASK',
  'LOAN_MATERIAL',
  'THIRD_PARTY',
  'TORQUE_CHECK',
]

function detailLines(item: MaintenanceItem): string[] {
  switch (item.category) {
    case 'DISCREPANCY':
      return [
        item.measurement ? `Medição: ${item.measurement}` : '',
        item.manualRef ? `Manual: ${item.manualRef}` : '',
      ].filter((line) => line.length > 0)
    case 'TASK':
      return [
        item.responsible ? `Responsável: ${item.responsible}` : '',
      ].filter((line) => line.length > 0)
    case 'LOAN_MATERIAL':
      return [
        `PN: ${item.partNumber}`,
        item.serialNumber ? `SN: ${item.serialNumber}` : '',
        item.relatedAircraftPrefix
          ? `Aeronave relacionada: ${item.relatedAircraftPrefix}`
          : '',
        item.expectedReturnDate
          ? `Previsão: ${formatDate(item.expectedReturnDate)}`
          : '',
      ].filter((line) => line.length > 0)
    case 'THIRD_PARTY':
      return [
        `Fornecedor: ${item.provider}`,
        `Envio: ${formatDate(item.sentDate)}`,
        item.expectedReturnDate
          ? `Previsão: ${formatDate(item.expectedReturnDate)}`
          : '',
      ].filter((line) => line.length > 0)
    case 'TORQUE_CHECK':
      return [
        `Torque: ${item.torqueValue}`,
        item.technicalRef ? `Referência: ${item.technicalRef}` : '',
        item.dueDate ? `Vencimento: ${formatDate(item.dueDate)}` : '',
        item.dueHours !== undefined ? `Vencimento: ${item.dueHours} h` : '',
      ].filter((line) => line.length > 0)
  }
}

export function formatWhatsAppSummary(
  aircraft: Aircraft,
  items: MaintenanceItem[],
): string {
  const openItems = items.filter((item) => !isCompleted(item))
  const lines: string[] = [
    `*AeroControl — ${aircraft.prefix}*`,
    `Modelo: ${aircraft.model} | TSN: ${aircraft.tsnHours.toLocaleString('pt-BR', {
      minimumFractionDigits: 1,
    })} h`,
    `Atualizado em ${formatDate(new Date().toISOString())}`,
    '',
    `*Resumo: ${openItems.length} item(ns) pendente(s) de ${items.length}*`,
  ]

  CATEGORY_ORDER.forEach((category) => {
    const categoryItems = openItems.filter((item) => item.category === category)
    if (categoryItems.length === 0) return
    lines.push('', `*${CATEGORY_LABELS[category]} (${categoryItems.length})*`)
    categoryItems.forEach((item) => {
      lines.push(`• ${item.title}`)
      detailLines(item).forEach((detail) => lines.push(`  ${detail}`))
      if (item.notes) lines.push(`  Obs.: ${item.notes}`)
    })
  })

  if (openItems.length === 0) {
    lines.push('', 'Nenhum item pendente para esta aeronave.')
  }

  return lines.join('\n')
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Fallback para navegadores sem permissão de Clipboard API.
  }

  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const copied = document.execCommand('copy')
    document.body.removeChild(textarea)
    return copied
  } catch {
    return false
  }
}

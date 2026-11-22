import type { MaintenanceItem, TorqueCheckItem } from '../types/maintenance'

export type TorqueUrgency = 'OK' | 'DUE' | 'OVERDUE'

export function isCompleted(item: MaintenanceItem): boolean {
  switch (item.category) {
    case 'DISCREPANCY':
      return item.status === 'CLOSED'
    case 'TASK':
      return item.status === 'DONE'
    case 'LOAN_MATERIAL':
      return item.returned
    case 'THIRD_PARTY':
      return item.status === 'RETURNED'
    case 'TORQUE_CHECK':
      return item.acknowledged
  }
}

export function getTorqueUrgency(
  item: TorqueCheckItem,
  tsnHours: number,
  now: Date = new Date(),
): TorqueUrgency {
  if (item.triggerType === 'HOURS') {
    if (item.dueHours === undefined) return 'OK'
    const remaining = item.dueHours - tsnHours
    if (remaining <= 0) return 'OVERDUE'
    if (remaining <= 10) return 'DUE'
    return 'OK'
  }

  if (!item.dueDate) return 'OK'
  const due = new Date(`${item.dueDate}T23:59:59`)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const days = Math.ceil((due.getTime() - today.getTime()) / 86_400_000)
  if (days < 0) return 'OVERDUE'
  if (days <= 7) return 'DUE'
  return 'OK'
}

export function isTorquePending(
  item: TorqueCheckItem,
  tsnHours: number,
  now: Date = new Date(),
): boolean {
  return !item.acknowledged && getTorqueUrgency(item, tsnHours, now) !== 'OK'
}

export function matchesSearch(item: MaintenanceItem, search: string): boolean {
  const term = search.trim().toLocaleLowerCase('pt-BR')
  if (!term) return true
  const fields: string[] = [item.title, item.notes ?? '']
  switch (item.category) {
    case 'DISCREPANCY':
      fields.push(item.manualRef ?? '', item.measurement ?? '', item.status)
      break
    case 'TASK':
      fields.push(item.responsible ?? '', item.priority, item.status)
      break
    case 'LOAN_MATERIAL':
      fields.push(
        item.partNumber,
        item.serialNumber ?? '',
        item.relatedAircraftPrefix ?? '',
        item.direction,
      )
      break
    case 'THIRD_PARTY':
      fields.push(item.provider, item.status)
      break
    case 'TORQUE_CHECK':
      fields.push(item.torqueValue, item.technicalRef ?? '')
      break
  }
  return fields.some((field) => field.toLocaleLowerCase('pt-BR').includes(term))
}

export function setItemCompleted(
  item: MaintenanceItem,
  completed: boolean,
): MaintenanceItem {
  const updatedAt = new Date().toISOString()
  switch (item.category) {
    case 'DISCREPANCY':
      return {
        ...item,
        status: completed ? 'CLOSED' : 'OPEN',
        updatedAt,
      }
    case 'TASK':
      return { ...item, status: completed ? 'DONE' : 'OPEN', updatedAt }
    case 'LOAN_MATERIAL':
      return { ...item, returned: completed, updatedAt }
    case 'THIRD_PARTY':
      return {
        ...item,
        status: completed ? 'RETURNED' : 'SENT',
        updatedAt,
      }
    case 'TORQUE_CHECK':
      return { ...item, acknowledged: completed, updatedAt }
  }
}

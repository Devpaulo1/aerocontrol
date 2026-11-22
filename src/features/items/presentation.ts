import {
  AlertTriangle,
  Building2,
  ClipboardList,
  Gauge,
  PackageOpen,
  type LucideIcon,
} from 'lucide-react'
import {
  CATEGORY_LABELS,
  DISCREPANCY_STATUS_LABELS,
  LOAN_DIRECTION_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  THIRD_PARTY_STATUS_LABELS,
  type ItemCategory,
  type MaintenanceItem,
} from '../../types/maintenance'
import { isCompleted } from '../../utils/maintenanceRules'

export const CATEGORY_ICONS: Record<ItemCategory, LucideIcon> = {
  DISCREPANCY: AlertTriangle,
  TASK: ClipboardList,
  LOAN_MATERIAL: PackageOpen,
  THIRD_PARTY: Building2,
  TORQUE_CHECK: Gauge,
}

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

export function statusLabel(item: MaintenanceItem): string {
  switch (item.category) {
    case 'DISCREPANCY':
      return DISCREPANCY_STATUS_LABELS[item.status]
    case 'TASK':
      return TASK_STATUS_LABELS[item.status]
    case 'LOAN_MATERIAL':
      return item.returned
        ? 'Devolvido'
        : LOAN_DIRECTION_LABELS[item.direction]
    case 'THIRD_PARTY':
      return THIRD_PARTY_STATUS_LABELS[item.status]
    case 'TORQUE_CHECK':
      return item.acknowledged ? 'Confirmado' : 'Pendente'
  }
}

export function statusTone(item: MaintenanceItem): Tone {
  if (isCompleted(item)) return 'success'
  switch (item.category) {
    case 'DISCREPANCY':
      return item.status === 'WAITING_PART' ? 'warning' : 'danger'
    case 'TASK':
      return item.priority === 'CRITICAL' ? 'danger' : 'info'
    case 'LOAN_MATERIAL':
      return 'info'
    case 'THIRD_PARTY':
      return 'info'
    case 'TORQUE_CHECK':
      return 'danger'
  }
}

export function categoryLabel(category: ItemCategory): string {
  return CATEGORY_LABELS[category]
}

export function priorityLabel(item: MaintenanceItem): string | undefined {
  return item.category === 'TASK' ? TASK_PRIORITY_LABELS[item.priority] : undefined
}

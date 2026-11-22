import type {
  DiscrepancyStatus,
  LoanDirection,
  MaintenanceItem,
  TaskPriority,
  TaskStatus,
  ThirdPartyStatus,
  TorqueTriggerType,
} from '../../types/maintenance'
import { todayIso } from '../../utils/date'
import type { ParsedItemDraft } from '../../utils/keepParser'

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

function pick<T extends string>(allowed: T[], value: string | undefined, fallback: T): T {
  return value && allowed.includes(value as T) ? (value as T) : fallback
}

export function draftToItem(
  draft: ParsedItemDraft,
  context: { aircraftId: string; phaseId: string; id: string; createdAt: string },
): MaintenanceItem {
  const base = {
    id: context.id,
    aircraftId: context.aircraftId,
    phaseId: context.phaseId,
    title: draft.title,
    notes: draft.notes || undefined,
    createdAt: context.createdAt,
    updatedAt: context.createdAt,
  }

  switch (draft.category) {
    case 'DISCREPANCY':
      return {
        ...base,
        category: 'DISCREPANCY',
        status: pick(DISCREPANCY_STATUSES, draft.status, 'OPEN'),
        measurement: draft.measurement,
        manualRef: draft.manualRef ?? 'Não informado',
        dueDate: draft.dueDate,
      }
    case 'TASK':
      return {
        ...base,
        category: 'TASK',
        status: pick(TASK_STATUSES, draft.status, 'OPEN'),
        priority: pick(TASK_PRIORITIES, draft.priority, 'MEDIUM'),
        responsible: 'A definir',
        dueDate: draft.dueDate,
      }
    case 'LOAN_MATERIAL':
      return {
        ...base,
        category: 'LOAN_MATERIAL',
        direction: pick(LOAN_DIRECTIONS, draft.direction, 'INBOUND'),
        partNumber: draft.partNumber ?? 'A IDENTIFICAR',
        serialNumber: draft.serialNumber,
        relatedAircraftPrefix: draft.relatedAircraftPrefix,
        expectedReturnDate: draft.expectedReturnDate,
        returned: draft.returned,
      }
    case 'THIRD_PARTY':
      return {
        ...base,
        category: 'THIRD_PARTY',
        provider: draft.provider ?? draft.title.slice(0, 48),
        sentDate: draft.sentDate ?? todayIso(),
        expectedReturnDate: draft.expectedReturnDate,
        status: pick(THIRD_PARTY_STATUSES, draft.status, 'SENT'),
      }
    case 'TORQUE_CHECK':
      return {
        ...base,
        category: 'TORQUE_CHECK',
        torqueValue: draft.torqueValue ?? 'A CONFERIR',
        technicalRef: draft.technicalRef ?? 'A IDENTIFICAR',
        triggerType: pick(
          TORQUE_TRIGGERS,
          draft.triggerType,
          draft.dueDate ? 'DATE' : 'HOURS',
        ),
        dueHours: draft.dueHours,
        dueDate: draft.dueDate,
        acknowledged: draft.returned,
      }
  }
}

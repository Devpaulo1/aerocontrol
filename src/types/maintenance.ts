export type AircraftStatus = 'ACTIVE' | 'INSPECTION' | 'AOG'

export interface Aircraft {
  id: string
  prefix: string
  model: string
  tsnHours: number
  status: AircraftStatus
}

export interface MaintenancePhase {
  id: string
  aircraftId: string
  name: string
  description?: string
  createdAt: string
}

export type DiscrepancyStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_PART' | 'CLOSED'
export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type LoanDirection = 'INBOUND' | 'OUTBOUND' | 'PURCHASE'
export type ThirdPartyStatus = 'SENT' | 'IN_SERVICE' | 'READY' | 'RETURNED'
export type TorqueTriggerType = 'HOURS' | 'DATE'

interface BaseItem {
  id: string
  aircraftId: string
  phaseId: string
  title: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface DiscrepancyItem extends BaseItem {
  category: 'DISCREPANCY'
  status: DiscrepancyStatus
  measurement?: string
  manualRef?: string
  dueDate?: string
}

export interface TaskItem extends BaseItem {
  category: 'TASK'
  status: TaskStatus
  priority: TaskPriority
  responsible?: string
  dueDate?: string
}

export interface LoanItem extends BaseItem {
  category: 'LOAN_MATERIAL'
  direction: LoanDirection
  partNumber: string
  serialNumber?: string
  relatedAircraftPrefix?: string
  expectedReturnDate?: string
  returned: boolean
}

export interface ThirdPartyItem extends BaseItem {
  category: 'THIRD_PARTY'
  provider: string
  sentDate: string
  expectedReturnDate?: string
  status: ThirdPartyStatus
}

export interface TorqueCheckItem extends BaseItem {
  category: 'TORQUE_CHECK'
  torqueValue: string
  technicalRef?: string
  triggerType: TorqueTriggerType
  dueHours?: number
  dueDate?: string
  acknowledged: boolean
}

export type MaintenanceItem =
  | DiscrepancyItem
  | TaskItem
  | LoanItem
  | ThirdPartyItem
  | TorqueCheckItem

export type ItemCategory = MaintenanceItem['category']

export const ITEM_CATEGORIES: readonly ItemCategory[] = [
  'DISCREPANCY',
  'TASK',
  'LOAN_MATERIAL',
  'THIRD_PARTY',
  'TORQUE_CHECK',
]

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  DISCREPANCY: 'Discrepância',
  TASK: 'A efetuar',
  LOAN_MATERIAL: 'Material / Empréstimo',
  THIRD_PARTY: 'Terceiros',
  TORQUE_CHECK: 'Torque / Atenção',
}

export const AIRCRAFT_STATUS_LABELS: Record<AircraftStatus, string> = {
  ACTIVE: 'Ativa',
  INSPECTION: 'Em inspeção',
  AOG: 'AOG',
}

export const DISCREPANCY_STATUS_LABELS: Record<DiscrepancyStatus, string> = {
  OPEN: 'Aberta',
  IN_PROGRESS: 'Em andamento',
  WAITING_PART: 'Aguardando peça',
  CLOSED: 'Encerrada',
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  OPEN: 'Aberta',
  IN_PROGRESS: 'Em andamento',
  DONE: 'Concluída',
}

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
}

export const LOAN_DIRECTION_LABELS: Record<LoanDirection, string> = {
  INBOUND: 'Recebido de outra aeronave',
  OUTBOUND: 'Emprestado para outra aeronave',
  PURCHASE: 'Aguardando compra',
}

export const THIRD_PARTY_STATUS_LABELS: Record<ThirdPartyStatus, string> = {
  SENT: 'Enviado',
  IN_SERVICE: 'Em serviço',
  READY: 'Pronto para retirada',
  RETURNED: 'Retornado',
}

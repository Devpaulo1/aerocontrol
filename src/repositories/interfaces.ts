import type { Aircraft, MaintenanceItem, MaintenancePhase } from '../types/maintenance'

export interface IAircraftRepository {
  list(): Promise<Aircraft[]>
  updateTsn(id: string, tsnHours: number): Promise<Aircraft>
}

export interface IPhaseRepository {
  list(): Promise<MaintenancePhase[]>
}

export interface IItemRepository {
  list(): Promise<MaintenanceItem[]>
  save(item: MaintenanceItem): Promise<MaintenanceItem>
  saveMany(items: MaintenanceItem[]): Promise<MaintenanceItem[]>
  remove(id: string): Promise<void>
}

import type { Aircraft, MaintenanceItem, MaintenancePhase } from '../types/maintenance'
import type {
  IAircraftRepository,
  IItemRepository,
  IPhaseRepository,
} from './interfaces'
import { seedAircrafts, seedItems, seedPhases } from './seed'

const STORAGE_KEYS = {
  aircrafts: 'aerocontrol.aircrafts.v1',
  phases: 'aerocontrol.phases.v1',
  items: 'aerocontrol.items.v1',
} as const

function loadCollection<T>(key: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) {
      localStorage.setItem(key, JSON.stringify(seed))
      return [...seed]
    }
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : [...seed]
  } catch {
    return [...seed]
  }
}

function persistCollection<T>(key: string, value: T[]): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export const aircraftRepository: IAircraftRepository = {
  async list() {
    return loadCollection<Aircraft>(STORAGE_KEYS.aircrafts, seedAircrafts)
  },

  async updateTsn(id, tsnHours) {
    const aircrafts = loadCollection<Aircraft>(STORAGE_KEYS.aircrafts, seedAircrafts)
    const index = aircrafts.findIndex((aircraft) => aircraft.id === id)
    if (index < 0) {
      throw new Error(`Aeronave não encontrada: ${id}`)
    }
    const updated: Aircraft = { ...aircrafts[index], tsnHours }
    const next = aircrafts.map((aircraft, position) =>
      position === index ? updated : aircraft,
    )
    persistCollection(STORAGE_KEYS.aircrafts, next)
    return updated
  },
}

export const phaseRepository: IPhaseRepository = {
  async list() {
    return loadCollection<MaintenancePhase>(STORAGE_KEYS.phases, seedPhases)
  },
}

export const itemRepository: IItemRepository = {
  async list() {
    return loadCollection<MaintenanceItem>(STORAGE_KEYS.items, seedItems)
  },

  async save(item) {
    const items = loadCollection<MaintenanceItem>(STORAGE_KEYS.items, seedItems)
    const index = items.findIndex((entry) => entry.id === item.id)
    const next = index < 0
      ? [...items, item]
      : items.map((entry, position) => (position === index ? item : entry))
    persistCollection(STORAGE_KEYS.items, next)
    return item
  },

  async saveMany(newItems) {
    const items = loadCollection<MaintenanceItem>(STORAGE_KEYS.items, seedItems)
    const byId = new Map(items.map((item) => [item.id, item]))
    newItems.forEach((item) => byId.set(item.id, item))
    const next = [...byId.values()]
    persistCollection(STORAGE_KEYS.items, next)
    return next
  },

  async remove(id) {
    const items = loadCollection<MaintenanceItem>(STORAGE_KEYS.items, seedItems)
    persistCollection(
      STORAGE_KEYS.items,
      items.filter((item) => item.id !== id),
    )
  },
}

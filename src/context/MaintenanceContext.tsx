import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  aircraftRepository,
  itemRepository,
  phaseRepository,
} from '../repositories/localStorageRepo'
import { MaintenanceContext } from './contextDefinition'
import type { Aircraft, MaintenanceItem, MaintenancePhase } from '../types/maintenance'
import {
  isCompleted,
  setItemCompleted,
} from '../utils/maintenanceRules'

export interface MaintenanceContextValue {
  aircrafts: Aircraft[]
  phases: MaintenancePhase[]
  items: MaintenanceItem[]
  activeAircraftId: string
  loading: boolean
  error: string | null
  setActiveAircraftId: (id: string) => void
  updateTsn: (id: string, tsnHours: number) => Promise<void>
  saveItem: (item: MaintenanceItem) => Promise<void>
  importItems: (items: MaintenanceItem[]) => Promise<void>
  removeItem: (id: string) => Promise<void>
  toggleItemCompletion: (item: MaintenanceItem) => Promise<void>
}

export function MaintenanceProvider({ children }: { children: ReactNode }) {
  const [aircrafts, setAircrafts] = useState<Aircraft[]>([])
  const [phases, setPhases] = useState<MaintenancePhase[]>([])
  const [items, setItems] = useState<MaintenanceItem[]>([])
  const [activeAircraftId, setActiveAircraftId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [loadedAircrafts, loadedPhases, loadedItems] = await Promise.all([
          aircraftRepository.list(),
          phaseRepository.list(),
          itemRepository.list(),
        ])
        if (cancelled) return
        setAircrafts(loadedAircrafts)
        setPhases(loadedPhases)
        setItems(loadedItems)
        setActiveAircraftId((current) => current || loadedAircrafts[0]?.id || '')
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Falha ao carregar dados.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const updateTsn = useCallback(async (id: string, tsnHours: number) => {
    const updated = await aircraftRepository.updateTsn(id, tsnHours)
    setAircrafts((current) =>
      current.map((aircraft) => (aircraft.id === id ? updated : aircraft)),
    )
  }, [])

  const saveItem = useCallback(async (item: MaintenanceItem) => {
    const saved = await itemRepository.save(item)
    setItems((current) => [...current.filter((entry) => entry.id !== saved.id), saved])
  }, [])

  const importItems = useCallback(async (newItems: MaintenanceItem[]) => {
    const saved = await itemRepository.saveMany(newItems)
    setItems(saved)
  }, [])

  const removeItem = useCallback(async (id: string) => {
    await itemRepository.remove(id)
    setItems((current) => current.filter((item) => item.id !== id))
  }, [])

  const toggleItemCompletion = useCallback(
    async (item: MaintenanceItem) => {
      await saveItem(setItemCompleted(item, !isCompleted(item)))
    },
    [saveItem],
  )

  const value = useMemo<MaintenanceContextValue>(
    () => ({
      aircrafts,
      phases,
      items,
      activeAircraftId,
      loading,
      error,
      setActiveAircraftId,
      updateTsn,
      saveItem,
      importItems,
      removeItem,
      toggleItemCompletion,
    }),
    [
      aircrafts,
      phases,
      items,
      activeAircraftId,
      loading,
      error,
      updateTsn,
      saveItem,
      importItems,
      removeItem,
      toggleItemCompletion,
    ],
  )

  return <MaintenanceContext.Provider value={value}>{children}</MaintenanceContext.Provider>
}

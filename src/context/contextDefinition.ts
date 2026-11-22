import { createContext } from 'react'
import type { MaintenanceContextValue } from './MaintenanceContext'

export const MaintenanceContext = createContext<MaintenanceContextValue | null>(null)

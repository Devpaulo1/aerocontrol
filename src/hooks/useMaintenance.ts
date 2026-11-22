import { useContext } from 'react'
import { MaintenanceContext } from '../context/contextDefinition'

export function useMaintenance() {
  const context = useContext(MaintenanceContext)
  if (!context) {
    throw new Error('useMaintenance deve ser usado dentro de MaintenanceProvider.')
  }
  return context
}

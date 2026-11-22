import type { ItemCategory, MaintenanceItem } from '../../types/maintenance'
import { isCompleted, matchesSearch } from '../../utils/maintenanceRules'

export type ItemTab = 'ALL' | ItemCategory | 'COMPLETED'

export const ITEM_TABS: { id: ItemTab; label: string }[] = [
  { id: 'ALL', label: 'Todos' },
  { id: 'DISCREPANCY', label: 'Discrepâncias' },
  { id: 'TASK', label: 'A efetuar' },
  { id: 'LOAN_MATERIAL', label: 'Materiais / Empréstimos' },
  { id: 'THIRD_PARTY', label: 'Terceiros' },
  { id: 'TORQUE_CHECK', label: 'Torque / Atenção' },
  { id: 'COMPLETED', label: 'Concluídos' },
]

export function filterItems(
  items: MaintenanceItem[],
  tab: ItemTab,
  search: string,
): MaintenanceItem[] {
  return items.filter((item) => {
    const matchesTab =
      tab === 'ALL'
        ? true
        : tab === 'COMPLETED'
          ? isCompleted(item)
          : item.category === tab
    return matchesTab && matchesSearch(item, search)
  })
}

export function countForTab(items: MaintenanceItem[], tab: ItemTab): number {
  if (tab === 'ALL') return items.length
  if (tab === 'COMPLETED') return items.filter(isCompleted).length
  return items.filter((item) => item.category === tab).length
}

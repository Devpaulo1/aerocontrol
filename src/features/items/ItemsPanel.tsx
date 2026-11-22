import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Tabs } from '../../components/ui/Tabs'
import { inputClass } from '../../components/ui/styles'
import type { MaintenanceItem, MaintenancePhase } from '../../types/maintenance'
import { ItemCard } from './ItemCard'
import { countForTab, filterItems, ITEM_TABS, type ItemTab } from './filters'

export function ItemsPanel({
  items,
  phases,
  tsnHours,
  activeTab,
  onTabChange,
  onNew,
  onEdit,
  onDelete,
  onToggleComplete,
}: {
  items: MaintenanceItem[]
  phases: MaintenancePhase[]
  tsnHours: number
  activeTab: ItemTab
  onTabChange: (tab: ItemTab) => void
  onNew: () => void
  onEdit: (item: MaintenanceItem) => void
  onDelete: (item: MaintenanceItem) => void
  onToggleComplete: (item: MaintenanceItem) => void
}) {
  const [search, setSearch] = useState('')
  const visibleItems = useMemo(
    () => filterItems(items, activeTab, search),
    [items, activeTab, search],
  )
  const phaseNames = useMemo(
    () => new Map(phases.map((phase) => [phase.id, phase.name])),
    [phases],
  )

  return (
    <section className="space-y-3" aria-label="Itens de manutenção">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por título, peça, manual, fornecedor..."
            aria-label="Buscar itens"
            className={`${inputClass} pl-10`}
          />
        </div>
        <Button variant="primary" onClick={onNew} className="hidden md:inline-flex">
          <Plus size={18} /> Novo item
        </Button>
      </div>

      <Tabs tabs={ITEM_TABS.map((tab) => ({ ...tab, count: countForTab(items, tab.id) }))} active={activeTab} onChange={onTabChange} />

      <p className="text-xs text-slate-500 dark:text-slate-400">
        {visibleItems.length} de {items.length} item(ns) exibido(s)
      </p>

      {visibleItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center dark:border-slate-700">
          <p className="font-semibold text-slate-700 dark:text-slate-200">
            Nenhum item encontrado
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Ajuste a busca ou cadastre um novo item de manutenção.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {visibleItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              phaseName={phaseNames.get(item.phaseId)}
              tsnHours={tsnHours}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleComplete={onToggleComplete}
            />
          ))}
        </div>
      )}
    </section>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FileInput, Plus } from 'lucide-react'
import { BottomNav } from './components/layout/BottomNav'
import { Header } from './components/layout/Header'
import { TorqueBanner } from './components/layout/TorqueBanner'
import { Button } from './components/ui/Button'
import { useMaintenance } from './hooks/useMaintenance'
import { ExportButton } from './features/exporter/ExportButton'
import { ImportModal } from './features/importer/ImportModal'
import { ItemFormModal } from './features/items/ItemFormModal'
import { ItemsPanel } from './features/items/ItemsPanel'
import { ITEM_TABS, type ItemTab } from './features/items/filters'
import { LoanCrossView } from './features/loans/LoanCrossView'
import type { LoanItem, MaintenanceItem, TorqueCheckItem } from './types/maintenance'
import { isTorquePending } from './utils/maintenanceRules'
import { copyToClipboard, formatWhatsAppSummary } from './utils/whatsappFormat'

function parseTab(value: string | null): ItemTab {
  return ITEM_TABS.some((tab) => tab.id === value) ? (value as ItemTab) : 'ALL'
}

export default function App() {
  const {
    aircrafts,
    phases,
    items,
    activeAircraftId,
    loading,
    error,
    setActiveAircraftId,
    updateTsn,
    removeItem,
    toggleItemCompletion,
  } = useMaintenance()

  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = parseTab(searchParams.get('tab'))
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MaintenanceItem | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    localStorage.getItem('aerocontrol.theme') === 'dark' ? 'dark' : 'light',
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('aerocontrol.theme', theme)
  }, [theme])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2500)
    return () => window.clearTimeout(timer)
  }, [toast])

  const changeTab = useCallback(
    (tab: ItemTab) => {
      setSearchParams(tab === 'ALL' ? {} : { tab }, { replace: true })
    },
    [setSearchParams],
  )

  const activeAircraft = aircrafts.find((aircraft) => aircraft.id === activeAircraftId)
  const tsnHours = activeAircraft?.tsnHours ?? 0

  const aircraftItems = useMemo(
    () => items.filter((item) => item.aircraftId === activeAircraftId),
    [items, activeAircraftId],
  )

  const pendingTorques = useMemo(
    () =>
      aircraftItems.filter(
        (item): item is TorqueCheckItem =>
          item.category === 'TORQUE_CHECK' && isTorquePending(item, tsnHours),
      ),
    [aircraftItems, tsnHours],
  )

  const loans = useMemo(
    () =>
      items.filter((item): item is LoanItem => item.category === 'LOAN_MATERIAL'),
    [items],
  )

  const openNew = useCallback(() => {
    setEditingItem(null)
    setFormOpen(true)
  }, [])

  const openEdit = useCallback((item: MaintenanceItem) => {
    setEditingItem(item)
    setFormOpen(true)
  }, [])

  const handleDelete = useCallback(
    (item: MaintenanceItem) => {
      if (window.confirm(`Excluir o item "${item.title}"?`)) {
        void removeItem(item.id)
      }
    },
    [removeItem],
  )

  const handleExport = useCallback(async () => {
    if (!activeAircraft) return
    const copied = await copyToClipboard(
      formatWhatsAppSummary(activeAircraft, aircraftItems),
    )
    setToast(copied ? 'Resumo copiado para a área de transferência.' : 'Não foi possível copiar o resumo.')
  }, [activeAircraft, aircraftItems])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm font-semibold text-slate-500 dark:text-slate-400">
        Carregando dados de manutenção...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header
        key={activeAircraft?.id ?? 'sem-aeronave'}
        aircrafts={aircrafts}
        activeAircraft={activeAircraft}
        theme={theme}
        onSelectAircraft={setActiveAircraftId}
        onUpdateTsn={(hours) => {
          if (activeAircraft) void updateTsn(activeAircraft.id, hours)
        }}
        onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
      />

      <TorqueBanner
        items={pendingTorques}
        tsnHours={tsnHours}
        onView={() => changeTab('TORQUE_CHECK')}
      />

      <main className="mx-auto max-w-5xl space-y-5 px-4 pb-28 pt-5 md:pb-10">
        <div className="hidden items-center justify-between gap-2 md:flex">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              {activeAircraft?.prefix ?? '—'} · Painel de manutenção
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {activeAircraft?.model ?? ''} · {aircraftItems.length} item(ns) nesta fase
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" onClick={openNew}>
              <Plus size={17} /> Novo item
            </Button>
            <Button onClick={() => setImportOpen(true)}>
              <FileInput size={17} /> Importar nota
            </Button>
            <ExportButton aircraft={activeAircraft} items={aircraftItems} />
          </div>
        </div>

        {error ? (
          <div className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
            {error}
          </div>
        ) : null}

        {activeTab === 'LOAN_MATERIAL' ? (
          <LoanCrossView loans={loans} aircrafts={aircrafts} />
        ) : null}

        <ItemsPanel
          items={aircraftItems}
          phases={phases.filter((phase) => phase.aircraftId === activeAircraftId)}
          tsnHours={tsnHours}
          activeTab={activeTab}
          onTabChange={changeTab}
          onNew={openNew}
          onEdit={openEdit}
          onDelete={handleDelete}
          onToggleComplete={(item) => void toggleItemCompletion(item)}
        />
      </main>

      <BottomNav
        onHome={() => changeTab('ALL')}
        onNew={openNew}
        onImport={() => setImportOpen(true)}
        onExport={() => void handleExport()}
      />

      {toast ? (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg dark:bg-slate-100 dark:text-slate-900 md:bottom-6"
        >
          {toast}
        </div>
      ) : null}

      <ItemFormModal
        key={`${formOpen}-${editingItem?.id ?? 'new'}`}
        open={formOpen}
        item={editingItem}
        aircraftId={activeAircraftId}
        phases={phases.filter((phase) => phase.aircraftId === activeAircraftId)}
        onClose={() => setFormOpen(false)}
      />

      <ImportModal
        open={importOpen}
        aircraftId={activeAircraftId}
        phases={phases.filter((phase) => phase.aircraftId === activeAircraftId)}
        onClose={() => setImportOpen(false)}
      />
    </div>
  )
}

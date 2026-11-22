import { AlertTriangle, ArrowRight } from 'lucide-react'
import type { TorqueCheckItem } from '../../types/maintenance'
import { getTorqueUrgency } from '../../utils/maintenanceRules'

export function TorqueBanner({
  items,
  tsnHours,
  onView,
}: {
  items: TorqueCheckItem[]
  tsnHours: number
  onView: () => void
}) {
  if (items.length === 0) return null
  const overdue = items.some(
    (item) => getTorqueUrgency(item, tsnHours) === 'OVERDUE',
  )

  return (
    <div
      role="alert"
      className={`sticky top-0 z-40 border-b ${
        overdue
          ? 'border-red-800 bg-red-700 text-white dark:bg-red-950'
          : 'border-amber-700 bg-amber-500 text-amber-950 dark:bg-amber-900 dark:text-amber-50'
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5">
        <AlertTriangle size={20} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">
            {overdue ? 'Check de torque vencido' : 'Check de torque próximo do vencimento'}
          </p>
          <p className="truncate text-xs opacity-90">
            {items.length} item(ns) pendente(s): {items.map((item) => item.title).join(' · ')}
          </p>
        </div>
        <button
          type="button"
          onClick={onView}
          className="flex min-h-11 items-center gap-1 rounded-lg px-3 text-sm font-bold underline-offset-2 hover:underline"
        >
          Ver <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

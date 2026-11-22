import { Check, CheckCircle2, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { cardClass } from '../../components/ui/styles'
import type { MaintenanceItem } from '../../types/maintenance'
import { formatDate } from '../../utils/date'
import { getTorqueUrgency, isCompleted } from '../../utils/maintenanceRules'
import {
  CATEGORY_ICONS,
  categoryLabel,
  priorityLabel,
  statusLabel,
  statusTone,
} from './presentation'

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
      <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
        {value}
      </span>
    </div>
  )
}

function itemDetails(item: MaintenanceItem): { label: string; value: string }[] {
  switch (item.category) {
    case 'DISCREPANCY':
      return [
        ...(item.measurement ? [{ label: 'Medição', value: item.measurement }] : []),
        ...(item.manualRef ? [{ label: 'Manual', value: item.manualRef }] : []),
        ...(item.dueDate
          ? [{ label: 'Prazo', value: formatDate(item.dueDate) }]
          : []),
      ]
    case 'TASK':
      return [
        ...(priorityLabel(item)
          ? [{ label: 'Prioridade', value: priorityLabel(item) as string }]
          : []),
        ...(item.responsible
          ? [{ label: 'Responsável', value: item.responsible }]
          : []),
        ...(item.dueDate
          ? [{ label: 'Prazo', value: formatDate(item.dueDate) }]
          : []),
      ]
    case 'LOAN_MATERIAL':
      return [
        { label: 'P/N', value: item.partNumber },
        ...(item.serialNumber
          ? [{ label: 'S/N', value: item.serialNumber }]
          : []),
        ...(item.relatedAircraftPrefix
          ? [{ label: 'Aeronave', value: item.relatedAircraftPrefix }]
          : []),
        ...(item.expectedReturnDate
          ? [{ label: 'Previsão', value: formatDate(item.expectedReturnDate) }]
          : []),
      ]
    case 'THIRD_PARTY':
      return [
        { label: 'Fornecedor', value: item.provider },
        { label: 'Envio', value: formatDate(item.sentDate) },
        ...(item.expectedReturnDate
          ? [{ label: 'Previsão', value: formatDate(item.expectedReturnDate) }]
          : []),
      ]
    case 'TORQUE_CHECK':
      return [
        { label: 'Torque', value: item.torqueValue },
        ...(item.technicalRef
          ? [{ label: 'Referência', value: item.technicalRef }]
          : []),
        ...(item.dueDate
          ? [{ label: 'Vencimento', value: formatDate(item.dueDate) }]
          : []),
        ...(item.dueHours !== undefined
          ? [{ label: 'Vencimento', value: `${item.dueHours} h` }]
          : []),
      ]
  }
}

export function ItemCard({
  item,
  phaseName,
  tsnHours,
  onEdit,
  onDelete,
  onToggleComplete,
}: {
  item: MaintenanceItem
  phaseName?: string
  tsnHours: number
  onEdit: (item: MaintenanceItem) => void
  onDelete: (item: MaintenanceItem) => void
  onToggleComplete: (item: MaintenanceItem) => void
}) {
  const Icon = CATEGORY_ICONS[item.category]
  const done = isCompleted(item)
  const urgency =
    item.category === 'TORQUE_CHECK' && !item.acknowledged
      ? getTorqueUrgency(item, tsnHours)
      : undefined
  const details = itemDetails(item)

  return (
    <article className={`${cardClass} p-4 ${done ? 'opacity-70' : ''}`}>
      <div className="flex items-start gap-3">
        <span
          className={`flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg ${
            done
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
          }`}
        >
          <Icon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge tone="info">{categoryLabel(item.category)}</Badge>
            <Badge tone={statusTone(item)}>{statusLabel(item)}</Badge>
            {urgency && urgency !== 'OK' ? (
              <Badge tone={urgency === 'OVERDUE' ? 'danger' : 'warning'}>
                {urgency === 'OVERDUE' ? 'Vencido' : 'Próximo'}
              </Badge>
            ) : null}
            {phaseName ? (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {phaseName}
              </span>
            ) : null}
          </div>
          <h3
            className={`text-sm font-bold leading-snug text-slate-900 dark:text-white ${
              done ? 'line-through' : ''
            }`}
          >
            {item.title}
          </h3>
          {item.notes ? (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {item.notes}
            </p>
          ) : null}
          {details.length > 0 ? (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {details.map((detail, index) => (
                <Detail key={`${detail.label}-${index}`} {...detail} />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        <button
          type="button"
          onClick={() => onToggleComplete(item)}
          aria-label={done ? 'Reabrir item' : 'Concluir item'}
          title={done ? 'Reabrir item' : 'Concluir item'}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
        >
          {done ? <CheckCircle2 size={18} /> : <Check size={18} />}
        </button>
        <button
          type="button"
          onClick={() => onEdit(item)}
          aria-label="Editar item"
          title="Editar item"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <Pencil size={18} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(item)}
          aria-label="Excluir item"
          title="Excluir item"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </article>
  )
}

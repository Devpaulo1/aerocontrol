import { useState, type FormEvent } from 'react'
import { Check, Moon, Pencil, Plane, Sun, X } from 'lucide-react'
import { inputClass } from '../ui/styles'
import { AIRCRAFT_STATUS_LABELS, type Aircraft } from '../../types/maintenance'

export function Header({
  aircrafts,
  activeAircraft,
  theme,
  onSelectAircraft,
  onUpdateTsn,
  onToggleTheme,
}: {
  aircrafts: Aircraft[]
  activeAircraft: Aircraft | undefined
  theme: 'light' | 'dark'
  onSelectAircraft: (id: string) => void
  onUpdateTsn: (tsnHours: number) => void
  onToggleTheme: () => void
}) {
  const [editingTsn, setEditingTsn] = useState(false)
  const [tsnInput, setTsnInput] = useState(
    activeAircraft ? String(activeAircraft.tsnHours) : '',
  )

  function saveTsn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = Number(tsnInput.replace(',', '.'))
    if (!Number.isFinite(value) || value < 0) return
    onUpdateTsn(Math.round(value * 10) / 10)
    setEditingTsn(false)
  }

  return (
    <header className="border-b border-slate-200 bg-white/95 dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950">
            <Plane size={22} />
          </div>
          <div>
            <h1 className="text-lg font-black leading-tight tracking-tight text-slate-900 dark:text-white">
              AeroControl
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manutenção de aeronaves
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Selecionar aeronave"
            className={`${inputClass} sm:w-52`}
            value={activeAircraft?.id ?? ''}
            onChange={(event) => onSelectAircraft(event.target.value)}
          >
            {aircrafts.map((aircraft) => (
              <option key={aircraft.id} value={aircraft.id}>
                {aircraft.prefix}
              </option>
            ))}
          </select>

          <div className="flex min-h-11 items-center gap-2 rounded-lg bg-slate-100 px-3 dark:bg-slate-800">
            {editingTsn ? (
              <form onSubmit={saveTsn} className="flex items-center gap-1">
                <input
                  aria-label="Horas de voo (TSN)"
                  type="number"
                  step="0.1"
                  min="0"
                  autoFocus
                  className="w-24 bg-transparent text-sm font-bold text-slate-900 outline-none dark:text-white"
                  value={tsnInput}
                  onChange={(event) => setTsnInput(event.target.value)}
                />
                <button
                  type="submit"
                  aria-label="Salvar horas de voo"
                  className="flex min-h-11 min-w-9 items-center justify-center text-emerald-600 dark:text-emerald-400"
                >
                  <Check size={18} />
                </button>
                <button
                  type="button"
                  aria-label="Cancelar edição"
                  onClick={() => setEditingTsn(false)}
                  className="flex min-h-11 min-w-9 items-center justify-center text-slate-500 dark:text-slate-400"
                >
                  <X size={18} />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setEditingTsn(true)}
                className="flex min-h-11 items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100"
                title="Editar horas de voo"
              >
                <span>
                  TSN {activeAircraft?.tsnHours.toLocaleString('pt-BR', {
                    minimumFractionDigits: 1,
                  }) ?? '—'} h
                </span>
                <Pencil size={14} className="text-slate-500 dark:text-slate-400" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      {activeAircraft ? (
        <div className="mx-auto flex max-w-5xl flex-wrap gap-2 px-4 pb-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {activeAircraft.model}
          </span>
          <span>•</span>
          <span>
            {AIRCRAFT_STATUS_LABELS[activeAircraft.status]}
          </span>
        </div>
      ) : null}
    </header>
  )
}

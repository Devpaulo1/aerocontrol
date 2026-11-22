export interface TabOption<T extends string> {
  id: T
  label: string
  count?: number
}

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: TabOption<T>[]
  active: T
  onChange: (id: T) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Filtros de itens"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 py-2 sm:mx-0 sm:px-0"
    >
      {tabs.map((tab) => {
        const selected = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold transition ${
              selected
                ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 ? (
              <span
                className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${
                  selected
                    ? 'bg-white/20 dark:bg-slate-950/20'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

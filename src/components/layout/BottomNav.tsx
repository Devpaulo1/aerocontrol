import { ClipboardList, FileInput, Plus, Share2 } from 'lucide-react'

export function BottomNav({
  onHome,
  onNew,
  onImport,
  onExport,
}: {
  onHome: () => void
  onNew: () => void
  onImport: () => void
  onExport: () => void
}) {
  const actions = [
    { label: 'Todos', icon: ClipboardList, onClick: onHome },
    { label: 'Novo', icon: Plus, onClick: onNew, primary: true },
    { label: 'Importar', icon: FileInput, onClick: onImport },
    { label: 'Exportar', icon: Share2, onClick: onExport },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 md:hidden">
      <div className="mx-auto flex max-w-5xl">
        {actions.map(({ label, icon: Icon, onClick, primary }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${
              primary
                ? 'text-sky-600 dark:text-sky-400'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <span
              className={`flex min-h-9 min-w-9 items-center justify-center rounded-lg ${
                primary ? 'bg-sky-100 dark:bg-sky-950' : ''
              }`}
            >
              <Icon size={20} />
            </span>
            {label}
          </button>
        ))}
      </div>
    </nav>
  )
}

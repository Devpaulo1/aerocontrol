import type { ReactNode } from 'react'

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

const TONE_CLASSES: Record<Tone, string> = {
  neutral:
    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  info: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  success:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  warning:
    'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300',
  danger: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
}

export function Badge({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

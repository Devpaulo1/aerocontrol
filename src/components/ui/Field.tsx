import type { ReactNode } from 'react'
import { labelClass } from './styles'

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
      {hint && !error ? (
        <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="mt-1 block text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </span>
      ) : null}
    </label>
  )
}

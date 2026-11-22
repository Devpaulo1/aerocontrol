import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-sky-600 text-white hover:bg-sky-700 disabled:bg-sky-300 dark:bg-sky-500 dark:hover:bg-sky-400 dark:disabled:bg-sky-900',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
  danger:
    'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400',
  ghost:
    'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const sizeClass = size === 'sm' ? 'min-h-9 px-3 text-xs' : 'min-h-11 px-4 text-sm'
  return (
    <button
      type={type}
      className={`inline-flex min-w-11 items-center justify-center gap-2 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${sizeClass} ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  )
}

export function formatDate(value?: string): string {
  if (!value) return '—'
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('pt-BR')
}

export function toIsoDate(value: string): string | undefined {
  const match = /^(\d{2})[/-](\d{2})[/-](\d{2}|\d{4})$/.exec(value.trim())
  if (!match) return undefined
  const day = Number(match[1])
  const month = Number(match[2])
  const rawYear = Number(match[3])
  const year = rawYear < 100 ? 2000 + rawYear : rawYear
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined
  return `${year.toString().padStart(4, '0')}-${month
    .toString()
    .padStart(2, '0')}-${day.toString().padStart(2, '0')}`
}

export function todayIso(): string {
  const now = new Date()
  const year = now.getFullYear().toString().padStart(4, '0')
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

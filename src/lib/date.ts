// Always use these utils — never new Date('YYYY-MM-DD') (parses as UTC, off-by-one on iOS)

export function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function localToday(): string {
  const d = new Date()
  return formatDate(d)
}

export function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatDisplay(dateStr: string): string {
  const d = parseLocalDate(dateStr)
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function daysUntil(dateStr: string): number {
  const today = parseLocalDate(localToday())
  const target = parseLocalDate(dateStr)
  const ms = target.getTime() - today.getTime()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

export function isPast(dateStr: string): boolean {
  return daysUntil(dateStr) < 0
}

import { addDays, startOfWeek } from 'date-fns'
import { formatDate, parseLocalDate } from './date'

export const GYM_WEEKLY_ITEMS = [
  { id: 'lower_a', title: 'Glutes + legs A' },
  { id: 'lower_b', title: 'Glutes + legs B' },
  { id: 'lower_c', title: 'Glutes + legs C' },
  { id: 'upper_a', title: 'Back + shoulders A', walk: true },
  { id: 'upper_b', title: 'Back + shoulders B', walk: true },
  { id: 'pilates_a', title: 'Pilates A', walk: true },
  { id: 'pilates_b', title: 'Pilates B', walk: true },
] as const

export type GymWeeklyItemId = typeof GYM_WEEKLY_ITEMS[number]['id'] | 'walking'

export function isGymWeeklyItemId(value: unknown): value is GymWeeklyItemId {
  return value === 'walking' || GYM_WEEKLY_ITEMS.some(item => item.id === value)
}

export function parseGymWeeklyItems(value: unknown): GymWeeklyItemId[] {
  return Array.isArray(value) ? [...new Set(value.filter(isGymWeeklyItemId))] : []
}

export function gymWeekStart(date: string): string {
  return formatDate(startOfWeek(parseLocalDate(date), { weekStartsOn: 1 }))
}

export function gymWeekDates(date: string): string[] {
  const start = parseLocalDate(gymWeekStart(date))
  return Array.from({ length: 7 }, (_, index) => formatDate(addDays(start, index)))
}

export interface GymWeeklyMetrics {
  bodyFatPct: number
  musclePct: number
}

export function isGymWeeklyMetrics(value: unknown): value is GymWeeklyMetrics {
  if (!value || typeof value !== 'object') return false
  const record = value as Partial<GymWeeklyMetrics>
  return [record.bodyFatPct, record.musclePct].every(number =>
    typeof number === 'number' && Number.isFinite(number) && number > 0 && number < 100 && Math.abs(number * 100 - Math.round(number * 100)) < 1e-7
  )
}

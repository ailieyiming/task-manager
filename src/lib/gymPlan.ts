import { addDays, startOfWeek } from 'date-fns'
import { formatDate, parseLocalDate } from './date'

export const GYM_WEEKLY_ITEMS = [
  { id: 'lower_a', title: 'Glutes + legs A', hint: 'Squat or leg press · hip thrust' },
  { id: 'lower_b', title: 'Glutes + legs B', hint: 'Romanian deadlift · step-up' },
  { id: 'lower_c', title: 'Glutes + legs C', hint: 'Glute bridge · lunge or leg press' },
  { id: 'upper_a', title: 'Back + shoulders A', hint: 'Row · pulldown · shoulder press' },
  { id: 'upper_b', title: 'Back + shoulders B', hint: 'Row · pulldown · lateral raise' },
  { id: 'pilates_a', title: 'Pilates or mobility', hint: 'Class or light movement' },
  { id: 'pilates_b', title: 'Pilates or mobility', hint: 'Class or light movement' },
  { id: 'walking', title: 'Walking', hint: 'Build toward 10,000 steps on most days' },
] as const

export type GymWeeklyItemId = typeof GYM_WEEKLY_ITEMS[number]['id']

export function isGymWeeklyItemId(value: unknown): value is GymWeeklyItemId {
  return GYM_WEEKLY_ITEMS.some(item => item.id === value)
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

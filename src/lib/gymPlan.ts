import { addDays, differenceInCalendarDays, startOfWeek } from 'date-fns'
import { formatDate, parseLocalDate } from './date'

export const GYM_WEEKLY_ITEMS = [
  { id: 'lower_a', title: 'Glutes + legs A' },
  { id: 'lower_b', title: 'Glutes + legs B' },
  { id: 'lower_c', title: 'Glutes + legs C' },
  { id: 'upper_a', title: 'Back + shoulders A' },
  { id: 'upper_b', title: 'Back + shoulders B' },
] as const

export type GymWeeklyItemId = typeof GYM_WEEKLY_ITEMS[number]['id'] | 'pilates_a' | 'pilates_b' | 'walking'

export function isGymWeeklyItemId(value: unknown): value is GymWeeklyItemId {
  return value === 'walking' || value === 'pilates_a' || value === 'pilates_b' || GYM_WEEKLY_ITEMS.some(item => item.id === value)
}

export function parseGymWeeklyItems(value: unknown): GymWeeklyItemId[] {
  return Array.isArray(value) ? [...new Set(value.filter(isGymWeeklyItemId))] : []
}

export const GYM_CYCLE_ONE = {
  start: '2026-11-23',
  end: '2027-01-17',
  review: '2027-01-18',
  lowerWarmup: ['5 min brisk walk or bike', 'Bodyweight glute bridge · 1 × 12', 'Bodyweight hip hinge · 1 × 10'],
  lowerLifts: [
    'Hip thrust · 3 × 10–12',
    'Dumbbell RDL · 3 × 10–12',
    'Hip abduction · 3 × 12–15',
    'Seated leg curl · 2 × 12–15',
  ],
  upperWarmup: ['5 min elliptical or brisk walk', 'Chin tuck · 1 × 10', 'Light band pull-apart · 1 × 12'],
  upperLifts: [
    'Seated cable row · 3 × 10–12',
    'Lat pulldown · 3 × 10–12',
    'Reverse pec deck · 3 × 12–15',
    'Face pull · 2 × 12–15',
  ],
  core: ['Dead bug · 2 × 8/side', 'Side plank · 2 × 20 sec/side', 'Pallof press · 2 × 10/side'],
  upperCore: ['Dead bug · 1 × 8/side', 'Side plank · 1 × 20 sec/side', 'Pallof press · 1 × 10/side'],
} as const

export function gymCycleOneWeek(date: string): number | null {
  if (date < GYM_CYCLE_ONE.start || date > GYM_CYCLE_ONE.end) return null
  return Math.floor(differenceInCalendarDays(parseLocalDate(date), parseLocalDate(GYM_CYCLE_ONE.start)) / 7) + 1
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

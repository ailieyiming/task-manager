import { addDays, differenceInCalendarDays, startOfWeek } from 'date-fns'
import { formatDate, parseLocalDate } from './date'

export const GYM_WEEKLY_ITEMS = [
  { id: 'lower_a', title: 'Glutes + legs A' },
  { id: 'lower_b', title: 'Glutes + legs B' },
  { id: 'lower_c', title: 'Glutes + legs C' },
  { id: 'upper_a', title: 'Back + shoulders A' },
  { id: 'upper_b', title: 'Back + shoulders B' },
  { id: 'pilates_a', title: 'Pilates' },
  { id: 'cardio', title: 'Cardio' },
] as const

export const GYM_WEEKLY_GOAL = 4

export type GymWeeklyItemId = typeof GYM_WEEKLY_ITEMS[number]['id'] | 'pilates_b' | 'walking'

export function isGymWeeklyItemId(value: unknown): value is GymWeeklyItemId {
  return value === 'walking' || value === 'pilates_b' || GYM_WEEKLY_ITEMS.some(item => item.id === value)
}

export function parseGymWeeklyItems(value: unknown): GymWeeklyItemId[] {
  return Array.isArray(value) ? [...new Set(value.filter(isGymWeeklyItemId))] : []
}

export const GYM_CYCLE_ONE = {
  start: '2026-11-23',
  end: '2027-01-17',
  review: '2027-01-18',
  warmup: ['吊环 · 1分45秒', '拉伸肩胛骨 · 15下', '乌龙盘棍 · 15下', '侧拉腰 · 两边各10下'],
  lowerLifts: [
    'Hip thrust · 3 × 10–12',
    'Dumbbell RDL · 3 × 10–12',
    'Seated leg press · 2 × 10–12',
    'Hip abduction · 3 × 12–15',
    'Seated leg curl · 2 × 12–15',
    'Glute press · 2 × 10–12/side',
  ],
  upperLifts: [
    'Seated cable row · 3 × 10–12',
    'Lat pulldown · 3 × 10–12',
    'Reverse pec deck · 3 × 12–15',
    'Lateral shoulder raise · 2 × 12–15',
    'Face pull · 2 × 12–15',
    'Tricep pushdown · 2 × 10–12',
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

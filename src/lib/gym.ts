import { differenceInCalendarDays } from 'date-fns'
import { formatDate, localToday, parseLocalDate } from './date'

export const GYM_START = '2026-10-05'
export const GYM_END = '2027-10-04'
export const GYM_TOTAL_DAYS = differenceInCalendarDays(parseLocalDate(GYM_END), parseLocalDate(GYM_START)) + 1

export type GymStatus = 'full' | 'relax' | 'missed'
export type GymCheckIns = Record<string, GymStatus>

export function isGymStatus(value: unknown): value is GymStatus {
  return value === 'full' || value === 'relax' || value === 'missed'
}

export function isGymDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    formatDate(parseLocalDate(date)) === date && date >= GYM_START && date <= GYM_END
}

export function canCheckIn(date: string, today = localToday()): boolean {
  return isGymDate(date) && date <= today
}

export function gymYearStats(checkIns: GymCheckIns, today = localToday()) {
  const elapsed = Math.max(0, Math.min(GYM_TOTAL_DAYS,
    differenceInCalendarDays(parseLocalDate(today), parseLocalDate(GYM_START)) + 1))
  const counts = { full: 0, relax: 0, missed: 0 }
  for (const [date, status] of Object.entries(checkIns)) {
    if (canCheckIn(date, today) && isGymStatus(status)) counts[status] += 1
  }
  const recorded = counts.full + counts.relax + counts.missed
  return {
    ...counts,
    elapsed,
    recorded,
    unrecorded: Math.max(0, elapsed - recorded),
    total: GYM_TOTAL_DAYS,
    finished: today > GYM_END,
  }
}

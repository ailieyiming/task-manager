import { differenceInCalendarDays, subDays } from 'date-fns'
import { formatDate, localToday, parseLocalDate } from './date'

export const GYM_START = '2026-10-05'
export const GYM_END = '2027-10-04'
export const GYM_TOTAL_DAYS = differenceInCalendarDays(parseLocalDate(GYM_END), parseLocalDate(GYM_START)) + 1

export type GymStatus = 'full' | 'relax' | 'missed'
export type GymCheckIns = Record<string, GymStatus>
export interface GymExercise {
  id: string
  name: string
  sets?: number
  reps?: number
  weightKg?: number
  note?: string
}
export type GymWorkouts = Record<string, GymExercise[]>
export interface GymDayRecord {
  status: GymStatus
  exercises: GymExercise[]
}

export function isGymExercise(value: unknown): value is GymExercise {
  if (!value || typeof value !== 'object') return false
  const exercise = value as Partial<GymExercise>
  return typeof exercise.id === 'string' && exercise.id.length > 0 && exercise.id.length <= 50 &&
    typeof exercise.name === 'string' && exercise.name.trim().length > 0 && exercise.name.length <= 100 &&
    (exercise.sets === undefined || (Number.isInteger(exercise.sets) && exercise.sets >= 1 && exercise.sets <= 1000)) &&
    (exercise.reps === undefined || (Number.isInteger(exercise.reps) && exercise.reps >= 1 && exercise.reps <= 1000)) &&
    (exercise.weightKg === undefined || (typeof exercise.weightKg === 'number' && Number.isFinite(exercise.weightKg) && exercise.weightKg >= 0 && exercise.weightKg <= 10000 && Math.abs(exercise.weightKg * 100 - Math.round(exercise.weightKg * 100)) < 1e-8)) &&
    (exercise.note === undefined || (typeof exercise.note === 'string' && exercise.note.length <= 500))
}

export function parseGymExercises(value: unknown): GymExercise[] {
  return Array.isArray(value) ? value.filter(isGymExercise) : []
}

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

export function gymCurrentStreak(checkIns: GymCheckIns, today = localToday()): number {
  if (!isGymDate(today)) return 0
  const attended = (date: string) => checkIns[date] === 'full' || checkIns[date] === 'relax'
  let date = today
  if (!attended(date)) {
    if (checkIns[date] === 'missed') return 0
    date = formatDate(subDays(parseLocalDate(date), 1))
  }
  let streak = 0
  while (date >= GYM_START && attended(date)) {
    streak += 1
    date = formatDate(subDays(parseLocalDate(date), 1))
  }
  return streak
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
    attended: counts.full + counts.relax,
    elapsed,
    recorded,
    unrecorded: Math.max(0, elapsed - recorded),
    total: GYM_TOTAL_DAYS,
    finished: today > GYM_END,
  }
}

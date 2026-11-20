import { addDays, startOfWeek } from 'date-fns'
import { formatDate, parseLocalDate } from './date'

export interface GymPlanDay {
  name: string
  focus: string
  details: string
  kind: 'strength' | 'class' | 'recovery'
}

export const GYM_PLAN: GymPlanDay[] = [
  { name: 'Mon', focus: 'Glutes + legs A', details: 'Squat or leg press, hip thrust, split squat, core. Start with 2–3 sets of 8–12 reps.', kind: 'strength' },
  { name: 'Tue', focus: 'Back + arms A', details: 'Row, lat pulldown, chest press, biceps and triceps. Start with 2–3 sets of 8–12 reps.', kind: 'strength' },
  { name: 'Wed', focus: 'Pilates + walk', details: 'Pilates class or mobility. Walk at a comfortable pace.', kind: 'class' },
  { name: 'Thu', focus: 'Glutes + legs B', details: 'Romanian deadlift, step-up, glute bridge, core. Start with 2–3 sets of 8–12 reps.', kind: 'strength' },
  { name: 'Fri', focus: 'Back + arms B', details: 'Seated row, pulldown, shoulder press, arm work. Start with 2–3 sets of 8–12 reps.', kind: 'strength' },
  { name: 'Sat', focus: 'Pilates + easy movement', details: 'Pilates class, light full-body movement, or a long easy walk.', kind: 'class' },
  { name: 'Sun', focus: 'Recovery', details: 'Rest, stretch, or take an easy walk. No hard workout needed.', kind: 'recovery' },
]

export function gymWeekStart(date: string): string {
  return formatDate(startOfWeek(parseLocalDate(date), { weekStartsOn: 1 }))
}

export function gymWeekDates(date: string): string[] {
  const start = parseLocalDate(gymWeekStart(date))
  return Array.from({ length: 7 }, (_, index) => formatDate(addDays(start, index)))
}

export function gymPlanForDate(date: string): GymPlanDay {
  return GYM_PLAN[(parseLocalDate(date).getDay() + 6) % 7]
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

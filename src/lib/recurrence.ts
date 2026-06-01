import { addDays, addWeeks, addMonths, differenceInDays, format } from 'date-fns'
import type { Task, TaskOverride, RepeatRule } from '../store/types'
import { parseLocalDate } from './date'

// O(1) check — no iteration over all dates
export function isTaskDueToday(task: Task, overrides: TaskOverride[], today: string): boolean {
  const override = overrides.find(o => o.taskId === task.id && o.date === today)
  if (override?.skipped) return false

  if (!task.repeat) return task.baseDate === today

  const { stopDate } = task.repeat
  if (stopDate && today > stopDate) return false

  const base = parseLocalDate(task.baseDate)
  const target = parseLocalDate(today)
  const daysDiff = differenceInDays(target, base)
  if (daysDiff < 0) return false

  return isOccurrence(task.repeat, base, target, daysDiff)
}

function isOccurrence(rule: RepeatRule, base: Date, target: Date, daysDiff: number): boolean {
  switch (rule.freq) {
    case 'daily':
    case 'custom':
      return daysDiff % rule.interval === 0
    case 'weekly':
      return daysDiff % (rule.interval * 7) === 0
    case 'monthly': {
      // Use date-fns addMonths to handle month-end correctly (Jan 31 → Feb 28)
      const monthsDiff = Math.round(daysDiff / 30)
      if (monthsDiff % rule.interval !== 0) return false
      const occurrence = addMonths(base, monthsDiff)
      return format(occurrence, 'yyyy-MM-dd') === format(target, 'yyyy-MM-dd')
    }
  }
}

export function isCompleted(task: Task, overrides: TaskOverride[], today: string): boolean {
  const override = overrides.find(o => o.taskId === task.id && o.date === today)
  if (override?.completedOverride !== undefined) return override.completedOverride
  return task.completedDates.includes(today)
}

// Cap completedDates to last 90 entries to prevent unbounded growth
export function capCompletedDates(dates: string[]): string[] {
  if (dates.length <= 90) return dates
  return dates.sort().slice(-90)
}

// All tasks due today (one-time + recurring)
export function getTasksDueToday(tasks: Task[], overrides: TaskOverride[], today: string): Task[] {
  return tasks.filter(t => isTaskDueToday(t, overrides, today))
}

// Returns false if a one-time completed task is older than 9 days (should be hidden)
export function isVisible(task: Task, today: string): boolean {
  if (task.repeat) return true           // recurring tasks always visible
  if (task.completedDates.length === 0) return true  // not completed
  const latest = task.completedDates.slice().sort().at(-1)!
  const [cy, cm, cd] = latest.split('-').map(Number)
  const [ty, tm, td] = today.split('-').map(Number)
  const completedMs = new Date(cy, cm - 1, cd).getTime()
  const todayMs = new Date(ty, tm - 1, td).getTime()
  return (todayMs - completedMs) / 86_400_000 <= 2
}

export { addDays, addWeeks, addMonths }

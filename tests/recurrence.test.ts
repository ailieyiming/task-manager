import { describe, expect, it } from 'bun:test'
import { formatRepeatRule, isTaskDueToday } from '../src/lib/recurrence'
import type { Task } from '../src/store/types'

const task = (baseDate: string, repeat: NonNullable<Task['repeat']>): Task => ({
  id: 'repeat-test', title: 'Repeat test', baseDate, repeat, completedDates: [],
})

describe('custom repeat intervals', () => {
  it('repeats every two days', () => {
    const item = task('2026-01-01', { freq: 'custom', interval: 2, unit: 'days' })
    expect(isTaskDueToday(item, [], '2026-01-03')).toBe(true)
    expect(isTaskDueToday(item, [], '2026-01-04')).toBe(false)
  })

  it('repeats every two weeks', () => {
    const item = task('2026-01-01', { freq: 'custom', interval: 2, unit: 'weeks' })
    expect(isTaskDueToday(item, [], '2026-01-15')).toBe(true)
    expect(isTaskDueToday(item, [], '2026-01-08')).toBe(false)
  })

  it('repeats every two months and clamps month-end dates', () => {
    const item = task('2026-01-31', { freq: 'custom', interval: 2, unit: 'months' })
    expect(isTaskDueToday(item, [], '2026-03-31')).toBe(true)
    expect(isTaskDueToday(item, [], '2026-02-28')).toBe(false)
    const monthly = task('2026-01-31', { freq: 'custom', interval: 1, unit: 'months' })
    expect(isTaskDueToday(monthly, [], '2026-02-28')).toBe(true)
    expect(isTaskDueToday(monthly, [], '2026-02-27')).toBe(false)
  })

  it('keeps old custom tasks on a day interval', () => {
    const rule = { freq: 'custom' as const, interval: 3 }
    expect(isTaskDueToday(task('2026-01-01', rule), [], '2026-01-04')).toBe(true)
    expect(formatRepeatRule(rule)).toBe('Every 3 days')
  })

  it('shows the selected interval in the task list', () => {
    expect(formatRepeatRule({ freq: 'custom', interval: 2, unit: 'weeks' })).toBe('Every 2 weeks')
    expect(formatRepeatRule({ freq: 'custom', interval: 1, unit: 'months' })).toBe('Every 1 month')
  })
})

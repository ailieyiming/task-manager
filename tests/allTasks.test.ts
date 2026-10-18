import { describe, expect, it } from 'bun:test'
import { isShownInAllTasks } from '../src/lib/recurrence'
import type { Task } from '../src/store/types'

const makeTask = (baseDate: string, repeat?: Task['repeat']): Task => ({
  id: 'test', title: 'Test task', baseDate, repeat, completedDates: [],
})

describe('All Tasks date filter', () => {
  const today = '2026-10-18'

  it('hides past one-time tasks without deleting them from Today', () => {
    expect(isShownInAllTasks(makeTask('2026-10-17'), today)).toBe(false)
    expect(isShownInAllTasks(makeTask(today), today)).toBe(true)
    expect(isShownInAllTasks(makeTask('2026-10-19'), today)).toBe(true)
  })

  it('keeps past recurring tasks in All Tasks', () => {
    expect(isShownInAllTasks(makeTask('2026-10-01', { freq: 'daily', interval: 1 }), today)).toBe(true)
  })
})

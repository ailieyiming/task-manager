import { describe, expect, it } from 'bun:test'
import { hasRecords, normalizeAppData, stableStringify, type AppData } from '../src/lib/cloudData'

const empty: AppData = {
  tasks: [], overrides: [], orderedTaskIds: [], cumulativeCompleted: {},
  targets: [], orderedTargetIds: [], keptIds: [], rejectedIds: [], decidedOn: null,
  gymCheckIns: {},
}

describe('cloud data migration', () => {
  it('ignores jsonb object key order but preserves array order', () => {
    expect(stableStringify({ a: 1, b: { x: 2, y: 3 } }))
      .toBe(stableStringify({ b: { y: 3, x: 2 }, a: 1 }))
    expect(stableStringify([1, 2])).not.toBe(stableStringify([2, 1]))
  })

  it('recognizes all types of existing local data', () => {
    expect(hasRecords(empty)).toBe(false)
    expect(hasRecords({ ...empty, cumulativeCompleted: { _standalone: 1 } })).toBe(true)
    expect(hasRecords({ ...empty, keptIds: [12] })).toBe(true)
    expect(hasRecords({ ...empty, tasks: [{ id: 't', title: 'Task', baseDate: '2026-09-28', completedDates: [] }] })).toBe(true)
    expect(hasRecords({ ...empty, gymCheckIns: { '2026-10-05': 'full' } })).toBe(true)
  })

  it('preserves older cloud snapshots while adding empty gym records', () => {
    const olderSnapshot = { ...empty }
    Reflect.deleteProperty(olderSnapshot, 'gymCheckIns')
    expect(normalizeAppData(olderSnapshot)).toEqual(empty)
  })
})

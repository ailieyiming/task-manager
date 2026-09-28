import { describe, expect, it } from 'bun:test'
import { canCheckIn, GYM_TOTAL_DAYS, gymYearStats } from '../src/lib/gym'

describe('gym year', () => {
  it('covers exactly one year from 5 Oct 2026 through 4 Oct 2027', () => {
    expect(GYM_TOTAL_DAYS).toBe(365)
    expect(canCheckIn('2026-10-04', '2026-10-10')).toBe(false)
    expect(canCheckIn('2026-10-05', '2026-10-05')).toBe(true)
    expect(canCheckIn('2027-10-04', '2027-10-04')).toBe(true)
    expect(canCheckIn('2027-10-05', '2027-10-05')).toBe(false)
    expect(canCheckIn('2026-10-06', '2026-10-05')).toBe(false)
    expect(canCheckIn('2026-11-31', '2026-12-01')).toBe(false)
  })

  it('keeps unrecorded days separate from did not go', () => {
    const stats = gymYearStats({ '2026-10-05': 'full', '2026-10-06': 'relax', '2026-10-07': 'missed' }, '2026-10-09')
    expect(stats.full).toBe(1)
    expect(stats.relax).toBe(1)
    expect(stats.missed).toBe(1)
    expect(stats.unrecorded).toBe(2)
    expect(stats.elapsed).toBe(5)
    expect(stats.finished).toBe(false)
  })

  it('shows a final tally after the year ends', () => {
    const stats = gymYearStats({ '2026-10-05': 'full', '2027-10-04': 'missed' }, '2027-10-05')
    expect(stats.total).toBe(365)
    expect(stats.elapsed).toBe(365)
    expect(stats.full).toBe(1)
    expect(stats.missed).toBe(1)
    expect(stats.unrecorded).toBe(363)
    expect(stats.finished).toBe(true)
  })
})

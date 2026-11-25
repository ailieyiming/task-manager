import { describe, expect, it } from 'bun:test'
import { GYM_CYCLE_ONE, GYM_WEEKLY_GOAL, GYM_WEEKLY_ITEMS, gymCycleOneWeek, parseGymWeeklyItems } from '../src/lib/gymPlan'

describe('first eight-week gym cycle', () => {
  it('covers eight complete weeks', () => {
    expect(gymCycleOneWeek('2026-11-22')).toBeNull()
    expect(gymCycleOneWeek('2026-11-23')).toBe(1)
    expect(gymCycleOneWeek('2026-11-29')).toBe(1)
    expect(gymCycleOneWeek('2026-11-30')).toBe(2)
    expect(gymCycleOneWeek('2027-01-17')).toBe(8)
    expect(gymCycleOneWeek('2027-01-18')).toBeNull()
  })

  it('has three lower-body, two upper-body, and one Pilates entry with a four-item goal', () => {
    expect(GYM_WEEKLY_ITEMS.map(item => item.id)).toEqual(['lower_a', 'lower_b', 'lower_c', 'upper_a', 'upper_b', 'pilates_a'])
    expect(GYM_WEEKLY_GOAL).toBe(4)
    expect(GYM_CYCLE_ONE.lowerLifts).toHaveLength(4)
    expect(GYM_CYCLE_ONE.upperLifts).toHaveLength(4)
    expect(GYM_CYCLE_ONE.core).toHaveLength(3)
    expect(GYM_CYCLE_ONE.warmup).toEqual(['吊环 · 1分45秒', '拉伸肩胛骨 · 15下', '乌龙盘棍 · 15下', '侧拉腰 · 两边各10下'])
  })

  it('keeps older Pilates checklist records readable', () => {
    expect(parseGymWeeklyItems(['pilates_a', 'pilates_b', 'walking', 'lower_a'])).toEqual(['pilates_a', 'pilates_b', 'walking', 'lower_a'])
  })
})

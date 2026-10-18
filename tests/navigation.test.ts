import { describe, expect, it } from 'bun:test'
import { useAppStore } from '../src/store/app'

describe('cloud back navigation', () => {
  it('returns to Gym when cloud was opened from Gym', () => {
    const { setTab } = useAppStore.getState()
    setTab('gym')
    setTab('cloud')
    expect(useAppStore.getState().returnTab).toBe('gym')
    setTab(useAppStore.getState().returnTab)
    expect(useAppStore.getState().activeTab).toBe('gym')
    setTab('tasks')
  })
})

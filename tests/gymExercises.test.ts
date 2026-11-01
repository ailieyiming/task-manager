import { describe, expect, mock, test } from 'bun:test'
import { isGymExercise, parseGymExercises, type GymExercise } from '../src/lib/gym'

let cachedGymState: string | null = null
mock.module('idb-keyval', () => ({
  get: async () => cachedGymState,
  set: async (_name: string, value: string) => { cachedGymState = value },
  del: async () => { cachedGymState = null },
}))
const { useGymStore } = await import('../src/store/gym')

const day = '2026-10-15'
const squat: GymExercise = { id: 'squat', name: 'Squat', sets: 3, reps: 8, weightKg: 40, note: 'Felt strong' }

describe('gym exercise records', () => {
  test('accepts structured lifting data and ignores invalid cloud entries', () => {
    expect(isGymExercise(squat)).toBe(true)
    expect(isGymExercise({ ...squat, weightKg: 1.25 })).toBe(true)
    expect(isGymExercise({ ...squat, weightKg: 1.234 })).toBe(false)
    expect(parseGymExercises(null)).toEqual([])
    expect(parseGymExercises([squat, { id: 'bad', name: 'Squat', reps: -1 }])).toEqual([squat])
  })

  test('saves and edits exercises on attended days only', () => {
    useGymStore.setState({ checkIns: { [day]: 'full' }, workouts: {}, pending: {} })
    useGymStore.getState().saveExercise(day, squat)
    expect(useGymStore.getState().workouts[day]).toEqual([squat])
    expect(useGymStore.getState().pending[day]).toEqual({ status: 'full', exercises: [squat] })

    const edited = { ...squat, reps: 10 }
    useGymStore.getState().saveExercise(day, edited)
    expect(useGymStore.getState().workouts[day]).toEqual([edited])

    useGymStore.getState().setCheckIn(day, 'missed')
    expect(useGymStore.getState().workouts[day]).toBeUndefined()
    useGymStore.getState().saveExercise(day, squat)
    expect(useGymStore.getState().workouts[day]).toBeUndefined()
  })

  test('saves multiple exercises on one day and loads them from cloud', () => {
    const second = { ...squat, id: 'press', name: 'Press', weightKg: 1.25 }
    useGymStore.setState({ checkIns: { [day]: 'full' }, workouts: {}, pending: {} })
    useGymStore.getState().saveExercise(day, squat)
    useGymStore.getState().saveExercise(day, second)
    expect(useGymStore.getState().workouts[day]).toEqual([squat, second])
    expect(useGymStore.getState().pending[day]).toEqual({ status: 'full', exercises: [squat, second] })

    useGymStore.setState({ checkIns: {}, workouts: {}, pending: {} })
    useGymStore.getState().applyRemote({ checkIns: { [day]: 'full' }, workouts: { [day]: parseGymExercises([squat, second]) } })
    expect(useGymStore.getState().workouts[day]).toEqual([squat, second])
  })

  test('merges cloud records without losing an offline edit', () => {
    useGymStore.setState({ checkIns: { [day]: 'relax' }, workouts: { [day]: [squat] }, pending: { [day]: { status: 'relax', exercises: [squat] } } })
    useGymStore.getState().applyRemote({ checkIns: { [day]: 'full' }, workouts: {} })
    expect(useGymStore.getState().checkIns[day]).toBe('relax')
    expect(useGymStore.getState().workouts[day]).toEqual([squat])

    useGymStore.getState().deleteExercise(day, squat.id)
    expect(useGymStore.getState().workouts[day]).toEqual([])
    expect(useGymStore.getState().pending[day]).toEqual({ status: 'relax', exercises: [] })
  })

  test('loads cloud exercise records and queues an older local check-in', () => {
    useGymStore.setState({ checkIns: {}, workouts: {}, pending: {} })
    useGymStore.getState().applyRemote({ checkIns: { [day]: 'full' }, workouts: { [day]: [squat] } })
    expect(useGymStore.getState().workouts[day]).toEqual([squat])

    useGymStore.setState({ checkIns: { [day]: 'full' }, workouts: {}, pending: {} })
    useGymStore.getState().queueLocalOnly({ checkIns: {}, workouts: {} })
    expect(useGymStore.getState().pending[day]).toEqual({ status: 'full', exercises: [] })
  })

  test('loads a saved check-in from before exercise logs existed', async () => {
    cachedGymState = JSON.stringify({ state: { checkIns: { [day]: 'full' }, pending: { [day]: 'full' } }, version: 0 })
    await useGymStore.persist.rehydrate()
    expect(useGymStore.getState().checkIns[day]).toBe('full')
    expect(useGymStore.getState().workouts).toEqual({})
    expect(useGymStore.getState().pending[day]).toEqual({ status: 'full', exercises: [] })
  })
})

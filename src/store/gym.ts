import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval'
import { canCheckIn, isGymExercise, isGymStatus, parseGymExercises, type GymCheckIns, type GymDayRecord, type GymExercise, type GymStatus, type GymWorkouts } from '../lib/gym'

interface GymState {
  checkIns: GymCheckIns
  workouts: GymWorkouts
  pending: Record<string, GymDayRecord | null>
  hasHydrated: boolean
  syncMode: 'connecting' | 'synced' | 'offline'
  setCheckIn: (date: string, status: GymStatus) => void
  clearCheckIn: (date: string) => void
  saveExercise: (date: string, exercise: GymExercise) => void
  deleteExercise: (date: string, id: string) => void
  queueLocalOnly: (remote: { checkIns: GymCheckIns; workouts: GymWorkouts }) => void
  applyRemote: (remote: { checkIns: GymCheckIns; workouts: GymWorkouts }) => void
  clearPending: (date: string, value: GymDayRecord | null) => void
  setSyncMode: (mode: GymState['syncMode']) => void
  setHydrated: () => void
}

const idbStorage = {
  getItem: async (name: string) => (await idbGet(name)) ?? null,
  setItem: async (name: string, value: string) => idbSet(name, value),
  removeItem: async (name: string) => idbDel(name),
}

export const useGymStore = create<GymState>()(
  persist(
    (set) => ({
      checkIns: {},
      workouts: {},
      pending: {},
      hasHydrated: false,
      syncMode: 'connecting',
      setCheckIn: (date, status) => {
        if (!canCheckIn(date) || !isGymStatus(status)) return
        set((state) => {
          const workouts = { ...state.workouts }
          if (status === 'missed') delete workouts[date]
          const exercises = status === 'missed' ? [] : workouts[date] ?? []
          return {
            checkIns: { ...state.checkIns, [date]: status },
            workouts,
            pending: { ...state.pending, [date]: { status, exercises } },
          }
        })
      },
      clearCheckIn: (date) => {
        if (!canCheckIn(date)) return
        set((state) => {
          const checkIns = { ...state.checkIns }
          const workouts = { ...state.workouts }
          delete checkIns[date]
          delete workouts[date]
          return { checkIns, workouts, pending: { ...state.pending, [date]: null } }
        })
      },
      saveExercise: (date, exercise) => {
        if (!canCheckIn(date) || !isGymExercise(exercise)) return
        set((state) => {
          const status = state.checkIns[date]
          if (status !== 'full' && status !== 'relax') return state
          const existing = state.workouts[date] ?? []
          const exercises = existing.some(item => item.id === exercise.id)
            ? existing.map(item => item.id === exercise.id ? exercise : item)
            : [...existing, exercise]
          return {
            workouts: { ...state.workouts, [date]: exercises },
            pending: { ...state.pending, [date]: { status, exercises } },
          }
        })
      },
      deleteExercise: (date, id) => {
        if (!canCheckIn(date)) return
        set((state) => {
          const status = state.checkIns[date]
          const existing = state.workouts[date] ?? []
          if ((status !== 'full' && status !== 'relax') || !existing.some(item => item.id === id)) return state
          const exercises = existing.filter(item => item.id !== id)
          return {
            workouts: { ...state.workouts, [date]: exercises },
            pending: { ...state.pending, [date]: { status, exercises } },
          }
        })
      },
      queueLocalOnly: (remote) => set((state) => {
        const pending = { ...state.pending }
        for (const [date, status] of Object.entries(state.checkIns)) {
          const exercises = state.workouts[date] ?? []
          const missingDay = !(date in remote.checkIns)
          const missingExercises = exercises.length > 0 && (remote.workouts[date]?.length ?? 0) === 0
          if ((missingDay || missingExercises) && !(date in pending) && canCheckIn(date)) {
            pending[date] = { status, exercises }
          }
        }
        return { pending }
      }),
      applyRemote: (remote) => set((state) => {
        const checkIns = { ...remote.checkIns }
        const workouts = { ...remote.workouts }
        for (const [date, record] of Object.entries(state.pending)) {
          if (record === null) {
            delete checkIns[date]
            delete workouts[date]
          } else {
            checkIns[date] = record.status
            if (record.exercises.length) workouts[date] = record.exercises
            else delete workouts[date]
          }
        }
        return { checkIns, workouts }
      }),
      clearPending: (date, value) => set((state) => {
        if (state.pending[date] !== value || !(date in state.pending)) return state
        const pending = { ...state.pending }
        delete pending[date]
        return { pending }
      }),
      setSyncMode: (syncMode) => set({ syncMode }),
      setHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: 'task-manager-gym',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ checkIns: state.checkIns, workouts: state.workouts, pending: state.pending }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<GymState> & { pending?: Record<string, GymStatus | GymDayRecord | null> }
        const checkIns = saved.checkIns ?? {}
        const workouts = Object.fromEntries(Object.entries(saved.workouts ?? {}).map(([date, exercises]) => [date, parseGymExercises(exercises)]))
        const pending: GymState['pending'] = {}
        for (const [date, value] of Object.entries(saved.pending ?? {})) {
          if (value === null) pending[date] = null
          else if (typeof value === 'string' && isGymStatus(value)) pending[date] = { status: value, exercises: workouts[date] ?? [] }
          else if (value && typeof value === 'object' && isGymStatus(value.status)) pending[date] = { status: value.status, exercises: parseGymExercises(value.exercises) }
        }
        return { ...current, checkIns, workouts, pending }
      },
      onRehydrateStorage: () => (state) => { state?.setHydrated() },
    }
  )
)

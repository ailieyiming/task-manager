import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval'
import { canCheckIn, isGymStatus, type GymCheckIns, type GymStatus } from '../lib/gym'

interface GymState {
  checkIns: GymCheckIns
  pending: Record<string, GymStatus | null>
  hasHydrated: boolean
  syncMode: 'connecting' | 'synced' | 'offline'
  setCheckIn: (date: string, status: GymStatus) => void
  clearCheckIn: (date: string) => void
  queueLocalOnly: (remote: GymCheckIns) => void
  applyRemote: (remote: GymCheckIns) => void
  clearPending: (date: string, value: GymStatus | null) => void
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
      pending: {},
      hasHydrated: false,
      syncMode: 'connecting',
      setCheckIn: (date, status) => {
        if (!canCheckIn(date) || !isGymStatus(status)) return
        set((state) => ({
          checkIns: { ...state.checkIns, [date]: status },
          pending: { ...state.pending, [date]: status },
        }))
      },
      clearCheckIn: (date) => {
        if (!canCheckIn(date)) return
        set((state) => {
          const checkIns = { ...state.checkIns }
          delete checkIns[date]
          return { checkIns, pending: { ...state.pending, [date]: null } }
        })
      },
      queueLocalOnly: (remote) => set((state) => {
        const pending = { ...state.pending }
        for (const [date, status] of Object.entries(state.checkIns)) {
          if (!(date in remote) && !(date in pending) && canCheckIn(date)) pending[date] = status
        }
        return { pending }
      }),
      applyRemote: (remote) => set((state) => {
        const checkIns = { ...remote }
        for (const [date, status] of Object.entries(state.pending)) {
          if (status === null) delete checkIns[date]
          else checkIns[date] = status
        }
        return { checkIns }
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
      partialize: (state) => ({ checkIns: state.checkIns, pending: state.pending }),
      merge: (persisted, current) => ({ ...current, ...(persisted as Partial<GymState>), pending: (persisted as Partial<GymState>)?.pending ?? {} }),
      onRehydrateStorage: () => (state) => { state?.setHydrated() },
    }
  )
)

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval'
import { canCheckIn, isGymStatus, type GymCheckIns, type GymStatus } from '../lib/gym'

interface GymState {
  checkIns: GymCheckIns
  hasHydrated: boolean
  setCheckIn: (date: string, status: GymStatus) => void
  clearCheckIn: (date: string) => void
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
      hasHydrated: false,
      setCheckIn: (date, status) => {
        if (!canCheckIn(date) || !isGymStatus(status)) return
        set((state) => ({ checkIns: { ...state.checkIns, [date]: status } }))
      },
      clearCheckIn: (date) => {
        if (!canCheckIn(date)) return
        set((state) => {
          const checkIns = { ...state.checkIns }
          delete checkIns[date]
          return { checkIns }
        })
      },
      setHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: 'task-manager-gym',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ checkIns: state.checkIns }),
      onRehydrateStorage: () => (state) => { state?.setHydrated() },
    }
  )
)

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval'
import { nanoid } from 'nanoid'
import type { Target } from './types'
import { localToday } from '../lib/date'

interface TargetsState {
  targets: Target[]
  hasHydrated: boolean

  addTarget: (data: Omit<Target, 'id' | 'createdAt'>) => void
  updateTarget: (id: string, changes: Partial<Omit<Target, 'id' | 'createdAt'>>) => void
  deleteTarget: (id: string) => void
  setHydrated: () => void
}

const idbStorage = {
  getItem: async (name: string) => (await idbGet(name)) ?? null,
  setItem: async (name: string, value: string) => idbSet(name, value),
  removeItem: async (name: string) => idbDel(name),
}

export const useTargetsStore = create<TargetsState>()(
  persist(
    (set) => ({
      targets: [],
      hasHydrated: false,

      addTarget: (data) => {
        const target: Target = { ...data, id: nanoid(), createdAt: localToday() }
        set(s => ({ targets: [...s.targets, target] }))
      },

      updateTarget: (id, changes) => {
        set(s => ({
          targets: s.targets.map(t => t.id === id ? { ...t, ...changes } : t),
        }))
      },

      deleteTarget: (id) => {
        set(s => ({ targets: s.targets.filter(t => t.id !== id) }))
      },

      setHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: 'task-manager-targets',
      storage: createJSONStorage(() => idbStorage),
      onRehydrateStorage: () => (state) => { state?.setHydrated() },
    }
  )
)

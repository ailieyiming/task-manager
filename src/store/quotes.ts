import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval'

interface QuotesState {
  keptIds: number[]
  rejectedIds: number[]
  decidedOn: string | null
  acceptedByDate: Record<string, number>
  hasHydrated: boolean
  keepQuote: (id: number, date: string) => void
  rejectQuote: (id: number) => void
  setHydrated: () => void
}

const idbStorage = {
  getItem: async (name: string) => (await idbGet(name)) ?? null,
  setItem: async (name: string, value: string) => idbSet(name, value),
  removeItem: async (name: string) => idbDel(name),
}

export const useQuotesStore = create<QuotesState>()(
  persist(
    (set) => ({
      keptIds: [],
      rejectedIds: [],
      decidedOn: null,
      acceptedByDate: {},
      hasHydrated: false,

      keepQuote: (id, date) => set((state) => ({
        keptIds: state.keptIds.includes(id) ? state.keptIds : [...state.keptIds, id],
        rejectedIds: state.rejectedIds.filter((quoteId) => quoteId !== id),
        decidedOn: date,
        acceptedByDate: { ...state.acceptedByDate, [date]: id },
      })),

      rejectQuote: (id) => set((state) => ({
        keptIds: state.keptIds.filter((quoteId) => quoteId !== id),
        rejectedIds: state.rejectedIds.includes(id) ? state.rejectedIds : [...state.rejectedIds, id],
        acceptedByDate: Object.fromEntries(Object.entries(state.acceptedByDate).filter(([, quoteId]) => quoteId !== id)),
      })),

      setHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: 'task-manager-quotes',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ keptIds: state.keptIds, rejectedIds: state.rejectedIds, decidedOn: state.decidedOn, acceptedByDate: state.acceptedByDate }),
      merge: (persisted, current) => ({ ...current, ...(persisted as Partial<QuotesState>), acceptedByDate: (persisted as Partial<QuotesState>)?.acceptedByDate ?? {} }),
      onRehydrateStorage: () => (state) => { state?.setHydrated() },
    }
  )
)

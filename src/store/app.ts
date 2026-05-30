import { create } from 'zustand'

type Tab = 'tasks' | 'targets' | 'summary'

interface AppState {
  activeTab: Tab
  setTab: (tab: Tab) => void
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'tasks',
  setTab: (tab) => set({ activeTab: tab }),
}))

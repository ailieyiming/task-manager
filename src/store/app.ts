import { create } from 'zustand'

type Tab = 'tasks' | 'targets' | 'gym' | 'cloud'

interface AppState {
  activeTab: Tab
  setTab: (tab: Tab) => void
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'tasks',
  setTab: (tab) => set({ activeTab: tab }),
}))

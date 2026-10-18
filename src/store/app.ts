import { create } from 'zustand'

type Tab = 'tasks' | 'allTasks' | 'targets' | 'gym' | 'cloud'

interface AppState {
  activeTab: Tab
  returnTab: Tab
  setTab: (tab: Tab) => void
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'tasks',
  returnTab: 'tasks',
  setTab: (tab) => set(state => ({
    activeTab: tab,
    returnTab: tab === 'cloud' && state.activeTab !== 'cloud' ? state.activeTab : state.returnTab,
  })),
}))

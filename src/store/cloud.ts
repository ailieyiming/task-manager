import { create } from 'zustand'

export type CloudMode = 'local' | 'connecting' | 'synced' | 'offline' | 'conflict'

interface CloudState {
  userId: string | null
  email: string | null
  mode: CloudMode
  message: string | null
  lastSynced: string | null
  setStatus: (changes: Partial<Omit<CloudState, 'setStatus'>>) => void
}

export const useCloudStore = create<CloudState>((set) => ({
  userId: null,
  email: null,
  mode: 'local',
  message: null,
  lastSynced: null,
  setStatus: (changes) => set(changes),
}))

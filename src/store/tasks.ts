import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval'
import { nanoid } from 'nanoid'
import type { Task, TaskOverride } from './types'
import { capCompletedDates } from '../lib/recurrence'
import { localToday } from '../lib/date'

interface TasksState {
  tasks: Task[]
  overrides: TaskOverride[]
  orderedTaskIds: string[]
  // Cumulative completed count per targetId (persists even after tasks are purged).
  // Key '_standalone' = tasks with no target.
  cumulativeCompleted: Record<string, number>
  hasHydrated: boolean

  addTask: (task: Omit<Task, 'id' | 'completedDates'>) => void
  updateTask: (id: string, changes: Partial<Omit<Task, 'id'>>) => void
  deleteTask: (id: string) => void
  purgeOldCompleted: () => void   // removes one-time tasks completed > 2 days ago
  markComplete: (taskId: string, date?: string) => void
  markIncomplete: (taskId: string, date?: string) => void
  editOccurrence: (taskId: string, date: string, changes: Partial<TaskOverride>) => void
  reorder: (newOrder: string[]) => void
  setHydrated: () => void
}

// idb-keyval storage adapter for Zustand persist
const idbStorage = {
  getItem: async (name: string) => {
    return (await idbGet(name)) ?? null
  },
  setItem: async (name: string, value: string) => {
    await idbSet(name, value)
  },
  removeItem: async (name: string) => {
    await idbDel(name)
  },
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set) => ({
      tasks: [],
      overrides: [],
      orderedTaskIds: [],
      cumulativeCompleted: {},
      hasHydrated: false,

      addTask: (data) => {
        const id = nanoid()
        const task: Task = { ...data, id, completedDates: [] }
        set(s => ({
          tasks: [...s.tasks, task],
          orderedTaskIds: [...s.orderedTaskIds, id],
        }))
      },

      updateTask: (id, changes) => {
        set(s => ({
          tasks: s.tasks.map(t => t.id === id ? { ...t, ...changes } : t),
        }))
      },

      deleteTask: (id) => {
        set(s => ({
          tasks: s.tasks.filter(t => t.id !== id),
          orderedTaskIds: s.orderedTaskIds.filter(oid => oid !== id),
          overrides: s.overrides.filter(o => o.taskId !== id),
        }))
      },

      purgeOldCompleted: () => {
        // Hard-delete one-time tasks whose most recent completion is > 2 days old.
        // Recurring tasks are never purged — they keep recurring.
        const today = localToday()
        const [ty, tm, td] = today.split('-').map(Number)
        const todayMs = new Date(ty, tm - 1, td).getTime()
        set(s => {
          const keep = s.tasks.filter(t => {
            if (t.repeat) return true
            if (t.completedDates.length === 0) return true
            const latest = t.completedDates.slice().sort().at(-1)!
            const [cy, cm, cd] = latest.split('-').map(Number)
            const completedMs = new Date(cy, cm - 1, cd).getTime()
            return (todayMs - completedMs) / 86_400_000 <= 1
          })
          const keepIds = new Set(keep.map(t => t.id))
          return {
            tasks: keep,
            orderedTaskIds: s.orderedTaskIds.filter(id => keepIds.has(id)),
            overrides: s.overrides.filter(o => keepIds.has(o.taskId)),
          }
        })
      },

      markComplete: (taskId, date) => {
        const today = date ?? localToday()
        set(s => {
          const task = s.tasks.find(t => t.id === taskId)
          if (!task) return s
          // Only increment cumulative count if not already completed today
          const alreadyDone = task.completedDates.includes(today)
          const key = task.targetId ?? '_standalone'
          return {
            tasks: s.tasks.map(t => {
              if (t.id !== taskId) return t
              const dates = alreadyDone
                ? t.completedDates
                : capCompletedDates([...t.completedDates, today])
              return { ...t, completedDates: dates }
            }),
            overrides: s.overrides.filter(o => !(o.taskId === taskId && o.date === today)),
            cumulativeCompleted: alreadyDone
              ? s.cumulativeCompleted
              : { ...s.cumulativeCompleted, [key]: (s.cumulativeCompleted[key] ?? 0) + 1 },
          }
        })
      },

      markIncomplete: (taskId, date) => {
        const today = date ?? localToday()
        set(s => {
          const task = s.tasks.find(t => t.id === taskId)
          if (!task) return s
          const wasDone = task.completedDates.includes(today)
          const key = task.targetId ?? '_standalone'
          return {
            tasks: s.tasks.map(t => {
              if (t.id !== taskId) return t
              return { ...t, completedDates: t.completedDates.filter(d => d !== today) }
            }),
            cumulativeCompleted: wasDone
              ? { ...s.cumulativeCompleted, [key]: Math.max(0, (s.cumulativeCompleted[key] ?? 1) - 1) }
              : s.cumulativeCompleted,
          }
        })
      },

      editOccurrence: (taskId, date, changes) => {
        set(s => {
          const existing = s.overrides.find(o => o.taskId === taskId && o.date === date)
          if (existing) {
            return {
              overrides: s.overrides.map(o =>
                o.taskId === taskId && o.date === date ? { ...o, ...changes } : o
              ),
            }
          }
          return {
            overrides: [...s.overrides, { taskId, date, ...changes }],
          }
        })
      },

      reorder: (newOrder) => {
        set({ orderedTaskIds: newOrder })
      },

      setHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: 'task-manager-tasks',
      storage: createJSONStorage(() => idbStorage),
      onRehydrateStorage: () => (state) => {
        state?.purgeOldCompleted()
        state?.setHydrated()
      },
    }
  )
)

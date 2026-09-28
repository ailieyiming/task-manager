import type { Task, TaskOverride, Target } from '../store/types'
import type { GymCheckIns } from './gym'

export interface AppData {
  tasks: Task[]
  overrides: TaskOverride[]
  orderedTaskIds: string[]
  cumulativeCompleted: Record<string, number>
  targets: Target[]
  orderedTargetIds: string[]
  keptIds: number[]
  rejectedIds: number[]
  decidedOn: string | null
  gymCheckIns: GymCheckIns
}

type LegacyAppData = Omit<AppData, 'gymCheckIns'> & { gymCheckIns?: GymCheckIns }

export function normalizeAppData(data: LegacyAppData): AppData {
  return { ...data, gymCheckIns: data.gymCheckIns ?? {} }
}

// Postgres jsonb may reorder object keys; compare content, not serialization order.
export function stableStringify(value: unknown): string {
  const normalize = (item: unknown): unknown => {
    if (Array.isArray(item)) return item.map(normalize)
    if (item && typeof item === 'object') {
      return Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b))
        .map(([key, child]) => [key, normalize(child)]))
    }
    return item
  }
  return JSON.stringify(normalize(value))
}

export function hasRecords(data: AppData): boolean {
  return data.tasks.length > 0 || data.targets.length > 0 ||
    Object.keys(data.cumulativeCompleted).length > 0 ||
    data.keptIds.length > 0 || data.rejectedIds.length > 0
    || Object.keys(data.gymCheckIns).length > 0
}

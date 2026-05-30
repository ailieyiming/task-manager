export interface RepeatRule {
  freq: 'daily' | 'weekly' | 'monthly' | 'custom'
  interval: number
  stopDate?: string // YYYY-MM-DD
}

export interface Task {
  id: string
  title: string
  baseDate: string        // YYYY-MM-DD — first occurrence (or due date for one-time)
  targetId?: string
  repeat?: RepeatRule
  completedDates: string[] // capped to 90 entries
}

export interface TaskOverride {
  taskId: string
  date: string            // YYYY-MM-DD — which occurrence
  title?: string
  skipped?: boolean
  completedOverride?: boolean
}

export interface Target {
  id: string
  title: string
  deadline: string        // YYYY-MM-DD
  description?: string
  createdAt: string
}

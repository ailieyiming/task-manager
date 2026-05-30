import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { useTasksStore } from '../store/tasks'
import { localToday } from '../lib/date'
import { isTaskDueToday, isCompleted } from '../lib/recurrence'
import { TaskCard } from '../components/tasks/TaskCard'
import { TaskForm } from '../components/tasks/TaskForm'
import type { Task } from '../store/types'

export function TasksPage() {
  const { tasks, overrides, orderedTaskIds, reorder, hasHydrated } = useTasksStore()
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const today = localToday()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  // Tasks due today, sorted by date then by manual order
  const todaysTasks = useMemo(() => {
    const due = tasks.filter(t => isTaskDueToday(t, overrides, today))
    // Sort: first by date, then by manual orderedTaskIds order
    return due.sort((a, b) => {
      const dateCompare = a.baseDate.localeCompare(b.baseDate)
      if (dateCompare !== 0) return dateCompare
      const ai = orderedTaskIds.indexOf(a.id)
      const bi = orderedTaskIds.indexOf(b.id)
      return (ai === -1 ? 9999 : ai) - (bi === -1 ? 9999 : bi)
    })
  }, [tasks, overrides, orderedTaskIds, today])

  const completed = todaysTasks.filter(t => isCompleted(t, overrides, today))
  const remaining = todaysTasks.filter(t => !isCompleted(t, overrides, today))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = orderedTaskIds.indexOf(String(active.id))
      const newIndex = orderedTaskIds.indexOf(String(over.id))
      if (oldIndex !== -1 && newIndex !== -1) {
        reorder(arrayMove(orderedTaskIds, oldIndex, newIndex))
      }
    }
  }

  if (!hasHydrated) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const displayDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short'
  })

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Sticky header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-stone-100 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-stone-400">{displayDate}</p>
            <p className="text-[15px] font-semibold text-stone-900">
              {completed.length}/{todaysTasks.length} done
              {todaysTasks.length > 0 && (
                <span className="ml-2 text-[13px] font-normal text-stone-400">
                  · {Math.round((completed.length / todaysTasks.length) * 100)}%
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="w-9 h-9 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {todaysTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-4xl mb-3">✓</div>
            <p className="text-[16px] font-semibold text-stone-700 mb-1">No tasks today</p>
            <p className="text-[13px] text-stone-400 mb-4">Add something to get started</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#1e3a5f] text-white px-5 py-2.5 rounded-xl text-[14px] font-medium"
            >
              Add your first task
            </button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={todaysTasks.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {/* Remaining */}
              {remaining.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={(t) => { setEditingTask(t); setShowForm(true) }}
                />
              ))}

              {/* Completed */}
              {completed.length > 0 && (
                <>
                  <p className="text-[12px] font-medium text-stone-400 uppercase tracking-wide pt-2">
                    Completed
                  </p>
                  {completed.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={(t) => { setEditingTask(t); setShowForm(true) }}
                    />
                  ))}
                </>
              )}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {showForm && (
        <TaskForm
          task={editingTask}
          defaultDate={today}
          onClose={() => { setShowForm(false); setEditingTask(null) }}
        />
      )}
    </div>
  )
}

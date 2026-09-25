import { useState, useMemo, useCallback, useEffect } from 'react'
import { Plus, RefreshCw, Trash2 } from 'lucide-react'
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
import { isTaskDueToday, isCompleted, isVisible } from '../lib/recurrence'
import { TaskCard } from '../components/tasks/TaskCard'
import { TaskForm } from '../components/tasks/TaskForm'
import type { Task } from '../store/types'

const dailyAffirmations = [
  'I am becoming the person who can create the life I want.',
  'I welcome good opportunities and meet them with confidence.',
  'Small steps I take today are building something meaningful.',
  'I trust my pace and keep moving toward what matters to me.',
  'I am worthy of the good things I am working toward.',
  'I have the clarity and courage to take my next step.',
  'My focus today is shaping a future I feel proud of.',
  'I make room for progress, possibility, and peace.',
  'I can handle today one thoughtful step at a time.',
  'I am open to joy, growth, and unexpected good things.',
  'What I do consistently matters more than doing it perfectly.',
  'I bring valuable strengths to every challenge I meet.',
  'I choose to notice how far I have already come.',
  'I am creating a life that feels true to me.',
  'I deserve the time and care it takes to reach my goals.',
  'Today, I give my energy to what I can shape and grow.',
  'I trust myself to make choices that support my wellbeing.',
  'I am ready to receive the opportunities aligned with my effort.',
  'Every day gives me another chance to begin with intention.',
  'I can be ambitious and patient with myself at the same time.',
  'I notice possibility, and I take action when it appears.',
  'My ideas, effort, and perspective have real value.',
  'I release what I cannot control and nurture what I can.',
  'I am allowed to grow beyond the limits I once imagined.',
  'I meet this day with an open mind and a steady heart.',
  'I am building confidence by keeping promises to myself.',
  'Good things can find me while I work toward them.',
  'I have everything I need to take the next small step.',
  'I make choices today that my future self will thank me for.',
  'I am grateful for where I am and excited for where I am going.',
  'I let hope guide me and let consistent action carry me forward.',
]

function affirmationForDate(date: string): string {
  const dayNumber = Number(date.replaceAll('-', ''))
  return dailyAffirmations[dayNumber % dailyAffirmations.length]
}

type ViewMode = 'today' | 'all'

export function TasksPage() {
  const { tasks, overrides, orderedTaskIds, reorder, hasHydrated, purgeOldCompleted, deleteTask } = useTasksStore()
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('today')
  const [today, setToday] = useState(() => localToday())
  const [spinning, setSpinning] = useState(false)

  useEffect(() => {
    const updateDate = () => {
      if (document.visibilityState === 'visible') setToday(localToday())
    }
    document.addEventListener('visibilitychange', updateDate)
    return () => document.removeEventListener('visibilitychange', updateDate)
  }, [])

  const refresh = useCallback(() => {
    purgeOldCompleted()
    setSpinning(true)
    setToday(localToday())
    setTimeout(() => setSpinning(false), 600)
  }, [purgeOldCompleted])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  // Today view — exclude tasks that are completed and past 9-day window
  const todaysTasks = useMemo(() => {
    const due = tasks.filter(t => isTaskDueToday(t, overrides, today) && isVisible(t, today))
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

  // All tasks view — visible tasks sorted by date
  const allTasks = useMemo(() => {
    return [...tasks]
      .filter(t => isVisible(t, today))
      .sort((a, b) => a.baseDate.localeCompare(b.baseDate))
  }, [tasks, today])

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
  const affirmation = affirmationForDate(today)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Sticky header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-stone-100 px-4 pt-3 pb-0 z-10">
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <p className="text-[13px] text-stone-400">{displayDate}</p>
            {viewMode === 'today' ? (
              <p className="text-[15px] font-semibold text-stone-900">
                {completed.length}/{todaysTasks.length} done
                {todaysTasks.length > 0 && (
                  <span className="ml-2 text-[13px] font-normal text-stone-400">
                    · {Math.round((completed.length / todaysTasks.length) * 100)}%
                  </span>
                )}
              </p>
            ) : (
              <p className="text-[15px] font-semibold text-stone-900">
                {tasks.length} task{tasks.length !== 1 ? 's' : ''} total
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Refresh button */}
            <button
              onClick={refresh}
              className="w-9 h-9 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
              title="Refresh date"
            >
              <RefreshCw size={17} className={spinning ? 'animate-spin' : ''} />
            </button>
            {/* Add button */}
            <button
              onClick={() => setShowForm(true)}
              className="w-9 h-9 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white"
            >
              <Plus size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Today / All toggle */}
        <div className="flex border-b border-stone-100">
          {(['today', 'all'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 py-2 text-[13px] font-medium border-b-2 transition-colors ${
                viewMode === mode
                  ? 'border-[#1e3a5f] text-[#1e3a5f]'
                  : 'border-transparent text-stone-400'
              }`}
            >
              {mode === 'today' ? 'Today' : 'All Tasks'}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        <section className="rounded-2xl border border-[#1e3a5f]/10 bg-[#1e3a5f]/5 px-4 py-3.5" aria-label="Today's affirmation">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1e3a5f]/65 mb-1">Today's affirmation</p>
          <p className="text-[15px] leading-snug font-medium text-[#1e3a5f]">“{affirmation}”</p>
        </section>
        {viewMode === 'today' ? (
          todaysTasks.length === 0 ? (
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
              <SortableContext items={todaysTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                {remaining.map(task => (
                  <TaskCard key={task.id} task={task} onEdit={(t) => { setEditingTask(t); setShowForm(true) }} />
                ))}
                {completed.length > 0 && (
                  <>
                    <p className="text-[12px] font-medium text-stone-400 uppercase tracking-wide pt-2">Completed</p>
                    {completed.map(task => (
                      <TaskCard key={task.id} task={task} onEdit={(t) => { setEditingTask(t); setShowForm(true) }} />
                    ))}
                  </>
                )}
              </SortableContext>
            </DndContext>
          )
        ) : (
          /* All Tasks view */
          allTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-[16px] font-semibold text-stone-700 mb-1">No tasks yet</p>
              <p className="text-[13px] text-stone-400 mb-4">Create your first task</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-[#1e3a5f] text-white px-5 py-2.5 rounded-xl text-[14px] font-medium"
              >
                Add task
              </button>
            </div>
          ) : (
            <div className="space-y-2 pb-4">
              {allTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 bg-white rounded-xl px-3 py-3 shadow-sm border border-stone-100">
                  {/* Date pill */}
                  <div className={`flex-shrink-0 text-center px-2 py-1 rounded-lg min-w-[52px] ${
                    task.baseDate === today ? 'bg-[#1e3a5f] text-white' : 'bg-stone-100 text-stone-500'
                  }`}>
                    <p className="text-[10px] font-medium leading-none">
                      {new Date(task.baseDate + 'T12:00:00').toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}
                    </p>
                    <p className="text-[18px] font-bold leading-tight">
                      {new Date(task.baseDate + 'T12:00:00').getDate()}
                    </p>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-stone-900 truncate">{task.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {task.repeat && (
                        <span className="text-[11px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full">
                          {task.repeat.freq}
                        </span>
                      )}
                      {task.targetId && (
                        <span className="text-[11px] bg-[#1e3a5f]/10 text-[#1e3a5f] px-1.5 py-0.5 rounded-full">
                          linked
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Edit / Delete buttons */}
                  <button
                    onClick={() => { setEditingTask(task); setShowForm(true) }}
                    className="flex-shrink-0 px-3 py-1.5 text-[13px] font-medium text-stone-500 border border-stone-200 rounded-lg hover:text-stone-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${task.title}" permanently?`)) deleteTask(task.id)
                    }}
                    className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-stone-400 hover:text-red-600 rounded-lg"
                    title="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )
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

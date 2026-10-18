import { useState, useMemo, useCallback, useEffect } from 'react'
import { ChevronDown, Cloud, Plus, RefreshCw, Repeat2, Search, Trash2, X } from 'lucide-react'
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
import { localToday, parseLocalDate } from '../lib/date'
import { isTaskDueToday, isCompleted, isShownInAllTasks, isVisible } from '../lib/recurrence'
import { useAppStore } from '../store/app'
import { TaskCard } from '../components/tasks/TaskCard'
import { TaskForm } from '../components/tasks/TaskForm'
import { DailyQuote } from '../components/tasks/DailyQuote'
import type { Task } from '../store/types'

type ViewMode = 'today' | 'all'

export function TasksPage() {
  const { tasks, overrides, orderedTaskIds, reorder, hasHydrated, purgeOldCompleted, deleteTask } = useTasksStore()
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('today')
  const [search, setSearch] = useState('')
  const [today, setToday] = useState(() => localToday())
  const [spinning, setSpinning] = useState(false)
  const [completedOpen, setCompletedOpen] = useState(false)
  const [repeatingOpen, setRepeatingOpen] = useState(false)
  const setTab = useAppStore(s => s.setTab)

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

  // Today includes overdue one-time tasks until they are completed, edited, or deleted.
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

  // All Tasks does not list one-time tasks with past dates.
  const allTasks = useMemo(() => {
    return [...tasks]
      .filter(t => isShownInAllTasks(t, today))
      .sort((a, b) => a.baseDate.localeCompare(b.baseDate))
  }, [tasks, today])
  const matchingTasks = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()
    return term ? allTasks.filter(task => task.title.toLocaleLowerCase().includes(term)) : allTasks
  }, [allTasks, search])
  const oneTimeTasks = matchingTasks.filter(task => !task.repeat)
  const repeatingTasks = matchingTasks.filter(task => task.repeat)

  const renderAllTask = (task: Task) => (
    <div key={task.id} className="flex items-center gap-3 bg-white rounded-xl px-3 py-3 shadow-sm border border-stone-100">
      {task.repeat ? (
        <div className="flex-shrink-0 w-[52px] h-[48px] flex items-center justify-center rounded-lg bg-stone-100 text-[#1e3a5f]">
          <Repeat2 size={20} aria-hidden="true" />
        </div>
      ) : (
        <div className={`flex-shrink-0 text-center px-2 py-1 rounded-lg min-w-[52px] ${
          task.baseDate === today ? 'bg-[#1e3a5f] text-white' : 'bg-stone-100 text-stone-500'
        }`}>
          <p className="text-[10px] font-medium leading-none">
            {parseLocalDate(task.baseDate).toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}
          </p>
          <p className="text-[18px] font-bold leading-tight">{parseLocalDate(task.baseDate).getDate()}</p>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-stone-900 truncate">{task.title}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {task.repeat && (
            <span className="text-[11px] text-stone-500 capitalize">
              {task.repeat.freq} · starts {parseLocalDate(task.baseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
          )}
          {task.targetId && (
            <span className="text-[11px] bg-[#1e3a5f]/10 text-[#1e3a5f] px-1.5 py-0.5 rounded-full">linked</span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => { setEditingTask(task); setShowForm(true) }}
        className="flex-shrink-0 min-h-10 px-3 text-[13px] font-medium text-stone-500 border border-stone-200 rounded-lg hover:text-stone-700"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={() => {
          if (confirm(`Delete "${task.title}" permanently?`)) deleteTask(task.id)
        }}
        className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-stone-400 hover:text-red-600 rounded-lg"
        aria-label={`Delete ${task.title}`}
      >
        <Trash2 size={16} />
      </button>
    </div>
  )

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

  const displayDate = parseLocalDate(today).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short'
  })

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
                {matchingTasks.length} task{matchingTasks.length !== 1 ? 's' : ''} shown
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('cloud')}
              className="w-9 h-9 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100"
              aria-label="Open cloud and account"
              title="Cloud and account"
            >
              <Cloud size={18} />
            </button>
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

        {/* Large view switch stays visible while the task list scrolls. */}
        <div className="flex gap-1 rounded-xl bg-stone-100 p-1 mb-3" role="tablist" aria-label="Task views">
          {(['today', 'all'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={viewMode === mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 min-h-11 rounded-lg text-[14px] font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-white text-[#1e3a5f] shadow-sm'
                  : 'text-stone-500'
              }`}
            >
              {mode === 'today' ? `Today · ${remaining.length}` : `All Tasks · ${allTasks.length}`}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {viewMode === 'today' ? (
          <>
            <DailyQuote date={today} />
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
                <SortableContext items={remaining.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  {remaining.map(task => (
                    <TaskCard key={task.id} task={task} onEdit={(t) => { setEditingTask(t); setShowForm(true) }} />
                  ))}
                </SortableContext>
                {completed.length > 0 && (
                  <section className="pt-2" aria-label="Completed tasks">
                    <button
                      type="button"
                      onClick={() => setCompletedOpen(open => !open)}
                      aria-expanded={completedOpen}
                      className="w-full flex items-center justify-between rounded-xl bg-stone-100 px-3 py-3 text-[13px] font-medium text-stone-600"
                    >
                      <span>Completed ({completed.length})</span>
                      <ChevronDown size={17} className={`transition-transform ${completedOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {completedOpen && (
                      <SortableContext items={completed.map(t => t.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2 mt-2">
                          {completed.map(task => (
                            <TaskCard key={task.id} task={task} onEdit={(t) => { setEditingTask(t); setShowForm(true) }} />
                          ))}
                        </div>
                      </SortableContext>
                    )}
                  </section>
                )}
              </DndContext>
            )}
          </>
        ) : (
          /* All Tasks view */
          <div className="space-y-4 pb-4">
            <div className="relative">
              <Search size={17} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                value={search}
                onChange={event => {
                  setSearch(event.target.value)
                  if (event.target.value.trim()) setRepeatingOpen(true)
                }}
                placeholder="Search tasks"
                aria-label="Search tasks"
                className="w-full min-h-11 rounded-xl border border-stone-200 bg-white pl-10 pr-10 text-[14px] text-stone-900 outline-none focus:border-[#1e3a5f]"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-stone-400">
                  <X size={16} />
                </button>
              )}
            </div>
            {matchingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-52 text-center">
                <p className="text-[16px] font-semibold text-stone-700 mb-1">{search ? 'No matching tasks' : 'No tasks to show'}</p>
                {!search && <p className="text-[13px] text-stone-400">Past one-time tasks stay in Today</p>}
              </div>
            ) : (
              <>
                {repeatingTasks.length > 0 && (
                  <section className="space-y-2" aria-label="Repeating tasks">
                    <button
                      type="button"
                      onClick={() => setRepeatingOpen(open => !open)}
                      aria-expanded={repeatingOpen}
                      className="w-full min-h-11 flex items-center justify-between rounded-xl bg-stone-100 px-3 text-[13px] font-medium text-stone-600"
                    >
                      <span>Repeating ({repeatingTasks.length})</span>
                      <ChevronDown size={17} className={`transition-transform ${repeatingOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {repeatingOpen && <div className="space-y-2">{repeatingTasks.map(renderAllTask)}</div>}
                  </section>
                )}
                {oneTimeTasks.length > 0 && (
                  <section className="space-y-2" aria-label="One-time tasks">
                    <h2 className="text-[12px] font-semibold uppercase tracking-wide text-stone-500">One-time · {oneTimeTasks.length}</h2>
                    {oneTimeTasks.map(renderAllTask)}
                  </section>
                )}
              </>
            )}
          </div>
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

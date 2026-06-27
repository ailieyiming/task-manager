import { useState } from 'react'
import { GripVertical, Pencil, Trash2 } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../../store/types'
import { useTasksStore } from '../../store/tasks'
import { useTargetsStore } from '../../store/targets'
import { formatDisplay, localToday } from '../../lib/date'
import { isCompleted, isOverdue } from '../../lib/recurrence'

interface Props {
  task: Task
  onEdit: (task: Task) => void
}

export function TaskCard({ task, onEdit }: Props) {
  const { overrides, markComplete, markIncomplete, deleteTask } = useTasksStore()
  const { targets } = useTargetsStore()
  const [completing, setCompleting] = useState(false)

  const today = localToday()
  const done = isCompleted(task, overrides, today)
  const overdue = isOverdue(task, overrides, today)
  const target = task.targetId ? targets.find(t => t.id === task.targetId) : null

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleToggle = () => {
    if (done) {
      markIncomplete(task.id, today)
      return
    }
    setCompleting(true)
    setTimeout(() => {
      markComplete(task.id, today)
      setCompleting(false)
    }, 300)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 bg-white rounded-xl px-3 py-3 shadow-sm border transition-opacity ${completing ? 'opacity-50' : ''} ${overdue ? 'border-red-400 bg-red-50' : 'border-stone-100'}`}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          done
            ? 'bg-[#1e3a5f] border-[#1e3a5f]'
            : 'border-stone-300'
        }`}
      >
        {done && (
          <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
            <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-[15px] font-medium leading-tight ${done ? 'line-through text-stone-400' : 'text-stone-900'}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {task.baseDate !== today && (
            <span className="text-[12px] text-stone-400">{formatDisplay(task.baseDate)}</span>
          )}
          {task.repeat && (
            <span className="text-[11px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full">
              {task.repeat.freq}
            </span>
          )}
          {target && (
            <span className="text-[11px] bg-[#1e3a5f]/10 text-[#1e3a5f] px-1.5 py-0.5 rounded-full truncate max-w-[100px]">
              {target.title}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button onClick={() => onEdit(task)} className="p-1.5 text-stone-400 hover:text-stone-600">
          <Pencil size={15} />
        </button>
        <button onClick={() => deleteTask(task.id)} className="p-1.5 text-stone-400 hover:text-red-500">
          <Trash2 size={15} />
        </button>
        <div
          {...attributes}
          {...listeners}
          className="p-1.5 text-stone-300 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical size={18} />
        </div>
      </div>
    </div>
  )
}

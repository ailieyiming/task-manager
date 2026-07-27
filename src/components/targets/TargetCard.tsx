import { Pencil, Trash2, GripVertical } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Target } from '../../store/types'
import { useTasksStore } from '../../store/tasks'
import { daysUntil, isPast, localToday } from '../../lib/date'
import { isCompleted } from '../../lib/recurrence'

interface Props {
  target: Target
  onEdit: (target: Target) => void
  onDelete: (target: Target) => void
}

export function TargetCard({ target, onEdit, onDelete }: Props) {
  const { tasks, overrides } = useTasksStore()
  const today = localToday()

  const linked = tasks.filter(t => t.targetId === target.id)
  const totalAll = linked.length
  const completedAll = linked.filter(t => t.completedDates.length > 0 || isCompleted(t, overrides, today)).length

  const days = daysUntil(target.deadline)
  const overdue = isPast(target.deadline)
  const progress = totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: target.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-2xl p-4 shadow-sm border ${overdue && completedAll < totalAll ? 'border-red-200' : 'border-stone-100'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] font-semibold text-stone-900 truncate">{target.title}</h3>
          {target.description && (
            <p className="text-[13px] text-stone-500 mt-0.5 line-clamp-1">{target.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button onClick={() => onEdit(target)} className="p-1.5 text-stone-400 hover:text-stone-600">
            <Pencil size={15} />
          </button>
          <button onClick={() => onDelete(target)} className="p-1.5 text-stone-400 hover:text-red-500">
            <Trash2 size={15} />
          </button>
          <div {...attributes} {...listeners} className="p-1.5 text-stone-300 cursor-grab active:cursor-grabbing touch-none">
            <GripVertical size={18} />
          </div>
        </div>
      </div>

      {/* Hero countdown */}
      <div className={`text-center py-3 rounded-xl mb-3 ${overdue ? 'bg-red-50' : 'bg-[#1e3a5f]/5'}`}>
        <div className={`text-[40px] font-bold leading-none ${overdue ? 'text-red-600' : 'text-[#1e3a5f]'}`}>
          {overdue ? 'Overdue' : days === 0 ? 'Today' : `${days}`}
        </div>
        {!overdue && days > 0 && (
          <div className="text-[13px] text-stone-500 mt-1">days left</div>
        )}
        <div className="text-[12px] text-stone-400 mt-1">
          {new Date(target.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>

      {/* Progress */}
      {totalAll > 0 ? (
        <div>
          <div className="flex justify-between text-[12px] text-stone-500 mb-1.5">
            <span>{completedAll}/{totalAll} tasks done</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1e3a5f] rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="text-[12px] text-stone-400 text-center">No tasks linked yet</p>
      )}
    </div>
  )
}

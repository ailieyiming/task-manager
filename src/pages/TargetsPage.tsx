import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTargetsStore } from '../store/targets'
import { useTasksStore } from '../store/tasks'
import { TargetCard } from '../components/targets/TargetCard'
import { TargetForm } from '../components/targets/TargetForm'
import type { Target } from '../store/types'

export function TargetsPage() {
  const { targets, deleteTarget, hasHydrated } = useTargetsStore()
  const { updateTask, tasks } = useTasksStore()
  const [showForm, setShowForm] = useState(false)
  const [editingTarget, setEditingTarget] = useState<Target | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Target | null>(null)
  const [deleteLinkedTasks, setDeleteLinkedTasks] = useState(false)

  const { deleteTask } = useTasksStore()

  const handleDeleteConfirm = () => {
    if (!pendingDelete) return
    const linked = tasks.filter(t => t.targetId === pendingDelete.id)
    if (deleteLinkedTasks) {
      linked.forEach(t => deleteTask(t.id))
    } else {
      linked.forEach(t => updateTask(t.id, { targetId: undefined }))
    }
    deleteTarget(pendingDelete.id)
    setPendingDelete(null)
    setDeleteLinkedTasks(false)
  }

  if (!hasHydrated) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-stone-100 px-4 py-3 z-10 flex items-center justify-between">
        <div>
          <p className="text-[13px] text-stone-400">Countdown targets</p>
          <p className="text-[15px] font-semibold text-stone-900">{targets.length} active</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-9 h-9 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {targets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-[16px] font-semibold text-stone-700 mb-1">No targets yet</p>
            <p className="text-[13px] text-stone-400 mb-4">Create a goal with a deadline</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#1e3a5f] text-white px-5 py-2.5 rounded-xl text-[14px] font-medium"
            >
              Create your first target
            </button>
          </div>
        ) : (
          targets.map(target => (
            <TargetCard
              key={target.id}
              target={target}
              onEdit={(t) => { setEditingTarget(t); setShowForm(true) }}
              onDelete={(t) => setPendingDelete(t)}
            />
          ))
        )}
      </div>

      {showForm && (
        <TargetForm
          target={editingTarget}
          onClose={() => { setShowForm(false); setEditingTarget(null) }}
        />
      )}

      {/* Delete confirmation */}
      {pendingDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl">
            <h3 className="text-[17px] font-semibold text-stone-900 mb-2">Delete "{pendingDelete.title}"?</h3>
            {tasks.filter(t => t.targetId === pendingDelete.id).length > 0 && (
              <label className="flex items-center gap-3 py-3 border-y border-stone-100 my-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteLinkedTasks}
                  onChange={e => setDeleteLinkedTasks(e.target.checked)}
                  className="w-5 h-5 rounded accent-[#1e3a5f]"
                />
                <span className="text-[14px] text-stone-700">
                  Also delete {tasks.filter(t => t.targetId === pendingDelete.id).length} linked tasks
                </span>
              </label>
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setPendingDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-[14px] font-medium text-stone-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-[14px] font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

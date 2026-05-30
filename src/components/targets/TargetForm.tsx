import { useState } from 'react'
import type { Target } from '../../store/types'
import { useTargetsStore } from '../../store/targets'
import { localToday } from '../../lib/date'
import { BottomSheet } from '../layout/BottomSheet'

interface Props {
  target?: Target | null
  onClose: () => void
}

export function TargetForm({ target, onClose }: Props) {
  const { addTarget, updateTarget } = useTargetsStore()
  const [title, setTitle] = useState(target?.title ?? '')
  const [deadline, setDeadline] = useState(target?.deadline ?? '')
  const [description, setDescription] = useState(target?.description ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !deadline) return

    if (target) {
      updateTarget(target.id, { title: title.trim(), deadline, description: description || undefined })
    } else {
      addTarget({ title: title.trim(), deadline, description: description || undefined })
    }
    onClose()
  }

  const minDate = localToday()

  return (
    <BottomSheet title={target ? 'Edit Target' : 'New Target'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-stone-600 mb-1">Title</label>
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Launch MVP"
            className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-[15px] outline-none focus:border-[#1e3a5f]"
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-stone-600 mb-1">Deadline</label>
          <input
            type="date"
            value={deadline}
            min={minDate}
            onChange={e => setDeadline(e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-[15px] outline-none focus:border-[#1e3a5f]"
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-stone-600 mb-1">Description (optional)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What are you working toward?"
            rows={3}
            className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-[15px] outline-none focus:border-[#1e3a5f] resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={!title.trim() || !deadline}
          className="w-full bg-[#1e3a5f] text-white rounded-xl py-3 text-[15px] font-semibold disabled:opacity-40"
        >
          {target ? 'Save Changes' : 'Create Target'}
        </button>
      </form>
    </BottomSheet>
  )
}

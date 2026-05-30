import { useState } from 'react'
import type { Task, RepeatRule } from '../../store/types'
import { useTasksStore } from '../../store/tasks'
import { useTargetsStore } from '../../store/targets'
import { localToday } from '../../lib/date'
import { BottomSheet } from '../layout/BottomSheet'

interface Props {
  task?: Task | null
  onClose: () => void
  defaultDate?: string
}

const FREQ_LABELS = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  custom: 'Custom',
}

export function TaskForm({ task, onClose, defaultDate }: Props) {
  const { addTask, updateTask } = useTasksStore()
  const { targets } = useTargetsStore()

  const [title, setTitle] = useState(task?.title ?? '')
  const [date, setDate] = useState(task?.baseDate ?? defaultDate ?? localToday())
  const [targetId, setTargetId] = useState(task?.targetId ?? '')
  const [repeating, setRepeating] = useState(!!task?.repeat)
  const [freq, setFreq] = useState<RepeatRule['freq']>(task?.repeat?.freq ?? 'daily')
  const [interval, setInterval] = useState(task?.repeat?.interval ?? 1)
  const [stopDate, setStopDate] = useState(task?.repeat?.stopDate ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const repeat: RepeatRule | undefined = repeating
      ? { freq, interval, stopDate: stopDate || undefined }
      : undefined

    if (task) {
      updateTask(task.id, {
        title: title.trim(),
        baseDate: date,
        targetId: targetId || undefined,
        repeat,
      })
    } else {
      addTask({
        title: title.trim(),
        baseDate: date,
        targetId: targetId || undefined,
        repeat,
      })
    }
    onClose()
  }

  return (
    <BottomSheet title={task ? 'Edit Task' : 'New Task'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-stone-600 mb-1">Title</label>
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Task name"
            className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-[15px] outline-none focus:border-[#1e3a5f]"
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-stone-600 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-[15px] outline-none focus:border-[#1e3a5f]"
          />
        </div>

        {targets.length > 0 && (
          <div>
            <label className="block text-[13px] font-medium text-stone-600 mb-1">Target (optional)</label>
            <select
              value={targetId}
              onChange={e => setTargetId(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-[15px] outline-none focus:border-[#1e3a5f] bg-white"
            >
              <option value="">None</option>
              {targets.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="text-[13px] font-medium text-stone-600">Repeat</label>
          <button
            type="button"
            onClick={() => setRepeating(r => !r)}
            className={`w-12 h-6 rounded-full transition-colors ${repeating ? 'bg-[#1e3a5f]' : 'bg-stone-200'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${repeating ? 'translate-x-6' : ''}`} />
          </button>
        </div>

        {repeating && (
          <div className="space-y-3 p-3 bg-stone-50 rounded-xl">
            <div>
              <label className="block text-[12px] font-medium text-stone-500 mb-1">Frequency</label>
              <div className="grid grid-cols-4 gap-1">
                {(Object.keys(FREQ_LABELS) as RepeatRule['freq'][]).map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFreq(f)}
                    className={`py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                      freq === f ? 'bg-[#1e3a5f] text-white' : 'bg-white text-stone-600 border border-stone-200'
                    }`}
                  >
                    {FREQ_LABELS[f]}
                  </button>
                ))}
              </div>
            </div>

            {freq === 'custom' && (
              <div>
                <label className="block text-[12px] font-medium text-stone-500 mb-1">Every N days</label>
                <input
                  type="number"
                  min={1}
                  value={interval}
                  onChange={e => setInterval(Math.max(1, Number(e.target.value)))}
                  className="w-24 border border-stone-200 rounded-xl px-3 py-2 text-[14px] outline-none focus:border-[#1e3a5f]"
                />
              </div>
            )}

            <div>
              <label className="block text-[12px] font-medium text-stone-500 mb-1">Stop date (optional)</label>
              <input
                type="date"
                value={stopDate}
                onChange={e => setStopDate(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-[14px] outline-none focus:border-[#1e3a5f]"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!title.trim()}
          className="w-full bg-[#1e3a5f] text-white rounded-xl py-3 text-[15px] font-semibold disabled:opacity-40 mt-2"
        >
          {task ? 'Save Changes' : 'Add Task'}
        </button>
      </form>
    </BottomSheet>
  )
}

import { useState, type FormEvent } from 'react'
import { type GymWeeklyMetrics } from '../../lib/gymPlan'

interface Props {
  week: string
  metrics?: GymWeeklyMetrics
  onSave: (metrics: GymWeeklyMetrics) => void
}

export function GymWeeklyMetricsForm({ week, metrics, onSave }: Props) {
  const [bodyFat, setBodyFat] = useState(metrics?.bodyFatPct.toString() ?? '')
  const [muscle, setMuscle] = useState(metrics?.musclePct.toString() ?? '')
  const [message, setMessage] = useState('')

  const save = (event: FormEvent) => {
    event.preventDefault()
    const values = [bodyFat, muscle].map(Number)
    if (values.some(value => !Number.isFinite(value) || value <= 0 || value >= 100 || Math.abs(value * 100 - Math.round(value * 100)) > 1e-7)) {
      setMessage('Enter two percentages between 0 and 100, with at most 2 decimal places.')
      return
    }
    onSave({ bodyFatPct: values[0], musclePct: values[1] })
    setMessage('Saved. It will sync when online.')
  }

  return (
    <form onSubmit={save} className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm">
      <h2 className="text-[16px] font-semibold text-stone-900">Weekly body check</h2>
      <p className="text-[12px] text-stone-500 mt-1">Week of {week}. Use the same scale, time, and conditions each week.</p>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <label className="text-[12px] text-stone-600">Body fat %
          <input type="number" inputMode="decimal" min="0.01" max="99.99" step="0.01" value={bodyFat} onChange={event => { setBodyFat(event.target.value); setMessage('') }} required className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-[16px] text-stone-900" />
        </label>
        <label className="text-[12px] text-stone-600">Muscle %
          <input type="number" inputMode="decimal" min="0.01" max="99.99" step="0.01" value={muscle} onChange={event => { setMuscle(event.target.value); setMessage('') }} required className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-[16px] text-stone-900" />
        </label>
      </div>
      <button type="submit" className="mt-3 min-h-10 rounded-xl bg-[#1e3a5f] px-4 text-[13px] font-medium text-white">Save weekly check</button>
      {message && <p role="status" className="mt-2 text-[12px] text-stone-500">{message}</p>}
    </form>
  )
}

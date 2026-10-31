import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { nanoid } from 'nanoid'
import { isGymExercise, type GymExercise } from '../../lib/gym'

interface Props {
  exercise?: GymExercise | null
  onSave: (exercise: GymExercise) => void
  onClose: () => void
}

export function GymExerciseForm({ exercise, onSave, onClose }: Props) {
  const [name, setName] = useState(exercise?.name ?? '')
  const [sets, setSets] = useState(exercise?.sets?.toString() ?? '')
  const [reps, setReps] = useState(exercise?.reps?.toString() ?? '')
  const [weight, setWeight] = useState(exercise?.weightKg?.toString() ?? '')
  const [note, setNote] = useState(exercise?.note ?? '')

  const save = (event: FormEvent) => {
    event.preventDefault()
    const next: GymExercise = {
      id: exercise?.id ?? nanoid(),
      name: name.trim(),
      ...(sets ? { sets: Number(sets) } : {}),
      ...(reps ? { reps: Number(reps) } : {}),
      ...(weight ? { weightKg: Number(weight) } : {}),
      ...(note.trim() ? { note: note.trim() } : {}),
    }
    if (!isGymExercise(next)) return
    onSave(next)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 sheet-overlay flex items-end" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={exercise ? 'Edit exercise' : 'Add exercise'} className="sheet-panel w-full max-w-[480px] mx-auto max-h-[90svh] overflow-y-auto rounded-t-2xl bg-white shadow-xl safe-bottom" onClick={event => event.stopPropagation()}>
        <div className="flex items-center justify-between px-4 pt-4">
          <h2 className="text-[18px] font-semibold text-stone-900">{exercise ? 'Edit exercise' : 'Add exercise'}</h2>
          <button type="button" onClick={onClose} aria-label="Close exercise form" className="p-2 text-stone-500"><X size={20} /></button>
        </div>
        <form onSubmit={save} className="px-4 pb-5 pt-4 space-y-4">
          <label className="block text-[13px] font-medium text-stone-700">Exercise
            <input required maxLength={100} value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Squat, treadmill" className="mt-1 w-full min-h-11 rounded-xl border border-stone-200 px-3 text-[15px] outline-none focus:border-[#1e3a5f]" />
          </label>
          <div className="grid grid-cols-3 gap-2">
            <label className="block text-[13px] font-medium text-stone-700">Sets
              <input type="number" inputMode="numeric" min="1" max="1000" step="1" value={sets} onChange={event => setSets(event.target.value)} placeholder="—" className="mt-1 w-full min-h-11 rounded-xl border border-stone-200 px-3 text-[15px] outline-none focus:border-[#1e3a5f]" />
            </label>
            <label className="block text-[13px] font-medium text-stone-700">Reps
              <input type="number" inputMode="numeric" min="1" max="1000" step="1" value={reps} onChange={event => setReps(event.target.value)} placeholder="—" className="mt-1 w-full min-h-11 rounded-xl border border-stone-200 px-3 text-[15px] outline-none focus:border-[#1e3a5f]" />
            </label>
            <label className="block text-[13px] font-medium text-stone-700">kg
              <input type="number" inputMode="decimal" min="0" max="10000" step="0.1" value={weight} onChange={event => setWeight(event.target.value)} placeholder="—" className="mt-1 w-full min-h-11 rounded-xl border border-stone-200 px-3 text-[15px] outline-none focus:border-[#1e3a5f]" />
            </label>
          </div>
          <p className="text-[12px] text-stone-500">Sets, reps and weight are optional. Add another entry if the weight or reps change.</p>
          <label className="block text-[13px] font-medium text-stone-700">Notes (optional)
            <textarea maxLength={500} rows={3} value={note} onChange={event => setNote(event.target.value)} placeholder="e.g. 20 min, how it felt" className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-[15px] outline-none focus:border-[#1e3a5f]" />
          </label>
          <button type="submit" className="w-full min-h-12 rounded-xl bg-[#1e3a5f] text-white text-[15px] font-semibold">Save exercise</button>
        </form>
      </div>
    </div>
  )
}

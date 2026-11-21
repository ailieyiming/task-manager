import { useEffect, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Dumbbell, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { formatDate, formatDisplay, localToday, parseLocalDate } from '../lib/date'
import { canCheckIn, GYM_END, GYM_START, gymYearStats, isAttendedGymStatus, type GymExercise, type GymStatus } from '../lib/gym'
import { useGymStore } from '../store/gym'
import { refreshGymSync } from '../lib/gymSync'
import { GymExerciseForm } from '../components/gym/GymExerciseForm'
import { GymWeeklyMetricsForm } from '../components/gym/GymWeeklyMetricsForm'
import { GYM_WEEKLY_ITEMS, gymWeekDates, gymWeekStart } from '../lib/gymPlan'

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const choices: { status: GymStatus; label: string; active: string }[] = [
  { status: 'cardio', label: 'Cardio', active: 'bg-[#b48a42] border-[#b48a42] text-white' },
  { status: 'muscle', label: 'Muscle', active: 'bg-[#1a4731] border-[#1a4731] text-white' },
  { status: 'other', label: 'Other', active: 'bg-[#1e3a5f] border-[#1e3a5f] text-white' },
]

const statusLabel = (status: GymStatus | undefined) => status === 'missed' ? "Didn't go" : status ? status[0].toUpperCase() + status.slice(1) : 'Not recorded'
const statusColor = (status: GymStatus | undefined) => status === 'cardio' || status === 'relax' ? 'bg-[#b48a42]' : status === 'muscle' || status === 'full' ? 'bg-[#1a4731]' : status === 'other' ? 'bg-[#1e3a5f]' : 'bg-stone-400'

const monthOf = (date: string) => {
  const parsed = parseLocalDate(date)
  return new Date(parsed.getFullYear(), parsed.getMonth(), 1)
}

export function GymPage() {
  const { checkIns, workouts, weeklyMetrics, weeklyChecklist, hasHydrated, setCheckIn, clearCheckIn, saveExercise, deleteExercise, saveWeeklyMetrics, toggleWeeklyItem } = useGymStore()
  const [today, setToday] = useState(localToday)
  const initialDate = today < GYM_START ? GYM_START : today > GYM_END ? GYM_END : today
  const [month, setMonth] = useState(() => monthOf(initialDate))
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [exerciseFormOpen, setExerciseFormOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<GymExercise | null>(null)

  useEffect(() => {
    const refreshDate = () => {
      if (document.visibilityState === 'visible') setToday(localToday())
    }
    document.addEventListener('visibilitychange', refreshDate)
    return () => document.removeEventListener('visibilitychange', refreshDate)
  }, [])

  const stats = gymYearStats(checkIns, today)
  const attendancePercent = stats.elapsed === 0 ? 0 : Math.round((stats.attended / stats.elapsed) * 100)
  const selectedStatus = checkIns[selectedDate]
  const selectedExercises = workouts[selectedDate] ?? []
  const weekStart = gymWeekStart(today)
  const weekItems = weeklyChecklist[weekStart] ?? []
  const selectedWeekDates = gymWeekDates(selectedDate)
  const selectedIsOpen = canCheckIn(selectedDate, today)
  const firstDayOffset = (month.getDay() + 6) % 7
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const monthKey = formatDate(month).slice(0, 7)
  const previousAllowed = monthKey > GYM_START.slice(0, 7)
  const nextAllowed = monthKey < GYM_END.slice(0, 7)
  const moveMonth = (delta: number) => {
    const next = new Date(month.getFullYear(), month.getMonth() + delta, 1)
    const firstDate = formatDate(next)
    const earliest = firstDate < GYM_START ? GYM_START : firstDate
    const lastDate = formatDate(new Date(next.getFullYear(), next.getMonth() + 1, 0))
    const latest = lastDate > GYM_END ? GYM_END : lastDate
    setMonth(next)
    setSelectedDate(today >= earliest && today <= latest ? today : earliest)
  }

  if (!hasHydrated) {
    return <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="flex-1 overflow-y-auto bg-stone-50">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-stone-100 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-[13px] text-stone-400">5 Oct 2026 – 4 Oct 2027</p>
          <h1 className="text-[18px] font-semibold text-stone-900">Gym</h1>
        </div>
        <button onClick={() => { setToday(localToday()); void refreshGymSync() }} aria-label="Refresh date and gym records" className="w-10 h-10 flex items-center justify-center rounded-full text-[#1e3a5f] hover:bg-stone-100">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="px-4 py-4 space-y-4">
        <section className="rounded-2xl bg-[#1e3a5f] px-5 py-4 text-white shadow-sm" aria-label="Gym days">
          <p className="text-[22px] font-semibold">Gym days: {stats.attended}/{stats.elapsed}</p>
        </section>
        <section className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm">
          <p className="text-[12px] text-stone-400">Daily check-in</p>
          <h2 className="text-[17px] font-semibold text-stone-900 mt-1">{formatDisplay(selectedDate)}</h2>
          <div className="grid grid-cols-7 gap-1 mt-3" aria-label="Select a day this week">
            {selectedWeekDates.map((date, index) => {
              const status = checkIns[date]
              const enabled = canCheckIn(date, today)
              return (
                <button key={date} type="button" disabled={!enabled} onClick={() => { setSelectedDate(date); setMonth(monthOf(date)) }} aria-label={`${formatDisplay(date)}: ${statusLabel(status)}`} aria-pressed={selectedDate === date}
                  className={`min-h-12 rounded-lg border text-center ${selectedDate === date ? 'border-[#1e3a5f] bg-[#edf2f5]' : 'border-stone-100 bg-stone-50'} ${enabled ? '' : 'opacity-30'}`}>
                  <span className="block text-[10px] text-stone-500">{weekdays[index]}</span>
                  <span className="block text-[13px] font-semibold text-stone-900">{parseLocalDate(date).getDate()}</span>
                  {status && <span className={`block mx-auto h-1.5 w-1.5 rounded-full ${statusColor(status)}`} />}
                </button>
              )
            })}
          </div>
          {selectedIsOpen ? (
            <>
              <p className="text-[13px] text-stone-500 mt-2">{selectedStatus ? 'Your choice is saved. You can change it.' : 'How was your gym day?'}</p>
              {selectedStatus && !choices.some(choice => choice.status === selectedStatus) && <p className="mt-1 text-[12px] text-stone-500">Earlier entry: {statusLabel(selectedStatus)}. Choose a new label only if you want to change it.</p>}
              <div className="grid grid-cols-3 gap-2 mt-3">
                {choices.map(({ status, label, active }) => (
                  <button key={status} type="button" onClick={() => setCheckIn(selectedDate, status)} aria-pressed={selectedStatus === status}
                    className={`min-h-12 rounded-xl border text-[13px] font-medium ${selectedStatus === status ? active : 'border-stone-200 bg-white text-stone-600'}`}>{label}</button>
                ))}
              </div>
              {selectedStatus && <button type="button" onClick={() => {
                if (selectedExercises.length > 0 && !confirm('Clear this check-in and all exercise records for this day?')) return
                clearCheckIn(selectedDate)
              }} className="mt-3 text-[12px] text-stone-400">Clear entry</button>}
            </>
          ) : (
            <p className="text-[13px] text-stone-500 mt-2">{selectedDate > today ? 'This day is not here yet.' : 'Check-ins start on 5 October 2026.'}</p>
          )}
        </section>
        <details className="group bg-white rounded-2xl border border-stone-100 p-4 shadow-sm" aria-label="Exercise log">
            <summary className="flex items-center justify-between gap-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <span>
                <span className="block text-[16px] font-semibold text-stone-900">What you did</span>
                <span className="block text-[12px] text-stone-500">{selectedExercises.length} exercise{selectedExercises.length === 1 ? '' : 's'} · {formatDisplay(selectedDate)}</span>
              </span>
              <ChevronDown size={18} className="text-[#1e3a5f] transition-transform group-open:rotate-180" />
            </summary>
            {selectedIsOpen && isAttendedGymStatus(selectedStatus) ? <>
              <button type="button" onClick={() => { setEditingExercise(null); setExerciseFormOpen(true) }} className="mt-3 min-h-10 flex items-center gap-1 rounded-xl bg-[#1e3a5f] px-3 text-[13px] font-medium text-white"><Plus size={16} /> Add exercise</button>
              {selectedExercises.length === 0 ? <p className="mt-3 text-[13px] text-stone-500">Add what you did. You can edit it later.</p> : (
              <div className="mt-3 divide-y divide-stone-100">
                {selectedExercises.map(exercise => (
                  <div key={exercise.id} className="flex items-start gap-2 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-stone-900 break-words">{exercise.name}</p>
                      {(exercise.sets !== undefined || exercise.reps !== undefined || exercise.weightKg !== undefined) && (
                        <p className="text-[12px] text-stone-600 mt-0.5">
                          {[exercise.sets !== undefined ? `${exercise.sets} sets` : null, exercise.reps !== undefined ? `${exercise.reps} reps` : null, exercise.weightKg !== undefined ? `${exercise.weightKg.toFixed(2)} kg` : null].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      {exercise.note && <p className="text-[12px] text-stone-500 mt-1 whitespace-pre-wrap break-words">{exercise.note}</p>}
                    </div>
                    <button type="button" onClick={() => { setEditingExercise(exercise); setExerciseFormOpen(true) }} aria-label={`Edit ${exercise.name}`} className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-stone-500"><Pencil size={16} /></button>
                    <button type="button" onClick={() => { if (confirm(`Remove ${exercise.name}?`)) deleteExercise(selectedDate, exercise.id) }} aria-label={`Remove ${exercise.name}`} className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-stone-400"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
              )}
            </> : <p className="mt-3 text-[13px] text-stone-500">Choose Cardio, Muscle, or Other to add exercises.</p>}
        </details>
        <details className="group bg-white rounded-2xl border border-stone-100 p-4 shadow-sm" aria-label="Weekly training checklist">
          <summary className="flex items-center justify-between gap-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <span className="text-[16px] font-semibold text-stone-900">This week’s plan</span>
            <span className="ml-auto text-[12px] text-stone-500">{GYM_WEEKLY_ITEMS.filter(item => weekItems.includes(item.id)).length}/{GYM_WEEKLY_ITEMS.length}</span>
            <ChevronDown size={18} className="text-[#1e3a5f] transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {GYM_WEEKLY_ITEMS.map(item => (
              <label key={item.id} className="flex min-h-12 items-center gap-2 rounded-xl border border-stone-200 px-2.5 py-2 cursor-pointer">
                <input type="checkbox" checked={weekItems.includes(item.id)} onChange={() => toggleWeeklyItem(weekStart, item.id)} className="h-5 w-5 shrink-0 accent-[#1a4731]" />
                <span className="min-w-0 text-[12px] font-medium leading-4 text-stone-900">
                  {item.title}{'walk' in item && <span className="block font-normal text-stone-500">+ walking</span>}
                </span>
              </label>
            ))}
          </div>
        </details>

        <GymWeeklyMetricsForm key={`${weekStart}-${weeklyMetrics[weekStart]?.bodyFatPct ?? ''}-${weeklyMetrics[weekStart]?.musclePct ?? ''}`} week={weekStart} metrics={weeklyMetrics[weekStart]} onSave={metrics => saveWeeklyMetrics(weekStart, metrics)} />
        {Object.keys(weeklyMetrics).length > 0 && (
          <section className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm">
            <h2 className="text-[15px] font-semibold text-stone-900">Body check history</h2>
            <div className="mt-2 divide-y divide-stone-100">
              {Object.entries(weeklyMetrics).sort(([a], [b]) => b.localeCompare(a)).slice(0, 8).map(([week, metrics]) => (
                <p key={week} className="py-2 text-[12px] text-stone-600">{week} · Body fat {metrics.bodyFatPct}% · Muscle {metrics.musclePct}%</p>
              ))}
            </div>
          </section>
        )}
        <section className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => moveMonth(-1)} disabled={!previousAllowed} aria-label="Previous month" className="w-9 h-9 flex items-center justify-center rounded-full disabled:opacity-25 text-[#1e3a5f]"><ChevronLeft size={20} /></button>
            <h2 className="text-[16px] font-semibold text-stone-900">{month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</h2>
            <button onClick={() => moveMonth(1)} disabled={!nextAllowed} aria-label="Next month" className="w-9 h-9 flex items-center justify-center rounded-full disabled:opacity-25 text-[#1e3a5f]"><ChevronRight size={20} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {weekdays.map(day => <span key={day} className="text-[11px] font-medium text-stone-400">{day}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOffset }, (_, index) => <span key={`empty-${index}`} />)}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const date = formatDate(new Date(month.getFullYear(), month.getMonth(), index + 1))
              const status = checkIns[date]
              const enabled = canCheckIn(date, today)
              const selected = selectedDate === date
              const background = status ? `${statusColor(status)} ${status === 'missed' ? 'text-stone-800' : 'text-white'}` : 'bg-stone-50 text-stone-700'
              return (
                <button
                  key={date}
                  type="button"
                  disabled={!enabled}
                  onClick={() => setSelectedDate(date)}
                  aria-label={`${formatDisplay(date)}: ${statusLabel(status)}`}
                  aria-pressed={selected}
                  className={`h-11 rounded-xl flex flex-col items-center justify-center border-2 ${selected && enabled ? 'border-[#1e3a5f]' : 'border-transparent'} ${background} ${enabled ? '' : 'opacity-25'}`}
                >
                  <span className="text-[14px] font-medium leading-none">{index + 1}</span>
                  {status && <span className="text-[10px] leading-none mt-1">{status === 'missed' ? '–' : status[0].toUpperCase()}</span>}
                </button>
              )
            })}
          </div>
          <p className="mt-4 text-[11px] text-stone-500">M Muscle · C Cardio · O Other. Older Full, Relax, and Didn’t go entries stay unchanged.</p>
        </section>

        <section className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm" aria-label="Gym year summary">
          <div className="flex items-center gap-2"><Dumbbell size={16} className="text-[#1e3a5f]" /><h2 className="text-[16px] font-semibold text-stone-900">Year summary</h2></div>
          <p className="mt-2 text-[13px] text-stone-600">{stats.attended} gym days out of {stats.elapsed} elapsed days</p>
          <div className="h-2 bg-stone-100 rounded-full mt-3 overflow-hidden" role="progressbar" aria-label="Gym days out of elapsed days" aria-valuemin={0} aria-valuemax={stats.elapsed || 1} aria-valuenow={stats.attended}>
            <div className="h-full bg-[#1e3a5f] rounded-full" style={{ width: `${attendancePercent}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div><p className="text-[20px] font-semibold text-[#b48a42]">{stats.cardio}</p><p className="text-[12px] text-stone-500">Cardio</p></div>
            <div><p className="text-[20px] font-semibold text-[#1a4731]">{stats.muscle}</p><p className="text-[12px] text-stone-500">Muscle</p></div>
            <div><p className="text-[20px] font-semibold text-[#1e3a5f]">{stats.other}</p><p className="text-[12px] text-stone-500">Other</p></div>
          </div>
          {(stats.full + stats.relax + stats.missed > 0) && <p className="mt-3 border-t border-stone-100 pt-3 text-[12px] text-stone-500">Earlier records: {stats.full} Full · {stats.relax} Relax · {stats.missed} Didn’t go. Full and Relax count as gym days.</p>}
          <p className="mt-2 text-[12px] text-stone-400">Unrecorded days stay separate from older Didn’t go entries.</p>
        </section>
      </div>
      {exerciseFormOpen && (
        <GymExerciseForm
          exercise={editingExercise}
          onSave={exercise => saveExercise(selectedDate, exercise)}
          onClose={() => { setExerciseFormOpen(false); setEditingExercise(null) }}
        />
      )}
    </div>
  )
}

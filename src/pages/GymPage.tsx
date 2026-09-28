import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Dumbbell, RefreshCw } from 'lucide-react'
import { formatDate, formatDisplay, localToday, parseLocalDate } from '../lib/date'
import { canCheckIn, GYM_END, GYM_START, gymYearStats, type GymStatus } from '../lib/gym'
import { useGymStore } from '../store/gym'

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const choices: { status: GymStatus; label: string; active: string }[] = [
  { status: 'full', label: 'Full', active: 'bg-[#1a4731] border-[#1a4731] text-white' },
  { status: 'relax', label: 'Relax', active: 'bg-[#d8bd82] border-[#d8bd82] text-[#3f3520]' },
  { status: 'missed', label: "Didn't go", active: 'bg-stone-600 border-stone-600 text-white' },
]

const monthOf = (date: string) => {
  const parsed = parseLocalDate(date)
  return new Date(parsed.getFullYear(), parsed.getMonth(), 1)
}

export function GymPage() {
  const { checkIns, hasHydrated, setCheckIn, clearCheckIn } = useGymStore()
  const [today, setToday] = useState(localToday)
  const initialDate = today < GYM_START ? GYM_START : today > GYM_END ? GYM_END : today
  const [month, setMonth] = useState(() => monthOf(initialDate))
  const [selectedDate, setSelectedDate] = useState(initialDate)

  useEffect(() => {
    const refreshDate = () => {
      if (document.visibilityState === 'visible') setToday(localToday())
    }
    document.addEventListener('visibilitychange', refreshDate)
    return () => document.removeEventListener('visibilitychange', refreshDate)
  }, [])

  const stats = gymYearStats(checkIns, today)
  const selectedStatus = checkIns[selectedDate]
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
        <button onClick={() => setToday(localToday())} aria-label="Refresh date" className="w-10 h-10 flex items-center justify-center rounded-full text-[#1e3a5f] hover:bg-stone-100">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="px-4 py-4 space-y-4">
        <section className="rounded-2xl bg-[#1e3a5f] text-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-[13px] text-white/75"><Dumbbell size={16} /> One year of movement</div>
          <p className="text-[23px] font-semibold mt-2">{stats.finished ? 'Your year in review' : today < GYM_START ? 'Starts 5 October' : `Day ${stats.elapsed} of ${stats.total}`}</p>
          <div className="h-2 bg-white/20 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-[#d8bd82] rounded-full" style={{ width: `${Math.round((stats.elapsed / stats.total) * 100)}%` }} />
          </div>
          <p className="text-[12px] text-white/70 mt-2">{stats.recorded} days recorded · {stats.unrecorded} past days unrecorded</p>
        </section>

        <section className="grid grid-cols-3 gap-2" aria-label="Gym year totals">
          <div className="bg-white rounded-2xl border border-stone-100 p-3 text-center">
            <p className="text-[24px] font-semibold text-[#1a4731]">{stats.full}</p><p className="text-[12px] text-stone-500">Full</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 p-3 text-center">
            <p className="text-[24px] font-semibold text-[#8b6b2e]">{stats.relax}</p><p className="text-[12px] text-stone-500">Relax</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 p-3 text-center">
            <p className="text-[24px] font-semibold text-stone-600">{stats.missed}</p><p className="text-[12px] text-stone-500">Didn't go</p>
          </div>
        </section>

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
              const background = status === 'full' ? 'bg-[#1a4731] text-white'
                : status === 'relax' ? 'bg-[#d8bd82] text-[#3f3520]'
                  : status === 'missed' ? 'bg-stone-300 text-stone-700'
                    : 'bg-stone-50 text-stone-700'
              return (
                <button
                  key={date}
                  type="button"
                  disabled={!enabled}
                  onClick={() => setSelectedDate(date)}
                  aria-label={`${formatDisplay(date)}: ${status === 'missed' ? "Didn't go" : status ?? 'Not recorded'}`}
                  aria-pressed={selected}
                  className={`h-11 rounded-xl flex flex-col items-center justify-center border-2 ${selected && enabled ? 'border-[#1e3a5f]' : 'border-transparent'} ${background} ${enabled ? '' : 'opacity-25'}`}
                >
                  <span className="text-[14px] font-medium leading-none">{index + 1}</span>
                  {status && <span className="text-[10px] leading-none mt-1">{status === 'full' ? '●' : status === 'relax' ? '◐' : '–'}</span>}
                </button>
              )
            })}
          </div>
          <div className="flex gap-3 mt-4 text-[11px] text-stone-500">
            <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-[#1a4731] mr-1" />Full</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-[#d8bd82] mr-1" />Relax</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-stone-300 mr-1" />Didn't go</span>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm">
          <p className="text-[12px] text-stone-400">Daily check-in</p>
          <h2 className="text-[17px] font-semibold text-stone-900 mt-1">{formatDisplay(selectedDate)}</h2>
          {selectedIsOpen ? (
            <>
              <p className="text-[13px] text-stone-500 mt-1">{selectedStatus ? 'Your choice is saved. You can change it.' : 'How was your gym day?'}</p>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {choices.map(({ status, label, active }) => (
                  <button key={status} type="button" onClick={() => setCheckIn(selectedDate, status)} aria-pressed={selectedStatus === status}
                    className={`min-h-12 rounded-xl border text-[13px] font-medium ${selectedStatus === status ? active : 'border-stone-200 bg-white text-stone-600'}`}>{label}</button>
                ))}
              </div>
              {selectedStatus && <button type="button" onClick={() => clearCheckIn(selectedDate)} className="mt-3 text-[12px] text-stone-400">Clear entry</button>}
            </>
          ) : (
            <p className="text-[13px] text-stone-500 mt-2">{selectedDate > today ? 'This day is not here yet.' : 'Check-ins start on 5 October 2026.'}</p>
          )}
        </section>
        <p className="text-[12px] text-stone-400 px-1 pb-4">Unrecorded days stay separate from “Didn't go” in your year-end totals.</p>
      </div>
    </div>
  )
}

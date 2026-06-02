import { useState, useCallback, useMemo } from 'react'
import { RefreshCw } from 'lucide-react'
import { useTasksStore } from '../store/tasks'
import { useTargetsStore } from '../store/targets'
import { localToday, isPast, daysUntil } from '../lib/date'
import { isTaskDueToday, isCompleted } from '../lib/recurrence'

export function SummaryPage() {
  const { cumulativeCompleted, tasks, overrides, hasHydrated } = useTasksStore()
  const { targets } = useTargetsStore()
  const [today, setToday] = useState(() => localToday())
  const [spinning, setSpinning] = useState(false)

  const refresh = useCallback(() => {
    setSpinning(true)
    setToday(localToday())
    setTimeout(() => setSpinning(false), 600)
  }, [])

  const todaysTasks = useMemo(() =>
    tasks.filter(t => isTaskDueToday(t, overrides, today)),
    [tasks, overrides, today]
  )
  const completedToday = todaysTasks.filter(t => isCompleted(t, overrides, today)).length
  const remainingToday = todaysTasks.length - completedToday
  const pct = todaysTasks.length > 0 ? Math.round((completedToday / todaysTasks.length) * 100) : 0

  if (!hasHydrated) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const totalCompleted = Object.values(cumulativeCompleted).reduce((a, b) => a + b, 0)
  const hasAnyData = totalCompleted > 0

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-stone-100 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-stone-400">All time</p>
            <p className="text-[15px] font-semibold text-stone-900">Summary</p>
          </div>
          <button
            onClick={refresh}
            className="w-9 h-9 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={17} className={spinning ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {!hasAnyData ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-[16px] font-semibold text-stone-700 mb-1">No completions yet</p>
            <p className="text-[13px] text-stone-400">Complete tasks to see your summary</p>
          </div>
        ) : (
          <>
            {/* Grand total */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 text-center">
              <p className="text-[48px] font-bold text-[#1e3a5f] leading-none">{totalCompleted}</p>
              <p className="text-[13px] text-stone-400 mt-1">tasks completed to date</p>
            </div>

            {/* Per target */}
            {targets.length > 0 && (
              <div>
                <p className="text-[12px] font-medium text-stone-400 uppercase tracking-wide mb-2">By Target</p>
                <div className="space-y-2">
                  {targets.map(target => {
                    const count = cumulativeCompleted[target.id] ?? 0
                    const overdue = isPast(target.deadline)
                    const days = daysUntil(target.deadline)
                    const alert = overdue

                    return (
                      <div
                        key={target.id}
                        className={`bg-white rounded-xl px-4 py-3 border shadow-sm flex items-center justify-between ${
                          alert ? 'border-red-200 bg-red-50' : 'border-stone-100'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className={`text-[14px] font-semibold truncate ${alert ? 'text-red-700' : 'text-stone-800'}`}>
                            {target.title}{alert ? ' ⚠' : ''}
                          </p>
                          <p className="text-[12px] text-stone-400 mt-0.5">
                            {overdue ? 'Overdue' : days === 0 ? 'Due today' : `${days} days left`}
                          </p>
                        </div>
                        <div className="ml-4 text-right flex-shrink-0">
                          <p className="text-[28px] font-bold text-[#1e3a5f] leading-none">{count}</p>
                          <p className="text-[11px] text-stone-400">completed</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Standalone (no target) */}
            {(cumulativeCompleted['_standalone'] ?? 0) > 0 && (
              <div>
                <p className="text-[12px] font-medium text-stone-400 uppercase tracking-wide mb-2">Other</p>
                <div className="bg-white rounded-xl px-4 py-3 border border-stone-100 shadow-sm flex items-center justify-between">
                  <p className="text-[14px] font-semibold text-stone-800">No target</p>
                  <div className="text-right">
                    <p className="text-[28px] font-bold text-[#1e3a5f] leading-none">{cumulativeCompleted['_standalone']}</p>
                    <p className="text-[11px] text-stone-400">completed</p>
                  </div>
                </div>
              </div>
            )}

            {/* Today's progress */}
            <div>
              <p className="text-[12px] font-medium text-stone-400 uppercase tracking-wide mb-2">Today</p>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <p className="text-[28px] font-bold text-stone-900">{todaysTasks.length}</p>
                    <p className="text-[11px] text-stone-400 uppercase tracking-wide">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[28px] font-bold text-[#1a4731]">{completedToday}</p>
                    <p className="text-[11px] text-stone-400 uppercase tracking-wide">Done</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[28px] font-bold text-stone-500">{remainingToday}</p>
                    <p className="text-[11px] text-stone-400 uppercase tracking-wide">Left</p>
                  </div>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1a4731] rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-center text-[13px] text-stone-500 mt-2">{pct}% complete</p>
              </div>
            </div>
          </>
        )}

        {/* Show today's progress even with no cumulative data */}
        {!hasAnyData && todaysTasks.length > 0 && (
          <div>
            <p className="text-[12px] font-medium text-stone-400 uppercase tracking-wide mb-2">Today</p>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <p className="text-[28px] font-bold text-stone-900">{todaysTasks.length}</p>
                  <p className="text-[11px] text-stone-400 uppercase tracking-wide">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-[28px] font-bold text-[#1a4731]">{completedToday}</p>
                  <p className="text-[11px] text-stone-400 uppercase tracking-wide">Done</p>
                </div>
                <div className="text-center">
                  <p className="text-[28px] font-bold text-stone-500">{remainingToday}</p>
                  <p className="text-[11px] text-stone-400 uppercase tracking-wide">Left</p>
                </div>
              </div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1a4731] rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-center text-[13px] text-stone-500 mt-2">{pct}% complete</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

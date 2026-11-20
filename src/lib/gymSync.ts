import { get as idbGet, set as idbSet } from 'idb-keyval'
import { useGymStore } from '../store/gym'
import { isGymDate, isGymStatus, parseGymExercises, type GymCheckIns, type GymWorkouts } from './gym'
import { supabase } from './supabase'
import { isGymWeeklyMetrics, type GymWeeklyMetrics } from './gymPlan'

const IMPORTED_KEY = 'task-manager-gym-shared-imported'
let currentController: GymSyncController | null = null

class GymSyncController {
  private stopped = false
  private busy = false
  private timer: ReturnType<typeof setTimeout> | null = null
  private interval: ReturnType<typeof setInterval> | null = null
  private unsubscribe: (() => void) | null = null

  private async readRemote(): Promise<{ checkIns: GymCheckIns; workouts: GymWorkouts }> {
    if (!supabase) throw new Error('Supabase is not configured.')
    const { data, error } = await supabase.from('gym_checkins').select('day, status, exercises')
    if (error) throw error
    const checkIns: GymCheckIns = {}
    const workouts: GymWorkouts = {}
    for (const row of data ?? []) {
      if (!isGymDate(row.day) || !isGymStatus(row.status)) throw new Error('Invalid gym record in cloud.')
      checkIns[row.day] = row.status
      const exercises = parseGymExercises(row.exercises)
      if (exercises.length) workouts[row.day] = exercises
    }
    return { checkIns, workouts }
  }

  private async flushPending() {
    if (!supabase) throw new Error('Supabase is not configured.')
    for (const [day, record] of Object.entries(useGymStore.getState().pending)) {
      const result = record === null
        ? await supabase.from('gym_checkins').delete().eq('day', day)
        : await supabase.from('gym_checkins').upsert({ day, status: record.status, exercises: record.exercises, updated_at: new Date().toISOString() }, { onConflict: 'day' })
      if (result.error) throw result.error
      useGymStore.getState().clearPending(day, record)
    }
    for (const [week, metrics] of Object.entries(useGymStore.getState().pendingMetrics)) {
      const { error } = await supabase.from('gym_weekly_metrics').upsert({
        week_start: week,
        body_fat_pct: metrics.bodyFatPct,
        muscle_pct: metrics.musclePct,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'week_start' })
      if (error) throw error
      useGymStore.getState().clearPendingMetrics(week, metrics)
    }
  }

  private async readRemoteMetrics(): Promise<Record<string, GymWeeklyMetrics>> {
    if (!supabase) throw new Error('Supabase is not configured.')
    const { data, error } = await supabase.from('gym_weekly_metrics').select('week_start, body_fat_pct, muscle_pct')
    if (error) throw error
    const metrics: Record<string, GymWeeklyMetrics> = {}
    for (const row of data ?? []) {
      const record = { bodyFatPct: Number(row.body_fat_pct), musclePct: Number(row.muscle_pct) }
      if (typeof row.week_start !== 'string' || !isGymWeeklyMetrics(record)) throw new Error('Invalid weekly gym metrics in cloud.')
      metrics[row.week_start] = record
    }
    return metrics
  }

  async refresh() {
    if (this.stopped || this.busy) return
    this.busy = true
    try {
      const imported = await idbGet<boolean>(IMPORTED_KEY) === true
      if (!imported) {
        const remote = await this.readRemote()
        useGymStore.getState().queueLocalOnly(remote)
      }
      await this.flushPending()
      const remote = await this.readRemote()
      const remoteMetrics = await this.readRemoteMetrics()
      if (this.stopped) return
      useGymStore.getState().applyRemote(remote)
      useGymStore.getState().applyRemoteMetrics(remoteMetrics)
      if (!imported) await idbSet(IMPORTED_KEY, true)
      useGymStore.getState().setSyncMode('synced')
    } catch {
      if (!this.stopped) useGymStore.getState().setSyncMode('offline')
    } finally {
      this.busy = false
      if (!this.stopped && (Object.keys(useGymStore.getState().pending).length > 0 || Object.keys(useGymStore.getState().pendingMetrics).length > 0)) this.queueRefresh(5000)
    }
  }

  private queueRefresh(delay = 600) {
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => { void this.refresh() }, delay)
  }

  private onVisible = () => {
    if (document.visibilityState === 'visible') void this.refresh()
  }

  start() {
    let previousPending = useGymStore.getState().pending
    let previousPendingMetrics = useGymStore.getState().pendingMetrics
    this.unsubscribe = useGymStore.subscribe((state) => {
      if (state.pending !== previousPending || state.pendingMetrics !== previousPendingMetrics) {
        previousPending = state.pending
        previousPendingMetrics = state.pendingMetrics
        if (Object.keys(state.pending).length > 0 || Object.keys(state.pendingMetrics).length > 0) this.queueRefresh()
      }
    })
    this.interval = setInterval(() => { void this.refresh() }, 60_000)
    document.addEventListener('visibilitychange', this.onVisible)
    window.addEventListener('online', this.onVisible)
    void this.refresh()
  }

  stop() {
    this.stopped = true
    if (this.timer) clearTimeout(this.timer)
    if (this.interval) clearInterval(this.interval)
    this.unsubscribe?.()
    document.removeEventListener('visibilitychange', this.onVisible)
    window.removeEventListener('online', this.onVisible)
  }
}

export function startGymSync(): () => void {
  currentController?.stop()
  const controller = new GymSyncController()
  currentController = controller
  controller.start()
  return () => {
    controller.stop()
    if (currentController === controller) currentController = null
  }
}

export function refreshGymSync() {
  return currentController?.refresh()
}

import { get as idbGet, set as idbSet } from 'idb-keyval'
import { useGymStore } from '../store/gym'
import { isGymDate, isGymStatus, type GymCheckIns, type GymStatus } from './gym'
import { supabase } from './supabase'

const IMPORTED_KEY = 'task-manager-gym-shared-imported'
let currentController: GymSyncController | null = null

class GymSyncController {
  private stopped = false
  private busy = false
  private timer: ReturnType<typeof setTimeout> | null = null
  private interval: ReturnType<typeof setInterval> | null = null
  private unsubscribe: (() => void) | null = null

  private async readRemote(): Promise<GymCheckIns> {
    if (!supabase) throw new Error('Supabase is not configured.')
    const { data, error } = await supabase.from('gym_checkins').select('day, status')
    if (error) throw error
    const checkIns: GymCheckIns = {}
    for (const row of data ?? []) {
      if (!isGymDate(row.day) || !isGymStatus(row.status)) throw new Error('Invalid gym record in cloud.')
      checkIns[row.day] = row.status
    }
    return checkIns
  }

  private async flushPending() {
    if (!supabase) throw new Error('Supabase is not configured.')
    for (const [day, status] of Object.entries(useGymStore.getState().pending)) {
      const result = status === null
        ? await supabase.from('gym_checkins').delete().eq('day', day)
        : await supabase.from('gym_checkins').upsert({ day, status, updated_at: new Date().toISOString() }, { onConflict: 'day' })
      if (result.error) throw result.error
      useGymStore.getState().clearPending(day, status as GymStatus | null)
    }
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
      if (this.stopped) return
      useGymStore.getState().applyRemote(remote)
      if (!imported) await idbSet(IMPORTED_KEY, true)
      useGymStore.getState().setSyncMode('synced')
    } catch {
      if (!this.stopped) useGymStore.getState().setSyncMode('offline')
    } finally {
      this.busy = false
      if (!this.stopped && Object.keys(useGymStore.getState().pending).length > 0) this.queueRefresh(5000)
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
    this.unsubscribe = useGymStore.subscribe((state) => {
      if (state.pending !== previousPending) {
        previousPending = state.pending
        if (Object.keys(state.pending).length > 0) this.queueRefresh()
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

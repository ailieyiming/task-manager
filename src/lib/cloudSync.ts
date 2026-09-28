import { get as idbGet, set as idbSet } from 'idb-keyval'
import { useTasksStore } from '../store/tasks'
import { useTargetsStore } from '../store/targets'
import { useQuotesStore } from '../store/quotes'
import { useCloudStore } from '../store/cloud'
import { supabase } from './supabase'
import { hasRecords, stableStringify, type AppData } from './cloudData'

interface CloudRow {
  data: AppData
  revision: number
  updated_at: string
}

interface SyncMarker {
  userId: string
  revision: number
  snapshot: string
}

const MARKER_KEY = 'task-manager-cloud-marker'
let currentController: SyncController | null = null

function snapshot(): AppData {
  const tasks = useTasksStore.getState()
  const targets = useTargetsStore.getState()
  const quotes = useQuotesStore.getState()
  return {
    tasks: tasks.tasks,
    overrides: tasks.overrides,
    orderedTaskIds: tasks.orderedTaskIds,
    cumulativeCompleted: tasks.cumulativeCompleted,
    targets: targets.targets,
    orderedTargetIds: targets.orderedTargetIds,
    keptIds: quotes.keptIds,
    rejectedIds: quotes.rejectedIds,
    decidedOn: quotes.decidedOn,
  }
}

function validData(value: unknown): value is AppData {
  if (!value || typeof value !== 'object') return false
  const data = value as Partial<AppData>
  return Array.isArray(data.tasks) && Array.isArray(data.overrides) &&
    Array.isArray(data.orderedTaskIds) &&
    !!data.cumulativeCompleted && typeof data.cumulativeCompleted === 'object' &&
    Array.isArray(data.targets) && Array.isArray(data.orderedTargetIds) &&
    Array.isArray(data.keptIds) && Array.isArray(data.rejectedIds) &&
    (data.decidedOn === null || typeof data.decidedOn === 'string')
}

async function applyCloud(data: AppData) {
  useTasksStore.setState({
    tasks: data.tasks,
    overrides: data.overrides,
    orderedTaskIds: data.orderedTaskIds,
    cumulativeCompleted: data.cumulativeCompleted,
  })
  useTargetsStore.setState({ targets: data.targets, orderedTargetIds: data.orderedTargetIds })
  useQuotesStore.setState({ keptIds: data.keptIds, rejectedIds: data.rejectedIds, decidedOn: data.decidedOn })

  // Explicitly finish the local cache writes before recording a synced revision.
  await idbSet('task-manager-tasks', JSON.stringify({ state: {
    ...useTasksStore.getState(),
    tasks: data.tasks,
    overrides: data.overrides,
    orderedTaskIds: data.orderedTaskIds,
    cumulativeCompleted: data.cumulativeCompleted,
  }, version: 0 }))
  await idbSet('task-manager-targets', JSON.stringify({ state: {
    ...useTargetsStore.getState(),
    targets: data.targets,
    orderedTargetIds: data.orderedTargetIds,
  }, version: 0 }))
  await idbSet('task-manager-quotes', JSON.stringify({ state: {
    keptIds: data.keptIds,
    rejectedIds: data.rejectedIds,
    decidedOn: data.decidedOn,
  }, version: 0 }))
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Cloud sync failed. Your data remains on this device.'
}

class SyncController {
  private userId: string
  private stopped = false
  private applying = false
  private busy = false
  private timer: ReturnType<typeof setTimeout> | null = null
  private interval: ReturnType<typeof setInterval> | null = null
  private unsubscribers: Array<() => void> = []
  private marker: SyncMarker | null = null
  private remote: CloudRow | null = null

  constructor(userId: string) { this.userId = userId }

  private status(mode: 'connecting' | 'synced' | 'offline' | 'conflict', message: string | null = null) {
    if (!this.stopped) useCloudStore.getState().setStatus({ mode, message })
  }

  private async readRemote(): Promise<CloudRow | null> {
    if (!supabase) throw new Error('Supabase is not configured.')
    const { data, error } = await supabase.from('app_state')
      .select('data, revision, updated_at')
      .eq('user_id', this.userId)
      .maybeSingle()
    if (error) throw error
    if (data && !validData(data.data)) throw new Error('Cloud data has an unexpected format. Nothing was replaced.')
    return data as CloudRow | null
  }

  private async remember(data: AppData, row: CloudRow) {
    this.remote = row
    this.marker = { userId: this.userId, revision: row.revision, snapshot: stableStringify(data) }
    await idbSet(MARKER_KEY, this.marker)
    if (!this.stopped) useCloudStore.getState().setStatus({
      mode: 'synced', message: null, lastSynced: row.updated_at,
    })
  }

  private async insert(data: AppData) {
    if (!supabase) return
    const { data: inserted, error } = await supabase.from('app_state')
      .insert({ user_id: this.userId, data, revision: 1 })
      .select('data, revision, updated_at').single()
    if (error) throw error
    await this.remember(data, inserted as CloudRow)
  }

  private async update(data: AppData, expectedRevision: number) {
    if (!supabase) return
    const { data: updated, error } = await supabase.from('app_state')
      .update({ data, revision: expectedRevision + 1, updated_at: new Date().toISOString() })
      .eq('user_id', this.userId).eq('revision', expectedRevision)
      .select('data, revision, updated_at').maybeSingle()
    if (error) throw error
    if (!updated) {
      this.remote = await this.readRemote()
      this.status('conflict', 'Cloud data changed on another device. Choose which copy to keep.')
      return
    }
    await this.remember(data, updated as CloudRow)
  }

  private watch() {
    if (this.unsubscribers.length) return
    const onChange = () => {
      if (this.applying || this.stopped || useCloudStore.getState().mode === 'conflict') return
      if (this.timer) clearTimeout(this.timer)
      this.timer = setTimeout(() => { void this.refresh() }, 600)
    }
    this.unsubscribers = [
      useTasksStore.subscribe(onChange),
      useTargetsStore.subscribe(onChange),
      useQuotesStore.subscribe(onChange),
    ]
    this.interval = setInterval(() => { void this.refresh() }, 60_000)
    document.addEventListener('visibilitychange', this.onVisible)
  }

  private onVisible = () => {
    if (document.visibilityState === 'visible') void this.refresh()
  }

  async start() {
    this.status('connecting')
    try {
      const saved = await idbGet<SyncMarker>(MARKER_KEY)
      this.marker = saved?.userId && typeof saved.snapshot === 'string' ? saved : null
      this.remote = await this.readRemote()
      if (this.stopped) return

      const local = snapshot()
      const localText = stableStringify(local)
      if (this.marker && this.marker.userId !== this.userId) {
        this.status('conflict', 'This device has data from another cloud account. Choose which copy to keep.')
      } else if (!this.remote) {
        if (this.marker) {
          this.status('conflict', 'Cloud data is missing. Nothing was replaced.')
        } else if (hasRecords(local)) {
          await this.insert(local)
        } else {
          // Confirmation links may open in Safari instead of the installed PWA.
          // Do not create an empty row that would conflict with the phone's data.
          this.status('synced', 'Connected. Your first change will be saved to Supabase.')
        }
      } else if (this.marker?.userId === this.userId) {
        if (localText !== this.marker.snapshot && this.remote.revision !== this.marker.revision) {
          this.status('conflict', 'Both this device and the cloud changed. Choose which copy to keep.')
        } else if (localText !== this.marker.snapshot) {
          await this.update(local, this.marker.revision)
        } else if (this.remote.revision !== this.marker.revision) {
          this.applying = true
          await applyCloud(this.remote.data)
          this.applying = false
          await this.remember(this.remote.data, this.remote)
        } else {
          await this.remember(local, this.remote)
        }
      } else if (hasRecords(local)) {
        this.status('conflict', 'This device and the cloud both contain data. Choose which copy to keep.')
      } else {
        this.applying = true
        await applyCloud(this.remote.data)
        this.applying = false
        await this.remember(this.remote.data, this.remote)
      }
      if (!this.stopped) {
        this.watch()
        if (this.marker && stableStringify(snapshot()) !== this.marker.snapshot &&
            useCloudStore.getState().mode === 'synced') this.queueRefresh()
      }
    } catch (error) {
      this.applying = false
      this.status('offline', errorMessage(error))
      if (!this.stopped) this.watch()
    }
  }

  async refresh() {
    if (this.stopped || this.busy || useCloudStore.getState().mode === 'conflict') return
    this.busy = true
    try {
      const local = snapshot()
      const localText = stableStringify(local)
      if (!this.marker) {
        await this.start()
      } else if (localText !== this.marker.snapshot) {
        await this.update(local, this.marker.revision)
      } else {
        const remote = await this.readRemote()
        if (!remote) {
          this.status('conflict', 'Cloud data is missing. Nothing was replaced.')
        } else if (remote.revision !== this.marker.revision) {
          this.applying = true
          await applyCloud(remote.data)
          this.applying = false
          await this.remember(remote.data, remote)
        } else {
          this.status('synced')
        }
      }
    } catch (error) {
      this.applying = false
      this.status('offline', errorMessage(error))
    } finally {
      this.busy = false
      if (this.marker && stableStringify(snapshot()) !== this.marker.snapshot &&
          useCloudStore.getState().mode === 'synced') this.queueRefresh()
    }
  }

  private queueRefresh() {
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => { void this.refresh() }, 600)
  }

  async resolve(choice: 'cloud' | 'device') {
    if (this.stopped || useCloudStore.getState().mode !== 'conflict') return
    this.status('connecting')
    try {
      this.remote = await this.readRemote()
      if (choice === 'cloud') {
        const data = this.remote?.data ?? {
          tasks: [], overrides: [], orderedTaskIds: [], cumulativeCompleted: {},
          targets: [], orderedTargetIds: [], keptIds: [], rejectedIds: [], decidedOn: null,
        }
        this.applying = true
        await applyCloud(data)
        this.applying = false
        if (this.remote) await this.remember(data, this.remote)
        else await this.insert(data)
      } else if (this.remote) {
        await this.update(snapshot(), this.remote.revision)
      } else {
        await this.insert(snapshot())
      }
    } catch (error) {
      this.applying = false
      this.status('offline', errorMessage(error))
    }
  }

  stop() {
    this.stopped = true
    if (this.timer) clearTimeout(this.timer)
    if (this.interval) clearInterval(this.interval)
    this.unsubscribers.forEach(unsubscribe => unsubscribe())
    document.removeEventListener('visibilitychange', this.onVisible)
  }
}

export function startCloudSync(userId: string): () => void {
  currentController?.stop()
  const controller = new SyncController(userId)
  currentController = controller
  void controller.start()
  return () => {
    controller.stop()
    if (currentController === controller) currentController = null
  }
}

export function refreshCloud() {
  return currentController?.refresh()
}

export function resolveCloudConflict(choice: 'cloud' | 'device') {
  return currentController?.resolve(choice)
}

export function downloadLocalBackup() {
  const blob = new Blob([JSON.stringify(snapshot(), null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `task-manager-backup-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

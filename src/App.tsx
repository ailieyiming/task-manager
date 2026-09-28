import { useEffect } from 'react'
import { useAppStore } from './store/app'
import { useTasksStore } from './store/tasks'
import { TabBar } from './components/layout/TabBar'
import { TasksPage } from './pages/TasksPage'
import { TargetsPage } from './pages/TargetsPage'
import { SummaryPage } from './pages/SummaryPage'
import { CloudPage } from './pages/CloudPage'
import { useTargetsStore } from './store/targets'
import { useQuotesStore } from './store/quotes'
import { useCloudStore } from './store/cloud'
import { supabase } from './lib/supabase'
import { startCloudSync } from './lib/cloudSync'

function App() {
  const { activeTab } = useAppStore()
  const { purgeOldCompleted } = useTasksStore()
  const tasksHydrated = useTasksStore(s => s.hasHydrated)
  const targetsHydrated = useTargetsStore(s => s.hasHydrated)
  const quotesHydrated = useQuotesStore(s => s.hasHydrated)
  const userId = useCloudStore(s => s.userId)
  const cloudMode = useCloudStore(s => s.mode)

  useEffect(() => {
    if (!supabase) return
    const client = supabase
    const updateSession = (user: { id: string; email?: string } | null) => {
      useCloudStore.getState().setStatus({
        userId: user?.id ?? null,
        email: user?.email ?? null,
        ...(!user ? { mode: 'local' as const, message: null } : {}),
      })
    }
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      updateSession(session?.user ?? null)
    })
    void client.auth.getSession()
      .then(({ data, error }) => {
        if (error) throw error
        updateSession(data.session?.user ?? null)
      })
      .catch(() => useCloudStore.getState().setStatus({ mode: 'offline', message: 'Could not check your cloud session.' }))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!userId || !tasksHydrated || !targetsHydrated || !quotesHydrated) return
    return startCloudSync(userId)
  }, [userId, tasksHydrated, targetsHydrated, quotesHydrated])

  // Re-run purge whenever the user returns to the app (tab/PWA visibility)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') purgeOldCompleted()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [purgeOldCompleted])

  return (
    <div className="flex flex-col h-svh">
      <main className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'tasks' && <TasksPage />}
        {activeTab === 'targets' && <TargetsPage />}
        {activeTab === 'summary' && <SummaryPage />}
        {activeTab === 'cloud' && <CloudPage />}
      </main>
      <TabBar />
      {userId && cloudMode === 'connecting' && (
        <div className="fixed inset-0 z-40 bg-white/75 flex items-center justify-center" role="status" aria-live="polite">
          <div className="bg-white border border-stone-100 rounded-2xl px-6 py-5 shadow-lg text-[14px] text-[#1e3a5f]">
            Connecting your data…
          </div>
        </div>
      )}
    </div>
  )
}

export default App

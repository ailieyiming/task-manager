import { useEffect } from 'react'
import { useAppStore } from './store/app'
import { useTasksStore } from './store/tasks'
import { TabBar } from './components/layout/TabBar'
import { TasksPage } from './pages/TasksPage'
import { TargetsPage } from './pages/TargetsPage'
import { SummaryPage } from './pages/SummaryPage'

function App() {
  const { activeTab } = useAppStore()
  const { purgeOldCompleted } = useTasksStore()

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
      </main>
      <TabBar />
    </div>
  )
}

export default App

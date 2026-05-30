import { useAppStore } from './store/app'
import { TabBar } from './components/layout/TabBar'
import { TasksPage } from './pages/TasksPage'
import { TargetsPage } from './pages/TargetsPage'
import { SummaryPage } from './pages/SummaryPage'

function App() {
  const { activeTab } = useAppStore()

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

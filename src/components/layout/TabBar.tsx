import { CheckSquare, Target, BarChart2 } from 'lucide-react'
import { useAppStore } from '../../store/app'

type Tab = 'tasks' | 'targets' | 'summary'

const tabs: { id: Tab; label: string; Icon: typeof CheckSquare }[] = [
  { id: 'tasks', label: 'Tasks', Icon: CheckSquare },
  { id: 'targets', label: 'Targets', Icon: Target },
  { id: 'summary', label: 'Summary', Icon: BarChart2 },
]

export function TabBar() {
  const { activeTab, setTab } = useAppStore()

  return (
    <div className="safe-bottom bg-white border-t border-stone-200 flex">
      {tabs.map(({ id, label, Icon }) => {
        const active = activeTab === id
        return (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors ${
              active ? 'text-[#1e3a5f]' : 'text-stone-400'
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2 : 1.5} />
            <span className="text-[11px] font-medium">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

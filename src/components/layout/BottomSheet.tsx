import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface Props {
  title: string
  onClose: () => void
  children: React.ReactNode
}

export function BottomSheet({ title, onClose, children }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      ref={overlayRef}
      className="sheet-overlay fixed inset-0 bg-black/40 z-50 flex items-end"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="sheet-panel w-full max-w-480 mx-auto bg-white rounded-t-2xl max-h-[90svh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-4 border-b border-stone-100">
          <h2 className="text-[17px] font-semibold text-stone-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-4 py-4 pb-8">{children}</div>
      </div>
    </div>
  )
}

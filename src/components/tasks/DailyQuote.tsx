import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { quoteForDate, quotes } from '../../lib/quotes'
import { useQuotesStore } from '../../store/quotes'

interface Props {
  date: string
}

export function DailyQuote({ date }: Props) {
  const { keptIds, rejectedIds, hasHydrated, keepQuote, rejectQuote } = useQuotesStore()
  const [showSaved, setShowSaved] = useState(false)

  if (!hasHydrated) {
    return <div className="h-28 rounded-2xl bg-[#1e3a5f]/5 animate-pulse" aria-label="Loading today's quote" />
  }

  const quote = quoteForDate(date, rejectedIds)
  const isKept = quote ? keptIds.includes(quote.id) : false

  return (
    <>
      <section className="rounded-2xl border border-[#1e3a5f]/10 bg-[#1e3a5f]/5 px-4 py-3.5" aria-label="Today's manifestation">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1e3a5f]/65">Today's manifestation</p>
          {keptIds.length > 0 && (
            <button
              type="button"
              onClick={() => setShowSaved(true)}
              className="text-[12px] font-medium text-[#1e3a5f] underline underline-offset-2"
            >
              Kept ({keptIds.length})
            </button>
          )}
        </div>

        {quote ? (
          <>
            <p className="text-[15px] leading-snug font-medium text-[#1e3a5f]">“{quote.text}”</p>
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => keepQuote(quote.id)}
                aria-label={isKept ? 'Quote kept' : 'Keep this quote'}
                aria-pressed={isKept}
                className={`min-h-10 flex-1 flex items-center justify-center gap-1.5 rounded-xl border text-[13px] font-medium ${
                  isKept ? 'bg-[#1e3a5f] border-[#1e3a5f] text-white' : 'bg-white border-[#1e3a5f]/20 text-[#1e3a5f]'
                }`}
              >
                <Check size={16} /> {isKept ? 'Kept' : 'Keep'}
              </button>
              <button
                type="button"
                onClick={() => rejectQuote(quote.id)}
                aria-label="Remove this quote"
                className="min-h-10 flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white text-stone-600 text-[13px] font-medium"
              >
                <X size={16} /> Remove
              </button>
            </div>
          </>
        ) : (
          <p className="text-[13px] leading-relaxed text-stone-600">You've removed all 100 quotes.</p>
        )}
      </section>

      {showSaved && (
        <div className="fixed inset-0 z-50 bg-black/40 sheet-overlay flex items-end" onClick={() => setShowSaved(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Kept quotes"
            className="sheet-panel w-full max-w-[480px] mx-auto max-h-[75svh] flex flex-col rounded-t-2xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-stone-100">
              <h2 className="text-[17px] font-semibold text-stone-900">Kept quotes ({keptIds.length})</h2>
              <button type="button" onClick={() => setShowSaved(false)} aria-label="Close kept quotes" className="p-2 text-stone-500">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto px-4 py-2 safe-bottom">
              {keptIds.length === 0 ? (
                <p className="py-5 text-[14px] text-stone-500">No quotes kept yet.</p>
              ) : (
                keptIds.map((id) => (
                  <div key={id} className="flex items-start gap-3 py-3 border-b border-stone-100">
                    <p className="flex-1 text-[14px] leading-relaxed text-stone-800">“{quotes[id]}”</p>
                    <button
                      type="button"
                      onClick={() => rejectQuote(id)}
                      aria-label="Remove saved quote"
                      className="p-2 text-stone-400 hover:text-red-600"
                    >
                      <X size={17} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

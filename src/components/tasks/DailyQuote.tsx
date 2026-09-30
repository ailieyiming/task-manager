import { useState } from 'react'
import { Bookmark, Check, X } from 'lucide-react'
import { isActiveQuote, quoteForDate, quoteSource, quotes } from '../../lib/quotes'
import { useQuotesStore } from '../../store/quotes'

interface Props {
  date: string
}

export function DailyQuote({ date }: Props) {
  const { keptIds, rejectedIds, decidedOn, hasHydrated, keepQuote, rejectQuote } = useQuotesStore()
  const [showSaved, setShowSaved] = useState(false)

  if (!hasHydrated) {
    return <div className="h-18 rounded-xl bg-[#1e3a5f]/5 animate-pulse" aria-label="Loading today's quote" />
  }

  const quote = quoteForDate(date, rejectedIds)
  const activeKeptIds = keptIds.filter(isActiveQuote)
  const showChoices = quote && decidedOn !== date && !keptIds.includes(quote.id)

  return (
    <>
      <section className="rounded-xl border border-[#1e3a5f]/10 bg-[#1e3a5f]/5 px-3 py-2" aria-label="Today's quote">
        <div className="flex items-center justify-between gap-2 min-h-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#1e3a5f]/65">Today's quote</p>
          <div className="flex items-center gap-1">
            {activeKeptIds.length > 0 && (
              <button
                type="button"
                onClick={() => setShowSaved(true)}
                aria-label={`View ${activeKeptIds.length} kept quotes`}
                className="min-w-8 h-8 px-1 flex items-center justify-center gap-0.5 text-[#1e3a5f]"
              >
                <Bookmark size={15} /> <span className="text-[11px]">{activeKeptIds.length}</span>
              </button>
            )}
            {showChoices && (
              <>
                <button
                  type="button"
                  onClick={() => keepQuote(quote.id, date)}
                  aria-label="Keep this quote"
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1e3a5f]/10 text-[#1e3a5f]"
                >
                  <Check size={17} strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => rejectQuote(quote.id, date)}
                  aria-label="Remove this quote"
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-stone-500 border border-stone-200"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </>
            )}
          </div>
        </div>

        {quote ? (
          <>
            <p className="text-[14px] leading-5 font-medium text-[#1e3a5f]">“{quote.text}”</p>
            {quote.source && <p className="mt-0.5 text-[10px] text-stone-500 truncate" title={quote.source}>— {quote.source}</p>}
          </>
        ) : (
          <p className="text-[12px] text-stone-600">You've removed all the quotes.</p>
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
              <h2 className="text-[17px] font-semibold text-stone-900">Kept quotes ({activeKeptIds.length})</h2>
              <button type="button" onClick={() => setShowSaved(false)} aria-label="Close kept quotes" className="p-2 text-stone-500">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto px-4 py-2 safe-bottom">
              {activeKeptIds.length === 0 ? (
                <p className="py-5 text-[14px] text-stone-500">No quotes kept yet.</p>
              ) : (
                activeKeptIds.map((id) => (
                  <div key={id} className="flex items-start gap-3 py-3 border-b border-stone-100">
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] leading-relaxed text-stone-800">“{quotes[id]}”</p>
                      {quoteSource(id) && <p className="text-[11px] text-stone-500 mt-0.5">— {quoteSource(id)}</p>}
                    </div>
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

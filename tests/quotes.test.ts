import { describe, expect, it } from 'bun:test'
import { isActiveQuote, quoteForDate, quoteMeaning, quoteSource, quotes } from '../src/lib/quotes'

describe('daily quote catalog', () => {
  it('retains existing IDs while removing every retired entry', () => {
    expect(quotes[105]).toBe('知彼知己，百战不殆。')
    expect(quotes[110]).toBe('志不强者智不达，言不信者行不果。')
    expect(quotes[115]).toBe('没有调查，没有发言权。')
    expect(isActiveQuote(100)).toBe(false)
    expect(isActiveQuote(120)).toBe(false)
    expect(quoteSource(120)).toBeUndefined()
    expect(quotes.filter(Boolean)).toHaveLength(257)
  })

  it('keeps the original catalog and adds Li Bai and Mao poetry', () => {
    const sources = quotes.map((quote, id) => quote ? quoteSource(id) : undefined).filter(Boolean)
    expect(sources).toHaveLength(133)
    expect(sources.filter(source => source?.startsWith('毛泽东'))).toHaveLength(56)
    expect(sources.some(source => source?.startsWith('李白'))).toBe(true)
    expect(sources.every(source => !source?.includes('道德经'))).toBe(true)
  })

  it('shows Mao three days each week and explains every displayed classical quote', () => {
    for (let week = 0; week < 52; week++) {
      let maoDays = 0
      let englishDays = 0
      let classicDays = 0
      for (let day = 0; day < 7; day++) {
        const date = new Date(Date.UTC(2026, 0, 5 + week * 7 + day)).toISOString().slice(0, 10)
        const quote = quoteForDate(date, [])!
        if (quote.source?.startsWith('毛泽东')) maoDays++
        else if (!quote.source) englishDays++
        else {
          classicDays++
          expect(quoteMeaning(quote.id)).toBeTruthy()
        }
      }
      expect([maoDays, englishDays, classicDays]).toEqual([3, 2, 2])
    }
  })

  it('never offers a retired quote on any day in a year', () => {
    for (let day = 0; day < 366; day++) {
      const date = new Date(Date.UTC(2026, 0, day + 1)).toISOString().slice(0, 10)
      const quote = quoteForDate(date, [])
      expect(quote).not.toBeNull()
      expect(quote && isActiveQuote(quote.id)).toBe(true)
    }
  })
})

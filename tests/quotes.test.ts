import { describe, expect, test } from 'bun:test'
import { isActiveQuote, quoteForDate, quoteMeaning, quoteSource, quotes } from '../src/lib/quotes'
import { normalizeAppData } from '../src/lib/cloudData'

describe('daily quote catalog', () => {
  test('retains existing IDs and retired slots', () => {
    expect(quotes[105]).toBe('知彼知己，百战不殆。')
    expect(quotes[110]).toBe('志不强者智不达，言不信者行不果。')
    expect(quotes[115]).toBe('没有调查，没有发言权。')
    expect(isActiveQuote(100)).toBe(false)
    expect(isActiveQuote(120)).toBe(false)
    expect(quoteSource(120)).toBeUndefined()
  })

  test('retains Mao and Li Bai quotes without Tao Te Ching entries', () => {
    const sources = quotes.map((quote, id) => quote ? quoteSource(id) : undefined).filter(Boolean)
    expect(sources.filter(source => source?.startsWith('毛泽东'))).toHaveLength(56)
    expect(sources.filter(source => source?.startsWith('李白'))).toHaveLength(6)
    expect(sources.every(source => !source?.includes('道德经'))).toBe(true)
  })

  test('keeps the requested 20-day category ratio', () => {
    const counts = { mao: 0, english: 0, sunzi: 0, alliance: 0, liBai: 0 }
    for (let day = 0; day < 20; day++) {
      const date = new Date(Date.UTC(2026, 9, 19 + day)).toISOString().slice(0, 10)
      const quote = quoteForDate(date, [])!
      const source = quoteSource(quote.id)
      if (source?.startsWith('毛泽东')) counts.mao++
      else if (source?.startsWith('《孙子兵法')) counts.sunzi++
      else if (source?.startsWith('《战国策')) {
        counts.alliance++
        expect(quoteMeaning(quote.id)).toBeTruthy()
      } else if (source?.startsWith('李白')) {
        counts.liBai++
        expect(quoteMeaning(quote.id)).toBeTruthy()
      } else counts.english++
    }
    expect(counts).toEqual({ mao: 10, english: 5, sunzi: 3, alliance: 1, liBai: 1 })
  })

  test('never offers a retired quote on any day in a year', () => {
    for (let day = 0; day < 366; day++) {
      const date = new Date(Date.UTC(2026, 0, day + 1)).toISOString().slice(0, 10)
      const quote = quoteForDate(date, [])
      expect(quote).not.toBeNull()
      expect(quote && isActiveQuote(quote.id)).toBe(true)
    }
  })
})

describe('daily quote choices', () => {
  const date = '2026-10-19'

  test('each rejection offers a different quote on the same day', () => {
    const first = quoteForDate(date, [])!
    const second = quoteForDate(date, [first.id])!
    const third = quoteForDate(date, [first.id, second.id])!
    expect(new Set([first.id, second.id, third.id]).size).toBe(3)
  })

  test('rejected quotes never return', () => {
    const first = quoteForDate(date, [])!
    for (let offset = 0; offset < 60; offset++) {
      const nextDate = new Date(Date.UTC(2026, 9, 19 + offset)).toISOString().slice(0, 10)
      expect(quoteForDate(nextDate, [first.id])?.id).not.toBe(first.id)
    }
  })

  test('accepted quote stays out of the next 30 days', () => {
    const acceptedId = quotes.indexOf('I do not shrink to make others comfortable.')
    expect(acceptedId).toBeGreaterThanOrEqual(0)
    for (let offset = 1; offset <= 30; offset++) {
      const nextDate = new Date(Date.UTC(2026, 9, 19 + offset)).toISOString().slice(0, 10)
      expect(quoteForDate(nextDate, [], { [date]: acceptedId })?.id).not.toBe(acceptedId)
    }
  })

  test('older cloud snapshots load with an empty acceptance history', () => {
    const oldData = {
      tasks: [], overrides: [], orderedTaskIds: [], cumulativeCompleted: {},
      targets: [], orderedTargetIds: [], keptIds: [], rejectedIds: [], decidedOn: null,
    }
    expect(normalizeAppData(oldData).acceptedByDate).toEqual({})
  })
})

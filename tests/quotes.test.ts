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
    expect(sources.filter(source => source?.startsWith('毛泽东'))).toHaveLength(57)
    expect(sources.filter(source => source?.startsWith('李白'))).toHaveLength(6)
    expect(sources.every(source => !source?.includes('道德经'))).toBe(true)
  })

  test('gives strategy one fifth of the rotation by replacing half of English', () => {
    const strategyTexts = new Set([
      '攻其无备，出其不意。', '上兵伐谋。', '避实而击虚。',
      '无恃其不来，恃吾有以待之。', '非利不动，非得不用，非危不战。',
      '智者之虑，必杂于利害。', '进不求名，退不避罪。',
      '举公义，辟私怨。', '官无常贵，而民无终贱。', '有能则举之，无能则下之。',
      '与天奋斗，其乐无穷；与地奋斗，其乐无穷；与人奋斗，其乐无穷。',
      '我可以合作，但不会用退让换和平。', '该争取的，我会清楚地说出来。',
      '对方的压力，不是我让步的理由。', '我先看清筹码，再决定让步多少。',
      '我不怕谈判，也不急着答应。', '我的底线，不因对方强势而移动。',
      '我争取属于我的，不为此道歉。', '不为输赢冲动；为结果布局。',
    ])
    const counts = { mao: 0, english: 0, strategy: 0, sunzi: 0, mozi: 0, alliance: 0, liBai: 0 }
    for (let day = 0; day < 20; day++) {
      const date = new Date(Date.UTC(2026, 9, 19 + day)).toISOString().slice(0, 10)
      const quote = quoteForDate(date, [])!
      const source = quoteSource(quote.id)
      if (strategyTexts.has(quote.text)) counts.strategy++
      else if (source?.startsWith('毛泽东')) counts.mao++
      else if (source?.startsWith('《孙子兵法')) counts.sunzi++
      else if (source?.startsWith('《墨子')) counts.mozi++
      else if (source?.startsWith('《战国策')) {
        counts.alliance++
        expect(quoteMeaning(quote.id)).toBeTruthy()
      } else if (source?.startsWith('李白')) {
        counts.liBai++
        expect(quoteMeaning(quote.id)).toBeTruthy()
      } else counts.english++
    }
    expect(counts).toEqual({ mao: 3, english: 4, strategy: 4, sunzi: 3, mozi: 2, alliance: 2, liBai: 2 })
    const maoStrategyId = quotes.indexOf('与天奋斗，其乐无穷；与地奋斗，其乐无穷；与人奋斗，其乐无穷。')
    expect(quoteSource(maoStrategyId)).toContain('据《毛泽东年谱》转引')
    expect(quoteMeaning(maoStrategyId)).toBeTruthy()
  })

  test('does not repeat a quote during a 60-day window', () => {
    const ids = Array.from({ length: 60 }, (_, day) => {
      const date = new Date(Date.UTC(2026, 9, 1 + day)).toISOString().slice(0, 10)
      return quoteForDate(date, [])!.id
    })
    expect(new Set(ids).size).toBe(ids.length)
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

// Original affirmations. Keep the order stable: saved choices refer to these indexes.
export const quotes = [
  // Steadiness
  'I move through today with a calm and steady mind.',
  'My strength grows through consistent, quiet action.',
  'I can be grounded even when life moves quickly.',
  'I choose a measured response over a rushed reaction.',
  'Each small promise I keep strengthens my trust in myself.',
  'I stay centered while opportunities unfold around me.',
  'My progress is steady, real, and worth respecting.',
  'I bring a clear mind to the things that matter.',
  'I have room to pause, think, and choose well.',
  'A stable life is built one thoughtful day at a time.',
  'I can face uncertainty without losing my balance.',
  'My calm is a strength I can return to at any moment.',
  'I protect my energy and direct it with intention.',
  'I trust the quiet work I do behind the scenes.',
  'I make grounded decisions that support my future.',
  'My pace is steady, and my direction is clear.',
  'I meet change with flexibility and inner stability.',
  'I can be gentle with myself and firm in my purpose.',
  'Every steady step makes the next one easier.',
  'I create peace by choosing what deserves my attention.',

  // Health
  'My body deserves care, rest, and nourishing choices.',
  'I listen to my body with respect and curiosity.',
  'Healthy habits grow from small choices I can repeat.',
  'Rest is a valuable part of the life I am building.',
  'I make time for movement that helps me feel alive.',
  'I care for my health with patience, not pressure.',
  'My wellbeing is worthy of a place in my plans.',
  'I choose routines that give me steady energy.',
  'I notice what helps me feel balanced and well.',
  'I can begin again with a caring choice today.',
  'I treat my body as a partner, not a problem.',
  'Sleep, nourishment, and movement support my goals.',
  'I give myself permission to recover and recharge.',
  'My health grows through attention and everyday care.',
  'I honor the limits that help me stay well.',
  'I welcome habits that support a clear and peaceful mind.',
  'I am learning to care for myself in lasting ways.',
  'A healthy life is built with kindness and consistency.',
  'I choose what supports my energy for the long run.',
  'I make space for both ambition and wellbeing.',

  // Affluence
  'I build financial security through clear, thoughtful choices.',
  'I welcome opportunities that match my skills and values.',
  'I can grow my resources with patience and intention.',
  'My work creates value, and I allow myself to receive value.',
  'I make room for abundance without losing my balance.',
  'I learn, earn, save, and grow at a sustainable pace.',
  'I am capable of making wise decisions with money.',
  'I notice opportunities and prepare myself to meet them.',
  'I can enjoy today while planning responsibly for tomorrow.',
  'My skills and good judgment help me build a fuller life.',
  'I grow wealth by caring for what I already have.',
  'I allow success to feel calm, healthy, and sustainable.',
  'I am open to new ways of creating useful work.',
  'I deserve fair reward for the value I bring.',
  'My financial future improves with each deliberate step.',
  'I can be generous and protect my own stability.',
  'I choose long-term freedom over short-term pressure.',
  'I am building a life with more options and ease.',
  'Prosperity can grow alongside integrity and peace.',
  'I trust myself to learn what I need for financial growth.',

  // Patience
  'I give meaningful things the time they need to grow.',
  'Patience helps me see choices that hurry would hide.',
  'I can wait without doubting my direction.',
  'My steady effort matters, even before results appear.',
  'I let progress take root before asking it to bloom.',
  'I am patient with myself while I practice and improve.',
  'A pause gives me space to respond with wisdom.',
  'I can trust the process and still take action today.',
  'I choose persistence over the pressure to be perfect.',
  'My timing does not need to match anyone else’s.',
  'I am allowed to grow slowly and grow well.',
  'I can hold a big vision and focus on one step.',
  'I meet delays with patience and a practical next move.',
  'I release urgency that does not serve me.',
  'I give my goals consistent care, not constant worry.',
  'Each day of practice is part of the result.',
  'I stay open while good work finds its rhythm.',
  'I can be hopeful without demanding instant proof.',
  'Patience makes room for clarity and better decisions.',
  'I trust what steady care can create over time.',

  // Presence and quiet confidence
  'I enter each room with calm confidence and respect.',
  'My presence is strong because I am at ease with myself.',
  'I speak clearly and let my words carry their weight.',
  'I do not need to rush to be noticed.',
  'I make space for others without shrinking myself.',
  'My quiet confidence comes from knowing my values.',
  'I listen fully and speak with intention.',
  'I can be warm, composed, and unmistakably myself.',
  'I bring steadiness to the people and places around me.',
  'I stand tall in my choices and stay open to learning.',
  'My energy is calm, focused, and welcoming.',
  'I carry myself with dignity in every setting.',
  'I can set boundaries with grace and confidence.',
  'I let my actions express the strength of my character.',
  'I am comfortable taking up the space I need.',
  'A calm voice can have a powerful effect.',
  'I trust my perspective and remain curious about others.',
  'I bring a steady presence to important moments.',
  'I lead with clarity, patience, and quiet strength.',
  'I belong wherever I choose to show up fully.',
] as const

export function quoteForDate(date: string, rejectedIds: number[]) {
  const [year, month, day] = date.split('-').map(Number)
  const dayNumber = Math.floor(Date.UTC(year, month - 1, day) / 86_400_000)
  const firstIndex = ((dayNumber * 37) % quotes.length + quotes.length) % quotes.length
  const rejected = new Set(rejectedIds)

  for (let offset = 0; offset < quotes.length; offset++) {
    const id = (firstIndex + offset) % quotes.length
    if (!rejected.has(id)) return { id, text: quotes[id] }
  }
  return null
}

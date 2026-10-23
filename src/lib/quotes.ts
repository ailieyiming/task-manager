// Keep the first 100 entries and their order stable: saved choices refer to indexes.
const englishQuotes = [
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

// IDs are persisted on devices and in cloud snapshots. Retired entries stay as
// empty slots so saved choices for other quotes never point to different text.
const chineseQuotes = [
  null, null, null, null, null,
  { text: '知彼知己，百战不殆。', source: '《孙子兵法·谋攻》' },
  { text: '胜兵先胜而后求战。', source: '《孙子兵法·军形》' },
  { text: '不战而屈人之兵。', source: '《孙子兵法·谋攻》' },
  { text: '以虞待不虞者胜。', source: '《孙子兵法·谋攻》' },
  { text: '先为不可胜，以待敌之可胜。', source: '《孙子兵法·军形》' },
  { text: '志不强者智不达，言不信者行不果。', source: '《墨子·修身》' },
  { text: '贫则见廉，富则见义。', source: '《墨子·修身》' },
  { text: '务言而缓行，虽辩必不听。', source: '《墨子·修身》' },
  { text: '兼相爱，交相利。', source: '《墨子·兼爱中》' },
  { text: '兴天下之利，除天下之害。', source: '《墨子·兼爱下》' },
  { text: '没有调查，没有发言权。', source: '毛泽东《反对本本主义》' },
  { text: '调查就是解决问题。', source: '毛泽东《反对本本主义》' },
  { text: '排除万难，去争取胜利。', source: '毛泽东《愚公移山》' },
  { text: '自力更生。', source: '毛泽东《抗日战争胜利后的时局和我们的方针》' },
  { text: '只要你说得对，我们就改正。', source: '毛泽东《为人民服务》' },
  // These 35 retired IDs remain empty; new quotes are appended below.
  null, null, null, null, null, null, null,
  null, null, null, null, null, null, null,
  null, null, null, null, null, null, null,
  null, null, null, null, null, null, null,
  null, null, null, null, null, null, null,

  { text: '知之者胜，不知者不胜。', source: '《孙子兵法·始计》' },
  { text: '将者，智、信、仁、勇、严也。', source: '《孙子兵法·始计》' },
  { text: '势者，因利而制权也。', source: '《孙子兵法·始计》' },
  { text: '攻其无备，出其不意。', source: '《孙子兵法·始计》' },
  { text: '多算胜，少算不胜。', source: '《孙子兵法·始计》' },
  { text: '兵贵胜，不贵久。', source: '《孙子兵法·作战》' },
  { text: '上兵伐谋。', source: '《孙子兵法·谋攻》' },
  { text: '知可以战与不可以战者胜。', source: '《孙子兵法·谋攻》' },
  { text: '上下同欲者胜。', source: '《孙子兵法·谋攻》' },
  { text: '不可胜在己，可胜在敌。', source: '《孙子兵法·军形》' },
  { text: '胜可知，而不可为。', source: '《孙子兵法·军形》' },
  { text: '善战者，立于不败之地。', source: '《孙子兵法·军形》' },
  { text: '以正合，以奇胜。', source: '《孙子兵法·兵势》' },
  { text: '奇正相生，如循环之无端。', source: '《孙子兵法·兵势》' },
  { text: '求之于势，不责于人。', source: '《孙子兵法·兵势》' },
  { text: '致人而不致于人。', source: '《孙子兵法·虚实》' },
  { text: '避实而击虚。', source: '《孙子兵法·虚实》' },
  { text: '水因地而制行，兵因敌而制胜。', source: '《孙子兵法·虚实》' },
  { text: '无所不备，则无所不寡。', source: '《孙子兵法·虚实》' },
  { text: '以治待乱，以静待哗。', source: '《孙子兵法·军争》' },
  { text: '以近待远，以佚待劳。', source: '《孙子兵法·军争》' },
  { text: '智者之虑，必杂于利害。', source: '《孙子兵法·九变》' },
  { text: '无恃其不来，恃吾有以待之。', source: '《孙子兵法·九变》' },
  { text: '进不求名，退不避罪。', source: '《孙子兵法·地形》' },
  { text: '合于利而动，不合于利而止。', source: '《孙子兵法·九地》' },
  { text: '料敌制胜，计险厄远近。', source: '《孙子兵法·地形》' },
  { text: '围地则谋，死地则战。', source: '《孙子兵法·九地》' },
  { text: '非利不动，非得不用，非危不战。', source: '《孙子兵法·火攻》' },
  { text: '明主慎之，良将警之。', source: '《孙子兵法·火攻》' },
  { text: '先知者，不可取于鬼神。', source: '《孙子兵法·用间》' },

  { text: '士虽有学，而行为本焉。', source: '《墨子·修身》' },
  { text: '置本不安者，无务丰末。', source: '《墨子·修身》' },
  { text: '事无终始，无务多业。', source: '《墨子·修身》' },
  { text: '君子察迩，修身也。', source: '《墨子·修身》' },
  { text: '君子力事日强。', source: '《墨子·修身》' },
  { text: '生则见爱，死则见哀。', source: '《墨子·修身》' },
  { text: '本不固者，末必几。', source: '《墨子·修身》' },
  { text: '源浊者流不清。', source: '《墨子·修身》' },
  { text: '名不徒生，而誉不自长。', source: '《墨子·修身》' },
  { text: '慧者心辩而不繁说。', source: '《墨子·修身》' },
  { text: '多力而不伐功。', source: '《墨子·修身》' },
  { text: '言无务为多而务为智。', source: '《墨子·修身》' },
  { text: '名不可简而成也，誉不可巧而立也。', source: '《墨子·修身》' },
  { text: '君子以身戴行者也。', source: '《墨子·修身》' },
  { text: '行不信者名必耗。', source: '《墨子·修身》' },
  { text: '国有贤良之士众，则国家之治厚。', source: '《墨子·尚贤上》' },
  { text: '厚乎德行，辩乎言谈，博乎道术。', source: '《墨子·尚贤上》' },
  { text: '举公义，辟私怨。', source: '《墨子·尚贤上》' },
  { text: '官无常贵，而民无终贱。', source: '《墨子·尚贤上》' },
  { text: '有能则举之，无能则下之。', source: '《墨子·尚贤上》' },
  { text: '得士则谋不困，体不劳。', source: '《墨子·尚贤上》' },
  { text: '尚贤者，政之本也。', source: '《墨子·尚贤上》' },
  { text: '因其国家，去其无用，足以倍之。', source: '《墨子·节用上》' },
  { text: '用财不费，民德不劳。', source: '《墨子·节用上》' },
  { text: '去无用之务，行圣王之道。', source: '《墨子·节用上》' },
  { text: '使各从事其所能。', source: '《墨子·节用中》' },
  { text: '加费不加民利则止。', source: '《墨子·节用中》' },
  { text: '足以充虚继气，强股肱，使耳目聪明，则止。', source: '《墨子·节用中》' },
  { text: '欲天下之富，而恶其贫。', source: '《墨子·兼爱中》' },
  { text: '欲天下之治，而恶其乱。', source: '《墨子·兼爱中》' },

  { text: '虚心使人进步，骄傲使人落后。', source: '毛泽东《在中国共产党第八届全国代表大会上的开幕词》' },
  { text: '情况是在不断地变化。', source: '毛泽东《在中国共产党全国宣传工作会议上的讲话》' },
  { text: '我们看事情必须要看它的实质。', source: '毛泽东《星星之火，可以燎原》' },
  { text: '自己动手，克服困难。', source: '毛泽东《开展根据地的减租、生产和拥政爱民运动》' },
  { text: '我们应该老老实实地办事。', source: '毛泽东《在中国共产党全国宣传工作会议上的讲话》' },

  { text: '注重调查！', source: '毛泽东《反对本本主义》' },
  { text: '反对瞎说！', source: '毛泽东《反对本本主义》' },
  { text: '一切结论产生于调查情况的末尾。', source: '毛泽东《反对本本主义》' },
  { text: '只有向实际情况作调查。', source: '毛泽东《反对本本主义》' },
  { text: '必须努力作实际调查。', source: '毛泽东《反对本本主义》' },
  { text: '真理的标准只能是社会的实践。', source: '毛泽东《实践论》' },
  { text: '理论的基础是实践，又转过来为实践服务。', source: '毛泽东《实践论》' },
  { text: '感觉只解决现象问题，理论才解决本质问题。', source: '毛泽东《实践论》' },
  { text: '一切真知都是从直接经验发源的。', source: '毛泽东《实践论》' },
  { text: '离开实践的认识是不可能的。', source: '毛泽东《实践论》' },
  { text: '我们还是老实一点吧！', source: '毛泽东《改造我们的学习》' },
  { text: '实事求是。', source: '毛泽东《改造我们的学习》' },
  { text: '错误常常是正确的先导。', source: '毛泽东《改造我们的学习》' },
  { text: '要有目的地去研究。', source: '毛泽东《改造我们的学习》' },
  { text: '任何一个部门的工作，都必须先有情况的了解。', source: '毛泽东《改造我们的学习》' },
  { text: '我们如果有缺点，就不怕别人批评指出。', source: '毛泽东《为人民服务》' },
  { text: '要看到成绩，要看到光明，要提高我们的勇气。', source: '毛泽东《为人民服务》' },
  { text: '我们要努力奋斗。', source: '毛泽东《为人民服务》' },
  { text: '互相关心，互相爱护，互相帮助。', source: '毛泽东《为人民服务》' },
  { text: '为人民的利益坚持好的，为人民的利益改正错的。', source: '毛泽东《为人民服务》' },
  { text: '兵民是胜利之本。', source: '毛泽东《论持久战》' },
  { text: '一切事情是要人做的。', source: '毛泽东《论持久战》' },
  { text: '坐着不动，只有被灭亡。', source: '毛泽东《论持久战》' },
  { text: '要分胜负，还须加上主观的努力。', source: '毛泽东《论持久战》' },
  { text: '执行有利决战，避免不利决战。', source: '毛泽东《论持久战》' },
  { text: '言必信，行必果。', source: '毛泽东《中国共产党在民族战争中的地位》' },
  { text: '埋头苦干。', source: '毛泽东《中国共产党在民族战争中的地位》' },
  { text: '只有实事求是，才能完成确定的任务。', source: '毛泽东《中国共产党在民族战争中的地位》' },
  { text: '只有远见卓识，才能不失前进的方向。', source: '毛泽东《中国共产党在民族战争中的地位》' },
  { text: '每天都是民众的学生。', source: '毛泽东《中国共产党在民族战争中的地位》' },
  { text: '不解决方法问题，任务也只是瞎说一顿。', source: '毛泽东《关心群众生活，注意工作方法》' },
  { text: '我们不但要提出任务，而且要解决完成任务的方法问题。', source: '毛泽东《关心群众生活，注意工作方法》' },
  { text: '应该讨论，应该决定，应该实行，应该检查。', source: '毛泽东《关心群众生活，注意工作方法》' },
  { text: '采取耐心说服的工作方法。', source: '毛泽东《关心群众生活，注意工作方法》' },
  { text: '干就是学习。', source: '毛泽东《中国革命战争的战略问题》' },
  { text: '不同质的矛盾，只有用不同质的方法才能解决。', source: '毛泽东《矛盾论》' },
  { text: '过程变化，旧过程和旧矛盾消灭，新过程和新矛盾发生。', source: '毛泽东《矛盾论》' },
  { text: '用不同的方法去解决不同的矛盾。', source: '毛泽东《矛盾论》' },
  { text: '一切过程都有始有终。', source: '毛泽东《矛盾论》' },
  { text: '星星之火，可以燎原。', source: '毛泽东《星星之火，可以燎原》（引语）' },
] as const

// New entries are appended so older saved quote IDs keep their original text.
const newEnglishQuotes = [
  'I can miss someone and still move forward.',
  'My peace does not depend on another person’s reply.',
  'I choose what is real over what I hoped would happen.',
  'I can close a chapter without closing my heart.',
  'I do not need to revisit a decision that protects me.',
  'Today, I put my energy where it can grow.',
  'I can feel hurt and still make a clear choice.',
  'I release the need to be chosen by the wrong person.',
  'A difficult week does not define my future.',
  'I keep my standards and make room for peace.',
  'I can start again without explaining myself to everyone.',
  'My next step matters more than yesterday’s uncertainty.',
  'I give my attention to people who meet me with care.',
  'I can be patient with healing and firm with my boundaries.',
  'I do not have to chase what is leaving.',
  'I let go of what drains me and protect what strengthens me.',
  'I can make progress before I feel completely ready.',
  'I will do the useful thing in front of me.',
  'I stay steady when feelings rise and fall.',
  'I am allowed to build a good life from this point on.',
  'I can choose a new direction without calling the past a mistake.',
  'My attention is valuable; I spend it with care.',
  'I can be kind without abandoning myself.',
  'I trust actions more than promises.',
] as const

const newChineseQuotes = [
  { text: '弃我去者，昨日之日不可留。', source: '李白《宣州谢朓楼饯别校书叔云》', meaning: '昨天已过去，不能把它留住；把心力放回今天。' },
  { text: '两岸猿声啼不住，轻舟已过万重山。', source: '李白《早发白帝城》', meaning: '即使周围仍有杂音，你也可以继续向前。' },
  { text: '长风破浪会有时，直挂云帆济沧海。', source: '李白《行路难》', meaning: '眼前的阻碍不是终点；继续走，机会还会来。' },
  { text: '天生我材必有用。', source: '李白《将进酒》', meaning: '相信自己的能力，不因一次失意否定自己。' },
  { text: '仰天大笑出门去，我辈岂是蓬蒿人。', source: '李白《南陵别儿童入京》', meaning: '带着自信出发，不把自己困在失意里。' },
  { text: '事了拂衣去，深藏身与名。', source: '李白《侠客行》', meaning: '事情结束后就放手，不必反复证明自己。' },
  { text: '当断不断，反受其乱。', source: '《史记·齐悼惠王世家》引古语', meaning: '该作决定时不要一直拖延；拖延可能让局面更乱。' },
  { text: '雄关漫道真如铁，而今迈步从头越。', source: '毛泽东《忆秦娥·娄山关》', meaning: '难关仍在，也可以从现在重新迈步。' },
  { text: '不管风吹浪打，胜似闲庭信步。', source: '毛泽东《水调歌头·游泳》', meaning: '外界有波动时，仍可稳住自己的步伐。' },
  { text: '世上无难事，只要肯登攀。', source: '毛泽东《水调歌头·重上井冈山》', meaning: '困难可以分步处理；先迈出下一步。' },
  { text: '踏遍青山人未老，风景这边独好。', source: '毛泽东《清平乐·会昌》', meaning: '经历起伏后，仍可以发现新的景色和机会。' },
  { text: '敌军围困万千重，我自岿然不动。', source: '毛泽东《西江月·井冈山》', meaning: '压力再大，也先稳住自己。' },
  { text: '一万年太久，只争朝夕。', source: '毛泽东《满江红·和郭沫若同志》', meaning: '不要把行动推给遥远的将来；今天就开始。' },
] as const

// Original English affirmations. Append only: saved quote IDs must stay stable.
const freshEnglishQuotes = [
  'I can remember the good and still leave what is over.',
  'A clear ending makes room for a better beginning.',
  'I will not trade my peace for one more uncertain answer.',
  'My worth does not change when someone walks away.',
  'I can grieve a hope without returning to what hurt me.',
  'I choose a clean break when a half-open door keeps me stuck.',
  'I let facts guide me when longing changes the story.',
  'The right connection will not require me to lose myself.',
  'I can feel lonely tonight and still make a wise choice.',
  'I stop asking the past to give me a different ending.',
  'I can care deeply and still say that enough is enough.',
  'My future gets more attention than an unanswered message.',
  'I release the habit of checking what I have already decided.',
  'One hard goodbye does not close the door to a full life.',
  'I keep the lesson and leave the weight behind.',
  'I do not need perfect closure to move with purpose.',
  'I can miss the familiar without calling it right for me.',
  'My next chapter begins with the choices I make today.',
  'I bring my attention back to the life in front of me.',
  'I can be tender with my feelings and firm with my limits.',

  'I slow my breath before I decide what comes next.',
  'A steady mind gives me more options than a hurried one.',
  'I do not have to solve the whole year today.',
  'I keep my footing when plans change around me.',
  'I can rest without giving up on my goals.',
  'I return to the habits that make me feel strong.',
  'My patience is active: I prepare, observe, and move.',
  'I protect my sleep because tomorrow deserves my energy.',
  'Small acts of care build a life I can trust.',
  'I can begin a difficult day with one useful task.',
  'I allow my body time to recover and become stronger.',
  'I stay composed without pretending that nothing hurts.',
  'I choose a calm pace that I can sustain.',
  'I put my strength into what I can influence.',
  'I can withstand a setback without becoming the setback.',
  'I meet pressure with preparation, not panic.',
  'I make room for joy while I work through difficulty.',
  'I trust steady practice more than a sudden burst of effort.',
  'I can pause, reset, and return with a clearer mind.',
  'The way I care for myself shapes the days ahead.',

  'I build security by making one sound choice at a time.',
  'My skills grow when I use them with focus.',
  'I create value before I ask for recognition.',
  'I can be ambitious and still live with ease.',
  'I notice where my time produces real results.',
  'I spend with intention and save for freedom.',
  'I welcome good opportunities without chasing every option.',
  'I take the next practical step, even when it is small.',
  'I can learn a new skill and open a new path.',
  'My work deserves fair pay and clear boundaries.',
  'I make decisions that my future self can respect.',
  'I use evidence to choose, then give the choice my effort.',
  'I let my actions be louder than my doubts.',
  'I can start with what I have and improve as I go.',
  'I keep my promises to myself in ordinary moments.',
  'I build a strong presence by listening and speaking clearly.',
  'I choose people and projects that return my energy.',
  'I can change direction without losing momentum.',
  'Today offers enough time for one meaningful advance.',
  'I am building a life that feels steady, healthy, and free.',
] as const

// Verified source quotations. Append only: older saved quote IDs must not move.
const sourcedEnglishQuotes = [
  { text: '“Hope” is the thing with feathers.', source: 'Emily Dickinson, “Hope”', url: 'https://www.poetryfoundation.org/poems/42889/hope-is-the-thing-with-feathers-314' },
  { text: 'I am the master of my fate.', source: 'William Ernest Henley, “Invictus”', url: 'https://www.poetryfoundation.org/poems/51642/invictus' },
  { text: 'I am the captain of my soul.', source: 'William Ernest Henley, “Invictus”', url: 'https://www.poetryfoundation.org/poems/51642/invictus' },
  { text: 'If you can wait and not be tired by waiting.', source: 'Rudyard Kipling, “If—”', url: 'https://www.poetryfoundation.org/poems/46473/if---' },
  { text: 'If you can meet with Triumph and Disaster.', source: 'Rudyard Kipling, “If—”', url: 'https://www.poetryfoundation.org/poems/46473/if---' },
  { text: 'Hold fast to dreams.', source: 'Langston Hughes, “Dreams”', url: 'https://www.poetryfoundation.org/poems/150995/dreams-5d767850da976' },
  { text: 'Our doubts are traitors.', source: 'William Shakespeare, “Measure for Measure”', url: 'https://shakespeare.mit.edu/measure/measure.1.4.html' },
  { text: 'Sweet are the uses of adversity.', source: 'William Shakespeare, “As You Like It”', url: 'https://shakespeare.mit.edu/asyoulikeit/asyoulikeit.2.1.html' },
  { text: 'We are all in the gutter, but some of us are looking at the stars.', source: 'Oscar Wilde, “Lady Windermere’s Fan”', url: 'https://www.gutenberg.org/cache/epub/790/pg790-images.html' },
  { text: 'We must accept the finite disappointment, but in spite of this we must maintain the infinite hope.', source: 'Martin Luther King Jr., “Shattered Dreams”', url: 'https://kinginstitute.stanford.edu/king-papers/documents/draft-chapter-x-shattered-dreams' },
  { text: 'Stay hungry. Stay foolish.', source: 'The Whole Earth Catalog, cited by Steve Jobs', url: 'https://news.stanford.edu/stories/2005/06/youve-got-find-love-jobs-says' },
  { text: 'Your time is limited, so don’t waste it living someone else’s life.', source: 'Steve Jobs, Stanford commencement address', url: 'https://news.stanford.edu/stories/2005/06/youve-got-find-love-jobs-says' },
  { text: 'Optimism is the faith that leads to achievement.', source: 'Helen Keller, “Optimism”', url: 'https://www.afb.org/about-afb/history/helen-keller/books-essays-speeches/optimism-1903' },
  { text: 'Trust thyself: every heart vibrates to that iron string.', source: 'Ralph Waldo Emerson, “Self-Reliance”', url: 'https://www.gutenberg.org/cache/epub/16643/pg16643-images.html' },
  { text: 'Our life is frittered away by detail.', source: 'Henry David Thoreau, “Walden”', url: 'https://www.gutenberg.org/files/205/205-h/205-h.htm' },
  { text: 'Simplify, simplify.', source: 'Henry David Thoreau, “Walden”', url: 'https://www.gutenberg.org/files/205/205-h/205-h.htm' },
  { text: 'Your pain is the breaking of the shell that encloses your understanding.', source: 'Kahlil Gibran, “The Prophet”', url: 'https://www.gutenberg.org/cache/epub/58585/pg58585-images.html' },
  { text: 'And this, too, shall pass away.', source: 'Traditional saying, cited by Abraham Lincoln', url: 'https://en.wikisource.org/wiki/Page:Life_and_Works_of_Abraham_Lincoln,_v5.djvu/309' },
  { text: 'The universe has your back.', source: 'Gabrielle Bernstein, “The Universe Has Your Back”', url: 'https://gabbybernstein.com/the-universe-has-your-back/' },
  { text: 'Give yourself permission to stop forcing and start allowing.', source: 'Gabrielle Bernstein, “There Is a Spiritual Solution to Every Problem”', url: 'https://gabbybernstein.com/podcast/there-is-a-spiritual-solution-to-every-problem/' },
] as const

const allianceQuotes = [
  { text: '安民之本，在于择交。', source: '《战国策·赵二·苏秦从燕之赵始合从》', meaning: '选择可靠的伙伴，才能把事情做稳。', url: 'https://zh.wikisource.org/zh/戰國策_(士禮居叢書本)/趙/二' },
  { text: '择交而得则民安。', source: '《战国策·赵二·苏秦从燕之赵始合从》', meaning: '合作对象选得对，局面才容易稳定。', url: 'https://zh.wikisource.org/zh/戰國策_(士禮居叢書本)/趙/二' },
  { text: '此三策者，不可不熟计也。', source: '《战国策·赵二·苏秦从燕之赵始合从》', meaning: '重要选择要把几种方案都想清楚。', url: 'https://zh.wikisource.org/zh/戰國策_(士禮居叢書本)/趙/二' },
  { text: '六国并力为一。', source: '《战国策·赵二·苏秦从燕之赵始合从》', meaning: '有共同目标时，分散的力量可以联合。', url: 'https://zh.wikisource.org/zh/戰國策_(士禮居叢書本)/趙/二' },
  { text: '大王之地有尽，而秦之求无已。', source: '《战国策·韩一·苏秦为楚合从说韩王》', meaning: '资源有限时，要看清没有止境的要求，并守住边界。', url: 'https://zh.wikisource.org/zh-hant/戰國策_(士禮居叢書本)/韓/一' },
  { text: '宁为鸡口，无为牛后。', source: '《战国策·韩一·苏秦为楚合从说韩王》', meaning: '与其失去自主权，不如守住自己的选择。', url: 'https://zh.wikisource.org/zh-hant/戰國策_(士禮居叢書本)/韓/一' },
] as const

// Direct first-person affirmations for the daily English rotation.
// Older quotations stay in the array so saved IDs remain valid.
const powerEnglishQuotes = [
  'I take up space without apology.',
  'I speak clearly and expect to be heard.',
  'I say what I mean.',
  'I walk into the room like I belong.',
  'I do not shrink to make others comfortable.',
  'I ask for what I want.',
  'I can be seen and heard.',
  'I hold the floor when I speak.',
  'I am allowed to be bold.',
  'I choose action over hesitation.',
  'I keep going when it gets hard.',
  'I show up before I feel ready.',
  'I finish what I start.',
  'I back myself.',
  'I can handle a no.',
  'I do not need permission to lead.',
  'I hold my ground.',
  'I trust my preparation.',
  'I take the next step today.',
  'I choose consistency over mood.',
  'I recover and move forward.',
  'I bring energy into the room.',
  'I claim my place at the table.',
  'I stop waiting to be chosen.',
  'I decide, then I move.',
  'I am not here to be small.',
  'I make things happen.',
] as const

// The strategy theme combines sourced lines with original, uncredited reminders.
// Append new entries; saved quote IDs must not change.
const newStrategyQuotes: readonly { text: string; source?: string; meaning?: string; url?: string }[] = [
  {
    text: '与天奋斗，其乐无穷；与地奋斗，其乐无穷；与人奋斗，其乐无穷。',
    source: '毛泽东早年自勉语（据《毛泽东年谱》转引）',
    meaning: '遇到阻力时，继续争取主动，不把对抗当作退缩的理由。',
    url: 'https://www.qinfeng.gov.cn/info/1064/218038.htm',
  },
  { text: '我可以合作，但不会用退让换和平。' },
  { text: '该争取的，我会清楚地说出来。' },
  { text: '对方的压力，不是我让步的理由。' },
  { text: '我先看清筹码，再决定让步多少。' },
  { text: '我不怕谈判，也不急着答应。' },
  { text: '我的底线，不因对方强势而移动。' },
  { text: '我争取属于我的，不为此道歉。' },
  { text: '不为输赢冲动；为结果布局。' },
]

const classicMeanings: Record<number, string> = {
  105: '先看清自己和对方，再决定怎么行动。',
  106: '先做好准备，再争取结果。',
  108: '有准备的人，比毫无准备的人更有优势。',
  109: '先稳住自己的位置，再等待合适的机会。',
  110: '意志不坚定，判断就难清楚；说话不守信，行动就难有结果。',
  113: '彼此关心，也让彼此受益。',
  114: '做有益的事，减少有害的事。',
  158: '看清对方尚未准备好的地方，再选择行动时机。',
  155: '先了解真实情况，判断才更可靠。',
  159: '多做准备和判断，胜算才更高。',
  160: '重视有效的结果，不把事情无谓拖长。',
  161: '先靠判断和策略解决问题。',
  162: '知道何时该行动、何时该停下，才更容易成功。',
  163: '方向一致，行动才更有力。',
  164: '先把能控制的部分做好，机会再看外部条件。',
  167: '用稳妥的方法站住脚，再用灵活的方法突破。',
  169: '借助合适的形势，不把全部压力压在个人身上。',
  170: '尽量掌握主动，不总被别人牵着走。',
  171: '避开对方强处，寻找可以突破的地方。',
  172: '方法要随实际情况调整。',
  174: '面对混乱时，先稳住自己的秩序和情绪。',
  175: '保存精力，等到有利的时机再行动。',
  176: '做决定时，同时看收益和风险。',
  177: '不要只盼风险不来；先做好应对准备。',
  178: '决定进退时，先看实际责任，不被虚名或指责左右。',
  179: '有实际好处才行动；没有好处就停止。',
  182: '没有利益不轻举妄动；没有把握不贸然投入。',
  184: '预先了解情况，要靠调查，而不是靠占卜。',
  185: '学到的东西，要靠行动落实。',
  186: '基础未稳时，先不要追求表面的成果。',
  189: '认真做事，能力会逐日增强。',
  191: '基础不牢，后面的事也难稳。',
  192: '源头有问题，结果也难清楚。',
  193: '好名声来自长期行动，不会凭空出现。',
  195: '多做事，不急着夸耀功劳。',
  196: '说话重在有见地，不在于多。',
  202: '把公共的事放在前面，少让私怨左右判断。',
  203: '地位不是永远不变的，能力和行动很重要。',
  204: '任用有能力的人，调整不合适的安排。',
  207: '去掉无用的消耗，把资源用在重要的地方。',
  208: '合理用财，减少不必要的劳累。',
  210: '让人做自己擅长的事。',
  211: '增加成本却没有带来益处，就应停下。',
  213: '希望大家更富足，而不是陷入贫困。',
  214: '想要有序的生活，就要处理造成混乱的问题。',
}

const legacyQuoteCount = englishQuotes.length + chineseQuotes.length
const newChineseStart = legacyQuoteCount + newEnglishQuotes.length
const freshEnglishStart = newChineseStart + newChineseQuotes.length
const sourcedEnglishStart = freshEnglishStart + freshEnglishQuotes.length
const allianceStart = sourcedEnglishStart + sourcedEnglishQuotes.length
const powerEnglishStart = allianceStart + allianceQuotes.length
const newStrategyStart = powerEnglishStart + powerEnglishQuotes.length

export const quotes: readonly (string | null)[] = [
  ...englishQuotes,
  ...chineseQuotes.map((quote) => quote?.text ?? null),
  ...newEnglishQuotes,
  ...newChineseQuotes.map((quote) => quote.text),
  ...freshEnglishQuotes,
  ...sourcedEnglishQuotes.map((quote) => quote.text),
  ...allianceQuotes.map((quote) => quote.text),
  ...powerEnglishQuotes,
  ...newStrategyQuotes.map((quote) => quote.text),
]

export function quoteSource(id: number): string | undefined {
  if (id < legacyQuoteCount) return chineseQuotes[id - englishQuotes.length]?.source
  if (id >= sourcedEnglishStart && id < allianceStart) return sourcedEnglishQuotes[id - sourcedEnglishStart]?.source
  if (id >= allianceStart && id < powerEnglishStart) return allianceQuotes[id - allianceStart]?.source
  if (id >= newStrategyStart) return newStrategyQuotes[id - newStrategyStart]?.source
  return newChineseQuotes[id - newChineseStart]?.source
}

export function quoteMeaning(id: number): string | undefined {
  if (id >= allianceStart && id < powerEnglishStart) return allianceQuotes[id - allianceStart]?.meaning
  if (id >= newStrategyStart) return newStrategyQuotes[id - newStrategyStart]?.meaning
  return classicMeanings[id] ?? newChineseQuotes[id - newChineseStart]?.meaning
}

export function quoteSourceUrl(id: number): string | undefined {
  if (id >= sourcedEnglishStart && id < allianceStart) return sourcedEnglishQuotes[id - sourcedEnglishStart]?.url
  if (id >= allianceStart && id < powerEnglishStart) return allianceQuotes[id - allianceStart]?.url
  if (id >= newStrategyStart) return newStrategyQuotes[id - newStrategyStart]?.url
  return undefined
}

export function isActiveQuote(id: number): boolean {
  return Number.isInteger(id) && id >= 0 && id < quotes.length && quotes[id] !== null
}

// Rotate only the lines that match the user's saved themes. Keep the complete
// catalog and its IDs intact so saved and rejected choices stay valid.
const preferredMao = new Set([
  '排除万难，去争取胜利。',
  '没有调查，没有发言权。',
  '调查就是解决问题。',
  '真理的标准只能是社会的实践。',
  '要有目的地去研究。',
  '言必信，行必果。',
  '干就是学习。',
  '自己动手，克服困难。',
  '一万年太久，只争朝夕。',
  '敌军围困万千重，我自岿然不动。',
  '雄关漫道真如铁，而今迈步从头越。',
  '实事求是。',
])
const preferredSunzi = new Set([
  '知之者胜，不知者不胜。',
  '多算胜，少算不胜。',
  '先知者，不可取于鬼神。',
  '兵贵胜，不贵久。',
  '知彼知己，百战不殆。',
  '胜兵先胜而后求战。',
  '先为不可胜，以待敌之可胜。',
  '知可以战与不可以战者胜。',
  '不可胜在己，可胜在敌。',
  '致人而不致于人。',
  '以治待乱，以静待哗。',
  '合于利而动，不合于利而止。',
])
const preferredMozi = new Set([
  '欲天下之治，而恶其乱。',
  '用财不费，民德不劳。',
  '言无务为多而务为智。',
  '志不强者智不达，言不信者行不果。',
  '士虽有学，而行为本焉。',
  '置本不安者，无务丰末。',
  '君子力事日强。',
  '加费不加民利则止。',
])
const preferredEnglish = new Set([
  'I can be hopeful without demanding instant proof.',
  'I make grounded decisions that support my future.',
  'I am building a life with more options and ease.',
  'I am comfortable taking up the space I need.',
  'Sleep, nourishment, and movement support my goals.',
  'I choose persistence over the pressure to be perfect.',
  'I stay centered while opportunities unfold around me.',
  'I can grow my resources with patience and intention.',
  'I meet change with flexibility and inner stability.',
  'My energy is calm, focused, and welcoming.',
  'I do not shrink to make others comfortable.',
  'I speak clearly and let my words carry their weight.',
  'I enter each room with calm confidence and respect.',
  'I can set boundaries with grace and confidence.',
  'I let my actions be louder than my doubts.',
  'I build security by making one sound choice at a time.',
  'I make decisions that my future self can respect.',
  'I use evidence to choose, then give the choice my effort.',
  'I trust actions more than promises.',
  'I put my strength into what I can influence.',
  'I meet pressure with preparation, not panic.',
  'My patience is active: I prepare, observe, and move.',
  'I protect my sleep because tomorrow deserves my energy.',
  'I take the next practical step, even when it is small.',
  'I can be kind without abandoning myself.',
  'I choose a clean break when a half-open door keeps me stuck.',
  'I can miss someone and still move forward.',
  'I am building a life that feels steady, healthy, and free.',
  'I ask for what I want.',
  'I hold my ground.',
  'I take the next step today.',
  'I recover and move forward.',
])
const maoIds = quotes.flatMap((text, id) => text && preferredMao.has(text) ? [id] : [])
const sunziIds = quotes.flatMap((text, id) => text && preferredSunzi.has(text) ? [id] : [])
const moziIds = quotes.flatMap((text, id) => text && preferredMozi.has(text) ? [id] : [])
const englishIds = quotes.flatMap((text, id) => text && preferredEnglish.has(text) ? [id] : [])
const preferredStrategy = new Set([
  '攻其无备，出其不意。',
  '上兵伐谋。',
  '避实而击虚。',
  '无恃其不来，恃吾有以待之。',
  '非利不动，非得不用，非危不战。',
  '智者之虑，必杂于利害。',
  '进不求名，退不避罪。',
  '举公义，辟私怨。',
  '官无常贵，而民无终贱。',
  '有能则举之，无能则下之。',
])
const strategyIds = [
  ...quotes.flatMap((text, id) => text && preferredStrategy.has(text) ? [id] : []),
  ...newStrategyQuotes.map((_, index) => newStrategyStart + index),
]
const allianceIds = allianceQuotes.map((_, index) => allianceStart + index)
const liBaiIds = quotes.flatMap((text, id) => text && quoteSource(id)?.startsWith('李白') ? [id] : [])
const allActiveIds = [...maoIds, ...englishIds, ...strategyIds, ...sunziIds, ...moziIds, ...allianceIds, ...liBaiIds]
const scheduleStart = Math.floor(Date.UTC(2025, 0, 1) / 86_400_000)
const noRepeatDays = 60
// Each 20-day cycle: 4 English, 4 strategy, 3 Mao, 3 Sunzi,
// 2 Mozi, 2 alliance, and 2 Li Bai quotes.
const categoryCycle = [
  'english', 'mao', 'strategy', 'sunzi', 'mozi',
  'english', 'alliance', 'strategy', 'liBai', 'sunzi',
  'english', 'mao', 'strategy', 'mozi', 'alliance',
  'english', 'sunzi', 'liBai', 'strategy', 'mao',
] as const
const categoryPools = { mao: maoIds, english: englishIds, strategy: strategyIds, sunzi: sunziIds, mozi: moziIds, alliance: allianceIds, liBai: liBaiIds }

function quoteIdForDay(dayNumber: number, rejected: Set<number>, recent: Set<number>): number | null {
  const category = categoryCycle[((dayNumber - scheduleStart) % categoryCycle.length + categoryCycle.length) % categoryCycle.length]
  const pools = [categoryPools[category]]
  for (const pool of [...pools, allActiveIds]) {
    if (pool.length === 0) continue
    const firstIndex = (Math.imul(dayNumber, 2654435761) >>> 0) % pool.length
    for (let offset = 0; offset < pool.length; offset++) {
      const id = pool[(firstIndex + offset) % pool.length]
      if (!rejected.has(id) && !recent.has(id)) return id
    }
  }
  // A repeat is unavoidable if fewer than 60 usable quotes remain.
  return allActiveIds.find((id) => !rejected.has(id)) ?? null
}

export function quoteForDate(date: string, rejectedIds: number[], acceptedByDate: Record<string, number> = {}) {
  const [year, month, day] = date.split('-').map(Number)
  const dayNumber = Math.floor(Date.UTC(year, month - 1, day) / 86_400_000)
  if (!Number.isFinite(dayNumber)) return null
  const rejected = new Set(rejectedIds)
  for (const [acceptedDate, acceptedId] of Object.entries(acceptedByDate)) {
    const [acceptedYear, acceptedMonth, acceptedDay] = acceptedDate.split('-').map(Number)
    const acceptedNumber = Math.floor(Date.UTC(acceptedYear, acceptedMonth - 1, acceptedDay) / 86_400_000)
    if (Number.isFinite(acceptedNumber) && acceptedNumber < dayNumber && dayNumber - acceptedNumber <= 30) {
      rejected.add(acceptedId)
    }
  }
  const recent: number[] = []
  let id: number | null = null
  for (let current = Math.min(scheduleStart, dayNumber); current <= dayNumber; current++) {
    id = quoteIdForDay(current, rejected, new Set(recent))
    if (id !== null) {
      recent.push(id)
      if (recent.length > noRepeatDays) recent.shift()
    }
  }
  const text = id === null ? null : quotes[id]
  return text ? { id: id!, text, source: quoteSource(id!), meaning: quoteMeaning(id!) } : null
}

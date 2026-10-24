import { Chapter, ChapterGameData, DragItem, LanguageId, ScriptMode } from '../types/index.ts';
import { getChapterTextbookInfo } from './textbookData.ts';

/**
 * Deterministic hash from a chapter identifier so each chapter gets consistent,
 * non-repeating variations and option orderings.
 */
function hashChapterSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Rotates quiz options deterministically so the correct answer is not always first,
 * while remaining stable for a given question ID.
 */
function arrangeOptions(
  questionId: string,
  correct: { text: string; emoji?: string },
  distractors: Array<{ text: string; emoji?: string }>
): Array<{ id: string; text: string; emoji?: string; isCorrect: boolean }> {
  const seed = hashChapterSeed(questionId);
  const raw = [
    { ...correct, isCorrect: true },
    ...distractors.slice(0, 3).map((d) => ({ ...d, isCorrect: false })),
  ];
  const shift = seed % raw.length;
  const rotated = [...raw.slice(shift), ...raw.slice(0, shift)];
  return rotated.map((opt, idx) => ({
    id: `o${idx + 1}`,
    text: opt.text,
    emoji: opt.emoji,
    isCorrect: opt.isCorrect,
  }));
}

interface MathsTopicContent {
  topicNameHindi: string;
  topicNameEnglish: string;
  dragDrop: NonNullable<ChapterGameData['dragDrop']>;
  matchingPairs: NonNullable<ChapterGameData['matching']>['pairs'];
  countingItems: NonNullable<ChapterGameData['counting']>['items'];
  countingInstructionHindi: string;
  countingInstructionEnglish: string;
  quiz: NonNullable<ChapterGameData['quiz']>;
}

/**
 * Generates chapter-specific Mathematics games and questions based on the exact
 * JCERT chapter title, class level (1–5), and chapter number.
 */
function buildMathsChapterContent(chapter: Chapter): MathsTopicContent {
  const cls = chapter.classNumber;
  const chNum = chapter.chapterNumber;
  const titleText = `${chapter.originalTitleHindi} ${chapter.originalTitleEnglish}`.toLowerCase();
  const qPrefix = `${chapter.id}`;
  const v = cls * 3 + chNum; // Unique per-chapter numeric offset

  // 1. ADDITION (जोड़ / Add)
  if (
    (titleText.includes('जोड़') || titleText.includes('add')) &&
    !titleText.includes('भिन्न') &&
    !titleText.includes('fraction')
  ) {
    const a1 = cls === 1 ? 3 + (chNum % 4) : cls === 2 ? 12 + chNum : cls === 3 ? 125 + chNum * 10 : cls === 4 ? 1240 + chNum * 25 : 2450 + chNum * 50;
    const b1 = cls === 1 ? 2 + (chNum % 3) : cls === 2 ? 8 + chNum : cls === 3 ? 135 + chNum * 5 : cls === 4 ? 1120 + chNum * 15 : 1320 + chNum * 30;
    const sum1 = a1 + b1;

    const a2 = cls === 1 ? 5 : cls === 2 ? 15 + chNum : cls === 3 ? 250 + chNum * 5 : cls === 4 ? 2500 + chNum * 20 : 4500 + chNum * 30;
    const b2 = cls === 1 ? 4 : cls === 2 ? 14 : cls === 3 ? 175 : cls === 4 ? 1650 : 3250;
    const sum2 = a2 + b2;

    const targetSum = cls === 1 ? 10 : cls === 2 ? 20 + chNum * 2 : cls * 100 + chNum * 10;
    const half = Math.floor(targetSum / 2);
    const otherHalf = targetSum - half;

    return {
      topicNameHindi: 'जोड़ (Addition)',
      topicNameEnglish: 'Addition',
      dragDrop: {
        instruction: {
          native: `ᱢᱮᱥᱟ ᱠᱟᱛᱮ ${targetSum} ᱥᱮ ᱚᱱᱟ ᱠᱷᱚᱱ ᱠᱚᱢ ᱮᱞ ᱵᱟᱪᱷᱟᱣ ᱢᱮ! (${chapter.originalTitleHindi})`,
          transliteration: `Mesa kate ${targetSum} se ona khon kom el bachhaw me!`,
          hindi: `पाठ "${chapter.originalTitleHindi}": किन कार्डों का योग ${targetSum} है और किनका ${targetSum} से कम?`,
          english: `Sort the addition cards into Sum = ${targetSum} vs Sum < ${targetSum}!`,
        },
        zones: [
          {
            id: 'equal_target',
            label: { native: `= ${targetSum} (Equal)`, transliteration: `Barabar ${targetSum}`, hindi: `योग = ${targetSum}`, english: `Sum is ${targetSum}` },
            color: 'bg-emerald-500',
          },
          {
            id: 'less_target',
            label: { native: `< ${targetSum} (Smaller)`, transliteration: `${targetSum} khon katij`, hindi: `${targetSum} से कम`, english: `Sum < ${targetSum}` },
            color: 'bg-amber-500',
          },
        ],
        items: [
          { id: `${qPrefix}-d1`, name: { native: `${half} + ${otherHalf}`, transliteration: `${half} plus ${otherHalf}`, hindi: `${half} और ${otherHalf}`, english: `${half} + ${otherHalf}` }, emoji: '➕', correctZone: 'equal_target' },
          { id: `${qPrefix}-d2`, name: { native: `${half - 2} + 1`, transliteration: `${half - 2} plus 1`, hindi: `${half - 2} और 1`, english: `${half - 2} + 1` }, emoji: '🧮', correctZone: 'less_target' },
          { id: `${qPrefix}-d3`, name: { native: `${targetSum - 2} + 2`, transliteration: `${targetSum - 2} plus 2`, hindi: `${targetSum - 2} और 2`, english: `${targetSum - 2} + 2` }, emoji: '🎯', correctZone: 'equal_target' },
          { id: `${qPrefix}-d4`, name: { native: `${cls} + ${cls + 1}`, transliteration: `${cls} plus ${cls + 1}`, hindi: `${cls} और ${cls + 1}`, english: `${cls} + ${cls + 1}` }, emoji: '🔢', correctZone: 'less_target' },
        ],
      },
      matchingPairs: [
        { id: 'm1', emoji: '🍎➕🍎', nativeWord: `${cls * 2} + ${chNum} = ${cls * 2 + chNum}`, transliteration: `${cls * 2} plus ${chNum}`, hindiWord: `योग: ${cls * 2 + chNum}` },
        { id: 'm2', emoji: '🥭➕🥭', nativeWord: `${cls * 4} + ${cls * 2} = ${cls * 6}`, transliteration: `${cls * 4} plus ${cls * 2}`, hindiWord: `योग: ${cls * 6}` },
        { id: 'm3', emoji: '🌟➕🌟', nativeWord: `${v} + 0 = ${v}`, transliteration: 'Zero addition', hindiWord: `शून्य जोड़ने पर: ${v}` },
        { id: 'm4', emoji: '🎈➕🎈', nativeWord: `${v} + ${cls} = ${v + cls}`, transliteration: 'Step addition', hindiWord: `योग: ${v + cls}` },
      ],
      countingItems: [
        { id: 'c1', emoji: '🥭', name: `${chapter.originalTitleHindi} - समूह 1`, count: ((cls + chNum) % 4) + 2 },
        { id: 'c2', emoji: '🍎', name: `${chapter.originalTitleHindi} - समूह 2`, count: ((cls + chNum) % 4) + 4 },
        { id: 'c3', emoji: '🍊', name: `${chapter.originalTitleHindi} - कुल फल`, count: ((cls + chNum) % 4) + 6 },
      ],
      countingInstructionHindi: `पाठ "${chapter.originalTitleHindi}" के लिए फलों को गिनकर जोड़ें!`,
      countingInstructionEnglish: `Count the fruits to practice ${chapter.originalTitleEnglish}!`,
      quiz: [
        {
          id: `${qPrefix}-q1`,
          question: {
            native: `ᱢᱮᱥᱟᱭ ᱢᱮ (Add): ${a1} + ${b1} ᱛᱤᱱᱟᱹᱜ ᱦᱩᱭᱩᱜᱼᱟ?`,
            transliteration: `Mesay me: ${a1} + ${b1} tinag huyug-a?`,
            hindi: `पाठ "${chapter.originalTitleHindi}": ${a1} + ${b1} का कुल योग कितना होगा?`,
            english: `In "${chapter.originalTitleEnglish}": What is ${a1} + ${b1}?`,
          },
          options: arrangeOptions(`${qPrefix}-q1`, { text: `${sum1}`, emoji: '✅' }, [
            { text: `${sum1 + (cls === 1 ? 2 : 10)}`, emoji: '🔢' },
            { text: `${Math.max(1, sum1 - (cls === 1 ? 1 : 10))}`, emoji: '🔢' },
            { text: `${a1}`, emoji: '❓' },
          ]),
          explanation: `${a1} में ${b1} जोड़ने पर ${sum1} प्राप्त होता है (${a1} + ${b1} = ${sum1})।`,
        },
        {
          id: `${qPrefix}-q2`,
          question: {
            native: `ᱴᱚᱠᱨᱤ ᱨᱮ ${a2} ᱩᱞ ᱟᱨ ${b2} ᱡᱟᱢ ᱢᱮᱱᱟᱜᱼᱟ। ᱡᱚᱛᱚ ᱢᱮᱥᱟ ᱠᱟᱛᱮ ᱛᱤᱱᱟᱹᱜ?`,
            transliteration: `Tokri re ${a2} ul ar ${b2} jam menag-a. Joto mesa kate tinag?`,
            hindi: `एक टोकरी में ${a2} आम और ${b2} अमरूद हैं। दोनों मिलाकर कुल कितने फल हैं?`,
            english: `A basket has ${a2} mangoes and ${b2} guavas. How many fruits are there in total?`,
          },
          options: arrangeOptions(`${qPrefix}-q2`, { text: `${sum2} फल`, emoji: '🧺' }, [
            { text: `${sum2 + 5} फल`, emoji: '🥭' },
            { text: `${Math.abs(a2 - b2)} फल`, emoji: '🍐' },
            { text: `${a2} फल`, emoji: '🍎' },
          ]),
          explanation: `कुल फलों की संख्या के लिए हम दोनों को जोड़ते हैं: ${a2} + ${b2} = ${sum2}।`,
        },
        {
          id: `${qPrefix}-q3`,
          question: {
            native: `${v * 3} ᱨᱮ 0 (ᱥᱩᱱ) ᱢᱮᱥᱟ ᱞᱮᱠᱷᱟᱱ ᱛᱤᱱᱟᱹᱜ ᱦᱩᱭᱩᱜᱼᱟ?`,
            transliteration: `${v * 3} re 0 mesa lekhan tinag huyug-a?`,
            hindi: `यदि ${v * 3} में 0 (शून्य) जोड़ा जाए, तो उत्तर क्या होगा?`,
            english: `If you add 0 (zero) to ${v * 3}, what is the answer?`,
          },
          options: arrangeOptions(`${qPrefix}-q3`, { text: `${v * 3}`, emoji: '🎯' }, [
            { text: '0', emoji: '⭕' },
            { text: `${v * 3 + 1}`, emoji: '➕' },
            { text: `${v * 30}`, emoji: '🔟' },
          ]),
          explanation: `किसी भी संख्या में 0 जोड़ने पर वही संख्या रहती है: ${v * 3} + 0 = ${v * 3}।`,
        },
        {
          id: `${qPrefix}-q4`,
          question: {
            native: `ᱠᱷᱟᱹᱞᱤ ᱴᱷᱟᱶ ᱯᱩᱨᱟᱹᱣ ᱢᱮ: ${v * 2} + ___ = ${v * 5}`,
            transliteration: `Khali thanw puraw me: ${v * 2} + ___ = ${v * 5}`,
            hindi: `खाली स्थान भरो: ${v * 2} + ___ = ${v * 5}`,
            english: `Fill in the missing number: ${v * 2} + ___ = ${v * 5}`,
          },
          options: arrangeOptions(`${qPrefix}-q4`, { text: `${v * 3}`, emoji: '🌟' }, [
            { text: `${v * 2}`, emoji: '🔢' },
            { text: `${v * 4}`, emoji: '🔢' },
            { text: `${v * 7}`, emoji: '🔢' },
          ]),
          explanation: `${v * 2} में ${v * 3} जोड़ने पर ${v * 5} बनता है (${v * 2} + ${v * 3} = ${v * 5})।`,
        },
      ],
    };
  }

  // 2. SUBTRACTION / GIVE AND TAKE (घटाव / देना और लेना / आते पक्षी जाते पक्षी)
  if (
    titleText.includes('घटाव') ||
    titleText.includes('subtract') ||
    titleText.includes('देना और लेना') ||
    titleText.includes('give and take') ||
    titleText.includes('आते पक्षी जाते पक्षी') ||
    titleText.includes('birds come')
  ) {
    const m1 = cls === 1 ? 5 + chNum : cls === 2 ? 30 + chNum * 2 : cls === 3 ? 450 + chNum * 10 : 5400 + chNum * 50;
    const s1 = cls === 1 ? 3 : cls === 2 ? 11 + chNum : cls === 3 ? 180 + chNum * 5 : 2150 + chNum * 20;
    const diff1 = m1 - s1;

    const birdsStart = cls === 1 ? 9 : cls === 2 ? 15 + chNum : cls === 3 ? 140 + chNum * 3 : 650 + chNum * 10;
    const birdsFly = cls === 1 ? 4 : cls === 2 ? 6 + (chNum % 5) : cls === 3 ? 55 : 230;
    const birdsLeft = birdsStart - birdsFly;

    return {
      topicNameHindi: 'घटाव (Subtraction)',
      topicNameEnglish: 'Subtraction',
      dragDrop: {
        instruction: {
          native: `ᱜᱷᱟᱴᱟᱣ (Subtraction) ᱟᱨ ᱢᱮᱥᱟ (Addition) ᱵᱷᱮᱜᱟᱨ ᱢᱮ! (${chapter.originalTitleHindi})`,
          transliteration: 'Ghatau ar Mesa bhegar me!',
          hindi: `पाठ "${chapter.originalTitleHindi}": कम होने (घटाव) और बढ़ने (मिलना/जोड़) के कार्डों को अलग करो!`,
          english: `Sort the cards for "${chapter.originalTitleEnglish}" into Take Away (-) vs Get More (+)!`,
        },
        zones: [
          {
            id: 'take_away',
            label: { native: 'ᱜᱷᱟᱴᱟᱣ / ᱮᱢ (Take Away -)', transliteration: 'Ghatau (-)', hindi: 'कम होना / घटाव (-)', english: 'Take Away (-)' },
            color: 'bg-rose-500',
          },
          {
            id: 'get_more',
            label: { native: 'ᱦᱟᱛᱟᱣ / ᱢᱮᱥᱟ (Get More +)', transliteration: 'Mesa (+)', hindi: 'बढ़ना / मिलना (+)', english: 'Get More (+)' },
            color: 'bg-emerald-500',
          },
        ],
        items: [
          { id: `${qPrefix}-d1`, name: { native: `${birdsFly} ᱪᱮᱬᱮ ᱩᱰᱟᱹᱣ ᱮᱱᱟ`, transliteration: `${birdsFly} chene udaw ena`, hindi: `${birdsFly} पक्षी उड़ गए`, english: `${birdsFly} birds flew away` }, emoji: '🐦', correctZone: 'take_away' },
          { id: `${qPrefix}-d2`, name: { native: `${s1} ᱡᱚ ᱮᱢ ᱠᱮᱫᱟ`, transliteration: `${s1} jo em keda`, hindi: `${s1} फल दे दिए`, english: `Gave away ${s1} fruits` }, emoji: '🍎', correctZone: 'take_away' },
          { id: `${qPrefix}-d3`, name: { native: `${chNum} ᱱᱟᱶᱟ ᱯᱚᱛᱚᱵ ᱧᱟᱢ ᱠᱮᱫᱟ`, transliteration: `${chNum} nawa potob nyam keda`, hindi: `${chNum} नई किताबें मिलीं`, english: `Got ${chNum} new books` }, emoji: '📚', correctZone: 'get_more' },
          { id: `${qPrefix}-d4`, name: { native: `${cls + 3} ᱵᱟᱦᱟ ᱦᱮᱡ ᱮᱱᱟ`, transliteration: `${cls + 3} baha hej ena`, hindi: `${cls + 3} और फूल खिले`, english: `${cls + 3} more flowers bloomed` }, emoji: '🌺', correctZone: 'get_more' },
        ],
      },
      matchingPairs: [
        { id: 'm1', emoji: '🐦➖', nativeWord: `${m1} - ${s1} = ${diff1}`, transliteration: `${m1} minus ${s1}`, hindiWord: `शेष: ${diff1}` },
        { id: 'm2', emoji: '🍎➖', nativeWord: `${birdsStart} - ${birdsFly} = ${birdsLeft}`, transliteration: `${birdsStart} minus ${birdsFly}`, hindiWord: `शेष: ${birdsLeft}` },
        { id: 'm3', emoji: '🎈➖', nativeWord: `${v} - ${v} = 0`, transliteration: 'Equal subtraction gives 0', hindiWord: 'बराबर घटाने पर = 0' },
        { id: 'm4', emoji: '🥭➖', nativeWord: `${v * 2} - 0 = ${v * 2}`, transliteration: 'Subtracting zero', hindiWord: `0 घटाने पर = ${v * 2}` },
      ],
      countingItems: [
        { id: 'c1', emoji: '🐦', name: `डाली पर बचे पक्षी (${chapter.originalTitleHindi})`, count: ((chNum + 1) % 5) + 2 },
        { id: 'c2', emoji: '🐿️', name: `पेड़ पर बची गिलहरियाँ (${chapter.originalTitleHindi})`, count: ((chNum + 2) % 5) + 3 },
        { id: 'c3', emoji: '🦋', name: `बगीचे में बची तितलियाँ (${chapter.originalTitleHindi})`, count: ((chNum + 3) % 5) + 4 },
      ],
      countingInstructionHindi: `पाठ "${chapter.originalTitleHindi}": बचे हुए पक्षियों और जीवों को गिनें!`,
      countingInstructionEnglish: `Count how many birds and creatures remain in "${chapter.originalTitleEnglish}"!`,
      quiz: [
        {
          id: `${qPrefix}-q1`,
          question: {
            native: `ᱜᱷᱟᱴᱟᱣ ᱢᱮ (Subtract): ${m1} - ${s1} ᱛᱤᱱᱟᱹᱜ ᱥᱟᱨᱮᱡᱚᱜᱼᱟ?`,
            transliteration: `Ghatau me: ${m1} - ${s1} tinag sarejog-a?`,
            hindi: `पाठ "${chapter.originalTitleHindi}": ${m1} में से ${s1} घटाने पर कितना बचेगा?`,
            english: `In "${chapter.originalTitleEnglish}": What is ${m1} - ${s1}?`,
          },
          options: arrangeOptions(`${qPrefix}-q1`, { text: `${diff1}`, emoji: '✅' }, [
            { text: `${m1 + s1}`, emoji: '➕' },
            { text: `${diff1 + (cls === 1 ? 2 : 10)}`, emoji: '🔢' },
            { text: `${Math.max(0, diff1 - (cls === 1 ? 1 : 10))}`, emoji: '🔢' },
          ]),
          explanation: `${m1} में से ${s1} घटाने पर ${diff1} बचता है (${m1} - ${s1} = ${diff1})।`,
        },
        {
          id: `${qPrefix}-q2`,
          question: {
            native: `ᱫᱟᱨᱮ ᱨᱮ ${birdsStart} ᱪᱮᱬᱮ ᱠᱚ ᱛᱟᱦᱮᱸ ᱠᱟᱱᱟ। ${birdsFly} ᱪᱮᱬᱮ ᱩᱰᱟᱹᱣ ᱮᱱᱟ ᱠᱚ। ᱛᱤᱱᱟᱹᱜ ᱪᱮᱬᱮ ᱥᱟᱨᱮᱡ ᱮᱱᱟ?`,
            transliteration: `Dare re ${birdsStart} chene ko tahen kana. ${birdsFly} chene udaw ena ko. Tinag sarej ena?`,
            hindi: `पेड़ पर ${birdsStart} पक्षी बैठे थे। उनमें से ${birdsFly} पक्षी उड़ गए। अब कितने पक्षी बचे?`,
            english: `There were ${birdsStart} birds on a tree. ${birdsFly} birds flew away. How many birds are left?`,
          },
          options: arrangeOptions(`${qPrefix}-q2`, { text: `${birdsLeft} पक्षी`, emoji: '🐦' }, [
            { text: `${birdsStart + birdsFly} पक्षी`, emoji: '🦅' },
            { text: `${birdsLeft + 2} पक्षी`, emoji: '🦜' },
            { text: `${birdsFly} पक्षी`, emoji: '🕊️' },
          ]),
          explanation: `${birdsStart} पक्षियों में से ${birdsFly} उड़ गए, तो ${birdsStart} - ${birdsFly} = ${birdsLeft} पक्षी बचे।`,
        },
        {
          id: `${qPrefix}-q3`,
          question: {
            native: `${v * 4} ᱠᱷᱚᱱ ${v * 4} ᱜᱷᱟᱴᱟᱣ ᱞᱮᱠᱷᱟᱱ ᱛᱤᱱᱟᱹᱜ ᱥᱟᱨᱮᱡᱚᱜᱼᱟ?`,
            transliteration: `${v * 4} khon ${v * 4} ghatau lekhan tinag sarejog-a?`,
            hindi: `यदि ${v * 4} में से ${v * 4} पूरा घटा दिया जाए, तो क्या बचेगा?`,
            english: `If you subtract ${v * 4} from ${v * 4}, what is left?`,
          },
          options: arrangeOptions(`${qPrefix}-q3`, { text: '0 (शून्य / कुछ नहीं)', emoji: '⭕' }, [
            { text: `${v * 4}`, emoji: '🔢' },
            { text: '1', emoji: '1️⃣' },
            { text: `${v * 8}`, emoji: '➕' },
          ]),
          explanation: `किसी संख्या में से वही संख्या घटाने पर 0 (शून्य) बचता है (${v * 4} - ${v * 4} = 0)।`,
        },
        {
          id: `${qPrefix}-q4`,
          question: {
            native: `ᱨᱟᱢᱩ ᱴᱷᱮᱱ ₹${v * 5} ᱛᱟᱦᱮᱸ ᱠᱟᱱᱟ। ᱩᱱᱤ ₹${v * 2} ᱨᱮᱱᱟᱜ ᱯᱚᱛᱚᱵ ᱮ ᱠᱤᱨᱤᱧ ᱠᱮᱫᱟ। ᱛᱤᱱᱟᱹᱜ ᱴᱟᱠᱟ ᱥᱟᱨᱮᱡ ᱮᱱᱟ?`,
            transliteration: `Ramu then ₹${v * 5} tahen kana. Uni ₹${v * 2} renag potob e kirinj keda. Tinag taka sarej ena?`,
            hindi: `रामू के पास ₹${v * 5} थे। उसने ₹${v * 2} की किताब खरीदी। उसके पास कितने रुपये बचे?`,
            english: `Ramu had ₹${v * 5}. He bought a book for ₹${v * 2}. How much money is left with him?`,
          },
          options: arrangeOptions(`${qPrefix}-q4`, { text: `₹${v * 3}`, emoji: '💰' }, [
            { text: `₹${v * 7}`, emoji: '🪙' },
            { text: `₹${v * 2}`, emoji: '💵' },
            { text: `₹${v}`, emoji: '🧾' },
          ]),
          explanation: `₹${v * 5} - ₹${v * 2} = ₹${v * 3} शेष बचे।`,
        },
      ],
    };
  }

  // 3. MULTIPLICATION (गुणा / Multiplication)
  if (
    (titleText.includes('गुणा') || titleText.includes('multiplication')) &&
    !titleText.includes('गुणज')
  ) {
    const f1 = cls + 2;
    const f2 = chNum + 2;
    const prod1 = f1 * f2;

    const boxes = cls + 1;
    const perBox = chNum + 3;
    const totalItems = boxes * perBox;

    return {
      topicNameHindi: 'गुणा (Multiplication)',
      topicNameEnglish: 'Multiplication',
      dragDrop: {
        instruction: {
          native: `ᱜᱟᱵᱟᱬ (Multiplication) ᱨᱮᱱᱟᱜ ᱴᱷᱤᱠ ᱡᱚᱲ ᱵᱟᱪᱷᱟᱣ ᱢᱮ! (${chapter.originalTitleHindi})`,
          transliteration: 'Gaban renag thik jor bachhaw me!',
          hindi: `पाठ "${chapter.originalTitleHindi}": किन गुणा कार्डों का मान ${cls * 10} से अधिक है और किनका कम?`,
          english: `Sort the multiplication cards into Product > ${cls * 10} vs Product <= ${cls * 10}!`,
        },
        zones: [
          {
            id: 'gt_zone',
            label: { native: `> ${cls * 10}`, transliteration: `${cls * 10} khon barti`, hindi: `गुणनफल > ${cls * 10}`, english: `Product > ${cls * 10}` },
            color: 'bg-emerald-500',
          },
          {
            id: 'le_zone',
            label: { native: `≤ ${cls * 10}`, transliteration: `${cls * 10} se kom`, hindi: `गुणनफल ≤ ${cls * 10}`, english: `Product ≤ ${cls * 10}` },
            color: 'bg-amber-500',
          },
        ],
        items: [
          { id: `${qPrefix}-d1`, name: { native: `${cls * 3} × 4 = ${cls * 12}`, transliteration: `${cls * 3} times 4`, hindi: `${cls * 3} × 4 = ${cls * 12}`, english: `${cls * 3} × 4 = ${cls * 12}` }, emoji: '✖️', correctZone: 'gt_zone' },
          { id: `${qPrefix}-d2`, name: { native: `${cls} × 5 = ${cls * 5}`, transliteration: `${cls} times 5`, hindi: `${cls} × 5 = ${cls * 5}`, english: `${cls} × 5 = ${cls * 5}` }, emoji: '🔢', correctZone: 'le_zone' },
          { id: `${qPrefix}-d3`, name: { native: `${cls * 4} × 3 = ${cls * 12}`, transliteration: `${cls * 4} times 3`, hindi: `${cls * 4} × 3 = ${cls * 12}`, english: `${cls * 4} × 3 = ${cls * 12}` }, emoji: '🧮', correctZone: 'gt_zone' },
          { id: `${qPrefix}-d4`, name: { native: `${cls} × 8 = ${cls * 8}`, transliteration: `${cls} times 8`, hindi: `${cls} × 8 = ${cls * 8}`, english: `${cls} × 8 = ${cls * 8}` }, emoji: '🎲', correctZone: 'le_zone' },
        ],
      },
      matchingPairs: [
        { id: 'm1', emoji: '🚲', nativeWord: `2 × ${cls + 1} = ${2 * (cls + 1)}`, transliteration: `2 times ${cls + 1}`, hindiWord: `${cls + 1} साइकिलों के पहिए = ${2 * (cls + 1)}` },
        { id: 'm2', emoji: '🛺', nativeWord: `3 × ${cls + 2} = ${3 * (cls + 2)}`, transliteration: `3 times ${cls + 2}`, hindiWord: `${cls + 2} ऑटो के पहिए = ${3 * (cls + 2)}` },
        { id: 'm3', emoji: '🚗', nativeWord: `4 × ${cls + 1} = ${4 * (cls + 1)}`, transliteration: `4 times ${cls + 1}`, hindiWord: `${cls + 1} कारों के पहिए = ${4 * (cls + 1)}` },
        { id: 'm4', emoji: '🖐️', nativeWord: `5 × ${chNum} = ${5 * chNum}`, transliteration: `5 times ${chNum}`, hindiWord: `${chNum} हाथों की उँगलियाँ = ${5 * chNum}` },
      ],
      countingItems: [
        { id: 'c1', emoji: '🍒', name: `बराबर समूह A (${chapter.originalTitleHindi})`, count: 4 },
        { id: 'c2', emoji: '🌸', name: `बराबर समूह B (${chapter.originalTitleHindi})`, count: 6 },
        { id: 'c3', emoji: '⭐', name: `बराबर समूह C (${chapter.originalTitleHindi})`, count: 8 },
      ],
      countingInstructionHindi: `पाठ "${chapter.originalTitleHindi}": बराबर समूहों में गिनकर गुणा का अभ्यास करें!`,
      countingInstructionEnglish: `Count in equal groups to practice "${chapter.originalTitleEnglish}"!`,
      quiz: [
        {
          id: `${qPrefix}-q1`,
          question: {
            native: `ᱜᱟᱵᱟᱬ ᱢᱮ (Multiply): ${f1} × ${f2} ᱛᱤᱱᱟᱹᱜ ᱦᱩᱭᱩᱜᱼᱟ?`,
            transliteration: `Gaban me: ${f1} × ${f2} tinag huyug-a?`,
            hindi: `पाठ "${chapter.originalTitleHindi}": ${f1} × ${f2} का मान क्या होगा?`,
            english: `Multiply: What is ${f1} × ${f2}?`,
          },
          options: arrangeOptions(`${qPrefix}-q1`, { text: `${prod1}`, emoji: '✖️' }, [
            { text: `${f1 + f2}`, emoji: '➕' },
            { text: `${prod1 + f1}`, emoji: '🔢' },
            { text: `${prod1 - 2}`, emoji: '🔢' },
          ]),
          explanation: `${f1} का पहाड़ा ${f2} बार पढ़ने पर ${prod1} आता है (${f1} × ${f2} = ${prod1})।`,
        },
        {
          id: `${qPrefix}-q2`,
          question: {
            native: `ᱢᱤᱫ ᱵᱟᱠᱥᱟ ᱨᱮ ${perBox} ᱯᱮᱱᱥᱤᱞ ᱢᱮᱱᱟᱜᱼᱟ। ${boxes} ᱵᱟᱠᱥᱟ ᱨᱮ ᱡᱚᱛᱚ ᱛᱤᱱᱟᱹᱜ ᱯᱮᱱᱥᱤᱞ ᱦᱩᱭᱩᱜᱼᱟ?`,
            transliteration: `Mit baksa re ${perBox} pencil menag-a. ${boxes} baksa re joto tinag pencil huyug-a?`,
            hindi: `एक डिब्बे में ${perBox} पेंसिलें हैं। ऐसे ${boxes} डिब्बों में कुल कितनी पेंसिलें होंगी?`,
            english: `One box has ${perBox} pencils. How many pencils are there in ${boxes} such boxes?`,
          },
          options: arrangeOptions(`${qPrefix}-q2`, { text: `${totalItems} पेंसिलें`, emoji: '✏️' }, [
            { text: `${boxes + perBox} पेंसिलें`, emoji: '📦' },
            { text: `${totalItems + 6} पेंसिलें`, emoji: '✏️' },
            { text: `${totalItems - 4} पेंसिलें`, emoji: '✏️' },
          ]),
          explanation: `कुल पेंसिलें = ${boxes} × ${perBox} = ${totalItems} पेंसिलें।`,
        },
        {
          id: `${qPrefix}-q3`,
          question: {
            native: `ᱡᱟᱦᱟᱸ ᱮᱞ ᱨᱮ 0 (ᱥᱩᱱ) ᱛᱮ ᱜᱟᱵᱟᱬ ᱞᱮᱠᱷᱟᱱ ᱛᱤᱱᱟᱹᱜ ᱦᱩᱭᱩᱜᱼᱟ? (${v * 5} × 0 = ?)`,
            transliteration: `Jahan el re 0 te gaban lekhan tinag huyug-a? (${v * 5} × 0 = ?)`,
            hindi: `किसी भी संख्या को 0 (शून्य) से गुणा करने पर क्या उत्तर आता है? (${v * 5} × 0 = ?)`,
            english: `What do you get when you multiply any number by 0? (${v * 5} × 0 = ?)`,
          },
          options: arrangeOptions(`${qPrefix}-q3`, { text: '0 (शून्य)', emoji: '⭕' }, [
            { text: `${v * 5}`, emoji: '🔢' },
            { text: '1', emoji: '1️⃣' },
            { text: `${v * 50}`, emoji: '🔟' },
          ]),
          explanation: `किसी भी संख्या को 0 से गुणा करने पर गुणनफल हमेशा 0 होता है।`,
        },
        {
          id: `${qPrefix}-q4`,
          question: {
            native: `बार-बार जोड़ को गुणा में लिखो: ${v} + ${v} + ${v} + ${v} = ?`,
            transliteration: `4 dhao ${v} mesa lekhan tinag huyug-a?`,
            hindi: `बार-बार जोड़ने को गुणा के रूप में बताओ: ${v} + ${v} + ${v} + ${v} किसके बराबर है?`,
            english: `Repeated addition: ${v} + ${v} + ${v} + ${v} is equal to:`,
          },
          options: arrangeOptions(`${qPrefix}-q4`, { text: `4 × ${v} = ${4 * v}`, emoji: '🎯' }, [
            { text: `4 + ${v} = ${4 + v}`, emoji: '➕' },
            { text: `3 × ${v} = ${3 * v}`, emoji: '🔢' },
            { text: `5 × ${v} = ${5 * v}`, emoji: '🔢' },
          ]),
          explanation: `${v} को 4 बार जोड़ना 4 × ${v} = ${4 * v} कहलाता है।`,
        },
      ],
    };
  }

  // 4. DIVISION (भाग / Division)
  if (titleText.includes('भाग') || titleText.includes('division')) {
    const divisor = cls + 1;
    const quotient = chNum + 2;
    const dividend = divisor * quotient;

    const kids = cls + 2;
    const eachGets = 4;
    const sweets = kids * eachGets;

    return {
      topicNameHindi: 'भाग - बराबर बँटवारा (Division)',
      topicNameEnglish: 'Division (Equal Sharing)',
      dragDrop: {
        instruction: {
          native: `ᱦᱟᱹᱴᱤᱧ (Division) ᱠᱟᱛᱮ ᱴᱷᱤᱠ ᱩᱛᱟᱹᱨ ᱥᱟᱶ ᱢᱤᱞᱟᱹᱣ ᱢᱮ! (${chapter.originalTitleHindi})`,
          transliteration: 'Hatinj kate thik utar saw milaw me!',
          hindi: `पाठ "${chapter.originalTitleHindi}": भाग के प्रश्नों को उनके सही भागफल (${cls} या ${cls + 1}) के समूह में रखो!`,
          english: `Sort the division cards into Quotient = ${cls} vs Quotient = ${cls + 1}!`,
        },
        zones: [
          {
            id: 'q_cls',
            label: { native: `भागफल = ${cls}`, transliteration: `Utar = ${cls}`, hindi: `भागफल = ${cls}`, english: `Answer is ${cls}` },
            color: 'bg-emerald-500',
          },
          {
            id: 'q_next',
            label: { native: `भागफल = ${cls + 1}`, transliteration: `Utar = ${cls + 1}`, hindi: `भागफल = ${cls + 1}`, english: `Answer is ${cls + 1}` },
            color: 'bg-sky-500',
          },
        ],
        items: [
          { id: `${qPrefix}-d1`, name: { native: `${cls * 3} ÷ 3`, transliteration: `${cls * 3} divided by 3`, hindi: `${cls * 3} ÷ 3`, english: `${cls * 3} ÷ 3` }, emoji: '➗', correctZone: 'q_cls' },
          { id: `${qPrefix}-d2`, name: { native: `${(cls + 1) * 3} ÷ 3`, transliteration: `${(cls + 1) * 3} divided by 3`, hindi: `${(cls + 1) * 3} ÷ 3`, english: `${(cls + 1) * 3} ÷ 3` }, emoji: '🍬', correctZone: 'q_next' },
          { id: `${qPrefix}-d3`, name: { native: `${cls * 5} ÷ 5`, transliteration: `${cls * 5} divided by 5`, hindi: `${cls * 5} ÷ 5`, english: `${cls * 5} ÷ 5` }, emoji: '🍎', correctZone: 'q_cls' },
          { id: `${qPrefix}-d4`, name: { native: `${(cls + 1) * 5} ÷ 5`, transliteration: `${(cls + 1) * 5} divided by 5`, hindi: `${(cls + 1) * 5} ÷ 5`, english: `${(cls + 1) * 5} ÷ 5` }, emoji: '🌟', correctZone: 'q_next' },
        ],
      },
      matchingPairs: [
        { id: 'm1', emoji: '🍪', nativeWord: `${dividend} ÷ ${divisor}`, transliteration: `${dividend} shared by ${divisor}`, hindiWord: `भागफल = ${quotient}` },
        { id: 'm2', emoji: '🥭', nativeWord: `${sweets} ÷ ${kids}`, transliteration: `${sweets} shared by ${kids}`, hindiWord: `भागफल = ${eachGets}` },
        { id: 'm3', emoji: '✏️', nativeWord: `${v * 2} ÷ 2`, transliteration: `${v * 2} shared by 2`, hindiWord: `भागफल = ${v}` },
        { id: 'm4', emoji: '📚', nativeWord: `${v} ÷ 1`, transliteration: `${v} divided by 1`, hindiWord: `भागफल = ${v}` },
      ],
      countingItems: [
        { id: 'c1', emoji: '🍬', name: `${sweets} टॉफियाँ ÷ ${kids} बच्चे = प्रत्येक को`, count: eachGets },
        { id: 'c2', emoji: '🍎', name: '18 सेब ÷ 3 बच्चे = प्रत्येक को', count: 6 },
        { id: 'c3', emoji: '🎈', name: '21 गुब्बारे ÷ 3 बच्चे = प्रत्येक को', count: 7 },
      ],
      countingInstructionHindi: `पाठ "${chapter.originalTitleHindi}": बराबर बाँटने के बाद एक बच्चे को मिली वस्तुएँ गिनें!`,
      countingInstructionEnglish: `Count how many items each child gets after equal sharing!`,
      quiz: [
        {
          id: `${qPrefix}-q1`,
          question: {
            native: `ᱦᱟᱹᱴᱤᱧ ᱢᱮ (Divide): ${dividend} ÷ ${divisor} ᱛᱤᱱᱟᱹᱜ ᱦᱩᱭᱩᱜᱼᱟ?`,
            transliteration: `Hatinj me: ${dividend} ÷ ${divisor} tinag huyug-a?`,
            hindi: `पाठ "${chapter.originalTitleHindi}": ${dividend} ÷ ${divisor} का भागफल क्या होगा?`,
            english: `Divide: What is ${dividend} ÷ ${divisor}?`,
          },
          options: arrangeOptions(`${qPrefix}-q1`, { text: `${quotient}`, emoji: '➗' }, [
            { text: `${quotient + 2}`, emoji: '🔢' },
            { text: `${Math.max(1, quotient - 1)}`, emoji: '🔢' },
            { text: `${dividend - divisor}`, emoji: '➖' },
          ]),
          explanation: `${dividend} को ${divisor} बराबर भागों में बाँटने पर ${quotient} आता है (${divisor} × ${quotient} = ${dividend})।`,
        },
        {
          id: `${qPrefix}-q2`,
          question: {
            native: `${sweets} ᱞᱟᱹᱰᱩ ${kids} ᱜᱤᱫᱽᱨᱟᱹ ᱠᱚ ᱛᱟᱞᱟ ᱨᱮ ᱵᱟᱨᱟᱵᱟᱹᱨᱤ ᱦᱟᱹᱴᱤᱧ ᱞᱮᱠᱷᱟᱱ ᱢᱤᱫ ᱜᱤᱫᱽᱨᱟᱹ ᱛᱤᱱᱟᱹᱜ ᱮ ᱧᱟᱢᱟ?`,
            transliteration: `${sweets} ladu ${kids} gidra ko tala re barabari hatinj lekhan mit gidra tinag e nyama?`,
            hindi: `${sweets} लड्डुओं को ${kids} बच्चों में बराबर-बराबर बाँटने पर प्रत्येक बच्चे को कितने लड्डू मिलेंगे?`,
            english: `If ${sweets} laddoos are shared equally among ${kids} children, how many laddoos does each child get?`,
          },
          options: arrangeOptions(`${qPrefix}-q2`, { text: `${eachGets} लड्डू`, emoji: '🍬' }, [
            { text: `${eachGets + 2} लड्डू`, emoji: '🍬' },
            { text: `${sweets - kids} लड्डू`, emoji: '🍬' },
            { text: `${kids} लड्डू`, emoji: '🍬' },
          ]),
          explanation: `${sweets} ÷ ${kids} = ${eachGets}, इसलिए हर बच्चे को ${eachGets} लड्डू मिलेंगे।`,
        },
        {
          id: `${qPrefix}-q3`,
          question: {
            native: `ᱡᱟᱦᱟᱸ ᱮᱞ 1 ᱛᱮ ᱦᱟᱹᱴᱤᱧ ᱞᱮᱠᱷᱟᱱ ᱪᱮᱫ ᱩᱛᱟᱹᱨ ᱧᱟᱢᱚᱜᱼᱟ? (${v * 3} ÷ 1 = ?)`,
            transliteration: `${v * 3} ÷ 1 tinag huyug-a?`,
            hindi: `${v * 3} को 1 से भाग देने पर क्या उत्तर आएगा? (${v * 3} ÷ 1 = ?)`,
            english: `What is ${v * 3} divided by 1? (${v * 3} ÷ 1 = ?)`,
          },
          options: arrangeOptions(`${qPrefix}-q3`, { text: `${v * 3}`, emoji: '🎯' }, [
            { text: '1', emoji: '1️⃣' },
            { text: '0', emoji: '⭕' },
            { text: `${v}`, emoji: '🔢' },
          ]),
          explanation: `किसी भी संख्या को 1 से भाग देने पर वही संख्या प्राप्त होती है (${v * 3} ÷ 1 = ${v * 3})।`,
        },
        {
          id: `${qPrefix}-q4`,
          question: {
            native: `${kids * 3 + 2} 귤 ${kids} ᱜᱤᱫᱽᱨᱟᱹ ᱴᱷᱮᱱ ᱵᱟᱨᱟᱵᱟᱹᱨᱤ ᱦᱟᱹᱴᱤᱧ ᱞᱮᱠᱷᱟᱱ ᱛᱤᱱᱟᱹᱜ ᱥᱟᱨᱮᱡ (Remainder) ᱛᱟᱦᱮᱸᱱᱟ?`,
            transliteration: `${kids * 3 + 2} jo ${kids} gidra then hatinj lekhan tinag sarej tahena?`,
            hindi: `${kids * 3 + 2} फलों को ${kids} बच्चों में बराबर बाँटने के बाद कितने फल शेष (Remainder) बचेंगे?`,
            english: `When ${kids * 3 + 2} fruits are shared equally among ${kids} children, how many fruits are left over (remainder)?`,
          },
          options: arrangeOptions(`${qPrefix}-q4`, { text: '2 फल शेष (Remainder 2)', emoji: '🍊' }, [
            { text: '3 फल शेष', emoji: '🍊' },
            { text: '1 फल शेष', emoji: '🍊' },
            { text: '0 फल शेष', emoji: '⭕' },
          ]),
          explanation: `${kids} × 3 = ${kids * 3} फल बँट जाएँगे और 2 फल शेष (Remainder) बचेंगे।`,
        },
      ],
    };
  }

  // 5. MULTIPLES & FACTORS (गुणज और गुणनखंड - LCM & HCF)
  if (titleText.includes('गुणज') || titleText.includes('गुणनखंड') || titleText.includes('multiple') || titleText.includes('factor')) {
    return {
      topicNameHindi: 'गुणज और गुणनखंड (Multiples & Factors)',
      topicNameEnglish: 'Multiples & Factors (LCM & HCF)',
      dragDrop: {
        instruction: {
          native: '5 ᱨᱮᱱᱟᱜ ᱜᱟᱵᱟᱬᱤᱭᱟᱹ (Multiples of 5) ᱟᱨ 12 ᱨᱮᱱᱟᱜ ᱠᱮᱪᱮᱫᱤᱭᱟᱹ (Factors of 12) ᱵᱷᱮᱜᱟᱨ ᱢᱮ!',
          transliteration: '5 renag Multiple ar 12 renag Factor bhegar me!',
          hindi: '5 के गुणज (Multiples of 5) और 12 के गुणनखंड (Factors of 12) को सही समूह में रखो!',
          english: 'Sort numbers into Multiples of 5 vs Factors of 12!',
        },
        zones: [
          { id: 'mult5', label: { native: '5 ᱨᱮᱱᱟᱜ ᱜᱟᱵᱟᱬᱤᱭᱟᱹ', transliteration: 'Multiples of 5', hindi: '5 के गुणज', english: 'Multiples of 5' }, color: 'bg-emerald-500' },
          { id: 'fact12', label: { native: '12 ᱨᱮᱱᱟᱜ ᱠᱮᱪᱮᱫᱤᱭᱟᱹ', transliteration: 'Factors of 12', hindi: '12 के गुणनखंड', english: 'Factors of 12' }, color: 'bg-purple-500' },
        ],
        items: [
          { id: `${qPrefix}-d1`, name: { native: '15 (5 × 3)', transliteration: '15', hindi: 'संख्या 15', english: '15' }, emoji: '5️⃣', correctZone: 'mult5' },
          { id: `${qPrefix}-d2`, name: { native: '25 (5 × 5)', transliteration: '25', hindi: 'संख्या 25', english: '25' }, emoji: '🎯', correctZone: 'mult5' },
          { id: `${qPrefix}-d3`, name: { native: '3 (12 ÷ 3 = 4)', transliteration: '3', hindi: 'संख्या 3', english: '3' }, emoji: '🧩', correctZone: 'fact12' },
          { id: `${qPrefix}-d4`, name: { native: '6 (12 ÷ 6 = 2)', transliteration: '6', hindi: 'संख्या 6', english: '6' }, emoji: '🔢', correctZone: 'fact12' },
        ],
      },
      matchingPairs: [
        { id: 'm1', emoji: '✖️', nativeWord: '4 के प्रथम 3 गुणज', transliteration: 'First 3 multiples of 4', hindiWord: '4, 8, 12' },
        { id: 'm2', emoji: '➗', nativeWord: '10 के गुणनखंड', transliteration: 'Factors of 10', hindiWord: '1, 2, 5, 10' },
        { id: 'm3', emoji: '🔗', nativeWord: '4 और 6 का ल.स. (LCM)', transliteration: 'LCM of 4 and 6', hindiWord: '12' },
        { id: 'm4', emoji: '🏅', nativeWord: '8 और 12 का म.स. (HCF)', transliteration: 'HCF of 8 and 12', hindiWord: '4' },
      ],
      countingItems: [
        { id: 'c1', emoji: '⭐', name: '6 के कुल गुणनखंड (1, 2, 3, 6) की संख्या', count: 4 },
        { id: 'c2', emoji: '🔵', name: '2 और 3 का सबसे छोटा साझा गुणज (LCM)', count: 6 },
        { id: 'c3', emoji: '🟢', name: '16 और 24 का महत्तम समापवर्तक (HCF)', count: 8 },
      ],
      countingInstructionHindi: 'गुणनखंड और ल.स./म.स. की संख्या गिनकर चुनें!',
      countingInstructionEnglish: 'Count the factors, LCM, and HCF values!',
      quiz: [
        {
          id: `${qPrefix}-q1`,
          question: {
            native: 'ᱱᱚᱶᱟ ᱠᱚ ᱢᱩᱫᱽ ᱨᱮ ᱚᱠᱟᱴᱟᱜ ᱫᱚ 7 ᱨᱮᱱᱟᱜ ᱜᱟᱵᱟᱬᱤᱭᱟᱹ (Multiple of 7) ᱠᱟᱱᱟ?',
            transliteration: 'Nowa ko mud re okatag do 7 renag multiple kana?',
            hindi: 'निम्नलिखित में से कौन-सी संख्या 7 का गुणज (Multiple of 7) है?',
            english: 'Which of the following numbers is a multiple of 7?',
          },
          options: arrangeOptions(`${qPrefix}-q1`, { text: '28 (7 × 4)', emoji: '✅' }, [
            { text: '24', emoji: '🔢' },
            { text: '30', emoji: '🔢' },
            { text: '17', emoji: '🔢' },
          ]),
          explanation: '7 × 4 = 28, इसलिए 28 संख्या 7 का गुणज (Multiple) है।',
        },
        {
          id: `${qPrefix}-q2`,
          question: {
            native: '18 ᱨᱮᱱᱟᱜ ᱢᱤᱫ ᱠᱮᱪᱮᱫᱤᱭᱟᱹ (Factor of 18) ᱚᱠᱟᱴᱟᱜ ᱠᱟᱱᱟ?',
            transliteration: '18 renag mit factor okatag kana?',
            hindi: 'संख्या 18 का एक गुणनखंड (Factor) इनमें से कौन-सा है?',
            english: 'Which of these is a factor of 18?',
          },
          options: arrangeOptions(`${qPrefix}-q2`, { text: '6 (क्योंकि 6 × 3 = 18)', emoji: '🧩' }, [
            { text: '4', emoji: '🔢' },
            { text: '5', emoji: '🔢' },
            { text: '7', emoji: '🔢' },
          ]),
          explanation: '18 में 6 से पूरा-पूरा भाग जाता है (18 ÷ 6 = 3), अतः 6 इसका गुणनखंड है।',
        },
        {
          id: `${qPrefix}-q3`,
          question: {
            native: '4 ᱟᱨ 6 ᱨᱮᱱᱟᱜ ᱞᱚ.ᱥᱚ. (LCM - Least Common Multiple) ᱛᱤᱱᱟᱹᱜ ᱠᱟᱱᱟ?',
            transliteration: '4 ar 6 renag LCM tinag kana?',
            hindi: '4 और 6 का लघुत्तम समापवर्त्य (ल.स. / LCM) क्या है?',
            english: 'What is the Least Common Multiple (LCM) of 4 and 6?',
          },
          options: arrangeOptions(`${qPrefix}-q3`, { text: '12', emoji: '🎯' }, [
            { text: '24', emoji: '🔢' },
            { text: '2', emoji: '🔢' },
            { text: '10', emoji: '🔢' },
          ]),
          explanation: '4 के गुणज (4, 8, 12...) और 6 के गुणज (6, 12...) में सबसे छोटा साझा गुणज 12 है।',
        },
        {
          id: `${qPrefix}-q4`,
          question: {
            native: 'ᱡᱚᱛᱚ ᱮᱞ ᱨᱮᱱᱟᱜ ᱡᱚᱛᱚ ᱠᱷᱚᱱ ᱠᱟᱹᱴᱤᱡ ᱠᱮᱪᱮᱫᱤᱭᱟᱹ (Smallest Factor) ᱪᱮᱫ ᱠᱟᱱᱟ?',
            transliteration: 'Joto el renag joto khon katij factor chet kana?',
            hindi: 'प्रत्येक संख्या का सबसे छोटा गुणनखंड (Factor) कौन-सा होता है?',
            english: 'What is the smallest factor of every number?',
          },
          options: arrangeOptions(`${qPrefix}-q4`, { text: '1', emoji: '1️⃣' }, [
            { text: '0', emoji: '⭕' },
            { text: '2', emoji: '2️⃣' },
            { text: '10', emoji: '🔟' },
          ]),
          explanation: '1 हर संख्या को विभाजित करता है, इसलिए 1 प्रत्येक संख्या का सबसे छोटा गुणनखंड है।',
        },
      ],
    };
  }

  // 6. FRACTIONS (भिन्न / Fractions)
  if (titleText.includes('भिन्न') || titleText.includes('fraction')) {
    const denom = cls + 3; // Class 3 -> 6, Class 4 -> 7, Class 5 -> 8
    return {
      topicNameHindi: 'भिन्न की समझ (Fractions)',
      topicNameEnglish: 'Fractions',
      dragDrop: {
        instruction: {
          native: `ᱠᱮᱪᱮᱫ ᱦᱟᱹᱴᱤᱧ (Fractions): ᱟᱫᱷᱟ (1/2) ᱟᱨ ᱯᱩᱱ ᱦᱟᱹᱴᱤᱧ ᱢᱤᱫ (1/4) ᱵᱷᱮᱜᱟᱨ ᱢᱮ! (${chapter.originalTitleHindi})`,
          transliteration: 'Adha (1/2) ar Chauthai (1/4) bhegar me!',
          hindi: `पाठ "${chapter.originalTitleHindi}": आधे (1/2) के तुल्य और चौथाई (1/4) के तुल्य भिन्नों को अलग करो!`,
          english: 'Sort the fractions into Equal to One-Half (1/2) vs One-Quarter (1/4)!',
        },
        zones: [
          { id: 'half', label: { native: 'ᱟᱫᱷᱟ (1/2 - Half)', transliteration: 'Adha (1/2)', hindi: 'आधा (1/2)', english: 'Half (1/2)' }, color: 'bg-emerald-500' },
          { id: 'quarter', label: { native: 'ᱯᱩᱱ ᱦᱟᱹᱴᱤᱧ ᱢᱤᱫ (1/4)', transliteration: 'Chauthai (1/4)', hindi: 'चौथाई (1/4)', english: 'Quarter (1/4)' }, color: 'bg-amber-500' },
        ],
        items: [
          { id: `${qPrefix}-d1`, name: { native: `${cls}/${cls * 2} (= 1/2)`, transliteration: `${cls} out of ${cls * 2}`, hindi: `${cls}/${cls * 2} (आधा)`, english: `${cls}/${cls * 2} (Half)` }, emoji: '🍕', correctZone: 'half' },
          { id: `${qPrefix}-d2`, name: { native: `${cls}/${cls * 4} (= 1/4)`, transliteration: `${cls} out of ${cls * 4}`, hindi: `${cls}/${cls * 4} (चौथाई)`, english: `${cls}/${cls * 4} (Quarter)` }, emoji: '🥧', correctZone: 'quarter' },
          { id: `${qPrefix}-d3`, name: { native: '2/4 (Equivalent to 1/2)', transliteration: '2 by 4', hindi: '4 में से 2 भाग (2/4)', english: '2/4 (Two quarters)' }, emoji: '🫓', correctZone: 'half' },
          { id: `${qPrefix}-d4`, name: { native: '1/4 (One Quarter)', transliteration: '1 by 4', hindi: '4 में से 1 भाग (1/4)', english: '1/4 (One fourth)' }, emoji: '🍰', correctZone: 'quarter' },
        ],
      },
      matchingPairs: [
        { id: 'm1', emoji: '🌓', nativeWord: '1/2 (ᱟᱫᱷᱟ)', transliteration: 'Adha / Half', hindiWord: 'आधा (दो में से एक भाग)' },
        { id: 'm2', emoji: '🍕', nativeWord: '1/4 (चौथाई)', transliteration: 'One-fourth / Quarter', hindiWord: 'एक-चौथाई (चार में से एक)' },
        { id: 'm3', emoji: '🥧', nativeWord: '3/4 (तीन-चौथाई)', transliteration: 'Three-fourths', hindiWord: 'तीन-चौथाई (चार में से तीन)' },
        { id: 'm4', emoji: '🌕', nativeWord: `${denom}/${denom} = 1`, transliteration: 'Whole', hindiWord: 'एक पूरा (संपूर्ण)' },
      ],
      countingItems: [
        { id: 'c1', emoji: '🍕', name: `रोटी के आधे टुकड़े (${chapter.originalTitleHindi})`, count: 2 },
        { id: 'c2', emoji: '🥧', name: `एक पूरे में चौथाई टुकड़े (${chapter.originalTitleHindi})`, count: 4 },
        { id: 'c3', emoji: '🍫', name: `${cls}/${denom} में रंगे हुए भाग (Numerator)`, count: cls },
      ],
      countingInstructionHindi: `पाठ "${chapter.originalTitleHindi}" में भिन्न के भाग गिनें!`,
      countingInstructionEnglish: `Count the equal parts in each fraction for "${chapter.originalTitleEnglish}"!`,
      quiz: [
        {
          id: `${qPrefix}-q1`,
          question: {
            native: `ᱢᱤᱫ ᱨᱩᱴᱤ ${denom} ᱵᱟᱨᱟᱵᱟᱹᱨᱤ ᱦᱟᱹᱴᱤᱧ ᱠᱟᱛᱮ 1 ᱦᱟᱹᱴᱤᱧ ᱦᱟᱛᱟᱣ ᱞᱮᱠᱷᱟᱱ ᱚᱱᱟ ᱵᱷᱤᱱᱱ (Fraction) ᱪᱮᱫ ᱠᱚ ᱢᱮᱛᱟᱜᱼᱟ?`,
            transliteration: `Mit ruti ${denom} barabari hatinj kate 1 hatinj hataw lekhan ona fraction chet ko metag-a?`,
            hindi: `पाठ "${chapter.originalTitleHindi}": एक रोटी के ${denom} बराबर टुकड़े करके 1 टुकड़ा लेने पर उसे भिन्न में कैसे लिखेंगे?`,
            english: `If a chapati is cut into ${denom} equal parts and you take 1 part, what fraction is it?`,
          },
          options: arrangeOptions(`${qPrefix}-q1`, { text: `1/${denom}`, emoji: '🫓' }, [
            { text: `${denom}/1`, emoji: '🍕' },
            { text: `2/${denom}`, emoji: '🥧' },
            { text: '1/2', emoji: '🔢' },
          ]),
          explanation: `कुल ${denom} बराबर भागों में से 1 भाग को 1/${denom} लिखा जाता है।`,
        },
        {
          id: `${qPrefix}-q2`,
          question: {
            native: `भिन्न ${cls}/${denom} में अंश (Numerator) कौन-सी संख्या है?`,
            transliteration: `Fraction ${cls}/${denom} re Numerator (chetan el) okatag kana?`,
            hindi: `भिन्न ${cls}/${denom} में ऊपर वाली संख्या यानी अंश (Numerator) क्या है?`,
            english: `In the fraction ${cls}/${denom}, which number is the numerator (top number)?`,
          },
          options: arrangeOptions(`${qPrefix}-q2`, { text: `${cls}`, emoji: '⬆️' }, [
            { text: `${denom}`, emoji: '⬇️' },
            { text: `${cls + denom}`, emoji: '➕' },
            { text: `${denom - cls}`, emoji: '➖' },
          ]),
          explanation: `भिन्न ${cls}/${denom} में ऊपर की संख्या ${cls} अंश (Numerator) है और नीचे की संख्या ${denom} हर (Denominator) है।`,
        },
        {
          id: `${qPrefix}-q3`,
          question: {
            native: cls === 4 ? '1/3 ᱨᱮᱱᱟᱜ ᱥᱚᱢᱟᱱ ᱵᱷᱤᱱᱱ (Equivalent Fraction) ᱚᱠᱟᱴᱟᱜ ᱠᱟᱱᱟ?' : cls === 5 ? 'घटाइए: 5/7 - 2/7 = ?' : 'दो आधे (1/2 + 1/2) मिलकर क्या बनाते हैं?',
            transliteration: cls === 4 ? '1/3 renag equivalent fraction okatag kana?' : cls === 5 ? '5/7 - 2/7 tinag huyug-a?' : 'Bar adha (1/2 + 1/2) mesa kate chet benaw-a?',
            hindi: cls === 4 ? '1/3 के समतुल्य भिन्न (Equivalent Fraction) कौन-सी है?' : cls === 5 ? 'समान हर वाली भिन्नों को घटाओ: 5/7 - 2/7 कितना होगा?' : 'आधा और आधा (1/2 + 1/2) मिलकर कितना होता है?',
            english: cls === 4 ? 'Which fraction is equivalent to 1/3?' : cls === 5 ? 'Subtract the like fractions: What is 5/7 - 2/7?' : 'What do two halves (1/2 + 1/2) make together?',
          },
          options:
            cls === 4
              ? arrangeOptions(`${qPrefix}-q3`, { text: '2/6 (और 3/9)', emoji: '⚖️' }, [
                  { text: '1/6', emoji: '🥧' },
                  { text: '3/4', emoji: '🍕' },
                  { text: '2/3', emoji: '🔢' },
                ])
              : cls === 5
              ? arrangeOptions(`${qPrefix}-q3`, { text: '3/7', emoji: '✅' }, [
                  { text: '3/0', emoji: '❌' },
                  { text: '7/7', emoji: '🔢' },
                  { text: '2/7', emoji: '🔢' },
                ])
              : arrangeOptions(`${qPrefix}-q3`, { text: '1 पूरा (One Whole)', emoji: '🌕' }, [
                  { text: '1/4 (चौथाई)', emoji: '🌒' },
                  { text: '2 पूरे', emoji: '🌕🌕' },
                  { text: '0', emoji: '⭕' },
                ]),
          explanation:
            cls === 4
              ? '1/3 के अंश और हर को 2 से गुणा करने पर 2/6 मिलता है।'
              : cls === 5
              ? 'हर समान होने पर अंश घट जाते हैं: (5 - 2)/7 = 3/7।'
              : 'दो आधे भाग (1/2 + 1/2 = 2/2 = 1) मिलकर 1 पूरा भाग बनाते हैं।',
        },
        {
          id: `${qPrefix}-q4`,
          question: {
            native: `ᱢᱮᱥᱟᱭ ᱢᱮ (Add fractions): 2/${denom} + 3/${denom} = ?`,
            transliteration: `Mesay me: 2/${denom} + 3/${denom} tinag huyug-a?`,
            hindi: `समान हर वाली भिन्नों को जोड़ो: 2/${denom} + 3/${denom} कितना होगा?`,
            english: `Add the like fractions: What is 2/${denom} + 3/${denom}?`,
          },
          options: arrangeOptions(`${qPrefix}-q4`, { text: `5/${denom}`, emoji: '✅' }, [
            { text: `5/${denom * 2}`, emoji: '❌' },
            { text: `6/${denom}`, emoji: '🔢' },
            { text: `1/${denom}`, emoji: '🔢' },
          ]),
          explanation: `हर समान होने पर अंश जुड़ जाते हैं: (2 + 3)/${denom} = 5/${denom}।`,
        },
      ],
    };
  }

  // 7. DECIMALS (दशमलव / Decimals)
  if (titleText.includes('दशमलव') || titleText.includes('decimal')) {
    return {
      topicNameHindi: 'दशमलव (Decimals)',
      topicNameEnglish: 'Decimals',
      dragDrop: {
        instruction: {
          native: 'ᱫᱚᱥᱚᱢᱤᱠ (Decimals): 1 ᱠᱷᱚᱱ ᱠᱟᱹᱴᱤᱡ ᱟᱨ 1 ᱠᱷᱚᱱ ᱢᱟᱨᱟᱝ ᱮᱞ ᱵᱷᱮᱜᱟᱨ ᱢᱮ!',
          transliteration: '1 khon katij ar 1 khon marang dasamik el bhegar me!',
          hindi: 'दशमलव संख्याओं को "1 से छोटी" और "1 से बड़ी" के समूह में बाँटो!',
          english: 'Sort the decimal numbers into Less than 1 vs Greater than 1!',
        },
        zones: [
          { id: 'less1', label: { native: '1 ᱠᱷᱚᱱ ᱠᱟᱹᱴᱤᱡ (< 1.0)', transliteration: 'Less than 1', hindi: '1 से छोटी (< 1.0)', english: 'Less than 1.0' }, color: 'bg-sky-500' },
          { id: 'greater1', label: { native: '1 ᱠᱷᱚᱱ ᱢᱟᱨᱟᱝ (> 1.0)', transliteration: 'Greater than 1', hindi: '1 से बड़ी (> 1.0)', english: 'Greater than 1.0' }, color: 'bg-emerald-500' },
        ],
        items: [
          { id: `${qPrefix}-d1`, name: { native: '0.5 (5/10)', transliteration: 'Zero point five', hindi: '0.5 (आधा)', english: '0.5' }, emoji: '🎯', correctZone: 'less1' },
          { id: `${qPrefix}-d2`, name: { native: '0.25 (25/100)', transliteration: 'Zero point two five', hindi: '0.25 (चौथाई)', english: '0.25' }, emoji: '🪙', correctZone: 'less1' },
          { id: `${qPrefix}-d3`, name: { native: '1.5', transliteration: 'One point five', hindi: '1.5 (एक और आधा)', english: '1.5' }, emoji: '📏', correctZone: 'greater1' },
          { id: `${qPrefix}-d4`, name: { native: '2.75', transliteration: 'Two point seven five', hindi: '2.75', english: '2.75' }, emoji: '⚖️', correctZone: 'greater1' },
        ],
      },
      matchingPairs: [
        { id: 'm1', emoji: '🔟', nativeWord: '1/10 (एक दशांश)', transliteration: 'One-tenth', hindiWord: '0.1' },
        { id: 'm2', emoji: '🍕', nativeWord: '1/2 (पाँच दशांश)', transliteration: 'Five-tenths', hindiWord: '0.5' },
        { id: 'm3', emoji: '💯', nativeWord: '7/100 (सात शतांश)', transliteration: 'Seven-hundredths', hindiWord: '0.07' },
        { id: 'm4', emoji: '🪙', nativeWord: '50 पैसे (₹ में)', transliteration: '50 paise in Rupees', hindiWord: '₹0.50' },
      ],
      countingItems: [
        { id: 'c1', emoji: '🟦', name: '0.3 में दशांश (Tenths in 0.3)', count: 3 },
        { id: 'c2', emoji: '🟩', name: '0.6 में दशांश (Tenths in 0.6)', count: 6 },
        { id: 'c3', emoji: '🟨', name: '0.9 में दशांश (Tenths in 0.9)', count: 9 },
      ],
      countingInstructionHindi: 'दशमलव में दशांश (Tenths) के भागों को गिनें!',
      countingInstructionEnglish: 'Count the tenths represented in each decimal!',
      quiz: [
        {
          id: `${qPrefix}-q1`,
          question: {
            native: 'ᱵᱷᱤᱱᱱ 3/10 ᱫᱚ ᱫᱚᱥᱚᱢᱤᱠ (Decimal) ᱨᱮ ᱪᱮᱠᱟ ᱚᱞᱚᱜᱼᱟ?',
            transliteration: 'Fraction 3/10 do decimal re cheka olog-a?',
            hindi: 'भिन्न 3/10 को दशमलव (Decimal) के रूप में कैसे लिखते हैं?',
            english: 'How do you write the fraction 3/10 as a decimal?',
          },
          options: arrangeOptions(`${qPrefix}-q1`, { text: '0.3', emoji: '🎯' }, [
            { text: '3.10', emoji: '🔢' },
            { text: '0.03', emoji: '🔢' },
            { text: '30.0', emoji: '🔢' },
          ]),
          explanation: '10 में से 3 भाग (3 दशांश) को दशमलव में 0.3 लिखा जाता है।',
        },
        {
          id: `${qPrefix}-q2`,
          question: {
            native: '0.7 ᱟᱨ 0.4 ᱢᱩᱫᱽ ᱨᱮ ᱚᱠᱟᱴᱟᱜ ᱢᱟᱨᱟᱝ ᱠᱟᱱᱟ?',
            transliteration: '0.7 ar 0.4 mud re okatag marang kana?',
            hindi: '0.7 और 0.4 में से कौन-सी दशमलव संख्या बड़ी है?',
            english: 'Which decimal number is bigger: 0.7 or 0.4?',
          },
          options: arrangeOptions(`${qPrefix}-q2`, { text: '0.7', emoji: '✅' }, [
            { text: '0.4', emoji: '🔢' },
            { text: 'दोनों बराबर हैं', emoji: '⚖️' },
            { text: '0.07', emoji: '🔢' },
          ]),
          explanation: '7 दशांश (0.7), 4 दशांश (0.4) से बड़ा होता है।',
        },
        {
          id: `${qPrefix}-q3`,
          question: {
            native: 'ᱢᱮᱥᱟᱭ ᱢᱮ (Add): 1.2 + 0.5 ᱛᱤᱱᱟᱹᱜ ᱦᱩᱭᱩᱜᱼᱟ?',
            transliteration: 'Mesay me: 1.2 + 0.5 tinag huyug-a?',
            hindi: 'जोड़िए: 1.2 + 0.5 का मान क्या होगा?',
            english: 'Add the decimals: What is 1.2 + 0.5?',
          },
          options: arrangeOptions(`${qPrefix}-q3`, { text: '1.7', emoji: '🌟' }, [
            { text: '1.07', emoji: '🔢' },
            { text: '0.17', emoji: '🔢' },
            { text: '6.2', emoji: '🔢' },
          ]),
          explanation: 'दशमलव बिंदु को सीध में रखकर जोड़ने पर: 1.2 + 0.5 = 1.7 होता है।',
        },
        {
          id: `${qPrefix}-q4`,
          question: {
            native: '50 ᱯᱩᱭᱥᱟᱹ ᱫᱚ ᱴᱟᱠᱟ (Rupees) ᱨᱮ ᱛᱤᱱᱟᱹᱜ ᱦᱩᱭᱩᱜᱼᱟ?',
            transliteration: '50 puisa do Taka re tinag huyug-a?',
            hindi: '50 पैसे को दशमलव में रुपये में कैसे लिखेंगे (₹1 = 100 पैसे)?',
            english: 'How is 50 paise written in Rupees using decimals (₹1 = 100 paise)?',
          },
          options: arrangeOptions(`${qPrefix}-q4`, { text: '₹0.50', emoji: '🪙' }, [
            { text: '₹5.00', emoji: '💵' },
            { text: '₹0.05', emoji: '🪙' },
            { text: '₹50.0', emoji: '💰' },
          ]),
          explanation: '100 पैसे = ₹1, इसलिए 50 पैसे = 50/100 रुपये = ₹0.50।',
        },
      ],
    };
  }

  // 8. TIME, CLOCK, CALENDAR & SPEED (समय / घड़ी / मज़ेदार दिन / गति)
  if (
    titleText.includes('समय') ||
    titleText.includes('time') ||
    titleText.includes('घड़ी') ||
    titleText.includes('clock') ||
    titleText.includes('दिन') ||
    titleText.includes('day') ||
    titleText.includes('गति') ||
    titleText.includes('speed')
  ) {
    const isCalendarDay = titleText.includes('दिन') || titleText.includes('day');
    const isSpeed = titleText.includes('गति') || titleText.includes('speed');
    const clockHour = (cls + chNum) % 11 + 1;

    return {
      topicNameHindi: isSpeed ? 'समय और गति (Time & Speed)' : isCalendarDay ? 'सप्ताह के दिन और कैलेंडर (Days & Calendar)' : 'समय और घड़ी (Time & Clock)',
      topicNameEnglish: chapter.originalTitleEnglish,
      dragDrop: {
        instruction: {
          native: `ᱚᱠᱛᱚ (${chapter.originalTitleHindi}): ᱥᱮᱛᱟᱜ (Morning) ᱟᱨ ᱧᱤᱫᱟᱹ (Night) ᱨᱮᱱᱟᱜ ᱠᱟᱹᱢᱤ ᱵᱷᱮᱜᱟᱨ ᱢᱮ!`,
          transliteration: 'Setag ar Nida renag kami bhegar me!',
          hindi: `पाठ "${chapter.originalTitleHindi}": सुबह (दिन) और रात के समय किए जाने वाले कामों को अलग करो!`,
          english: `Sort the activities for "${chapter.originalTitleEnglish}" into Morning/Day vs Night!`,
        },
        zones: [
          { id: 'morning', label: { native: 'ᱥᱮᱛᱟᱜ / ᱥᱤᱧ (Morning)', transliteration: 'Setag (Morning)', hindi: 'सुबह / दिन (Morning)', english: 'Morning / Day' }, color: 'bg-amber-500' },
          { id: 'night', label: { native: 'ᱧᱤᱫᱟᱹ (Night)', transliteration: 'Nida (Night)', hindi: 'रात (Night)', english: 'Night' }, color: 'bg-indigo-600' },
        ],
        items: [
          { id: `${qPrefix}-d1`, name: { native: 'ᱟᱥᱲᱟ ᱪᱟᱞᱟᱜ (Go to School)', transliteration: 'Asra chalag', hindi: `सुबह ${clockHour} बजे स्कूल/पढ़ाई`, english: 'Morning School Routine' }, emoji: '🏫', correctZone: 'morning' },
          { id: `${qPrefix}-d2`, name: { native: 'ᱥᱤᱧ ᱪᱟᱸᱫᱚ ᱨᱟᱠᱟᱵ (Sunrise)', transliteration: 'Siny Chando rakab', hindi: 'सूरज निकलना', english: 'Sunrise' }, emoji: '🌅', correctZone: 'morning' },
          { id: `${qPrefix}-d3`, name: { native: 'ᱤᱯᱤᱞ ᱧᱮᱞ (See Stars)', transliteration: 'Ipil nyel', hindi: 'आसमान में तारे देखना', english: 'Seeing Stars' }, emoji: '🌟', correctZone: 'night' },
          { id: `${qPrefix}-d4`, name: { native: 'ᱡᱟᱹᱯᱤᱫ (Sleep at Night)', transliteration: 'Japid', hindi: 'गहरी नींद सोना', english: 'Sleeping at Night' }, emoji: '😴', correctZone: 'night' },
        ],
      },
      matchingPairs: [
        { id: 'm1', emoji: '⏰', nativeWord: `${cls} घंटे (${cls} Hours)`, transliteration: `${cls} Hours`, hindiWord: `${cls * 60} मिनट (${cls * 60} Minutes)` },
        { id: 'm2', emoji: '📅', nativeWord: '1 सप्ताह (1 Week)', transliteration: '1 Hapta (Week)', hindiWord: '7 दिन (7 Days)' },
        { id: 'm3', emoji: '🌞', nativeWord: '1 दिन-रात (1 Day)', transliteration: '1 Maha (Day)', hindiWord: '24 घंटे (24 Hours)' },
        { id: 'm4', emoji: '🗓️', nativeWord: '1 वर्ष (1 Year)', transliteration: '1 Serma (Year)', hindiWord: '12 महीने (12 Months)' },
      ],
      countingItems: [
        { id: 'c1', emoji: '📅', name: 'एक सप्ताह में दिनों की संख्या (Days in 1 week)', count: 7 },
        { id: 'c2', emoji: '⏰', name: `घड़ी में बजे घंटे (${chapter.originalTitleHindi})`, count: (clockHour % 8) + 2 },
        { id: 'c3', emoji: '🌤️', name: 'मुख्य ऋतुएँ - गर्मी, बरसात, सर्दी (Main seasons)', count: 3 },
      ],
      countingInstructionHindi: `पाठ "${chapter.originalTitleHindi}" में सप्ताह के दिन और समय की इकाइयाँ गिनें!`,
      countingInstructionEnglish: `Count the days and time units in "${chapter.originalTitleEnglish}"!`,
      quiz: [
        {
          id: `${qPrefix}-q1`,
          question: {
            native: isCalendarDay
              ? 'ᱢᱤᱫ ᱦᱟᱯᱛᱟ (Week) ᱨᱮ ᱛᱤᱱᱟᱹᱜ ᱢᱟᱦᱟᱸ (Days) ᱛᱟᱦᱮᱸᱱᱟ?'
              : `${cls} ᱴᱟᱲᱟᱝ (Hours) ᱨᱮ ᱛᱤᱱᱟᱹᱜ ᱴᱤᱯᱤᱡ (Minutes) ᱦᱩᱭᱩᱜᱼᱟ?`,
            transliteration: isCalendarDay ? 'Mit hapta re tinag maha tahena?' : `${cls} Hours re tinag Minutes huyug-a?`,
            hindi: isCalendarDay
              ? `पाठ "${chapter.originalTitleHindi}": एक सप्ताह (Week) में कुल कितने दिन होते हैं?`
              : `पाठ "${chapter.originalTitleHindi}": ${cls} घंटे (${cls} Hours) में कुल कितने मिनट होते हैं?`,
            english: isCalendarDay
              ? 'How many days are there in one week?'
              : `How many minutes are there in ${cls} hour(s)?`,
          },
          options: isCalendarDay
            ? arrangeOptions(`${qPrefix}-q1`, { text: '7 दिन (7 Days)', emoji: '📅' }, [
                { text: '5 दिन', emoji: '5️⃣' },
                { text: '10 दिन', emoji: '🔟' },
                { text: '12 दिन', emoji: '🗓️' },
              ])
            : arrangeOptions(`${qPrefix}-q1`, { text: `${cls * 60} मिनट`, emoji: '⏰' }, [
                { text: `${cls * 100} मिनट`, emoji: '💯' },
                { text: `${cls * 24} मिनट`, emoji: '🕐' },
                { text: `${cls * 10} मिनट`, emoji: '🕧' },
              ]),
          explanation: isCalendarDay
            ? 'एक सप्ताह में 7 दिन होते हैं: सोमवार से रविवार तक।'
            : `1 घंटे में 60 मिनट होते हैं, इसलिए ${cls} घंटे = ${cls} × 60 = ${cls * 60} मिनट।`,
        },
        {
          id: `${qPrefix}-q2`,
          question: {
            native: isSpeed
              ? 'ᱢᱤᱫ ᱥᱟᱭᱠᱤᱞ 1 ᱴᱟᱲᱟᱝ ᱨᱮ 15 km ᱪᱟᱞᱟᱜ ᱠᱷᱟᱱ 3 ᱴᱟᱲᱟᱝ ᱨᱮ ᱛᱤᱱᱟᱹᱜ ᱥᱟᱺᱜᱤᱧ ᱪᱟᱞᱟᱜᱼᱟ?'
              : `${cls} दिन (Days) में कुल कितने घंटे (Hours) होते हैं? (1 दिन = 24 घंटे)`,
            transliteration: isSpeed
              ? 'Mit cycle 1 hour re 15 km chalag khan 3 hour re tinag sanginj chalag-a?'
              : `${cls} maha re tinag tarang (hours) tahena?`,
            hindi: isSpeed
              ? 'यदि एक साइकिल 1 घंटे में 15 किमी चलती है, तो 3 घंटे में कितनी दूरी तय करेगी?'
              : `यदि 1 दिन-रात में 24 घंटे होते हैं, तो ${cls} दिन में कुल कितने घंटे होंगे?`,
            english: isSpeed
              ? 'If a bicycle travels 15 km in 1 hour, how far will it travel in 3 hours?'
              : `If 1 day has 24 hours, how many hours are in ${cls} day(s)?`,
          },
          options: isSpeed
            ? arrangeOptions(`${qPrefix}-q2`, { text: '45 किमी (45 km)', emoji: '🚲' }, [
                { text: '18 किमी', emoji: '🛣️' },
                { text: '30 किमी', emoji: '📏' },
                { text: '5 किमी', emoji: '🏁' },
              ])
            : arrangeOptions(`${qPrefix}-q2`, { text: `${cls * 24} घंटे`, emoji: '🌞' }, [
                { text: `${cls * 12} घंटे`, emoji: '⏰' },
                { text: `${cls * 60} घंटे`, emoji: '🔢' },
                { text: `${cls * 10} घंटे`, emoji: '🔟' },
              ]),
          explanation: isSpeed
            ? 'दूरी = चाल × समय = 15 किमी/घंटा × 3 घंटे = 45 किमी।'
            : `1 दिन = 24 घंटे, इसलिए ${cls} दिन = ${cls * 24} घंटे।`,
        },
        {
          id: `${qPrefix}-q3`,
          question: {
            native: `${cls} ᱥᱮᱨᱢᱟ (${cls} Year) ᱨᱮ ᱛᱤᱱᱟᱹᱜ ᱪᱟᱸᱫᱚ (Months) ᱛᱟᱦᱮᱸᱱᱟ?`,
            transliteration: `${cls} serma re tinag chando (months) tahena?`,
            hindi: `1 वर्ष में 12 महीने होते हैं, तो ${cls} वर्ष में कुल कितने महीने होंगे?`,
            english: `There are 12 months in 1 year. How many months are in ${cls} year(s)?`,
          },
          options: arrangeOptions(`${qPrefix}-q3`, { text: `${cls * 12} महीने`, emoji: '🗓️' }, [
            { text: `${cls * 7} महीने`, emoji: '📅' },
            { text: `${cls * 10} महीने`, emoji: '🔟' },
            { text: `${cls + 12} महीने`, emoji: '📆' },
          ]),
          explanation: `1 साल = 12 महीने, अतः ${cls} साल = ${cls} × 12 = ${cls * 12} महीने।`,
        },
        {
          id: `${qPrefix}-q4`,
          question: {
            native: `ᱜᱷᱩᱲᱤ ᱨᱮ ᱠᱟᱹᱴᱤᱡ ᱠᱟঁᱴᱟ ${clockHour} ᱨᱮ ᱟᱨ ᱢᱟᱨᱟᱝ ᱠᱟঁᱴᱟ 12 ᱨᱮ ᱛᱟᱦᱮᱸ ᱞᱮᱠᱷᱟᱱ ᱛᱤᱱᱟᱹᱜ ᱵᱟᱡᱟᱣ ᱟᱠᱟᱱᱟ?`,
            transliteration: `Ghuri re katij kanta ${clockHour} re ar marang kanta 12 re tahen lekhan tinag bajaw akana?`,
            hindi: `यदि घड़ी की छोटी सुई ${clockHour} पर और बड़ी सुई 12 पर है, तो घड़ी में कितने बजे हैं?`,
            english: `If the short hour hand is at ${clockHour} and the long minute hand is at 12, what time is it?`,
          },
          options: arrangeOptions(`${qPrefix}-q4`, { text: `${clockHour} बजे (${clockHour} O’clock)`, emoji: '🕒' }, [
            { text: '12 बजे (12 O’clock)', emoji: '🕛' },
            { text: `${(clockHour % 11) + 1} बजे`, emoji: '🕕' },
            { text: `${((clockHour + 3) % 11) + 1} बजे`, emoji: '🕘' },
          ]),
          explanation: `छोटी सुई घंटे बताती है (${clockHour}) और बड़ी सुई 12 पर हो तो पूरे ${clockHour} बजे हैं।`,
        },
      ],
    };
  }

  // 9. MEASUREMENT: LENGTH, WEIGHT & CAPACITY (मापन / वज़न / जग और मग / सबसे लंबा कदम)
  if (
    titleText.includes('मापन') ||
    titleText.includes('measure') ||
    titleText.includes('वज़न') ||
    titleText.includes('weight') ||
    titleText.includes('जग और मग') ||
    titleText.includes('jug') ||
    titleText.includes('कदम') ||
    titleText.includes('step')
  ) {
    const isWeight = titleText.includes('वज़न') || titleText.includes('weight');
    const isCapacity = titleText.includes('जग') || titleText.includes('jug');
    const isStep = titleText.includes('कदम') || titleText.includes('step');
    const mult = cls + chNum;

    return {
      topicNameHindi: isWeight ? 'वज़न और भार (Weight)' : isCapacity ? 'धारिता - जग और मग (Capacity)' : isStep ? 'लम्बाई और कदम (Length & Steps)' : 'मापन - लम्बाई, भार और धारिता (Measurement)',
      topicNameEnglish: chapter.originalTitleEnglish,
      dragDrop: {
        instruction: {
          native: isWeight
            ? 'ᱦᱟᱢᱟᱞ (Heavy) ᱟᱨ ᱨᱟᱣᱟᱞ (Light) ᱡᱤᱱᱤᱥ ᱵᱷᱮᱜᱟᱨ ᱢᱮ!'
            : isCapacity
            ? 'ᱵᱟᱹᱲᱛᱤ ᱫᱟᱜ (More Water) ᱟᱨ ᱠᱚᱢ ᱫᱟᱜ (Less Water) ᱵर्तन ᱵᱷᱮᱜᱟᱨ ᱢᱮ!'
            : 'ᱡᱤᱞᱤᱧ (Length) ᱟᱨ ᱦᱟᱢᱟᱞ (Weight) ᱡᱚᱠᱷᱟ ᱵᱷᱮᱜᱟᱨ ᱢᱮ!',
          transliteration: 'Thik jokha mutabik jinis ko bhegar me!',
          hindi: isWeight
            ? `पाठ "${chapter.originalTitleHindi}": भारी (Heavy) और हल्की (Light) वस्तुओं को सही समूह में रखो!`
            : isCapacity
            ? `पाठ "${chapter.originalTitleHindi}": अधिक पानी (बाल्टी/जग) और कम पानी (चम्मच/कप) वाले बर्तनों को अलग करो!`
            : `पाठ "${chapter.originalTitleHindi}": लम्बाई में मापी जाने वाली और वज़न में तौली जाने वाली चीज़ों को अलग करो!`,
          english: isWeight
            ? 'Sort items into Heavy vs Light!'
            : isCapacity
            ? 'Sort containers into Holds More Water vs Holds Less Water!'
            : 'Sort items into Measured in Length vs Measured in Weight!',
        },
        zones: [
          {
            id: 'zone_a',
            label: {
              native: isWeight ? 'ᱦᱟᱢᱟᱞ (Heavy)' : isCapacity ? 'ᱵᱟᱹᱲᱛᱤ ᱫᱟᱜ (More)' : 'ᱡᱤᱞᱤᱧ - ᱢᱤᱴᱟᱨ (Length)',
              transliteration: isWeight ? 'Hamal' : isCapacity ? 'Barti Dag' : 'Length (m/cm)',
              hindi: isWeight ? 'भारी (Heavy)' : isCapacity ? 'अधिक पानी (More Capacity)' : 'लम्बाई (मीटर/कदम)',
              english: isWeight ? 'Heavy' : isCapacity ? 'Holds More' : 'Length (m / cm)',
            },
            color: 'bg-emerald-500',
          },
          {
            id: 'zone_b',
            label: {
              native: isWeight ? 'ᱨᱟᱣᱟᱞ (Light)' : isCapacity ? 'ᱠᱚᱢ ᱫᱟᱜ (Less)' : 'ᱦᱟᱢᱟᱞ - ᱠᱤᱞᱳ (Weight)',
              transliteration: isWeight ? 'Rawal' : isCapacity ? 'Kom Dag' : 'Weight (kg/g)',
              hindi: isWeight ? 'हल्का (Light)' : isCapacity ? 'कम पानी (Less Capacity)' : 'वज़न (किलोग्राम/ग्राम)',
              english: isWeight ? 'Light' : isCapacity ? 'Holds Less' : 'Weight (kg / g)',
            },
            color: 'bg-amber-500',
          },
        ],
        items: isCapacity
          ? [
              { id: `${qPrefix}-d1`, name: { native: 'ᱵᱟᱞᱴᱤ (Bucket)', transliteration: 'Balti', hindi: 'बड़ी बाल्टी', english: 'Big Bucket' }, emoji: '🪣', correctZone: 'zone_a' },
              { id: `${qPrefix}-d2`, name: { native: 'ᱢᱟᱨᱟᱝ ᱴᱩᱠᱩᱡ (Water Pot)', transliteration: 'Marang Tukuj', hindi: 'बड़ा घड़ा', english: 'Large Water Pot' }, emoji: '🏺', correctZone: 'zone_a' },
              { id: `${qPrefix}-d3`, name: { native: 'ᱪᱟᱢᱚᱪ (Spoon)', transliteration: 'Chamoch', hindi: 'छोटा चम्मच', english: 'Small Spoon' }, emoji: '🥄', correctZone: 'zone_b' },
              { id: `${qPrefix}-d4`, name: { native: 'ᱪᱟᱭ ᱠᱚᱯ (Tea Cup)', transliteration: 'Chai Cup', hindi: 'चाय का कप', english: 'Tea Cup' }, emoji: '☕', correctZone: 'zone_b' },
            ]
          : isWeight
          ? [
              { id: `${qPrefix}-d1`, name: { native: 'ᱠᱚᱦᱰᱟ (Pumpkin)', transliteration: 'Kohda', hindi: 'बड़ा कद्दू', english: 'Big Pumpkin' }, emoji: '🎃', correctZone: 'zone_a' },
              { id: `${qPrefix}-d2`, name: { native: 'ᱫᱷᱤᱨᱤ (Heavy Rock)', transliteration: 'Dhiri', hindi: 'भारी पत्थर', english: 'Heavy Stone' }, emoji: '🪨', correctZone: 'zone_a' },
              { id: `${qPrefix}-d3`, name: { native: 'ᱤᱞ (Bird Feather)', transliteration: 'Il', hindi: 'पक्षी का पंख', english: 'Feather' }, emoji: '🪶', correctZone: 'zone_b' },
              { id: `${qPrefix}-d4`, name: { native: 'ᱥᱟᱠᱟᱢ (Dry Leaf)', transliteration: 'Sakam', hindi: 'सूखा पत्ता', english: 'Dry Leaf' }, emoji: '🍃', correctZone: 'zone_b' },
            ]
          : [
              { id: `${qPrefix}-d1`, name: { native: 'ᱞᱩᱜᱽᱲᱤ / ᱥᱟᱹᱲᱤ (Cloth Length)', transliteration: 'Lugri', hindi: 'कपड़े की लम्बाई', english: 'Length of Cloth' }, emoji: '📏', correctZone: 'zone_a' },
              { id: `${qPrefix}-d2`, name: { native: 'ᱰᱟᱦᱟᱨ (Road Distance)', transliteration: 'Dahar', hindi: 'सड़क की दूरी', english: 'Road Distance' }, emoji: '🛣️', correctZone: 'zone_a' },
              { id: `${qPrefix}-d3`, name: { native: 'ᱪᱟᱣᱞᱮ ᱵੋᱨᱟ (Rice Weight)', transliteration: 'Chawle Bora', hindi: 'चावल का बोरा', english: 'Sack of Rice' }, emoji: '🌾', correctZone: 'zone_b' },
              { id: `${qPrefix}-d4`, name: { native: 'ᱟᱹᱞᱩ (Potatoes)', transliteration: 'Alu', hindi: 'आलू का वज़न', english: 'Bag of Potatoes' }, emoji: '🥔', correctZone: 'zone_b' },
            ],
      },
      matchingPairs: [
        { id: 'm1', emoji: '📏', nativeWord: `${cls} मीटर (${cls} m)`, transliteration: `${cls} Meter`, hindiWord: `${cls * 100} सेंटीमीटर (${cls * 100} cm)` },
        { id: 'm2', emoji: '⚖️', nativeWord: `${cls} किलोग्राम (${cls} kg)`, transliteration: `${cls} Kilogram`, hindiWord: `${cls * 1000} ग्राम (${cls * 1000} g)` },
        { id: 'm3', emoji: '🥛', nativeWord: `${cls} लीटर (${cls} L)`, transliteration: `${cls} Liter`, hindiWord: `${cls * 1000} मिलीलीटर (${cls * 1000} mL)` },
        { id: 'm4', emoji: '🛣️', nativeWord: `${chNum} किलोमीटर (${chNum} km)`, transliteration: `${chNum} Kilometer`, hindiWord: `${chNum * 1000} मीटर (${chNum * 1000} m)` },
      ],
      countingItems: [
        { id: 'c1', emoji: '🥛', name: `जग भरने के लिए गिलास (${chapter.originalTitleHindi})`, count: (chNum % 5) + 3 },
        { id: 'c2', emoji: '👣', name: `चटाई नापते कदम (${chapter.originalTitleHindi})`, count: (chNum % 5) + 4 },
        { id: 'c3', emoji: '🍎', name: `तराजू पर बराबर सेब (${chapter.originalTitleHindi})`, count: (chNum % 5) + 5 },
      ],
      countingInstructionHindi: `पाठ "${chapter.originalTitleHindi}" में मापन की इकाइयाँ गिनें!`,
      countingInstructionEnglish: `Count the measurement units in "${chapter.originalTitleEnglish}"!`,
      quiz: [
        {
          id: `${qPrefix}-q1`,
          question: {
            native: isCapacity
              ? 'ᱫᱩᱫᱷ ᱟᱨ ᱫᱟᱜ (Milk & Water) ᱚᱠᱟ ᱨᱮ ᱡᱚᱠᱷᱟᱜᱼᱟ?'
              : isWeight
              ? 'ᱦᱟᱹᱛᱤ ᱟᱨ ᱪᱩᱴᱩ ᱢᱩᱫᱽ ᱨᱮ ᱚᱠᱚᱭ ᱵᱟᱹᱲᱛᱤ ᱦᱟᱢᱟᱞ (Heavier) ᱠᱟᱱᱟᱭ?'
              : isStep
              ? 'मेज़ की लम्बाई बिना स्केल के मापने के लिए हम हाथ के किस हिस्से का उपयोग कर सकते हैं?'
              : `${cls} ᱢᱤᱴᱟᱨ (Metre) ᱨᱮ ᱛᱤᱱᱟᱹᱜ ᱥᱮᱱᱴᱤᱢᱤᱴᱟᱨ (cm) ᱛᱟᱦᱮᱸᱱᱟ?`,
            transliteration: isCapacity
              ? 'Dudh ar dag oka re jokhag-a?'
              : isWeight
              ? 'Hati ar Chutu mud re okoy barti hamal kanay?'
              : isStep
              ? 'Mej renag jiling ti te cheka jokhag-a?'
              : `${cls} Metre re tinag Centimetre (cm) tahena?`,
            hindi: isCapacity
              ? `पाठ "${chapter.originalTitleHindi}": दूध या पानी जैसी तरल चीज़ों को किस इकाई में मापा जाता है?`
              : isWeight
              ? `पाठ "${chapter.originalTitleHindi}": तरबूज और नींबू में से किसका वज़न अधिक (भारी) होता है?`
              : isStep
              ? `पाठ "${chapter.originalTitleHindi}": मेज़ की लम्बाई बिना फीते के नापने के लिए हाथ की किस माप का प्रयोग करते हैं?`
              : `पाठ "${chapter.originalTitleHindi}": ${cls} मीटर (${cls} m) में कुल कितने सेंटीमीटर (cm) होते हैं?`,
            english: isCapacity
              ? 'In which unit do we measure liquids like milk and water?'
              : isWeight
              ? 'Which is heavier: a watermelon or a lemon?'
              : isStep
              ? 'What non-standard body unit can we use to measure the length of a table?'
              : `How many centimetres (cm) are there in ${cls} metre(s)?`,
          },
          options: isCapacity
            ? arrangeOptions(`${qPrefix}-q1`, { text: 'लीटर / मिलीलीटर (Litre / mL)', emoji: '🥛' }, [
                { text: 'मीटर (Metre)', emoji: '📏' },
                { text: 'घंटा (Hour)', emoji: '⏰' },
                { text: 'रुपया (Rupee)', emoji: '🪙' },
              ])
            : isWeight
            ? arrangeOptions(`${qPrefix}-q1`, { text: 'तरबूज (Watermelon)', emoji: '🍉' }, [
                { text: 'नींबू (Lemon)', emoji: '🍋' },
                { text: 'दोनों बराबर हैं', emoji: '⚖️' },
                { text: 'पत्ता (Leaf)', emoji: '🍃' },
              ])
            : isStep
            ? arrangeOptions(`${qPrefix}-q1`, { text: 'बालिश्त / बित्ता (Handspan)', emoji: '🖐️' }, [
                { text: 'लीटर (Litre)', emoji: '🥛' },
                { text: 'किलोग्राम (Kilogram)', emoji: '⚖️' },
                { text: 'घड़ी (Clock)', emoji: '⏰' },
              ])
            : arrangeOptions(`${qPrefix}-q1`, { text: `${cls * 100} सेंटीमीटर (${cls * 100} cm)`, emoji: '📏' }, [
                { text: `${cls * 10} सेंटीमीटर`, emoji: '🔟' },
                { text: `${cls * 50} सेंटीमीटर`, emoji: '🔢' },
                { text: `${cls * 1000} सेंटीमीटर`, emoji: '🔢' },
              ]),
          explanation: isCapacity
            ? 'तरल पदार्थों (दूध, पानी, तेल) की धारिता लीटर और मिलीलीटर में मापी जाती है।'
            : isWeight
            ? 'तरबूज बड़ा और भारी होता है, जबकि नींबू हल्का होता है।'
            : isStep
            ? 'बिना स्केल के हम बालिश्त (Handspan), हाथ या कदम (Steps) से लम्बाई का अनुमान लगाते हैं।'
            : `1 मीटर = 100 सेंटीमीटर, इसलिए ${cls} मीटर = ${cls * 100} सेंटीमीटर।`,
        },
        {
          id: `${qPrefix}-q2`,
          question: {
            native: `${mult} ᱠᱤᱞᱳᱜᱽᱨᱟᱢ (${mult} kg) ᱨᱮ ᱛᱤᱱᱟᱹᱜ ᱜᱽᱨᱟᱢ (Grams) ᱦᱩᱭᱩᱜᱼᱟ?`,
            transliteration: `${mult} Kilogram re tinag Gram huyug-a?`,
            hindi: `यदि 1 किलोग्राम = 1000 ग्राम है, तो ${mult} किलोग्राम (${mult} kg) में कितने ग्राम होंगे?`,
            english: `If 1 kg = 1000 g, how many grams are in ${mult} kg?`,
          },
          options: arrangeOptions(`${qPrefix}-q2`, { text: `${mult * 1000} ग्राम`, emoji: '⚖️' }, [
            { text: `${mult * 100} ग्राम`, emoji: '💯' },
            { text: `${mult * 10} ग्राम`, emoji: '🔟' },
            { text: `${mult + 1000} ग्राम`, emoji: '🔢' },
          ]),
          explanation: `1 किलोग्राम में 1000 ग्राम होते हैं, इसलिए ${mult} kg = ${mult * 1000} ग्राम।`,
        },
        {
          id: `${qPrefix}-q3`,
          question: {
            native: `${cls} ᱞᱤᱴᱟᱨ (Litre) ᱨᱮ 500 ml ᱨᱮᱱᱟᱜ ᱛᱤᱱᱟᱹᱜ ᱢᱚᱜᱽ ᱯᱮᱨᱮᱡᱚᱜᱼᱟ?`,
            transliteration: `${cls} Litre re 500 ml renag tinag mug perejog-a?`,
            hindi: `${cls} लीटर पानी से 500 मिलीलीटर (आधा लीटर) वाले कितने मग पूरे भरेंगे?`,
            english: `How many 500 mL (half-litre) mugs can be filled from ${cls} Litre(s) of water?`,
          },
          options: arrangeOptions(`${qPrefix}-q3`, { text: `${cls * 2} मग`, emoji: '🥛' }, [
            { text: `${cls * 5} मग`, emoji: '5️⃣' },
            { text: `${cls * 10} मग`, emoji: '🔟' },
            { text: `${cls} मग`, emoji: '1️⃣' },
          ]),
          explanation: `1 लीटर में दो 500 mL मग भरते हैं, इसलिए ${cls} लीटर में ${cls * 2} मग भरेंगे।`,
        },
        {
          id: `${qPrefix}-q4`,
          question: {
            native: `ᱨᱟᱢᱩ ᱟᱜ ᱠᱟᱛᱟ ${chNum * 10} cm ᱟᱨ ᱥᱚᱱᱩ ᱟᱜ ᱠᱟᱛᱟ ${chNum * 10 + 15} cm ᱠᱟᱱᱟ। ᱚᱠᱚᱭᱟᱜ ᱠᱟᱛᱟ ᱵᱟᱹᱲᱛᱤ ᱡᱤᱞᱤᱧᱟ?`,
            transliteration: `Ramu ag kata ${chNum * 10} cm ar Sonu ag kata ${chNum * 10 + 15} cm kana. Okoyag jilinga?`,
            hindi: `रामू का एक कदम ${chNum * 10} सेमी और सोनू का कदम ${chNum * 10 + 15} सेमी लंबा है। सोनू का कदम कितना अधिक लंबा है?`,
            english: `Ramu's step is ${chNum * 10} cm and Sonu's step is ${chNum * 10 + 15} cm. By how much is Sonu's step longer?`,
          },
          options: arrangeOptions(`${qPrefix}-q4`, { text: '15 सेमी (15 cm)', emoji: '👣' }, [
            { text: '5 सेमी', emoji: '📏' },
            { text: '25 सेमी', emoji: '📏' },
            { text: `${chNum * 20} सेमी`, emoji: '🔢' },
          ]),
          explanation: `${chNum * 10 + 15} सेमी - ${chNum * 10} सेमी = 15 सेमी अधिक लंबा है।`,
        },
      ],
    };
  }

  // 10. MONEY & BILLS (मुद्रा / पैसे / बिल बनाना)
  if (titleText.includes('मुद्रा') || titleText.includes('money') || titleText.includes('पैसे') || titleText.includes('बिल')) {
    const itemA = cls * 12;
    const itemB = chNum * 5;
    const totalBill = itemA + itemB;
    const notePaid = 100;
    const changeBack = notePaid - (cls * 15);

    return {
      topicNameHindi: 'मुद्रा और बिल (Money & Bills)',
      topicNameEnglish: chapter.originalTitleEnglish,
      dragDrop: {
        instruction: {
          native: `ᱴᱟᱠᱟ ᱯᱩᱭᱥᱟᱹ (${chapter.originalTitleHindi}): ₹${cls * 20} ᱠᱷᱚᱱ ᱠᱚᱢ ᱟᱨ ᱵᱟᱹᱲᱛᱤ ᱵᱷᱮᱜᱟᱨ ᱢᱮ!`,
          transliteration: 'Sikka ar Note bhegar me!',
          hindi: `पाठ "${chapter.originalTitleHindi}": ₹${cls * 20} से कम और ₹${cls * 20} या अधिक मूल्य को अलग करो!`,
          english: `Sort the money combinations into Value < ₹${cls * 20} vs Value >= ₹${cls * 20}!`,
        },
        zones: [
          { id: 'under_lim', label: { native: `< ₹${cls * 20}`, transliteration: `Less than ₹${cls * 20}`, hindi: `₹${cls * 20} से कम`, english: `Less than ₹${cls * 20}` }, color: 'bg-amber-500' },
          { id: 'over_lim', label: { native: `≥ ₹${cls * 20}`, transliteration: `₹${cls * 20} or more`, hindi: `₹${cls * 20} या अधिक`, english: `₹${cls * 20} or More` }, color: 'bg-emerald-500' },
        ],
        items: [
          { id: `${qPrefix}-d1`, name: { native: '₹5 + ₹2 = ₹7', transliteration: '7 Rupees', hindi: '₹5 और ₹2 का सिक्का (₹7)', english: '₹5 + ₹2 = ₹7' }, emoji: '🪙', correctZone: 'under_lim' },
          { id: `${qPrefix}-d2`, name: { native: '₹10 + ₹5 = ₹15', transliteration: '15 Rupees', hindi: '₹10 और ₹5 (₹15)', english: '₹10 + ₹5 = ₹15' }, emoji: '🪙', correctZone: 'under_lim' },
          { id: `${qPrefix}-d3`, name: { native: `₹${cls * 20} + ₹10 = ₹${cls * 20 + 10}`, transliteration: `${cls * 20 + 10} Rupees`, hindi: `₹${cls * 20 + 10} के नोट`, english: `₹${cls * 20 + 10}` }, emoji: '💵', correctZone: 'over_lim' },
          { id: `${qPrefix}-d4`, name: { native: '₹100 का नोट', transliteration: '100 Rupees Note', hindi: '₹100 का नोट', english: '₹100 Note' }, emoji: '💴', correctZone: 'over_lim' },
        ],
      },
      matchingPairs: [
        { id: 'm1', emoji: '🪙', nativeWord: `₹${cls} (रुपये)`, transliteration: `${cls} Taka`, hindiWord: `${cls * 100} पैसे (${cls * 100} Paise)` },
        { id: 'm2', emoji: '💵', nativeWord: `₹5 के ${cls * 2} सिक्के`, transliteration: `${cls * 2} coins of ₹5`, hindiWord: `₹${cls * 10}` },
        { id: 'm3', emoji: '💴', nativeWord: `₹10 के ${chNum} नोट`, transliteration: `${chNum} notes of ₹10`, hindiWord: `₹${chNum * 10}` },
        { id: 'm4', emoji: '💰', nativeWord: '₹50 के 2 नोट', transliteration: 'Two ₹50 notes', hindiWord: '₹100 (सौ रुपये)' },
      ],
      countingItems: [
        { id: 'c1', emoji: '🪙', name: '₹10 बनाने के लिए ₹2 के सिक्के', count: 5 },
        { id: 'c2', emoji: '💵', name: `₹${cls * 10} बनाने के लिए ₹10 के नोट`, count: cls },
        { id: 'c3', emoji: '🪙', name: '₹30 बनाने के लिए ₹5 के सिक्के', count: 6 },
      ],
      countingInstructionHindi: `पाठ "${chapter.originalTitleHindi}": कुल राशि बनाने के लिए सिक्कों और नोटों की संख्या गिनें!`,
      countingInstructionEnglish: `Count the coins and notes needed to make the given amount!`,
      quiz: [
        {
          id: `${qPrefix}-q1`,
          question: {
            native: `${cls} ᱴᱟᱠᱟ (₹${cls}) ᱨᱮ ᱛᱤᱱᱟᱹᱜ ᱯᱩᱭᱥᱟᱹ (Paise) ᱦᱩᱭᱩᱜᱼᱟ? (₹1 = 100 पैसे)`,
            transliteration: `${cls} Taka (₹${cls}) re tinag puisa huyug-a?`,
            hindi: `पाठ "${chapter.originalTitleHindi}": यदि ₹1 में 100 पैसे होते हैं, तो ₹${cls} में कुल कितने पैसे होंगे?`,
            english: `If ₹1 has 100 paise, how many paise are there in ₹${cls}?`,
          },
          options: arrangeOptions(`${qPrefix}-q1`, { text: `${cls * 100} पैसे`, emoji: '🪙' }, [
            { text: `${cls * 50} पैसे`, emoji: '🪙' },
            { text: `${cls * 10} पैसे`, emoji: '🔟' },
            { text: `${cls + 100} पैसे`, emoji: '💰' },
          ]),
          explanation: `भारतीय मुद्रा में ₹1 = 100 पैसे, इसलिए ₹${cls} = ${cls * 100} पैसे होते हैं।`,
        },
        {
          id: `${qPrefix}-q2`,
          question: {
            native: `ᱢᱤᱫ ᱠᱚᱯᱤ ᱨᱮᱱᱟᱜ ᱫᱟᱢ ₹${itemA} ᱟᱨ ᱯᱮᱱᱥᱤᱞ ᱨᱮᱱᱟᱜ ᱫᱟᱢ ₹${itemB} ᱠᱟᱱᱟ। ᱡᱚᱛᱚ ᱵᱤᱞ ᱛᱤᱱᱟᱹᱜ ᱦᱩᱭᱩᱜᱼᱟ?`,
            transliteration: `Mit copy renag dam ₹${itemA} ar pencil renag dam ₹${itemB} kana. Joto bill tinag huyug-a?`,
            hindi: `एक कॉपी की कीमत ₹${itemA} और पेंसिल बॉक्स की कीमत ₹${itemB} है। कुल बिल कितने रुपये का बनेगा?`,
            english: `A notebook costs ₹${itemA} and a pencil box costs ₹${itemB}. What is the total bill amount?`,
          },
          options: arrangeOptions(`${qPrefix}-q2`, { text: `₹${totalBill}`, emoji: '🧾' }, [
            { text: `₹${Math.abs(itemA - itemB)}`, emoji: '🪙' },
            { text: `₹${totalBill + 10}`, emoji: '💵' },
            { text: `₹${itemA}`, emoji: '📓' },
          ]),
          explanation: `कुल बिल = ₹${itemA} + ₹${itemB} = ₹${totalBill}।`,
        },
        {
          id: `${qPrefix}-q3`,
          question: {
            native: `₹${cls * 10} ᱨᱮᱱᱟᱜ ᱱᱳᱴ ᱵᱷᱟᱸᱡᱟᱣ ᱞᱮᱠᱷᱟᱱ ₹5 ᱨᱮᱱᱟᱜ ᱛᱤᱱᱟᱹᱜ ᱥᱤᱠᱠᱟᱹ ᱧᱟᱢᱚᱜᱼᱟ?`,
            transliteration: `₹${cls * 10} renag note bhanjaw lekhan ₹5 renag tinag sikka nyamog-a?`,
            hindi: `₹${cls * 10} के बदले ₹5 के कितने सिक्के मिलेंगे?`,
            english: `How many ₹5 coins make ₹${cls * 10}?`,
          },
          options: arrangeOptions(`${qPrefix}-q3`, { text: `${cls * 2} सिक्के`, emoji: '🪙' }, [
            { text: `${cls} सिक्के`, emoji: '🪙' },
            { text: `${cls * 5} सिक्के`, emoji: '🪙' },
            { text: `${cls * 10} सिक्के`, emoji: '🪙' },
          ]),
          explanation: `₹5 × ${cls * 2} = ₹${cls * 10}, इसलिए ₹5 के ${cls * 2} सिक्के मिलेंगे।`,
        },
        {
          id: `${qPrefix}-q4`,
          question: {
            native: `ᱥᱤᱛᱟᱹ ᱫᱚᱠᱟᱱᱤ ᱴᱷᱮᱱ ₹${notePaid} ᱮᱢ ᱠᱟᱛᱮ ₹${cls * 15} ᱨᱮᱱᱟᱜ ᱡᱤᱱᱤᱥ ᱮ ᱠᱤᱨᱤᱧ ᱠᱮᱫᱟ। ᱛᱤᱱᱟᱹᱜ ᱴᱟᱠᱟ ᱨᱩᱣᱟᱹᱲ ᱧᱟᱢᱟ?`,
            transliteration: `Sita dokani then ₹${notePaid} em kate ₹${cls * 15} renag jinis e kirinj keda. Tinag taka ruwar nyama?`,
            hindi: `सीता ने दुकानदार को ₹${notePaid} का नोट दिया और ₹${cls * 15} का सामान खरीदा। दुकानदार कितने रुपये वापस करेगा?`,
            english: `Sita gave a ₹${notePaid} note to buy items worth ₹${cls * 15}. How much change will she get back?`,
          },
          options: arrangeOptions(`${qPrefix}-q4`, { text: `₹${changeBack}`, emoji: '💵' }, [
            { text: `₹${changeBack + 10}`, emoji: '💵' },
            { text: `₹${cls * 15}`, emoji: '🪙' },
            { text: `₹${notePaid + cls * 15}`, emoji: '💰' },
          ]),
          explanation: `वापस मिलने वाली राशि = ₹${notePaid} - ₹${cls * 15} = ₹${changeBack}।`,
        },
      ],
    };
  }

  // 11. PATTERNS & SYMMETRY (पैटर्न / सममिति)
  if (titleText.includes('पैटर्न') || titleText.includes('pattern') || titleText.includes('सममिति')) {
    const step = cls * 2 + (chNum % 3);
    const seq1 = step;
    const seq2 = step * 2;
    const seq3 = step * 3;
    const seq4 = step * 4;

    const oddStart = cls * 2 - 1;

    return {
      topicNameHindi: 'पैटर्न और सममिति (Patterns & Symmetry)',
      topicNameEnglish: chapter.originalTitleEnglish,
      dragDrop: {
        instruction: {
          native: `ᱜᱚᱲᱦᱚᱱ ᱨᱩᱯ (${chapter.originalTitleHindi}): ᱮᱞ ᱯᱮᱴᱟᱨᱱ ᱟᱨ ᱪᱤᱛᱟᱹᱨ ᱯᱮᱴᱟᱨᱱ ᱵᱷᱮᱜᱟᱨ ᱢᱮ!`,
          transliteration: 'El Pattern ar Chitar Pattern bhegar me!',
          hindi: `पाठ "${chapter.originalTitleHindi}": संख्या पैटर्न और आकृति/चित्र पैटर्न को सही समूह में रखो!`,
          english: 'Sort the sequences into Number Patterns vs Shape/Picture Patterns!',
        },
        zones: [
          { id: 'num_pat', label: { native: 'ᱮᱞ ᱯᱮᱴᱟᱨᱱ (Number Pattern)', transliteration: 'El Pattern', hindi: 'संख्या पैटर्न', english: 'Number Pattern' }, color: 'bg-emerald-500' },
          { id: 'shape_pat', label: { native: 'ᱪᱤᱛᱟᱹᱨ ᱯᱮᱴᱟᱨᱱ (Shape Pattern)', transliteration: 'Chitar Pattern', hindi: 'चित्र पैटर्न', english: 'Picture Pattern' }, color: 'bg-purple-500' },
        ],
        items: [
          { id: `${qPrefix}-d1`, name: { native: `${seq1}, ${seq2}, ${seq3}, ${seq4}`, transliteration: 'Number Sequence', hindi: `${seq1}, ${seq2}, ${seq3}, ${seq4}`, english: `${seq1}, ${seq2}, ${seq3}, ${seq4}` }, emoji: '🔢', correctZone: 'num_pat' },
          { id: `${qPrefix}-d2`, name: { native: `${cls * 5}, ${cls * 10}, ${cls * 15}`, transliteration: 'Skip count pattern', hindi: `${cls * 5}, ${cls * 10}, ${cls * 15}`, english: `${cls * 5}, ${cls * 10}, ${cls * 15}` }, emoji: '🔟', correctZone: 'num_pat' },
          { id: `${qPrefix}-d3`, name: { native: '🔴 🔵 🔴 🔵', transliteration: 'Red Blue Red Blue', hindi: 'लाल-नीला-लाल-नीला', english: 'Red-Blue-Red-Blue' }, emoji: '🎨', correctZone: 'shape_pat' },
          { id: `${qPrefix}-d4`, name: { native: '🔺 ⬛ 🔺 ⬛', transliteration: 'Triangle Square Pattern', hindi: 'तिकोन-चौकोर-तिकोन', english: 'Triangle-Square' }, emoji: '💠', correctZone: 'shape_pat' },
        ],
      },
      matchingPairs: [
        { id: 'm1', emoji: '🌺🍃', nativeWord: '🌺 🍃 🌺 🍃 ___', transliteration: 'Flower Leaf Pattern', hindiWord: 'अगला: 🌺 (फूल)' },
        { id: 'm2', emoji: '🔢', nativeWord: `${seq1}, ${seq2}, ${seq3}, ___`, transliteration: `Add ${step} pattern`, hindiWord: `अगला: ${seq4}` },
        { id: 'm3', emoji: '🔤', nativeWord: 'A1, B2, C3, ___', transliteration: 'Letter-Number pattern', hindiWord: 'अगला: D4' },
        { id: 'm4', emoji: '🦋', nativeWord: 'तितली के दोनों पंख', transliteration: 'Butterfly wings', hindiWord: 'सममिति (Symmetry)' },
      ],
      countingItems: [
        { id: 'c1', emoji: '🔺', name: 'पैटर्न 1, 2, 3, ___ में अगला पद', count: 4 },
        { id: 'c2', emoji: '⭐', name: 'पैटर्न 2, 4, ___ में अगला पद', count: 6 },
        { id: 'c3', emoji: '🔷', name: 'पैटर्न 2, 5, ___ में अगला पद (+3 नियम)', count: 8 },
      ],
      countingInstructionHindi: `पाठ "${chapter.originalTitleHindi}": संख्या पैटर्न को समझकर अगली संख्या गिनें!`,
      countingInstructionEnglish: `Complete the growing pattern by counting the next number!`,
      quiz: [
        {
          id: `${qPrefix}-q1`,
          question: {
            native: `ᱯᱮᱴᱟᱨᱱ ᱯᱩᱨᱟᱹᱣ ᱢᱮ: ${seq1}, ${seq2}, ${seq3}, ___ (ᱚᱠᱟ ᱮᱞ ᱦᱤᱡᱩᱜᱼᱟ?)`,
            transliteration: `Pattern puraw me: ${seq1}, ${seq2}, ${seq3}, ___`,
            hindi: `पाठ "${chapter.originalTitleHindi}": संख्या पैटर्न पूरा करो: ${seq1}, ${seq2}, ${seq3}, ___ (अगली संख्या क्या होगी?)`,
            english: `Complete the number pattern: ${seq1}, ${seq2}, ${seq3}, ___`,
          },
          options: arrangeOptions(`${qPrefix}-q1`, { text: `${seq4}`, emoji: '💠' }, [
            { text: `${seq3 + 1}`, emoji: '🔢' },
            { text: `${seq4 + step}`, emoji: '🔢' },
            { text: `${seq2}`, emoji: '🔢' },
          ]),
          explanation: `इस पैटर्न में हर बार +${step} जुड़ रहा है: ${seq3} + ${step} = ${seq4}।`,
        },
        {
          id: `${qPrefix}-q2`,
          question: {
            native: `ᱪᱤᱛᱟᱹᱨ ᱯᱮᱴᱟᱨᱱ ( कक्षा ${cls} ) ᱨᱮ ᱚᱠᱟᱴᱟᱜ ᱦᱤᱡᱩᱜᱼᱟ: 🌻 🌲 🌻 🌲 🌻 ___ ?`,
            transliteration: 'Chitar pattern re okatag hijug-a: 🌻 🌲 🌻 🌲 🌻 ___ ?',
            hindi: `कक्षा ${cls} चित्र पैटर्न में आगे क्या आएगा: 🌻 🌲 🌻 🌲 🌻 ___ ?`,
            english: `In Class ${cls} picture pattern, what comes next: 🌻 🌲 🌻 🌲 🌻 ___ ?`,
          },
          options: arrangeOptions(`${qPrefix}-q2`, { text: '🌲 (पेड़ / Tree)', emoji: '🌲' }, [
            { text: '🌻 (फूल / Flower)', emoji: '🌻' },
            { text: '🍎 (सेब / Apple)', emoji: '🍎' },
            { text: '🌙 (चाँद / Moon)', emoji: '🌙' },
          ]),
          explanation: 'फूल (🌻) और पेड़ (🌲) बारी-बारी से आ रहे हैं, इसलिए 🌻 के बाद 🌲 आएगा।',
        },
        {
          id: `${qPrefix}-q3`,
          question: {
            native: `${oddStart}, ${oddStart + 2}, ${oddStart + 4}, ${oddStart + 6}, ___ ᱱᱚᱶᱟ ᱯᱮᱴᱟᱨᱱ ᱨᱮ ᱚᱠᱟ ᱮᱞ ᱦᱤᱡᱩᱜᱼᱟ?`,
            transliteration: `${oddStart}, ${oddStart + 2}, ${oddStart + 4}, ${oddStart + 6}, ___ nowa pattern re oka el hijug-a?`,
            hindi: `विषम संख्याओं के पैटर्न ${oddStart}, ${oddStart + 2}, ${oddStart + 4}, ${oddStart + 6}, ___ में अगली संख्या कौन-सी होगी?`,
            english: `What comes next in the odd number pattern: ${oddStart}, ${oddStart + 2}, ${oddStart + 4}, ${oddStart + 6}, ___?`,
          },
          options: arrangeOptions(`${qPrefix}-q3`, { text: `${oddStart + 8}`, emoji: '✅' }, [
            { text: `${oddStart + 7}`, emoji: '🔢' },
            { text: `${oddStart + 10}`, emoji: '🔟' },
            { text: `${oddStart + 5}`, emoji: '🔢' },
          ]),
          explanation: `प्रत्येक पद में 2 जोड़ने पर: ${oddStart + 6} + 2 = ${oddStart + 8} आता है।`,
        },
        {
          id: `${qPrefix}-q4`,
          question: {
            native: `पैटर्न ${cls * 10}, ${cls * 20}, ${cls * 30}, ___ में हर बार कितना जोड़ा जा रहा है?`,
            transliteration: `Pattern ${cls * 10}, ${cls * 20}, ${cls * 30} re tinag mesaakan kana?`,
            hindi: `बढ़ते पैटर्न ${cls * 10}, ${cls * 20}, ${cls * 30}, ${cls * 40} में कौन-सा नियम (Rule) लागू हो रहा है?`,
            english: `What is the rule in the growing pattern ${cls * 10}, ${cls * 20}, ${cls * 30}, ${cls * 40}?`,
          },
          options: arrangeOptions(`${qPrefix}-q4`, { text: `हर बार +${cls * 10} जोड़ना (Add ${cls * 10})`, emoji: '📈' }, [
            { text: 'हर बार -5 घटाना', emoji: '📉' },
            { text: 'हर बार +1 जोड़ना', emoji: '➕' },
            { text: '0 से गुणा करना', emoji: '⭕' },
          ]),
          explanation: `इस अनुक्रम में प्रत्येक अगला पद +${cls * 10} जोड़ने से प्राप्त होता है।`,
        },
      ],
    };
  }

  // 12. DATA HANDLING & CHARTS (आँकड़ों का उपयोग / निरूपण / कितनी चोटी हैं / आलेख)
  if (
    titleText.includes('आँकड़') ||
    titleText.includes('आंकड़') ||
    titleText.includes('data') ||
    titleText.includes('चोटी') ||
    titleText.includes('ponytail') ||
    titleText.includes('आलेख') ||
    titleText.includes('chart')
  ) {
    const mangoes = 5 + cls * 2;
    const apples = 3 + chNum;
    const bananas = mangoes + 4;
    const scaleVal = cls + 1;

    return {
      topicNameHindi: 'आँकड़ों का खेल और चार्ट (Data Handling)',
      topicNameEnglish: chapter.originalTitleEnglish,
      dragDrop: {
        instruction: {
          native: `ᱞᱮᱠᱷᱟ ᱡᱚᱠᱷᱟ (${chapter.originalTitleHindi}): ᱡᱚ (Fruits) ᱟᱨ ᱵᱟᱦᱟ (Flowers) ᱨᱮᱱᱟᱜ ᱛᱟᱹᱞᱠᱟᱹ ᱵᱷᱮᱜᱟᱨ ᱢᱮ!`,
          transliteration: 'Jo (Fruits) ar Baha (Flowers) talika re bhegar me!',
          hindi: `पाठ "${chapter.originalTitleHindi}": आँकड़ों की तालिका के लिए फलों और फूलों को अलग-अलग समूह में रखो!`,
          english: 'Group the survey items into Fruits Table vs Flowers Table!',
        },
        zones: [
          { id: 'fruits', label: { native: 'ᱡᱚ ᱠᱚ (Fruits Data)', transliteration: 'Jo ko', hindi: 'फलों की गिनती', english: 'Fruits Group' }, color: 'bg-emerald-500' },
          { id: 'flowers', label: { native: 'ᱵᱟᱦᱟ ᱠᱚ (Flowers Data)', transliteration: 'Baha ko', hindi: 'फूलों की गिनती', english: 'Flowers Group' }, color: 'bg-amber-500' },
        ],
        items: [
          { id: `${qPrefix}-d1`, name: { native: `ᱩᱞ (Mango - ${mangoes})`, transliteration: 'Ul (Mango)', hindi: `आम (${mangoes} बच्चे)`, english: `Mango (${mangoes})` }, emoji: '🥭', correctZone: 'fruits' },
          { id: `${qPrefix}-d2`, name: { native: `ᱠᱟᱭᱨᱟ (Banana - ${bananas})`, transliteration: 'Kayra (Banana)', hindi: `केला (${bananas} बच्चे)`, english: `Banana (${bananas})` }, emoji: '🍌', correctZone: 'fruits' },
          { id: `${qPrefix}-d3`, name: { native: `ᱥᱟᱨᱡᱚᱢ ᱵᱟᱦᱟ (${cls * 3})`, transliteration: 'Sarjom Baha', hindi: `साल फूल (${cls * 3})`, english: `Sal Flower (${cls * 3})` }, emoji: '🌺', correctZone: 'flowers' },
          { id: `${qPrefix}-d4`, name: { native: `ᱩᱯᱟᱹᱞ ᱵᱟᱦᱟ (${cls * 2})`, transliteration: 'Upal Baha', hindi: `कमल फूल (${cls * 2})`, english: `Lotus (${cls * 2})` }, emoji: '🪷', correctZone: 'flowers' },
        ],
      },
      matchingPairs: [
        { id: 'm1', emoji: '📊', nativeWord: 'स्तंभ आलेख (Bar Graph)', transliteration: 'Bar Graph', hindiWord: 'दंडों की ऊँचाई से तुलना' },
        { id: 'm2', emoji: '🖼️', nativeWord: 'चित्रालेख (Pictograph)', transliteration: 'Pictograph', hindiWord: 'चित्रों द्वारा संख्या दिखाना' },
        { id: 'm3', emoji: '📝', nativeWord: 'मिलान चिह्न (Tally Marks)', transliteration: 'Tally Marks', hindiWord: '5-5 के समूह में रेखाएँ' },
        { id: 'm4', emoji: '🥧', nativeWord: 'पाई चार्ट (Pie Chart)', transliteration: 'Pie Chart', hindiWord: 'वृत्त के भागों में आँकड़े' },
      ],
      countingItems: [
        { id: 'c1', emoji: '👧', name: `दो चोटी वाली लड़कियाँ (${chapter.originalTitleHindi})`, count: (cls % 5) + 3 },
        { id: 'c2', emoji: '👦', name: `फुटबॉल खिलाड़ी (${chapter.originalTitleHindi})`, count: (cls % 5) + 4 },
        { id: 'c3', emoji: '🏏', name: `क्रिकेट खिलाड़ी (${chapter.originalTitleHindi})`, count: (cls % 5) + 5 },
      ],
      countingInstructionHindi: `पाठ "${chapter.originalTitleHindi}": तालिका के लिए बच्चों की संख्या गिनें!`,
      countingInstructionEnglish: `Count the children in each group to record the data!`,
      quiz: [
        {
          id: `${qPrefix}-q1`,
          question: {
            native: `ᱪᱟᱱᱟᱪ ${cls} ᱨᱮ ${mangoes} ᱜᱤᱫᱽᱨᱟᱹ ᱩᱞ, ${apples} ᱜᱤᱫᱽᱨᱟᱹ ᱥᱮᱵᱽ ᱟᱨ ${bananas} ᱜᱤᱫᱽᱨᱟᱹ ᱠᱟᱭᱨᱟ ᱠᱚ ᱠᱩᱥᱤᱭᱟᱜᱼᱟ। ᱡᱚᱛᱚ ᱠᱷᱚᱱ ᱵᱟᱹᱲᱛᱤ ᱚᱠᱟ ᱡᱚ ᱠᱚ ᱠᱩᱥᱤᱭᱟᱜᱼᱟ?`,
            transliteration: `Chanach ${cls} re ${mangoes} gidra ul, ${apples} seb ar ${bananas} kayra ko kusiyag-a. Joto khon barti oka jo?`,
            hindi: `पाठ "${chapter.originalTitleHindi}": कक्षा ${cls} में ${mangoes} बच्चों को आम, ${apples} को सेब और ${bananas} को केला पसंद है। सबसे अधिक बच्चों को कौन-सा फल पसंद है?`,
            english: `In Class ${cls}, ${mangoes} children like mango, ${apples} like apple, and ${bananas} like banana. Which fruit is liked by the most children?`,
          },
          options: arrangeOptions(`${qPrefix}-q1`, { text: `केला / Banana (${bananas} बच्चे)`, emoji: '🍌' }, [
            { text: `आम / Mango (${mangoes} बच्चे)`, emoji: '🥭' },
            { text: `सेब / Apple (${apples} बच्चे)`, emoji: '🍎' },
            { text: 'तीनों बराबर हैं', emoji: '⚖️' },
          ]),
          explanation: `${bananas} सबसे बड़ी संख्या है, इसलिए केला सबसे अधिक बच्चों को पसंद है।`,
        },
        {
          id: `${qPrefix}-q2`,
          question: {
            native: `ᱩᱞ (${mangoes}) ᱟᱨ ᱥᱮᱵᱽ (${apples}) ᱠᱩᱥᱤᱭᱟᱜ ᱜᱤᱫᱽᱨᱟᱹ ᱠᱚ ᱢᱮᱥᱟ ᱠᱟᱛᱮ ᱛᱤᱱᱟᱹᱜ ᱦᱩᱭᱩᱜᱼᱟ?`,
            transliteration: `Ul (${mangoes}) ar Seb (${apples}) kusiyag gidra ko mesa kate tinag?`,
            hindi: `आम (${mangoes}) और सेब (${apples}) पसंद करने वाले बच्चों की कुल संख्या कितनी है?`,
            english: `How many children in total like either mango (${mangoes}) or apple (${apples})?`,
          },
          options: arrangeOptions(`${qPrefix}-q2`, { text: `${mangoes + apples} बच्चे`, emoji: '📊' }, [
            { text: `${Math.abs(mangoes - apples)} बच्चे`, emoji: '➖' },
            { text: `${bananas} बच्चे`, emoji: '🍌' },
            { text: `${mangoes + apples + 5} बच्चे`, emoji: '🔢' },
          ]),
          explanation: `आम और सेब पसंद करने वाले कुल बच्चे = ${mangoes} + ${apples} = ${mangoes + apples}।`,
        },
        {
          id: `${qPrefix}-q3`,
          question: {
            native: `चित्रालेख (Pictograph) में यदि 1 🌳 = ${scaleVal} पेड़ है, तो 🌳🌳🌳 का अर्थ कितने पेड़ हैं?`,
            transliteration: `Yadi 1 🌳 = ${scaleVal} dare kana, tobe 🌳🌳🌳 renag mane tinag dare?`,
            hindi: `यदि किसी चित्रालेख (Pictograph) में 1 🌳 चित्र = ${scaleVal} पेड़ दिखाता है, तो 🌳🌳🌳 का मतलब कितने पेड़ हैं?`,
            english: `In a pictograph, if 1 🌳 symbol stands for ${scaleVal} trees, how many trees do 🌳🌳🌳 represent?`,
          },
          options: arrangeOptions(`${qPrefix}-q3`, { text: `${3 * scaleVal} पेड़ (3 × ${scaleVal})`, emoji: '🌳' }, [
            { text: '3 पेड़', emoji: '🌲' },
            { text: `${scaleVal} पेड़`, emoji: '🌴' },
            { text: `${4 * scaleVal + 1} पेड़`, emoji: '🌳' },
          ]),
          explanation: `1 चित्र = ${scaleVal} पेड़, इसलिए 3 चित्र = 3 × ${scaleVal} = ${3 * scaleVal} पेड़।`,
        },
        {
          id: `${qPrefix}-q4`,
          question: {
            native: `केला (${bananas}) पसंद करने वाले बच्चे आम (${mangoes}) पसंद करने वाले बच्चों से कितने अधिक हैं?`,
            transliteration: `Kayra (${bananas}) ar Ul (${mangoes}) tala re tinag bhegar menag-a?`,
            hindi: `तालिका में केला (${bananas}) पसंद करने वाले बच्चे आम (${mangoes}) पसंद करने वाले बच्चों से कितने अधिक हैं? (अध्याय ${chNum})`,
            english: `How many more children like banana (${bananas}) than mango (${mangoes}) in Chapter ${chNum}?`,
          },
          options: arrangeOptions(`${qPrefix}-q4`, { text: `4 बच्चे अधिक (${bananas} - ${mangoes} = 4)`, emoji: '📈' }, [
            { text: `${bananas + mangoes} बच्चे`, emoji: '➕' },
            { text: '10 बच्चे', emoji: '🔟' },
            { text: '1 बच्चा', emoji: '1️⃣' },
          ]),
          explanation: `${bananas} - ${mangoes} = 4 बच्चे अधिक हैं।`,
        },
      ],
    };
  }

  // 13. AREA & PERIMETER / TILING (क्षेत्रफल एवं परिमाप / पट्टीकरण)
  if (titleText.includes('क्षेत्रफल') || titleText.includes('परिमाप') || titleText.includes('area') || titleText.includes('perimeter')) {
    const side = cls + 2;
    const sqPerim = 4 * side;
    const sqArea = side * side;
    const rectL = cls + 3;
    const rectW = cls;
    const rectArea = rectL * rectW;

    return {
      topicNameHindi: 'क्षेत्रफल एवं परिमाप (Area & Perimeter)',
      topicNameEnglish: chapter.originalTitleEnglish,
      dragDrop: {
        instruction: {
          native: `ᱵᱮᱲᱦᱟᱭ ᱡᱚᱠᱷᱟ (Perimeter) ᱟᱨ ᱴᱷᱟᱶ ᱡᱚᱠᱷᱟ (Area) ᱵᱷᱮᱜᱟᱨ ᱢᱮ! (${chapter.originalTitleHindi})`,
          transliteration: 'Perimeter ar Area renag kami bhegar me!',
          hindi: `पाठ "${chapter.originalTitleHindi}": परिमाप (चारों ओर की बाड़) और क्षेत्रफल (अंदर की सतह/टाइल) को अलग करो!`,
          english: 'Sort the examples into Perimeter (Boundary Length) vs Area (Surface Covered)!',
        },
        zones: [
          { id: 'perimeter', label: { native: 'ᱵᱮᱲᱦᱟᱭ ᱡᱚᱠᱷᱟ (Perimeter)', transliteration: 'Berhay Jokha', hindi: 'परिमाप (घेरा / बाड़)', english: 'Perimeter (Boundary)' }, color: 'bg-emerald-500' },
          { id: 'area', label: { native: 'ᱴᱷᱟᱶ ᱡᱚᱠᱷᱟ (Area)', transliteration: 'Thanw Jokha', hindi: 'क्षेत्रफल (अंदर की सतह)', english: 'Area (Surface Inside)' }, color: 'bg-sky-500' },
        ],
        items: [
          { id: `${qPrefix}-d1`, name: { native: 'ᱵᱟᱜᱟᱱ ᱵᱮᱲᱦᱟᱭ ᱛᱟᱨ (Fence)', transliteration: 'Bagan berhay tar', hindi: `बगीचे के चारों ओर ${sqPerim}m तार`, english: 'Fencing around garden' }, emoji: '🚧', correctZone: 'perimeter' },
          { id: `${qPrefix}-d2`, name: { native: 'ᱯᱷᱚᱴᱚ ᱯᱷᱨᱮᱢ ᱨᱮᱱᱟᱜ ᱠিনारा', transliteration: 'Photo frame border', hindi: 'फोटो फ्रेम की बाहरी पट्टी', english: 'Border of a photo frame' }, emoji: '🖼️', correctZone: 'perimeter' },
          { id: `${qPrefix}-d3`, name: { native: 'ᱚᱛ ᱨᱮ ᱴᱟᱭᱤᱞ ᱞᱟᱜᱟᱣ (Floor Tiling)', transliteration: 'Ot re tile lagaw', hindi: `फर्श पर ${sqArea} वर्ग टाइलें बिछाना`, english: 'Laying tiles on floor' }, emoji: '🟩', correctZone: 'area' },
          { id: `${qPrefix}-d4`, name: { native: 'चटाई बिछाना (Carpet Area)', transliteration: 'Chatai bichhaw', hindi: 'कमरे में दरी/चटाई बिछाना', english: 'Spreading carpet on floor' }, emoji: '毯', correctZone: 'area' },
        ],
      },
      matchingPairs: [
        { id: 'm1', emoji: '⬜', nativeWord: `भुजा ${side} cm वाले वर्ग का परिमाप`, transliteration: 'Perimeter of Square', hindiWord: `4 × ${side} = ${sqPerim} cm` },
        { id: 'm2', emoji: '🟩', nativeWord: `भुजा ${side} cm वाले वर्ग का क्षेत्रफल`, transliteration: 'Area of Square', hindiWord: `${side} × ${side} = ${sqArea} वर्ग cm` },
        { id: 'm3', emoji: '▭', nativeWord: `${rectL}m × ${rectW}m आयत का क्षेत्रफल`, transliteration: 'Rectangle Area', hindiWord: `${rectArea} वर्ग मीटर` },
        { id: 'm4', emoji: '📐', nativeWord: 'आयत का परिमाप सूत्र', transliteration: 'Rectangle Perimeter', hindiWord: '2 × (लम्बाई + चौड़ाई)' },
      ],
      countingItems: [
        { id: 'c1', emoji: '🟩', name: '2 × 3 आयत में कुल वर्ग टाइलें', count: 6 },
        { id: 'c2', emoji: '🟦', name: '2 cm भुजा वाले वर्ग का परिमाप', count: 8 },
        { id: 'c3', emoji: '🟨', name: '3 × 3 वर्ग में कुल टाइलें', count: 9 },
      ],
      countingInstructionHindi: `पाठ "${chapter.originalTitleHindi}": ग्रिड में वर्ग टाइलों और भुजाओं की इकाइयाँ गिनें!`,
      countingInstructionEnglish: 'Count the unit square tiles and boundary units!',
      quiz: [
        {
          id: `${qPrefix}-q1`,
          question: {
            native: `ᱢᱤᱫ ᱵᱚᱨᱜᱚ (Square) ᱨᱮᱱᱟᱜ ᱢᱤᱫ ᱟᱲᱮ ${side} cm ᱠᱟᱱᱟ। ᱚᱱᱟ ᱨᱮᱱᱟᱜ ᱵᱮᱲᱦᱟᱭ ᱡᱚᱠᱷᱟ (Perimeter) ᱛᱤᱱᱟᱹᱜ ᱦᱩᱭᱩᱜᱼᱟ?`,
            transliteration: `Mit square renag side ${side} cm kana. Perimeter tinag huyug-a?`,
            hindi: `पाठ "${chapter.originalTitleHindi}": एक वर्ग (Square) की प्रत्येक भुजा ${side} सेमी है। उसका परिमाप (Perimeter) क्या होगा?`,
            english: `Each side of a square is ${side} cm. What is its perimeter?`,
          },
          options: arrangeOptions(`${qPrefix}-q1`, { text: `${sqPerim} सेमी (4 × ${side})`, emoji: '⬜' }, [
            { text: `${side + 4} सेमी`, emoji: '📏' },
            { text: `${sqArea} सेमी`, emoji: '🟩' },
            { text: `${2 * side} सेमी`, emoji: '🔢' },
          ]),
          explanation: `वर्ग का परिमाप = 4 × भुजा = 4 × ${side} = ${sqPerim} सेमी।`,
        },
        {
          id: `${qPrefix}-q2`,
          question: {
            native: `${rectL} cm ᱡᱤᱞᱤᱧ ᱟᱨ ${rectW} cm ᱚᱥᱟᱨ ᱟᱭᱚᱛ (Rectangle) ᱨᱮᱱᱟᱜ ᱴᱷᱟᱶ ᱡᱚᱠᱷᱟ (Area) ᱛᱤᱱᱟᱹᱜ ᱦᱩᱭᱩᱜᱼᱟ?`,
            transliteration: `${rectL} cm long ar ${rectW} cm wide rectangle renag Area tinag huyug-a?`,
            hindi: `${rectL} सेमी लम्बाई और ${rectW} सेमी चौड़ाई वाले आयत का क्षेत्रफल (Area) क्या होगा?`,
            english: `What is the area of a rectangle with length ${rectL} cm and width ${rectW} cm?`,
          },
          options: arrangeOptions(`${qPrefix}-q2`, { text: `${rectArea} वर्ग सेमी (${rectL} × ${rectW})`, emoji: '🟩' }, [
            { text: `${rectL + rectW} वर्ग सेमी`, emoji: '➕' },
            { text: `${2 * (rectL + rectW)} वर्ग सेमी`, emoji: '▭' },
            { text: `${rectL * rectL} वर्ग सेमी`, emoji: '⬜' },
          ]),
          explanation: `आयत का क्षेत्रफल = लम्बाई × चौड़ाई = ${rectL} × ${rectW} = ${rectArea} वर्ग सेमी।`,
        },
        {
          id: `${qPrefix}-q3`,
          question: {
            native: `भुजा ${side} सेमी वाले वर्ग का क्षेत्रफल (Area = भुजा × भुजा) कितना होगा?`,
            transliteration: `Side ${side} cm square renag Area tinag huyug-a?`,
            hindi: `यदि किसी वर्गाकार क्यारी की भुजा ${side} मीटर है, तो उसका क्षेत्रफल (Area) कितना होगा?`,
            english: `If a square garden bed has a side of ${side} metres, what is its area?`,
          },
          options: arrangeOptions(`${qPrefix}-q3`, { text: `${sqArea} वर्ग मीटर (${side} × ${side})`, emoji: '🟩' }, [
            { text: `${sqPerim} वर्ग मीटर`, emoji: '🚧' },
            { text: `${side * 2} वर्ग मीटर`, emoji: '📏' },
            { text: `${side + side} वर्ग मीटर`, emoji: '➕' },
          ]),
          explanation: `वर्ग का क्षेत्रफल = भुजा × भुजा = ${side} × ${side} = ${sqArea} वर्ग मीटर।`,
        },
        {
          id: `${qPrefix}-q4`,
          question: {
            native: `${rectL} m लम्बे और ${rectW} m चौड़े बगीचे के चारों ओर बाड़ लगाने के लिए कुल कितने मीटर तार चाहिए (परिमाप)?`,
            transliteration: `${rectL} m ar ${rectW} m bagan berhay tar lagaw lagid tinag meter tar lagती-a?`,
            hindi: `${rectL} मीटर लम्बे और ${rectW} मीटर चौड़े आयताकार बगीचे का परिमाप 2 × (${rectL} + ${rectW}) कितना होगा?`,
            english: `What is the perimeter of a rectangular garden of length ${rectL} m and width ${rectW} m?`,
          },
          options: arrangeOptions(`${qPrefix}-q4`, { text: `${2 * (rectL + rectW)} मीटर`, emoji: '🚧' }, [
            { text: `${rectL + rectW} मीटर`, emoji: '📏' },
            { text: `${rectArea} मीटर`, emoji: '🟩' },
            { text: `${4 * rectL} मीटर`, emoji: '⬜' },
          ]),
          explanation: `आयत का परिमाप = 2 × (लम्बाई + चौड़ाई) = 2 × (${rectL} + ${rectW}) = ${2 * (rectL + rectW)} मीटर।`,
        },
      ],
    };
  }

  // 14. SHAPES, SPACE, LINES & GEOMETRY (तुलना / आकृतियाँ / लंबा-गोल / पैरों के निशान / रेखाएँ / ज्यामिति / कोण)
  if (
    titleText.includes('आकृति') ||
    titleText.includes('तुलना') ||
    titleText.includes('shape') ||
    titleText.includes('लंबा') ||
    titleText.includes('गोल') ||
    titleText.includes('round') ||
    titleText.includes('निशान') ||
    titleText.includes('footprint') ||
    titleText.includes('रेखा') ||
    titleText.includes('line') ||
    titleText.includes('ज्यामिति') ||
    titleText.includes('geometry') ||
    titleText.includes('कोण') ||
    titleText.includes('angle')
  ) {
    const isLongRound = titleText.includes('लंबा') || titleText.includes('round');
    const isFootprints = titleText.includes('निशान') || titleText.includes('footprint');
    const isLines = titleText.includes('रेखा') || titleText.includes('line');
    const isAngles = titleText.includes('कोण') || titleText.includes('angle');

    return {
      topicNameHindi: isAngles ? 'ज्यामितीय आकृतियाँ और कोण (Shapes & Angles)' : isLongRound ? 'लंबा और गोल (Long & Round)' : isFootprints ? 'पैरों के निशान और छाप (Footprints)' : isLines ? 'रेखाएँ ही रेखाएँ (Lines)' : 'आकृतियाँ और ज्यामिति (Shapes & Geometry)',
      topicNameEnglish: chapter.originalTitleEnglish,
      dragDrop: {
        instruction: {
          native: `${chapter.originalTitleHindi}: ᱡᱤᱱᱤᱥ ᱠᱚ ᱴᱷᱤᱠ ᱜᱟᱫᱮᱞ ᱨᱮ ᱵᱷᱮᱜᱟᱨ ᱢᱮ!`,
          transliteration: 'Chitar ar Rup mutabik jinis bhegar me!',
          hindi: isLongRound
            ? `पाठ "${chapter.originalTitleHindi}": लंबी (Long) और गोल (Round) वस्तुओं को सही समूह में रखो!`
            : isLines
            ? `पाठ "${chapter.originalTitleHindi}": सीधी रेखा (Straight) और मुड़ी हुई वक्र रेखा (Curved) वाली वस्तुओं को अलग करो!`
            : `पाठ "${chapter.originalTitleHindi}": गोल/लुढ़कने वाली और चौकोर/चपटी वस्तुओं को अलग करो!`,
          english: isLongRound
            ? 'Sort the objects into Long Objects vs Round Objects!'
            : isLines
            ? 'Sort items into Straight Edges vs Curved Edges!'
            : 'Sort the objects into Round/Curved vs Flat/Cornered!',
        },
        zones: [
          {
            id: 'round_zone',
            label: {
              native: isLongRound ? 'ᱜᱩᱞᱟᱹᱴ (Round)' : isLines ? 'വक्र ᱜᱟᱨ (Curved)' : 'ᱜᱩᱰᱨᱟᱹᱣ (Round/Rolls)',
              transliteration: 'Gulat / Curved',
              hindi: isLongRound ? 'गोल वस्तुएँ (Round)' : isLines ? 'मुड़ी/वक्र रेखा (Curved)' : 'गोल / लुढ़कने वाली',
              english: isLongRound ? 'Round' : isLines ? 'Curved Line' : 'Round / Rolls',
            },
            color: 'bg-emerald-500',
          },
          {
            id: 'flat_zone',
            label: {
              native: isLongRound ? 'ᱡᱤᱞᱤᱧ (Long)' : isLines ? 'ᱥᱚᱡᱷᱮ ᱜᱟᱨ (Straight)' : 'ᱥᱤᱫᱩᱲ (Flat/Slides)',
              transliteration: 'Jiling / Straight',
              hindi: isLongRound ? 'लंबी वस्तुएँ (Long)' : isLines ? 'सीधी रेखा (Straight)' : 'चपटी / खिसकने वाली',
              english: isLongRound ? 'Long' : isLines ? 'Straight Line' : 'Flat / Slides',
            },
            color: 'bg-amber-500',
          },
        ],
        items: [
          { id: `${qPrefix}-d1`, name: { native: 'ᱵᱚᱞ / ᱪᱩᱲᱤ', transliteration: 'Bol / Churi', hindi: isLines ? 'गोल चूड़ी' : 'फुटबॉल गेंद', english: isLines ? 'Round Bangle' : 'Football' }, emoji: '⚽', correctZone: 'round_zone' },
          { id: `${qPrefix}-d2`, name: { native: 'কমলা / ᱥᱤᱠᱠᱟᱹ', transliteration: 'Komla / Sikka', hindi: isFootprints ? 'सिक्के की गोल छाप' : 'गोल संतरा', english: 'Round Orange / Coin' }, emoji: '🍊', correctZone: 'round_zone' },
          { id: `${qPrefix}-d3`, name: { native: 'ᱯᱮᱱᱥᱤᱞ / ᱯᱚᱛᱚᱵ', transliteration: 'Pencil / Kitab', hindi: isLongRound ? 'लंबी पेंसिल' : 'स्केल (रूलर)', english: isLongRound ? 'Long Pencil' : 'Straight Ruler' }, emoji: isLongRound ? '✏️' : '📏', correctZone: 'flat_zone' },
          { id: `${qPrefix}-d4`, name: { native: 'ᱵᱟᱸᱥ / ᱵᱟᱠᱥᱟ', transliteration: 'Mat / Baksa', hindi: isLongRound ? 'बाँस की छड़ी' : 'किताब का किनारा', english: isLongRound ? 'Bamboo Stick' : 'Book Edge' }, emoji: isLongRound ? '🎋' : '📘', correctZone: 'flat_zone' },
        ],
      },
      matchingPairs: [
        { id: 'm1', emoji: '🔺', nativeWord: 'त्रिभुज (Triangle)', transliteration: 'Pe Kon (Triangle)', hindiWord: '3 भुजाएँ और 3 कोने' },
        { id: 'm2', emoji: '⬜', nativeWord: 'वर्ग (Square)', transliteration: 'Pun Barabar Kon', hindiWord: '4 बराबर भुजाएँ' },
        { id: 'm3', emoji: '⭕', nativeWord: 'वृत्त (Circle)', transliteration: 'Gulat (Circle)', hindiWord: 'गोल - 0 कोने' },
        { id: 'm4', emoji: '📐', nativeWord: `अध्याय ${chNum}: समकोण`, transliteration: 'Right Angle', hindiWord: '90° का कोण (L आकार)' },
      ],
      countingItems: [
        { id: 'c1', emoji: '🔺', name: `त्रिभुज के कोने (${chapter.originalTitleHindi})`, count: 3 },
        { id: 'c2', emoji: '⬜', name: `वर्ग की बराबर भुजाएँ (${chapter.originalTitleHindi})`, count: 4 },
        { id: 'c3', emoji: '🎲', name: `पासे (Cube) के समतल फलक (${chapter.originalTitleHindi})`, count: 6 },
      ],
      countingInstructionHindi: `पाठ "${chapter.originalTitleHindi}" में आकृतियों की भुजाएँ और कोने गिनें!`,
      countingInstructionEnglish: `Count the sides, corners, and faces of the shapes!`,
      quiz: [
        {
          id: `${qPrefix}-q1`,
          question: {
            native: isFootprints
              ? 'माचिस की डिब्बी या ईंट को कागज़ पर रखकर पेंसिल घुमाने से कौन-सी आकृति बनेगी?'
              : isLines
              ? 'गेंद या चूड़ी के किनारे किस प्रकार की रेखा (Line) होती है?'
              : isAngles
              ? `कक्षा ${cls} ज्यामिति: समकोण (Right Angle) का मान कितने अंश (Degree) होता है?`
              : `पाठ "${chapter.originalTitleHindi}": त्रिभुज (Triangle 🔺) में कुल कितनी भुजाएँ होती हैं?`,
            transliteration: isFootprints
              ? 'Baksa chhap lekhan oka rup benaw-a?'
              : isLines
              ? 'Bol se churi re chet lekan gar tahena?'
              : isAngles
              ? 'Right angle re tinag degree tahena?'
              : 'Triangle re tinag aare tahena?',
            hindi: isFootprints
              ? `पाठ "${chapter.originalTitleHindi}": माचिस की डिब्बी या किताब के तले की छाप से कौन-सी आकृति बनती है?`
              : isLines
              ? `पाठ "${chapter.originalTitleHindi}": चूड़ी या सिक्के के चारों ओर पेंसिल घुमाने पर कैसी रेखा बनती है?`
              : isAngles
              ? `पाठ "${chapter.originalTitleHindi}" (कक्षा ${cls}): समकोण (Right Angle) का मान कितने अंश (Degree) होता है?`
              : `पाठ "${chapter.originalTitleHindi}": एक त्रिभुज (Triangle 🔺) में कुल कितनी भुजाएँ और कोने होते हैं?`,
            english: isFootprints
              ? 'What 2D shape is traced around a matchbox or book?'
              : isLines
              ? 'What kind of line is traced around a round bangle or coin?'
              : isAngles
              ? `In Class ${cls} Geometry, how many degrees are in a Right Angle?`
              : 'How many sides and corners does a triangle (🔺) have?',
          },
          options: isFootprints
            ? arrangeOptions(`${qPrefix}-q1`, { text: 'आयत (Rectangle)', emoji: '▭' }, [
                { text: 'वृत्त (Circle)', emoji: '⭕' },
                { text: 'त्रिभुज (Triangle)', emoji: '🔺' },
                { text: 'तारा (Star)', emoji: '⭐' },
              ])
            : isLines
            ? arrangeOptions(`${qPrefix}-q1`, { text: 'वक्र / मुड़ी हुई रेखा (Curved Line)', emoji: '⭕' }, [
                { text: 'खड़ी सीधी रेखा (Standing Line)', emoji: '📏' },
                { text: 'पड़ी सीधी रेखा (Sleeping Line)', emoji: '➖' },
                { text: 'तिरछी रेखा (Slanting Line)', emoji: '📐' },
              ])
            : isAngles
            ? arrangeOptions(`${qPrefix}-q1`, { text: '90° (समकोण / Right Angle)', emoji: '📐' }, [
                { text: '45° (न्यूनकोण)', emoji: '📏' },
                { text: '180° (सरल कोण)', emoji: '➖' },
                { text: '360°', emoji: '⭕' },
              ])
            : arrangeOptions(`${qPrefix}-q1`, { text: '3 भुजाएँ और 3 कोने', emoji: '🔺' }, [
                { text: '4 भुजाएँ और 4 कोने', emoji: '⬜' },
                { text: '0 कोने', emoji: '⭕' },
                { text: '6 कोने', emoji: '⬢' },
              ]),
          explanation: isFootprints
            ? 'माचिस की डिब्बी या किताब का तला आयताकार (Rectangle) होता है।'
            : isLines
            ? 'चूड़ी और सिक्का गोल होते हैं, इसलिए उनके चारों ओर वक्र रेखा (Curved Line) बनती है।'
            : isAngles
            ? 'समकोण (Right Angle) का मान ठीक 90° होता है।'
            : 'त्रिभुज (Triangle) में 3 सीधी भुजाएँ और 3 कोने होते हैं।',
        },
        {
          id: `${qPrefix}-q2`,
          question: {
            native: isLongRound
              ? 'बल्ला (Bat) और फुटबॉल (Ball) में से कौन लंबा है और कौन गोल?'
              : isFootprints
              ? 'हाथी और मुर्गी के पैरों के निशान (Footprints) में किसका निशान बड़ा होगा?'
              : isLines
              ? 'अंग्रेजी अक्षर "H" लिखने में कितनी खड़ी और पड़ी सीधी रेखाएँ लगती हैं?'
              : cls === 5
              ? 'जिस रेखाखंड के दोनों सिरों पर अंत-बिंदु (Two Endpoints) होते हैं, उसे क्या कहते हैं?'
              : `पाठ "${chapter.originalTitleHindi}": इनमें से किस आकृति में एक भी कोना (0 Corners) नहीं होता?`,
            transliteration: 'Chitar chinha:',
            hindi: isLongRound
              ? 'क्रिकेट का बल्ला (Bat) और गेंद (Ball) में से कौन-सी वस्तु गोल है?'
              : isFootprints
              ? 'गीली मिट्टी पर हाथी और मुर्गी के पैरों के निशान में से किसका निशान बड़ा होगा?'
              : isLines
              ? 'अंग्रेजी के अक्षर "H" में कुल कितनी सीधी रेखाएँ (Lines) होती हैं?'
              : cls === 5
              ? 'दो निश्चित बिंदुओं के बीच की सीधी दूरी को ज्यामिति में क्या कहते हैं?'
              : `पाठ "${chapter.originalTitleHindi}": किस आकृति में एक भी कोना (0 Corners) नहीं होता है?`,
            english: isLongRound
              ? 'Between a cricket bat and a ball, which object is round?'
              : isFootprints
              ? 'Whose footprint on wet mud is bigger: an elephant or a hen?'
              : isLines
              ? 'How many straight lines are used to write the capital letter "H"?'
              : cls === 5
              ? 'What do we call a straight path that has two fixed endpoints?'
              : 'Which shape has 0 corners?',
          },
          options: isLongRound
            ? arrangeOptions(`${qPrefix}-q2`, { text: 'गेंद गोल है, बल्ला लंबा है', emoji: '⚾' }, [
                { text: 'बल्ला गोल है', emoji: '🏏' },
                { text: 'दोनों चौकोर हैं', emoji: '⬜' },
                { text: 'दोनों तिकोन हैं', emoji: '🔺' },
              ])
            : isFootprints
            ? arrangeOptions(`${qPrefix}-q2`, { text: 'हाथी के पैर का निशान (Elephant)', emoji: '🐘' }, [
                { text: 'मुर्गी के पैर का निशान', emoji: '🐔' },
                { text: 'चींटी का निशान', emoji: '🐜' },
                { text: 'दोनों बराबर हैं', emoji: '⚖️' },
              ])
            : isLines
            ? arrangeOptions(`${qPrefix}-q2`, { text: '3 सीधी रेखाएँ (2 खड़ी, 1 पड़ी)', emoji: '📏' }, [
                { text: '1 वक्र रेखा', emoji: '⭕' },
                { text: '5 रेखाएँ', emoji: '5️⃣' },
                { text: '0 रेखाएँ', emoji: '0️⃣' },
              ])
            : cls === 5
            ? arrangeOptions(`${qPrefix}-q2`, { text: 'रेखाखंड (Line Segment)', emoji: '📏' }, [
                { text: 'वृत्त (Circle)', emoji: '⭕' },
                { text: 'अधिककोण (Obtuse Angle)', emoji: '📐' },
                { text: 'गोला (Sphere)', emoji: '⚽' },
              ])
            : arrangeOptions(`${qPrefix}-q2`, { text: 'वृत्त / गोल घेरा (Circle)', emoji: '⭕' }, [
                { text: 'वर्ग (Square)', emoji: '⬜' },
                { text: 'त्रिभुज (Triangle)', emoji: '🔺' },
                { text: 'आयत (Rectangle)', emoji: '▭' },
              ]),
          explanation: isLongRound
            ? 'गेंद (Ball) गोल होती है और बल्ला (Bat) लंबा होता है।'
            : isFootprints
            ? 'हाथी विशाल होता है, इसलिए उसके पैर का निशान मुर्गी से बहुत बड़ा और गोल होता है।'
            : isLines
            ? 'अक्षर H में 2 खड़ी रेखाएँ और बीच में 1 पड़ी रेखा, कुल 3 सीधी रेखाएँ होती हैं।'
            : cls === 5
            ? 'दो निश्चित अंत-बिंदुओं के बीच के भाग को रेखाखंड (Line Segment) कहते हैं।'
            : 'वृत्त (Circle) पूरी तरह गोल होता है, इसमें 0 कोने होते हैं।',
        },
        {
          id: `${qPrefix}-q3`,
          question: {
            native: `${cls} गिलासों के तले से कागज़ पर निशान बनाने पर कितने वृत्त (Circles) बनेंगे?`,
            transliteration: `${cls} gilas chhap lekhan tinag circle benaw-a?`,
            hindi: `यदि ${cls} चौकोर डिब्बों में से प्रत्येक के 4 कोने हैं, तो कुल कितने कोने होंगे?`,
            english: `If 1 square has 4 corners, how many corners do ${cls} separate squares have in total?`,
          },
          options: arrangeOptions(`${qPrefix}-q3`, { text: `${cls * 4} कोने`, emoji: '⬜' }, [
            { text: `${cls * 3} कोने`, emoji: '🔺' },
            { text: `${cls + 4} कोने`, emoji: '🔢' },
            { text: '0 कोने', emoji: '⭕' },
          ]),
          explanation: `1 वर्ग में 4 कोने होते हैं, इसलिए ${cls} वर्गों में 4 × ${cls} = ${cls * 4} कोने होंगे।`,
        },
        {
          id: `${qPrefix}-q4`,
          question: {
            native: isAngles
              ? `90° से छोटे कोण (जैसे ${cls * 10}°) को कौन-सा कोण कहते हैं?`
              : `${chNum} त्रिभुजों (Triangles) में कुल कितनी भुजाएँ होंगी (1 त्रिभुज = 3 भुजाएँ)?`,
            transliteration: isAngles ? '90° khon katij kon chet ko metag-a?' : `${chNum} triangle re tinag aare tahena?`,
            hindi: isAngles
              ? `90° (समकोण) से छोटे कोण (जैसे ${cls * 10}°) को क्या कहते हैं?`
              : `यदि 1 त्रिभुज में 3 भुजाएँ हैं, तो ${chNum} त्रिभुजों में कुल कितनी भुजाएँ होंगी?`,
            english: isAngles
              ? `What do we call an angle that measures less than 90° (such as ${cls * 10}°)?`
              : `If 1 triangle has 3 sides, how many sides are in ${chNum} triangles?`,
          },
          options: isAngles
            ? arrangeOptions(`${qPrefix}-q4`, { text: 'न्यूनकोण (Acute Angle)', emoji: '📐' }, [
                { text: 'अधिककोण (Obtuse Angle)', emoji: '📏' },
                { text: 'सरल कोण (180°)', emoji: '➖' },
                { text: 'वृत्त (Circle)', emoji: '⭕' },
              ])
            : arrangeOptions(`${qPrefix}-q4`, { text: `${chNum * 3} भुजाएँ`, emoji: '🔺' }, [
                { text: `${chNum * 4} भुजाएँ`, emoji: '⬜' },
                { text: `${chNum + 3} भुजाएँ`, emoji: '➕' },
                { text: '2 भुजाएँ', emoji: '2️⃣' },
              ]),
          explanation: isAngles
            ? '0° से अधिक और 90° से कम माप वाले कोण को न्यूनकोण (Acute Angle) कहते हैं।'
            : `1 त्रिभुज में 3 भुजाएँ होती हैं, इसलिए ${chNum} त्रिभुजों में ${chNum} × 3 = ${chNum * 3} भुजाएँ होंगी।`,
        },
      ],
    };
  }

  // 15. NUMBERS, COUNTING, TENS & PLACE VALUE (संख्याएँ / गिनो / दस-दस / बताओ कितने / दोहराना / स्थानीय मान)
  const is10to20 = titleText.includes('दस से बीस') || titleText.includes('10 to 20');
  const is21to50 = titleText.includes('इक्कीस से पचास') || titleText.includes('21 to 50');
  const is51to100 = titleText.includes('51 से 100') || titleText.includes('51 to 100');

  const baseNum = is51to100
    ? 60 + chNum
    : is21to50
    ? 25 + chNum
    : is10to20
    ? 11 + (chNum % 7)
    : cls === 1
    ? 2 + chNum
    : cls === 2
    ? 18 + chNum * 3
    : cls === 3
    ? 240 + chNum * 35
    : cls === 4
    ? 3420 + chNum * 120
    : 25410 + chNum * 250;
  const nextNum = baseNum + 1;
  const prevNum = baseNum - 1;
  const tensDigit = (cls + chNum) % 7 + 2;
  const onesDigit = (chNum % 8) + 1;
  const twoDigitNum = tensDigit * 10 + onesDigit;

  return {
    topicNameHindi: `संख्याएँ और स्थानीय मान (${chapter.originalTitleHindi})`,
    topicNameEnglish: chapter.originalTitleEnglish,
    dragDrop: {
      instruction: {
        native: `ᱮᱞ ᱠᱚ (${chapter.originalTitleHindi}): ${baseNum} ᱠᱷᱚᱱ ᱠᱟᱹᱴᱤᱡ ᱟᱨ ${baseNum} ᱠᱷᱚᱱ ᱢᱟᱨᱟᱝ ᱮᱞ ᱵᱷᱮᱜᱟᱨ ᱢᱮ!`,
        transliteration: `${baseNum} khon katij ar marang el bhegar me!`,
        hindi: `पाठ "${chapter.originalTitleHindi}": ${baseNum} से छोटी और ${baseNum} से बड़ी संख्याओं को सही समूह में रखो!`,
        english: `Sort the numbers into Smaller than ${baseNum} vs Greater than ${baseNum}!`,
      },
      zones: [
        { id: 'smaller', label: { native: `< ${baseNum}`, transliteration: `Smaller than ${baseNum}`, hindi: `${baseNum} से छोटी`, english: `Smaller (< ${baseNum})` }, color: 'bg-amber-500' },
        { id: 'greater', label: { native: `> ${baseNum}`, transliteration: `Greater than ${baseNum}`, hindi: `${baseNum} से बड़ी`, english: `Greater (> ${baseNum})` }, color: 'bg-emerald-500' },
      ],
      items: [
        { id: `${qPrefix}-d1`, name: { native: `${Math.max(1, baseNum - 3)}`, transliteration: `${Math.max(1, baseNum - 3)}`, hindi: `संख्या ${Math.max(1, baseNum - 3)}`, english: `${Math.max(1, baseNum - 3)}` }, emoji: '🔢', correctZone: 'smaller' },
        { id: `${qPrefix}-d2`, name: { native: `${Math.max(2, baseNum - 1)}`, transliteration: `${Math.max(2, baseNum - 1)}`, hindi: `संख्या ${Math.max(2, baseNum - 1)}`, english: `${Math.max(2, baseNum - 1)}` }, emoji: '📉', correctZone: 'smaller' },
        { id: `${qPrefix}-d3`, name: { native: `${baseNum + 2}`, transliteration: `${baseNum + 2}`, hindi: `संख्या ${baseNum + 2}`, english: `${baseNum + 2}` }, emoji: '📈', correctZone: 'greater' },
        { id: `${qPrefix}-d4`, name: { native: `${baseNum + 5}`, transliteration: `${baseNum + 5}`, hindi: `संख्या ${baseNum + 5}`, english: `${baseNum + 5}` }, emoji: '🌟', correctZone: 'greater' },
      ],
    },
    matchingPairs: [
      { id: 'm1', emoji: '1️⃣', nativeWord: `${prevNum} के बाद`, transliteration: `After ${prevNum}`, hindiWord: `${baseNum}` },
      { id: 'm2', emoji: '🔟', nativeWord: `${tensDigit} दहाई + ${onesDigit} इकाई`, transliteration: `${tensDigit} Tens + ${onesDigit} Ones`, hindiWord: `${twoDigitNum}` },
      { id: 'm3', emoji: '🪵', nativeWord: `10 के ${chNum} बंडल`, transliteration: `${chNum} bundles of 10`, hindiWord: `${chNum * 10}` },
      { id: 'm4', emoji: '💯', nativeWord: `${baseNum} + 10`, transliteration: `${baseNum} plus 10`, hindiWord: `${baseNum + 10}` },
    ],
    countingItems: [
      { id: 'c1', emoji: '🌺', name: `${chapter.originalTitleHindi} - समूह A`, count: ((chNum + 1) % 5) + 2 },
      { id: 'c2', emoji: '🦌', name: `${chapter.originalTitleHindi} - समूह B`, count: ((chNum + 3) % 5) + 3 },
      { id: 'c3', emoji: '🌳', name: `${chapter.originalTitleHindi} - समूह C`, count: ((chNum + 2) % 6) + 4 },
    ],
    countingInstructionHindi: `पाठ "${chapter.originalTitleHindi}" के लिए वस्तुओं को ध्यान से गिनें!`,
    countingInstructionEnglish: `Count the objects carefully for "${chapter.originalTitleEnglish}"!`,
    quiz: [
      {
        id: `${qPrefix}-q1`,
        question: {
          native: `ᱮᱞ ${baseNum} ᱛᱟᱭᱚᱢ (After) ᱚᱠᱟ ᱮᱞ ᱦᱤᱡᱩᱜᱼᱟ?`,
          transliteration: `El ${baseNum} tayom oka el hijug-a?`,
          hindi: `पाठ "${chapter.originalTitleHindi}": संख्या ${baseNum} के ठीक बाद (After) कौन-सी संख्या आती है?`,
          english: `In "${chapter.originalTitleEnglish}": Which number comes right after ${baseNum}?`,
        },
        options: arrangeOptions(`${qPrefix}-q1`, { text: `${nextNum}`, emoji: '➡️' }, [
          { text: `${prevNum}`, emoji: '⬅️' },
          { text: `${baseNum + 10}`, emoji: '🔟' },
          { text: `${baseNum + 2}`, emoji: '🔢' },
        ]),
        explanation: `${baseNum} में 1 जोड़ने पर अगली संख्या ${nextNum} आती है।`,
      },
      {
        id: `${qPrefix}-q2`,
        question: {
          native: `${tensDigit} दहाई (Tens) और ${onesDigit} इकाई (Ones) से कौन-सी संख्या बनती है?`,
          transliteration: `${tensDigit} Gel (Tens) ar ${onesDigit} Mit (Ones) te oka el benaw-a?`,
          hindi: `${tensDigit} दहाई (${tensDigit * 10}) और ${onesDigit} इकाई (${onesDigit}) मिलकर कौन-सी संख्या बनाते हैं?`,
          english: `What number is made by ${tensDigit} Tens (${tensDigit * 10}) and ${onesDigit} Ones (${onesDigit})?`,
        },
        options: arrangeOptions(`${qPrefix}-q2`, { text: `${twoDigitNum} (${tensDigit * 10} + ${onesDigit})`, emoji: '🔟' }, [
          { text: `${onesDigit * 10 + tensDigit}`, emoji: '🔢' },
          { text: `${tensDigit + onesDigit}`, emoji: '➕' },
          { text: `${tensDigit * 100 + onesDigit}`, emoji: '💯' },
        ]),
        explanation: `${tensDigit} दहाई = ${tensDigit * 10} और ${onesDigit} इकाई = ${onesDigit}, दोनों मिलकर ${twoDigitNum} बनाते हैं।`,
      },
      {
        id: `${qPrefix}-q3`,
        question: {
          native: cls >= 3
            ? `संख्या ${cls},${chNum}82 में अंक ${cls} हज़ार के स्थान पर है। उसका स्थानीय मान (Place Value) क्या है?`
            : `10-10 लकड़ियों के ${chNum} गट्ठर में कुल कितनी लकड़ियाँ होंगी?`,
          transliteration: cls >= 3
            ? `${cls},${chNum}82 re ${cls} renag Place Value tinag kana?`
            : `10-10 sahan renag ${chNum} bhar re tinag sahan tahena?`,
          hindi: cls >= 3
            ? `संख्या ${cls},${chNum}82 में हज़ार के स्थान पर स्थित अंक ${cls} का स्थानीय मान (Place Value) क्या है?`
            : `यदि एक गट्ठर में 10 लकड़ियाँ हैं, तो ऐसे ${chNum} गट्ठरों में कुल कितनी लकड़ियाँ होंगी?`,
          english: cls >= 3
            ? `In the number ${cls},${chNum}82, what is the place value of the digit ${cls} in the thousands place?`
            : `If 1 bundle has 10 sticks, how many sticks are in ${chNum} bundles?`,
        },
        options:
          cls >= 3
            ? arrangeOptions(`${qPrefix}-q3`, { text: `${cls * 1000}`, emoji: '💯' }, [
                { text: `${cls * 100}`, emoji: '🔢' },
                { text: `${cls * 10}`, emoji: '🔟' },
                { text: `${cls}`, emoji: '1️⃣' },
              ])
            : arrangeOptions(`${qPrefix}-q3`, { text: `${chNum * 10} लकड़ियाँ`, emoji: '🪵' }, [
                { text: `${chNum + 10} लकड़ियाँ`, emoji: '🔢' },
                { text: `${chNum * 2} लकड़ियाँ`, emoji: '🔢' },
                { text: `${chNum} लकड़ियाँ`, emoji: '1️⃣' },
              ]),
        explanation:
          cls >= 3
            ? `हज़ार (Thousands) के स्थान पर अंक ${cls} का स्थानीय मान ${cls} × 1000 = ${cls * 1000} है।`
            : `${chNum} दहाई = ${chNum} × 10 = ${chNum * 10} लकड़ियाँ।`,
      },
      {
        id: `${qPrefix}-q4`,
        question: {
          native: `${prevNum} ᱟᱨ ${nextNum} ᱛᱟᱞᱟ ᱨᱮ (Between) ᱚᱠᱟ ᱮᱞ ᱢᱮᱱᱟᱜᱼᱟ?`,
          transliteration: `${prevNum} ar ${nextNum} tala re oka el menag-a?`,
          hindi: `संख्या ${prevNum} और ${nextNum} के ठीक बीच (Between) कौन-सी संख्या आती है?`,
          english: `Which number comes right between ${prevNum} and ${nextNum}?`,
        },
        options: arrangeOptions(`${qPrefix}-q4`, { text: `${baseNum}`, emoji: '🏆' }, [
          { text: `${nextNum + 1}`, emoji: '🔢' },
          { text: `${Math.max(0, prevNum - 1)}`, emoji: '🔢' },
          { text: `${baseNum + 10}`, emoji: '🔟' },
        ]),
        explanation: `${prevNum}, ${baseNum}, ${nextNum} क्रम में ठीक बीच की संख्या ${baseNum} है।`,
      },
    ],
  };
}

interface ThemeProfile {
  categoryLabelA: { native: string; transliteration: string; hindi: string; english: string };
  categoryLabelB: { native: string; transliteration: string; hindi: string; english: string };
  itemsA: Array<{ native: string; transliteration: string; hindi: string; english: string; emoji: string }>;
  itemsB: Array<{ native: string; transliteration: string; hindi: string; english: string; emoji: string }>;
  themeFactHindi: string;
  themeFactEnglish: string;
  themeQuestionHindi: string;
  themeQuestionEnglish: string;
  themeCorrectOption: { text: string; emoji: string };
  themeDistractors: Array<{ text: string; emoji: string }>;
  secondQuestionHindi: string;
  secondQuestionEnglish: string;
  secondCorrectOption: { text: string; emoji: string };
  secondDistractors: Array<{ text: string; emoji: string }>;
}

/**
 * Returns rich, chapter-specific thematic content for Hindi, English, and EVS chapters
 * based on the chapter's title, keywords, and topic. Every question and drag-drop item
 * incorporates the chapter's specific title, class, and chapter number so no two chapters
 * produce identical questions.
 */
function getChapterThemeProfile(chapter: Chapter): ThemeProfile {
  const text = `${chapter.originalTitleHindi} ${chapter.originalTitleEnglish}`.toLowerCase();
  const chTag = `पाठ ${chapter.chapterNumber} "${chapter.originalTitleHindi}"`;
  const chTagEng = `Chapter ${chapter.chapterNumber} ("${chapter.originalTitleEnglish}")`;

  // 1. BIRSA MUNDA / BUDHU BHAGAT / FREEDOM FIGHTERS / RANI LAKSHMIBAI
  if (
    text.includes('बिरसा') ||
    text.includes('birsa') ||
    text.includes('बुधू भगत') ||
    text.includes('budhu') ||
    text.includes('लक्ष्मीबाई') ||
    text.includes('lakshmibai') ||
    text.includes('स्वतंत्रता') ||
    text.includes('freedom')
  ) {
    const isBirsa = text.includes('बिरसा') || text.includes('birsa');
    const isBudhu = text.includes('बुधू') || text.includes('budhu');
    const isRani = text.includes('लक्ष्मीबाई') || text.includes('lakshmibai');

    return {
      categoryLabelA: { native: 'ᱵᱤᱨ ᱥᱮᱱᱟᱱᱤ (Freedom Heroes)', transliteration: 'Bir Senani', hindi: 'वीर स्वतंत्रता सेनानी', english: 'Freedom Heroes' },
      categoryLabelB: { native: 'ᱵᱤᱨ ᱫᱟᱨᱮ (Forest Nature)', transliteration: 'Bir Dare', hindi: 'प्रकृति के तत्व', english: 'Elements of Nature' },
      itemsA: [
        { native: chapter.originalTitleHindi, transliteration: chapter.originalTitleEnglish, hindi: chapter.originalTitleHindi, english: chapter.originalTitleEnglish, emoji: chapter.coverEmoji || '🏹' },
        { native: 'ᱵᱤᱨ ᱥᱮᱱᱟᱱᱤ', transliteration: 'Bir Senani', hindi: 'अमर राष्ट्रनायक', english: 'National Hero', emoji: '⚔️' },
      ],
      itemsB: [
        { native: 'ᱥᱟᱨᱡᱚᱢ ᱫᱟᱨᱮ', transliteration: 'Sarjom Dare', hindi: 'सखुआ का पेड़', english: 'Sal Tree', emoji: '🌳' },
        { native: 'ᱵᱩᱨᱩ ᱜᱟᱰᱟ', transliteration: 'Buru Gada', hindi: 'पहाड़ और नदी', english: 'Hill & River', emoji: '⛰️' },
      ],
      themeFactHindi: isBirsa
        ? 'भगवान बिरसा मुंडा को "धरती आबा" कहा जाता है और उन्होंने उलगुलान आंदोलन का नेतृत्व किया।'
        : isBudhu
        ? 'वीर बुधू भगत झारखंड के लरका आंदोलन के महान सेनानी थे।'
        : isRani
        ? 'रानी लक्ष्मीबाई ने झांसी की रक्षा के लिए वीरता से युद्ध किया।'
        : 'महात्मा गांधी ने दांडी यात्रा द्वारा नमक कानून तोड़कर स्वतंत्रता का संदेश दिया।',
      themeFactEnglish: 'Our freedom fighters bravely protected the nation and people.',
      themeQuestionHindi: isBirsa
        ? `${chTag}: भगवान बिरसा मुंडा को आदर से किस नाम से पुकारा जाता है?`
        : isBudhu
        ? `${chTag}: वीर बुधू भगत किस राज्य के महान स्वतंत्रता सेनानी थे?`
        : isRani
        ? `${chTag}: रानी लक्ष्मीबाई किस राज्य की वीरांगना रानी थीं?`
        : `${chTag}: गांधीजी ने नमक कानून तोड़ने के लिए किस यात्रा का नेतृत्व किया था?`,
      themeQuestionEnglish: isBirsa
        ? `${chTagEng}: By what revered title is Bhagwan Birsa Munda known?`
        : isBudhu
        ? `${chTagEng}: Veer Budhu Bhagat was a great freedom fighter from which state?`
        : isRani
        ? `${chTagEng}: Rani Lakshmibai was the brave queen of which place?`
        : `${chTagEng}: Which famous march did Mahatma Gandhi lead for freedom?`,
      themeCorrectOption: isBirsa
        ? { text: 'धरती आबा (Dharti Aba)', emoji: '🏹' }
        : isBudhu
        ? { text: 'झारखंड (Jharkhand)', emoji: '🏹' }
        : isRani
        ? { text: 'झाँसी (Jhansi)', emoji: '⚔️' }
        : { text: 'दांडी यात्रा (Dandi March)', emoji: '🕊️' },
      themeDistractors: [
        { text: 'केवल व्यापार', emoji: '🪙' },
        { text: 'क्रिकेट खेल', emoji: '🏏' },
        { text: 'अंतरिक्ष यात्रा', emoji: '🚀' },
      ],
      secondQuestionHindi: `${chTag} से हमें अपने देश और समाज के प्रति किस कर्तव्य की प्रेरणा मिलती है?`,
      secondQuestionEnglish: `What duty towards our country does ${chTagEng} inspire in us?`,
      secondCorrectOption: { text: `साहस, देशभक्ति और अन्याय का विरोध (${chapter.originalTitleHindi})`, emoji: '🇮🇳' },
      secondDistractors: [
        { text: 'डरकर भाग जाना', emoji: '❌' },
        { text: 'प्रकृति को नुकसान पहुँचाना', emoji: '🪓' },
        { text: 'केवल खिलौने जमा करना', emoji: '🧸' },
      ],
    };
  }

  // 2. SARHUL, KARAM, CHHAU, TRIBAL CULTURE & HARVEST FESTIVALS
  if (
    text.includes('सरहुल') ||
    text.includes('sarhul') ||
    text.includes('करम') ||
    text.includes('karma') ||
    text.includes('छऊ') ||
    text.includes('chhau') ||
    text.includes('फसलों का त्योहार') ||
    text.includes('harvest') ||
    text.includes('कल्चर') ||
    text.includes('culture')
  ) {
    const isKaram = text.includes('करम') || text.includes('karma');
    const isChhau = text.includes('छऊ') || text.includes('chhau');
    return {
      categoryLabelA: { native: 'ᱯᱚᱨᱚᱵᱽ ᱟᱨ ᱮᱱᱮᱡ (Festivals & Dance)', transliteration: 'Parab ar Enej', hindi: 'झारखंड के पर्व और संस्कृति', english: 'Festivals & Culture' },
      categoryLabelB: { native: 'ᱟᱥᱲᱟ ᱡᱤᱱᱤᱥ (Classroom Items)', transliteration: 'Asra Jinis', hindi: 'कक्षा की वस्तुएँ', english: 'Classroom Items' },
      itemsA: [
        { native: chapter.originalTitleHindi, transliteration: chapter.originalTitleEnglish, hindi: chapter.originalTitleHindi, english: chapter.originalTitleEnglish, emoji: chapter.coverEmoji || '🌺' },
        { native: 'ᱴᱟᱢᱟᱠ ᱟᱨ ᱛᱩᱢᱫᱟᱜ (Madal Drum)', transliteration: 'Tamak ar Tumdag', hindi: 'मांदर और नगाड़ा', english: 'Mandar Drum', emoji: '🪘' },
      ],
      itemsB: [
        { native: 'ᱪᱚᱠ ᱟᱨ ᱰᱟᱥᱴᱚᱨ', transliteration: 'Chalk ar Duster', hindi: 'चॉक और डस्टर', english: 'Chalk & Duster', emoji: '🖍️' },
        { native: 'ᱯᱚᱛᱚᱵ ᱵᱮᱜᱽ', transliteration: 'Potob Bag', hindi: 'स्कूल का बस्ता', english: 'School Bag', emoji: '🎒' },
      ],
      themeFactHindi: 'सरहुल (बाहा परब), करम और सोहराय झारखंड के प्रमुख प्रकृति एवं फसल पर्व हैं।',
      themeFactEnglish: 'Sarhul, Karam, and Chhau celebrate nature, harvest, and indigenous heritage of Jharkhand.',
      themeQuestionHindi: isKaram
        ? `${chTag}: करम पर्व में अखड़ा में किस पवित्र पेड़ की डाली की पूजा की जाती है?`
        : isChhau
        ? `${chTag}: छऊ नृत्य (Chhau Dance) में कलाकार चेहरे पर क्या पहनकर नृत्य करते हैं?`
        : `${chTag}: झारखंड के प्रकृति और फसल पर्वों में किस पवित्र वृक्ष एवं प्रकृति की वंदना होती है?`,
      themeQuestionEnglish: isKaram
        ? `${chTagEng}: Which sacred tree branch is worshipped in the Akhra during Karam festival?`
        : isChhau
        ? `${chTagEng}: What do dancers wear on their faces during traditional Chhau dance?`
        : `${chTagEng}: Which sacred tree and nature elements are celebrated in Jharkhand festivals?`,
      themeCorrectOption: isKaram
        ? { text: 'करम वृक्ष की डाली (Karam Branch)', emoji: '🌿' }
        : isChhau
        ? { text: 'रंगीन कलात्मक मुखौटा (Mask) और सखुआ फूल', emoji: '🎭' }
        : { text: 'साल / सखुआ के फूल (Sarjom) और नई फसल', emoji: '🌺' },
      themeDistractors: [
        { text: 'प्लास्टिक के फूल', emoji: '🧴' },
        { text: 'लोहे की जंजीर', emoji: '⛓️' },
        { text: 'मोटरकार का टायर', emoji: '🛞' },
      ],
      secondQuestionHindi: `${chTag} के अनुसार सामूहिक पर्व और लोकनृत्य समाज में क्या बढ़ाते हैं?`,
      secondQuestionEnglish: `According to ${chTagEng}, what do community festivals and folk dances strengthen?`,
      secondCorrectOption: { text: `प्रकृति-प्रेम, भाईचारा और सांस्कृतिक गौरव (${chapter.originalTitleHindi})`, emoji: '🪘' },
      secondDistractors: [
        { text: 'प्रदूषण और कचरा', emoji: '🗑️' },
        { text: 'आपसी मनमुटाव', emoji: '😠' },
        { text: 'जंगलों की कटाई', emoji: '🪓' },
      ],
    };
  }

  // 3. WATER, RAIN, CLOUDS, HAILSTONES & RIVERS
  if (
    text.includes('पानी') ||
    text.includes('water') ||
    text.includes('ओले') ||
    text.includes('hail') ||
    text.includes('बादल') ||
    text.includes('cloud') ||
    text.includes('घो-घो रानी') ||
    text.includes('रेनबो') ||
    text.includes('rainbow')
  ) {
    return {
      categoryLabelA: { native: 'ᱫᱟᱜ ᱟᱨ ᱥᱮᱨᱢᱟ (Water & Sky)', transliteration: 'Dag ar Serma', hindi: 'पानी और मौसम के तत्व', english: 'Water & Weather' },
      categoryLabelB: { native: 'ᱨᱚᱦᱚᱲ ᱡᱤᱱᱤᱥ (Dry Objects)', transliteration: 'Rohor Jinis', hindi: 'सूखी वस्तुएँ', english: 'Dry Objects' },
      itemsA: [
        { native: chapter.originalTitleHindi, transliteration: chapter.originalTitleEnglish, hindi: chapter.originalTitleHindi, english: chapter.originalTitleEnglish, emoji: chapter.coverEmoji || '🌧️' },
        { native: 'ᱜᱟᱰᱟ ᱟᱨ ᱠᱩᱧ (River & Well)', transliteration: 'Gada ar Kunj', hindi: 'नदी, झरना और कुआँ', english: 'River, Waterfall & Well', emoji: '🌊' },
      ],
      itemsB: [
        { native: 'ᱫᱷᱤᱨᱤ (Stone)', transliteration: 'Dhiri', hindi: 'सूखा पत्थर', english: 'Dry Stone', emoji: '🪨' },
        { native: 'ᱠᱟᱴᱷ ᱢᱮᱡᱽ (Wooden Table)', transliteration: 'Kath Mej', hindi: 'लकड़ी की कुर्सी', english: 'Wooden Chair', emoji: '🪑' },
      ],
      themeFactHindi: 'बादलों से बारिश होती है जिससे नदी, तालाब, कुएँ भरते हैं और पेड़-पौधों व जीवों को जीवन मिलता है।',
      themeFactEnglish: 'Clouds and rain replenish rivers and wells, sustaining all life and agriculture.',
      themeQuestionHindi: `${chTag}: वर्षा, बादल और जल हमारे जीवन व खेती के लिए क्यों आवश्यक हैं?`,
      themeQuestionEnglish: `${chTagEng}: Why are rain, clouds, and water essential for life and farming?`,
      themeCorrectOption: { text: `सभी जीवों की प्यास बुझाने और फसलें उगाने के लिए (${chapter.originalTitleHindi})`, emoji: chapter.coverEmoji || '💧' },
      themeDistractors: [
        { text: 'केवल शोर मचाने के लिए', emoji: '📢' },
        { text: 'सड़कें बंद करने के लिए', emoji: '🚧' },
        { text: 'कागज़ गीला करने के लिए', emoji: '📄' },
      ],
      secondQuestionHindi: `${chTag} के आधार पर बताइए कि हमें जल संरक्षण (Water Conservation) कैसे करना चाहिए?`,
      secondQuestionEnglish: `Based on ${chTagEng}, how should we conserve water every day?`,
      secondCorrectOption: { text: 'वर्षा जल संचयन करें और पानी बर्बाद न करें', emoji: '🌊' },
      secondDistractors: [
        { text: 'नल हमेशा खुला छोड़ दें', emoji: '🚰' },
        { text: 'तालाब और नदी में प्लास्टिक फेंकें', emoji: '🗑️' },
        { text: 'पेड़-पौधों को काट दें', emoji: '🪓' },
      ],
    };
  }

  // 4. ANIMALS, BIRDS, FISH, HONEYBEES & SUPER SENSES
  if (
    text.includes('तोते') ||
    text.includes('parrot') ||
    text.includes('चूहा') ||
    text.includes('mouse') ||
    text.includes('बन्दर') ||
    text.includes('बंदर') ||
    text.includes('monkey') ||
    text.includes('तितली') ||
    text.includes('butterfly') ||
    text.includes('ऊँट') ||
    text.includes('camel') ||
    text.includes('मछली') ||
    text.includes('fish') ||
    text.includes('कोयल') ||
    text.includes('cuckoo') ||
    text.includes('कुत्ते') ||
    text.includes('dog') ||
    text.includes('गौरैयाँ') ||
    text.includes('sparrow') ||
    text.includes('लायन') ||
    text.includes('lion') ||
    text.includes('जानवर') ||
    text.includes('animal') ||
    text.includes('कान-कान') ||
    text.includes('ear') ||
    text.includes('नंदू हाथी') ||
    text.includes('elephant') ||
    text.includes('मधुमक्खियाँ') ||
    text.includes('honeybee') ||
    text.includes('ज्ञानेन्द्रियों') ||
    text.includes('senses')
  ) {
    return {
      categoryLabelA: { native: 'ᱩᱰᱟᱹᱣᱜ ᱪᱮᱬᱮ/ পতंग (Birds & Insects)', transliteration: 'Udawg Chene', hindi: 'पक्षी और उड़ने वाले जीव', english: 'Birds & Flying Insects' },
      categoryLabelB: { native: 'ᱚᱛ ᱨᱮᱱ ᱡᱤᱭᱟᱹᱞᱤ (Land Animals)', transliteration: 'Ot ren Jiyali', hindi: 'ज़मीन के पशु', english: 'Land Animals' },
      itemsA: [
        { native: 'ᱢᱤᱨᱩ ᱟᱨ ᱠᱩᱦᱩ ᱪᱮᱬᱮ', transliteration: 'Miru ar Kuhu', hindi: 'तोता, कोयल और गौरैया', english: 'Parrot, Cuckoo & Sparrow', emoji: '🦜' },
        { native: 'ᱯᱤᱯᱤᱲᱤᱭᱟᱹᱝ ᱟᱨ ᱧᱮᱞᱮ', transliteration: 'Pipiriyang ar Nyele', hindi: 'तितली और मधुमक्खी', english: 'Butterfly & Honeybee', emoji: '🦋' },
      ],
      itemsB: [
        { native: chapter.originalTitleHindi, transliteration: chapter.originalTitleEnglish, hindi: chapter.originalTitleHindi, english: chapter.originalTitleEnglish, emoji: chapter.coverEmoji || '🐘' },
        { native: 'ᱥᱮᱛᱟ ᱟᱨ ᱜᱟᱹᱲᱤ', transliteration: 'Seta ar Gari', hindi: 'कुत्ता, बंदर और हाथी', english: 'Dog, Monkey & Elephant', emoji: '🐕' },
      ],
      themeFactHindi: `${chTag} में जीव-जंतुओं के अनोखे गुणों, उनके आवास और प्रकृति में उनके महत्व को समझाया गया है।`,
      themeFactEnglish: `${chTagEng} explores the special traits, habitats, and importance of animals and birds.`,
      themeQuestionHindi: `${chTag} (${chapter.bookName}) में मुख्य रूप से किस जीव या विषय के बारे में बताया गया है?`,
      themeQuestionEnglish: `What is the central focus of ${chTagEng} in ${chapter.bookName}?`,
      themeCorrectOption: { text: `${chapter.originalTitleHindi} (${chapter.originalTitleEnglish}) के जीव और उनकी विशेषताएँ`, emoji: chapter.coverEmoji || '🐾' },
      themeDistractors: [
        { text: 'मोटरकार का इंजन बनाना', emoji: '🚗' },
        { text: 'लोहे के कारखाने का धुआँ', emoji: '🏭' },
        { text: 'कागज़ की नाव चलाना', emoji: '⛵' },
      ],
      secondQuestionHindi: `${chTag} पढ़ने के बाद हमें पशु-पक्षियों और उनके प्राकृतिक घर (घोंसले/जंगल) के प्रति क्या सीख मिलती है?`,
      secondQuestionEnglish: `After reading ${chTagEng}, how should we care for animals and their natural habitats?`,
      secondCorrectOption: { text: 'जीव-जंतुओं से मित्रता रखें और उन्हें कभी नुकसान न पहुँचाएँ', emoji: '💚' },
      secondDistractors: [
        { text: 'पक्षियों को पिंजरे में कैद करें', emoji: '🔒' },
        { text: 'जानवरों को पत्थर मारें', emoji: '🪨' },
        { text: 'जंगल के पेड़ काट दें', emoji: '🪓' },
      ],
    };
  }

  // 5. TREES, FORESTS, AMRITA, SEEDS, FARMING & GREEN WORLD
  if (
    text.includes('पर्यावरण') ||
    text.includes('environment') ||
    text.includes('हरी-भरी') ||
    text.includes('green world') ||
    text.includes('अमृता') ||
    text.includes('amrita') ||
    text.includes('बीज') ||
    text.includes('seed') ||
    text.includes('प्रकृति मेरी सखी') ||
    text.includes('nature my friend') ||
    text.includes('गार्डन') ||
    text.includes('garden') ||
    text.includes('सुमन एक उपवन') ||
    text.includes('बिजूका') ||
    text.includes('scarecrow') ||
    text.includes('मेहनत का फल') ||
    text.includes('bamboo')
  ) {
    return {
      categoryLabelA: { native: 'ᱫᱟᱨᱮ ᱟᱨ ᱵᱟᱦᱟ (Trees & Plants)', transliteration: 'Dare ar Baha', hindi: 'पेड़-पौधे, बीज और हरियाली', english: 'Trees, Seeds & Greenery' },
      categoryLabelB: { native: 'ᱵᱮᱱᱟᱣ ᱡᱤᱱᱤᱥ (Man-made Items)', transliteration: 'Benaw Jinis', hindi: 'अप्राकृतिक वस्तुएँ', english: 'Non-living Objects' },
      itemsA: [
        { native: chapter.originalTitleHindi, transliteration: chapter.originalTitleEnglish, hindi: chapter.originalTitleHindi, english: chapter.originalTitleEnglish, emoji: chapter.coverEmoji || '🌳' },
        { native: 'ᱡᱟᱝ ᱟᱨ ᱵᱟᱦᱟ (Seeds & Flowers)', transliteration: 'Jang ar Baha', hindi: 'अंकुरित बीज और सखुआ वृक्ष', english: 'Seeds & Sal Trees', emoji: '🌱' },
      ],
      itemsB: [
        { native: 'ᱯᱞᱟᱥᱴᱤᱠ ᱵᱚᱛᱚᱞ', transliteration: 'Plastic Bottle', hindi: 'प्लास्टिक की बोतल', english: 'Plastic Bottle', emoji: '🧴' },
        { native: 'ᱞᱚᱦᱟ ᱠᱟᱹᱴھی', transliteration: 'Loha Kathi', hindi: 'लोहे की कील', english: 'Iron Nail', emoji: '🔩' },
      ],
      themeFactHindi: `${chTag} हमें पेड़-पौधों, बीजों, खेती की मेहनत और झारखंड की हरियाली की रक्षा करना सिखाता है।`,
      themeFactEnglish: `${chTagEng} teaches us to nurture seeds, trees, crops, and Jharkhand's lush green forests.`,
      themeQuestionHindi: `${chTag} में पेड़-पौधों, बीजों और हरियाली का हमारे जीवन में क्या महत्व बताया गया है?`,
      themeQuestionEnglish: `In ${chTagEng}, why are trees, seeds, and greenery so important for us?`,
      themeCorrectOption: { text: `शुद्ध हवा, भोजन और हरी-भरी धरती के लिए (${chapter.originalTitleHindi})`, emoji: chapter.coverEmoji || '🌿' },
      themeDistractors: [
        { text: 'प्रदूषण बढ़ाने के लिए', emoji: '💨' },
        { text: 'प्लास्टिक बनाने के लिए', emoji: '🧴' },
        { text: 'मिट्टी बहाने के लिए', emoji: '❌' },
      ],
      secondQuestionHindi: `${chTag} के अनुसार एक अच्छे नागरिक के रूप में हमें पर्यावरण के लिए क्या करना चाहिए?`,
      secondQuestionEnglish: `According to ${chTagEng}, what should we do to protect our environment?`,
      secondCorrectOption: { text: 'अधिक से अधिक पौधे लगाएँ और पेड़ों की रक्षा करें', emoji: '🌱' },
      secondDistractors: [
        { text: 'हरे पेड़ों को काटें', emoji: '🪓' },
        { text: 'जंगल में आग लगाएँ', emoji: '🔥' },
        { text: 'खेतों में प्लास्टिक फैलाएँ', emoji: '🗑️' },
      ],
    };
  }

  // 6. FOOD, KITCHEN, DIGESTION, PRESERVATION, MARKET & HYGIENE
  if (
    text.includes('रसोई') ||
    text.includes('kitchen') ||
    text.includes('रोटी') ||
    text.includes('roti') ||
    text.includes('चावल') ||
    text.includes('rice') ||
    text.includes('फूड') ||
    text.includes('food') ||
    text.includes('खान-पान') ||
    text.includes('ताजा खाओ') ||
    text.includes('fresh') ||
    text.includes('स्वाद से शक्ति') ||
    text.includes('tasting') ||
    text.includes('पम्पकिन') ||
    text.includes('pumpkin') ||
    text.includes('मार्केट') ||
    text.includes('बाज़ार') ||
    text.includes('market') ||
    text.includes('हैंड वाशिंग') ||
    text.includes('hand washing')
  ) {
    return {
      categoryLabelA: { native: 'ᱵᱮᱨᱮᱞ ᱡᱚᱢᱟᱜ (Fresh Food & Vegetables)', transliteration: 'Berel Jomag', hindi: 'ताज़ा भोजन, फल और सब्ज़ियाँ', english: 'Fresh Food & Vegetables' },
      categoryLabelB: { native: 'ᱫᱟᱠᱟ ᱚᱲᱟᱜ ᱵर्तन (Utensils)', transliteration: 'Daka Orag Jinis', hindi: 'रसोई और घर के बर्तन', english: 'Kitchen Utensils' },
      itemsA: [
        { native: chapter.originalTitleHindi, transliteration: chapter.originalTitleEnglish, hindi: chapter.originalTitleHindi, english: chapter.originalTitleEnglish, emoji: chapter.coverEmoji || '🍲' },
        { native: 'ᱩᱞ ᱟᱨ ᱛᱟᱦᱮᱸᱨ (Mango & Cucumber)', transliteration: 'Ul ar Taher', hindi: 'दाल-चावल, रोटी और हरी सब्ज़ियाँ', english: 'Rice, Roti & Vegetables', emoji: '🥗' },
      ],
      itemsB: [
        { native: 'ᱴᱩᱠᱩᱡ ᱟᱨ ᱞᱩᱰᱤ', transliteration: 'Tukuj ar Lundi', hindi: 'तवा, कड़ाही और बेलन', english: 'Pan & Rolling Pin', emoji: '🍳' },
        { native: 'ᱛᱷᱟᱹᱨᱤ ᱟᱨ ᱵᱟᱹᱴᱤ', transliteration: 'Thari ar Bati', hindi: 'थाली और कटोरी', english: 'Plate & Bowl', emoji: '🥣' },
      ],
      themeFactHindi: `${chTag} हमें स्वच्छता, ताज़े और पौष्टिक भोजन, रसोई के सहयोग और गाँव के हाट (बाज़ार) की जानकारी देता है।`,
      themeFactEnglish: `${chTagEng} teaches us about fresh food, hygiene, kitchen teamwork, and village markets.`,
      themeQuestionHindi: `${chTag} के अनुसार स्वस्थ और ऊर्जावान रहने के लिए हमें किन बातों का ध्यान रखना चाहिए?`,
      themeQuestionEnglish: `According to ${chTagEng}, what keeps us healthy and strong?`,
      themeCorrectOption: { text: `साबुन से हाथ धोकर ताज़ा व पौष्टिक भोजन करना (${chapter.originalTitleHindi})`, emoji: chapter.coverEmoji || '🍲' },
      themeDistractors: [
        { text: 'बासी और खुला रखा खाना खाना', emoji: '🦠' },
        { text: 'बिना हाथ धोए भोजन करना', emoji: '❌' },
        { text: 'भोजन बर्बाद करके फेंकना', emoji: '🗑️' },
      ],
      secondQuestionHindi: `${chTag} में वर्णित खाद्य पदार्थों और सब्ज़ियों (जैसे चावल, रोटी, कद्दू, खीरा) का मुख्य स्रोत क्या है?`,
      secondQuestionEnglish: `Where do the fresh grains and vegetables in ${chTagEng} come from?`,
      secondCorrectOption: { text: 'किसानों के खेतों और गाँव के बाज़ार (हाट) से', emoji: '🌾' },
      secondDistractors: [
        { text: 'लोहे की खदान से', emoji: '⛏️' },
        { text: 'कागज के कारखाने से', emoji: '🏭' },
        { text: 'प्लास्टिक की दुकान से', emoji: '🧴' },
      ],
    };
  }

  // 7. TRANSPORT, TRAIN, ROAD, JOURNEY & COMMUNICATION
  if (
    text.includes('रेलगाड़ी') ||
    text.includes('train') ||
    text.includes('छुक-छुक') ||
    text.includes('transport') ||
    text.includes('सड़क') ||
    text.includes('road') ||
    text.includes('ओमना') ||
    text.includes('omana') ||
    text.includes('खिड़की') ||
    text.includes('window') ||
    text.includes('ट्रैफिक') ||
    text.includes('traffic') ||
    text.includes('चिट्ठी') ||
    text.includes('पत्र') ||
    text.includes('letter') ||
    text.includes('ख़बर') ||
    text.includes('news') ||
    text.includes('टेलीफोन') ||
    text.includes('telephone') ||
    text.includes('सेल फोन') ||
    text.includes('cell phone')
  ) {
    const isComm =
      text.includes('चिट्ठी') ||
      text.includes('पत्र') ||
      text.includes('letter') ||
      text.includes('ख़बर') ||
      text.includes('टेलीफोन') ||
      text.includes('सेल फोन');

    return {
      categoryLabelA: {
        native: isComm ? 'ᱠᱷᱚᱵᱚᱨ ᱡᱚᱲᱟᱣ (Communication)' : 'पटरी / ᱥᱮᱨᱢᱟ ᱜᱟᱹᱰᱤ (Rail & Travel)',
        transliteration: isComm ? 'Khobor Joraw' : 'Rail ar Travel',
        hindi: isComm ? 'संदेश और संचार के साधन' : 'यात्रा और रेल परिवहन',
        english: isComm ? 'Means of Communication' : 'Rail & Travel',
      },
      categoryLabelB: {
        native: 'ᱰᱟᱦᱟᱨ ᱜᱟᱹᱰᱤ (Road Vehicles)',
        transliteration: 'Dahar Gadi',
        hindi: 'सड़क के वाहन',
        english: 'Road Vehicles',
      },
      itemsA: [
        { native: chapter.originalTitleHindi, transliteration: chapter.originalTitleEnglish, hindi: chapter.originalTitleHindi, english: chapter.originalTitleEnglish, emoji: chapter.coverEmoji || '🚂' },
        { native: isComm ? 'ᱰᱟᱠघर (Post Office)' : 'ᱨᱮᱞ पटरी (Railway Track)', transliteration: isComm ? 'Post Office' : 'Rel Patri', hindi: isComm ? 'डाकघर और टेलीफोन' : 'रेलवे स्टेशन और टिकट', english: isComm ? 'Post Office & Phone' : 'Station & Ticket', emoji: isComm ? '📮' : '🎫' },
      ],
      itemsB: [
        { native: 'ᱵᱚᱥ ᱟᱨ ᱥᱟᱭᱠᱤᱞ (Bus & Cycle)', transliteration: 'Bus ar Cycle', hindi: 'बस और साइकिल', english: 'Bus & Bicycle', emoji: '🚌' },
        { native: 'ᱥᱟᱹᱜᱟᱹᱲ (Bullock Cart)', transliteration: 'Sagar', hindi: 'बैलगाड़ी और ऑटो', english: 'Bullock Cart & Auto', emoji: '🛺' },
      ],
      themeFactHindi: `${chTag} हमें यातायात के साधनों, सुरक्षित सफर और संदेश पहुँचाने (संचार) के तरीकों से परिचित कराता है।`,
      themeFactEnglish: `${chTagEng} introduces us to safe travel, transport vehicles, and means of communication.`,
      themeQuestionHindi: isComm
        ? `${chTag}: हम दूर रहने वाले अपने मित्रों और रिश्तेदारों तक अपना संदेश कैसे पहुँचाते हैं?`
        : `${chTag}: एक स्थान से दूसरे स्थान तक सुरक्षित यात्रा करने के लिए हमें किस बात का ध्यान रखना चाहिए?`,
      themeQuestionEnglish: isComm
        ? `${chTagEng}: How do we send messages and news to relatives and friends living far away?`
        : `${chTagEng}: What should we remember when travelling by train, bus, or road?`,
      themeCorrectOption: isComm
        ? { text: `पत्र (चिट्ठी), डाकघर और टेलीफोन के माध्यम से (${chapter.originalTitleHindi})`, emoji: chapter.coverEmoji || '✉️' }
        : { text: `यातायात नियमों का पालन और सुरक्षित सफर (${chapter.originalTitleHindi})`, emoji: chapter.coverEmoji || '🚂' },
      themeDistractors: [
        { text: 'चलती गाड़ी के आगे दौड़ना', emoji: '⚠️' },
        { text: 'बिना पते के कागज़ फेंकना', emoji: '🗑️' },
        { text: 'सड़क के बीचों-बीच सोना', emoji: '❌' },
      ],
      secondQuestionHindi: `${chTag} में बताए गए साधन हमारे दैनिक जीवन को कैसे आसान बनाते हैं?`,
      secondQuestionEnglish: `How do the means described in ${chTagEng} help us in daily life?`,
      secondCorrectOption: { text: 'समय की बचत करते हैं और लोगों को आपस में जोड़ते हैं', emoji: '🌟' },
      secondDistractors: [
        { text: 'हमारा काम रोक देते हैं', emoji: '🚫' },
        { text: 'पेड़ों को सुखा देते हैं', emoji: '🍂' },
        { text: 'किताबें छुपा देते हैं', emoji: '📕' },
      ],
    };
  }

  // 8. SPORTS, GAMES, DHONI, DHYAN CHAND, KABADDI, KITE & BALLOON
  if (
    text.includes('पतंग') ||
    text.includes('kite') ||
    text.includes('गुब्बारा') ||
    text.includes('balloon') ||
    text.includes('चकई') ||
    text.includes('धोनी') ||
    text.includes('dhoni') ||
    text.includes('हॉकी') ||
    text.includes('hockey') ||
    text.includes('क्रिकेट') ||
    text.includes('cricket') ||
    text.includes('कबड्डी') ||
    text.includes('हु तू तू') ||
    text.includes('खेल') ||
    text.includes('games') ||
    text.includes('स्विंग') ||
    text.includes('swing')
  ) {
    return {
      categoryLabelA: { native: 'ᱵᱟᱦᱨᱮ ᱮᱱᱮᱡ (Outdoor Sports)', transliteration: 'Bahre Enej', hindi: 'मैदान और खुले के खेल', english: 'Outdoor Games & Play' },
      categoryLabelB: { native: 'ᱚᱲᱟᱜ ᱵᱷᱤᱛᱨᱤ ᱮᱱᱮᱡ (Indoor Games)', transliteration: 'Bhitri Enej', hindi: 'घर के अंदर के खेल', english: 'Indoor Board Games' },
      itemsA: [
        { native: chapter.originalTitleHindi, transliteration: chapter.originalTitleEnglish, hindi: chapter.originalTitleHindi, english: chapter.originalTitleEnglish, emoji: chapter.coverEmoji || '🏏' },
        { native: 'ᱠᱟᱵᱟᱰᱤ ᱟᱨ ᱯᱷᱩᱴᱵᱚᱞ', transliteration: 'Kabaddi ar Football', hindi: 'कबड्डी, हॉकी और क्रिकेट', english: 'Kabaddi, Hockey & Cricket', emoji: '⚽' },
      ],
      itemsB: [
        { native: 'ᱞᱩᱰᱳ ᱟᱨ ᱠᱮᱨᱚᱢ (Ludo & Carrom)', transliteration: 'Ludo ar Carrom', hindi: 'लूडो और कैरम', english: 'Ludo & Carrom', emoji: '🎲' },
        { native: 'ᱥᱚᱛᱨᱚᱸᱡᱽ (Chess)', transliteration: 'Shatranj', hindi: 'शतरंज (चेस)', english: 'Chess', emoji: '♟️' },
      ],
      themeFactHindi: `${chTag} में खेल-कूद के उत्साह, टीम भावना, अभ्यास और स्वास्थ्य के महत्व को दर्शाया गया है।`,
      themeFactEnglish: `${chTagEng} celebrates sportsmanship, teamwork, joyful play, and physical fitness.`,
      themeQuestionHindi: `${chTag} के अनुसार खेल-कूद और अभ्यास से बच्चों में कौन-सा गुण विकसित होता है?`,
      themeQuestionEnglish: `According to ${chTagEng}, what quality do children develop through games and practice?`,
      themeCorrectOption: { text: `स्वास्थ्य, स्फूर्ति, साहस और मिलजुलकर खेलना (${chapter.originalTitleHindi})`, emoji: chapter.coverEmoji || '🏆' },
      themeDistractors: [
        { text: 'साथियों से ईर्ष्या और झगड़ा', emoji: '😠' },
        { text: 'दिनभर आलस करना', emoji: '😴' },
        { text: 'नियम तोड़ना', emoji: '❌' },
      ],
      secondQuestionHindi: `${chTag} में खेलते समय हमें किस नियम का हमेशा पालन करना चाहिए?`,
      secondQuestionEnglish: `What rule of sportsmanship should we always follow in ${chTagEng}?`,
      secondCorrectOption: { text: 'ईमानदारी, सुरक्षा और टीम के साथ सहयोग से खेलना', emoji: '🤝' },
      secondDistractors: [
        { text: 'बेईमानी करना', emoji: '🚫' },
        { text: 'दूसरों को धक्का देना', emoji: '⚠️' },
        { text: 'हारने पर रोना और लड़ना', emoji: '😢' },
      ],
    };
  }

  // 9. SCHOOL, TEACHERS, CLASSROOM & MONITOR
  if (
    text.includes('विद्यालय') ||
    text.includes('स्कूल') ||
    text.includes('school') ||
    text.includes('क्लासरूम') ||
    text.includes('classroom') ||
    text.includes('मैडम') ||
    text.includes('टीचर') ||
    text.includes('शिक्षक') ||
    text.includes('teacher') ||
    text.includes('मॉनिटर') ||
    text.includes('monitor') ||
    text.includes('कंप्यूटर') ||
    text.includes('computer') ||
    text.includes('विद्वान') ||
    text.includes('scholar')
  ) {
    return {
      categoryLabelA: { native: 'ᱟᱥᱲᱟ ᱡᱤᱱᱤᱥ (School & Learning)', transliteration: 'Asra Jinis', hindi: 'विद्यालय और शिक्षा', english: 'School & Learning' },
      categoryLabelB: { native: 'ᱠᱷᱮᱛ ᱡᱤᱱᱤᱥ (Farm & Kitchen)', transliteration: 'Khet Jinis', hindi: 'खेत और रसोई की वस्तुएँ', english: 'Farm & Kitchen Items' },
      itemsA: [
        { native: chapter.originalTitleHindi, transliteration: chapter.originalTitleEnglish, hindi: chapter.originalTitleHindi, english: chapter.originalTitleEnglish, emoji: chapter.coverEmoji || '🏫' },
        { native: 'ᱯᱚᱛᱚᱵ ᱟᱨ ᱠᱚᱞᱚᱢ (Book & Pen)', transliteration: 'Potob ar Kolom', hindi: 'किताब, कलम और श्यामपट्ट', english: 'Book, Pen & Blackboard', emoji: '📚' },
      ],
      itemsB: [
        { native: 'ᱱᱟᱦᱮᱞ (Plough)', transliteration: 'Nahel', hindi: 'खेत का हल', english: 'Farm Plough', emoji: '🚜' },
        { native: 'ᱴᱩᱠᱩᱡ (Cooking Pot)', transliteration: 'Tukuj', hindi: 'रसोई की हाँडी', english: 'Cooking Pot', emoji: '🏺' },
      ],
      themeFactHindi: `${chTag} में विद्यालय, शिक्षकों के आदर, ज्ञान-अर्जन और सहपाठियों के साथ मिलकर सीखने का महत्व बताया गया है।`,
      themeFactEnglish: `${chTagEng} highlights the joy of going to school, respecting teachers, and learning together.`,
      themeQuestionHindi: `${chTag} (${chapter.bookName}) में विद्यालय और शिक्षा के बारे में क्या मुख्य बात सिखाई गई है?`,
      themeQuestionEnglish: `What key lesson about school and learning is taught in ${chTagEng}?`,
      themeCorrectOption: { text: `नियमित स्कूल जाना, शिक्षकों का आदर और मन लगाकर पढ़ना (${chapter.originalTitleHindi})`, emoji: chapter.coverEmoji || '🏫' },
      themeDistractors: [
        { text: 'किताबें फाड़ना', emoji: '🗑️' },
        { text: 'स्कूल से भाग जाना', emoji: '❌' },
        { text: 'कक्षा में गंदगी फैलाना', emoji: '🚫' },
      ],
      secondQuestionHindi: `${chTag} के अनुसार हम विद्यालय (इतुन आसड़ा) में अपने साथियों के साथ कैसे रहते हैं?`,
      secondQuestionEnglish: `According to ${chTagEng}, how do we interact with our classmates at school?`,
      secondCorrectOption: { text: 'मित्रता, सहयोग और अनुशासन के साथ मिलकर सीखते हैं', emoji: '👫' },
      secondDistractors: [
        { text: 'किसी से बात नहीं करते', emoji: '🙊' },
        { text: 'चॉक और डस्टर छुपा देते हैं', emoji: '🖍️' },
        { text: 'केवल शोर मचाते हैं', emoji: '📢' },
      ],
    };
  }

  // 10. FAMILY, VILLAGE, HOME, MORAL STORIES, NATION & COMMUNITY (Fully parameterized by chapter)
  return {
    categoryLabelA: { native: 'ᱜᱷᱟᱨᱚᱸᱡᱽ ᱟᱨ ᱥᱤᱠᱷᱱᱟᱹᱛ (Lesson Values)', transliteration: 'Lesson Values', hindi: `पाठ "${chapter.originalTitleHindi}" के मूल्य`, english: `${chapter.originalTitleEnglish} Values` },
    categoryLabelB: { native: 'ᱵᱤᱨ ᱡᱤᱭᱟᱹᱞᱤ (Wild Jungle)', transliteration: 'Bir Jiyali', hindi: 'जंगल के वन्य जीव', english: 'Wild Forest Animals' },
    itemsA: [
      { native: chapter.originalTitleHindi, transliteration: chapter.originalTitleEnglish, hindi: chapter.originalTitleHindi, english: chapter.originalTitleEnglish, emoji: chapter.coverEmoji || '🏡' },
      { native: 'ᱟᱭᱳ-ᱵᱟᱵᱟ ᱟᱨ ᱜᱟᱛᱮ', transliteration: 'Ayo-Baba ar Gate', hindi: 'परिवार, मित्र और गाँव का सहयोग', english: 'Family, Friends & Village Harmony', emoji: '👨‍👩‍👧‍👦' },
    ],
    itemsB: [
      { native: 'ᱛᱟᱹᱨᱩᱵ (Tiger)', transliteration: 'Tarub', hindi: 'जंगल का बाघ', english: 'Wild Tiger', emoji: '🐅' },
      { native: 'ᱵᱟᱱᱟ (Bear)', transliteration: 'Bana', hindi: 'जंगल का भालू', english: 'Forest Bear', emoji: '🐻' },
    ],
    themeFactHindi: `${chTag} (${chapter.bookName}) हमें परिवार, गाँव के जीवन, आपसी प्रेम, सच्चाई और समझदारी की सीख देता है।`,
    themeFactEnglish: `${chTagEng} teaches us love for family, honesty, wisdom, and community harmony.`,
    themeQuestionHindi: `कक्षा ${chapter.classNumber} के ${chTag} (${chapter.bookName}) का मुख्य विषय और संदेश क्या है?`,
    themeQuestionEnglish: `What is the central theme and moral message of Class ${chapter.classNumber} ${chTagEng}?`,
    themeCorrectOption: { text: `"${chapter.originalTitleHindi}" — आपसी प्रेम, समझदारी और अच्छे संस्कार`, emoji: chapter.coverEmoji || '🌟' },
    themeDistractors: [
      { text: 'दूसरों से झूठ बोलना और झगड़ना', emoji: '❌' },
      { text: 'केवल आलस करना', emoji: '😴' },
      { text: 'किसी की मदद न करना', emoji: '🚫' },
    ],
    secondQuestionHindi: `${chTag} में दिए गए शब्दों और विचारों को हम अपनी जनजातीय मातृभाषा के साथ क्यों जोड़कर पढ़ते हैं?`,
    secondQuestionEnglish: `In ${chTagEng}, why do we connect "${chapter.originalTitleEnglish}" with our mother tongue?`,
    secondCorrectOption: { text: `ताकि "${chapter.originalTitleHindi}" का अर्थ अपनी भाषा में आसानी और गहराई से समझ सकें`, emoji: chapter.coverEmoji || '📖' },
    secondDistractors: [
      { text: 'क्योंकि यह गणित का भाग प्रश्न है', emoji: '➗' },
      { text: 'क्योंकि इसमें केवल पहिए गिनने हैं', emoji: '🛞' },
      { text: 'बिना समझे रटने के लिए', emoji: '🚫' },
    ],
  };
}

/**
 * Picks a chapter-specific letter/character for tracing based on language script and chapter.
 */
function buildChapterTracing(
  chapter: Chapter,
  lang: LanguageId,
  nativeTitle: string,
  translit: string
): NonNullable<ChapterGameData['tracing']> {
  const seed = hashChapterSeed(`${chapter.id}-${lang}`);

  if (lang === 'santali') {
    const olChikiChars = [
      { letter: 'ᱚ', name: 'Ol Chiki LA (ᱚ)', sound: 'La / A' },
      { letter: 'ᱟ', name: 'Ol Chiki AAT (ᱟ)', sound: 'Aa' },
      { letter: 'ᱠ', name: 'Ol Chiki KA (ᱠ)', sound: 'Ka' },
      { letter: 'ᱡ', name: 'Ol Chiki JA (ᱡ)', sound: 'Ja' },
      { letter: 'ᱢ', name: 'Ol Chiki MA (ᱢ)', sound: 'Ma' },
      { letter: 'ᱱ', name: 'Ol Chiki NA (ᱱ)', sound: 'Na' },
      { letter: 'ᱥ', name: 'Ol Chiki SA (ᱥ)', sound: 'Sa' },
      { letter: 'ᱦ', name: 'Ol Chiki HA (ᱦ)', sound: 'Ha' },
      { letter: 'ᱨ', name: 'Ol Chiki RA (ᱨ)', sound: 'Ra' },
      { letter: 'ᱪ', name: 'Ol Chiki CHA (ᱪ)', sound: 'Cha' },
      { letter: 'ᱫ', name: 'Ol Chiki DA (ᱫ)', sound: 'Da' },
      { letter: 'ᱯ', name: 'Ol Chiki PA (ᱯ)', sound: 'Pa' },
    ];
    const match = nativeTitle.match(/[\u1C50-\u1C7F]/);
    const chosen = match
      ? olChikiChars.find((c) => c.letter === match[0]) || {
          letter: match[0],
          name: `Ol Chiki (${match[0]}) — ${translit.split(' ')[0]}`,
          sound: translit.split(' ')[0] || 'Santali',
        }
      : olChikiChars[seed % olChikiChars.length];

    return {
      letter: chosen.letter,
      letterName: `${chosen.name} • ${chapter.originalTitleHindi}`,
      script: 'olchiki',
      sound: chosen.sound,
      strokeGuide: `Trace the Ol Chiki character "${chosen.letter}" from chapter "${nativeTitle}".`,
    };
  }

  if (lang === 'ho') {
    const warangChars = [
      { letter: '𑢹', name: 'Warang Chiti HAA (𑢹)', sound: 'Ha' },
      { letter: '𑢠', name: 'Warang Chiti AA (𑢠)', sound: 'Aa' },
      { letter: '𑢡', name: 'Warang Chiti WI (𑢡)', sound: 'Wi / Ba' },
      { letter: '𑢎', name: 'Warang Chiti JA (𑢎)', sound: 'Ja' },
      { letter: '𑢶', name: 'Warang Chiti MA (𑢶)', sound: 'Ma' },
      { letter: '𑢜', name: 'Warang Chiti RA (𑢜)', sound: 'Ra' },
    ];
    const chosen = warangChars[seed % warangChars.length];
    return {
      letter: chosen.letter,
      letterName: `${chosen.name} • ${chapter.originalTitleHindi}`,
      script: 'warangchiti',
      sound: chosen.sound,
      strokeGuide: `Trace the Ho Warang Chiti letter "${chosen.letter}" for "${translit}".`,
    };
  }

  // Mundari / Devanagari
  const devMatch = chapter.originalTitleHindi.match(/[\u0905-\u0939]/);
  const devLetter = devMatch ? devMatch[0] : 'अ';
  return {
    letter: devLetter,
    letterName: `Devanagari (${devLetter}) • ${chapter.originalTitleHindi}`,
    script: 'devanagari' as ScriptMode,
    sound: translit.split(' ')[0] || devLetter,
    strokeGuide: `Trace the letter "${devLetter}" from "${chapter.originalTitleHindi}".`,
  };
}

/**
 * Generates a complete, chapter-specific ChapterGameData object for any chapter and language.
 */
export function generateChapterSpecificGameData(
  chapter: Chapter,
  lang: LanguageId
): ChapterGameData {
  const langData = chapter.languages[lang] || chapter.languages['santali'];
  const nativeTitle = langData?.scriptText || langData?.title || chapter.originalTitleHindi;
  const translit = langData?.transliteration || chapter.originalTitleEnglish;
  const textbook = chapter.textbook || getChapterTextbookInfo(chapter);
  const seed = hashChapterSeed(`${chapter.id}-${lang}`);

  const tracing = buildChapterTracing(chapter, lang, nativeTitle, translit);

  // MATHEMATICS CHAPTERS
  if (chapter.subjectId === 'maths') {
    const mathContent = buildMathsChapterContent(chapter);
    return {
      dragDrop: mathContent.dragDrop,
      matching: {
        instruction: {
          native: `ᱪᱤᱛᱟᱹᱨ ᱟᱨ ᱮᱞᱠᱷᱟ ᱡᱚᱲᱟᱣ ᱢᱮ: ${nativeTitle}`,
          transliteration: `Chitar ar elkha joraw me: ${translit}`,
          hindi: `पाठ "${chapter.originalTitleHindi}" के गणितीय जोड़ों को मिलाएँ!`,
          english: `Match the pairs for "${chapter.originalTitleEnglish}"!`,
        },
        pairs: mathContent.matchingPairs,
      },
      counting: {
        instruction: {
          native: `ᱞᱮᱠᱷᱟᱭ ᱢᱮ: ${nativeTitle}`,
          transliteration: `Lekhay me: ${translit}`,
          hindi: mathContent.countingInstructionHindi,
          english: mathContent.countingInstructionEnglish,
        },
        items: mathContent.countingItems,
      },
      tracing,
      quiz: mathContent.quiz,
    };
  }

  // HINDI, ENGLISH, AND EVS CHAPTERS
  const profile = getChapterThemeProfile(chapter);
  const qPrefix = `${chapter.id}`;

  // Build chapter-specific matching pairs using chapter vocabulary + chapter title
  const vocabList = textbook.keyVocabulary || [];
  const emojiPool = [chapter.coverEmoji || '📖', '🌿', '🏡', '🌟', '🌺', '🦌'];
  const matchingPairs: NonNullable<ChapterGameData['matching']>['pairs'] = [
    {
      id: `${qPrefix}-m1`,
      emoji: chapter.coverEmoji || '📖',
      nativeWord: `${nativeTitle}`,
      transliteration: translit,
      hindiWord: `${chapter.originalTitleHindi} (${chapter.originalTitleEnglish})`,
    },
    ...vocabList.slice(0, 3).map((v, idx) => {
      const nativeW =
        lang === 'ho' ? v.hoWord : lang === 'mundari' ? v.mundariWord : v.santaliWord;
      return {
        id: `${qPrefix}-m${idx + 2}`,
        emoji: idx === 0 ? profile.itemsA[0]?.emoji || '🌺' : idx === 1 ? profile.itemsA[1]?.emoji || '🌳' : emojiPool[(seed + idx) % emojiPool.length],
        nativeWord: nativeW,
        transliteration: v.word,
        hindiWord: `${v.word} (${v.meaningEnglish})`,
      };
    }),
  ];

  // Build 4 chapter-specific quiz questions for Hindi / English / EVS
  const primaryVocab = vocabList[seed % Math.max(1, vocabList.length)] || {
    word: chapter.originalTitleHindi,
    meaningHindi: chapter.originalTitleHindi,
    meaningEnglish: chapter.originalTitleEnglish,
    santaliWord: nativeTitle,
    hoWord: nativeTitle,
    mundariWord: nativeTitle,
  };
  const targetTribalWord =
    lang === 'ho'
      ? primaryVocab.hoWord
      : lang === 'mundari'
      ? primaryVocab.mundariWord
      : primaryVocab.santaliWord;

  const exerciseItem = textbook.textbookExercises?.[0];

  const quiz: NonNullable<ChapterGameData['quiz']> = [
    {
      id: `${qPrefix}-q1`,
      question: {
        native: `${nativeTitle}: ${profile.themeQuestionHindi}`,
        transliteration: `${translit}`,
        hindi: profile.themeQuestionHindi,
        english: profile.themeQuestionEnglish,
      },
      options: arrangeOptions(`${qPrefix}-q1`, profile.themeCorrectOption, profile.themeDistractors),
      explanation: profile.themeFactHindi,
    },
    {
      id: `${qPrefix}-q2`,
      question: {
        native: `"${chapter.originalTitleHindi}" ᱫᱚ ᱥᱟᱱᱛᱟᱲᱤ / ᱟᱹᱫᱤᱵᱟᱹᱥᱤ ᱯᱟᱹᱨᱥᱤ ᱛᱮ ᱪᱮᱫ ᱠᱚ ᱢᱮᱛᱟᱜᱼᱟ?`,
        transliteration: `"${chapter.originalTitleEnglish}" do मातृभाषा re chet ko metag-a?`,
        hindi: `पाठ "${chapter.originalTitleHindi}" (${chapter.originalTitleEnglish}) को जनजातीय मातृभाषा में क्या कहते हैं?`,
        english: `How is the chapter title "${chapter.originalTitleEnglish}" expressed in the tribal mother tongue?`,
      },
      options: arrangeOptions(
        `${qPrefix}-q2`,
        { text: `${nativeTitle} (${translit})`, emoji: chapter.coverEmoji || '🗣️' },
        [
          { text: 'केवल संख्या जोड़ना (Addition Only)', emoji: '➕' },
          { text: 'गेंद और बल्ला (Ball & Bat)', emoji: '🏏' },
          { text: 'सूखा पत्थर (Dry Stone)', emoji: '🪨' },
        ]
      ),
      explanation: `"${chapter.originalTitleHindi}" को मातृभाषा में "${nativeTitle} (${translit})" कहते हैं।`,
    },
    {
      id: `${qPrefix}-q3`,
      question: {
        native: `पाठ "${chapter.originalTitleHindi}" — ᱟᱹᱲᱟᱹ ᱢᱮᱱᱮᱛ: "${primaryVocab.word}" (${primaryVocab.meaningEnglish}) ᱨᱮᱱᱟᱜ ᱢᱮᱱᱮᱛ ᱪᱮᱫ ᱠᱟᱱᱟ?`,
        transliteration: `Vocabulary check (${chapter.originalTitleEnglish}): "${primaryVocab.word}"`,
        hindi: `पाठ "${chapter.originalTitleHindi}" का शब्दार्थ: "${primaryVocab.word}" (${primaryVocab.meaningEnglish}) का सही मातृभाषा रूप और अर्थ क्या है?`,
        english: `Vocabulary Check (${chapter.originalTitleEnglish}): What is the mother-tongue word and meaning for "${primaryVocab.word}" (${primaryVocab.meaningEnglish})?`,
      },
      options: arrangeOptions(
        `${qPrefix}-q3`,
        { text: `${targetTribalWord} — ${primaryVocab.meaningHindi}`, emoji: '📚' },
        [
          { text: '0 (शून्य / कुछ नहीं)', emoji: '⭕' },
          { text: 'लोहे का हथौड़ा (Iron Hammer)', emoji: '🔨' },
          { text: 'मोटरसाइकिल का पहिया (Wheel)', emoji: '🛞' },
        ]
      ),
      explanation: `शब्द "${primaryVocab.word}" का अर्थ "${primaryVocab.meaningHindi}" (${primaryVocab.meaningEnglish}) है और मातृभाषा में इसे "${targetTribalWord}" कहते हैं।`,
    },
    {
      id: `${qPrefix}-q4`,
      question: {
        native: profile.secondQuestionHindi,
        transliteration: exerciseItem ? exerciseItem.question : profile.secondQuestionEnglish,
        hindi: profile.secondQuestionHindi,
        english: profile.secondQuestionEnglish,
      },
      options: arrangeOptions(`${qPrefix}-q4`, profile.secondCorrectOption, profile.secondDistractors),
      explanation: exerciseItem?.hint || profile.themeFactHindi,
    },
  ];

  // Build chapter-specific Drag & Drop using the chapter's theme profile
  const dragDropItems: DragItem[] = [
    {
      id: `${qPrefix}-dd1`,
      name: profile.itemsA[0],
      emoji: profile.itemsA[0].emoji,
      correctZone: 'cat_a',
    },
    {
      id: `${qPrefix}-dd2`,
      name: profile.itemsB[0],
      emoji: profile.itemsB[0].emoji,
      correctZone: 'cat_b',
    },
    {
      id: `${qPrefix}-dd3`,
      name: profile.itemsA[1],
      emoji: profile.itemsA[1].emoji,
      correctZone: 'cat_a',
    },
    {
      id: `${qPrefix}-dd4`,
      name: profile.itemsB[1],
      emoji: profile.itemsB[1].emoji,
      correctZone: 'cat_b',
    },
  ];

  const baseCount = ((chapter.classNumber + chapter.chapterNumber) % 4) + 2;

  return {
    dragDrop: {
      instruction: {
        native: `${nativeTitle}: ᱡᱤᱱᱤᱥ ᱠᱚ ᱴᱷᱤᱠ ᱜᱟᱫᱮᱞ ᱨᱮ ᱫᱚᱦᱚᱭ ᱢᱮ!`,
        transliteration: `${translit}: Jinis ko thik gadel re dohoy me!`,
        hindi: `पाठ "${chapter.originalTitleHindi}": संबंधित वस्तुओं को उनके सही समूह में रखो!`,
        english: `Sort the items for "${chapter.originalTitleEnglish}" into the correct group!`,
      },
      zones: [
        { id: 'cat_a', label: profile.categoryLabelA, color: 'bg-emerald-500' },
        { id: 'cat_b', label: profile.categoryLabelB, color: 'bg-amber-500' },
      ],
      items: dragDropItems,
    },
    matching: {
      instruction: {
        native: `ᱪᱤᱛᱟᱹᱨ ᱟᱨ ᱟᱹᱲᱟᱹ ᱡᱚᱲᱟᱣ ᱢᱮ: ${nativeTitle}`,
        transliteration: `Chitar ar ara joraw me: ${translit}`,
        hindi: `पाठ "${chapter.originalTitleHindi}" के शब्दों को चित्रों से जोड़ें!`,
        english: `Match the pictures with words from "${chapter.originalTitleEnglish}"!`,
      },
      pairs: matchingPairs,
    },
    counting: {
      instruction: {
        native: `ᱞᱮᱠᱷᱟᱭ ᱢᱮ (${nativeTitle})!`,
        transliteration: `Lekhay me (${translit})!`,
        hindi: `पाठ "${chapter.originalTitleHindi}" से जुड़े चित्रों को गिनें!`,
        english: `Count the themed items from "${chapter.originalTitleEnglish}"!`,
      },
      items: [
        {
          id: `${qPrefix}-c1`,
          emoji: chapter.coverEmoji || '🌟',
          name: `${chapter.originalTitleHindi} (${translit})`,
          count: baseCount,
        },
        {
          id: `${qPrefix}-c2`,
          emoji: profile.itemsA[0].emoji,
          name: `${profile.itemsA[0].hindi} (${profile.itemsA[0].english})`,
          count: baseCount + 2,
        },
        {
          id: `${qPrefix}-c3`,
          emoji: profile.itemsA[1].emoji,
          name: `${profile.itemsA[1].hindi} (${profile.itemsA[1].english})`,
          count: Math.min(baseCount + 4, 9),
        },
      ],
    },
    tracing,
    quiz,
  };
}

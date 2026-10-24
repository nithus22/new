/**
 * Pure business logic for games, progression, star scoring, curriculum filtering,
 * and dynamic chapter slide/game data generation.
 * Decoupled from React DOM for fast unit testing.
 */

import { Chapter, LanguageId, LessonSlide, ChapterGameData } from '../types/index.ts';
import { generateChapterSpecificGameData } from './chapterGameGenerator.ts';

const chapterGameCache = new Map<string, ChapterGameData>();

export interface DragItemRule {
  id: string;
  correctZone: string;
}

export function validateDragPlacement(
  itemId: string,
  targetZone: string,
  items: DragItemRule[]
): boolean {
  const item = items.find((i) => i.id === itemId);
  if (!item) return false;
  return item.correctZone === targetZone;
}

export function checkMatchingComplete(matchedPairIds: string[], totalPairsCount: number): boolean {
  if (totalPairsCount <= 0) return false;
  const uniqueMatches = new Set(matchedPairIds);
  return uniqueMatches.size === totalPairsCount;
}

export function calculateStarRewards(correctAnswers: number, totalItems: number): number {
  if (totalItems <= 0 || correctAnswers <= 0) return 0;
  const ratio = correctAnswers / totalItems;
  if (ratio >= 0.8) return 3; // 3 stars for 80%+
  if (ratio >= 0.5) return 2; // 2 stars for 50%+
  return 1; // 1 star for participation
}

export function checkStickerUnlocks(
  currentTotalStars: number,
  alreadyUnlockedIds: string[],
  allStickers: Array<{ id: string; unlockedAtStars: number }>
): string[] {
  const newlyUnlocked: string[] = [];
  for (const sticker of allStickers) {
    if (currentTotalStars >= sticker.unlockedAtStars && !alreadyUnlockedIds.includes(sticker.id)) {
      newlyUnlocked.push(sticker.id);
    }
  }
  return newlyUnlocked;
}

export function filterCurriculum(
  chapters: Array<{ classNumber: number; subjectId: string; id: string }>,
  classNumber: number,
  subjectId: string
): Array<{ classNumber: number; subjectId: string; id: string }> {
  return chapters.filter(
    (ch) => ch.classNumber === classNumber && ch.subjectId === subjectId
  );
}

export function formatScriptText(
  text: string,
  script: 'olchiki' | 'warangchiti' | 'devanagari' | 'roman' | 'mundaribani'
): { text: string; cssClass: string } {
  switch (script) {
    case 'olchiki':
      return { text, cssClass: 'font-olchiki' };
    case 'warangchiti':
      return { text, cssClass: 'font-warangchiti' };
    case 'devanagari':
    case 'mundaribani':
      return { text, cssClass: 'font-devanagari' };
    default:
      return { text, cssClass: 'font-cartoon' };
  }
}

/**
 * Returns effective lesson slides for any chapter.
 * If pre-curated slides exist, returns them.
 * Otherwise, generates structured, interactive slides using the chapter's native title,
 * script, transliterations, and bridge language context.
 */
export function getEffectiveChapterSlides(
  chapter: Chapter,
  lang: LanguageId
): LessonSlide[] {
  const langData = chapter.languages[lang] || chapter.languages['santali'];
  if (langData?.lessonSlides && langData.lessonSlides.length > 0) {
    return langData.lessonSlides;
  }

  const nativeTitle = langData?.scriptText || langData?.title || chapter.originalTitleHindi;
  const translit = langData?.transliteration || chapter.originalTitleEnglish;
  const hindiTitle = chapter.originalTitleHindi;
  const engTitle = chapter.originalTitleEnglish;
  const book = chapter.bookName;

  const titleLower = ((hindiTitle || '') + ' ' + (engTitle || '')).toLowerCase();
  let sceneType: LessonSlide['sceneType'] = 'general';
  if (titleLower.includes('अंदर') || titleLower.includes('बाहर') || titleLower.includes('inside') || titleLower.includes('outside')) {
    sceneType = 'inside_outside';
  } else if (titleLower.includes('बड़ा') || titleLower.includes('छोटा') || titleLower.includes('big') || titleLower.includes('small')) {
    sceneType = 'big_small';
  } else if (titleLower.includes('ऊपर') || titleLower.includes('नीचे') || titleLower.includes('top') || titleLower.includes('bottom')) {
    sceneType = 'top_bottom';
  } else if (titleLower.includes('पास') || titleLower.includes('दूर') || titleLower.includes('near') || titleLower.includes('far')) {
    sceneType = 'near_far';
  } else if (titleLower.includes('लुढ़क') || titleLower.includes('सरक') || titleLower.includes('roll') || titleLower.includes('slide')) {
    sceneType = 'rolling_sliding';
  } else {
    sceneType = 'general';
  }

  const vocabWords = chapter.textbook?.keyVocabulary && chapter.textbook.keyVocabulary.length > 0
    ? chapter.textbook.keyVocabulary.slice(0, 4).map((v) => ({
        native: lang === 'santali' ? v.santaliWord : lang === 'ho' ? v.hoWord : v.mundariWord,
        transliteration: v.word,
        hindi: v.meaningHindi,
        english: v.meaningEnglish,
      }))
    : [
        { native: nativeTitle, transliteration: translit, hindi: hindiTitle, english: engTitle },
        { native: 'ᱥᱮᱪᱮᱫ / ᱮᱱᱮᱡ', transliteration: 'Seched / Enej', hindi: 'सीखना और खेल', english: 'Learn & Play' },
        { native: 'ᱟᱹᱛᱩ ᱟᱥᱲᱟ', transliteration: 'Aatu Asra', hindi: 'गाँव का विद्यालय', english: 'Village School' },
      ];

  const firstExcerpt = chapter.textbook?.readingPassageHindi
    ? chapter.textbook.readingPassageHindi.split('\n')[0]
    : `पाठ ${chapter.chapterNumber}: ${hindiTitle} • ${book}`;

  return [
    {
      id: `${chapter.id}-gen-s1`,
      conceptKey: 'chapter_intro',
      native: `${nativeTitle}`,
      transliteration: `${translit}`,
      alternateTransliteration: langData?.alternateTransliteration,
      hindi: firstExcerpt || `पाठ ${chapter.chapterNumber}: ${hindiTitle} • ${book}`,
      english: `Chapter ${chapter.chapterNumber}: ${engTitle} (${book})`,
      audioPhonetic: `${translit}. ${hindiTitle}.`,
      sceneType: sceneType,
      visualHint: `Official JCERT Chapter ${chapter.chapterNumber} on ${engTitle} from ${book} with animated cartoon scenes.`,
      keywords: vocabWords,
    },
    {
      id: `${chapter.id}-gen-s2`,
      conceptKey: 'key_concepts',
      native: `ᱢᱩᱬᱩᱛ ᱠᱟᱛᱷᱟ : ${nativeTitle}`,
      transliteration: `Munrut Katha: ${translit}`,
      alternateTransliteration: langData?.alternateTransliteration,
      hindi: `इस अध्याय में हम ${hindiTitle} के मुख्य विचारों को मातृभाषा में चित्रों और कहानियों के साथ सीखते हैं।`,
      english: `In this chapter we explore key concepts of ${engTitle} in tribal mother tongue with bridge language support.`,
      audioPhonetic: `Abo do ${translit} baabotte bes lekate bon aayatt-a.`,
      sceneType: 'general',
      visualHint: `Chotu the deer mascot guides children through concepts of ${engTitle} with animations.`,
      keywords: vocabWords,
    },
  ];
}

/**
 * Returns effective interactive game data for any chapter.
 * Guarantees chapter-specific playable games across all 221 chapters and all subjects.
 */
export function getEffectiveGameData(
  chapter: Chapter,
  lang: LanguageId
): ChapterGameData {
  const cacheKey = `${chapter.id}:${lang}:${chapter.classNumber}:${chapter.subjectId}:${chapter.originalTitleEnglish}`;
  const cached = chapterGameCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const generated = generateChapterSpecificGameData(chapter, lang);
  const langData = chapter.languages[lang] || chapter.languages['santali'];
  const curated = langData?.gameData;

  const effective: ChapterGameData = {
    dragDrop: curated?.dragDrop?.items?.length ? curated.dragDrop : generated.dragDrop,
    matching: curated?.matching?.pairs?.length ? curated.matching : generated.matching,
    counting: curated?.counting?.items?.length ? curated.counting : generated.counting,
    tracing: curated?.tracing?.letter ? curated.tracing : generated.tracing,
    quiz: curated?.quiz?.length ? curated.quiz : generated.quiz,
  };

  chapterGameCache.set(cacheKey, effective);
  return effective;
}


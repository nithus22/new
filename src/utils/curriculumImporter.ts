import type { Chapter, LanguageId, ReviewStatus } from '../types/index.ts';

export interface CurriculumValidationResult {
  valid: boolean;
  importedCount: number;
  errors: string[];
}

/**
 * Validates and normalizes user-supplied curriculum JSON data.
 * Ensures official JCERT structure is preserved and missing language fields have safe fallbacks.
 */
export function validateAndParseCurriculumJson(jsonString: string): {
  result: CurriculumValidationResult;
  chapters: Chapter[];
} {
  const errors: string[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err) {
    return {
      result: {
        valid: false,
        importedCount: 0,
        errors: [`Invalid JSON format: ${(err as Error).message}`],
      },
      chapters: [],
    };
  }

  const rawList = Array.isArray(parsed) ? parsed : [parsed];
  const validatedChapters: Chapter[] = [];

  rawList.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      errors.push(`Item ${index + 1} is not a valid object.`);
      return;
    }

    const rec = item as Record<string, unknown>;

    // Required core fields
    const classNumber = Number(rec.classNumber || rec.class);
    if (!classNumber || classNumber < 1 || classNumber > 5) {
      errors.push(`Item ${index + 1}: class must be a number between 1 and 5.`);
      return;
    }

    const subjectId = String(rec.subjectId || rec.subject || '').toLowerCase();
    if (!['maths', 'hindi', 'evs', 'english'].includes(subjectId)) {
      errors.push(`Item ${index + 1}: subject must be one of 'maths', 'hindi', 'evs', 'english'.`);
      return;
    }

    const chapterNumber = Number(rec.chapterNumber || rec.chapter);
    if (!chapterNumber || chapterNumber < 1) {
      errors.push(`Item ${index + 1}: chapter number must be a positive integer.`);
      return;
    }

    const originalTitleHindi = String(rec.originalTitleHindi || rec.titleHindi || rec.title || `पाठ ${chapterNumber}`);
    const originalTitleEnglish = String(rec.originalTitleEnglish || rec.titleEnglish || `Chapter ${chapterNumber}`);
    const bookName = String(rec.bookName || rec.book || `JCERT Class ${classNumber} ${subjectId}`);
    const coverEmoji = String(rec.coverEmoji || '📖');
    const id = String(rec.id || `c${classNumber}-${subjectId}-ch${chapterNumber}`);

    // Parse language translations
    const rawLangs = (rec.languages as Record<string, unknown>) || {};

    const createSafeTranslation = (langKey: LanguageId, fallbackTitle: string) => {
      const l = (rawLangs[langKey] as Record<string, unknown>) || {};
      return {
        title: String(l.title || fallbackTitle),
        scriptText: String(l.scriptText || l.title || fallbackTitle),
        transliteration: String(l.transliteration || originalTitleEnglish),
        alternateTransliteration: l.alternateTransliteration ? String(l.alternateTransliteration) : undefined,
        audioFile: l.audioFile ? String(l.audioFile) : undefined,
        audioNarrationText: l.audioNarrationText ? String(l.audioNarrationText) : undefined,
        videoLink: l.videoLink ? String(l.videoLink) : undefined,
        reviewStatus: (['approved', 'teacher-reviewed', 'ai-draft'].includes(String(l.reviewStatus))
          ? l.reviewStatus
          : 'ai-draft') as ReviewStatus,
        lastReviewedBy: l.lastReviewedBy ? String(l.lastReviewedBy) : undefined,
        reviewNotes: l.reviewNotes ? String(l.reviewNotes) : undefined,
        lessonSlides: Array.isArray(l.lessonSlides) ? (l.lessonSlides as any) : [],
        gameData: l.gameData ? (l.gameData as any) : undefined,
      };
    };

    const chapter: Chapter = {
      id,
      chapterNumber,
      classNumber,
      subjectId: subjectId as 'maths' | 'hindi' | 'evs' | 'english',
      bookName,
      originalTitleHindi,
      originalTitleEnglish,
      coverEmoji,
      languages: {
        santali: createSafeTranslation('santali', originalTitleHindi),
        ho: createSafeTranslation('ho', originalTitleHindi),
        mundari: createSafeTranslation('mundari', originalTitleHindi),
      },
    };

    validatedChapters.push(chapter);
  });

  return {
    result: {
      valid: errors.length === 0,
      importedCount: validatedChapters.length,
      errors,
    },
    chapters: validatedChapters,
  };
}

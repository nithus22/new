/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageId, ScriptMode } from '../types';

export interface ChapterQuizRecord {
  score: number;
  total: number;
  percentage: number;
  completedAt: string;
}

export interface LastAccessedChapter {
  chapterId: string;
  classNumber: number;
  subjectId: 'maths' | 'hindi' | 'evs' | 'english';
  chapterTitle: string;
  hindiTitle: string;
  santaliTitle?: string;
  coverEmoji: string;
  timestamp: number;
}

export interface StoredProgress {
  selectedLanguage: LanguageId;
  activeScript: ScriptMode;
  selectedClass: number;
  selectedSubject: 'maths' | 'hindi' | 'evs' | 'english';
  starsCount: number;
  completedChapters: string[];
  unlockedStickerIds: string[];
  quizScores: Record<string, ChapterQuizRecord>;
  lastAccessed: LastAccessedChapter | null;
  soundEnabled: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

const STORAGE_KEY = 'bhasha_setu_progress_v2';

const DEFAULT_PROGRESS: StoredProgress = {
  selectedLanguage: 'santali',
  activeScript: 'olchiki',
  selectedClass: 1,
  selectedSubject: 'maths',
  starsCount: 3,
  completedChapters: [],
  unlockedStickerIds: ['stk-chotu', 'stk-sal-tree'],
  quizScores: {},
  lastAccessed: null,
  soundEnabled: true,
  highContrast: false,
  reducedMotion: false,
};

export function loadStoredProgress(): StoredProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Check legacy keys for seamless backward compatibility
      const legacyStars = localStorage.getItem('bhasha_stars');
      const legacyCompleted = localStorage.getItem('bhasha_completed');
      const legacyStickers = localStorage.getItem('bhasha_stickers');
      const legacyLang = localStorage.getItem('bhasha_language') as LanguageId | null;
      const legacyScript = localStorage.getItem('bhasha_script') as ScriptMode | null;

      const merged: StoredProgress = {
        ...DEFAULT_PROGRESS,
        starsCount: legacyStars ? parseInt(legacyStars, 10) : DEFAULT_PROGRESS.starsCount,
        completedChapters: legacyCompleted ? JSON.parse(legacyCompleted) : DEFAULT_PROGRESS.completedChapters,
        unlockedStickerIds: legacyStickers ? JSON.parse(legacyStickers) : DEFAULT_PROGRESS.unlockedStickerIds,
        selectedLanguage: legacyLang || DEFAULT_PROGRESS.selectedLanguage,
        activeScript: legacyScript || DEFAULT_PROGRESS.activeScript,
      };
      saveStoredProgress(merged);
      return merged;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROGRESS, ...parsed };
  } catch (err) {
    console.warn('Failed to load progress from localStorage:', err);
    return DEFAULT_PROGRESS;
  }
}

export function saveStoredProgress(progress: Partial<StoredProgress>): StoredProgress {
  try {
    const current = loadStoredProgress();
    const updated: StoredProgress = { ...current, ...progress };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Keep legacy keys updated for any external/existing consumers
    if (progress.selectedLanguage) localStorage.setItem('bhasha_language', progress.selectedLanguage);
    if (progress.activeScript) localStorage.setItem('bhasha_script', progress.activeScript);
    if (typeof progress.starsCount === 'number') localStorage.setItem('bhasha_stars', progress.starsCount.toString());
    if (progress.completedChapters) localStorage.setItem('bhasha_completed', JSON.stringify(progress.completedChapters));
    if (progress.unlockedStickerIds) localStorage.setItem('bhasha_stickers', JSON.stringify(progress.unlockedStickerIds));

    return updated;
  } catch (err) {
    console.warn('Failed to save progress to localStorage:', err);
    return { ...DEFAULT_PROGRESS, ...progress };
  }
}

export function recordChapterVisit(
  chapterId: string,
  classNumber: number,
  subjectId: 'maths' | 'hindi' | 'evs' | 'english',
  chapterTitle: string,
  hindiTitle: string,
  coverEmoji: string,
  santaliTitle?: string
) {
  const lastAccessed: LastAccessedChapter = {
    chapterId,
    classNumber,
    subjectId,
    chapterTitle,
    hindiTitle,
    coverEmoji,
    santaliTitle,
    timestamp: Date.now(),
  };
  saveStoredProgress({ lastAccessed, selectedClass: classNumber, selectedSubject: subjectId });
}

export function saveQuizScore(chapterId: string, score: number, total: number) {
  const progress = loadStoredProgress();
  const percentage = Math.round((score / Math.max(1, total)) * 100);
  const quizScores = {
    ...progress.quizScores,
    [chapterId]: {
      score,
      total,
      percentage,
      completedAt: new Date().toISOString(),
    },
  };
  return saveStoredProgress({ quizScores });
}

export function markChapterComplete(chapterId: string, starsToAdd = 3): { progress: StoredProgress; isNew: boolean } {
  const progress = loadStoredProgress();
  const alreadyCompleted = progress.completedChapters.includes(chapterId);
  const completedChapters = alreadyCompleted ? progress.completedChapters : [...progress.completedChapters, chapterId];
  const starsCount = alreadyCompleted ? progress.starsCount : progress.starsCount + starsToAdd;

  const updated = saveStoredProgress({ completedChapters, starsCount });
  return { progress: updated, isNew: !alreadyCompleted };
}

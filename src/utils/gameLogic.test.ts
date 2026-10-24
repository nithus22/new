import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateDragPlacement,
  checkMatchingComplete,
  calculateStarRewards,
  checkStickerUnlocks,
  filterCurriculum,
  formatScriptText,
  getEffectiveChapterSlides,
  getEffectiveGameData,
} from './gameLogic.ts';
import { Chapter } from '../types';

test('validateDragPlacement correctly identifies valid and invalid targets', () => {
  const items = [
    { id: 'camel', correctZone: 'outside' },
    { id: 'tent_mat', correctZone: 'inside' },
  ];

  assert.equal(validateDragPlacement('camel', 'outside', items), true);
  assert.equal(validateDragPlacement('camel', 'inside', items), false);
  assert.equal(validateDragPlacement('tent_mat', 'inside', items), true);
  assert.equal(validateDragPlacement('unknown', 'inside', items), false);
});

test('checkMatchingComplete verifies full pair set', () => {
  assert.equal(checkMatchingComplete(['p1', 'p2', 'p3'], 3), true);
  assert.equal(checkMatchingComplete(['p1', 'p2'], 3), false);
  assert.equal(checkMatchingComplete(['p1', 'p1', 'p2'], 3), false); // duplicate
  assert.equal(checkMatchingComplete([], 0), false);
});

test('calculateStarRewards returns appropriate child-encouraging star ratings', () => {
  assert.equal(calculateStarRewards(4, 4), 3);
  assert.equal(calculateStarRewards(3, 4), 2);
  assert.equal(calculateStarRewards(1, 4), 1);
  assert.equal(calculateStarRewards(0, 4), 0);
});

test('checkStickerUnlocks identifies newly earned rewards without duplicates', () => {
  const stickers = [
    { id: 's1', unlockedAtStars: 1 },
    { id: 's2', unlockedAtStars: 3 },
    { id: 's3', unlockedAtStars: 5 },
  ];

  // Starting with 0 stars
  assert.deepEqual(checkStickerUnlocks(0, [], stickers), []);

  // Earned 3 stars with no stickers yet
  assert.deepEqual(checkStickerUnlocks(3, [], stickers), ['s1', 's2']);

  // Already have s1, now reach 3 stars
  assert.deepEqual(checkStickerUnlocks(3, ['s1'], stickers), ['s2']);

  // Reach 10 stars with all already unlocked
  assert.deepEqual(checkStickerUnlocks(10, ['s1', 's2', 's3'], stickers), []);
});

test('filterCurriculum filters by class and subject', () => {
  const chapters = [
    { id: 'ch1', classNumber: 1, subjectId: 'maths' },
    { id: 'ch2', classNumber: 1, subjectId: 'hindi' },
    { id: 'ch3', classNumber: 2, subjectId: 'maths' },
  ];

  const filtered = filterCurriculum(chapters, 1, 'maths');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'ch1');
});

test('formatScriptText returns corresponding CSS classes', () => {
  assert.equal(formatScriptText('ᱚᱞ ᱪᱤᱠᱤ', 'olchiki').cssClass, 'font-olchiki');
  assert.equal(formatScriptText('𑢹𑣉𑣀', 'warangchiti').cssClass, 'font-warangchiti');
  assert.equal(formatScriptText('मुण्डारी', 'devanagari').cssClass, 'font-devanagari');
  assert.equal(formatScriptText('English', 'roman').cssClass, 'font-cartoon');
});

test('getEffectiveChapterSlides returns curated slides or generates fallback slides', () => {
  const dummyChapter: Chapter = {
    id: 'test-ch',
    chapterNumber: 2,
    classNumber: 2,
    subjectId: 'hindi',
    bookName: 'झिलमिल - 2 (JCERT Class 2)',
    originalTitleHindi: 'आई एक ख़बर',
    originalTitleEnglish: 'A News Arrived',
    coverEmoji: '📰',
    languages: {
      santali: {
        title: 'ᱦᱮᱡ ᱮᱱᱟ ᱢᱤᱫ ᱠᱷᱚᱵᱚᱨ',
        scriptText: 'ᱦᱮᱡ ᱮᱱᱟ ᱢᱤᱫ ᱠᱷᱚᱵᱚᱨ',
        transliteration: 'Hej ena mit Khobor',
        reviewStatus: 'approved',
        lessonSlides: [],
      },
      ho: {
        title: 'मियद खबर हिजुः एना',
        scriptText: 'मियद खबर',
        transliteration: 'Miyad khabar',
        reviewStatus: 'teacher-reviewed',
        lessonSlides: [],
      },
      mundari: {
        title: 'मियद खबर',
        scriptText: 'मियद खबर',
        transliteration: 'Miyad khabar',
        reviewStatus: 'teacher-reviewed',
        lessonSlides: [],
      },
    },
  };

  const slides = getEffectiveChapterSlides(dummyChapter, 'santali');
  assert.ok(slides.length > 0);
  assert.equal(slides[0].conceptKey, 'chapter_intro');
  assert.match(slides[0].native, /ᱦᱮᱡ ᱮᱱᱟ ᱢᱤᱫ ᱠᱷᱚᱵᱚᱨ/);

  const gameData = getEffectiveGameData(dummyChapter, 'santali');
  assert.ok(gameData.dragDrop);
  assert.ok(gameData.matching);
  assert.ok(gameData.matching.pairs.length > 0);
  assert.ok(gameData.counting);
  assert.ok(gameData.tracing);
  assert.ok(gameData.quiz);
  assert.ok(gameData.quiz.length >= 4);
});

test('getEffectiveGameData generates chapter-specific games and questions for every chapter across all subjects and classes', async () => {
  const { INITIAL_CURRICULUM } = await import('../data/curriculum.ts');
  assert.ok(INITIAL_CURRICULUM.length >= 220, 'Curriculum should have all chapters');

  // Verify Class 1 Maths Chapter 2 (Numbers 1 to 9) vs Chapter 3 (Addition) vs Chapter 4 (Subtraction)
  const ch2Counting = INITIAL_CURRICULUM.find((c) => c.id === 'c1-maths-ch2')!;
  const ch3Addition = INITIAL_CURRICULUM.find((c) => c.id === 'c1-maths-ch3')!;
  const ch4Subtraction = INITIAL_CURRICULUM.find((c) => c.id === 'c1-maths-ch4')!;

  const g2 = getEffectiveGameData(ch2Counting, 'santali');
  const g3 = getEffectiveGameData(ch3Addition, 'santali');
  const g4 = getEffectiveGameData(ch4Subtraction, 'santali');

  assert.notDeepEqual(g2.quiz, g3.quiz, 'Counting chapter and Addition chapter must have different quiz questions');
  assert.notDeepEqual(g3.quiz, g4.quiz, 'Addition chapter and Subtraction chapter must have different quiz questions');
  assert.notDeepEqual(g2.dragDrop, g3.dragDrop, 'Counting chapter and Addition chapter must have different dragDrop games');
  assert.notDeepEqual(g3.dragDrop, g4.dragDrop, 'Addition chapter and Subtraction chapter must have different dragDrop games');

  // Verify every single chapter has complete, valid, chapter-specific game data
  const seenQuizSignatures = new Set<string>();
  for (const ch of INITIAL_CURRICULUM) {
    const data = getEffectiveGameData(ch, 'santali');
    assert.ok(data.dragDrop && data.dragDrop.zones.length === 2 && data.dragDrop.items.length >= 4, `Valid dragDrop for ${ch.id}`);
    assert.ok(data.matching && data.matching.pairs.length >= 4, `Valid matching for ${ch.id}`);
    assert.ok(data.counting && data.counting.items.length >= 3, `Valid counting for ${ch.id}`);
    assert.ok(data.tracing && data.tracing.letter.length > 0, `Valid tracing for ${ch.id}`);
    assert.ok(data.quiz && data.quiz.length >= 4, `Valid quiz with at least 4 questions for ${ch.id}`);

    for (const q of data.quiz) {
      assert.equal(q.options.length, 4, `Question ${q.id} in ${ch.id} must have 4 options`);
      const correctCount = q.options.filter((o) => o.isCorrect).length;
      assert.equal(correctCount, 1, `Question ${q.id} in ${ch.id} must have exactly 1 correct option`);
      assert.ok(q.explanation.length > 5, `Question ${q.id} in ${ch.id} must have an explanation`);
    }

    const sig = data.quiz.map((q) => `${q.question.english}|${q.options.map((o) => o.text).join(',')}`).join('||');
    assert.equal(seenQuizSignatures.has(sig), false, `Chapter ${ch.id} (${ch.originalTitleEnglish}) should have a unique quiz signature`);
    seenQuizSignatures.add(sig);
  }
});


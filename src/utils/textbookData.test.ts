import test from 'node:test';
import assert from 'node:assert';
import { INITIAL_CURRICULUM } from '../data/curriculum.ts';
import { getChapterTextbookInfo } from './textbookData.ts';

test('all 221 chapters have official JCERT textbook attached', () => {
  assert.strictEqual(INITIAL_CURRICULUM.length, 221);

  for (const chapter of INITIAL_CURRICULUM) {
    assert.ok(chapter.textbook, `Chapter ${chapter.id} must have textbook attached`);
    assert.ok(chapter.textbook.bookTitle.length > 0, `Chapter ${chapter.id} must have bookTitle`);
    assert.ok(chapter.textbook.pageRange.length > 0, `Chapter ${chapter.id} must have pageRange`);
    assert.ok(chapter.textbook.readingPassageHindi.length > 0, `Chapter ${chapter.id} must have reading passage`);
    assert.ok(chapter.textbook.officialPortalUrl.includes('jcert.jharkhand.gov.in'), `Chapter ${chapter.id} must link to JCERT portal`);
    assert.ok(chapter.textbook.textbookExercises.length > 0, `Chapter ${chapter.id} must have exercises`);
  }
});

test('getChapterTextbookInfo generates consistent metadata', () => {
  const sample = INITIAL_CURRICULUM[0];
  const info = getChapterTextbookInfo(sample);
  assert.strictEqual(info.bookTitle, 'रोचक गणित - 1');
  assert.strictEqual(info.publisher, 'झारखंड शैक्षिक अनुसंधान एवं प्रशिक्षण परिषद् (JCERT), राँची');
});

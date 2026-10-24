import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAndParseCurriculumJson } from './curriculumImporter.ts';

test('validates valid JCERT chapter json with fallback defaults', () => {
  const sample = JSON.stringify([
    {
      classNumber: 1,
      subjectId: 'maths',
      chapterNumber: 1,
      bookName: 'गणित का जादू (JCERT Class 1)',
      originalTitleHindi: 'आकृतियाँ और स्थान',
      originalTitleEnglish: 'Shapes and Space',
    },
  ]);

  const { result, chapters } = validateAndParseCurriculumJson(sample);
  assert.equal(result.valid, true);
  assert.equal(result.importedCount, 1);
  assert.equal(chapters[0].id, 'c1-maths-ch1');
  assert.equal(chapters[0].languages.santali.reviewStatus, 'ai-draft');
});

test('catches invalid JSON and invalid class numbers', () => {
  const invalidJson = 'invalid { json';
  const res1 = validateAndParseCurriculumJson(invalidJson);
  assert.equal(res1.result.valid, false);
  assert.equal(res1.result.importedCount, 0);

  const invalidClass = JSON.stringify([
    {
      classNumber: 10, // not in 1-5
      subjectId: 'maths',
      chapterNumber: 1,
    },
  ]);
  const res2 = validateAndParseCurriculumJson(invalidClass);
  assert.equal(res2.result.valid, false);
  assert.match(res2.result.errors[0], /class must be a number between 1 and 5/);
});

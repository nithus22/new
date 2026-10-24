# Bhasha Setu (ᱵᱷᱟᱥᱟ ᱥᱮᱛᱩ / 𑢪𑣁𑣞𑣁 𑢷𑣈𑣕𑣃 / भाषा सेतु)

**Bhasha Setu** is an animated, mother-tongue primary learning application built for tribal children in Jharkhand schools (Classes 1 to 5), supporting **SDG 4: Quality Education**.

Children learn official Jharkhand Council of Educational Research and Training (**JCERT**) textbooks in their own mother tongues through cartoon stories, synchronized audio narration, interactive games, and an AI companion named **Chotu**.

---

## 1. Supported Languages & Scripts

| Language | Primary Script | Transliterations | Native Script Sample |
| :--- | :--- | :--- | :--- |
| **Santali** | **Ol Chiki** (Unicode) | Roman | ᱥᱟᱱᱛᱟᱲᱤ • ᱪᱤᱛᱟᱹᱨ ᱟᱨ ᱴᱷᱟᱶ |
| **Ho** | **Warang Chiti** (Unicode) | Devanagari & Roman | 𑢹𑣉𑣀 𑣎𑣋𑣜 • 𑢏𑣂𑣕𑣁𑣜 𑣉𑣀𑣑𑣉𑣀 𑢹𑣗𑣕𑣂𑣊 |
| **Mundari** | **Devanagari** / Mundari Bani | Roman & Mundari Bani | मुण्डारी • रुप को ओंदोः ठाँव |
| **Kurukh / Khortha** | Devanagari / Tolong Siki | Roman | Extensible via data configuration |

- **Bridge Languages**: Hindi and English are toggleable at any moment (`Mother Tongue | Hindi | English`) so children transition gradually without linguistic disorientation.
- **Review Badges**: Every piece of content displays an audit status: `Approved`, `Teacher-Reviewed`, or `AI Draft`.
- **Offline / PWA**: Installable on Android devices with Service Worker offline caching.

---

## 2. Curriculum Data Schema

All curriculum is strictly decoupled into data (`src/data/curriculum.ts` and `src/data/languages.ts`).
**No code changes are required** to add new classes, subjects, chapters, or languages.

### Schema Definition (`src/types/index.ts`)

```typescript
export interface Chapter {
  id: string; // e.g. 'c1-math-ch1'
  chapterNumber: number; // 1
  classNumber: number; // 1 to 5
  subjectId: 'maths' | 'hindi' | 'evs' | 'english';
  bookName: string; // 'गणित का जादू (JCERT Class 1)'
  originalTitleHindi: string; // 'आकृतियाँ और स्थान'
  originalTitleEnglish: string; // 'Shapes and Space'
  coverEmoji: string; // '⛺'
  languages: {
    santali: ChapterTranslation;
    ho: ChapterTranslation;
    mundari: ChapterTranslation;
    [languageId: string]: ChapterTranslation;
  };
}

export interface ChapterTranslation {
  title: string;
  scriptText: string;
  transliteration: string;
  alternateTransliteration?: string; // e.g. Devanagari for Ho
  audioFile?: string;
  audioNarrationText?: string;
  videoLink?: string;
  reviewStatus: 'approved' | 'teacher-reviewed' | 'ai-draft';
  lastReviewedBy?: string;
  reviewNotes?: string;
  lessonSlides: LessonSlide[];
  gameData?: ChapterGameData;
}
```

---

## 3. How to Add New Chapters, Audio, Games, and Languages

### A. How to Add a New Chapter
1. Open `src/data/curriculum.ts`.
2. Add a new object to `INITIAL_CURRICULUM` following the JCERT textbook table of contents.
3. Include the chapter title, slides, and vocabulary keywords for `santali`, `ho`, and `mundari`.
4. If translation is not yet ready, set `reviewStatus: 'ai-draft'` or leave `lessonSlides: []`—the app will gracefully show "Content Coming Soon".

### B. How to Add Audio
1. Place audio recordings (MP3/OGG/WAV) in `/public/audio/[language]/[chapterId].mp3`.
2. Reference the path in `audioFile: '/audio/santali/c1-math-ch1.mp3'`.
3. If no pre-recorded audio exists, the built-in Web Speech and Web Audio phonetic engine automatically synthesizes pronunciation with word highlighting.

### C. How to Add Interactive Games
Each chapter's `gameData` property supports 5 plug-and-play game templates:
1. `dragDrop`: Define target zones (e.g. `inside`, `outside`) and item arrays with `correctZone`.
2. `matching`: Define pairs with `emoji`, `nativeWord`, and `hindiWord`.
3. `counting`: Define counts of forest animals, leaves, or fruits.
4. `tracing`: Define letter stencils (Ol Chiki, Warang Chiti, Devanagari).
5. `quiz`: Define visual multiple choice questions with feedback explanations.

### D. How to Add a New Tribal Language (e.g., Kurukh or Khortha)
1. Open `src/data/languages.ts`.
2. Add an entry into `LANGUAGES`:
   ```typescript
   kurukh: {
     id: 'kurukh',
     name: 'Kurukh (Oraon)',
     nativeName: 'कुड़ुख़',
     scriptName: 'Tolong Siki / Devanagari',
     fontClass: 'font-devanagari',
     scriptsAvailable: ['devanagari', 'roman'],
     defaultScript: 'devanagari',
     greetingText: 'गोहार! (Gohar!)',
     greetingTransliteration: 'Gohar! (Welcome in Kurukh)',
     themeColor: '#9333ea',
     status: 'active',
   }
   ```
3. Add corresponding entries under `chapter.languages['kurukh']`. That's it!

---

## 4. Short Guide for Teachers & Resource Persons

1. **Access Teacher Panel**: Click the **Teacher** button in the top navigation bar.
2. **Audit & Review**:
   - Filter by your assigned language (Santali, Ho, or Mundari).
   - Review AI draft translations against the official JCERT textbook.
   - Click **Edit Script / Notes** to refine spelling or dialectal phrasing.
   - Click **Approve Final** to certify the translation.
3. **Student Feedback Queue**:
   - View flagged reports submitted by students or parents in rural classrooms.
   - Address disputed words and mark issues as resolved.
4. **Export Approved Dataset**:
   - Click **Export Dataset** to download a unified JSON dataset.
   - This dataset can be provided directly to **AI4Bharat**, **Bhashini**, or State Education teams to train better foundational translation models for Jharkhand's indigenous languages.

---

## 5. Child Safety & Privacy

- No third-party advertisements or trackers.
- Localized offline storage: Progress and stars remain on the child's device.
- AI Chatbot "Chotu" has safety guardrails and strictly adheres to primary education topics.

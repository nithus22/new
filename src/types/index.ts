export type LanguageId = 'santali' | 'ho' | 'mundari' | 'kurukh' | 'khortha';

export type ScriptMode = 'olchiki' | 'warangchiti' | 'devanagari' | 'roman' | 'mundaribani';

export type BridgeMode = 'mother-tongue' | 'hindi' | 'english' | 'bilingual';

export type ReviewStatus = 'approved' | 'teacher-reviewed' | 'ai-draft';

export interface LanguageConfig {
  id: LanguageId;
  name: string;
  nativeName: string;
  alternateNative?: string;
  scriptName: string;
  fontClass: string;
  scriptsAvailable: ScriptMode[];
  defaultScript: ScriptMode;
  greetingText: string;
  greetingTransliteration: string;
  audioGreetingPhonetic: string;
  themeColor: string;
  bgColor: string;
  iconEmoji: string;
  description: string;
  status: 'active' | 'preview';
}

export interface ChapterTranslation {
  title: string;
  scriptText: string;
  transliteration: string; // Roman or Devanagari transliteration
  alternateTransliteration?: string; // For Ho: Devanagari transliteration
  audioFile?: string;
  audioNarrationText?: string;
  videoLink?: string;
  reviewStatus: ReviewStatus;
  lastReviewedBy?: string;
  reviewNotes?: string;
  lessonSlides: LessonSlide[];
  gameData?: ChapterGameData;
}

export interface LessonSlide {
  id: string;
  conceptKey: string;
  native: string;
  transliteration: string;
  alternateTransliteration?: string;
  hindi: string;
  english: string;
  audioPhonetic: string;
  sceneType: 'inside_outside' | 'big_small' | 'top_bottom' | 'near_far' | 'rolling_sliding' | 'general';
  visualHint: string;
  keywords: Array<{
    native: string;
    transliteration: string;
    hindi: string;
    english: string;
  }>;
}

export interface DragItem {
  id: string;
  name: {
    native: string;
    transliteration: string;
    hindi: string;
    english: string;
  };
  emoji: string;
  correctZone: 'inside' | 'outside' | 'big' | 'small' | 'top' | 'bottom' | 'rolling' | 'sliding' | 'living' | 'nonliving' | 'home' | 'school' | (string & {});
}

export interface ChapterGameData {
  dragDrop?: {
    instruction: {
      native: string;
      transliteration: string;
      hindi: string;
      english: string;
    };
    zones: Array<{
      id: string;
      label: {
        native: string;
        transliteration: string;
        hindi: string;
        english: string;
      };
      color: string;
    }>;
    items: DragItem[];
  };
  matching?: {
    instruction: {
      native: string;
      transliteration: string;
      hindi: string;
      english: string;
    };
    pairs: Array<{
      id: string;
      emoji: string;
      nativeWord: string;
      transliteration: string;
      hindiWord: string;
    }>;
  };
  counting?: {
    instruction: {
      native: string;
      transliteration: string;
      hindi: string;
      english: string;
    };
    items: Array<{
      id: string;
      emoji: string;
      name: string;
      count: number;
    }>;
  };
  tracing?: {
    letter: string;
    letterName: string;
    script: ScriptMode;
    sound: string;
    strokeGuide: string;
  };
  quiz?: Array<{
    id: string;
    question: {
      native: string;
      transliteration: string;
      hindi: string;
      english: string;
    };
    options: Array<{
      id: string;
      text: string;
      emoji?: string;
      isCorrect: boolean;
    }>;
    explanation: string;
  }>;
}

export interface ChapterTextbookInfo {
  bookTitle: string;
  bookSeries: string;
  chapterNumber: number;
  chapterTitleHindi: string;
  chapterTitleEnglish: string;
  pageRange: string;
  officialPortalUrl: string;
  officialPdfUrl: string;
  publisher: string;
  readingPassageHindi: string;
  readingPassageEnglish?: string;
  keyVocabulary: Array<{
    word: string;
    meaningHindi: string;
    meaningEnglish: string;
    santaliWord: string;
    hoWord: string;
    mundariWord: string;
  }>;
  textbookExercises: Array<{
    question: string;
    type: 'activity' | 'short' | 'fill';
    hint: string;
  }>;
  learningOutcomes: string[];
}

export interface Chapter {
  id: string;
  chapterNumber: number;
  classNumber: number; // 1 to 5
  subjectId: 'maths' | 'hindi' | 'evs' | 'english';
  bookName: string;
  originalTitleHindi: string;
  originalTitleEnglish: string;
  coverEmoji: string;
  textbook?: ChapterTextbookInfo;
  languages: {
    santali: ChapterTranslation;
    ho: ChapterTranslation;
    mundari: ChapterTranslation;
    [key: string]: ChapterTranslation;
  };
}

export interface UserProgress {
  selectedLanguage: LanguageId;
  activeScript: ScriptMode;
  selectedClass: number;
  starsEarned: number;
  completedChapters: string[]; // chapter ids
  unlockedStickers: string[]; // sticker ids
  soundEnabled: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  speechRate: number;
}

export interface TranslationFeedback {
  id: string;
  chapterId: string;
  chapterTitle: string;
  language: LanguageId;
  problemType: 'spelling' | 'wrong_word' | 'script_display' | 'audio_missing' | 'other';
  suggestedCorrection: string;
  reporterRole: 'student' | 'teacher' | 'parent';
  timestamp: string;
  status: 'pending' | 'resolved';
}

export interface Sticker {
  id: string;
  name: string;
  nativeNames: Record<LanguageId, string>;
  category: 'animals' | 'nature' | 'tribal_culture' | 'stars';
  emoji: string;
  description: string;
  unlockedAtStars: number;
}

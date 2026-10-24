import { Chapter } from '../types';
import { CLASS_1_CURRICULUM } from './curriculumClass1';
import { CLASS_2_CURRICULUM } from './curriculumClass2';
import { CLASS_3_CURRICULUM } from './curriculumClass3';
import { CLASS_4_CURRICULUM } from './curriculumClass4';
import { CLASS_5_CURRICULUM } from './curriculumClass5';
import { enrichCurriculumWithTextbooks } from '../utils/textbookData';

/**
 * Official Jharkhand Council of Educational Research and Training (JCERT) Curriculum
 * for Primary Schools (Classes 1 to 5).
 * Textbooks strictly aligned with: https://jcert.jharkhand.gov.in/home/textbook
 *
 * Subject mapping:
 * - Mathematics: रोचक गणित (Classes 1 to 5)
 * - Hindi: झिलमिल (Classes 1 & 2), भाषांजलि (Classes 3, 4 & 5)
 * - English: Sunrise (Classes 1 & 2), Sunshine (Classes 3, 4 & 5)
 * - Environmental Studies (EVS): हमारी दुनिया / हमारा परिवेश (Classes 3, 4 & 5)
 */
export const INITIAL_CURRICULUM: Chapter[] = enrichCurriculumWithTextbooks([
  ...CLASS_1_CURRICULUM,
  ...CLASS_2_CURRICULUM,
  ...CLASS_3_CURRICULUM,
  ...CLASS_4_CURRICULUM,
  ...CLASS_5_CURRICULUM,
]);

export const SUBJECTS = [
  {
    id: 'maths',
    name: 'Mathematics',
    hindiName: 'गणित (रोचक गणित)',
    emoji: '📐',
    bgColor: 'bg-emerald-500',
    color: '#10b981',
    description: 'Official JCERT Textbook: रोचक गणित (Classes 1 to 5)',
  },
  {
    id: 'hindi',
    name: 'Hindi',
    hindiName: 'हिंदी (झिलमिल / भाषांजलि)',
    emoji: '📖',
    bgColor: 'bg-amber-500',
    color: '#f59e0b',
    description: 'Official JCERT: झिलमिल (Class 1-2) • भाषांजलि (Class 3-5)',
  },
  {
    id: 'english',
    name: 'English',
    hindiName: 'अंग्रेजी (Sunrise / Sunshine)',
    emoji: '✨',
    bgColor: 'bg-purple-500',
    color: '#a855f7',
    description: 'Official JCERT: Sunrise (Class 1-2) • Sunshine (Class 3-5)',
  },
  {
    id: 'evs',
    name: 'EVS (हमारी दुनिया)',
    hindiName: 'पर्यावरण (हमारी दुनिया / हमारा परिवेश)',
    emoji: '🌳',
    bgColor: 'bg-sky-500',
    color: '#0ea5e9',
    description: 'Official JCERT: हमारी दुनिया (Classes 3, 4, 5)',
  },
] as const;

export interface SubjectCardInfo {
  id: 'maths' | 'hindi' | 'english' | 'evs';
  name: string;
  hindiName: string;
  bookTitle: string;
  emoji: string;
  bgColor: string;
  color: string;
  description: string;
  chapterCount: number;
}

export function getSubjectsForClass(classNumber: number): SubjectCardInfo[] {
  if (classNumber <= 2) {
    return [
      {
        id: 'maths',
        name: 'Mathematics',
        hindiName: `गणित (रोचक गणित - ${classNumber})`,
        bookTitle: `रोचक गणित - ${classNumber}`,
        emoji: '📐',
        bgColor: 'bg-emerald-500',
        color: '#10b981',
        description: `Official JCERT Textbook: रोचक गणित - ${classNumber}`,
        chapterCount: classNumber === 1 ? 13 : 15,
      },
      {
        id: 'hindi',
        name: 'Hindi',
        hindiName: `हिंदी (झिलमिल - ${classNumber})`,
        bookTitle: `झिलमिल - ${classNumber}`,
        emoji: '📖',
        bgColor: 'bg-amber-500',
        color: '#f59e0b',
        description: `Official JCERT Textbook: झिलमिल - ${classNumber}`,
        chapterCount: classNumber === 1 ? 10 : 12,
      },
      {
        id: 'english',
        name: 'English',
        hindiName: `अंग्रेजी (Sunrise - ${classNumber})`,
        bookTitle: `Sunrise - ${classNumber}`,
        emoji: '✨',
        bgColor: 'bg-purple-500',
        color: '#a855f7',
        description: `Official JCERT Textbook: Sunrise - ${classNumber}`,
        chapterCount: 11,
      },
    ];
  } else {
    const evsPart = classNumber - 2; // Class 3 -> Part 1, Class 4 -> Part 2, Class 5 -> Part 3
    return [
      {
        id: 'maths',
        name: 'Mathematics',
        hindiName: `गणित (रोचक गणित - ${classNumber})`,
        bookTitle: `रोचक गणित - ${classNumber}`,
        emoji: '📐',
        bgColor: 'bg-emerald-500',
        color: '#10b981',
        description: `Official JCERT Textbook: रोचक गणित - ${classNumber}`,
        chapterCount: classNumber === 4 ? 13 : 12,
      },
      {
        id: 'hindi',
        name: 'Hindi',
        hindiName: `हिंदी (भाषांजलि - ${classNumber})`,
        bookTitle: `भाषांजलि - ${classNumber}`,
        emoji: '📖',
        bgColor: 'bg-amber-500',
        color: '#f59e0b',
        description: `Official JCERT Textbook: भाषांजलि - ${classNumber}`,
        chapterCount: classNumber === 3 ? 16 : classNumber === 4 ? 13 : 20,
      },
      {
        id: 'english',
        name: 'English',
        hindiName: `अंग्रेजी (Sunshine - ${classNumber})`,
        bookTitle: `Sunshine - ${classNumber}`,
        emoji: '✨',
        bgColor: 'bg-purple-500',
        color: '#a855f7',
        description: `Official JCERT Textbook: Sunshine - ${classNumber}`,
        chapterCount: 10,
      },
      {
        id: 'evs',
        name: 'EVS (हमारी दुनिया)',
        hindiName: `पर्यावरण (हमारी दुनिया - ${evsPart})`,
        bookTitle: `हमारी दुनिया - ${evsPart}`,
        emoji: '🌳',
        bgColor: 'bg-sky-500',
        color: '#0ea5e9',
        description: `Official JCERT Textbook: हमारी दुनिया - ${evsPart} (हमारा परिवेश)`,
        chapterCount: classNumber === 5 ? 12 : 10,
      },
    ];
  }
}

export const CLASSES = [
  { classNumber: 1, animal: 'Elephant (ᱦᱟᱹᱛᱤ / हाथी / हाती)', animalEmoji: '🐘', color: 'bg-emerald-500', label: 'Class 1 / ᱯᱩᱭᱞᱩ ᱪᱟᱱᱟᱪ' },
  { classNumber: 2, animal: 'Deer (ᱡᱤᱞ / हिरण / जिल)', animalEmoji: '🦌', color: 'bg-amber-500', label: 'Class 2 / ᱫᱚᱥᱟᱨ ᱪᱟᱱᱟᱪ' },
  { classNumber: 3, animal: 'Peacock (ᱢᱟᱨᱟᱜ / मोर / माराः)', animalEmoji: '🦚', color: 'bg-sky-500', label: 'Class 3 / ᱛᱮᱥᱟᱨ ᱪᱟᱱᱟᱪ' },
  { classNumber: 4, animal: 'Tiger (ᱛᱟᱹᱨᱩᱵ / बाघ / कुल)', animalEmoji: '🐅', color: 'bg-orange-500', label: 'Class 4 / ᱯᱩᱱᱟᱜ ᱪᱟᱱᱟᱪ' },
  { classNumber: 5, animal: 'Rhino / Bull (ᱠᱟᱰᱟ / गैंडा)', animalEmoji: '🦏', color: 'bg-purple-500', label: 'Class 5 / ᱢᱚᱬᱮᱭᱟᱜ ᱪᱟᱱᱟᱪ' },
];

export const STICKERS = [
  {
    id: 'stk-chotu',
    name: 'Chotu the Forest Deer',
    nativeNames: {
      santali: 'ᱪᱷᱳᱴᱩ ᱡᱤᱞ',
      ho: '𑢎𑣂𑣡 𑢏𑣉𑣕𑣃',
      mundari: 'छोटू जिल',
      kurukh: 'छोटू',
      khortha: 'छोटू हिरण',
    },
    category: 'animals',
    emoji: '🦌',
    description: 'Friendly companion guide across Jharkhand forests!',
    unlockedAtStars: 1,
  },
  {
    id: 'stk-sal-tree',
    name: 'Sacred Sal Tree (Sarjom)',
    nativeNames: {
      santali: 'ᱥᱟᱨᱡᱚᱢ ᱫᱟᱨᱮ',
      ho: '𑢡𑣂𑣜𑣃 𑢷𑣜𑣎𑣉𑣭',
      mundari: 'सरजोम दारू',
      kurukh: 'सरजोम मन',
      khortha: 'सखुआ गाछ',
    },
    category: 'nature',
    emoji: '🌳',
    description: 'The state tree of Jharkhand, home of Baha parab festivals.',
    unlockedAtStars: 3,
  },
  {
    id: 'stk-madal',
    name: 'Mandar / Madal Drum',
    nativeNames: {
      santali: 'ᱴᱟᱢᱟᱠ-ᱛᱩᱢᱫᱟᱜ',
      ho: '𑢡𑣃𑣭𑣡𑣁 𑢡𑣂𑣌𑣁',
      mundari: 'मांदर-रुतु',
      kurukh: 'मांदर',
      khortha: 'मांदर',
    },
    category: 'tribal_culture',
    emoji: '🪘',
    description: 'Traditional earthen drum played during Karam and Sarhul dances.',
    unlockedAtStars: 5,
  },
  {
    id: 'stk-bow',
    name: 'Birsa Archer Bow (Aar-Sar)',
    nativeNames: {
      santali: 'ᱟᱜ-ᱥᱟᱨ',
      ho: '𑢠𑣁𑣀-𑢷𑣁𑣜',
      mundari: 'आ-सार',
      kurukh: 'कार्बो-सार',
      khortha: 'धनुष-तीर',
    },
    category: 'tribal_culture',
    emoji: '🏹',
    description: 'Symbol of courage and nature guardianship of Bhagwan Birsa Munda.',
    unlockedAtStars: 8,
  },
  {
    id: 'stk-peacock',
    name: 'Sohrai Peacock',
    nativeNames: {
      santali: 'ᱢᱟᱨᱟᱜ',
      ho: '𑢭𑣁𑣜𑣁𑣊 𑢏𑣂𑣝𑣉𑣀',
      mundari: 'माराः चेंदो',
      kurukh: 'मजरा',
      khortha: 'मोर',
    },
    category: 'animals',
    emoji: '🦚',
    description: 'Celebrated in Hazaribagh Sohrai and Khovar mural arts.',
    unlockedAtStars: 10,
  },
];

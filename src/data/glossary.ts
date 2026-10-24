import { LanguageId } from '../types';

export interface GlossaryTerm {
  id: string;
  category: 'shapes' | 'numbers' | 'classroom' | 'nature' | 'relations' | 'actions';
  hindi: string;
  english: string;
  santali: {
    olchiki: string;
    roman: string;
    audioHint: string;
  };
  ho: {
    warangchiti: string;
    devanagari: string;
    roman: string;
    audioHint: string;
  };
  mundari: {
    devanagari: string;
    mundaribani?: string;
    roman: string;
    audioHint: string;
  };
}

export const SCHOOL_GLOSSARY: GlossaryTerm[] = [
  // Shapes & Spatial Terms (Class 1 Maths Ch 1)
  {
    id: 'inside',
    category: 'shapes',
    hindi: 'अंदर',
    english: 'Inside',
    santali: {
      olchiki: 'ᱵᱷᱤᱛᱨᱤ',
      roman: 'Bhitri',
      audioHint: 'Bhitri',
    },
    ho: {
      warangchiti: '𑢹𑣗𑣕𑣜𑣂',
      devanagari: 'भितरी',
      roman: 'Bhitari',
      audioHint: 'Bhitari',
    },
    mundari: {
      devanagari: 'भितिर',
      roman: 'Bhitir',
      audioHint: 'Bhitir',
    },
  },
  {
    id: 'outside',
    category: 'shapes',
    hindi: 'बाहर',
    english: 'Outside',
    santali: {
      olchiki: 'ᱵᱟᱦᱨᱮ',
      roman: 'Bahre',
      audioHint: 'Bahre',
    },
    ho: {
      warangchiti: '𑢪𑣁𑣜𑣁',
      devanagari: 'बारा',
      roman: 'Bara / Bahre',
      audioHint: 'Bara',
    },
    mundari: {
      devanagari: 'बाहरे',
      roman: 'Bahre',
      audioHint: 'Bahre',
    },
  },
  {
    id: 'bigger',
    category: 'shapes',
    hindi: 'बड़ा',
    english: 'Bigger',
    santali: {
      olchiki: 'ᱢᱟᱨᱟᱝ',
      roman: 'Marang',
      audioHint: 'Marang',
    },
    ho: {
      warangchiti: '𑢭𑣁𑣜𑣁𑣊',
      devanagari: 'मरांग',
      roman: 'Marang',
      audioHint: 'Marang',
    },
    mundari: {
      devanagari: 'मरांग',
      roman: 'Marang',
      audioHint: 'Marang',
    },
  },
  {
    id: 'smaller',
    category: 'shapes',
    hindi: 'छोटा',
    english: 'Smaller',
    santali: {
      olchiki: 'ᱠᱟᱹᱴᱤᱡ',
      roman: 'Katij',
      audioHint: 'Katij',
    },
    ho: {
      warangchiti: '𑢹𑣃𑣑𑣂𑣊',
      devanagari: 'हुडिंग',
      roman: 'Huding',
      audioHint: 'Huding',
    },
    mundari: {
      devanagari: 'हुडिंग',
      roman: 'Huding',
      audioHint: 'Huding',
    },
  },
  {
    id: 'top',
    category: 'shapes',
    hindi: 'ऊपर',
    english: 'Top / Above',
    santali: {
      olchiki: 'ᱪᱮᱛᱟᱱ',
      roman: 'Chetan',
      audioHint: 'Chetan',
    },
    ho: {
      warangchiti: '𑢏𑣂𑣕𑣁𑣝',
      devanagari: 'चेतान',
      roman: 'Chetan',
      audioHint: 'Chetan',
    },
    mundari: {
      devanagari: 'चेतान',
      roman: 'Chetan',
      audioHint: 'Chetan',
    },
  },
  {
    id: 'bottom',
    category: 'shapes',
    hindi: 'नीचे',
    english: 'Bottom / Below',
    santali: {
      olchiki: 'ᱞᱟᱛᱟᱨ',
      roman: 'Latar',
      audioHint: 'Latar',
    },
    ho: {
      warangchiti: '𑢡𑣁𑣕𑣁𑣜',
      devanagari: 'लातार',
      roman: 'Latar',
      audioHint: 'Latar',
    },
    mundari: {
      devanagari: 'लातार',
      roman: 'Latar',
      audioHint: 'Latar',
    },
  },
  {
    id: 'near',
    category: 'shapes',
    hindi: 'पास',
    english: 'Near',
    santali: {
      olchiki: 'ᱥᱩᱨ',
      roman: 'Sur',
      audioHint: 'Sur',
    },
    ho: {
      warangchiti: '𑢷𑣃𑣜',
      devanagari: 'सुर',
      roman: 'Sur',
      audioHint: 'Sur',
    },
    mundari: {
      devanagari: 'सुर',
      roman: 'Sur',
      audioHint: 'Sur',
    },
  },
  {
    id: 'far',
    category: 'shapes',
    hindi: 'दूर',
    english: 'Far',
    santali: {
      olchiki: 'ᱥᱟᱺᱜᱤᱧ',
      roman: 'Sangin',
      audioHint: 'Sangin',
    },
    ho: {
      warangchiti: '𑢷𑣁𑣊𑣂𑣝',
      devanagari: 'सांगिन',
      roman: 'Sangin',
      audioHint: 'Sangin',
    },
    mundari: {
      devanagari: 'सांगिन',
      roman: 'Sangin',
      audioHint: 'Sangin',
    },
  },
  {
    id: 'rolling',
    category: 'shapes',
    hindi: 'लुढ़कना',
    english: 'Rolling',
    santali: {
      olchiki: 'ᱜᱩᱰᱨᱟᱹᱣ',
      roman: 'Gudrau',
      audioHint: 'Gudrau',
    },
    ho: {
      warangchiti: '𑢞𑣃𑣑𑣃𑣜',
      devanagari: 'गुडुर',
      roman: 'Gudur',
      audioHint: 'Gudur',
    },
    mundari: {
      devanagari: 'गुलगुल',
      roman: 'Gulgul',
      audioHint: 'Gulgul',
    },
  },
  {
    id: 'sliding',
    category: 'shapes',
    hindi: 'खिसकना',
    english: 'Sliding',
    santali: {
      olchiki: 'ᱥᱤᱫᱩᱲ',
      roman: 'Sidur / Sarse',
      audioHint: 'Sidur',
    },
    ho: {
      warangchiti: '𑢷𑣂𑣜𑣞𑣁',
      devanagari: 'सिरसा',
      roman: 'Sirsa',
      audioHint: 'Sirsa',
    },
    mundari: {
      devanagari: 'रेंगड़ा',
      roman: 'Rengda',
      audioHint: 'Rengda',
    },
  },
  // Numbers (1 to 5)
  {
    id: 'one',
    category: 'numbers',
    hindi: 'एक',
    english: 'One (1)',
    santali: {
      olchiki: 'ᱢᱤᱫ',
      roman: 'Mit',
      audioHint: 'Mit',
    },
    ho: {
      warangchiti: '𑢭𑣂𑣁',
      devanagari: 'मियाद',
      roman: 'Miyad',
      audioHint: 'Miyad',
    },
    mundari: {
      devanagari: 'मियाद',
      roman: 'Miyad',
      audioHint: 'Miyad',
    },
  },
  {
    id: 'two',
    category: 'numbers',
    hindi: 'दो',
    english: 'Two (2)',
    santali: {
      olchiki: 'ᱵᱟᱨ',
      roman: 'Bar',
      audioHint: 'Bar',
    },
    ho: {
      warangchiti: '𑢪𑣁𑣜𑣂𑣁',
      devanagari: 'बारिया',
      roman: 'Bariya',
      audioHint: 'Bariya',
    },
    mundari: {
      devanagari: 'बारिया',
      roman: 'Bariya',
      audioHint: 'Bariya',
    },
  },
  {
    id: 'three',
    category: 'numbers',
    hindi: 'तीन',
    english: 'Three (3)',
    santali: {
      olchiki: 'ᱯᱮ',
      roman: 'Pe',
      audioHint: 'Pe',
    },
    ho: {
      warangchiti: '𑢠𑣂𑣁',
      devanagari: 'अपिया',
      roman: 'Apiya',
      audioHint: 'Apiya',
    },
    mundari: {
      devanagari: 'अपिया',
      roman: 'Apiya',
      audioHint: 'Apiya',
    },
  },
  {
    id: 'four',
    category: 'numbers',
    hindi: 'चार',
    english: 'Four (4)',
    santali: {
      olchiki: 'ᱯᱳᱱ',
      roman: 'Pon',
      audioHint: 'Pon',
    },
    ho: {
      warangchiti: '𑢡𑣃𑣅𑣂𑣁',
      devanagari: 'उपुनिया',
      roman: 'Upuniya',
      audioHint: 'Upuniya',
    },
    mundari: {
      devanagari: 'उपुनिया',
      roman: 'Upuniya',
      audioHint: 'Upuniya',
    },
  },
  {
    id: 'five',
    category: 'numbers',
    hindi: 'पाँच',
    english: 'Five (5)',
    santali: {
      olchiki: 'ᱢᱚᱬᱮ',
      roman: 'More',
      audioHint: 'More',
    },
    ho: {
      warangchiti: '𑢭𑣉𑣎𑣂𑣁',
      devanagari: 'मोड़ेया',
      roman: 'Modeya',
      audioHint: 'Modeya',
    },
    mundari: {
      devanagari: 'मोड़ेया',
      roman: 'Modeya',
      audioHint: 'Modeya',
    },
  },
  // Forest & Animals (Jharkhand Nature)
  {
    id: 'tree',
    category: 'nature',
    hindi: 'पेड़ / साल वृक्ष',
    english: 'Tree / Sal Tree',
    santali: {
      olchiki: 'ᱫᱟᱨᱮ',
      roman: 'Dare (Sarjom dare)',
      audioHint: 'Dare',
    },
    ho: {
      warangchiti: '𑢡𑣂𑣜𑣃',
      devanagari: 'दारू (सरजोम दारू)',
      roman: 'Daru',
      audioHint: 'Daru',
    },
    mundari: {
      devanagari: 'दारू',
      roman: 'Daru',
      audioHint: 'Daru',
    },
  },
  {
    id: 'deer',
    category: 'nature',
    hindi: 'हिरण (छोटू)',
    english: 'Deer (Chotu)',
    santali: {
      olchiki: 'ᱡᱤᱞ',
      roman: 'Jil (Hiran)',
      audioHint: 'Jil',
    },
    ho: {
      warangchiti: '𑢎𑣂𑣡',
      devanagari: 'जिल',
      roman: 'Jil',
      audioHint: 'Jil',
    },
    mundari: {
      devanagari: 'जिल',
      roman: 'Jil',
      audioHint: 'Jil',
    },
  },
  {
    id: 'elephant',
    category: 'nature',
    hindi: 'हाथी',
    english: 'Elephant',
    santali: {
      olchiki: 'ᱦᱟᱹᱛᱤ',
      roman: 'Hati',
      audioHint: 'Hati',
    },
    ho: {
      warangchiti: '𑢹𑣁𑣕𑣂',
      devanagari: 'हाती',
      roman: 'Hati',
      audioHint: 'Hati',
    },
    mundari: {
      devanagari: 'हाती',
      roman: 'Hati',
      audioHint: 'Hati',
    },
  },
  {
    id: 'water',
    category: 'nature',
    hindi: 'पानी',
    english: 'Water',
    santali: {
      olchiki: 'ᱫᱟᱜ',
      roman: 'Dah (Dag)',
      audioHint: 'Dag',
    },
    ho: {
      warangchiti: '𑢡𑣁𑣀',
      devanagari: 'दाः',
      roman: 'Da:',
      audioHint: 'Dah',
    },
    mundari: {
      devanagari: 'दाः',
      roman: 'Da:',
      audioHint: 'Dah',
    },
  },
];

export function lookupTerm(wordOrId: string, lang: LanguageId) {
  const term = SCHOOL_GLOSSARY.find(
    t => t.id === wordOrId || t.hindi.toLowerCase().includes(wordOrId.toLowerCase()) || t.english.toLowerCase() === wordOrId.toLowerCase()
  );
  if (!term) return null;
  if (lang === 'santali') return term.santali;
  if (lang === 'ho') return term.ho;
  if (lang === 'mundari') return term.mundari;
  return null;
}

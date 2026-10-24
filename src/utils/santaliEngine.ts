/**
 * Core Santali Linguistic, Translation Validation, Intent Classification,
 * Transliteration, and Script Conversion Engine.
 *
 * Designed to enforce strict separation between:
 * 1. Translation (meaning preservation across languages)
 * 2. Transliteration (pronunciation representation in Roman Latin)
 * 3. Script conversion (converting Santali writing between Ol Chiki, Roman, and Devanagari)
 */

import { SCHOOL_GLOSSARY } from '../data/glossary';

export type CommunicationLang = 'english' | 'hindi' | 'santali';
export type SantaliScript = 'olchiki' | 'roman' | 'devanagari';

export type UserCommunicativeIntent =
  | 'translation'
  | 'incoming_translation'
  | 'two_way_communication'
  | 'audio_request'
  | 'general_assistant';

export type VerificationStatus =
  | 'verified_phrasebook'
  | 'verified_template'
  | 'unverified_ai'
  | 'validation_failed'
  | 'unavailable';

export interface VerifiedVocabularyItem {
  santaliOlChiki: string;
  santaliRoman: string;
  english: string;
  hindi: string;
}

export interface VerifiedPhraseEntry {
  id: string;
  category:
    | 'greeting'
    | 'introduction'
    | 'directions'
    | 'shopping'
    | 'help'
    | 'medical'
    | 'needs'
    | 'polite'
    | 'conversation'
    | 'numbers'
    | 'school';
  english: string;
  englishVariants: string[];
  hindi: string;
  hindiVariants: string[];
  santaliOlChiki: string;
  santaliRoman: string;
  santaliDevanagari: string;
  backTranslationEnglish: string;
  backTranslationHindi: string;
  isUrgentOrMedical?: boolean;
}

export interface IntentClassificationResult {
  intent: UserCommunicativeIntent;
  rawInput: string;
  extractedUtterance: string;
  sourceLang: CommunicationLang;
  targetLang: CommunicationLang;
  detectedScript: 'olchiki' | 'devanagari' | 'roman';
  isUrgentOrMedical: boolean;
  explanationPrefix?: string;
}

export interface ValidationOutcome {
  isValid: boolean;
  verificationStatus: VerificationStatus;
  rejectionReasons: string[];
  warnings: string[];
  cleanedOlChiki: string;
  cleanedRoman: string;
  cleanedDevanagari: string;
  preservedNumbers: boolean;
  preservedNegation: boolean;
  preservedProperNouns: boolean;
}

// ---------------------------------------------------------------------------
// 1. Authoritative Verified Santali Reference Corpus
// ---------------------------------------------------------------------------
export const VERIFIED_PHRASE_CORPUS: VerifiedPhraseEntry[] = [
  // --- Greetings & Introductions ---
  {
    id: 'greet-hello',
    category: 'greeting',
    english: 'Hello / Greetings',
    englishVariants: ['hello', 'hi', 'greetings', 'johar', 'namaste', 'hello friend'],
    hindi: 'नमस्ते / जोहार',
    hindiVariants: ['नमस्ते', 'जोहार', 'प्रणाम', 'हेलो'],
    santaliOlChiki: 'ᱡᱚᱦᱟᱨ',
    santaliRoman: 'Johar',
    santaliDevanagari: 'जोहार',
    backTranslationEnglish: 'Hello / Greetings (Johar)',
    backTranslationHindi: 'नमस्ते / जोहार',
  },
  {
    id: 'greet-morning',
    category: 'greeting',
    english: 'Good morning',
    englishVariants: ['good morning', 'morning greetings'],
    hindi: 'सुप्रभात / शुभ प्रभात',
    hindiVariants: ['सुप्रभात', 'शुभ प्रभात'],
    santaliOlChiki: 'ᱥᱮᱛᱟᱜ ᱡᱚᱦᱟᱨ',
    santaliRoman: 'Setag Johar',
    santaliDevanagari: 'सेताग जोहार',
    backTranslationEnglish: 'Good morning (Morning greetings)',
    backTranslationHindi: 'सुप्रभात (सुबह का जोहार)',
  },
  {
    id: 'greet-evening',
    category: 'greeting',
    english: 'Good evening',
    englishVariants: ['good evening'],
    hindi: 'शुभ संध्या',
    hindiVariants: ['शुभ संध्या'],
    santaliOlChiki: 'ᱟᱹᱭᱩᱵ ᱡᱚᱦᱟᱨ',
    santaliRoman: 'Ayub Johar',
    santaliDevanagari: 'आयुब जोहार',
    backTranslationEnglish: 'Good evening',
    backTranslationHindi: 'शुभ संध्या',
  },
  {
    id: 'greet-night',
    category: 'greeting',
    english: 'Good night',
    englishVariants: ['good night'],
    hindi: 'शुभ रात्रि',
    hindiVariants: ['शुभ रात्रि', 'शुभरात्रि'],
    santaliOlChiki: 'ᱧᱤᱫᱟᱹ ᱡᱚᱦᱟᱨ',
    santaliRoman: 'Nyida Johar',
    santaliDevanagari: 'ञिदा जोहार',
    backTranslationEnglish: 'Good night',
    backTranslationHindi: 'शुभ रात्रि',
  },
  {
    id: 'greet-how-are-you',
    category: 'greeting',
    english: 'How are you?',
    englishVariants: [
      'how are you',
      'how are you doing',
      'ask them how they are',
      'please ask them how they are',
    ],
    hindi: 'आप कैसे हैं?',
    hindiVariants: ['आप कैसे हैं', 'तुम कैसे हो', 'आप कैसे हो'],
    santaliOlChiki: 'ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱢᱟ?',
    santaliRoman: 'Chet leka menama?',
    santaliDevanagari: 'चेद लेका मेनामा?',
    backTranslationEnglish: 'How are you?',
    backTranslationHindi: 'आप कैसे हैं?',
  },
  {
    id: 'greet-i-am-fine',
    category: 'greeting',
    english: 'I am fine.',
    englishVariants: ['i am fine', 'i am doing well', 'i am good', 'tell them i am fine'],
    hindi: 'मैं ठीक हूँ।',
    hindiVariants: ['मैं ठीक हूँ', 'मैं ठीक हूं', 'मैं अच्छा हूँ'],
    santaliOlChiki: 'ᱤᱧ ᱵᱮᱥ ᱜᱮ ᱢᱮᱱᱟᱹᱧᱟ᱾',
    santaliRoman: 'Ing bes ge menanya.',
    santaliDevanagari: 'इञ बेस गे मेनाञा।',
    backTranslationEnglish: 'I am fine.',
    backTranslationHindi: 'मैं ठीक हूँ।',
  },
  {
    id: 'intro-what-is-your-name',
    category: 'introduction',
    english: 'What is your name?',
    englishVariants: [
      'what is your name',
      'ask them what their name is',
      'please ask them their name',
      'may i know your name',
    ],
    hindi: 'आपका नाम क्या है?',
    hindiVariants: ['आपका नाम क्या है', 'तुम्हारा नाम क्या है', 'उनसे पूछो उनका नाम क्या है'],
    santaliOlChiki: 'ᱟᱢᱟᱜ ᱧᱩᱛᱩᱢ ᱫᱚ ᱪᱮᱫ?',
    santaliRoman: 'Amag nyutum do chet?',
    santaliDevanagari: 'आमाग ञुतुम दो चेद?',
    backTranslationEnglish: 'What is your name?',
    backTranslationHindi: 'आपका नाम क्या है?',
  },
  {
    id: 'intro-my-name-is-chotu',
    category: 'introduction',
    english: 'My name is Chotu.',
    englishVariants: ['my name is chotu'],
    hindi: 'मेरा नाम छोटू है।',
    hindiVariants: ['मेरा नाम छोटू है'],
    santaliOlChiki: 'ᱤᱧᱟᱜ ᱧᱩᱛᱩᱢ ᱫᱚ ᱪᱷᱳᱴᱩ ᱠᱟᱱᱟ᱾',
    santaliRoman: 'Inyag nyutum do Chhotu kana.',
    santaliDevanagari: 'इञाग ञुतुम दो छोटू काना।',
    backTranslationEnglish: 'My name is Chotu.',
    backTranslationHindi: 'मेरा नाम छोटू है।',
  },
  {
    id: 'intro-where-from',
    category: 'introduction',
    english: 'Where are you from?',
    englishVariants: ['where are you from', 'ask them where they are from', 'which village are you from'],
    hindi: 'आप कहाँ से हैं?',
    hindiVariants: ['आप कहाँ से हैं', 'तुम कहाँ से हो', 'आप किस गाँव से हैं'],
    santaliOlChiki: 'ᱟᱢ ᱫᱚ ᱚᱠᱟ ᱠᱷᱚᱱ ᱠᱟᱱᱟᱢ?',
    santaliRoman: 'Am do oka khon kanam?',
    santaliDevanagari: 'आम दो ओका खोन कानाम?',
    backTranslationEnglish: 'Where are you from?',
    backTranslationHindi: 'आप कहाँ से हैं?',
  },
  {
    id: 'intro-dont-know-santali',
    category: 'conversation',
    english: 'I do not know Santali.',
    englishVariants: [
      'i do not know santali',
      'i dont know santali',
      'i do not speak santali',
      'i dont speak santali',
      'tell them i do not know santali',
    ],
    hindi: 'मैं संताली नहीं जानता हूँ।',
    hindiVariants: ['मैं संताली नहीं जानता', 'मुझे संताली नहीं आती', 'मुझे संताली बोलना नहीं आता'],
    santaliOlChiki: 'ᱤᱧ ᱥᱟᱱᱛᱟᱲᱤ ᱵᱟᱹᱧ ᱵᱟᱰᱟᱭᱟ᱾',
    santaliRoman: 'Ing Santali bany badaya.',
    santaliDevanagari: 'इञ संताली बाञ बाडाया।',
    backTranslationEnglish: 'I do not know Santali.',
    backTranslationHindi: 'मैं संताली नहीं जानता हूँ।',
  },
  {
    id: 'conv-bridge-help',
    category: 'conversation',
    english: 'I know English, but I do not know Santali. Please help me talk with you.',
    englishVariants: [
      'i know english but i dont know santali',
      'i know english, but i dont know santali. help me talk to a santali-speaking person',
      'i know english but i do not know santali help me talk to a santali speaking person',
    ],
    hindi: 'मैं अंग्रेज़ी जानता हूँ, लेकिन संताली नहीं जानता। कृपया आपसे बात करने में मेरी मदद करें।',
    hindiVariants: ['मैं अंग्रेजी जानता हूँ लेकिन संताली नहीं जानता'],
    santaliOlChiki: 'ᱤᱧ ᱤᱝᱨᱟᱹᱡᱤ ᱵᱟᱰᱟᱭᱟ, ᱢᱮᱱᱠᱷᱟᱱ ᱥᱟᱱᱛᱟᱲᱤ ᱵᱟᱹᱧ ᱵᱟᱰᱟᱭᱟ᱾ ᱟᱢ ᱥᱟᱶ ᱨᱚᱯᱚᱲ ᱨᱮ ᱜᱚᱲᱚ ᱟᱹᱧ ᱢᱮ᱾',
    santaliRoman: 'Ing Ingraji badaya, menkhan Santali bany badaya. Am saw ropor re goro any me.',
    santaliDevanagari: 'इञ इंगराजी बाडाया, मेनखान संताली बाञ बाडाया। आम साव रोपोड़ रे गोड़ो आञ मे।',
    backTranslationEnglish: 'I know English, but I do not know Santali. Help me talk with you.',
    backTranslationHindi: 'मैं अंग्रेज़ी जानता हूँ, लेकिन संताली नहीं जानता। आपसे बात करने में मेरी मदद करें।',
  },

  // --- Directions & Locations ---
  {
    id: 'dir-bus-stand',
    category: 'directions',
    english: 'Where is the bus stand?',
    englishVariants: [
      'where is the bus stand',
      'please ask them where the bus stand is',
      'ask them where the bus stand is',
      'where is the bus stop',
      'can you tell me where the bus stand is',
    ],
    hindi: 'बस स्टैंड कहाँ है?',
    hindiVariants: [
      'बस स्टैंड कहाँ है',
      'बस अड्डा कहाँ है',
      'कृपया उनसे पूछें कि बस स्टैंड कहाँ है',
      'उनसे पूछो बस स्टैंड कहाँ है',
    ],
    santaliOlChiki: 'ᱵᱟᱥ ᱤᱥᱴᱮᱱᱰ ᱫᱚ ᱚᱠᱟ ᱨᱮ ᱢᱮᱱᱟᱜᱼᱟ?',
    santaliRoman: 'Bas istend do oka re menag-a?',
    santaliDevanagari: 'बास इस्टेंड दो ओका रे मेनाग-आ?',
    backTranslationEnglish: 'Where is the bus stand?',
    backTranslationHindi: 'बस स्टैंड कहाँ है?',
  },
  {
    id: 'dir-nearest-hospital',
    category: 'directions',
    english: 'Where is the nearest hospital?',
    englishVariants: [
      'where is the nearest hospital',
      'please ask them where the nearest hospital is',
      'ask them where the nearest hospital is',
      'where is the closest hospital',
    ],
    hindi: 'सबसे नज़दीकी अस्पताल कहाँ है?',
    hindiVariants: [
      'सबसे नजदीकी अस्पताल कहाँ है',
      'पास का अस्पताल कहाँ है',
      'कृपया पूछें कि सबसे नज़दीकी अस्पताल कहाँ है',
    ],
    santaliOlChiki: 'ᱥᱩᱨ ᱨᱮᱭᱟᱜ ᱦᱟᱥᱯᱟᱛᱟᱞ ᱫᱚ ᱚᱠᱟ ᱨᱮ ᱢᱮᱱᱟᱜᱼᱟ?',
    santaliRoman: 'Sur reyag haspatal do oka re menag-a?',
    santaliDevanagari: 'सुर रेयाग हास्पताल दो ओका रे मेनाग-आ?',
    backTranslationEnglish: 'Where is the nearby/nearest hospital?',
    backTranslationHindi: 'पास का अस्पताल कहाँ है?',
    isUrgentOrMedical: true,
  },
  {
    id: 'dir-hospital',
    category: 'directions',
    english: 'Where is the hospital?',
    englishVariants: [
      'where is the hospital',
      'ask them where the hospital is',
      'please ask them where the hospital is',
    ],
    hindi: 'अस्पताल कहाँ है?',
    hindiVariants: ['अस्पताल कहाँ है', 'हॉस्पिटल कहाँ है'],
    santaliOlChiki: 'ᱦᱟᱥᱯᱟᱛᱟᱞ ᱫᱚ ᱚᱠᱟ ᱨᱮ ᱢᱮᱱᱟᱜᱼᱟ?',
    santaliRoman: 'Haspatal do oka re menag-a?',
    santaliDevanagari: 'हास्पताल दो ओका रे मेनाग-आ?',
    backTranslationEnglish: 'Where is the hospital?',
    backTranslationHindi: 'अस्पताल कहाँ है?',
    isUrgentOrMedical: true,
  },
  {
    id: 'dir-railway-station',
    category: 'directions',
    english: 'Where is the railway station?',
    englishVariants: [
      'where is the railway station',
      'where is the train station',
      'ask them where the railway station is',
      'please ask them where the train station is',
    ],
    hindi: 'रेलवे स्टेशन कहाँ है?',
    hindiVariants: ['रेलवे स्टेशन कहाँ है', 'ट्रेन स्टेशन कहाँ है'],
    santaliOlChiki: 'ᱨᱮᱞ ᱤᱥᱴᱮᱥᱚᱱ ᱫᱚ ᱚᱠᱟ ᱨᱮ ᱢᱮᱱᱟᱜᱼᱟ?',
    santaliRoman: 'Rel isteson do oka re menag-a?',
    santaliDevanagari: 'रेल इस्टेसोन दो ओका रे मेनाग-आ?',
    backTranslationEnglish: 'Where is the railway station?',
    backTranslationHindi: 'रेलवे स्टेशन कहाँ है?',
  },
  {
    id: 'dir-market',
    category: 'directions',
    english: 'Where is the market?',
    englishVariants: [
      'where is the market',
      'ask them where the market is',
      'please ask them where the market is',
    ],
    hindi: 'बाज़ार कहाँ है?',
    hindiVariants: ['बाजार कहाँ है', 'बाज़ार कहाँ है', 'हाट कहाँ है'],
    santaliOlChiki: 'ᱵᱟᱡᱟᱨ ᱫᱚ ᱚᱠᱟ ᱨᱮ ᱢᱮᱱᱟᱜᱼᱟ?',
    santaliRoman: 'Bajar do oka re menag-a?',
    santaliDevanagari: 'बाजार दो ओका रे मेनाग-आ?',
    backTranslationEnglish: 'Where is the market?',
    backTranslationHindi: 'बाज़ार कहाँ है?',
  },
  {
    id: 'dir-school',
    category: 'directions',
    english: 'Where is the school?',
    englishVariants: [
      'where is the school',
      'ask them where the school is',
      'how do i get to the school',
    ],
    hindi: 'स्कूल कहाँ है?',
    hindiVariants: ['स्कूल कहाँ है', 'विद्यालय कहाँ है'],
    santaliOlChiki: 'ᱟᱥᱲᱟ ᱫᱚ ᱚᱠᱟ ᱨᱮ ᱢᱮᱱᱟᱜᱼᱟ?',
    santaliRoman: 'Asra do oka re menag-a?',
    santaliDevanagari: 'आसड़ा दो ओका रे मेनाग-आ?',
    backTranslationEnglish: 'Where is the school?',
    backTranslationHindi: 'स्कूल कहाँ है?',
  },
  {
    id: 'dir-where-going',
    category: 'directions',
    english: 'Where are you going?',
    englishVariants: ['where are you going', 'ask them where they are going'],
    hindi: 'आप कहाँ जा रहे हैं?',
    hindiVariants: ['आप कहाँ जा रहे हैं', 'तुम कहाँ जा रहे हो'],
    santaliOlChiki: 'ᱟᱢ ᱚᱠᱟᱛᱮᱢ ᱪᱟᱞᱟᱜ ᱠᱟᱱᱟ?',
    santaliRoman: 'Am okatem chalag kana?',
    santaliDevanagari: 'आम ओकातेम चालाग काना?',
    backTranslationEnglish: 'Where are you going?',
    backTranslationHindi: 'आप कहाँ जा रहे हैं?',
  },
  {
    id: 'dir-going-school',
    category: 'directions',
    english: 'I am going to school.',
    englishVariants: ['i am going to school', 'tell them i am going to school'],
    hindi: 'मैं स्कूल जा रहा हूँ।',
    hindiVariants: ['मैं स्कूल जा रहा हूँ', 'मैं विद्यालय जा रहा हूँ'],
    santaliOlChiki: 'ᱤᱧ ᱟᱥᱲᱟ ᱛᱤᱧ ᱪᱟᱞᱟᱜ ᱠᱟᱱᱟ᱾',
    santaliRoman: 'Ing asra ting chalag kana.',
    santaliDevanagari: 'इञ आसड़ा तिञ चालाग काना।',
    backTranslationEnglish: 'I am going to school.',
    backTranslationHindi: 'मैं स्कूल जा रहा हूँ।',
  },
  {
    id: 'dir-reply-nearby',
    category: 'directions',
    english: 'The bus stand is nearby.',
    englishVariants: ['the bus stand is nearby', 'bus stand is near here'],
    hindi: 'बस स्टैंड पास में ही है।',
    hindiVariants: ['बस स्टैंड पास में ही है', 'बस स्टैंड यहीं पास में है'],
    santaliOlChiki: 'ᱵᱟᱥ ᱤᱥᱴᱮᱱᱰ ᱫᱚ ᱥᱩᱨ ᱨᱮᱜᱮ ᱢᱮᱱᱟᱜᱼᱟ᱾',
    santaliRoman: 'Bas istend do sur rege menag-a.',
    santaliDevanagari: 'बास इस्टेंड दो सुर रेगे मेनाग-आ।',
    backTranslationEnglish: 'The bus stand is right nearby.',
    backTranslationHindi: 'बस स्टैंड पास में ही है।',
  },
  {
    id: 'dir-go-straight',
    category: 'directions',
    english: 'Go straight ahead.',
    englishVariants: ['go straight ahead', 'walk straight ahead', 'go straight'],
    hindi: 'सीधे आगे जाइए।',
    hindiVariants: ['सीधे आगे जाओ', 'सीधे आगे जाइए', 'सीधे चलो'],
    santaliOlChiki: 'ᱥᱚᱡᱷᱮ ᱢᱟᱬᱟᱝ ᱥᱮᱫ ᱪᱟᱞᱟᱜ ᱢᱮ᱾',
    santaliRoman: 'Sojhe marang sed chalag me.',
    santaliDevanagari: 'सोझे माणांग सेद चालाग मे।',
    backTranslationEnglish: 'Go straight ahead.',
    backTranslationHindi: 'सीधे आगे जाइए।',
  },

  // --- Prices & Shopping ---
  {
    id: 'shop-how-much',
    category: 'shopping',
    english: 'How much does this cost?',
    englishVariants: [
      'how much does this cost',
      'ask them how much this costs',
      'please ask them how much this costs',
      'how much is this',
      'what is the price of this',
      'what is its price',
    ],
    hindi: 'इसकी कीमत कितनी है?',
    hindiVariants: [
      'इसकी कीमत कितनी है',
      'यह कितने का है',
      'इसका दाम क्या है',
      'उनसे पूछें कि इसकी कीमत कितनी है',
    ],
    santaliOlChiki: 'ᱱᱚᱣᱟ ᱨᱮᱭᱟᱜ ᱫᱟᱢ ᱫᱚ ᱛᱤᱱᱟᱹᱜ?',
    santaliRoman: 'Nowa reyag dam do tinag?',
    santaliDevanagari: 'नोवा रेयाग दाम दो तिनाग?',
    backTranslationEnglish: 'How much is the price of this?',
    backTranslationHindi: 'इसकी कीमत कितनी है?',
  },
  {
    id: 'shop-expensive',
    category: 'shopping',
    english: 'This is too expensive.',
    englishVariants: ['this is too expensive', 'it is very expensive', 'tell them this is too expensive'],
    hindi: 'यह बहुत महँगा है।',
    hindiVariants: ['यह बहुत महंगा है', 'यह बहुत महँगा है'],
    santaliOlChiki: 'ᱱᱚᱣᱟ ᱫᱚ ᱟᱹᱰᱤ ᱢᱚᱦᱸᱜᱟ ᱜᱮᱭᱟ᱾',
    santaliRoman: 'Nowa do adi mohnga geya.',
    santaliDevanagari: 'नोवा दो आडी मोहंगा गेया।',
    backTranslationEnglish: 'This is very expensive.',
    backTranslationHindi: 'यह बहुत महँगा है।',
  },

  // --- Help & Emergency ---
  {
    id: 'help-i-need-help',
    category: 'help',
    english: 'I need help.',
    englishVariants: [
      'i need help',
      'tell them i need help',
      'please tell them i need help',
      'i need some help',
    ],
    hindi: 'मुझे मदद चाहिए।',
    hindiVariants: ['मुझे मदद चाहिए', 'उन्हें बताएं कि मुझे मदद चाहिए', 'मेरी मदद करो'],
    santaliOlChiki: 'ᱤᱧ ᱜᱚᱲᱚ ᱞᱟᱹᱠᱛᱤ ᱠᱟᱱᱟ᱾',
    santaliRoman: 'Ing goro lakti kana.',
    santaliDevanagari: 'इञ गोड़ो लाकती काना।',
    backTranslationEnglish: 'I need help.',
    backTranslationHindi: 'मुझे मदद चाहिए।',
    isUrgentOrMedical: true,
  },
  {
    id: 'help-please-help-me',
    category: 'help',
    english: 'Please help me.',
    englishVariants: ['please help me', 'help me please'],
    hindi: 'कृपया मेरी मदद करें।',
    hindiVariants: ['कृपया मेरी मदद करें', 'कृपया मेरी सहायता करें'],
    santaliOlChiki: 'ᱫᱟᱭᱟ ᱠᱟᱛᱮ ᱤᱧ ᱜᱚᱲᱚ ᱟᱹᱧ ᱢᱮ᱾',
    santaliRoman: 'Daya kate ing goro any me.',
    santaliDevanagari: 'दाया काते इञ गोड़ो आञ मे।',
    backTranslationEnglish: 'Please help me.',
    backTranslationHindi: 'कृपया मेरी मदद करें।',
    isUrgentOrMedical: true,
  },
  {
    id: 'help-can-you-help',
    category: 'help',
    english: 'Can you help me?',
    englishVariants: ['can you help me', 'will you help me', 'ask them if they can help me'],
    hindi: 'क्या आप मेरी मदद कर सकते हैं?',
    hindiVariants: ['क्या आप मेरी मदद कर सकते हैं', 'क्या तुम मेरी मदद करोगे'],
    santaliOlChiki: 'ᱟᱢ ᱤᱧᱮᱢ ᱜᱚᱲᱚ ᱫᱟᱲᱮᱭᱟᱹᱧᱟ?',
    santaliRoman: 'Am ingem goro dareyanya?',
    santaliDevanagari: 'आम इञेम गोड़ो दाड़ेयाञा?',
    backTranslationEnglish: 'Can you help me?',
    backTranslationHindi: 'क्या आप मेरी मदद कर सकते हैं?',
  },

  // --- Medical & Health ---
  {
    id: 'med-unwell-need-doctor',
    category: 'medical',
    english: 'I am feeling unwell and need a doctor.',
    englishVariants: [
      'i am feeling unwell and need a doctor',
      'tell them i am feeling unwell and need a doctor',
      'please tell them i am feeling unwell and need a doctor',
      'i am sick and i need a doctor',
      'i feel sick and need a doctor',
      'tell them i am sick and need a doctor',
    ],
    hindi: 'मेरी तबीयत ठीक नहीं है और मुझे डॉक्टर की ज़रूरत है।',
    hindiVariants: [
      'मेरी तबीयत ठीक नहीं है और मुझे डॉक्टर की जरूरत है',
      'मैं बीमार हूँ और मुझे डॉक्टर चाहिए',
      'उन्हें बताओ मेरी तबीयत खराब है और डॉक्टर चाहिए',
    ],
    santaliOlChiki: 'ᱤᱧᱟᱜ ᱦᱚᱲᱢᱚ ᱵᱟᱹᱲᱤᱡ ᱜᱮ ᱵᱩᱡᱷᱟᱹᱣᱜ ᱠᱟᱱᱟ ᱟᱨ ᱰᱚᱠᱴᱚᱨ ᱞᱟᱹᱠᱛᱤ ᱠᱟᱱᱟ᱾',
    santaliRoman: 'Inyag hormo barij ge bujhawg kana ar doktor lakti kana.',
    santaliDevanagari: 'इञाग होड़मो बाड़िज गे बुझाउग काना आर डोक्टर लाकती काना।',
    backTranslationEnglish: 'My body/health feels unwell and a doctor is needed.',
    backTranslationHindi: 'मेरी तबीयत खराब लग रही है और डॉक्टर की ज़रूरत है।',
    isUrgentOrMedical: true,
  },
  {
    id: 'med-feeling-unwell',
    category: 'medical',
    english: 'I am feeling unwell.',
    englishVariants: ['i am feeling unwell', 'i am sick', 'i am not feeling well', 'tell them i am sick'],
    hindi: 'मेरी तबीयत ठीक नहीं है।',
    hindiVariants: ['मेरी तबीयत ठीक नहीं है', 'मेरी तबीयत खराब है', 'मैं बीमार हूँ'],
    santaliOlChiki: 'ᱤᱧᱟᱜ ᱦᱚᱲᱢᱚ ᱵᱟᱹᱲᱤᱡ ᱜᱮᱭᱟ᱾',
    santaliRoman: 'Inyag hormo barij geya.',
    santaliDevanagari: 'इञाग होड़मो बाड़िज गेया।',
    backTranslationEnglish: 'I am unwell / My health is not good.',
    backTranslationHindi: 'मेरी तबीयत ठीक नहीं है।',
    isUrgentOrMedical: true,
  },
  {
    id: 'med-need-doctor',
    category: 'medical',
    english: 'I need a doctor.',
    englishVariants: ['i need a doctor', 'tell them i need a doctor', 'please call a doctor'],
    hindi: 'मुझे डॉक्टर की ज़रूरत है।',
    hindiVariants: ['मुझे डॉक्टर की जरूरत है', 'मुझे डॉक्टर चाहिए'],
    santaliOlChiki: 'ᱤᱧ ᱰᱚᱠᱴᱚᱨ ᱞᱟᱹᱠᱛᱤ ᱠᱟᱱᱟ᱾',
    santaliRoman: 'Ing doktor lakti kana.',
    santaliDevanagari: 'इञ डोक्टर लाकती काना।',
    backTranslationEnglish: 'I need a doctor.',
    backTranslationHindi: 'मुझे डॉक्टर की ज़रूरत है।',
    isUrgentOrMedical: true,
  },
  {
    id: 'med-need-medicine',
    category: 'medical',
    english: 'I need medicine.',
    englishVariants: ['i need medicine', 'tell them i need medicine'],
    hindi: 'मुझे दवाई चाहिए।',
    hindiVariants: ['मुझे दवाई चाहिए', 'मुझे दवा की जरूरत है'],
    santaliOlChiki: 'ᱤᱧ ᱨᱟᱱ ᱞᱟᱹᱠᱛᱤ ᱠᱟᱱᱟ᱾',
    santaliRoman: 'Ing ran lakti kana.',
    santaliDevanagari: 'इञ रान लाकती काना।',
    backTranslationEnglish: 'I need medicine.',
    backTranslationHindi: 'मुझे दवाई चाहिए।',
    isUrgentOrMedical: true,
  },
  {
    id: 'med-take-hospital',
    category: 'medical',
    english: 'Please take me to the hospital.',
    englishVariants: ['please take me to the hospital', 'take me to the hospital', 'i need to go to the hospital'],
    hindi: 'कृपया मुझे अस्पताल ले चलिए।',
    hindiVariants: ['कृपया मुझे अस्पताल ले चलो', 'मुझे अस्पताल जाना है'],
    santaliOlChiki: 'ᱫᱟᱭᱟ ᱠᱟᱛᱮ ᱤᱧ ᱦᱟᱥᱯᱟᱛᱟᱞ ᱤᱫᱤᱭᱤᱧ ᱢᱮ᱾',
    santaliRoman: 'Daya kate ing haspatal idiying me.',
    santaliDevanagari: 'दाया काते इञ हास्पताल इदियिञ मे।',
    backTranslationEnglish: 'Please take me to the hospital.',
    backTranslationHindi: 'कृपया मुझे अस्पताल ले चलिए।',
    isUrgentOrMedical: true,
  },

  // --- Everyday Needs ---
  {
    id: 'need-water',
    category: 'needs',
    english: 'I need water.',
    englishVariants: [
      'i need water',
      'i need some water',
      'tell them i need water',
      'how do i tell someone in santali that i need water',
      'how do i say i need water in santali',
    ],
    hindi: 'मुझे पानी चाहिए।',
    hindiVariants: ['मुझे पानी चाहिए', 'मुझे थोड़ा पानी चाहिए', 'संताली में मुझे पानी चाहिए कैसे कहें'],
    santaliOlChiki: 'ᱤᱧ ᱫᱟᱜ ᱞᱟᱹᱠᱛᱤ ᱠᱟᱱᱟ᱾',
    santaliRoman: 'Ing dah lakti kana.',
    santaliDevanagari: 'इञ दाः लाकती काना।',
    backTranslationEnglish: 'I need water.',
    backTranslationHindi: 'मुझे पानी चाहिए।',
  },
  {
    id: 'need-give-water',
    category: 'needs',
    english: 'Please give me water.',
    englishVariants: ['please give me water', 'please give water', 'can i have some water'],
    hindi: 'कृपया मुझे पानी दीजिए।',
    hindiVariants: ['कृपया पानी दीजिए', 'कृपया मुझे पानी दीजिए', 'पानी दीजिए'],
    santaliOlChiki: 'ᱫᱟᱭᱟ ᱠᱟᱛᱮ ᱫᱟᱜ ᱮᱢᱟᱹᱧ ᱢᱮ᱾',
    santaliRoman: 'Daya kate dah emany me.',
    santaliDevanagari: 'दाया काते दाः एमाञ मे।',
    backTranslationEnglish: 'Please give me water.',
    backTranslationHindi: 'कृपया मुझे पानी दीजिए।',
  },
  {
    id: 'need-hungry',
    category: 'needs',
    english: 'I am hungry.',
    englishVariants: ['i am hungry', 'tell them i am hungry', 'i need food'],
    hindi: 'मुझे भूख लगी है।',
    hindiVariants: ['मुझे भूख लगी है', 'मुझे खाना चाहिए'],
    santaliOlChiki: 'ᱤᱧ ᱨᱮᱸᱜᱮᱡ ᱠᱟᱹᱫᱤᱧᱟ᱾',
    santaliRoman: 'Ing rengej kadinya.',
    santaliDevanagari: 'इञ रेंगेज कादिञा।',
    backTranslationEnglish: 'I am hungry.',
    backTranslationHindi: 'मुझे भूख लगी है।',
  },

  // --- Polite & Conversation Management ---
  {
    id: 'polite-thank-you',
    category: 'polite',
    english: 'Thank you.',
    englishVariants: ['thank you', 'thanks', 'tell them thank you'],
    hindi: 'धन्यवाद।',
    hindiVariants: ['धन्यवाद', 'शुक्रिया'],
    santaliOlChiki: 'ᱥᱟᱨᱦᱟᱣ᱾',
    santaliRoman: 'Sarhaw.',
    santaliDevanagari: 'सारहाव।',
    backTranslationEnglish: 'Thank you.',
    backTranslationHindi: 'धन्यवाद।',
  },
  {
    id: 'polite-thank-you-very-much',
    category: 'polite',
    english: 'Thank you very much.',
    englishVariants: ['thank you very much', 'thanks a lot', 'many thanks'],
    hindi: 'बहुत-बहुत धन्यवाद।',
    hindiVariants: ['बहुत-बहुत धन्यवाद', 'बहुत धन्यवाद'],
    santaliOlChiki: 'ᱟᱹᱰᱤ ᱟᱹᱰᱤ ᱥᱟᱨᱦᱟᱣ᱾',
    santaliRoman: 'Adi adi sarhaw.',
    santaliDevanagari: 'आडी आडी सारहाव।',
    backTranslationEnglish: 'Thank you very much.',
    backTranslationHindi: 'बहुत-बहुत धन्यवाद।',
  },
  {
    id: 'polite-welcome',
    category: 'polite',
    english: 'You are welcome.',
    englishVariants: ['you are welcome', 'welcome'],
    hindi: 'आपका स्वागत है।',
    hindiVariants: ['आपका स्वागत है', 'स्वागत है'],
    santaliOlChiki: 'ᱥᱟᱹᱜᱩᱱ ᱫᱟᱨᱟᱢ᱾',
    santaliRoman: 'Sagun daram.',
    santaliDevanagari: 'सगुन दाराम।',
    backTranslationEnglish: 'Welcome.',
    backTranslationHindi: 'आपका स्वागत है।',
  },
  {
    id: 'polite-see-you',
    category: 'polite',
    english: 'See you again / Goodbye.',
    englishVariants: ['see you again', 'goodbye', 'bye', 'we will meet again'],
    hindi: 'फिर मिलेंगे।',
    hindiVariants: ['फिर मिलेंगे', 'अलविदा'],
    santaliOlChiki: 'ᱟᱨᱦᱚᱸ ᱵᱚᱱ ᱧᱟᱯᱟᱢᱟ᱾',
    santaliRoman: 'Arho bon nyapama.',
    santaliDevanagari: 'आरहों बोन ञापामा।',
    backTranslationEnglish: 'We will meet again.',
    backTranslationHindi: 'फिर मिलेंगे।',
  },
  {
    id: 'polite-dont-understand',
    category: 'polite',
    english: 'I do not understand.',
    englishVariants: [
      'i do not understand',
      'i dont understand',
      'tell them i do not understand',
      'i did not understand',
    ],
    hindi: 'मैं समझ नहीं पा रहा हूँ।',
    hindiVariants: ['मुझे समझ नहीं आया', 'मैं समझ नहीं पा रहा हूँ', 'मैं नहीं समझा'],
    santaliOlChiki: 'ᱤᱧ ᱵᱟᱹᱧ ᱵᱩᱡᱷᱟᱹᱣ ᱫᱟᱲᱮᱭᱟᱜ ᱠᱟᱱᱟ᱾',
    santaliRoman: 'Ing bany bujhaw dareyag kana.',
    santaliDevanagari: 'इञ बाञ बुझाव दाड़ेयाग काना।',
    backTranslationEnglish: 'I am not able to understand.',
    backTranslationHindi: 'मैं समझ नहीं पा रहा हूँ।',
  },
  {
    id: 'polite-speak-slowly',
    category: 'polite',
    english: 'Please speak slowly.',
    englishVariants: ['please speak slowly', 'speak slowly please', 'ask them to speak slowly'],
    hindi: 'कृपया धीरे बोलिए।',
    hindiVariants: ['कृपया धीरे बोलिए', 'धीरे बोलो'],
    santaliOlChiki: 'ᱫᱟᱭᱟ ᱠᱟᱛᱮ ᱵᱟᱹᱭᱼᱵᱟᱹᱭ ᱛᱮ ᱨᱚᱲ ᱢᱮ᱾',
    santaliRoman: 'Daya kate bay-bay te ror me.',
    santaliDevanagari: 'दाया काते बाई-बाई ते रोड़ मे।',
    backTranslationEnglish: 'Please speak slowly.',
    backTranslationHindi: 'कृपया धीरे बोलिए।',
  },
  {
    id: 'polite-repeat',
    category: 'polite',
    english: 'Please say that again.',
    englishVariants: ['please say that again', 'please repeat that', 'can you repeat that'],
    hindi: 'कृपया फिर से कहिए।',
    hindiVariants: ['कृपया फिर से कहिए', 'कृपया दोहराएं'],
    santaliOlChiki: 'ᱫᱟᱭᱟ ᱠᱟᱛᱮ ᱟᱨᱦᱚᱸ ᱢᱮᱱ ᱢᱮ᱾',
    santaliRoman: 'Daya kate arho men me.',
    santaliDevanagari: 'दाया काते आरहों मेन मे।',
    backTranslationEnglish: 'Please say it again.',
    backTranslationHindi: 'कृपया फिर से कहिए।',
  },
  {
    id: 'polite-come-here',
    category: 'polite',
    english: 'Come here.',
    englishVariants: ['come here', 'please come here'],
    hindi: 'यहाँ आओ।',
    hindiVariants: ['यहाँ आओ', 'इधर आइए'],
    santaliOlChiki: 'ᱱᱚᱸᱰᱮ ᱦᱤᱡᱩᱜ ᱢᱮ᱾',
    santaliRoman: 'Nonde hijug me.',
    santaliDevanagari: 'नोंडे हिजुग मे।',
    backTranslationEnglish: 'Come here.',
    backTranslationHindi: 'यहाँ आओ।',
  },
  {
    id: 'polite-sit-down',
    category: 'polite',
    english: 'Please sit down.',
    englishVariants: ['sit down', 'please sit down', 'have a seat'],
    hindi: 'बैठ जाओ।',
    hindiVariants: ['बैठ जाओ', 'कृपया बैठिए'],
    santaliOlChiki: 'ᱫᱩᱲᱩᱵ ᱢᱮ᱾',
    santaliRoman: 'Durub me.',
    santaliDevanagari: 'दुड़ुब मे।',
    backTranslationEnglish: 'Sit down.',
    backTranslationHindi: 'बैठ जाओ।',
  },
  {
    id: 'polite-read-together',
    category: 'school',
    english: 'Let us read together.',
    englishVariants: ['let us read together', 'lets read together'],
    hindi: 'चलो मिलकर पढ़ते हैं।',
    hindiVariants: ['चलो मिलकर पढ़ते हैं'],
    santaliOlChiki: 'ᱫᱮᱞᱟᱵᱚᱱ ᱢᱤᱫ ᱛᱮ ᱯᱟᱲᱦᱟᱣ ᱢᱟ᱾',
    santaliRoman: 'Delabon mit te parhaw ma.',
    santaliDevanagari: 'देलाबोन मिद ते पाड़हाव मा।',
    backTranslationEnglish: 'Let us read together.',
    backTranslationHindi: 'चलो मिलकर पढ़ते हैं।',
  },
  {
    id: 'polite-yes',
    category: 'polite',
    english: 'Yes',
    englishVariants: ['yes'],
    hindi: 'हाँ',
    hindiVariants: ['हाँ', 'जी हाँ'],
    santaliOlChiki: 'ᱦᱮᱸ',
    santaliRoman: 'Heny',
    santaliDevanagari: 'हें',
    backTranslationEnglish: 'Yes',
    backTranslationHindi: 'हाँ',
  },
  {
    id: 'polite-no',
    category: 'polite',
    english: 'No',
    englishVariants: ['no'],
    hindi: 'नहीं',
    hindiVariants: ['नहीं', 'ना'],
    santaliOlChiki: 'ᱵᱟᱝ',
    santaliRoman: 'Bang',
    santaliDevanagari: 'बांग',
    backTranslationEnglish: 'No',
    backTranslationHindi: 'नहीं',
  },

  // --- Single Words & Core Concepts ---
  {
    id: 'word-water',
    category: 'needs',
    english: 'Water',
    englishVariants: ['water'],
    hindi: 'पानी / जल',
    hindiVariants: ['पानी', 'जल'],
    santaliOlChiki: 'ᱫᱟᱜ',
    santaliRoman: 'Dah',
    santaliDevanagari: 'दाः',
    backTranslationEnglish: 'Water',
    backTranslationHindi: 'पानी',
  },
  {
    id: 'word-food',
    category: 'needs',
    english: 'Food / Rice',
    englishVariants: ['food', 'rice', 'meal'],
    hindi: 'खाना / भोजन',
    hindiVariants: ['खाना', 'भोजन', 'भात'],
    santaliOlChiki: 'ᱫᱟᱠᱟ',
    santaliRoman: 'Daka',
    santaliDevanagari: 'दाका',
    backTranslationEnglish: 'Food / Cooked rice',
    backTranslationHindi: 'खाना / भात',
  },
  {
    id: 'word-school',
    category: 'school',
    english: 'School',
    englishVariants: ['school'],
    hindi: 'विद्यालय / स्कूल',
    hindiVariants: ['विद्यालय', 'स्कूल'],
    santaliOlChiki: 'ᱟᱥᱲᱟ',
    santaliRoman: 'Asra',
    santaliDevanagari: 'आसड़ा',
    backTranslationEnglish: 'School',
    backTranslationHindi: 'स्कूल',
  },
  {
    id: 'word-book',
    category: 'school',
    english: 'Book',
    englishVariants: ['book'],
    hindi: 'किताब / पुस्तक',
    hindiVariants: ['किताब', 'पुस्तक'],
    santaliOlChiki: 'ᱯᱩᱛᱷᱤ',
    santaliRoman: 'Puthi',
    santaliDevanagari: 'पुथी',
    backTranslationEnglish: 'Book',
    backTranslationHindi: 'किताब',
  },
  {
    id: 'word-teacher',
    category: 'school',
    english: 'Teacher',
    englishVariants: ['teacher'],
    hindi: 'शिक्षक / गुरुजी',
    hindiVariants: ['शिक्षक', 'गुरुजी', 'मास्टर'],
    santaliOlChiki: 'ᱢᱟᱪᱮᱛ',
    santaliRoman: 'Machet',
    santaliDevanagari: 'माचेत',
    backTranslationEnglish: 'Teacher',
    backTranslationHindi: 'शिक्षक',
  },
  {
    id: 'word-friend',
    category: 'greeting',
    english: 'Friend',
    englishVariants: ['friend'],
    hindi: 'दोस्त / मित्र',
    hindiVariants: ['दोस्त', 'मित्र'],
    santaliOlChiki: 'ᱜᱟᱛᱮ',
    santaliRoman: 'Gate',
    santaliDevanagari: 'गाते',
    backTranslationEnglish: 'Friend',
    backTranslationHindi: 'दोस्त',
  },
  {
    id: 'word-mother',
    category: 'introduction',
    english: 'Mother',
    englishVariants: ['mother', 'mom'],
    hindi: 'माँ / माता',
    hindiVariants: ['माँ', 'माता'],
    santaliOlChiki: 'ᱟᱭᱳ',
    santaliRoman: 'Ayo',
    santaliDevanagari: 'आयो',
    backTranslationEnglish: 'Mother',
    backTranslationHindi: 'माँ',
  },
  {
    id: 'word-father',
    category: 'introduction',
    english: 'Father',
    englishVariants: ['father', 'dad'],
    hindi: 'पिता / बाबा',
    hindiVariants: ['पिता', 'बाबा', 'पापा'],
    santaliOlChiki: 'ᱵᱟᱵᱟ',
    santaliRoman: 'Baba',
    santaliDevanagari: 'बाबा',
    backTranslationEnglish: 'Father',
    backTranslationHindi: 'पिता',
  },
  {
    id: 'word-village',
    category: 'directions',
    english: 'Village',
    englishVariants: ['village'],
    hindi: 'गाँव',
    hindiVariants: ['गाँव', 'ग्राम'],
    santaliOlChiki: 'ᱟᱹᱛᱩ',
    santaliRoman: 'Atu',
    santaliDevanagari: 'आतु',
    backTranslationEnglish: 'Village',
    backTranslationHindi: 'गाँव',
  },
  // Numbers 1-10
  {
    id: 'num-1',
    category: 'numbers',
    english: 'One (1)',
    englishVariants: ['one', '1', 'one (1)'],
    hindi: 'एक (१)',
    hindiVariants: ['एक', '१'],
    santaliOlChiki: 'ᱢᱤᱫ (᱑)',
    santaliRoman: 'Mit (1)',
    santaliDevanagari: 'मिद (१)',
    backTranslationEnglish: 'One (1)',
    backTranslationHindi: 'एक (१)',
  },
  {
    id: 'num-2',
    category: 'numbers',
    english: 'Two (2)',
    englishVariants: ['two', '2', 'two (2)'],
    hindi: 'दो (२)',
    hindiVariants: ['दो', '२'],
    santaliOlChiki: 'ᱵᱟᱨ (᱒)',
    santaliRoman: 'Bar (2)',
    santaliDevanagari: 'बार (२)',
    backTranslationEnglish: 'Two (2)',
    backTranslationHindi: 'दो (२)',
  },
  {
    id: 'num-3',
    category: 'numbers',
    english: 'Three (3)',
    englishVariants: ['three', '3', 'three (3)'],
    hindi: 'तीन (३)',
    hindiVariants: ['तीन', '३'],
    santaliOlChiki: 'ᱯᱮ (᱓)',
    santaliRoman: 'Pe (3)',
    santaliDevanagari: 'पे (३)',
    backTranslationEnglish: 'Three (3)',
    backTranslationHindi: 'तीन (३)',
  },
  {
    id: 'num-4',
    category: 'numbers',
    english: 'Four (4)',
    englishVariants: ['four', '4', 'four (4)'],
    hindi: 'चार (४)',
    hindiVariants: ['चार', '४'],
    santaliOlChiki: 'ᱯᱳᱱ (᱔)',
    santaliRoman: 'Pon (4)',
    santaliDevanagari: 'पोन (४)',
    backTranslationEnglish: 'Four (4)',
    backTranslationHindi: 'चार (४)',
  },
  {
    id: 'num-5',
    category: 'numbers',
    english: 'Five (5)',
    englishVariants: ['five', '5', 'five (5)'],
    hindi: 'पाँच (५)',
    hindiVariants: ['पाँच', 'पांच', '५'],
    santaliOlChiki: 'ᱢᱚᱬᱮ (᱕)',
    santaliRoman: 'More (5)',
    santaliDevanagari: 'मोड़े (५)',
    backTranslationEnglish: 'Five (5)',
    backTranslationHindi: 'पाँच (५)',
  },
  {
    id: 'num-6',
    category: 'numbers',
    english: 'Six (6)',
    englishVariants: ['six', '6', 'six (6)'],
    hindi: 'छह (६)',
    hindiVariants: ['छह', '६'],
    santaliOlChiki: 'ᱛᱩᱨᱩᱭ (᱖)',
    santaliRoman: 'Turui (6)',
    santaliDevanagari: 'तुरुय (६)',
    backTranslationEnglish: 'Six (6)',
    backTranslationHindi: 'छह (६)',
  },
  {
    id: 'num-7',
    category: 'numbers',
    english: 'Seven (7)',
    englishVariants: ['seven', '7', 'seven (7)'],
    hindi: 'सात (७)',
    hindiVariants: ['सात', '७'],
    santaliOlChiki: 'ᱮᱭᱟᱭ (᱗)',
    santaliRoman: 'Eyay (7)',
    santaliDevanagari: 'एयाय (७)',
    backTranslationEnglish: 'Seven (7)',
    backTranslationHindi: 'सात (७)',
  },
  {
    id: 'num-8',
    category: 'numbers',
    english: 'Eight (8)',
    englishVariants: ['eight', '8', 'eight (8)'],
    hindi: 'आठ (८)',
    hindiVariants: ['आठ', '८'],
    santaliOlChiki: 'ᱤᱨᱟᱹᱞ (᱘)',
    santaliRoman: 'Iral (8)',
    santaliDevanagari: 'इराल (८)',
    backTranslationEnglish: 'Eight (8)',
    backTranslationHindi: 'आठ (८)',
  },
  {
    id: 'num-9',
    category: 'numbers',
    english: 'Nine (9)',
    englishVariants: ['nine', '9', 'nine (9)'],
    hindi: 'नौ (९)',
    hindiVariants: ['नौ', '९'],
    santaliOlChiki: 'ᱟᱨᱮ (᱙)',
    santaliRoman: 'Are (9)',
    santaliDevanagari: 'आरे (९)',
    backTranslationEnglish: 'Nine (9)',
    backTranslationHindi: 'नौ (९)',
  },
  {
    id: 'num-10',
    category: 'numbers',
    english: 'Ten (10)',
    englishVariants: ['ten', '10', 'ten (10)'],
    hindi: 'दस (१०)',
    hindiVariants: ['दस', '१०'],
    santaliOlChiki: 'ᱜᱮᱞ (᱑᱐)',
    santaliRoman: 'Gel (10)',
    santaliDevanagari: 'गेल (१०)',
    backTranslationEnglish: 'Ten (10)',
    backTranslationHindi: 'दस (१०)',
  },
];

// ---------------------------------------------------------------------------
// 2. Language & Script Detection
// ---------------------------------------------------------------------------
const ROMAN_SANTALI_MARKERS = new Set([
  'johar',
  'menama',
  'menanya',
  'menanga',
  'nyutum',
  'nutum',
  'sarhaw',
  'chalag',
  'kana',
  'kanang',
  'kanam',
  'inyag',
  'inag',
  'amag',
  'okare',
  'okatem',
  'tinag',
  'lakti',
  'bany',
  'hormo',
  'haspatal',
  'istend',
  'asra',
  'parhaw',
  'kuliying',
  'gidra',
  'bujhaw',
  'dareyag',
  'nyapama',
  'rengej',
  'kadinya',
  'emany',
  'hijug',
  'durub',
  'delabon',
  'marang',
  'katij',
  'bhitri',
  'bahre',
  'setag',
  'nyida',
]);

const DEVANAGARI_SANTALI_MARKERS = [
  'जोहार',
  'मेनामा',
  'मेनाञा',
  'मेनांया',
  'ञुतुम',
  'सारहाव',
  'चालाग',
  'काना',
  'कानंग',
  'बाञ',
  'बाडाया',
  'लाकती',
  'आसड़ा',
  'पाड़हाव',
  'ञापामा',
  'होड़मो',
];

export function detectLanguageAndScript(text: string): {
  language: CommunicationLang;
  script: 'olchiki' | 'devanagari' | 'roman';
} {
  const trimmed = (text || '').trim();

  // 1. Check Ol Chiki Unicode block (U+1C50 to U+1C7F)
  if (/[\u1C50-\u1C7F]/.test(trimmed)) {
    return { language: 'santali', script: 'olchiki' };
  }

  // 2. Check Devanagari Unicode block (U+0900 to U+097F)
  if (/[\u0900-\u097F]/.test(trimmed)) {
    const hasSantaliDevanagariMarker = DEVANAGARI_SANTALI_MARKERS.some((m) =>
      trimmed.includes(m)
    );
    return {
      language: hasSantaliDevanagariMarker ? 'santali' : 'hindi',
      script: 'devanagari',
    };
  }

  // 3. Roman script: check whether words are Roman Santali or English
  const words = trimmed
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (words.length > 0) {
    const santaliWordCount = words.filter((w) => ROMAN_SANTALI_MARKERS.has(w)).length;
    if (santaliWordCount >= 2 || (words.length === 1 && santaliWordCount === 1)) {
      return { language: 'santali', script: 'roman' };
    }
  }

  return { language: 'english', script: 'roman' };
}

// ---------------------------------------------------------------------------
// 3. Deterministic Script Conversion & Transliteration (Santali Only)
// ---------------------------------------------------------------------------
const OLCHIKI_TO_ROMAN_MAP: Record<string, string> = {
  '᱐': '0',
  '᱑': '1',
  '᱒': '2',
  '᱓': '3',
  '᱔': '4',
  '᱕': '5',
  '᱖': '6',
  '᱗': '7',
  '᱘': '8',
  '᱙': '9',
  'ᱚ': 'o',
  'ᱛ': 't',
  'ᱜ': 'g',
  'ᱝ': 'ng',
  'ᱞ': 'l',
  'ᱟ': 'a',
  'ᱠ': 'k',
  'ᱡ': 'j',
  'ᱢ': 'm',
  'ᱣ': 'w',
  'ᱤ': 'i',
  'ᱥ': 's',
  'ᱦ': 'h',
  'ᱧ': 'ny',
  'ᱨ': 'r',
  'ᱩ': 'u',
  'ᱪ': 'ch',
  'ᱫ': 'd',
  'ᱬ': 'n',
  'ᱭ': 'y',
  'ᱮ': 'e',
  'ᱯ': 'p',
  'ᱰ': 'd',
  'ᱱ': 'n',
  'ᱲ': 'r',
  'ᱳ': 'o',
  'ᱴ': 't',
  'ᱵ': 'b',
  'ᱶ': 'nw',
  'ᱷ': 'h',
  'ᱸ': 'n',
  'ᱹ': '',
  'ᱺ': 'n',
  'ᱻ': '',
  'ᱼ': '-',
  'ᱽ': '',
  '᱾': '.',
  '᱿': '.',
};

const OLCHIKI_TO_DEVANAGARI_MAP: Record<string, string> = {
  '᱐': '०',
  '᱑': '१',
  '᱒': '२',
  '᱓': '३',
  '᱔': '४',
  '᱕': '५',
  '᱖': '६',
  '᱗': '७',
  '᱘': '८',
  '᱙': '९',
  'ᱚ': 'अ',
  'ᱛ': 'त',
  'ᱜ': 'ग',
  'ᱝ': 'ं',
  'ᱞ': 'ल',
  'ᱟ': 'आ',
  'ᱠ': 'क',
  'ᱡ': 'ज',
  'ᱢ': 'म',
  'ᱣ': 'व',
  'ᱤ': 'इ',
  'ᱥ': 'स',
  'ᱦ': 'ह',
  'ᱧ': 'ञ',
  'ᱨ': 'र',
  'ᱩ': 'उ',
  'ᱪ': 'च',
  'ᱫ': 'द',
  'ᱬ': 'ण',
  'ᱭ': 'य',
  'ᱮ': 'ए',
  'ᱯ': 'प',
  'ᱰ': 'ड',
  'ᱱ': 'न',
  'ᱲ': 'ड़',
  'ᱳ': 'ओ',
  'ᱴ': 'ट',
  'ᱵ': 'ब',
  'ᱶ': 'ँव',
  'ᱷ': 'ह',
  'ᱸ': 'ं',
  'ᱹ': '',
  'ᱺ': 'ं',
  'ᱻ': '',
  'ᱼ': '-',
  'ᱽ': '',
  '᱾': '।',
  '᱿': '॥',
};

/**
 * Transliterates Ol Chiki Santali text into Roman phonetic pronunciation.
 * Note: This is a pronunciation representation, NOT a translation.
 */
export function transliterateOlChikiToRoman(olChikiText: string): string {
  if (!olChikiText) return '';
  let result = '';
  for (const char of olChikiText) {
    result += OLCHIKI_TO_ROMAN_MAP[char] !== undefined ? OLCHIKI_TO_ROMAN_MAP[char] : char;
  }
  return result.replace(/\s+/g, ' ').trim();
}

/**
 * Converts Ol Chiki Santali text into Devanagari phonetic representation of Santali.
 * Note: Devanagari Santali is still the Santali language, NOT Hindi.
 */
export function convertOlChikiToDevanagariSantali(olChikiText: string): string {
  if (!olChikiText) return '';
  let result = '';
  for (const char of olChikiText) {
    result +=
      OLCHIKI_TO_DEVANAGARI_MAP[char] !== undefined ? OLCHIKI_TO_DEVANAGARI_MAP[char] : char;
  }
  return result.replace(/\s+/g, ' ').trim();
}

/**
 * Strictly converts Santali text between supported scripts when linguistically valid.
 * Refuses to convert English or Hindi sentences directly into Ol Chiki characters.
 */
export function convertSantaliScript(
  text: string,
  fromScript: SantaliScript,
  toScript: SantaliScript,
  textLanguage: CommunicationLang = 'santali'
): { convertedText: string; isSupported: boolean; error?: string } {
  if (textLanguage !== 'santali') {
    return {
      convertedText: text,
      isSupported: false,
      error:
        'Script conversion is only valid for Santali text. Converting English or Hindi characters into Ol Chiki does not produce valid Santali translation.',
    };
  }

  if (fromScript === toScript) {
    return { convertedText: text, isSupported: true };
  }

  if (fromScript === 'olchiki' && toScript === 'roman') {
    return { convertedText: transliterateOlChikiToRoman(text), isSupported: true };
  }

  if (fromScript === 'olchiki' && toScript === 'devanagari') {
    return { convertedText: convertOlChikiToDevanagariSantali(text), isSupported: true };
  }

  return {
    convertedText: text,
    isSupported: false,
    error: `Automatic script conversion from ${fromScript} to ${toScript} requires a verified lexicon entry to avoid phonetic distortion.`,
  };
}

// ---------------------------------------------------------------------------
// 4. Utterance Normalization & Intent Classification
// ---------------------------------------------------------------------------
export function normalizeForMatch(str: string): string {
  return (str || '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[?!.,;:()"“”।]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const URGENT_MEDICAL_REGEX =
  /\b(doctor|hospital|unwell|sick|ill|medicine|emergency|ambulance|help|accident|pain|bleeding|fever|injury|doktor|haspatal|barij|goro)\b|(डॉक्टर|अस्पताल|बीमार|तबीयत|दवा|दवाई|मदद|बचाओ|दर्द)/i;

export function isUrgentOrMedicalMessage(text: string): boolean {
  return URGENT_MEDICAL_REGEX.test(text || '');
}

/**
 * Extracts the direct communicative sentence when a user phrases a request
 * as an instruction to Chotu (e.g., "Please ask them where the bus stand is"
 * -> "Where is the bus stand?", "Tell them I need help" -> "I need help.").
 */
export function extractCommunicativeUtterance(rawInput: string): {
  extracted: string;
  wasIndirectRequest: boolean;
  requestedTargetLang?: CommunicationLang;
} {
  const trimmed = (rawInput || '').trim();

  // Pattern 1: "How do I tell someone in Santali that <X>" / "How do I say <X> in Santali"
  const howToSayMatch = trimmed.match(
    /^(?:how\s+(?:do|can)\s+i\s+(?:tell\s+(?:someone|them)\s+(?:in\s+santali\s+)?(?:that\s+)?|say\s+)|how\s+to\s+say\s+)(.+?)(?:\s+in\s+santali)?[?.!]*$/i
  );
  if (howToSayMatch && howToSayMatch[1]) {
    let clause = howToSayMatch[1].trim().replace(/^["']|["']$/g, '');
    clause = clause.replace(/\s+in\s+santali$/i, '').trim();
    return {
      extracted: capitalizeFirst(clause),
      wasIndirectRequest: true,
      requestedTargetLang: 'santali',
    };
  }

  // Pattern 2: "Please ask them where the <X> is" -> "Where is the <X>?"
  const askWhereIsMatch = trimmed.match(
    /^(?:please\s+|can\s+you\s+|could\s+you\s+)?ask\s+(?:them|him|her)\s+where\s+(.+?)\s+is[?.!]*$/i
  );
  if (askWhereIsMatch && askWhereIsMatch[1]) {
    const subject = askWhereIsMatch[1].trim();
    return {
      extracted: `Where is ${subject}?`,
      wasIndirectRequest: true,
      requestedTargetLang: 'santali',
    };
  }

  // Pattern 3: "Ask them how much <X> costs" / "Ask them how much this costs"
  const askHowMuchMatch = trimmed.match(
    /^(?:please\s+|can\s+you\s+)?ask\s+(?:them|him|her)\s+how\s+much\s+(.+?)\s+costs[?.!]*$/i
  );
  if (askHowMuchMatch && askHowMuchMatch[1]) {
    const item = askHowMuchMatch[1].trim();
    return {
      extracted: `How much does ${item} cost?`,
      wasIndirectRequest: true,
      requestedTargetLang: 'santali',
    };
  }

  // Pattern 4: "Ask them what their name is"
  if (/^(?:please\s+)?ask\s+(?:them|him|her)\s+what\s+their\s+name\s+is[?.!]*$/i.test(trimmed)) {
    return {
      extracted: 'What is your name?',
      wasIndirectRequest: true,
      requestedTargetLang: 'santali',
    };
  }

  // Pattern 5: General "Please ask them <X>"
  const generalAskMatch = trimmed.match(
    /^(?:please\s+|can\s+you\s+|could\s+you\s+)?ask\s+(?:them|him|her)\s+(?:if\s+|whether\s+)?(.+?)[?.!]*$/i
  );
  if (generalAskMatch && generalAskMatch[1]) {
    const body = generalAskMatch[1]
      .trim()
      .replace(/\bthey\s+are\b/gi, 'you are')
      .replace(/\btheir\b/gi, 'your')
      .replace(/\bthey\s+have\b/gi, 'you have')
      .replace(/\bthey\s+can\b/gi, 'you can');
    return {
      extracted: `${capitalizeFirst(body)}?`,
      wasIndirectRequest: true,
      requestedTargetLang: 'santali',
    };
  }

  // Pattern 6: "Tell them (that) <X>" / "Please tell them <X>"
  const tellThemMatch = trimmed.match(
    /^(?:please\s+|can\s+you\s+|could\s+you\s+)?tell\s+(?:them|him|her)\s+(?:in\s+santali\s+)?(?:that\s+)?(.+?)[.!]*$/i
  );
  if (tellThemMatch && tellThemMatch[1]) {
    const body = tellThemMatch[1].trim().replace(/^["']|["']$/g, '');
    return {
      extracted: `${capitalizeFirst(body)}.`,
      wasIndirectRequest: true,
      requestedTargetLang: 'santali',
    };
  }

  // Pattern 7: "Translate to Santali: <X>" or "Translate <X> into Santali"
  const translatePrefixMatch = trimmed.match(
    /^translate\s+(?:this\s+)?(?:into|to)\s+(santali|english|hindi)\s*[:\-]\s*(.+)$/i
  );
  if (translatePrefixMatch && translatePrefixMatch[2]) {
    const lang = translatePrefixMatch[1].toLowerCase() as CommunicationLang;
    const body = translatePrefixMatch[2].trim().replace(/^["']|["']$/g, '');
    return {
      extracted: body,
      wasIndirectRequest: true,
      requestedTargetLang: lang,
    };
  }

  const translateQuotesMatch = trimmed.match(
    /^translate\s+["'](.+?)["']\s+(?:into|to)\s+(santali|english|hindi)[?.!]*$/i
  );
  if (translateQuotesMatch && translateQuotesMatch[1]) {
    const body = translateQuotesMatch[1].trim();
    const lang = translateQuotesMatch[2].toLowerCase() as CommunicationLang;
    return {
      extracted: body,
      wasIndirectRequest: true,
      requestedTargetLang: lang,
    };
  }

  // Pattern 8: Hindi indirect requests ("कृपया उनसे पूछें कि <X>" / "उन्हें बताएं कि <X>")
  const hindiIndirectMatch = trimmed.match(
    /^(?:कृपया\s+)?(?:उनसे\s+पूछें|उनसे\s+पूछो|उन्हें\s+बताएं|उन्हें\s+बताओ)\s+(?:कि\s+)?(.+)$/
  );
  if (hindiIndirectMatch && hindiIndirectMatch[1]) {
    return {
      extracted: hindiIndirectMatch[1].trim(),
      wasIndirectRequest: true,
      requestedTargetLang: 'santali',
    };
  }

  return {
    extracted: trimmed,
    wasIndirectRequest: false,
  };
}

function capitalizeFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Classifies the user's message into one of the 4 core modes (+ audio request):
 * A. translation (English/Hindi -> Santali)
 * B. two_way_communication (Setting up or conducting a two-way conversation bridge)
 * C. general_assistant (Educational or general mascot Q&A)
 * D. incoming_translation (Santali reply -> English/Hindi explanation)
 */
export function classifyUserIntent(
  rawInput: string,
  options?: {
    explicitSourceLang?: CommunicationLang | 'auto';
    explicitTargetLang?: CommunicationLang;
  }
): IntentClassificationResult {
  const trimmed = (rawInput || '').trim();
  const lower = trimmed.toLowerCase();
  const detected = detectLanguageAndScript(trimmed);
  const urgent = isUrgentOrMedicalMessage(trimmed);

  // 1. Check Audio Playback Request
  if (
    /\b(speak\s+this|read\s+this\s+aloud|play\s+(?:this|the)\s+(?:translated\s+)?(?:message|audio)|speak\s+.*?\s+aloud|can\s+you\s+speak\s+this)\b/i.test(
      lower
    )
  ) {
    return {
      intent: 'audio_request',
      rawInput: trimmed,
      extractedUtterance: trimmed,
      sourceLang: detected.language,
      targetLang: 'santali',
      detectedScript: detected.script,
      isUrgentOrMedical: false,
    };
  }

  // 2. Check Two-Way Communication Bridge Request
  if (
    /\b(help\s+me\s+talk\s+to\s+a\s+santali|translate\s+this\s+conversation\s+between|communicate\s+with\s+someone\s+who\s+speaks\s+santali|i\s+know\s+english.*don'?t\s+know\s+santali.*help\s+me\s+talk)\b/i.test(
      lower
    )
  ) {
    const { extracted } = extractCommunicativeUtterance(trimmed);
    return {
      intent: 'two_way_communication',
      rawInput: trimmed,
      extractedUtterance: extracted,
      sourceLang: detected.language,
      targetLang: 'santali',
      detectedScript: detected.script,
      isUrgentOrMedical: urgent,
    };
  }

  // 3. Check Incoming Santali Reply Translation ("They replied in Santali...", or Ol Chiki input)
  const incomingReplyMatch = trimmed.match(
    /(?:they\s+(?:replied|said|answered)(?:\s+in\s+santali)?\s*[:\-.]?\s*["']?(.+?)["']?\s*(?:explain\s+their\s+reply|what\s+does\s+(?:that|it|this)\s+mean|translate\s+(?:it|this|that))?)/i
  );
  if (
    /\b(they\s+replied\s+in\s+santali|explain\s+their\s+reply\s+to\s+me|what\s+did\s+they\s+say\s+in\s+santali)\b/i.test(
      lower
    )
  ) {
    // Extract quoted Santali text if provided
    const quotedMatch = trimmed.match(/["'“”](.+?)["'“”]/);
    const olChikiMatch = trimmed.match(/([\u1C50-\u1C7F][\u1C50-\u1C7F\s?!.,᱾ᱼ]+)/);
    const extractedSantali =
      (quotedMatch && quotedMatch[1]) ||
      (olChikiMatch && olChikiMatch[1]?.trim()) ||
      (incomingReplyMatch && incomingReplyMatch[1]?.trim()) ||
      '';
    const wantHindi = /\bin\s+hindi\b/i.test(lower);
    return {
      intent: 'incoming_translation',
      rawInput: trimmed,
      extractedUtterance: extractedSantali,
      sourceLang: 'santali',
      targetLang: wantHindi ? 'hindi' : 'english',
      detectedScript: /[\u1C50-\u1C7F]/.test(extractedSantali) ? 'olchiki' : 'roman',
      isUrgentOrMedical: urgent,
    };
  }

  // If the input itself is in Santali (Ol Chiki or Roman Santali) and user wants English/Hindi
  if (
    detected.language === 'santali' &&
    (options?.explicitTargetLang === 'english' || options?.explicitTargetLang === 'hindi')
  ) {
    return {
      intent: 'incoming_translation',
      rawInput: trimmed,
      extractedUtterance: trimmed,
      sourceLang: 'santali',
      targetLang: options.explicitTargetLang,
      detectedScript: detected.script,
      isUrgentOrMedical: urgent,
    };
  }

  // 4. Check Direct or Indirect Translation Request
  const extraction = extractCommunicativeUtterance(trimmed);
  if (extraction.wasIndirectRequest) {
    const target = extraction.requestedTargetLang || options?.explicitTargetLang || 'santali';
    const source =
      options?.explicitSourceLang && options.explicitSourceLang !== 'auto'
        ? options.explicitSourceLang
        : detectLanguageAndScript(extraction.extracted).language;
    return {
      intent: target === 'santali' ? 'translation' : 'incoming_translation',
      rawInput: trimmed,
      extractedUtterance: extraction.extracted,
      sourceLang: source,
      targetLang: target,
      detectedScript: detected.script,
      isUrgentOrMedical: isUrgentOrMedicalMessage(extraction.extracted),
    };
  }

  // Also check if the query matches a real-world communicative phrase (directions, prices, help, medical, needs)
  const matchedPhrase = findExactOrTemplatePhrase(
    trimmed,
    detected.language,
    options?.explicitTargetLang || 'santali'
  );
  if (
    matchedPhrase &&
    ['directions', 'shopping', 'help', 'medical', 'needs', 'polite', 'conversation'].includes(
      matchedPhrase.category
    )
  ) {
    return {
      intent: detected.language === 'santali' ? 'incoming_translation' : 'translation',
      rawInput: trimmed,
      extractedUtterance: trimmed,
      sourceLang: detected.language,
      targetLang:
        detected.language === 'santali'
          ? options?.explicitTargetLang === 'hindi'
            ? 'hindi'
            : 'english'
          : 'santali',
      detectedScript: detected.script,
      isUrgentOrMedical: Boolean(matchedPhrase.isUrgentOrMedical) || urgent,
    };
  }

  // Otherwise, check if it's an educational / mascot question vs general communication
  return {
    intent: 'general_assistant',
    rawInput: trimmed,
    extractedUtterance: trimmed,
    sourceLang: detected.language,
    targetLang: options?.explicitTargetLang || 'santali',
    detectedScript: detected.script,
    isUrgentOrMedical: urgent,
  };
}

// ---------------------------------------------------------------------------
// 5. Exact & Parameterized Template Phrasebook Matcher (NO Substring Guessing)
// ---------------------------------------------------------------------------
const PLACE_DICTIONARY: Record<
  string,
  { olchiki: string; roman: string; devanagari: string; english: string; hindi: string }
> = {
  'bus stand': {
    olchiki: 'ᱵᱟᱥ ᱤᱥᱴᱮᱱᱰ',
    roman: 'Bas istend',
    devanagari: 'बास इस्टेंड',
    english: ' the bus stand',
    hindi: 'बस स्टैंड',
  },
  'bus stop': {
    olchiki: 'ᱵᱟᱥ ᱤᱥᱴᱮᱱᱰ',
    roman: 'Bas istend',
    devanagari: 'बास इस्टेंड',
    english: ' the bus stop',
    hindi: 'बस स्टॉप',
  },
  hospital: {
    olchiki: 'ᱦᱟᱥᱯᱟᱛᱟᱞ',
    roman: 'Haspatal',
    devanagari: 'हास्पताल',
    english: ' the hospital',
    hindi: 'अस्पताल',
  },
  'nearest hospital': {
    olchiki: 'ᱥᱩᱨ ᱨᱮᱭᱟᱜ ᱦᱟᱥᱯᱟᱛᱟᱞ',
    roman: 'Sur reyag haspatal',
    devanagari: 'सुर रेयाग हास्पताल',
    english: ' the nearest hospital',
    hindi: 'सबसे नज़दीकी अस्पताल',
  },
  school: {
    olchiki: 'ᱟᱥᱲᱟ',
    roman: 'Asra',
    devanagari: 'आसड़ा',
    english: ' the school',
    hindi: 'स्कूल',
  },
  market: {
    olchiki: 'ᱵᱟᱡᱟᱨ',
    roman: 'Bajar',
    devanagari: 'बाजार',
    english: ' the market',
    hindi: 'बाज़ार',
  },
  'railway station': {
    olchiki: 'ᱨᱮᱞ ᱤᱥᱴᱮᱥᱚᱱ',
    roman: 'Rel isteson',
    devanagari: 'रेल इस्टेसोन',
    english: ' the railway station',
    hindi: 'रेलवे स्टेशन',
  },
  'train station': {
    olchiki: 'ᱨᱮᱞ ᱤᱥᱴᱮᱥᱚᱱ',
    roman: 'Rel isteson',
    devanagari: 'रेल इस्टेसोन',
    english: ' the train station',
    hindi: 'रेलवे स्टेशन',
  },
  village: {
    olchiki: 'ᱟᱹᱛᱩ',
    roman: 'Atu',
    devanagari: 'आतु',
    english: ' the village',
    hindi: 'गाँव',
  },
};

export function findExactOrTemplatePhrase(
  utterance: string,
  sourceLang: CommunicationLang,
  _targetLang: CommunicationLang
): (VerifiedPhraseEntry & { matchType: 'exact' | 'template' }) | null {
  const norm = normalizeForMatch(utterance);
  const rawTrimmed = (utterance || '').trim();

  if (!norm) return null;

  // 1. Exact Match against VERIFIED_PHRASE_CORPUS
  for (const entry of VERIFIED_PHRASE_CORPUS) {
    if (sourceLang === 'english') {
      const candidates = [entry.english, ...entry.englishVariants].map(normalizeForMatch);
      if (candidates.includes(norm)) {
        return { ...entry, matchType: 'exact' };
      }
    } else if (sourceLang === 'hindi') {
      const candidates = [entry.hindi, ...entry.hindiVariants].map(normalizeForMatch);
      if (candidates.includes(norm)) {
        return { ...entry, matchType: 'exact' };
      }
    } else if (sourceLang === 'santali') {
      const cleanOlChiki = entry.santaliOlChiki.replace(/[?!.᱾]/g, '').trim();
      const inputOlChiki = rawTrimmed.replace(/[?!.᱾]/g, '').trim();
      if (
        cleanOlChiki === inputOlChiki ||
        normalizeForMatch(entry.santaliRoman) === norm ||
        normalizeForMatch(entry.santaliDevanagari) === norm
      ) {
        return { ...entry, matchType: 'exact' };
      }
    }
  }

  // 2. Parameterized Template Match (Preserves custom names and numbers accurately)
  if (sourceLang === 'english') {
    // Template A: "My name is <Name>"
    const nameMatch = rawTrimmed.match(/^my\s+name\s+is\s+([A-Za-z][A-Za-z\s]{0,25}?)[.!]*$/i);
    if (nameMatch && nameMatch[1]) {
      const personName = nameMatch[1].trim();
      return {
        id: `tpl-name-${personName.toLowerCase()}`,
        category: 'introduction',
        english: `My name is ${personName}.`,
        englishVariants: [],
        hindi: `मेरा नाम ${personName} है।`,
        hindiVariants: [],
        santaliOlChiki: `ᱤᱧᱟᱜ ᱧᱩᱛᱩᱢ ᱫᱚ ${personName} ᱠᱟᱱᱟ᱾`,
        santaliRoman: `Inyag nyutum do ${personName} kana.`,
        santaliDevanagari: `इञाग ञुतुम दो ${personName} काना।`,
        backTranslationEnglish: `My name is ${personName}.`,
        backTranslationHindi: `मेरा नाम ${personName} है।`,
        matchType: 'template',
      };
    }

    // Template B: "I do not have <Number> rupees" / "I have <Number> rupees"
    const negRupeesMatch = rawTrimmed.match(
      /^i\s+(?:do\s+not|don'?t)\s+have\s+(\d+)\s+rupees[.!]*$/i
    );
    if (negRupeesMatch && negRupeesMatch[1]) {
      const num = negRupeesMatch[1];
      return {
        id: `tpl-neg-rupees-${num}`,
        category: 'shopping',
        english: `I do not have ${num} rupees.`,
        englishVariants: [],
        hindi: `मेरे पास ${num} रुपये नहीं हैं।`,
        hindiVariants: [],
        santaliOlChiki: `ᱤᱧ ᱴᱷᱮᱱ ${num} ᱴᱟᱠᱟ ᱵᱟᱹᱱᱩᱜᱼᱟ᱾`,
        santaliRoman: `Ing then ${num} taka banug-a.`,
        santaliDevanagari: `इञ ठेन ${num} टाका बानुग-आ।`,
        backTranslationEnglish: `I do not have ${num} rupees.`,
        backTranslationHindi: `मेरे पास ${num} रुपये नहीं हैं।`,
        matchType: 'template',
      };
    }

    const posRupeesMatch = rawTrimmed.match(/^i\s+have\s+(\d+)\s+rupees[.!]*$/i);
    if (posRupeesMatch && posRupeesMatch[1]) {
      const num = posRupeesMatch[1];
      return {
        id: `tpl-pos-rupees-${num}`,
        category: 'shopping',
        english: `I have ${num} rupees.`,
        englishVariants: [],
        hindi: `मेरे पास ${num} रुपये हैं।`,
        hindiVariants: [],
        santaliOlChiki: `ᱤᱧ ᱴᱷᱮᱱ ${num} ᱴᱟᱠᱟ ᱢᱮᱱᱟᱜᱼᱟ᱾`,
        santaliRoman: `Ing then ${num} taka menag-a.`,
        santaliDevanagari: `इञ ठेन ${num} टाका मेनाग-आ।`,
        backTranslationEnglish: `I have ${num} rupees.`,
        backTranslationHindi: `मेरे पास ${num} रुपये हैं।`,
        matchType: 'template',
      };
    }

    // Template C: "Where is (the) <KnownPlace>?"
    const whereMatch = rawTrimmed.match(/^where\s+is\s+(?:the\s+)?([a-zA-Z\s]+?)[?.!]*$/i);
    if (whereMatch && whereMatch[1]) {
      const placeKey = whereMatch[1].trim().toLowerCase();
      const placeInfo = PLACE_DICTIONARY[placeKey];
      if (placeInfo) {
        return {
          id: `tpl-where-${placeKey}`,
          category: 'directions',
          english: `Where is${placeInfo.english}?`,
          englishVariants: [],
          hindi: `${placeInfo.hindi} कहाँ है?`,
          hindiVariants: [],
          santaliOlChiki: `${placeInfo.olchiki} ᱫᱚ ᱚᱠᱟ ᱨᱮ ᱢᱮᱱᱟᱜᱼᱟ?`,
          santaliRoman: `${placeInfo.roman} do oka re menag-a?`,
          santaliDevanagari: `${placeInfo.devanagari} दो ओका रे मेनाग-आ?`,
          backTranslationEnglish: `Where is${placeInfo.english}?`,
          backTranslationHindi: `${placeInfo.hindi} कहाँ है?`,
          isUrgentOrMedical: placeKey.includes('hospital'),
          matchType: 'template',
        };
      }
    }
  }

  // Template D: Santali incoming reply with price "<Number> ᱴᱟᱠᱟ" or "<Number> taka"
  if (sourceLang === 'santali') {
    const santaliPriceMatch = rawTrimmed.match(/(\d+|[\u1C50-\u1C59]+)\s*(ᱴᱟᱠᱟ|taka)/i);
    if (santaliPriceMatch && santaliPriceMatch[1]) {
      const numStr = transliterateOlChikiToRoman(santaliPriceMatch[1]);
      return {
        id: `tpl-santali-price-${numStr}`,
        category: 'shopping',
        english: `It costs ${numStr} rupees.`,
        englishVariants: [],
        hindi: `इसकी कीमत ${numStr} रुपये है।`,
        hindiVariants: [],
        santaliOlChiki: `${santaliPriceMatch[1]} ᱴᱟᱠᱟ᱾`,
        santaliRoman: `${numStr} taka.`,
        santaliDevanagari: `${numStr} टाका।`,
        backTranslationEnglish: `${numStr} rupees.`,
        backTranslationHindi: `${numStr} रुपये।`,
        matchType: 'template',
      };
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// 6. Verified Vocabulary Extraction (Never Fabricated)
// ---------------------------------------------------------------------------
export function extractVerifiedVocabulary(text: string): VerifiedVocabularyItem[] {
  const norm = normalizeForMatch(text);
  const found: VerifiedVocabularyItem[] = [];
  const seen = new Set<string>();

  for (const item of SCHOOL_GLOSSARY) {
    const engWord = normalizeForMatch(item.english.split('/')[0]);
    const hiWord = normalizeForMatch(item.hindi.split('/')[0]);
    if (
      (engWord && new RegExp(`\\b${engWord}\\b`, 'i').test(norm)) ||
      (hiWord && text.includes(hiWord)) ||
      text.includes(item.santali.olchiki)
    ) {
      if (!seen.has(item.santali.olchiki)) {
        seen.add(item.santali.olchiki);
        found.push({
          santaliOlChiki: item.santali.olchiki,
          santaliRoman: item.santali.roman,
          english: item.english,
          hindi: item.hindi,
        });
      }
    }
  }

  return found;
}

// ---------------------------------------------------------------------------
// 7. Strict Translation Candidate Validator (Blocks English/Code Leakage)
// ---------------------------------------------------------------------------
const PROHIBITED_CODE_OR_AI_FRAGMENTS = [
  'custom/ai',
  'custom',
  'implement',
  'implementation',
  'system',
  'function',
  'variable',
  'undefined',
  'null',
  'boolean',
  'schema',
  'json',
  'api',
  'llm',
  'prompt',
  'backend',
  'frontend',
  'database',
  'algorithm',
  'parameter',
  'interface',
  'config',
  'runtime',
  'codebase',
  'repository',
  ' placeholder',
];

const COMMON_LEAKED_ENGLISH_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'that',
  'this',
  'from',
  'have',
  'will',
  'your',
  'what',
  'where',
  'when',
  'which',
  'their',
  'there',
  'about',
  'would',
  'could',
  'should',
  'please',
  'thank',
  'hello',
  'translation',
  'translated',
  'sentence',
  'meaning',
  'santali',
  'english',
  'hindi',
  'custom',
  'implement',
  'system',
]);

export function validateTranslationCandidate(params: {
  originalText: string;
  sourceLang: CommunicationLang;
  targetLang: CommunicationLang;
  candidateOlChiki?: string;
  candidateRoman?: string;
  candidateDevanagari?: string;
  candidateTranslatedText: string;
  backTranslation?: string;
  isFromPhrasebook: boolean;
}): ValidationOutcome {
  const {
    originalText,
    sourceLang,
    targetLang,
    candidateOlChiki = '',
    candidateRoman = '',
    candidateDevanagari = '',
    candidateTranslatedText = '',
    isFromPhrasebook,
  } = params;

  const rejectionReasons: string[] = [];
  const warnings: string[] = [];
  const lowerOriginal = (originalText || '').toLowerCase();

  // Combine all candidate Santali fields for contamination scan
  const combinedCandidate = `${candidateTranslatedText} ${candidateOlChiki} ${candidateRoman}`.toLowerCase();

  // 1. Check for prohibited code / AI / programming fragments (e.g., "custom/AI", "implement", "system")
  for (const badToken of PROHIBITED_CODE_OR_AI_FRAGMENTS) {
    const tokenRegex = new RegExp(`(?:^|[^a-z0-9])${badToken.replace('/', '\\/')}(?:$|[^a-z0-9])`, 'i');
    if (tokenRegex.test(combinedCandidate) && !tokenRegex.test(lowerOriginal)) {
      rejectionReasons.push(
        `Rejected fabricated technical/English fragment "${badToken}" in translation output.`
      );
    }
  }

  // 2. When translating into Santali, check Ol Chiki output for mixed English words
  if (targetLang === 'santali') {
    const olChikiTarget = candidateOlChiki || candidateTranslatedText;

    // Must contain authentic Ol Chiki characters
    if (!/[\u1C50-\u1C7F]/.test(olChikiTarget)) {
      rejectionReasons.push('Candidate Santali Ol Chiki output contains no Ol Chiki characters.');
    }

    // Check any Latin words embedded inside the Ol Chiki string
    const embeddedLatinWords = olChikiTarget.match(/[A-Za-z]+(?:\/[A-Za-z]+)*/g) || [];
    for (const latinWord of embeddedLatinWords) {
      const lwLower = latinWord.toLowerCase();
      // Only allow a Latin word inside Ol Chiki if it was an explicit proper noun / term in originalText
      const wasInOriginal = new RegExp(`\\b${lwLower.replace('/', '\\/')}\\b`, 'i').test(
        lowerOriginal
      );
      if (!wasInOriginal || COMMON_LEAKED_ENGLISH_WORDS.has(lwLower)) {
        rejectionReasons.push(
          `Rejected mixed English/code word "${latinWord}" inside Santali Ol Chiki output.`
        );
      }
    }

    // Check Roman Santali output for leaked English function words
    if (candidateRoman) {
      const romanWords = candidateRoman
        .toLowerCase()
        .replace(/[^a-z/\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);
      for (const rw of romanWords) {
        if (
          ['custom/ai', 'implement', 'system', 'translation', 'translated', 'because', 'however'].includes(
            rw
          ) &&
          !lowerOriginal.includes(rw)
        ) {
          rejectionReasons.push(
            `Rejected English word "${rw}" mixed into Roman Santali transliteration.`
          );
        }
      }
    }
  }

  // 3. Check Number Preservation
  const sourceNumbers: string[] = originalText.match(/\d+/g) || [];
  let preservedNumbers = true;
  if (sourceNumbers.length > 0) {
    const romanEquivalentOfOlChiki = transliterateOlChikiToRoman(
      `${candidateTranslatedText} ${candidateOlChiki} ${candidateRoman}`
    );
    for (const num of sourceNumbers) {
      const hasDigit = romanEquivalentOfOlChiki.includes(num);
      const hasWord =
        (num === '1' && /ᱢᱤᱫ|mit|one|एक/i.test(combinedCandidate)) ||
        (num === '2' && /ᱵᱟᱨ|bar|two|दो/i.test(combinedCandidate)) ||
        (num === '3' && /ᱯᱮ|pe|three|तीन/i.test(combinedCandidate)) ||
        (num === '4' && /ᱯᱳᱱ|pon|four|चार/i.test(combinedCandidate)) ||
        (num === '5' && /ᱢᱚᱬᱮ|more|five|पाँच/i.test(combinedCandidate)) ||
        (num === '10' && /ᱜᱮᱞ|gel|ten|दस/i.test(combinedCandidate));
      if (!hasDigit && !hasWord) {
        preservedNumbers = false;
        warnings.push(`Number "${num}" from the original message could not be verified in the output.`);
      }
    }
  }

  // 4. Check Negation Preservation
  const sourceHasNegation =
    sourceLang === 'english'
      ? /\b(not|no|never|don't|dont|doesn't|didn't|cannot|can't|won't)\b/i.test(originalText)
      : sourceLang === 'hindi'
      ? /(नहीं|मत|ना)/.test(originalText)
      : /(ᱵᱟᱝ|ᱵᱟᱹᱧ|ᱵᱟᱢ|ᱵᱟᱭ|ᱵᱟᱹᱱᱩᱜ|ᱟᱞᱚ|ᱟᱞᱚᱢ|\bbang\b|\bbany\b|\bbanug\b|\balo\b)/i.test(originalText);

  let preservedNegation = true;
  if (sourceHasNegation && targetLang === 'santali') {
    const targetHasSantaliNegation =
      /(ᱵᱟᱝ|ᱵᱟᱹᱧ|ᱵᱟᱢ|ᱵᱟᱭ|ᱵᱟᱹᱱᱩᱜ|ᱟᱞᱚ|ᱟᱞᱚᱢ|\bbang\b|\bbany\b|\bbam\b|\bbay\b|\bbanug\b|\balo\b|\balom\b)/i.test(
        `${candidateOlChiki} ${candidateRoman} ${candidateTranslatedText}`
      );
    if (!targetHasSantaliNegation) {
      preservedNegation = false;
      warnings.push(
        'Original message contains a negative ("not/no"), which could not be confirmed in the Santali candidate.'
      );
    }
  }

  // 5. Check Capitalized Proper Nouns Preservation (for English source)
  let preservedProperNouns = true;
  if (sourceLang === 'english') {
    const words = originalText.replace(/[?!.,;:()"']/g, '').split(/\s+/);
    // Words after index 0 that start with an uppercase letter and aren't "I" or "Santali"/"English"/"Hindi"
    const properNouns = words.slice(1).filter(
      (w) =>
        /^[A-Z][a-z]{2,}$/.test(w) &&
        !['Santali', 'English', 'Hindi', 'Please', 'Where', 'What', 'How'].includes(w)
    );
    for (const noun of properNouns) {
      const nounLower = noun.toLowerCase();
      const translitCombined = `${candidateRoman} ${transliterateOlChikiToRoman(candidateOlChiki)} ${candidateTranslatedText}`.toLowerCase();
      if (!translitCombined.includes(nounLower) && !translitCombined.includes(nounLower.slice(0, 4))) {
        preservedProperNouns = false;
        warnings.push(`Proper noun "${noun}" may not be preserved accurately.`);
      }
    }
  }

  const isValid = rejectionReasons.length === 0;
  let verificationStatus: VerificationStatus = 'unverified_ai';
  if (!isValid) {
    verificationStatus = 'validation_failed';
  } else if (isFromPhrasebook) {
    verificationStatus = 'verified_phrasebook';
  }

  if (!isFromPhrasebook && isValid) {
    warnings.push(
      'Santali translation could not be verified against the reference phrasebook. Marked as unverified AI candidate.'
    );
  }

  return {
    isValid,
    verificationStatus,
    rejectionReasons,
    warnings,
    cleanedOlChiki: isValid ? candidateOlChiki.trim() : '',
    cleanedRoman: isValid ? candidateRoman.trim() : '',
    cleanedDevanagari: isValid ? candidateDevanagari.trim() : '',
    preservedNumbers,
    preservedNegation,
    preservedProperNouns,
  };
}

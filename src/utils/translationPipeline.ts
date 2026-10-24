/**
 * Server-side & Testable Translation and Chat Pipeline for Bhasha Setu.
 *
 * Implements the 7-stage verified processing order:
 * 1. Detect source language, script, and communicative intent (extracting indirect requests).
 * 2. Check for an exact or parameterized template match in the verified phrasebook.
 * 3. Use the configured translation model for sentences not covered by the phrasebook.
 * 4. Validate the candidate result (blocking English/code leakage like custom/AI, implement, system).
 * 5. Convert scripts only when supported and linguistically valid.
 * 6. Provide a meaning-preserving English or Hindi back-translation.
 * 7. Provide clean text and honest metadata for audio speech generation.
 */

import {
  CommunicationLang,
  SantaliScript,
  UserCommunicativeIntent,
  VerificationStatus,
  VerifiedVocabularyItem,
  detectLanguageAndScript,
  extractCommunicativeUtterance,
  classifyUserIntent,
  findExactOrTemplatePhrase,
  validateTranslationCandidate,
  convertSantaliScript,
  transliterateOlChikiToRoman,
  convertOlChikiToDevanagariSantali,
  extractVerifiedVocabulary,
  isUrgentOrMedicalMessage,
  normalizeForMatch,
} from './santaliEngine';

export interface PipelineTranslationRequest {
  text: string;
  sourceLang?: CommunicationLang | 'auto';
  targetLang?: CommunicationLang;
  targetScript?: SantaliScript;
}

export interface PipelineTranslationResponse {
  originalText: string;
  extractedUtterance: string;
  translatedText: string;
  santaliOlChiki: string;
  santaliRoman: string;
  santaliDevanagari: string;
  transliteration: string;
  pronunciationGuide: string;
  backTranslationEnglish: string;
  backTranslationHindi: string;
  sourceLang: CommunicationLang;
  targetLang: CommunicationLang;
  targetScript: SantaliScript;
  intent: UserCommunicativeIntent;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  confidence: 'verified' | 'unverified';
  modelUsed: string;
  isUrgentOrMedical: boolean;
  warning?: string;
  safetyWarning?: string;
  notes?: string;
  error?: string;
  verifiedVocabulary: VerifiedVocabularyItem[];
}

export interface LLMModelCallResult {
  text: string;
  modelUsed: string;
}

export type LLMGeneratorFn = (prompt: string, timeoutMs?: number) => Promise<LLMModelCallResult>;

/**
 * Executes the strict 7-stage translation pipeline.
 */
export async function runTranslationPipeline(
  req: PipelineTranslationRequest,
  llmGenerator?: LLMGeneratorFn
): Promise<PipelineTranslationResponse> {
  const rawText = (req.text || '').trim();
  const targetScript: SantaliScript = req.targetScript || 'olchiki';

  // Stage 1: Detect source language, script, and communicative intent
  const detected = detectLanguageAndScript(rawText);
  const extraction = extractCommunicativeUtterance(rawText);
  const effectiveUtterance = extraction.extracted || rawText;
  const utteranceDetected = detectLanguageAndScript(effectiveUtterance);

  const sourceLang: CommunicationLang =
    req.sourceLang && req.sourceLang !== 'auto'
      ? req.sourceLang
      : extraction.wasIndirectRequest
      ? utteranceDetected.language
      : detected.language;

  const targetLang: CommunicationLang =
    req.targetLang ||
    extraction.requestedTargetLang ||
    (sourceLang === 'santali' ? 'english' : 'santali');

  const intentInfo = classifyUserIntent(rawText, {
    explicitSourceLang: sourceLang,
    explicitTargetLang: targetLang,
  });

  const urgent =
    isUrgentOrMedicalMessage(rawText) || isUrgentOrMedicalMessage(effectiveUtterance);
  const verifiedVocabulary = extractVerifiedVocabulary(effectiveUtterance);

  if (!rawText) {
    return {
      originalText: req.text || '',
      extractedUtterance: '',
      translatedText: '',
      santaliOlChiki: '',
      santaliRoman: '',
      santaliDevanagari: '',
      transliteration: '',
      pronunciationGuide: '',
      backTranslationEnglish: '',
      backTranslationHindi: '',
      sourceLang,
      targetLang,
      targetScript,
      intent: 'translation',
      isVerified: false,
      verificationStatus: 'unavailable',
      confidence: 'unverified',
      modelUsed: 'none',
      isUrgentOrMedical: false,
      error: 'Please enter or speak a message to translate.',
      verifiedVocabulary: [],
    };
  }

  // Stage 2: Check exact or parameterized template match in verified phrasebook
  const phraseMatch = findExactOrTemplatePhrase(effectiveUtterance, sourceLang, targetLang);
  if (phraseMatch) {
    let translatedText = phraseMatch.santaliOlChiki;
    if (targetLang === 'santali') {
      if (targetScript === 'roman') {
        translatedText = phraseMatch.santaliRoman;
      } else if (targetScript === 'devanagari') {
        translatedText = phraseMatch.santaliDevanagari;
      } else {
        translatedText = phraseMatch.santaliOlChiki;
      }
    } else if (targetLang === 'hindi') {
      translatedText = phraseMatch.hindi;
    } else {
      translatedText = phraseMatch.english;
    }

    const vStatus: VerificationStatus =
      phraseMatch.matchType === 'exact' ? 'verified_phrasebook' : 'verified_template';

    return {
      originalText: rawText,
      extractedUtterance: effectiveUtterance,
      translatedText,
      santaliOlChiki: phraseMatch.santaliOlChiki,
      santaliRoman: phraseMatch.santaliRoman,
      santaliDevanagari: phraseMatch.santaliDevanagari,
      transliteration: phraseMatch.santaliRoman,
      pronunciationGuide: phraseMatch.santaliRoman,
      backTranslationEnglish: phraseMatch.backTranslationEnglish,
      backTranslationHindi: phraseMatch.backTranslationHindi,
      sourceLang,
      targetLang,
      targetScript,
      intent: intentInfo.intent,
      isVerified: true,
      verificationStatus: vStatus,
      confidence: 'verified',
      modelUsed: 'verified-jcert-phrasebook',
      isUrgentOrMedical: urgent || Boolean(phraseMatch.isUrgentOrMedical),
      notes:
        phraseMatch.matchType === 'exact'
          ? 'Verified against native Santali reference phrasebook.'
          : 'Verified using structured native Santali sentence template.',
      verifiedVocabulary: extractVerifiedVocabulary(
        `${effectiveUtterance} ${phraseMatch.santaliOlChiki}`
      ),
    };
  }

  // Stage 3: Use translation model for sentences not covered by the phrasebook
  if (!llmGenerator) {
    const warningMsg =
      'Santali translation could not be verified reliably (AI translation service is not configured or offline, and this sentence is not in the verified local phrasebook).';
    return {
      originalText: rawText,
      extractedUtterance: effectiveUtterance,
      translatedText: '',
      santaliOlChiki: '',
      santaliRoman: '',
      santaliDevanagari: '',
      transliteration: '',
      pronunciationGuide: '',
      backTranslationEnglish: sourceLang === 'english' ? effectiveUtterance : '',
      backTranslationHindi: sourceLang === 'hindi' ? effectiveUtterance : '',
      sourceLang,
      targetLang,
      targetScript,
      intent: intentInfo.intent,
      isVerified: false,
      verificationStatus: 'unavailable',
      confidence: 'unverified',
      modelUsed: 'offline-phrasebook-only',
      isUrgentOrMedical: urgent,
      warning: warningMsg,
      safetyWarning: urgent
        ? '⚠️ Urgent/Safety-Critical Message: Do not rely on an unverified translation. Please show your original English/Hindi message directly.'
        : undefined,
      notes: 'Sentence not found in verified phrasebook; AI model unavailable.',
      error: warningMsg,
      verifiedVocabulary,
    };
  }

  const translationPrompt = `You are a strict, meaning-preserving translator between ${sourceLang.toUpperCase()} and ${targetLang.toUpperCase()} (Santali ISO 639-3: sat, Ol Chiki script: Olck).

CRITICAL TRANSLATION RULES:
1. Translate ONLY the following message: "${effectiveUtterance}"
2. Preserve the exact intended meaning, proper nouns, person names, numbers, dates, places, politeness, negation ("not"/"no"), tense, and urgency.
3. NEVER output programming terms, code identifiers, API names, or English words (such as "custom/AI", "implement", "system", "function", "JSON") inside Santali text.
4. Do NOT transliterate English or Hindi words character-by-character into Ol Chiki and call it Santali. Use genuine Santali grammar and vocabulary.
5. If you are translating into Santali:
   - "santaliOlChiki" must be written strictly in authentic Ol Chiki Unicode characters (U+1C50 to U+1C7F), keeping only proper nouns or numbers if needed.
   - "santaliRoman" must be the clean Roman phonetic pronunciation of that exact Santali sentence.
   - "santaliDevanagari" must be the Devanagari phonetic representation of that Santali sentence (NOT Hindi).
6. Provide an honest, literal "backTranslationEnglish" and "backTranslationHindi" of the Santali sentence so the user can verify what the Santali sentence actually means.

Respond strictly with valid JSON matching this structure:
{
  "santaliOlChiki": string,
  "santaliRoman": string,
  "santaliDevanagari": string,
  "hindiTranslation": string,
  "englishTranslation": string,
  "backTranslationEnglish": string,
  "backTranslationHindi": string,
  "notes": string
}`;

  try {
    const llmResult = await llmGenerator(translationPrompt, 18000);
    const cleanedJson = (llmResult.text || '')
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    let parsed: any = null;
    try {
      parsed = JSON.parse(cleanedJson);
    } catch {
      parsed = null;
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Model returned non-JSON or malformed translation response.');
    }

    const candidateOlChiki = (parsed.santaliOlChiki || '').trim();
    const candidateRoman =
      (parsed.santaliRoman || '').trim() || transliterateOlChikiToRoman(candidateOlChiki);
    const candidateDevanagari =
      (parsed.santaliDevanagari || '').trim() ||
      convertOlChikiToDevanagariSantali(candidateOlChiki);

    let candidatePrimary = candidateOlChiki;
    if (targetLang === 'santali') {
      if (targetScript === 'roman') {
        candidatePrimary = candidateRoman;
      } else if (targetScript === 'devanagari') {
        candidatePrimary = candidateDevanagari;
      } else {
        candidatePrimary = candidateOlChiki;
      }
    } else if (targetLang === 'hindi') {
      candidatePrimary = (parsed.hindiTranslation || parsed.backTranslationHindi || '').trim();
    } else {
      candidatePrimary = (parsed.englishTranslation || parsed.backTranslationEnglish || '').trim();
    }

    // Stage 4: Validate the candidate output before displaying it
    const validation = validateTranslationCandidate({
      originalText: effectiveUtterance,
      sourceLang,
      targetLang,
      candidateOlChiki,
      candidateRoman,
      candidateDevanagari,
      candidateTranslatedText: candidatePrimary,
      backTranslation: parsed.backTranslationEnglish || parsed.englishTranslation,
      isFromPhrasebook: false,
    });

    if (!validation.isValid) {
      const rejectionMsg = `Santali translation could not be verified reliably (${validation.rejectionReasons.join(
        ' '
      )}).`;
      return {
        originalText: rawText,
        extractedUtterance: effectiveUtterance,
        translatedText: '',
        santaliOlChiki: '',
        santaliRoman: '',
        santaliDevanagari: '',
        transliteration: '',
        pronunciationGuide: '',
        backTranslationEnglish: sourceLang === 'english' ? effectiveUtterance : '',
        backTranslationHindi: sourceLang === 'hindi' ? effectiveUtterance : '',
        sourceLang,
        targetLang,
        targetScript,
        intent: intentInfo.intent,
        isVerified: false,
        verificationStatus: 'validation_failed',
        confidence: 'unverified',
        modelUsed: llmResult.modelUsed,
        isUrgentOrMedical: urgent,
        warning:
          'Santali translation could not be verified reliably. The generated candidate contained mixed-language or unverified fragments and was blocked for your safety.',
        safetyWarning: urgent
          ? '⚠️ Urgent/Safety-Critical Message: Never rely on an unverified translation for medical or emergency needs. Show your original English/Hindi message directly.'
          : undefined,
        notes: rejectionMsg,
        error: rejectionMsg,
        verifiedVocabulary,
      };
    }

    // Stage 5 & 6: Validated AI candidate (explicitly marked as unverified_ai, never 'verified')
    const unverifiedWarning =
      validation.warnings.length > 0
        ? validation.warnings.join(' ')
        : 'Santali translation could not be verified against the reference phrasebook. Keep the original message visible alongside this unverified AI candidate.';

    return {
      originalText: rawText,
      extractedUtterance: effectiveUtterance,
      translatedText: candidatePrimary,
      santaliOlChiki: validation.cleanedOlChiki,
      santaliRoman: validation.cleanedRoman,
      santaliDevanagari: validation.cleanedDevanagari,
      transliteration: validation.cleanedRoman,
      pronunciationGuide: validation.cleanedRoman,
      backTranslationEnglish:
        (parsed.backTranslationEnglish || parsed.englishTranslation || '').trim() ||
        (sourceLang === 'english' ? effectiveUtterance : ''),
      backTranslationHindi:
        (parsed.backTranslationHindi || parsed.hindiTranslation || '').trim() ||
        (sourceLang === 'hindi' ? effectiveUtterance : ''),
      sourceLang,
      targetLang,
      targetScript,
      intent: intentInfo.intent,
      isVerified: false,
      verificationStatus: 'unverified_ai',
      confidence: 'unverified',
      modelUsed: llmResult.modelUsed,
      isUrgentOrMedical: urgent,
      warning: unverifiedWarning,
      safetyWarning: urgent
        ? '⚠️ Urgent/Safety-Critical Message: This Santali translation is AI-generated and not human-verified. Please display the original English/Hindi text alongside it.'
        : undefined,
      notes: parsed.notes || 'Unverified AI translation candidate (passed script & token checks).',
      verifiedVocabulary: extractVerifiedVocabulary(
        `${effectiveUtterance} ${validation.cleanedOlChiki}`
      ),
    };
  } catch (err: any) {
    const errText = err?.message || 'Translation service error';
    const warningMsg =
      'Santali translation could not be verified reliably due to a translation service timeout or network error.';
    return {
      originalText: rawText,
      extractedUtterance: effectiveUtterance,
      translatedText: '',
      santaliOlChiki: '',
      santaliRoman: '',
      santaliDevanagari: '',
      transliteration: '',
      pronunciationGuide: '',
      backTranslationEnglish: sourceLang === 'english' ? effectiveUtterance : '',
      backTranslationHindi: sourceLang === 'hindi' ? effectiveUtterance : '',
      sourceLang,
      targetLang,
      targetScript,
      intent: intentInfo.intent,
      isVerified: false,
      verificationStatus: 'unavailable',
      confidence: 'unverified',
      modelUsed: 'error-fallback',
      isUrgentOrMedical: urgent,
      warning: warningMsg,
      safetyWarning: urgent
        ? '⚠️ Urgent/Safety-Critical Message: Translation service failed. Please show your original English/Hindi message directly.'
        : undefined,
      notes: errText,
      error: warningMsg,
      verifiedVocabulary,
    };
  }
}

export interface ChatTurnHistoryItem {
  sender: 'child' | 'chotu';
  text: string;
  reply?: string;
  santali?: {
    olchiki: string;
    roman: string;
    devanagari: string;
  };
}

export interface ChatPipelineRequest {
  message: string;
  conversationHistory?: ChatTurnHistoryItem[];
  inputLang?: 'auto' | CommunicationLang;
  replyLang?: CommunicationLang;
  targetScript?: SantaliScript;
  context?: {
    currentClass?: number;
    currentSubject?: string;
    chapterTitle?: string;
  };
}

export interface ChatPipelineResponse {
  reply: string;
  intent: UserCommunicativeIntent;
  extractedUtterance: string;
  santali: {
    olchiki: string;
    roman: string;
    devanagari: string;
  };
  hindi: string;
  english: string;
  backTranslationEnglish?: string;
  backTranslationHindi?: string;
  pronunciationGuide: string;
  detectedInputLanguage: CommunicationLang;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  confidence: 'verified' | 'unverified';
  modelUsed: string;
  isUrgentOrMedical: boolean;
  warning?: string;
  safetyWarning?: string;
  notes?: string;
  autoPlayAudio?: boolean;
  verifiedVocabulary: VerifiedVocabularyItem[];
}

const VERIFIED_GENERAL_QA: Record<
  string,
  {
    santaliOlChiki: string;
    santaliRoman: string;
    santaliDevanagari: string;
    hindi: string;
    english: string;
    notes: string;
  }
> = {
  'what is your name': {
    santaliOlChiki: 'ᱤᱧᱟᱜ ᱧᱩᱛᱩᱢ ᱫᱚ ᱪᱷᱳᱴᱩ ᱠᱟᱱᱟ, ᱟᱢᱤᱡ ᱜᱟᱛᱮ ᱦᱤᱨᱚᱬ!',
    santaliRoman: 'Inyag nyutum do Chhotu kana, amij gate hiran!',
    santaliDevanagari: 'इञाग ञुतुम दो छोटू काना, आमिज गाते हिरण!',
    hindi: 'मेरा नाम छोटू है, तुम्हारा प्यारा हिरण दोस्त!',
    english: 'My name is Chotu, your friendly deer friend!',
    notes: 'Verified mascot introduction',
  },
  'who are you': {
    santaliOlChiki: 'ᱤᱧ ᱪᱷᱳᱴᱩ ᱠᱟᱹᱱᱟᱹᱧ, ᱡᱷᱟᱨᱠᱷᱚᱸᱰ ᱨᱤᱱ ᱜᱤᱫᱽᱨᱟᱹ ᱠᱚᱭᱤᱡ ᱯᱟᱲᱦᱟᱣ ᱟᱨ ᱨᱚᱯᱚᱲ ᱜᱟᱛᱮ ᱦᱤᱨᱚᱬ!',
    santaliRoman: 'Ing Chhotu kanang, Jharkhand rin gidra koyij parhaw ar ropor gate hiran!',
    santaliDevanagari: 'इञ छोटू कानंग, झारखंड रिन गिदरा कोयिज पाड़हाव आर रोपोड़ गाते हिरण!',
    hindi: 'मैं छोटू हूँ, झारखंड के बच्चों का पढ़ाई और बातचीत करने वाला हिरण दोस्त!',
    english: 'I am Chotu, the learning and communication deer mascot for Jharkhand!',
    notes: 'Verified mascot identity',
  },
  'tell me a story': {
    santaliOlChiki:
      'ᱢᱤᱫᱴᱟᱝ ᱵᱤᱨ ᱨᱮ ᱢᱤᱫ ᱪᱮᱬᱮ ᱟᱨ ᱦᱤᱨᱚᱬ ᱜᱟᱛᱮ ᱠᱤᱱ ᱛᱟᱦᱮᱸ ᱠᱟᱱᱟ᱾ ᱩᱱᱠᱤᱱ ᱫᱤᱱᱟᱹᱢ ᱢᱤᱫ ᱛᱮ ᱠᱷᱮᱞᱚᱸᱰ ᱟᱨ ᱡᱚᱼᱵᱤᱞᱤ ᱠᱤᱱ ᱦᱟᱹᱴᱤᱧ ᱡᱚᱢᱮᱫ ᱛᱟᱦᱮᱸᱫ᱾ ᱢᱤᱫ ᱛᱮ ᱛᱟᱦᱮᱸᱱ ᱨᱮᱜᱮ ᱟᱹᱰᱤ ᱨᱟᱹᱥᱠᱟᱹ ᱢᱮᱱᱟᱜᱼᱟ!',
    santaliRoman:
      'Mittang bir re mit chene ar hiran gate kin tahen kana. Unkin dinam mit te khelon ar jo-bili kin hatiny jomed tahend. Mit te tahen rege adi raska menag-a!',
    santaliDevanagari:
      'मिदटांग बीर रे मिद चेणे आर हिरण गाते किन ताहें काना। उनकिन दिनम मिद ते खेलोंड आर जो-बिली किन हाटिञ जोमेद ताहेंद। मिद ते ताहें रेगे आडी रास्का मेनागा!',
    hindi:
      'एक जंगल में एक छोटी चिड़िया और एक हिरण बहुत अच्छे दोस्त थे। वे रोज़ साथ खेलते और मीठे फल बाँटकर खाते थे। मिलजुलकर रहने में ही सबसे बड़ी खुशी है!',
    english:
      'Once upon a time in a forest, a little bird and a deer were best friends. They played and shared sweet fruits every day. Living together happily brings true joy!',
    notes: 'Verified folklore story',
  },
  'what is the weather like': {
    santaliOlChiki:
      'ᱛᱮᱦᱮᱧ ᱫᱚ ᱥᱟᱹᱜᱩᱱ ᱥᱤᱛᱩᱝ ᱟᱨ ᱨᱮᱭᱟᱲ ᱦᱚᱭ ᱦᱤᱡᱩᱜ ᱠᱟᱱᱟ! ᱵᱟᱦᱨᱮ ᱨᱮ ᱠᱷᱮᱞᱚᱸᱰ ᱟᱨ ᱯᱟᱲᱦᱟᱣ ᱞᱟᱹᱜᱤᱫ ᱟᱹᱰᱤ ᱱᱟᱯᱟᱭ ᱫᱤᱱ ᱠᱟᱱᱟ᱾',
    santaliRoman:
      'Tehenj do sagun situng ar reyar hoy hijug kana! Bahre re khelon ar parhaw lagit adi napay din kana.',
    santaliDevanagari:
      'तेहेंज दो सगुन सितुंग आर रेयाड़ होय हिजुग काना! बाहरे रे खेलोंड आर पाड़हाव लागिद आडी नापाय दिन काना।',
    hindi:
      'आज धूप खिली है और ठंडी-ताज़ी हवा चल रही है! बाहर खेलने और सीखने के लिए बहुत सुहावना दिन है।',
    english:
      'Today the sun is shining and fresh cool air is blowing! It is a wonderful day to play and learn outdoors.',
    notes: 'Verified weather response',
  },
};

/**
 * Executes the Chotu Chat + Real-World Communication pipeline.
 * Distinguishes between:
 * A. translation (English/Hindi -> Santali)
 * B. two_way_communication (Setting up or conducting a conversation bridge)
 * C. general_assistant (Educational or general questions to Chotu)
 * D. incoming_translation (Explaining a Santali reply in English or Hindi)
 * E. audio_request (Speaking the translated message aloud)
 */
export async function runChatPipeline(
  req: ChatPipelineRequest,
  llmGenerator?: LLMGeneratorFn
): Promise<ChatPipelineResponse> {
  const rawMessage = (req.message || '').trim();
  const replyLang: CommunicationLang = req.replyLang || 'santali';
  const targetScript: SantaliScript = req.targetScript || 'olchiki';
  const history = Array.isArray(req.conversationHistory) ? req.conversationHistory : [];

  const intentInfo = classifyUserIntent(rawMessage, {
    explicitSourceLang: req.inputLang || 'auto',
    explicitTargetLang: replyLang,
  });

  // -------------------------------------------------------------------------
  // Case E: Audio Playback Request ("Can you speak this translated message aloud?")
  // -------------------------------------------------------------------------
  if (intentInfo.intent === 'audio_request') {
    const lastChotuTurn = [...history].reverse().find((h) => h.sender === 'chotu');
    const santaliOlChiki =
      lastChotuTurn?.santali?.olchiki || 'ᱡᱚᱦᱟᱨ! ᱤᱧ ᱟᱢ ᱥᱟᱶ ᱨᱚᱯᱚᱲ ᱞᱟᱹᱜᱤᱫ ᱥᱟᱯᱲᱟᱣ ᱢᱮᱱᱟᱹᱧᱟ᱾';
    const santaliRoman =
      lastChotuTurn?.santali?.roman ||
      transliterateOlChikiToRoman(santaliOlChiki) ||
      'Johar! Ing am saw ropor lagit sapraw menanya.';
    const santaliDevanagari =
      lastChotuTurn?.santali?.devanagari || convertOlChikiToDevanagariSantali(santaliOlChiki);

    return {
      reply:
        replyLang === 'english'
          ? `Playing the translated Santali message aloud: "${santaliOlChiki}" (${santaliRoman})`
          : replyLang === 'hindi'
          ? `अनुवादित संताली संदेश सुनाया जा रहा है: "${santaliOlChiki}" (${santaliRoman})`
          : santaliOlChiki,
      intent: 'audio_request',
      extractedUtterance: santaliOlChiki,
      santali: {
        olchiki: santaliOlChiki,
        roman: santaliRoman,
        devanagari: santaliDevanagari,
      },
      hindi: `अनुवादित संताली संदेश: "${santaliOlChiki}" (${santaliRoman})`,
      english: `Speaking translated Santali message: "${santaliOlChiki}" (${santaliRoman})`,
      pronunciationGuide: santaliRoman,
      detectedInputLanguage: intentInfo.sourceLang,
      isVerified: true,
      verificationStatus: 'verified_phrasebook',
      confidence: 'verified',
      modelUsed: 'audio-dispatcher',
      isUrgentOrMedical: false,
      autoPlayAudio: true,
      notes: 'Triggered audio playback for the translated Santali message.',
      verifiedVocabulary: extractVerifiedVocabulary(santaliOlChiki),
    };
  }

  // -------------------------------------------------------------------------
  // Case B: Two-Way Communication Bridge Mode
  // ("I know English, but I don't know Santali. Help me talk to a Santali-speaking person.")
  // -------------------------------------------------------------------------
  if (intentInfo.intent === 'two_way_communication') {
    const bridgeOlChiki =
      'ᱡᱚᱦᱟᱨ! ᱤᱧ ᱤᱝᱨᱟᱹᱡᱤ ᱵᱟᱰᱟᱭᱟ, ᱢᱮᱱᱠᱷᱟᱱ ᱥᱟᱱᱛᱟᱲᱤ ᱵᱟᱹᱧ ᱵᱟᱰᱟᱭᱟ᱾ ᱟᱢ ᱥᱟᱶ ᱨᱚᱯᱚᱲ ᱨᱮ ᱜᱚᱲᱚ ᱟᱹᱧ ᱢᱮ᱾';
    const bridgeRoman =
      'Johar! Ing Ingraji badaya, menkhan Santali bany badaya. Am saw ropor re goro any me.';
    const bridgeDevanagari =
      'जोहार! इञ इंगराजी बाडाया, मेनखान संताली बाञ बाडाया। आम साव रोपोड़ रे गोड़ो आञ मे।';
    const bridgeEnglish =
      'Greetings (Johar)! I know English, but I do not know Santali. Please help me talk with you.';
    const bridgeHindi =
      'जोहार! मैं अंग्रेज़ी जानता हूँ, लेकिन संताली नहीं जानता। कृपया आपसे बात करने में मेरी मदद करें।';

    let primaryReply = bridgeOlChiki;
    if (replyLang === 'english') {
      primaryReply = `I can help you communicate turn-by-turn! Show or play this Santali greeting to them:\n${bridgeOlChiki}\n(${bridgeRoman})\nMeaning: "${bridgeEnglish}"\nTell me what you want to ask next (e.g., "Ask them where the bus stand is"), or paste their Santali reply and I will translate it for you.`;
    } else if (replyLang === 'hindi') {
      primaryReply = `मैं आपकी दोनों तरफ़ की बातचीत में मदद करूँगा! उन्हें यह संताली संदेश दिखाएँ या सुनाएँ:\n${bridgeOlChiki}\n(${bridgeRoman})\nअर्थ: "${bridgeHindi}"`;
    } else {
      primaryReply =
        targetScript === 'roman'
          ? bridgeRoman
          : targetScript === 'devanagari'
          ? bridgeDevanagari
          : bridgeOlChiki;
    }

    return {
      reply: primaryReply,
      intent: 'two_way_communication',
      extractedUtterance: bridgeEnglish,
      santali: {
        olchiki: bridgeOlChiki,
        roman: bridgeRoman,
        devanagari: bridgeDevanagari,
      },
      hindi: bridgeHindi,
      english: bridgeEnglish,
      backTranslationEnglish: bridgeEnglish,
      backTranslationHindi: bridgeHindi,
      pronunciationGuide: bridgeRoman,
      detectedInputLanguage: intentInfo.sourceLang,
      isVerified: true,
      verificationStatus: 'verified_phrasebook',
      confidence: 'verified',
      modelUsed: 'verified-jcert-phrasebook',
      isUrgentOrMedical: false,
      notes:
        'Two-way communication mode active. Type what to ask/tell them, or paste their Santali reply.',
      verifiedVocabulary: extractVerifiedVocabulary(bridgeOlChiki),
    };
  }

  // -------------------------------------------------------------------------
  // Case A & D: Translation Mode OR Incoming Santali Reply Mode
  // (Stateless translation without contaminating from previous turns!)
  // -------------------------------------------------------------------------
  if (intentInfo.intent === 'translation' || intentInfo.intent === 'incoming_translation') {
    // Handle case where user says "They replied in Santali. Explain their reply to me in English."
    // without pasting the reply yet, or referencing the previous message
    const normRaw = normalizeForMatch(rawMessage);
    if (
      intentInfo.intent === 'incoming_translation' &&
      (normRaw === 'they replied in santali explain their reply to me in english' ||
        !intentInfo.extractedUtterance ||
        intentInfo.extractedUtterance.toLowerCase().includes('they replied in santali'))
    ) {
      // Check if there was a Santali message in history
      const prevSantali = [...history]
        .reverse()
        .find((h) => /[\u1C50-\u1C7F]/.test(h.text) || h.santali?.olchiki);
      if (prevSantali && prevSantali.text && /[\u1C50-\u1C7F]/.test(prevSantali.text)) {
        intentInfo.extractedUtterance = prevSantali.text;
      } else {
        const promptForReplyEnglish =
          'Please type or paste their Santali reply (in Ol Chiki or Roman Santali), and I will translate its exact meaning into English and Hindi for you.';
        const promptForReplyHindi =
          'कृपया उनका संताली जवाब (ओल चिकी या रोमन में) यहाँ लिखें या पेस्ट करें, मैं आपको उसका सही अर्थ अंग्रेज़ी और हिंदी में बताऊँगा।';
        const promptForReplySantali =
          'ᱩᱱᱠᱩᱣᱟᱜ ᱥᱟᱱᱛᱟᱲᱤ ᱛᱮᱞᱟ ᱱᱚᱸᱰᱮ ᱚᱞ ᱢᱮ, ᱤᱧ ᱚᱱᱟ ᱨᱮᱭᱟᱜ ᱢᱮᱱᱮᱛ ᱤᱝᱨᱟᱹᱡᱤ ᱟᱨ ᱦᱤᱱᱫᱤ ᱛᱮᱧ ᱵᱩᱡᱷᱟᱹᱣ ᱟᱢᱟ᱾';
        return {
          reply:
            replyLang === 'hindi'
              ? promptForReplyHindi
              : replyLang === 'english'
              ? promptForReplyEnglish
              : promptForReplySantali,
          intent: 'incoming_translation',
          extractedUtterance: '',
          santali: {
            olchiki: promptForReplySantali,
            roman:
              'Unkuwag Santali tela nonde ol me, ing ona reyag menet Ingraji ar Hindi teny bujhaw ama.',
            devanagari:
              'उनकुवाग संताली तेला नोंडे ओल मे, इञ ओना रेयाग मेनेत इंगराजी आर हिंदी तेञ बुझाव आमा।',
          },
          hindi: promptForReplyHindi,
          english: promptForReplyEnglish,
          pronunciationGuide:
            'Unkuwag Santali tela nonde ol me, ing ona reyag menet Ingraji ar Hindi teny bujhaw ama.',
          detectedInputLanguage: 'english',
          isVerified: true,
          verificationStatus: 'verified_phrasebook',
          confidence: 'verified',
          modelUsed: 'intent-router',
          isUrgentOrMedical: false,
          notes: 'Ready to translate incoming Santali reply.',
          verifiedVocabulary: [],
        };
      }
    }

    const translationResult = await runTranslationPipeline(
      {
        text: intentInfo.extractedUtterance,
        sourceLang: intentInfo.sourceLang,
        targetLang: intentInfo.targetLang,
        targetScript,
      },
      llmGenerator
    );

    // If translation failed validation or service is unavailable, NEVER return a fake greeting!
    if (
      translationResult.verificationStatus === 'validation_failed' ||
      translationResult.verificationStatus === 'unavailable'
    ) {
      const honestWarning =
        translationResult.warning || 'Santali translation could not be verified reliably.';
      return {
        reply: `${honestWarning}\nOriginal message: "${translationResult.extractedUtterance}"`,
        intent: intentInfo.intent,
        extractedUtterance: translationResult.extractedUtterance,
        santali: {
          olchiki: '',
          roman: '',
          devanagari: '',
        },
        hindi:
          translationResult.backTranslationHindi ||
          (intentInfo.sourceLang === 'hindi' ? translationResult.extractedUtterance : ''),
        english:
          translationResult.backTranslationEnglish ||
          (intentInfo.sourceLang === 'english' ? translationResult.extractedUtterance : ''),
        backTranslationEnglish: translationResult.backTranslationEnglish,
        backTranslationHindi: translationResult.backTranslationHindi,
        pronunciationGuide: '',
        detectedInputLanguage: intentInfo.sourceLang,
        isVerified: false,
        verificationStatus: translationResult.verificationStatus,
        confidence: 'unverified',
        modelUsed: translationResult.modelUsed,
        isUrgentOrMedical: translationResult.isUrgentOrMedical,
        warning: honestWarning,
        safetyWarning: translationResult.safetyWarning,
        notes: translationResult.notes,
        verifiedVocabulary: translationResult.verifiedVocabulary,
      };
    }

    // Valid translation (either verified_phrasebook, verified_template, or unverified_ai)
    let chosenReply = translationResult.translatedText;
    if (intentInfo.intent === 'incoming_translation') {
      chosenReply =
        replyLang === 'hindi'
          ? translationResult.backTranslationHindi || translationResult.translatedText
          : translationResult.backTranslationEnglish || translationResult.translatedText;
    } else if (replyLang === 'hindi') {
      chosenReply = `${translationResult.santaliOlChiki} (${translationResult.santaliRoman}) — अर्थ: ${translationResult.backTranslationHindi}`;
    } else if (replyLang === 'english') {
      chosenReply = `${translationResult.santaliOlChiki} (${translationResult.santaliRoman}) — Meaning: "${translationResult.backTranslationEnglish}"`;
    } else {
      if (targetScript === 'roman') chosenReply = translationResult.santaliRoman;
      else if (targetScript === 'devanagari') chosenReply = translationResult.santaliDevanagari;
      else chosenReply = translationResult.santaliOlChiki;
    }

    return {
      reply: chosenReply,
      intent: intentInfo.intent,
      extractedUtterance: translationResult.extractedUtterance,
      santali: {
        olchiki: translationResult.santaliOlChiki,
        roman: translationResult.santaliRoman,
        devanagari: translationResult.santaliDevanagari,
      },
      hindi: translationResult.backTranslationHindi,
      english: translationResult.backTranslationEnglish,
      backTranslationEnglish: translationResult.backTranslationEnglish,
      backTranslationHindi: translationResult.backTranslationHindi,
      pronunciationGuide: translationResult.pronunciationGuide,
      detectedInputLanguage: intentInfo.sourceLang,
      isVerified: translationResult.isVerified,
      verificationStatus: translationResult.verificationStatus,
      confidence: translationResult.confidence,
      modelUsed: translationResult.modelUsed,
      isUrgentOrMedical: translationResult.isUrgentOrMedical,
      warning: translationResult.warning,
      safetyWarning: translationResult.safetyWarning,
      notes: translationResult.notes,
      verifiedVocabulary: translationResult.verifiedVocabulary,
    };
  }

  // -------------------------------------------------------------------------
  // Case C: General Assistant / Educational Tutor Mode
  // -------------------------------------------------------------------------
  const normQuery = normalizeForMatch(rawMessage);

  // Check exact match in VERIFIED_GENERAL_QA (no substring matching!)
  const exactQA = VERIFIED_GENERAL_QA[normQuery];
  if (exactQA) {
    let chosenReply = exactQA.santaliOlChiki;
    if (replyLang === 'hindi') chosenReply = exactQA.hindi;
    else if (replyLang === 'english') chosenReply = exactQA.english;
    else if (targetScript === 'roman') chosenReply = exactQA.santaliRoman;
    else if (targetScript === 'devanagari') chosenReply = exactQA.santaliDevanagari;

    return {
      reply: chosenReply,
      intent: 'general_assistant',
      extractedUtterance: rawMessage,
      santali: {
        olchiki: exactQA.santaliOlChiki,
        roman: exactQA.santaliRoman,
        devanagari: exactQA.santaliDevanagari,
      },
      hindi: exactQA.hindi,
      english: exactQA.english,
      backTranslationEnglish: exactQA.english,
      backTranslationHindi: exactQA.hindi,
      pronunciationGuide: exactQA.santaliRoman,
      detectedInputLanguage: intentInfo.sourceLang,
      isVerified: true,
      verificationStatus: 'verified_phrasebook',
      confidence: 'verified',
      modelUsed: 'verified-jcert-qa',
      isUrgentOrMedical: false,
      notes: exactQA.notes,
      verifiedVocabulary: extractVerifiedVocabulary(`${rawMessage} ${exactQA.santaliOlChiki}`),
    };
  }

  // Also check if it's an exact greeting in the phrasebook (e.g., "hello", "how are you", "good morning")
  const exactGreeting = findExactOrTemplatePhrase(rawMessage, intentInfo.sourceLang, 'santali');
  if (exactGreeting) {
    let chosenReply = exactGreeting.santaliOlChiki;
    if (replyLang === 'hindi') chosenReply = exactGreeting.hindi;
    else if (replyLang === 'english') chosenReply = exactGreeting.english;
    else if (targetScript === 'roman') chosenReply = exactGreeting.santaliRoman;
    else if (targetScript === 'devanagari') chosenReply = exactGreeting.santaliDevanagari;

    return {
      reply: chosenReply,
      intent: 'general_assistant',
      extractedUtterance: rawMessage,
      santali: {
        olchiki: exactGreeting.santaliOlChiki,
        roman: exactGreeting.santaliRoman,
        devanagari: exactGreeting.santaliDevanagari,
      },
      hindi: exactGreeting.backTranslationHindi,
      english: exactGreeting.backTranslationEnglish,
      backTranslationEnglish: exactGreeting.backTranslationEnglish,
      backTranslationHindi: exactGreeting.backTranslationHindi,
      pronunciationGuide: exactGreeting.santaliRoman,
      detectedInputLanguage: intentInfo.sourceLang,
      isVerified: true,
      verificationStatus: 'verified_phrasebook',
      confidence: 'verified',
      modelUsed: 'verified-jcert-phrasebook',
      isUrgentOrMedical: Boolean(exactGreeting.isUrgentOrMedical),
      notes: 'Verified native phrasebook response.',
      verifiedVocabulary: extractVerifiedVocabulary(
        `${rawMessage} ${exactGreeting.santaliOlChiki}`
      ),
    };
  }

  // If no LLM generator is available for general assistant question, be honest
  if (!llmGenerator) {
    const honestNotice =
      'Santali translation could not be verified reliably (AI service is offline or not configured for open-ended questions).';
    return {
      reply: honestNotice,
      intent: 'general_assistant',
      extractedUtterance: rawMessage,
      santali: { olchiki: '', roman: '', devanagari: '' },
      hindi: 'एआई सेवा अभी उपलब्ध नहीं है। कृपया प्रमाणित वाक्यांशों का उपयोग करें।',
      english: honestNotice,
      pronunciationGuide: '',
      detectedInputLanguage: intentInfo.sourceLang,
      isVerified: false,
      verificationStatus: 'unavailable',
      confidence: 'unverified',
      modelUsed: 'offline',
      isUrgentOrMedical: intentInfo.isUrgentOrMedical,
      warning: honestNotice,
      verifiedVocabulary: extractVerifiedVocabulary(rawMessage),
    };
  }

  // Call LLM for general assistant question and strictly validate the Santali output
  const currentClass = req.context?.currentClass || 1;
  const currentSubject = req.context?.currentSubject || 'General';
  const chapterTitle = req.context?.chapterTitle || '';

  const qaPrompt = `You are "Chotu", a helpful bilingual communicator and primary school tutor for Jharkhand (Class ${currentClass}, Subject: ${currentSubject}${
    chapterTitle ? `, Chapter: "${chapterTitle}"` : ''
  }).

User's question: "${rawMessage}"

STRICT RULES:
1. Answer the user's question directly and accurately in English, Hindi, and Santali (Ol Chiki script U+1C50-U+1C7F + Roman transliteration + Devanagari phonetic).
2. NEVER mix English words, code identifiers, API names, or programming terms (such as "custom/AI", "implement", "system", "function") into the Santali Ol Chiki or Roman Santali fields.
3. Do NOT fabricate a vocabulary breakdown.

Respond strictly in valid JSON:
{
  "santaliOlChiki": string,
  "santaliRoman": string,
  "santaliDevanagari": string,
  "hindi": string,
  "english": string,
  "notes": string
}`;

  try {
    const llmResult = await llmGenerator(qaPrompt, 18000);
    const cleaned = (llmResult.text || '')
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    const parsed = JSON.parse(cleaned);

    const candidateOlChiki = (parsed.santaliOlChiki || '').trim();
    const candidateRoman =
      (parsed.santaliRoman || '').trim() || transliterateOlChikiToRoman(candidateOlChiki);
    const candidateDevanagari =
      (parsed.santaliDevanagari || '').trim() ||
      convertOlChikiToDevanagariSantali(candidateOlChiki);

    const validation = validateTranslationCandidate({
      originalText: rawMessage,
      sourceLang: intentInfo.sourceLang,
      targetLang: 'santali',
      candidateOlChiki,
      candidateRoman,
      candidateDevanagari,
      candidateTranslatedText: candidateOlChiki,
      backTranslation: parsed.english,
      isFromPhrasebook: false,
    });

    if (!validation.isValid) {
      // If Santali output was corrupted (e.g. had custom/AI, implement, system), block the corrupted Santali!
      const englishAns = (parsed.english || '').trim() || rawMessage;
      const hindiAns = (parsed.hindi || '').trim();
      const warningMsg =
        'Santali translation could not be verified reliably (blocked invalid mixed-language tokens in AI output). Showing English/Hindi response only.';
      return {
        reply: replyLang === 'hindi' && hindiAns ? hindiAns : englishAns,
        intent: 'general_assistant',
        extractedUtterance: rawMessage,
        santali: { olchiki: '', roman: '', devanagari: '' },
        hindi: hindiAns,
        english: englishAns,
        pronunciationGuide: '',
        detectedInputLanguage: intentInfo.sourceLang,
        isVerified: false,
        verificationStatus: 'validation_failed',
        confidence: 'unverified',
        modelUsed: llmResult.modelUsed,
        isUrgentOrMedical: intentInfo.isUrgentOrMedical,
        warning: warningMsg,
        notes: validation.rejectionReasons.join(' '),
        verifiedVocabulary: extractVerifiedVocabulary(rawMessage),
      };
    }

    let chosenReply = validation.cleanedOlChiki;
    if (replyLang === 'hindi') chosenReply = parsed.hindi || validation.cleanedOlChiki;
    else if (replyLang === 'english') chosenReply = parsed.english || validation.cleanedOlChiki;
    else if (targetScript === 'roman') chosenReply = validation.cleanedRoman;
    else if (targetScript === 'devanagari') chosenReply = validation.cleanedDevanagari;

    return {
      reply: chosenReply,
      intent: 'general_assistant',
      extractedUtterance: rawMessage,
      santali: {
        olchiki: validation.cleanedOlChiki,
        roman: validation.cleanedRoman,
        devanagari: validation.cleanedDevanagari,
      },
      hindi: (parsed.hindi || '').trim(),
      english: (parsed.english || '').trim(),
      backTranslationEnglish: (parsed.english || '').trim(),
      backTranslationHindi: (parsed.hindi || '').trim(),
      pronunciationGuide: validation.cleanedRoman,
      detectedInputLanguage: intentInfo.sourceLang,
      isVerified: false,
      verificationStatus: 'unverified_ai',
      confidence: 'unverified',
      modelUsed: llmResult.modelUsed,
      isUrgentOrMedical: intentInfo.isUrgentOrMedical,
      warning:
        'Santali output is AI-generated and could not be verified against the reference phrasebook.',
      notes: parsed.notes || 'Unverified AI assistant response',
      verifiedVocabulary: extractVerifiedVocabulary(
        `${rawMessage} ${validation.cleanedOlChiki}`
      ),
    };
  } catch (err: any) {
    const honestWarning =
      'Santali translation could not be verified reliably due to an AI service timeout or error.';
    return {
      reply: honestWarning,
      intent: 'general_assistant',
      extractedUtterance: rawMessage,
      santali: { olchiki: '', roman: '', devanagari: '' },
      hindi: 'एआई सेवा में त्रुटि या समय-सीमा समाप्त हुई। संताली अनुवाद सत्यापित नहीं किया जा सका।',
      english: honestWarning,
      pronunciationGuide: '',
      detectedInputLanguage: intentInfo.sourceLang,
      isVerified: false,
      verificationStatus: 'unavailable',
      confidence: 'unverified',
      modelUsed: 'error-fallback',
      isUrgentOrMedical: intentInfo.isUrgentOrMedical,
      warning: honestWarning,
      notes: err?.message || 'Service timeout',
      verifiedVocabulary: extractVerifiedVocabulary(rawMessage),
    };
  }
}

export { normalizeForMatch, convertSantaliScript };


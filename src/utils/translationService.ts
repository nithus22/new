/**
 * Dedicated Translation, Transliteration, Script Conversion, and Communication Layer
 * for Santali (Ol Chiki, Roman, Devanagari), Hindi, and English.
 *
 * Enforces strict separation between:
 * 1. Translation (meaning preservation across languages)
 * 2. Transliteration (pronunciation representation in Roman Latin)
 * 3. Script conversion (converting Santali writing between Ol Chiki, Roman, and Devanagari)
 */

import {
  CommunicationLang,
  SantaliScript,
  UserCommunicativeIntent,
  VerificationStatus,
  VerifiedVocabularyItem,
  VERIFIED_PHRASE_CORPUS,
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
} from './santaliEngine';
import {
  runTranslationPipeline,
  runChatPipeline,
  LLMGeneratorFn,
} from './translationPipeline';

export type {
  CommunicationLang,
  SantaliScript,
  UserCommunicativeIntent,
  VerificationStatus,
  VerifiedVocabularyItem,
  LLMGeneratorFn,
};

export {
  VERIFIED_PHRASE_CORPUS as VERIFIED_COMMUNICATION_PHRASES,
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
  runTranslationPipeline,
  runChatPipeline,
};

export interface TranslationResult {
  originalText: string;
  extractedUtterance: string;
  translatedText: string;
  santaliOlChiki: string;
  santaliRoman: string;
  santaliDevanagari: string;
  transliteration: string; // Roman phonetic pronunciation
  pronunciationGuide: string; // Clean text for TTS
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

/**
 * Main translation function connecting to the verified phrasebook first,
 * then the server-side translation endpoint (/api/translate), with strict
 * client-side and server-side validation.
 */
export async function translateMessage(
  text: string,
  sourceLang: CommunicationLang | 'auto' = 'auto',
  targetLang?: CommunicationLang,
  targetScript: SantaliScript = 'olchiki',
  customFetch?: typeof fetch
): Promise<TranslationResult> {
  const trimmed = (text || '').trim();
  const extraction = extractCommunicativeUtterance(trimmed);
  const effectiveUtterance = extraction.extracted || trimmed;
  const detected = detectLanguageAndScript(effectiveUtterance);

  const resolvedSourceLang: CommunicationLang =
    sourceLang && sourceLang !== 'auto' ? sourceLang : detected.language;
  const resolvedTargetLang: CommunicationLang =
    targetLang ||
    extraction.requestedTargetLang ||
    (resolvedSourceLang === 'santali' ? 'english' : 'santali');
  const intentInfo = classifyUserIntent(trimmed, {
    explicitSourceLang: resolvedSourceLang,
    explicitTargetLang: resolvedTargetLang,
  });
  const urgent =
    isUrgentOrMedicalMessage(trimmed) || isUrgentOrMedicalMessage(effectiveUtterance);

  if (!trimmed) {
    return {
      originalText: text,
      extractedUtterance: '',
      translatedText: '',
      santaliOlChiki: '',
      santaliRoman: '',
      santaliDevanagari: '',
      transliteration: '',
      pronunciationGuide: '',
      backTranslationEnglish: '',
      backTranslationHindi: '',
      sourceLang: resolvedSourceLang,
      targetLang: resolvedTargetLang,
      targetScript,
      intent: 'translation',
      isVerified: false,
      verificationStatus: 'unavailable',
      confidence: 'unverified',
      modelUsed: 'none',
      isUrgentOrMedical: false,
      error: 'Please speak or enter text to translate.',
      verifiedVocabulary: [],
    };
  }

  // 1. Instant check against exact or template match in verified phrasebook
  const verifiedMatch = findExactOrTemplatePhrase(
    effectiveUtterance,
    resolvedSourceLang,
    resolvedTargetLang
  );
  if (verifiedMatch) {
    let translated = verifiedMatch.santaliOlChiki;
    if (resolvedTargetLang === 'santali') {
      if (targetScript === 'roman') {
        translated = verifiedMatch.santaliRoman;
      } else if (targetScript === 'devanagari') {
        translated = verifiedMatch.santaliDevanagari;
      } else {
        translated = verifiedMatch.santaliOlChiki;
      }
    } else if (resolvedTargetLang === 'hindi') {
      translated = verifiedMatch.hindi;
    } else {
      translated = verifiedMatch.english;
    }

    return {
      originalText: trimmed,
      extractedUtterance: effectiveUtterance,
      translatedText: translated,
      santaliOlChiki: verifiedMatch.santaliOlChiki,
      santaliRoman: verifiedMatch.santaliRoman,
      santaliDevanagari: verifiedMatch.santaliDevanagari,
      transliteration: verifiedMatch.santaliRoman,
      pronunciationGuide: verifiedMatch.santaliRoman,
      backTranslationEnglish: verifiedMatch.backTranslationEnglish,
      backTranslationHindi: verifiedMatch.backTranslationHindi,
      sourceLang: resolvedSourceLang,
      targetLang: resolvedTargetLang,
      targetScript,
      intent: intentInfo.intent,
      isVerified: true,
      verificationStatus:
        verifiedMatch.matchType === 'exact' ? 'verified_phrasebook' : 'verified_template',
      confidence: 'verified',
      modelUsed: 'verified-jcert-phrasebook',
      isUrgentOrMedical: urgent || Boolean(verifiedMatch.isUrgentOrMedical),
      notes:
        verifiedMatch.matchType === 'exact'
          ? 'Verified native Santali phrasebook entry.'
          : 'Verified native Santali sentence template.',
      verifiedVocabulary: extractVerifiedVocabulary(
        `${effectiveUtterance} ${verifiedMatch.santaliOlChiki}`
      ),
    };
  }

  // 2. Call backend proxy endpoint (/api/translate)
  const fetchFn = customFetch || (typeof fetch !== 'undefined' ? fetch : undefined);
  if (!fetchFn) {
    const warningMsg =
      'Santali translation could not be verified reliably (network unavailable for unknown sentence).';
    return {
      originalText: trimmed,
      extractedUtterance: effectiveUtterance,
      translatedText: '',
      santaliOlChiki: '',
      santaliRoman: '',
      santaliDevanagari: '',
      transliteration: '',
      pronunciationGuide: '',
      backTranslationEnglish: resolvedSourceLang === 'english' ? effectiveUtterance : '',
      backTranslationHindi: resolvedSourceLang === 'hindi' ? effectiveUtterance : '',
      sourceLang: resolvedSourceLang,
      targetLang: resolvedTargetLang,
      targetScript,
      intent: intentInfo.intent,
      isVerified: false,
      verificationStatus: 'unavailable',
      confidence: 'unverified',
      modelUsed: 'offline',
      isUrgentOrMedical: urgent,
      warning: warningMsg,
      error: warningMsg,
      verifiedVocabulary: extractVerifiedVocabulary(effectiveUtterance),
    };
  }

  try {
    const response = await fetchFn('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: effectiveUtterance,
        sourceLang: resolvedSourceLang,
        targetLang: resolvedTargetLang,
        targetScript,
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation service returned HTTP ${response.status}`);
    }

    const data = await response.json();

    // Enforce client-side validation even on server responses to guarantee safety
    if (data && data.translatedText) {
      const candidateOlChiki = data.santaliOlChiki || data.translatedText;
      const candidateRoman = data.santaliRoman || data.transliteration || '';
      const candidateDevanagari = data.santaliDevanagari || '';

      const validation = validateTranslationCandidate({
        originalText: effectiveUtterance,
        sourceLang: resolvedSourceLang,
        targetLang: resolvedTargetLang,
        candidateOlChiki,
        candidateRoman,
        candidateDevanagari,
        candidateTranslatedText: data.translatedText,
        backTranslation: data.backTranslationEnglish,
        isFromPhrasebook: Boolean(data.isVerified),
      });

      if (!validation.isValid) {
        const rejectionWarning =
          'Santali translation could not be verified reliably. Invalid or mixed-language tokens were detected and blocked.';
        return {
          originalText: trimmed,
          extractedUtterance: effectiveUtterance,
          translatedText: '',
          santaliOlChiki: '',
          santaliRoman: '',
          santaliDevanagari: '',
          transliteration: '',
          pronunciationGuide: '',
          backTranslationEnglish:
            resolvedSourceLang === 'english' ? effectiveUtterance : '',
          backTranslationHindi: resolvedSourceLang === 'hindi' ? effectiveUtterance : '',
          sourceLang: resolvedSourceLang,
          targetLang: resolvedTargetLang,
          targetScript,
          intent: intentInfo.intent,
          isVerified: false,
          verificationStatus: 'validation_failed',
          confidence: 'unverified',
          modelUsed: data.modelUsed || 'rejected-candidate',
          isUrgentOrMedical: urgent,
          warning: rejectionWarning,
          safetyWarning: urgent
            ? '⚠️ Urgent/Safety-Critical Message: Do not rely on an unverified translation. Show your original English/Hindi text directly.'
            : undefined,
          notes: validation.rejectionReasons.join(' '),
          error: rejectionWarning,
          verifiedVocabulary: extractVerifiedVocabulary(effectiveUtterance),
        };
      }

      const isTrulyVerified = Boolean(data.isVerified) && validation.isValid;
      return {
        originalText: trimmed,
        extractedUtterance: data.extractedUtterance || effectiveUtterance,
        translatedText: data.translatedText,
        santaliOlChiki: candidateOlChiki,
        santaliRoman: candidateRoman,
        santaliDevanagari: candidateDevanagari,
        transliteration: candidateRoman,
        pronunciationGuide: data.pronunciationGuide || candidateRoman,
        backTranslationEnglish:
          data.backTranslationEnglish ||
          (resolvedSourceLang === 'english' ? effectiveUtterance : ''),
        backTranslationHindi:
          data.backTranslationHindi ||
          (resolvedSourceLang === 'hindi' ? effectiveUtterance : ''),
        sourceLang: resolvedSourceLang,
        targetLang: resolvedTargetLang,
        targetScript,
        intent: data.intent || intentInfo.intent,
        isVerified: isTrulyVerified,
        verificationStatus: isTrulyVerified
          ? data.verificationStatus || 'verified_phrasebook'
          : 'unverified_ai',
        confidence: isTrulyVerified ? 'verified' : 'unverified',
        modelUsed: data.modelUsed || 'gemini-3.8-flash',
        isUrgentOrMedical: urgent || Boolean(data.isUrgentOrMedical),
        warning: isTrulyVerified
          ? undefined
          : data.warning ||
            'Santali translation could not be verified against the reference phrasebook. Marked as unverified AI candidate.',
        safetyWarning: data.safetyWarning,
        notes: data.notes,
        verifiedVocabulary:
          Array.isArray(data.verifiedVocabulary) && data.verifiedVocabulary.length > 0
            ? data.verifiedVocabulary
            : extractVerifiedVocabulary(`${effectiveUtterance} ${candidateOlChiki}`),
      };
    }

    // Server returned an explicit unverified/unavailable status
    const serverWarning =
      data?.warning ||
      data?.error ||
      'Santali translation could not be verified reliably.';
    return {
      originalText: trimmed,
      extractedUtterance: effectiveUtterance,
      translatedText: '',
      santaliOlChiki: '',
      santaliRoman: '',
      santaliDevanagari: '',
      transliteration: '',
      pronunciationGuide: '',
      backTranslationEnglish: resolvedSourceLang === 'english' ? effectiveUtterance : '',
      backTranslationHindi: resolvedSourceLang === 'hindi' ? effectiveUtterance : '',
      sourceLang: resolvedSourceLang,
      targetLang: resolvedTargetLang,
      targetScript,
      intent: intentInfo.intent,
      isVerified: false,
      verificationStatus: data?.verificationStatus || 'unavailable',
      confidence: 'unverified',
      modelUsed: data?.modelUsed || 'unavailable',
      isUrgentOrMedical: urgent,
      warning: serverWarning,
      safetyWarning:
        data?.safetyWarning ||
        (urgent
          ? '⚠️ Urgent/Safety-Critical Message: Please show your original English/Hindi message directly.'
          : undefined),
      notes: data?.notes,
      error: serverWarning,
      verifiedVocabulary: extractVerifiedVocabulary(effectiveUtterance),
    };
  } catch (err: any) {
    const warningMsg =
      'Santali translation could not be verified reliably due to a network or service failure.';
    return {
      originalText: trimmed,
      extractedUtterance: effectiveUtterance,
      translatedText: '',
      santaliOlChiki: '',
      santaliRoman: '',
      santaliDevanagari: '',
      transliteration: '',
      pronunciationGuide: '',
      backTranslationEnglish: resolvedSourceLang === 'english' ? effectiveUtterance : '',
      backTranslationHindi: resolvedSourceLang === 'hindi' ? effectiveUtterance : '',
      sourceLang: resolvedSourceLang,
      targetLang: resolvedTargetLang,
      targetScript,
      intent: intentInfo.intent,
      isVerified: false,
      verificationStatus: 'unavailable',
      confidence: 'unverified',
      modelUsed: 'network-error',
      isUrgentOrMedical: urgent,
      warning: warningMsg,
      safetyWarning: urgent
        ? '⚠️ Urgent/Safety-Critical Message: Network or translation service failed. Please show your original English/Hindi message directly.'
        : undefined,
      notes: err?.message || 'Network failure',
      error: warningMsg,
      verifiedVocabulary: extractVerifiedVocabulary(effectiveUtterance),
    };
  }
}

// ---------------------------------------------------------------------------
// Browser Web Speech Recognition Helper (Live voice input)
// ---------------------------------------------------------------------------
export interface SpeechRecognitionController {
  isSupported: boolean;
  isSantaliSupported: false; // Honest capability flag: browser Web Speech API lacks native sat-IN STT
  start: (
    lang: string,
    onResult: (transcript: string) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ) => void;
  stop: () => void;
}

export function createSpeechRecognitionController(): SpeechRecognitionController {
  if (typeof window === 'undefined') {
    return {
      isSupported: false,
      isSantaliSupported: false,
      start: (_l, _r, onError, onEnd) => {
        onError('Speech recognition is not available in this environment.');
        onEnd();
      },
      stop: () => {},
    };
  }

  const SpeechRecognition =
    (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return {
      isSupported: false,
      isSantaliSupported: false,
      start: (_l, _r, onError, onEnd) => {
        onError(
          'Speech recognition is not supported in this browser. Please type your message below.'
        );
        onEnd();
      },
      stop: () => {},
    };
  }

  let recognitionInstance: any = null;

  return {
    isSupported: true,
    isSantaliSupported: false,
    start: (lang, onResult, onError, onEnd) => {
      const normalizedLang = (lang || '').toLowerCase();
      if (normalizedLang.includes('sat') || normalizedLang.includes('santali')) {
        onError(
          'Santali microphone speech recognition (sat-IN) is not supported by browser speech engines. Please speak in English or Hindi to translate into Santali, or type Santali using the Ol Chiki / Roman keyboard.'
        );
        onEnd();
        return;
      }

      try {
        if (recognitionInstance) {
          try {
            recognitionInstance.abort();
          } catch {}
        }
        recognitionInstance = new SpeechRecognition();
        recognitionInstance.lang = normalizedLang.startsWith('hi') ? 'hi-IN' : 'en-IN';
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;

        recognitionInstance.onresult = (event: any) => {
          if (event.results && event.results[0] && event.results[0][0]) {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
          }
        };

        recognitionInstance.onerror = (event: any) => {
          const err = event.error || 'Speech error';
          if (err === 'not-allowed' || err === 'permission-denied') {
            onError(
              'Microphone access was denied. Please allow microphone access in your browser address bar, or type your message below.'
            );
          } else if (err === 'no-speech') {
            onError('No speech detected. Please speak clearly into your microphone, or type below.');
          } else if (err === 'audio-capture') {
            onError('No microphone was found on this device. Please connect a microphone or type below.');
          } else {
            onError(`Microphone notice (${err}). Please type your message manually below.`);
          }
        };

        recognitionInstance.onend = () => {
          onEnd();
        };

        recognitionInstance.start();
      } catch (e: any) {
        onError(e?.message || 'Could not start microphone');
        onEnd();
      }
    },
    stop: () => {
      if (recognitionInstance) {
        try {
          recognitionInstance.stop();
        } catch {}
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Server Chat API Communication
// ---------------------------------------------------------------------------
export interface ChatApiMessage {
  sender: 'child' | 'chotu';
  text: string;
  reply?: string;
  santali?: {
    olchiki: string;
    roman: string;
    devanagari: string;
  };
}

export interface ChatResponse {
  reply: string;
  intent?: UserCommunicativeIntent;
  extractedUtterance?: string;
  santali?: {
    olchiki: string;
    roman: string;
    devanagari: string;
  };
  hindi?: string;
  english?: string;
  backTranslationEnglish?: string;
  backTranslationHindi?: string;
  pronunciationGuide?: string;
  detectedInputLanguage?: 'santali' | 'hindi' | 'english';
  isVerified?: boolean;
  verificationStatus?: VerificationStatus;
  confidence?: 'verified' | 'unverified';
  modelUsed?: string;
  isUrgentOrMedical?: boolean;
  warning?: string;
  safetyWarning?: string;
  notes?: string;
  autoPlayAudio?: boolean;
  verifiedVocabulary?: VerifiedVocabularyItem[];
  error?: string;
}

export interface SendChatOptions {
  conversationHistory?: ChatApiMessage[];
  inputLang?: 'auto' | 'santali' | 'hindi' | 'english';
  replyLang?: 'santali' | 'hindi' | 'english';
  targetScript?: SantaliScript;
  context?: {
    currentClass?: number;
    currentSubject?: string;
    chapterTitle?: string;
    chapterId?: string;
    langName?: string;
    scriptName?: string;
    textbookSnippet?: string;
    vocabulary?: string;
    learningOutcomes?: string;
  };
}

export async function sendChatMessage(
  message: string,
  options: SendChatOptions = {},
  customFetch?: typeof fetch
): Promise<ChatResponse> {
  const fetchFn = customFetch || fetch;
  const response = await fetchFn('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      conversationHistory: options.conversationHistory || [],
      inputLang: options.inputLang || 'auto',
      replyLang: options.replyLang || 'santali',
      targetScript: options.targetScript || 'olchiki',
      context: options.context || {},
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat API error (${response.status})`);
  }

  return await response.json();
}

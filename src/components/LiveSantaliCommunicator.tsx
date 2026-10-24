import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  ArrowRightLeft,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  MessageSquareReply,
  BookOpen,
} from 'lucide-react';
import {
  CommunicationLang,
  SantaliScript,
  VerificationStatus,
  VerifiedVocabularyItem,
  TranslationResult,
  translateMessage,
  createSpeechRecognitionController,
  convertSantaliScript,
} from '../utils/translationService';
import { sound, AudioPlaybackStatus } from '../utils/audio';

export interface CommunicatorMessage {
  id: string;
  sender: 'speaker1' | 'speaker2';
  sourceLang: CommunicationLang;
  targetLang: CommunicationLang;
  originalText: string;
  extractedUtterance: string;
  translatedText: string;
  santaliOlChiki: string;
  santaliRoman: string;
  santaliDevanagari: string;
  transliteration?: string;
  pronunciationGuide?: string;
  backTranslationEnglish?: string;
  backTranslationHindi?: string;
  targetScript: SantaliScript;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  confidence: 'verified' | 'unverified';
  modelUsed: string;
  isUrgentOrMedical: boolean;
  warning?: string;
  safetyWarning?: string;
  verifiedVocabulary: VerifiedVocabularyItem[];
  audioStatus: AudioPlaybackStatus;
  audioStatusMessage: string;
  timestamp: string;
  error?: string;
}

interface LiveSantaliCommunicatorProps {
  onClose?: () => void;
  initialPrompt?: string;
}

const OL_CHIKI_QUICK_CHARS = [
  'ᱚ', 'ᱛ', 'ᱜ', 'ᱝ', 'ᱞ', 'ᱟ', 'ᱠ', 'ᱡ', 'ᱢ', 'ᱣ',
  'ᱤ', 'ᱥ', 'ᱦ', 'ᱧ', 'ᱨ', 'ᱩ', 'ᱪ', 'ᱫ', 'ᱬ', 'ᱭ',
  'ᱮ', 'ᱯ', 'ᱰ', 'ᱱ', 'ᱲ', 'ᱳ', 'ᱴ', 'ᱵ', 'ᱶ', 'ᱷ',
  'ᱸ', 'ᱹ', 'ᱼ', '᱾',
];

export const LiveSantaliCommunicator: React.FC<LiveSantaliCommunicatorProps> = ({
  initialPrompt,
}) => {
  // 1. Language & Script Directions
  const [sourceLang, setSourceLang] = useState<CommunicationLang>('english');
  const [targetLang, setTargetLang] = useState<CommunicationLang>('santali');
  const [santaliScript, setSantaliScript] = useState<SantaliScript>('olchiki');

  // 2. Input and Conversation State
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<CommunicatorMessage[]>([]);
  const [activeSpeaker, setActiveSpeaker] = useState<'speaker1' | 'speaker2'>('speaker1');
  const [showOlChikiPad, setShowOlChikiPad] = useState(false);

  // 3. Live Processing Indicators
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const speechRecognizerRef = useRef<any>(null);
  const processedInitialPromptRef = useRef<string | null>(null);

  // Initialize speech recognizer
  useEffect(() => {
    speechRecognizerRef.current = createSpeechRecognitionController();
    return () => {
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.stop();
      }
      sound.stopSpeech();
    };
  }, []);

  // Handle initialPrompt if passed from ChatbotModal
  useEffect(() => {
    if (initialPrompt && initialPrompt !== processedInitialPromptRef.current) {
      processedInitialPromptRef.current = initialPrompt;
      handleTranslate(initialPrompt);
    }
  }, [initialPrompt]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTranslating]);

  // Update script display on existing messages when user toggles Santali script
  const getDisplayedSantaliForScript = (msg: CommunicatorMessage, script: SantaliScript): string => {
    if (msg.targetLang !== 'santali') return msg.translatedText;
    if (!msg.translatedText && !msg.santaliOlChiki) return '';
    if (script === 'roman') {
      return (
        msg.santaliRoman ||
        convertSantaliScript(msg.santaliOlChiki, 'olchiki', 'roman', 'santali').convertedText
      );
    }
    if (script === 'devanagari') {
      return (
        msg.santaliDevanagari ||
        convertSantaliScript(msg.santaliOlChiki, 'olchiki', 'devanagari', 'santali').convertedText
      );
    }
    return msg.santaliOlChiki || msg.translatedText;
  };

  // Direction Switcher
  const handleSwapDirection = () => {
    sound.playPop();
    const prevSource = sourceLang;
    const prevTarget = targetLang;
    setSourceLang(prevTarget);
    setTargetLang(prevSource);
    setActiveSpeaker((s) => (s === 'speaker1' ? 'speaker2' : 'speaker1'));
  };

  // Set translation direction explicitly
  const handleSelectDirection = (from: CommunicationLang, to: CommunicationLang) => {
    sound.playPop();
    setSourceLang(from);
    setTargetLang(to);
    setActiveSpeaker(from === 'santali' ? 'speaker2' : 'speaker1');
  };

  // Switch to capture Santali speaker's reply
  const handlePrepareSantaliReply = () => {
    sound.playPop();
    const replyTarget: CommunicationLang = sourceLang === 'hindi' ? 'hindi' : 'english';
    setSourceLang('santali');
    setTargetLang(replyTarget);
    setActiveSpeaker('speaker2');
    setShowOlChikiPad(true);
    inputRef.current?.focus();
  };

  // Switch to compose follow-up in English/Hindi
  const handlePrepareFollowUp = (lang: 'english' | 'hindi' = 'english') => {
    sound.playPop();
    setSourceLang(lang);
    setTargetLang('santali');
    setActiveSpeaker('speaker1');
    setShowOlChikiPad(false);
    inputRef.current?.focus();
  };

  // Update audio status for a specific message
  const updateMessageAudioStatus = (
    msgId: string,
    audioStatus: AudioPlaybackStatus,
    audioStatusMessage: string
  ) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, audioStatus, audioStatusMessage } : m))
    );
  };

  // Perform stateless, meaning-preserving translation for the current turn
  const handleTranslate = async (
    textToTranslate: string,
    overrideSource?: CommunicationLang,
    overrideTarget?: CommunicationLang
  ) => {
    const trimmed = textToTranslate.trim();
    if (!trimmed) return;

    const activeSource = overrideSource || sourceLang;
    const activeTarget = overrideTarget || targetLang;

    sound.playPop();
    setInputText('');
    setIsTranslating(true);
    setSpeechError(null);

    const tempId = `msg-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      const result: TranslationResult = await translateMessage(
        trimmed,
        activeSource,
        activeTarget,
        santaliScript
      );

      const initialAudioMsg =
        result.targetLang === 'santali'
          ? 'Ready (AI/Phonetic Santali words — native sat-IN TTS unavailable)'
          : `Ready (Native ${result.targetLang === 'english' ? 'en-IN' : 'hi-IN'} voice)`;

      const newMsg: CommunicatorMessage = {
        id: tempId,
        sender: activeSource === 'santali' ? 'speaker2' : activeSpeaker,
        sourceLang: result.sourceLang,
        targetLang: result.targetLang,
        originalText: trimmed,
        extractedUtterance: result.extractedUtterance || trimmed,
        translatedText: result.translatedText,
        santaliOlChiki: result.santaliOlChiki,
        santaliRoman: result.santaliRoman,
        santaliDevanagari: result.santaliDevanagari,
        transliteration: result.transliteration,
        pronunciationGuide: result.pronunciationGuide,
        backTranslationEnglish: result.backTranslationEnglish,
        backTranslationHindi: result.backTranslationHindi,
        targetScript: santaliScript,
        isVerified: result.isVerified,
        verificationStatus: result.verificationStatus,
        confidence: result.confidence,
        modelUsed: result.modelUsed,
        isUrgentOrMedical: result.isUrgentOrMedical,
        warning: result.warning,
        safetyWarning: result.safetyWarning,
        verifiedVocabulary: result.verifiedVocabulary || [],
        audioStatus: result.translatedText ? 'idle' : 'unsupported',
        audioStatusMessage: result.translatedText
          ? initialAudioMsg
          : 'Audio disabled (translation could not be verified)',
        timestamp,
        error: result.error,
      };

      setMessages((prev) => [...prev, newMsg]);

      // Automatically play speech output ONLY if translation succeeded
      if (result.translatedText && result.verificationStatus !== 'validation_failed') {
        await handlePlayAudio(newMsg);
      }
    } catch (err: any) {
      const warningText =
        'Santali translation could not be verified reliably due to a network error.';
      const errorMsg: CommunicatorMessage = {
        id: tempId,
        sender: activeSpeaker,
        sourceLang: activeSource,
        targetLang: activeTarget,
        originalText: trimmed,
        extractedUtterance: trimmed,
        translatedText: '',
        santaliOlChiki: '',
        santaliRoman: '',
        santaliDevanagari: '',
        targetScript: santaliScript,
        isVerified: false,
        verificationStatus: 'unavailable',
        confidence: 'unverified',
        modelUsed: 'error',
        isUrgentOrMedical: false,
        warning: warningText,
        verifiedVocabulary: [],
        audioStatus: 'error',
        audioStatusMessage: 'Audio unavailable (translation failed)',
        timestamp,
        error: err?.message || warningText,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTranslating(false);
    }
  };

  // Microphone toggle
  const toggleListening = () => {
    sound.playPop();
    if (isListening) {
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    // Honest check: Web Speech API does not support Santali speech recognition
    if (sourceLang === 'santali') {
      setSpeechError(
        'Santali microphone recognition (sat-IN) is not supported by standard web browsers. Please enter the Santali reply using the Ol Chiki character pad or Roman script below.'
      );
      setShowOlChikiPad(true);
      inputRef.current?.focus();
      return;
    }

    if (!speechRecognizerRef.current?.isSupported) {
      setSpeechError('Speech recognition is not supported in this browser. Please type your message!');
      inputRef.current?.focus();
      return;
    }

    setSpeechError(null);
    setIsListening(true);

    const recognitionLang = sourceLang === 'hindi' ? 'hi-IN' : 'en-IN';

    speechRecognizerRef.current.start(
      recognitionLang,
      (transcript: string) => {
        setIsListening(false);
        setInputText(transcript);
        handleTranslate(transcript);
      },
      (err: string) => {
        setIsListening(false);
        setSpeechError(err);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  // Play audio output of the validated translated text
  const handlePlayAudio = async (msg: CommunicatorMessage) => {
    sound.playPop();
    await sound.speakTranslatedMessage({
      targetLang: msg.targetLang,
      translatedText: msg.santaliOlChiki || msg.translatedText,
      santaliRoman: msg.santaliRoman || msg.transliteration,
      santaliDevanagari: msg.santaliDevanagari,
      onStatusChange: (res) => {
        updateMessageAudioStatus(msg.id, res.status, res.statusMessage);
      },
    });
  };

  // Retry a message
  const handleRetry = (msg: CommunicatorMessage) => {
    handleTranslate(msg.originalText, msg.sourceLang, msg.targetLang);
  };

  // Real-world communication suggestion chips based on current source language
  const quickSuggestions =
    sourceLang === 'english'
      ? [
          'Please ask them where the bus stand is.',
          'Please ask them where the nearest hospital is.',
          'Tell them I need help.',
          'Ask them how much this costs.',
          'Tell them I am feeling unwell and need a doctor.',
          'I need water.',
          'What is your name?',
        ]
      : sourceLang === 'hindi'
      ? [
          'बस स्टैंड कहाँ है?',
          'सबसे नज़दीकी अस्पताल कहाँ है?',
          'मुझे मदद चाहिए।',
          'इसकी कीमत कितनी है?',
          'मेरी तबीयत ठीक नहीं है और मुझे डॉक्टर की ज़रूरत है।',
          'मुझे पानी चाहिए।',
        ]
      : [
          'ᱵᱟᱥ ᱤᱥᱴᱮᱱᱰ ᱫᱚ ᱚᱠᱟ ᱨᱮ ᱢᱮᱱᱟᱜᱼᱟ?',
          'ᱵᱟᱥ ᱤᱥᱴᱮᱱᱰ ᱫᱚ ᱥᱩᱨ ᱨᱮᱜᱮ ᱢᱮᱱᱟᱜᱼᱟ᱾',
          'ᱥᱚᱡᱷᱮ ᱢᱟᱬᱟᱝ ᱥᱮᱫ ᱪᱟᱞᱟᱜ ᱢᱮ᱾',
          'ᱤᱧ ᱵᱮᱥ ᱜᱮ ᱢᱮᱱᱟᱹᱧᱟ᱾',
          'ᱟᱹᱰᱤ ᱟᱹᱰᱤ ᱥᱟᱨᱦᱟᱣ᱾',
        ];

  return (
    <div className="flex flex-col h-full bg-amber-50/60 overflow-hidden select-none">
      {/* Top Communicator Controls Banner */}
      <div className="bg-white p-3 border-b-2 border-amber-200 shadow-xs space-y-2.5">
        {/* Direction Switcher Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleSelectDirection('english', 'santali')}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                sourceLang === 'english' && targetLang === 'santali'
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-300'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
              }`}
            >
              English 🇬🇧 → Santali 🌿
            </button>

            <button
              type="button"
              onClick={() => handleSelectDirection('hindi', 'santali')}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                sourceLang === 'hindi' && targetLang === 'santali'
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-300'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
              }`}
            >
              Hindi 🇮🇳 → Santali 🌿
            </button>

            <button
              type="button"
              onClick={() => handleSelectDirection('santali', 'english')}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                sourceLang === 'santali' && targetLang === 'english'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-300'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
              }`}
            >
              Santali Reply 🌿 → English 🇬🇧
            </button>

            <button
              type="button"
              onClick={() => handleSelectDirection('santali', 'hindi')}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                sourceLang === 'santali' && targetLang === 'hindi'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-300'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
              }`}
            >
              Santali Reply 🌿 → Hindi 🇮🇳
            </button>
          </div>

          {/* Quick Swap Button */}
          <button
            type="button"
            onClick={handleSwapDirection}
            className="px-3 py-1.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-950 font-black text-xs border border-orange-300 flex items-center gap-1.5 press-bounce cursor-pointer"
            title="Swap translation direction"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>⇄ Swap Turn</span>
          </button>
        </div>

        {/* Script Selector for Santali Output (Distinct from Translation) */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-amber-100 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-amber-950">Santali Writing Script:</span>
            <div className="inline-flex rounded-xl bg-amber-100 p-0.5 border border-amber-300">
              <button
                type="button"
                onClick={() => setSantaliScript('olchiki')}
                className={`px-2.5 py-0.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  santaliScript === 'olchiki'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-amber-900 hover:bg-amber-200'
                }`}
              >
                ᱚᱞ ᱪᱤᱠᱤ (Ol Chiki Native)
              </button>
              <button
                type="button"
                onClick={() => setSantaliScript('roman')}
                className={`px-2.5 py-0.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  santaliScript === 'roman'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-amber-900 hover:bg-amber-200'
                }`}
              >
                Roman Santali (Phonetic)
              </button>
              <button
                type="button"
                onClick={() => setSantaliScript('devanagari')}
                className={`px-2.5 py-0.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  santaliScript === 'devanagari'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-amber-900 hover:bg-amber-200'
                }`}
                title="Santali language written in Devanagari script (distinct from Hindi)"
              >
                संताली देवनागरी (Santali in Devanagari)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Stateless Turn-by-Turn Translation (No History Contamination)</span>
          </div>
        </div>
      </div>

      {/* Speech Error Banner */}
      {speechError && (
        <div className="bg-red-50 text-red-900 p-2.5 px-4 text-xs font-bold border-b border-red-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{speechError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSpeechError(null)}
            className="text-red-700 hover:underline font-extrabold text-[11px] ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Conversation Thread Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Initial Welcome & Guidelines Card */}
        {messages.length === 0 && (
          <div className="bg-white rounded-3xl p-4 border-2 border-amber-300 shadow-sm max-w-lg mx-auto text-center space-y-2.5">
            <div className="text-3xl">🦌 🗣️ 🌿</div>
            <h4 className="text-base font-black text-amber-950">
              Real-World Santali Two-Way Communicator
            </h4>
            <p className="text-xs text-amber-900 font-bold leading-relaxed">
              Communicate between English/Hindi and Santali (`ᱚᱞ ᱪᱤᱠᱤ`). Ask directions, prices, or medical/help needs, play the translated message aloud, and translate the other person&apos;s Santali reply!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left text-[11px] bg-amber-50 p-2.5 rounded-2xl border border-amber-200">
              <div>
                <span className="font-black text-amber-950 block">1. Ask or Tell Them:</span>
                <span className="text-amber-800">
                  Type e.g. &ldquo;Please ask them where the bus stand is&rdquo; or &ldquo;Tell them I need help.&rdquo;
                </span>
              </div>
              <div>
                <span className="font-black text-emerald-950 block">2. Understand Their Reply:</span>
                <span className="text-emerald-800">
                  Tap &ldquo;Santali Reply → English/Hindi&rdquo; to translate what they said back to you.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((msg) => {
          const isSpeaker1 = msg.sender === 'speaker1';
          const displayedTranslation = getDisplayedSantaliForScript(msg, santaliScript);
          const isPlaying =
            msg.audioStatus === 'playing_native' ||
            msg.audioStatus === 'playing_ai_tts' ||
            msg.audioStatus === 'playing_phonetic_approx' ||
            msg.audioStatus === 'loading_tts';

          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 ${isSpeaker1 ? 'items-start' : 'items-end'}`}
            >
              {/* Speaker Tag & Metadata Header */}
              <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-600 px-2 flex-wrap">
                <span>
                  {isSpeaker1
                    ? '👤 Speaker 1 (English/Hindi)'
                    : '🌿 Speaker 2 (Santali Speaker)'}
                </span>
                <span>•</span>
                <span className="uppercase text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded">
                  {msg.sourceLang} → {msg.targetLang}
                </span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message Bubble Card */}
              <div
                className={`max-w-[92%] w-full sm:w-auto sm:min-w-[360px] rounded-3xl p-4 shadow-md space-y-3 border-2 ${
                  isSpeaker1
                    ? 'bg-white border-amber-300 text-amber-950 rounded-tl-none'
                    : 'bg-emerald-50/90 border-emerald-300 text-emerald-950 rounded-tr-none'
                }`}
              >
                {/* 1. Original Spoken/Typed Message & Extracted Communicative Utterance */}
                <div className="space-y-1 border-b border-amber-100 pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">
                      Original Input ({msg.sourceLang})
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Model: {msg.modelUsed}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed">
                    &ldquo;{msg.originalText}&rdquo;
                  </p>
                  {msg.extractedUtterance &&
                    msg.extractedUtterance.toLowerCase() !== msg.originalText.toLowerCase() && (
                      <p className="text-xs font-extrabold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        Communicative Question/Message to Translate: &ldquo;{msg.extractedUtterance}&rdquo;
                      </p>
                    )}
                </div>

                {/* Urgent / Medical Safety Warning Banner */}
                {msg.safetyWarning && (
                  <div className="bg-red-100 border-2 border-red-400 rounded-2xl p-2.5 flex items-start gap-2 text-xs text-red-950 font-bold">
                    <ShieldAlert className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                    <div>
                      <p>{msg.safetyWarning}</p>
                      <p className="mt-1 underline">
                        Keep original message visible: &ldquo;{msg.extractedUtterance}&rdquo;
                      </p>
                    </div>
                  </div>
                )}

                {/* Reliability Warning Banner when Unverified or Failed */}
                {msg.warning && (
                  <div
                    className={`rounded-2xl p-2.5 flex items-start gap-2 text-xs font-bold border ${
                      msg.verificationStatus === 'validation_failed' ||
                      msg.verificationStatus === 'unavailable'
                        ? 'bg-red-50 border-red-300 text-red-900'
                        : 'bg-amber-100/90 border-amber-400 text-amber-950'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                    <div className="space-y-0.5">
                      <p>{msg.warning}</p>
                      {!msg.isVerified && (
                        <p className="text-[11px] font-semibold opacity-90">
                          Original ({msg.sourceLang}): &ldquo;{msg.extractedUtterance}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Translated Output Box */}
                <div className="p-3 rounded-2xl bg-amber-100/60 border border-amber-300/80 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] uppercase font-black tracking-wider text-amber-950">
                      Translated ({msg.targetLang} •{' '}
                      {msg.targetLang === 'santali'
                        ? santaliScript === 'olchiki'
                          ? 'Ol Chiki ᱚᱞ ᱪᱤᱠᱤ'
                          : santaliScript === 'roman'
                          ? 'Roman Phonetic'
                          : 'Santali in Devanagari (Not Hindi)'
                        : msg.targetLang}
                      )
                    </span>

                    {/* Honest Verification Status Badge */}
                    {msg.verificationStatus === 'verified_phrasebook' ||
                    msg.verificationStatus === 'verified_template' ? (
                      <span className="text-[10px] font-extrabold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-400">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        <span>
                          {msg.verificationStatus === 'verified_phrasebook'
                            ? 'Verified Phrasebook'
                            : 'Verified Sentence Template'}
                        </span>
                      </span>
                    ) : msg.verificationStatus === 'unverified_ai' ? (
                      <span className="text-[10px] font-extrabold text-amber-950 bg-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-500">
                        <Sparkles className="w-3 h-3 text-amber-800" />
                        <span>Unverified AI Candidate</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold text-red-900 bg-red-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-red-400">
                        <AlertCircle className="w-3 h-3 text-red-700" />
                        <span>Unverified / Blocked</span>
                      </span>
                    )}
                  </div>

                  {displayedTranslation ? (
                    <div className="space-y-1.5">
                      <p className="text-lg sm:text-xl font-black text-amber-950 leading-relaxed font-olchiki select-text">
                        {displayedTranslation}
                      </p>

                      {/* Show Ol Chiki + Roman Transliteration distinctly when target is Santali */}
                      {msg.targetLang === 'santali' && (
                        <div className="space-y-0.5 pt-1 border-t border-amber-200/70 text-xs">
                          {santaliScript !== 'olchiki' && msg.santaliOlChiki && (
                            <p className="font-bold text-amber-950 font-olchiki">
                              Ol Chiki Script: {msg.santaliOlChiki}
                            </p>
                          )}
                          {msg.santaliRoman && (
                            <p className="font-semibold text-amber-900 italic">
                              Roman Pronunciation (Transliteration): {msg.santaliRoman}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-white/90 border border-amber-300 text-xs text-slate-800 space-y-1">
                      <p className="font-black text-red-800">
                        Santali translation could not be verified reliably.
                      </p>
                      <p className="font-bold">
                        Show this original {msg.sourceLang.toUpperCase()} message directly:{' '}
                        <span className="underline select-text">&ldquo;{msg.extractedUtterance}&rdquo;</span>
                      </p>
                    </div>
                  )}

                  {/* 3. Meaning-Preserving Back-Translation (English & Hindi) */}
                  {(msg.backTranslationEnglish || msg.backTranslationHindi) && (
                    <div className="pt-1.5 border-t border-amber-200/80 text-xs space-y-0.5 text-amber-950">
                      {msg.backTranslationEnglish && (
                        <p>
                          <span className="font-black">English Meaning: </span>
                          <span>&ldquo;{msg.backTranslationEnglish}&rdquo;</span>
                        </p>
                      )}
                      {msg.backTranslationHindi && (
                        <p>
                          <span className="font-black">Hindi Meaning (हिंदी अर्थ): </span>
                          <span>&ldquo;{msg.backTranslationHindi}&rdquo;</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. Verified Vocabulary Breakdown (ONLY when words are verified in reference lexicon) */}
                {msg.verifiedVocabulary && msg.verifiedVocabulary.length > 0 && (
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-2.5 space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-900">
                      <BookOpen className="w-3 h-3 text-emerald-700" />
                      <span>Verified Lexicon Words in This Message:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.verifiedVocabulary.map((v, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-white px-2 py-0.5 rounded-lg border border-emerald-300 text-emerald-950 font-bold"
                        >
                          <strong className="font-olchiki">{v.santaliOlChiki}</strong> ({v.santaliRoman}) ={' '}
                          {v.english} / {v.hindi}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Retry Action when Error Occurs */}
                {msg.error && (
                  <div className="flex items-center justify-between text-xs text-red-800 bg-red-100/70 p-2 rounded-xl border border-red-200">
                    <span>Translation could not be completed reliably.</span>
                    <button
                      type="button"
                      onClick={() => handleRetry(msg)}
                      className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold flex items-center gap-1 hover:bg-red-700 press-bounce cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Retry</span>
                    </button>
                  </div>
                )}

                {/* 5. Audio Playback Controls & Two-Way Turn Continuation */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-200/70">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      disabled={!displayedTranslation}
                      onClick={() => handlePlayAudio(msg)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all press-bounce border cursor-pointer disabled:opacity-40 ${
                        isPlaying
                          ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                          : 'bg-white hover:bg-amber-100 text-amber-900 border-amber-300'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>
                        {msg.audioStatus === 'loading_tts'
                          ? 'Synthesizing Audio...'
                          : isPlaying
                          ? 'Speaking Aloud...'
                          : msg.targetLang === 'santali'
                          ? 'Speak Santali Message Aloud'
                          : `Play ${msg.targetLang === 'hindi' ? 'Hindi' : 'English'} Audio`}
                      </span>
                    </button>

                    {/* Turn-by-turn workflow helper button */}
                    {msg.targetLang === 'santali' ? (
                      <button
                        type="button"
                        onClick={handlePrepareSantaliReply}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 press-bounce cursor-pointer"
                        title="Enter what the Santali speaker replied"
                      >
                        <MessageSquareReply className="w-3.5 h-3.5" />
                        <span>They Replied in Santali → Translate</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePrepareFollowUp('english')}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1 press-bounce cursor-pointer"
                      >
                        <MessageSquareReply className="w-3.5 h-3.5" />
                        <span>Ask / Tell Follow-up → Santali</span>
                      </button>
                    )}
                  </div>

                  {/* Honest Audio Status Indicator */}
                  <span className="text-[10px] text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded-full font-bold border border-amber-300">
                    🔊 {msg.audioStatusMessage}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Processing Indicator */}
        {isTranslating && (
          <div className="flex items-center gap-2.5 text-xs font-extrabold text-amber-900 bg-white p-3 rounded-2xl border-2 border-amber-300 w-fit animate-pulse shadow-sm">
            <span className="text-lg">⏳</span>
            <span>
              Translating & validating ({sourceLang.toUpperCase()} → {targetLang.toUpperCase()})...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Real-World Communication Suggestion Pills */}
      <div className="p-2 bg-amber-100/90 border-t border-amber-200 flex items-center gap-1.5 overflow-x-auto text-xs whitespace-nowrap">
        <span className="font-black text-amber-950 text-[11px] px-1">
          {sourceLang === 'santali' ? 'Sample Santali Replies:' : 'Real-World Phrases:'}
        </span>
        {quickSuggestions.map((phrase, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setInputText(phrase);
              handleTranslate(phrase);
            }}
            className="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-200 text-amber-950 font-bold border border-amber-300 press-bounce cursor-pointer"
          >
            {phrase}
          </button>
        ))}
      </div>

      {/* Collapsible Ol Chiki Input Pad for Entering Santali Replies */}
      {showOlChikiPad && (
        <div className="bg-emerald-50 p-2 border-t border-emerald-300">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-black text-emerald-950">
              Ol Chiki Character Pad (Tap to type Santali reply):
            </span>
            <button
              type="button"
              onClick={() => setShowOlChikiPad(false)}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer"
            >
              Hide ✕
            </button>
          </div>
          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
            {OL_CHIKI_QUICK_CHARS.map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => {
                  sound.playPop();
                  setInputText((prev) => prev + ch);
                  inputRef.current?.focus();
                }}
                className="w-7 h-7 bg-white hover:bg-emerald-200 border border-emerald-300 rounded text-sm font-black text-emerald-950 flex items-center justify-center cursor-pointer"
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Live Input & Speech Bar */}
      <div className="p-3 bg-white border-t-2 border-amber-300 shadow-md">
        <div className="mb-2 flex items-center justify-between text-[11px] font-bold px-1 flex-wrap gap-1">
          {sourceLang === 'santali' ? (
            <span className="text-amber-900 flex items-center gap-1">
              <span>⌨️</span>
              <span>
                Santali Speech Recognition Unsupported by Browser: Type Santali reply in Ol Chiki or Roman script below
              </span>
            </span>
          ) : (
            <span className="text-emerald-700 flex items-center gap-1">
              <span>🎤</span>
              <span>
                Voice Ready ({sourceLang.toUpperCase()}): Tap mic to speak, or type what you want to ask/tell them
              </span>
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowOlChikiPad((p) => !p)}
              className="text-amber-900 hover:underline font-extrabold cursor-pointer"
            >
              {showOlChikiPad ? 'Hide Ol Chiki Pad' : '⌨️ Ol Chiki Pad'}
            </button>

            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setMessages([]);
                }}
                className="text-slate-500 hover:text-red-600 font-bold hover:underline cursor-pointer"
              >
                Clear Thread
              </button>
            )}
          </div>
        </div>

        {/* Live Listening State Indicator */}
        {isListening && (
          <div className="mb-2 p-2 rounded-2xl bg-red-50 border-2 border-red-300 flex items-center justify-between text-xs font-black text-red-900 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping"></span>
              <span>Listening ({sourceLang.toUpperCase()})... Speak clearly now!</span>
            </div>
            <button
              type="button"
              onClick={toggleListening}
              className="text-red-700 underline font-extrabold cursor-pointer"
            >
              Stop
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTranslate(inputText);
          }}
          className="flex items-center gap-2"
        >
          {/* Microphone Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-2xl text-white font-black shadow-md press-bounce transition-all border cursor-pointer ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 border-red-800 ring-4 ring-red-200 animate-pulse'
                : sourceLang === 'santali'
                ? 'bg-stone-400 hover:bg-stone-500 border-stone-600'
                : 'bg-emerald-600 hover:bg-emerald-700 border-emerald-800'
            }`}
            title={
              sourceLang === 'santali'
                ? 'Santali speech recognition is not supported by browser engines. Type Santali below.'
                : isListening
                ? 'Stop listening'
                : `Start microphone speech input in ${sourceLang}`
            }
            aria-label="Microphone input"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              sourceLang === 'santali'
                ? 'Enter their Santali reply (Ol Chiki or Roman) to translate...'
                : `Type what to ask/tell in ${sourceLang.toUpperCase()} (e.g. "Ask them where the bus stand is")...`
            }
            className="flex-1 px-4 py-2.5 rounded-2xl border-2 border-amber-300 focus:border-amber-500 focus:outline-none text-sm font-bold text-amber-950 placeholder:text-slate-400"
          />

          {/* Send / Translate Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isTranslating}
            className="p-3 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold shadow-md press-bounce transition-all border border-amber-700 cursor-pointer"
            aria-label="Translate message"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

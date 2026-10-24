import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Mic,
  MicOff,
  RotateCcw,
  ShieldCheck,
  Wifi,
  WifiOff,
  Pause,
  Play,
  Trash2,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  BookOpen,
  MessageSquareReply,
} from 'lucide-react';
import { LanguageId } from '../types';
import { LANGUAGES } from '../data/languages';
import { sound, AudioPlaybackStatus } from '../utils/audio';
import { LiveSantaliCommunicator } from './LiveSantaliCommunicator';
import { useNetworkStatus } from '../utils/useNetworkStatus';
import { INITIAL_CURRICULUM } from '../data/curriculum';
import { getChapterTextbookInfo } from '../utils/textbookData';
import {
  SantaliScript,
  UserCommunicativeIntent,
  VerificationStatus,
  VerifiedVocabularyItem,
  SpeechRecognitionController,
  createSpeechRecognitionController,
  sendChatMessage,
  ChatResponse,
  runChatPipeline,
} from '../utils/translationService';

export type ChotuMode = 'qa' | 'communicator';

export interface ChatMessage {
  id: string;
  sender: 'chotu' | 'child';
  text: string;
  intent?: UserCommunicativeIntent;
  extractedUtterance?: string;
  inputLanguage?: 'santali' | 'hindi' | 'english' | 'auto';
  detectedInputLang?: 'santali' | 'hindi' | 'english';
  replyLang?: 'santali' | 'hindi' | 'english';
  santali?: {
    olchiki: string;
    roman: string;
    devanagari: string;
  };
  hindi?: string;
  english?: string;
  backTranslationEnglish?: string;
  backTranslationHindi?: string;
  transliteration?: string;
  pronunciationGuide?: string;
  isVerified?: boolean;
  verificationStatus?: VerificationStatus;
  confidence?: 'verified' | 'unverified';
  modelUsed?: string;
  isUrgentOrMedical?: boolean;
  warning?: string;
  safetyWarning?: string;
  verifiedVocabulary?: VerifiedVocabularyItem[];
  audioStatus?: AudioPlaybackStatus;
  audioStatusMessage?: string;
  notes?: string;
  timestamp: string;
  isError?: boolean;
  canRetry?: boolean;
  retryQuery?: string;
}

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: LanguageId;
  currentClass: number;
  currentSubject: string;
  chapterTitle?: string;
  chapterId?: string;
  initialMode?: ChotuMode;
}

const OL_CHIKI_KEYBOARD = [
  'ᱚ', 'ᱛ', 'ᱜ', 'ᱝ', 'ᱞ',
  'ᱟ', 'ᱠ', 'ᱡ', 'ᱢ', 'ᱣ',
  'ᱤ', 'ᱥ', 'ᱦ', 'ᱧ', 'ᱨ',
  'ᱩ', 'ᱪ', 'ᱫ', 'ᱬ', 'ᱭ',
  'ᱮ', 'ᱯ', 'ᱰ', 'ᱱ', 'ᱲ',
  'ᱳ', 'ᱴ', 'ᱵ', 'ᱶ', 'ᱷ',
  'ᱸ', 'ᱹ', 'ᱺ', 'ᱻ', 'ᱼ', 'ᱽ', '᱾',
  '᱑', '᱒', '᱓', '᱔', '᱕',
];

export const ChatbotModal: React.FC<ChatbotModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  currentClass,
  currentSubject,
  chapterTitle = 'आकृतियाँ और स्थान (Shapes & Space)',
  chapterId,
  initialMode = 'qa',
}) => {
  const isOnline = useNetworkStatus();
  const [activeMode, setActiveMode] = useState<ChotuMode>(initialMode);

  // 1. Multilingual Configuration State
  const [inputLang, setInputLang] = useState<'auto' | 'santali' | 'hindi' | 'english'>('auto');
  const [replyLang, setReplyLang] = useState<'santali' | 'hindi' | 'english'>('santali');
  const [targetScript, setTargetScript] = useState<SantaliScript>('olchiki');
  const [showOlChikiKeyboard, setShowOlChikiKeyboard] = useState(false);

  // 2. Chat Conversation State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 3. Audio & Voice State
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [isAudioPaused, setIsAudioPaused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const speechRecognizerRef = useRef<SpeechRecognitionController | null>(null);

  // Initialize Speech Recognizer
  useEffect(() => {
    speechRecognizerRef.current = createSpeechRecognitionController();
    return () => {
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.stop();
      }
      sound.stopSpeech();
    };
  }, []);

  // Sync initialMode when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveMode(initialMode);
    }
  }, [isOpen, initialMode]);

  const langConfig = LANGUAGES[currentLanguage];

  // Active chapter lookup for context-grounded educational guidance
  const activeChapter =
    INITIAL_CURRICULUM.find(
      (c) =>
        (chapterId && c.id === chapterId) ||
        c.originalTitleHindi === chapterTitle ||
        (chapterTitle && chapterTitle.includes(c.originalTitleHindi))
    ) || INITIAL_CURRICULUM[0];
  const activeTextbook = activeChapter ? getChapterTextbookInfo(activeChapter) : null;
  const cleanChapterHindiTitle = activeChapter?.originalTitleHindi || 'आकृतियाँ और स्थान';

  // Initialize welcoming mascot message if conversation is empty
  useEffect(() => {
    if (messages.length === 0) {
      const initialGreeting: ChatMessage = {
        id: 'msg-init',
        sender: 'chotu',
        text: 'ᱡᱚᱦᱟᱨ! ᱤᱧ ᱪᱷᱳᱴᱩ ᱠᱟᱹᱱᱟᱹᱧ, ᱟᱢᱤᱡ ᱯᱟᱲᱦᱟᱣ ᱟᱨ ᱨᱚᱯᱚᱲ ᱜᱟᱛᱮ ᱦᱤᱨᱚᱬ! ᱥᱟᱱᱛᱟᱲᱤ ᱛᱚᱨᱡᱚᱢᱟ ᱥᱮ ᱡᱟᱦᱟᱸᱱᱟᱜ ᱠᱩᱠᱞᱤ ᱠᱩᱞᱤᱭᱤᱧ ᱢᱮ!',
        intent: 'general_assistant',
        replyLang: 'santali',
        santali: {
          olchiki:
            'ᱡᱚᱦᱟᱨ! ᱤᱧ ᱪᱷᱳᱴᱩ ᱠᱟᱹᱱᱟᱹᱧ, ᱟᱢᱤᱡ ᱯᱟᱲᱦᱟᱣ ᱟᱨ ᱨᱚᱯᱚᱲ ᱜᱟᱛᱮ ᱦᱤᱨᱚᱬ! ᱥᱟᱱᱛᱟᱲᱤ ᱛᱚᱨᱡᱚᱢᱟ ᱥᱮ ᱡᱟᱦᱟᱸᱱᱟᱜ ᱠᱩᱠᱞᱤ ᱠᱩᱞᱤᱭᱤᱧ ᱢᱮ!',
          roman:
            'Johar! Ing Chhotu kanang, amij parhaw ar ropor gate hiran! Santali torjoma se jahannag kukli kuliying me!',
          devanagari:
            'जोहार! इञ छोटू कानंग, आमिज पाड़हाव आर रोपोड़ गाते हिरण! संताली तोरजोमा से जाहानाग कुकली कुलियिञ मे!',
        },
        hindi:
          'जोहार! मैं छोटू हिरण हूँ। मुझसे संताली अनुवाद, वास्तविक बातचीत में मदद, या स्कूल के पाठ के बारे में कुछ भी पूछें!',
        english:
          'Johar! I am Chotu the deer. Ask me to translate sentences to/from Santali, help you talk with a Santali speaker, or explain school lessons!',
        backTranslationEnglish:
          'Greetings! I am Chotu, your learning and communication deer friend! Ask me for Santali translation or any question!',
        backTranslationHindi:
          'जोहार! मैं छोटू हूँ, आपका पढ़ाई और बातचीत का साथी हिरण!',
        transliteration:
          'Johar! Ing Chhotu kanang, amij parhaw ar ropor gate hiran! Santali torjoma se jahannag kukli kuliying me!',
        pronunciationGuide:
          'Johar! Ing Chhotu kanang, amij parhaw ar ropor gate hiran!',
        isVerified: true,
        verificationStatus: 'verified_phrasebook',
        confidence: 'verified',
        modelUsed: 'verified-jcert-phrasebook',
        audioStatus: 'idle',
        audioStatusMessage: 'Ready (AI/Phonetic Santali words — native sat-IN TTS unavailable)',
        notes: 'Mascot greeting & real-world Santali translator ready',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([initialGreeting]);
    }
  }, [messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const updateMsgAudioStatus = (
    msgId: string,
    audioStatus: AudioPlaybackStatus,
    audioStatusMessage: string
  ) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, audioStatus, audioStatusMessage } : m))
    );
  };

  // Clear conversation history
  const handleClearChat = () => {
    sound.playPop();
    sound.stopSpeech();
    setPlayingMessageId(null);
    setIsAudioPaused(false);
    setMessages([]);
  };

  // -------------------------------------------------------------------------
  // Speech Playback Controller (Speaks the validated translated text)
  // -------------------------------------------------------------------------
  const handlePlayAudio = async (msg: ChatMessage) => {
    sound.playPop();

    if (playingMessageId === msg.id && isAudioPaused) {
      sound.resumeSpeech();
      setIsAudioPaused(false);
      return;
    }

    sound.stopSpeech();
    setPlayingMessageId(msg.id);
    setIsAudioPaused(false);

    const targetAudioLang = msg.replyLang || 'santali';
    const textToSpeak =
      targetAudioLang === 'english'
        ? msg.english || msg.text
        : targetAudioLang === 'hindi'
        ? msg.hindi || msg.text
        : msg.santali?.olchiki || msg.text;

    await sound.speakTranslatedMessage({
      targetLang: targetAudioLang,
      translatedText: textToSpeak,
      santaliRoman: msg.santali?.roman || msg.transliteration || msg.pronunciationGuide,
      santaliDevanagari: msg.santali?.devanagari,
      onStatusChange: (res) => {
        updateMsgAudioStatus(msg.id, res.status, res.statusMessage);
      },
      onEnd: () => {
        setPlayingMessageId(null);
        setIsAudioPaused(false);
      },
    });
  };

  const handlePauseAudio = () => {
    sound.playPop();
    sound.pauseSpeech();
    setIsAudioPaused(true);
  };

  const handleReplayAudio = (msg: ChatMessage) => {
    sound.playPop();
    sound.stopSpeech();
    setIsAudioPaused(false);
    handlePlayAudio(msg);
  };

  // -------------------------------------------------------------------------
  // Microphone Speech-To-Text Handler
  // -------------------------------------------------------------------------
  const toggleListening = () => {
    sound.playPop();
    setSpeechNotice(null);

    if (isListening) {
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    if (inputLang === 'santali') {
      setSpeechNotice(
        'Notice: Standard browser speech recognition engines do not support native Santali (sat-IN) microphone recognition. Please speak in English or Hindi to translate into Santali, or type Santali using the Ol Chiki keyboard below.'
      );
      setShowOlChikiKeyboard(true);
      return;
    }

    if (!speechRecognizerRef.current?.isSupported) {
      setSpeechNotice(
        'Voice speech recognition is not supported in this browser. Please type your message below!'
      );
      return;
    }

    setIsListening(true);
    const recognitionLang = inputLang === 'hindi' ? 'hi-IN' : 'en-IN';

    speechRecognizerRef.current.start(
      recognitionLang,
      (transcript) => {
        setIsListening(false);
        if (transcript.trim()) {
          setInputText(transcript);
          processUserQuery(transcript.trim());
        }
      },
      (errorMessage) => {
        setIsListening(false);
        setSpeechNotice(errorMessage);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  // -------------------------------------------------------------------------
  // Core Message Dispatcher (Multi-turn intent-aware flow)
  // -------------------------------------------------------------------------
  const processUserQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    sound.playPop();
    setSpeechNotice(null);

    const childMsg: ChatMessage = {
      id: `child-${Date.now()}`,
      sender: 'child',
      text: queryText,
      inputLanguage: inputLang,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, childMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
        reply: m.replyLang ? m.text : undefined,
        santali: m.santali,
      }));

      let chatResponse: ChatResponse;
      try {
        chatResponse = await sendChatMessage(queryText, {
          conversationHistory,
          inputLang,
          replyLang,
          targetScript,
          context: {
            currentClass,
            currentSubject,
            chapterTitle,
            chapterId,
            langName: langConfig.name,
            scriptName: langConfig.scriptName,
            textbookSnippet: activeTextbook ? activeTextbook.readingPassageHindi.slice(0, 500) : '',
          },
        });
      } catch {
        // Offline / local fallback using deterministic verified pipeline
        chatResponse = await runChatPipeline({
          message: queryText,
          conversationHistory,
          inputLang,
          replyLang,
          targetScript,
          context: { currentClass, currentSubject, chapterTitle },
        });
      }

      let primaryDisplay = chatResponse.reply;
      if (
        replyLang === 'santali' &&
        chatResponse.santali &&
        chatResponse.santali.olchiki &&
        chatResponse.verificationStatus !== 'validation_failed' &&
        chatResponse.verificationStatus !== 'unavailable'
      ) {
        if (targetScript === 'roman') {
          primaryDisplay = chatResponse.santali.roman || chatResponse.reply;
        } else if (targetScript === 'devanagari') {
          primaryDisplay = chatResponse.santali.devanagari || chatResponse.reply;
        } else {
          primaryDisplay = chatResponse.santali.olchiki || chatResponse.reply;
        }
      }

      const hasValidSantali = Boolean(chatResponse.santali?.olchiki);

      const chotuMsg: ChatMessage = {
        id: `chotu-${Date.now()}`,
        sender: 'chotu',
        text: primaryDisplay,
        intent: chatResponse.intent || 'general_assistant',
        extractedUtterance: chatResponse.extractedUtterance,
        replyLang,
        detectedInputLang: chatResponse.detectedInputLanguage,
        santali: chatResponse.santali,
        hindi: chatResponse.hindi,
        english: chatResponse.english,
        backTranslationEnglish: chatResponse.backTranslationEnglish || chatResponse.english,
        backTranslationHindi: chatResponse.backTranslationHindi || chatResponse.hindi,
        transliteration: chatResponse.santali?.roman || chatResponse.pronunciationGuide,
        pronunciationGuide: chatResponse.pronunciationGuide || chatResponse.santali?.roman,
        isVerified: Boolean(chatResponse.isVerified),
        verificationStatus: chatResponse.verificationStatus || 'unverified_ai',
        confidence: chatResponse.confidence || 'unverified',
        modelUsed: chatResponse.modelUsed || 'gemini-3.8-flash',
        isUrgentOrMedical: Boolean(chatResponse.isUrgentOrMedical),
        warning: chatResponse.warning,
        safetyWarning: chatResponse.safetyWarning,
        verifiedVocabulary: chatResponse.verifiedVocabulary || [],
        audioStatus: hasValidSantali || replyLang !== 'santali' ? 'idle' : 'unsupported',
        audioStatusMessage:
          replyLang === 'english'
            ? 'Ready (Native en-IN voice)'
            : replyLang === 'hindi'
            ? 'Ready (Native hi-IN voice)'
            : hasValidSantali
            ? 'Ready (AI/Phonetic Santali words — native sat-IN TTS unavailable)'
            : 'Audio disabled (Santali translation unverified)',
        notes: chatResponse.notes,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, chotuMsg]);

      // Speak response aloud if valid translation/answer exists or if user explicitly asked for audio
      if (
        (hasValidSantali || replyLang !== 'santali' || chatResponse.autoPlayAudio) &&
        chatResponse.verificationStatus !== 'validation_failed' &&
        chatResponse.verificationStatus !== 'unavailable'
      ) {
        await handlePlayAudio(chotuMsg);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'chotu',
        text: `Santali translation could not be verified reliably (connection or service error).\nOriginal message: "${queryText}"`,
        replyLang,
        extractedUtterance: queryText,
        hindi: 'नेटवर्क में रुकावट के कारण संताली अनुवाद सत्यापित नहीं किया जा सका।',
        english: `Santali translation could not be verified reliably. Original message: "${queryText}"`,
        isVerified: false,
        verificationStatus: 'unavailable',
        confidence: 'unverified',
        warning: 'Santali translation could not be verified reliably.',
        isError: true,
        canRetry: true,
        retryQuery: queryText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    processUserQuery(inputText.trim());
  };

  const handleRetry = (query: string) => {
    processUserQuery(query);
  };

  const appendOlChikiChar = (char: string) => {
    sound.playPop();
    setInputText((prev) => prev + char);
    inputRef.current?.focus();
  };

  const getIntentBadgeLabel = (intent?: UserCommunicativeIntent) => {
    switch (intent) {
      case 'translation':
        return '🔄 Translation Mode';
      case 'incoming_translation':
        return '📥 Santali Reply → English/Hindi';
      case 'two_way_communication':
        return '🗣️ Two-Way Conversation Bridge';
      case 'audio_request':
        return '🔊 Audio Playback';
      default:
        return '🎓 General Assistant';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full h-[92vh] flex flex-col border-4 border-amber-400 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 p-3 border-b-2 border-amber-500 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm border border-amber-300">
                🦌
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-amber-950 flex items-center gap-1.5 leading-tight flex-wrap">
                  <span>Chotu (ᱪᱷᱳᱴᱩ) Santali Communicator &amp; Tutor</span>
                  {isOnline ? (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold px-1.5 py-0.5 rounded-full">
                      <Wifi className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Online</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-1.5 py-0.5 rounded-full">
                      <WifiOff className="w-2.5 h-2.5 text-amber-700" />
                      <span>Offline Phrasebook Mode</span>
                    </span>
                  )}
                </h3>
                <p className="text-xs text-amber-900 font-bold">
                  Real-World Santali Translation (`ᱚᱞ ᱪᱤᱠᱤ`) • Two-Way Dialogue • Class {currentClass} Tutor
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleClearChat}
                className="p-1.5 rounded-full bg-white/80 hover:bg-white text-amber-900 hover:text-red-600 transition-colors shadow-xs cursor-pointer"
                title="Clear conversation history"
                aria-label="Clear Chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  sound.stopSpeech();
                  onClose();
                }}
                className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-amber-950 font-black text-sm flex items-center justify-center shadow-xs cursor-pointer"
                aria-label="Close Chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-amber-900/10 p-1 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                sound.stopSpeech();
                setActiveMode('qa');
              }}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'qa'
                  ? 'bg-white text-amber-950 shadow-xs'
                  : 'text-amber-900 hover:bg-white/40'
              }`}
            >
              <span>🦌</span>
              <span>Chotu Chat &amp; Translation</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playPop();
                sound.stopSpeech();
                setActiveMode('communicator');
              }}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'communicator'
                  ? 'bg-white text-amber-950 shadow-xs'
                  : 'text-amber-900 hover:bg-white/40'
              }`}
            >
              <span>🗣️</span>
              <span>Two-Way Santali Communicator</span>
              <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                Turn-by-Turn
              </span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {activeMode === 'communicator' ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            <LiveSantaliCommunicator onClose={onClose} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden bg-amber-50/40">
            {/* Multilingual Control Bar */}
            <div className="bg-amber-100/90 border-b border-amber-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-amber-900 shrink-0">I Speak/Type:</span>
                <select
                  value={inputLang}
                  onChange={(e) => setInputLang(e.target.value as any)}
                  className="bg-white border border-amber-300 rounded-lg px-2 py-1 text-xs font-bold text-amber-950 focus:outline-none focus:border-amber-500 cursor-pointer shadow-2xs"
                >
                  <option value="auto">Auto-Detect</option>
                  <option value="english">English</option>
                  <option value="hindi">Hindi (हिंदी)</option>
                  <option value="santali">Santali (Ol Chiki / Roman)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-bold text-amber-900 shrink-0">Chotu Replies In:</span>
                <div className="inline-flex rounded-lg bg-white p-0.5 border border-amber-300 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setReplyLang('santali');
                    }}
                    className={`px-2 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                      replyLang === 'santali'
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'text-amber-900 hover:bg-amber-100'
                    }`}
                  >
                    Santali
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setReplyLang('english');
                    }}
                    className={`px-2 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                      replyLang === 'english'
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'text-amber-900 hover:bg-amber-100'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setReplyLang('hindi');
                    }}
                    className={`px-2 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                      replyLang === 'hindi'
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'text-amber-900 hover:bg-amber-100'
                    }`}
                  >
                    Hindi
                  </button>
                </div>
              </div>

              {replyLang === 'santali' && (
                <div className="flex items-center gap-1">
                  <span className="font-bold text-amber-900 shrink-0">Script:</span>
                  <select
                    value={targetScript}
                    onChange={(e) => setTargetScript(e.target.value as SantaliScript)}
                    className="bg-white border border-amber-300 rounded-lg px-1.5 py-1 text-xs font-bold text-amber-950 focus:outline-none focus:border-amber-500 cursor-pointer shadow-2xs"
                  >
                    <option value="olchiki">Ol Chiki (ᱚᱞ ᱪᱤᱠᱤ)</option>
                    <option value="roman">Roman Santali (Phonetic)</option>
                    <option value="devanagari">Santali in Devanagari (Not Hindi)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Speech / Microphone Notification Banner */}
            {speechNotice && (
              <div className="bg-amber-100 border-b border-amber-300 px-3 py-2 flex items-start justify-between gap-2 text-xs text-amber-950 animate-fade-in">
                <div className="flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="leading-tight font-medium">{speechNotice}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSpeechNotice(null)}
                  className="text-amber-700 hover:text-amber-950 font-bold px-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
              {messages.map((msg) => {
                const isChotu = msg.sender === 'chotu';
                const isPlayingThis = playingMessageId === msg.id && !isAudioPaused;

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 items-start ${isChotu ? 'justify-start' : 'justify-end'}`}
                  >
                    {isChotu && (
                      <div className="w-8 h-8 rounded-full bg-amber-300 border-2 border-amber-500 flex items-center justify-center text-sm shrink-0 shadow-2xs">
                        🦌
                      </div>
                    )}

                    <div
                      className={`max-w-[90%] rounded-3xl p-3.5 shadow-sm text-sm space-y-2.5 ${
                        isChotu
                          ? 'bg-white border-2 border-amber-300 text-amber-950 rounded-tl-none'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-tr-none'
                      }`}
                    >
                      {/* Speaker Label, Intent Mode, & Verification Status Badges */}
                      <div className="flex items-center justify-between gap-2 border-b border-amber-100/60 pb-1.5 text-[11px] flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`font-black ${isChotu ? 'text-amber-900' : 'text-amber-100'}`}>
                            {isChotu ? 'Chotu (ᱪᱷᱳᱴᱩ)' : 'You'}
                          </span>
                          {isChotu && msg.intent && (
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded-md font-bold text-[10px]">
                              {getIntentBadgeLabel(msg.intent)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isChotu &&
                            (msg.verificationStatus === 'verified_phrasebook' ||
                              msg.verificationStatus === 'verified_template') && (
                              <span
                                className="inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-900 border border-emerald-400 px-2 py-0.2 rounded-full font-extrabold text-[10px]"
                                title="Verified against native Santali reference phrasebook"
                              >
                                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                                <span>
                                  {msg.verificationStatus === 'verified_phrasebook'
                                    ? 'Verified Phrasebook'
                                    : 'Verified Template'}
                                </span>
                              </span>
                            )}

                          {isChotu && msg.verificationStatus === 'unverified_ai' && (
                            <span
                              className="inline-flex items-center gap-0.5 bg-amber-200 text-amber-950 border border-amber-500 px-2 py-0.2 rounded-full font-extrabold text-[10px]"
                              title="AI-generated candidate — not verified against reference phrasebook"
                            >
                              <Sparkles className="w-3 h-3 text-amber-800" />
                              <span>Unverified AI Candidate</span>
                            </span>
                          )}

                          {isChotu &&
                            (msg.verificationStatus === 'validation_failed' ||
                              msg.verificationStatus === 'unavailable') && (
                              <span className="inline-flex items-center gap-0.5 bg-red-100 text-red-900 border border-red-400 px-2 py-0.2 rounded-full font-extrabold text-[10px]">
                                <AlertCircle className="w-3 h-3 text-red-700" />
                                <span>Unverified / Blocked</span>
                              </span>
                            )}

                          <span className={`${isChotu ? 'text-slate-400' : 'text-amber-200'}`}>
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>

                      {/* Extracted Communicative Utterance (if indirect request like "Please ask them...") */}
                      {isChotu && msg.extractedUtterance && (
                        <div className="text-xs bg-stone-100 px-2.5 py-1.5 rounded-xl border border-stone-200 text-slate-700 font-bold">
                          Message to communicate: &ldquo;{msg.extractedUtterance}&rdquo;
                        </div>
                      )}

                      {/* Safety Warning for Urgent/Medical Messages */}
                      {isChotu && msg.safetyWarning && (
                        <div className="bg-red-100 border-2 border-red-400 rounded-xl p-2.5 flex items-start gap-2 text-xs text-red-950 font-bold">
                          <ShieldAlert className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                          <span>{msg.safetyWarning}</span>
                        </div>
                      )}

                      {/* Unverified Warning Banner */}
                      {isChotu && msg.warning && (
                        <div className="bg-amber-100/90 border border-amber-400 rounded-xl p-2 flex items-start gap-1.5 text-xs text-amber-950 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                          <span>{msg.warning}</span>
                        </div>
                      )}

                      {/* Primary Text Content */}
                      <p className="font-extrabold text-base leading-relaxed whitespace-pre-wrap font-olchiki select-text">
                        {msg.text}
                      </p>

                      {/* Santali Script & Roman Pronunciation Breakdown */}
                      {isChotu && msg.santali?.olchiki && (
                        <div className="bg-amber-50/90 rounded-xl p-2.5 border border-amber-200 space-y-1 text-xs">
                          <p className="font-black text-amber-950 font-olchiki text-base">
                            Santali (ᱚᱞ ᱪᱤᱠᱤ): {msg.santali.olchiki}
                          </p>
                          {msg.santali.roman && (
                            <p className="text-amber-900 font-semibold italic">
                              Roman Pronunciation (Transliteration): {msg.santali.roman}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Meaning-Preserving Back-Translation (English & Hindi) */}
                      {isChotu && (msg.backTranslationEnglish || msg.backTranslationHindi) && (
                        <div className="pt-1 border-t border-amber-100 space-y-1 text-xs text-amber-900">
                          {msg.backTranslationEnglish && (
                            <p>
                              <strong className="text-amber-950">English Meaning:</strong>{' '}
                              &ldquo;{msg.backTranslationEnglish}&rdquo;
                            </p>
                          )}
                          {msg.backTranslationHindi && (
                            <p>
                              <strong className="text-amber-950">Hindi Meaning (हिंदी):</strong>{' '}
                              &ldquo;{msg.backTranslationHindi}&rdquo;
                            </p>
                          )}
                        </div>
                      )}

                      {/* Verified Vocabulary Breakdown (ONLY when words exist in verified lexicon) */}
                      {isChotu && msg.verifiedVocabulary && msg.verifiedVocabulary.length > 0 && (
                        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-2 space-y-1">
                          <div className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-900">
                            <BookOpen className="w-3 h-3 text-emerald-700" />
                            <span>Verified Vocabulary:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {msg.verifiedVocabulary.map((v, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-950 font-bold"
                              >
                                <strong className="font-olchiki">{v.santaliOlChiki}</strong> ({v.santaliRoman}) ={' '}
                                {v.english}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Error & Retry Button */}
                      {msg.isError && msg.canRetry && msg.retryQuery && (
                        <div className="pt-1 flex items-center justify-between gap-2">
                          <span className="text-xs text-red-700 font-bold">
                            Could not verify translation
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRetry(msg.retryQuery!)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-2xs press-bounce cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Retry</span>
                          </button>
                        </div>
                      )}

                      {/* Audio Controls & Two-Way Follow-up Bar */}
                      {isChotu && !msg.isError && (
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-amber-100 text-[11px]">
                          <span className="text-amber-800 text-[10px] font-bold">
                            🔊 {msg.audioStatusMessage || 'Audio Ready'}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {msg.santali?.olchiki && (
                              <button
                                type="button"
                                onClick={() => {
                                  sound.playPop();
                                  setInputLang('santali');
                                  setReplyLang('english');
                                  setShowOlChikiKeyboard(true);
                                  inputRef.current?.focus();
                                }}
                                className="px-2 py-1 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold flex items-center gap-1 text-[10px] cursor-pointer"
                                title="Translate the other person's Santali reply"
                              >
                                <MessageSquareReply className="w-3 h-3" />
                                <span>Translate Their Reply</span>
                              </button>
                            )}

                            {!isPlayingThis ? (
                              <button
                                type="button"
                                disabled={
                                  msg.verificationStatus === 'validation_failed' ||
                                  msg.verificationStatus === 'unavailable'
                                }
                                onClick={() => handlePlayAudio(msg)}
                                className="px-2.5 py-1 rounded-full bg-amber-100 hover:bg-amber-200 disabled:opacity-40 text-amber-950 font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Speak translated message aloud"
                                aria-label="Play audio"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span className="text-[10px]">Speak Aloud</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={handlePauseAudio}
                                className="px-2.5 py-1 rounded-full bg-amber-500 text-white font-bold flex items-center gap-1 shadow-2xs animate-pulse cursor-pointer"
                                title="Pause audio"
                                aria-label="Pause audio"
                              >
                                <Pause className="w-3 h-3 fill-current" />
                                <span className="text-[10px]">Pause</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleReplayAudio(msg)}
                              className="p-1 rounded-full hover:bg-amber-100 text-amber-900 transition-colors cursor-pointer"
                              title="Replay from start"
                              aria-label="Replay audio"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 bg-white p-3 rounded-2xl border-2 border-amber-300 w-fit shadow-xs animate-pulse">
                  <span>🦌 Chotu is translating and verifying...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Real-World Communication & Learning Pills */}
            <div className="p-2 bg-amber-100/90 border-t border-amber-200 flex items-center gap-1.5 overflow-x-auto text-xs whitespace-nowrap">
              <span className="font-black text-amber-950 text-[11px] px-1 shrink-0">Try:</span>

              <button
                type="button"
                onClick={() => processUserQuery('Please ask them where the bus stand is.')}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-200 text-amber-950 font-bold border border-amber-300 shadow-2xs cursor-pointer"
              >
                🚌 Ask where bus stand is
              </button>

              <button
                type="button"
                onClick={() => processUserQuery('Tell them I need help.')}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-200 text-amber-950 font-bold border border-amber-300 shadow-2xs cursor-pointer"
              >
                🤝 Tell them I need help
              </button>

              <button
                type="button"
                onClick={() => processUserQuery('Ask them how much this costs.')}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-200 text-amber-950 font-bold border border-amber-300 shadow-2xs cursor-pointer"
              >
                🏷️ Ask how much this costs
              </button>

              <button
                type="button"
                onClick={() =>
                  processUserQuery('Tell them I am feeling unwell and need a doctor.')
                }
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-200 text-amber-950 font-bold border border-amber-300 shadow-2xs cursor-pointer"
              >
                🏥 Feeling unwell &amp; need doctor
              </button>

              <button
                type="button"
                onClick={() =>
                  processUserQuery('How do I tell someone in Santali that I need water?')
                }
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-200 text-amber-950 font-bold border border-amber-300 shadow-2xs cursor-pointer"
              >
                💧 How to say I need water
              </button>

              <button
                type="button"
                onClick={() =>
                  processUserQuery(
                    "I know English, but I don't know Santali. Help me talk to a Santali-speaking person."
                  )
                }
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-200 text-amber-950 font-bold border border-amber-300 shadow-2xs cursor-pointer"
              >
                🗣️ Help me talk to a Santali speaker
              </button>

              <button
                type="button"
                onClick={() => processUserQuery('Can you speak this translated message aloud?')}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-200 text-amber-950 font-bold border border-amber-300 shadow-2xs cursor-pointer"
              >
                🔊 Speak translated message aloud
              </button>

              <button
                type="button"
                onClick={() => setInputText(`इस पाठ (${cleanChapterHindiTitle}) को समझाओ`)}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-200 text-amber-950 font-bold border border-amber-300 shadow-2xs cursor-pointer"
              >
                📖 Explain lesson
              </button>
            </div>

            {/* Ol Chiki Virtual Keyboard Palette */}
            {showOlChikiKeyboard && (
              <div className="bg-amber-100 p-2 border-t border-amber-300 animate-fade-in">
                <div className="flex items-center justify-between pb-1.5">
                  <span className="text-xs font-black text-amber-950">
                    Ol Chiki Character Palette (ᱚᱞ ᱪᱤᱠᱤ):
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowOlChikiKeyboard(false)}
                    className="text-xs text-amber-800 hover:text-amber-950 font-bold cursor-pointer"
                  >
                    Hide ✕
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                  {OL_CHIKI_KEYBOARD.map((char) => (
                    <button
                      key={char}
                      type="button"
                      onClick={() => appendOlChikiChar(char)}
                      className="w-7 h-7 bg-white hover:bg-amber-300 border border-amber-300 rounded text-sm font-black text-amber-950 flex items-center justify-center shadow-2xs active:scale-95 transition-all cursor-pointer"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={handleSubmit}
              className="p-2.5 sm:p-3 bg-white border-t-2 border-amber-300 flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => setShowOlChikiKeyboard((prev) => !prev)}
                className={`p-2 rounded-2xl border text-xs font-black flex items-center justify-center transition-all cursor-pointer ${
                  showOlChikiKeyboard
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
                }`}
                title="Toggle Ol Chiki keyboard"
              >
                ᱚᱞ
              </button>

              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isListening
                    ? 'Listening... speak clearly into your mic!'
                    : inputLang === 'santali'
                    ? 'Paste or type Santali message to translate into English/Hindi...'
                    : 'Ask to translate (e.g. "Ask them where the bus stand is") or ask a question...'
                }
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border-2 border-amber-300 focus:border-amber-500 focus:outline-none text-sm font-bold text-amber-950 placeholder:text-slate-400"
              />

              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 sm:p-3 rounded-2xl font-bold transition-all shadow-md flex items-center justify-center cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-300'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-400 active:scale-95'
                }`}
                title={isListening ? 'Stop listening' : 'Start microphone voice input'}
                aria-label="Microphone input"
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-amber-900" />}
              </button>

              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="p-2.5 sm:p-3 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold shadow-md press-bounce transition-all border border-amber-700 cursor-pointer flex items-center justify-center"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

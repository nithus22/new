import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Volume2,
  Pause,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Download,
  Languages,
  BookMarked,
  Share2,
} from 'lucide-react';
import { Chapter, LanguageId, ScriptMode } from '../types/index.ts';
import { getChapterTextbookInfo } from '../utils/textbookData';
import { sound } from '../utils/audio';

interface TextbookReaderProps {
  chapter: Chapter;
  currentLanguage: LanguageId;
  activeScript: ScriptMode;
  onClose?: () => void;
  isInline?: boolean; // true if embedded inside LessonView
  onCompleteChapter?: () => void;
}

export const TextbookReader: React.FC<TextbookReaderProps> = ({
  chapter,
  currentLanguage,
  activeScript,
  onClose,
  isInline = false,
  onCompleteChapter,
}) => {
  const textbook = getChapterTextbookInfo(chapter);
  const langData = chapter.languages[currentLanguage] || chapter.languages['santali'];

  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeTab, setActiveTab] = useState<'textbook' | 'dual' | 'exercises'>('textbook');
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showAnswerIdx, setShowAnswerIdx] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      sound.stopSpeech();
    };
  }, []);

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      sound.stopSpeech();
      setIsPlayingAudio(false);
      return;
    }

    sound.playPop();
    setIsPlayingAudio(true);

    const textToRead = textbook.readingPassageHindi || textbook.readingPassageEnglish || '';
    sound.speakText(textToRead, {
      lang: chapter.subjectId === 'english' ? 'en-IN' : 'hi-IN',
      rate: 0.85,
      pitch: 1.05,
      onEnd: () => {
        setIsPlayingAudio(false);
      },
    });
  };

  const fontSizeClass =
    fontSize === 'normal'
      ? 'text-base sm:text-lg leading-relaxed'
      : fontSize === 'large'
      ? 'text-lg sm:text-xl leading-loose'
      : 'text-xl sm:text-2xl leading-loose';

  return (
    <div className={`space-y-5 ${isInline ? '' : 'max-w-4xl mx-auto py-4 px-3'}`}>
      {/* Official JCERT Textbook Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-orange-950 to-amber-950 rounded-3xl p-5 text-white shadow-xl border-3 border-amber-600 relative overflow-hidden">
        {/* Background Emblem Watermark */}
        <div className="absolute right-3 top-2 text-8xl opacity-10 select-none pointer-events-none">
          📖
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-xs font-black uppercase tracking-wider">
                JCERT आधिकारिक पाठ्यपुस्तक
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-amber-100 text-xs font-bold border border-white/20">
                Class {chapter.classNumber} • {textbook.pageRange}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-bold border border-emerald-400/40">
                झारखंड शैक्षिक अनुसंधान एवं प्रशिक्षण परिषद्
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-amber-100 tracking-tight">
              {textbook.bookTitle}
            </h2>

            <p className="text-sm font-semibold text-amber-200/90 flex items-center gap-2">
              <span>अध्याय {chapter.chapterNumber}: {chapter.originalTitleHindi}</span>
              <span className="text-xs text-amber-300/70">({chapter.originalTitleEnglish})</span>
            </p>
          </div>

          {/* Quick Actions: Audio, External JCERT PDF Portal */}
          <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
            <button
              onClick={handleToggleAudio}
              className={`px-4 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-md press-bounce transition-all ${
                isPlayingAudio
                  ? 'bg-amber-400 text-amber-950 ring-4 ring-amber-300 animate-pulse'
                  : 'bg-amber-500 hover:bg-amber-400 text-amber-950'
              }`}
            >
              {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isPlayingAudio ? 'रोकें (Pause)' : 'बोलकर सुनें (Read Aloud)'}</span>
            </button>

            <a
              href={textbook.officialPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/30 press-bounce"
              title="JCERT आधिकारिक पोर्टल पर पूरी किताब देखें"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
              <span>JCERT पोर्टल PDF</span>
            </a>
          </div>
        </div>

        {/* View Mode Tabs: Standard Textbook, Dual Bilingual Reader, Textbook Exercises */}
        <div className="flex items-center gap-2 pt-4 mt-3 border-t border-amber-800/80 flex-wrap">
          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('textbook');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
              activeTab === 'textbook'
                ? 'bg-amber-400 text-amber-950 shadow-sm'
                : 'bg-black/30 hover:bg-black/50 text-amber-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>पाठ्यपुस्तक मूल पाठ (JCERT Book)</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('dual');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
              activeTab === 'dual'
                ? 'bg-amber-400 text-amber-950 shadow-sm'
                : 'bg-black/30 hover:bg-black/50 text-amber-200'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>द्विभाषी सेतु (Dual Read-Along Bridge)</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('exercises');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
              activeTab === 'exercises'
                ? 'bg-amber-400 text-amber-950 shadow-sm'
                : 'bg-black/30 hover:bg-black/50 text-amber-200'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>अभ्यास प्रश्न ({textbook.textbookExercises.length})</span>
          </button>

          {/* Text size controls */}
          <div className="ml-auto flex items-center gap-1 bg-black/40 rounded-xl p-1 border border-amber-700/50">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                fontSize === 'normal' ? 'bg-amber-400 text-amber-950' : 'text-amber-200'
              }`}
              title="सामान्य अक्षर"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                fontSize === 'large' ? 'bg-amber-400 text-amber-950' : 'text-amber-200'
              }`}
              title="बड़ा अक्षर"
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('xlarge')}
              className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                fontSize === 'xlarge' ? 'bg-amber-400 text-amber-950' : 'text-amber-200'
              }`}
              title="अति बड़ा अक्षर"
            >
              A++
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1: Standard Textbook Reader */}
      {activeTab === 'textbook' && (
        <div className="space-y-6">
          <div className="bg-[#fffdf7] rounded-3xl p-6 sm:p-8 border-4 border-[#e9dcbe] shadow-lg relative">
            {/* Textbook Page Ribbon & Watermark */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#dfcfab]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-600 inline-block"></span>
                <span className="text-xs font-bold text-amber-900 tracking-wide">
                  {textbook.publisher}
                </span>
              </div>
              <span className="text-xs font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                {textbook.pageRange}
              </span>
            </div>

            {/* Reading Passage Text */}
            <div className="text-stone-900 font-serif space-y-4">
              {textbook.readingPassageHindi.split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx} className={`${fontSizeClass} leading-relaxed indent-4 sm:indent-8`}>
                  {paragraph}
                </p>
              ))}

              {textbook.readingPassageEnglish && chapter.subjectId === 'english' && (
                <div className="mt-4 pt-4 border-t border-amber-200 bg-amber-50/50 p-4 rounded-2xl">
                  <p className="text-xs font-black uppercase text-amber-800 mb-2">English Text:</p>
                  {textbook.readingPassageEnglish.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx} className={`${fontSizeClass} font-sans leading-relaxed`}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Tap-to-Speak instruction */}
            <div className="mt-6 pt-4 border-t border-[#dfcfab] flex items-center justify-between text-xs text-stone-600 font-sans">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>बच्चों के पढ़ने के लिए: 'बोलकर सुनें' बटन दबाएँ।</span>
              </span>
              <span className="font-bold text-amber-900">
                {chapter.bookName}
              </span>
            </div>
          </div>

          {/* Key Textbook Vocabulary Bridge */}
          {textbook.keyVocabulary && textbook.keyVocabulary.length > 0 && (
            <div className="bg-amber-50 rounded-3xl p-5 border-3 border-amber-300 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-black text-amber-950 flex items-center gap-2">
                  <span>📖 पाठ के मुख्य शब्द व मातृभाषा अनुवाद (Vocabulary Bridge)</span>
                </h3>
                <span className="text-xs font-bold text-amber-800">
                  मातृभाषा में उच्चारण सुनने के लिए टैप करें
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {textbook.keyVocabulary.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      sound.playPop();
                      setSelectedWord(item.word);
                      const spokenText =
                        currentLanguage === 'santali'
                          ? item.santaliWord
                          : currentLanguage === 'ho'
                          ? item.hoWord
                          : item.mundariWord;
                      sound.speakText(spokenText, { lang: 'hi-IN', pitch: 1.15 });
                    }}
                    className={`text-left p-3.5 rounded-2xl border-2 transition-all press-bounce cursor-pointer ${
                      selectedWord === item.word
                        ? 'bg-amber-200 border-amber-500 shadow-sm scale-102'
                        : 'bg-white hover:bg-amber-100 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-950 text-base">{item.word}</span>
                      <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                    </div>
                    <p className="text-xs text-slate-600 font-semibold">{item.meaningHindi}</p>

                    <div className="mt-2 pt-2 border-t border-amber-100 text-xs space-y-0.5">
                      <p className="text-emerald-800 font-bold">
                        <span className="text-slate-500">संताली:</span> {item.santaliWord}
                      </p>
                      <p className="text-indigo-800 font-bold">
                        <span className="text-slate-500">हो:</span> {item.hoWord}
                      </p>
                      <p className="text-amber-900 font-bold">
                        <span className="text-slate-500">मुण्डारी:</span> {item.mundariWord}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Dual Bilingual Reader (Side-by-Side Read Along) */}
      {activeTab === 'dual' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-300 text-xs font-bold text-emerald-950 flex items-center justify-between">
            <span>✨ द्विभाषी पठन: बाईं ओर आधिकारिक JCERT पुस्तक तथा दाईं ओर मातृभाषा लिपि!</span>
            <span className="uppercase tracking-wider font-black text-emerald-800">
              {currentLanguage.toUpperCase()} BRIDGE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Official JCERT Textbook */}
            <div className="bg-[#fffdf7] rounded-3xl p-5 border-3 border-amber-300 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b pb-2 border-amber-200">
                <span className="text-xs font-black text-amber-900 uppercase">
                  🇮🇳 JCERT पाठ्यपुस्तक (Original)
                </span>
                <span className="text-xs font-bold text-slate-500">{textbook.pageRange}</span>
              </div>

              <h4 className="text-lg font-black text-amber-950">
                {chapter.originalTitleHindi}
              </h4>

              <div className="text-stone-800 text-sm leading-relaxed space-y-3 font-serif">
                {textbook.readingPassageHindi.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              <button
                onClick={() => {
                  sound.playPop();
                  sound.speakText(textbook.readingPassageHindi, { lang: 'hi-IN' });
                }}
                className="w-full mt-2 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>सुनें (Listen in Hindi)</span>
              </button>
            </div>

            {/* Right Column: Tribal Mother Tongue Translation */}
            <div className="bg-amber-50 rounded-3xl p-5 border-3 border-amber-400 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b pb-2 border-amber-200">
                <span className="text-xs font-black text-amber-900 uppercase">
                  🌿 मातृभाषा अनुवाद ({currentLanguage.toUpperCase()})
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  {langData.reviewStatus === 'approved' ? '✓ स्वीकृत (Approved)' : 'शिक्षक द्वारा परीक्षित'}
                </span>
              </div>

              <h4 className="text-lg font-black text-amber-950">
                {langData.title}
              </h4>

              <div className="text-amber-950 text-base leading-relaxed space-y-3 font-bold">
                <p className="bg-white/80 p-3 rounded-2xl border border-amber-200">
                  {langData.scriptText || langData.title}
                </p>

                <div className="p-3 bg-amber-100/70 rounded-2xl text-xs space-y-1">
                  <p className="font-extrabold text-amber-900">
                    रोमन लिप्यांतरण: {langData.transliteration}
                  </p>
                  {langData.alternateTransliteration && (
                    <p className="font-semibold text-slate-700">
                      देवनागरी: {langData.alternateTransliteration}
                    </p>
                  )}
                </div>

                {langData.audioNarrationText && (
                  <p className="text-xs text-stone-700 italic bg-white/60 p-2.5 rounded-xl border border-amber-200">
                    "{langData.audioNarrationText}"
                  </p>
                )}
              </div>

              <button
                onClick={() => {
                  sound.playPop();
                  sound.speakText(langData.audioNarrationText || langData.transliteration, {
                    lang: 'hi-IN',
                    rate: 0.85,
                  });
                }}
                className="w-full mt-2 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>उच्चारण मार्गदर्शिका (Phonetic Guide)</span>
              </button>
              <p className="text-[10px] text-amber-800 text-center font-bold mt-1">
                ℹ️ Educational Roman phonetic synthesis. Native Santali TTS is not standard in web browsers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Textbook Exercises (अभ्यास प्रश्न) */}
      {activeTab === 'exercises' && (
        <div className="bg-white rounded-3xl p-6 border-4 border-amber-300 shadow-lg space-y-5">
          <div className="flex items-center justify-between border-b pb-3 border-amber-200">
            <div>
              <h3 className="text-lg font-black text-amber-950 flex items-center gap-2">
                <span>📝 पाठ्यपुस्तक अभ्यास प्रश्न (Textbook Exercises)</span>
              </h3>
              <p className="text-xs text-slate-600 font-semibold">
                JCERT पुस्तक के अंत में दिए गए प्रश्न एवं गतिविधियाँ
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-xs font-black text-amber-900">
              {textbook.textbookExercises.length} अभ्यास कार्य
            </span>
          </div>

          <div className="space-y-4">
            {textbook.textbookExercises.map((ex, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-200 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      {idx + 1}
                    </span>
                    <p className="font-bold text-amber-950 text-sm sm:text-base leading-snug">
                      {ex.question}
                    </p>
                  </div>

                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 border border-amber-300 shrink-0">
                    {ex.type}
                  </span>
                </div>

                {/* Show Answer / Hint Toggle */}
                <div className="pl-8 pt-1">
                  <button
                    onClick={() => {
                      sound.playPop();
                      setShowAnswerIdx(showAnswerIdx === idx ? null : idx);
                    }}
                    className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer underline"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>{showAnswerIdx === idx ? 'संकेत छिपाएँ' : 'उत्तर / संकेत देखें (Hint)'}</span>
                  </button>

                  {showAnswerIdx === idx && (
                    <div className="mt-2 p-3 bg-white rounded-xl border border-amber-300 text-xs text-amber-950 font-semibold animate-fade-in shadow-xs">
                      💡 {ex.hint}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Learning Outcomes Footer */}
          {textbook.learningOutcomes && textbook.learningOutcomes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-amber-200 bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>सीखने के प्रतिफल (JCERT Learning Outcomes)</span>
              </h4>
              <ul className="text-xs text-emerald-950 space-y-1 font-semibold list-disc list-inside">
                {textbook.learningOutcomes.map((outcome, oIdx) => (
                  <li key={oIdx}>{outcome}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Chapter Completion Card */}
      <div className="bg-gradient-to-r from-amber-100 via-orange-50 to-emerald-50 p-5 rounded-3xl border-3 border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div>
          <h4 className="text-base font-black text-amber-950 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Finish Reading this JCERT Chapter?</span>
          </h4>
          <p className="text-xs text-amber-900 font-bold mt-0.5">
            Marking this lesson complete updates your learning trail and awards 3 stars!
          </p>
        </div>
        <button
          onClick={() => {
            sound.playCelebration();
            if (onCompleteChapter) {
              onCompleteChapter();
            }
          }}
          className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md press-bounce cursor-pointer border-2 border-emerald-700 shrink-0"
        >
          <span>Mark Lesson Completed (⭐ +3 Stars)</span>
        </button>
      </div>
    </div>
  );
};

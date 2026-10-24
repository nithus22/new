import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Gamepad2,
  HelpCircle,
  Video,
  CheckCircle2,
  BookCheck,
  AlertCircle,
  BookOpen,
  Film,
} from 'lucide-react';
import { Chapter, LanguageId, ScriptMode, BridgeMode } from '../types';
import { StoryAnimation } from './StoryAnimation';
import { sound } from '../utils/audio';
import { getEffectiveChapterSlides } from '../utils/gameLogic';
import { Mascot } from './Mascot';
import { TextbookReader } from './TextbookReader';
import { AnimatedStorybookModal } from './AnimatedStorybookModal';
import { recordChapterVisit } from '../utils/progressStore';

interface LessonViewProps {
  chapter: Chapter;
  currentLanguage: LanguageId;
  activeScript: ScriptMode;
  bridgeMode: BridgeMode;
  onOpenGames: () => void;
  onOpenChatbot: () => void;
  onOpenReportModal: () => void;
  onCompleteChapter: () => void;
}

export const LessonView: React.FC<LessonViewProps> = ({
  chapter,
  currentLanguage,
  activeScript,
  bridgeMode,
  onOpenGames,
  onOpenChatbot,
  onOpenReportModal,
  onCompleteChapter,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlayingNarration, setIsPlayingNarration] = useState(false);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState<number | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [viewMode, setViewMode] = useState<'animated' | 'textbook'>('animated');

  const langData = chapter.languages[currentLanguage] || chapter.languages['santali'];
  const slides = getEffectiveChapterSlides(chapter, currentLanguage);
  const currentSlide = slides[currentSlideIndex];

  // Save chapter visit to progress store for Continue Learning
  useEffect(() => {
    recordChapterVisit(
      chapter.id,
      chapter.classNumber,
      chapter.subjectId,
      chapter.originalTitleEnglish,
      chapter.originalTitleHindi,
      chapter.coverEmoji,
      chapter.languages[currentLanguage]?.title
    );
  }, [chapter.id, chapter.classNumber, chapter.subjectId, chapter.originalTitleEnglish, chapter.originalTitleHindi, chapter.coverEmoji, chapter.languages, currentLanguage]);

  // Stop speech if unmounting or slide changes
  useEffect(() => {
    return () => {
      sound.stopSpeech();
    };
  }, [currentSlideIndex]);

  const handlePlayNarration = () => {
    if (isPlayingNarration) {
      sound.stopSpeech();
      setIsPlayingNarration(false);
      setHighlightedWordIndex(null);
      return;
    }

    if (!currentSlide) return;

    sound.playPop();
    setIsPlayingNarration(true);

    const textToSpeak =
      bridgeMode === 'hindi'
        ? currentSlide.hindi
        : bridgeMode === 'english'
        ? currentSlide.english
        : currentSlide.audioPhonetic || currentSlide.transliteration;

    const words = textToSpeak.split(' ');

    sound.speakText(textToSpeak, {
      lang: bridgeMode === 'english' ? 'en-IN' : 'hi-IN',
      rate: 0.82,
      pitch: 1.15,
      onWord: (charIndex) => {
        // Approximate word index from charIndex
        const wordIdx = textToSpeak.slice(0, charIndex).trim().split(/\s+/).length - 1;
        setHighlightedWordIndex(Math.max(0, wordIdx));
      },
      onEnd: () => {
        setIsPlayingNarration(false);
        setHighlightedWordIndex(null);
      },
    });
  };

  const handleNextSlide = () => {
    sound.playPop();
    sound.stopSpeech();
    setIsPlayingNarration(false);
    if (currentSlideIndex + 1 < slides.length) {
      setCurrentSlideIndex((prev) => prev + 1);
    } else {
      onCompleteChapter();
    }
  };

  const handlePrevSlide = () => {
    sound.playPop();
    sound.stopSpeech();
    setIsPlayingNarration(false);
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  if (!currentSlide) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="text-5xl">📖 ⏳</div>
        <h3 className="text-2xl font-black text-amber-950">
          Lesson Content Coming Soon
        </h3>
        <p className="text-sm font-semibold text-amber-800">
          The teacher resource team is compiling translations and audio for {chapter.originalTitleHindi}.
        </p>
        <p className="text-xs text-slate-500">
          Try Chapter 1 (Shapes & Space) which is 100% complete in all 3 languages!
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onOpenGames}
            className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md press-bounce"
          >
            Check Games
          </button>
        </div>
      </div>
    );
  }

  const nativeWords = currentSlide.native.split(' ');

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Chapter Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/90 rounded-3xl p-4 border-3 border-amber-300 shadow-md">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
              Class {chapter.classNumber} • Chapter {chapter.chapterNumber}
            </span>

            {/* Review Status Badge */}
            {langData.reviewStatus === 'approved' ? (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Approved</span>
              </span>
            ) : langData.reviewStatus === 'teacher-reviewed' ? (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
                <BookCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Teacher-Reviewed</span>
              </span>
            ) : (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
                <span>AI Draft</span>
              </span>
            )}

            <button
              onClick={onOpenReportModal}
              className="text-xs font-semibold text-orange-700 hover:underline flex items-center gap-1 ml-1"
              title="Report wrong translation to teacher review queue"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Report translation</span>
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-amber-950 mt-1">
            {langData.title}
          </h2>

          <p className="text-xs font-bold text-slate-500">
            JCERT Book: {chapter.bookName} • Original: {chapter.originalTitleHindi} ({chapter.originalTitleEnglish})
          </p>
        </div>

        {/* Action Buttons: Play Games, Watch Story Video, Ask Chotu, Read Official Textbook */}
        <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
          <button
            onClick={() => {
              sound.playPop();
              sound.stopSpeech();
              setIsPlayingNarration(false);
              setViewMode(viewMode === 'animated' ? 'textbook' : 'animated');
            }}
            className={`px-3 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md press-bounce border-2 transition-all ${
              viewMode === 'textbook'
                ? 'bg-amber-600 text-white border-amber-800 ring-2 ring-amber-400'
                : 'bg-amber-400 hover:bg-amber-500 text-amber-950 border-amber-600'
            }`}
            title="Toggle between Cartoon Animation and Official JCERT Textbook Reader"
          >
            <BookOpen className="w-4 h-4" />
            <span>{viewMode === 'animated' ? '📖 पाठ्यपुस्तक पढ़ें' : '🎬 कार्टून पाठ'}</span>
          </button>

          <button
            onClick={() => setShowVideoModal(true)}
            className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm press-bounce border border-indigo-700"
            title="Open Animated Chapter Storybook for this lesson"
          >
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">Animated Storybook</span>
          </button>

          <button
            onClick={onOpenGames}
            aria-label="Open Chapter Games"
            className="px-3.5 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md press-bounce border-2 border-emerald-700"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Play Games</span>
          </button>
        </div>
      </div>

      {viewMode === 'textbook' ? (
        <TextbookReader
          chapter={chapter}
          currentLanguage={currentLanguage}
          activeScript={activeScript}
          isInline={true}
          onCompleteChapter={onCompleteChapter}
        />
      ) : (
        <>
          {/* Interactive Story Animation Canvas */}
          <StoryAnimation
            sceneType={currentSlide.sceneType}
            currentLanguage={currentLanguage}
            nativeKeywords={currentSlide.keywords}
            chapterMeta={{
              chapterNumber: chapter.chapterNumber,
              classNumber: chapter.classNumber,
              subjectId: chapter.subjectId,
              bookName: chapter.bookName,
              originalTitleHindi: chapter.originalTitleHindi,
              originalTitleEnglish: chapter.originalTitleEnglish,
              coverEmoji: chapter.coverEmoji,
            }}
            chapterTitle={chapter.originalTitleHindi}
            conceptKey={currentSlide.conceptKey}
            visualHint={currentSlide.visualHint}
          />

          {/* Main Lesson Text Card with Word Audio Narration */}
          <div className="bg-white/95 rounded-3xl p-6 border-4 border-amber-300 shadow-xl space-y-4">
            {/* Slide Pagination & Narration Controls */}
            <div className="flex items-center justify-between border-b pb-3 border-amber-200">
              <span className="text-xs font-black uppercase text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                Slide {currentSlideIndex + 1} of {slides.length}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayNarration}
                  className={`px-4 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-md press-bounce border-2 transition-all ${
                    isPlayingNarration
                      ? 'bg-amber-500 text-white border-amber-700 animate-pulse'
                      : 'bg-amber-400 hover:bg-amber-500 text-amber-950 border-amber-600'
                  }`}
                  aria-label={isPlayingNarration ? 'Pause audio narration' : 'Play audio narration'}
                >
                  {isPlayingNarration ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlayingNarration ? 'Playing...' : 'Play Narration'}</span>
                </button>
              </div>
            </div>

            {/* Lesson Native Script Text with synchronized highlight */}
            <div className="p-4 bg-amber-50/80 rounded-2xl border-2 border-amber-200 space-y-2 text-center sm:text-left">
              <div className="text-xl sm:text-3xl font-extrabold text-amber-950 leading-relaxed tracking-wide">
                {nativeWords.map((word, idx) => {
                  const isHighlighted = highlightedWordIndex === idx;
                  return (
                    <span
                      key={idx}
                      className={`inline-block mx-1 px-1.5 py-0.5 rounded-lg transition-all ${
                        isHighlighted
                          ? 'bg-amber-400 text-amber-950 font-black scale-110 shadow-sm'
                          : 'hover:bg-amber-200 cursor-pointer'
                      }`}
                      onClick={() => {
                        sound.playPop();
                        sound.speakText(word, { lang: 'hi-IN', pitch: 1.2 });
                      }}
                      title="Tap to hear word"
                    >
                      {word}
                    </span>
                  );
                })}
              </div>

              {/* Transliteration (Roman & Devanagari for Ho) */}
              <div className="space-y-0.5 pt-2 border-t border-amber-200">
                <p className="text-sm sm:text-base font-bold text-amber-900">
                  {currentSlide.transliteration}
                </p>
                {currentSlide.alternateTransliteration && (
                  <p className="text-xs sm:text-sm font-semibold text-slate-700">
                    Devanagari: {currentSlide.alternateTransliteration}
                  </p>
                )}
              </div>
            </div>

            {/* Bridge Language Toggle (Hindi / English original explanation) */}
            <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Bridge Language (Official JCERT Reference)</span>
                </span>
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-700">
                  {bridgeMode === 'mother-tongue' ? 'Mother Tongue Mode' : bridgeMode}
                </span>
              </div>

              <div className="text-sm font-bold text-emerald-950">
                <p>🇮🇳 Hindi: {currentSlide.hindi}</p>
                <p className="text-xs text-slate-600 mt-0.5">🇬🇧 English: {currentSlide.english}</p>
              </div>
            </div>

            {/* Visual Scene Hint */}
            <p className="text-xs text-slate-500 italic">
              💡 Visual Hint: {currentSlide.visualHint}
            </p>

            {/* Slide Navigation Footers */}
            <div className="flex items-center justify-between pt-3 border-t border-amber-200">
              <button
                disabled={currentSlideIndex === 0}
                onClick={handlePrevSlide}
                className={`px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all press-bounce border ${
                  currentSlideIndex === 0
                    ? 'opacity-40 cursor-not-allowed bg-stone-100 text-stone-400 border-stone-200'
                    : 'bg-amber-200 hover:bg-amber-300 text-amber-950 border-amber-400'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleNextSlide}
                className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md press-bounce border-2 border-amber-700"
              >
                <span>{currentSlideIndex + 1 < slides.length ? 'Next Concept' : 'Finish Chapter'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Animated Chapter Storybook Modal */}
      {showVideoModal && (
        <AnimatedStorybookModal
          chapter={chapter}
          currentLanguage={currentLanguage}
          activeScript={activeScript}
          bridgeMode={bridgeMode}
          onClose={() => setShowVideoModal(false)}
        />
      )}
    </div>
  );
};

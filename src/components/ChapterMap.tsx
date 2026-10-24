import React, { useState } from 'react';
import { Star, CheckCircle2, Play, Sparkles, BookCheck, ShieldAlert, BookOpen, X, Trophy } from 'lucide-react';
import { Chapter, LanguageId, ScriptMode } from '../types';
import { sound } from '../utils/audio';
import { Mascot } from './Mascot';
import { TextbookReader } from './TextbookReader';
import { loadStoredProgress, markChapterComplete } from '../utils/progressStore';

interface ChapterMapProps {
  chapters: Chapter[];
  currentLanguage: LanguageId;
  activeScript: ScriptMode;
  completedChapters: string[];
  onSelectChapter: (chapter: Chapter) => void;
  selectedClass: number;
  selectedSubject: string;
}

export const ChapterMap: React.FC<ChapterMapProps> = ({
  chapters,
  currentLanguage,
  activeScript,
  completedChapters,
  onSelectChapter,
  selectedClass,
  selectedSubject,
}) => {
  const [readingTextbookChapter, setReadingTextbookChapter] = useState<Chapter | null>(null);
  const progress = loadStoredProgress();

  const handleChapterClick = (chapter: Chapter) => {
    sound.playPop();
    const langData = chapter.languages[currentLanguage] || chapter.languages['santali'];
    sound.speakText(langData.title || chapter.originalTitleHindi, {
      lang: 'hi-IN',
      pitch: 1.15,
    });
    onSelectChapter(chapter);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Mascot Guidance */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
        <Mascot
          speechText="ᱫᱮᱞᱟᱵᱚᱱ! ᱪᱮᱯᱴᱟᱨ ᱵᱟᱪᱷᱟᱣ ᱢᱮ! (Choose a chapter on the learning trail!)"
          speechTransliteration="Follow the forest path to explore animated stories and games."
          size="md"
          audioSpeechText="Choose a chapter to begin your adventure!"
        />
      </div>

      <div className="text-center space-y-1">
        {chapters[0]?.bookName && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-200/90 border border-amber-400 text-xs font-black text-amber-950 mb-1 shadow-xs">
            <BookCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Official JCERT Book: {chapters[0].bookName}</span>
          </div>
        )}
        <h2 className="text-2xl sm:text-3xl font-black text-amber-950 tracking-tight">
          Learning Trail (ᱥᱮᱪᱮᱫ ᱰᱟᱦᱟᱨ / पाठ सूची)
        </h2>
        <p className="text-sm font-semibold text-amber-800">
          Class {selectedClass} • {chapters.length} Official Chapters • Jharkhand State Syllabus
        </p>
      </div>

      {/* Visual Adventure Map / Winding Path */}
      <div className="relative space-y-4">
        {chapters.map((chapter, index) => {
          const langData = chapter.languages[currentLanguage] || chapter.languages['santali'];
          const isCompleted = completedChapters.includes(chapter.id);
          const isBenchmark = chapter.id === 'c1-maths-ch1' || chapter.id === 'c2-hindi-ch10' || chapter.id === 'c5-hindi-ch11';
          const hasFullContent = (langData?.lessonSlides?.length ?? 0) > 0;

          return (
            <div
              key={chapter.id}
              role="button"
              tabIndex={0}
              onClick={() => handleChapterClick(chapter)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleChapterClick(chapter);
                }
              }}
              className={`w-full text-left relative rounded-3xl p-5 border-4 transition-all duration-200 cursor-pointer shadow-lg press-bounce group ${
                isBenchmark
                  ? 'bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100 border-amber-500 ring-4 ring-amber-300'
                  : isCompleted
                  ? 'bg-emerald-50 border-emerald-400'
                  : 'bg-white hover:bg-amber-50 border-amber-300 hover:border-amber-500'
              }`}
              aria-label={`Open Chapter ${chapter.chapterNumber}: ${chapter.originalTitleHindi}`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Left: Chapter Number & Cover Emoji */}
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 border-2 border-amber-600 flex items-center justify-center text-3xl shadow-md group-hover:scale-105 transition-transform">
                      {chapter.coverEmoji}
                    </div>
                    <span className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-amber-950 text-white font-black text-xs flex items-center justify-center border-2 border-amber-300 shadow-xs">
                      {chapter.chapterNumber}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 border border-amber-300">
                        Chapter {chapter.chapterNumber}
                      </span>

                      {/* Review status badge */}
                      {langData?.reviewStatus === 'approved' ? (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Approved</span>
                        </span>
                      ) : langData?.reviewStatus === 'teacher-reviewed' ? (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
                          <BookCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>Teacher-Reviewed</span>
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-yellow-100 text-yellow-800 border border-yellow-300 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
                          <span>AI Draft</span>
                        </span>
                      )}

                      {isBenchmark && (
                        <span className="text-xs font-black px-2 py-0.5 rounded-md bg-amber-500 text-white animate-pulse">
                          ⭐ Complete Benchmark Chapter
                        </span>
                      )}
                    </div>

                    {/* Native Script Title */}
                    <h3 className="text-xl sm:text-2xl font-black text-amber-950 mt-1 leading-snug">
                      {langData?.title || chapter.originalTitleHindi}
                    </h3>

                    {/* Hindi / English Original Reference */}
                    <p className="text-xs sm:text-sm text-slate-600 font-bold mt-0.5">
                      JCERT Original: {chapter.originalTitleHindi} ({chapter.originalTitleEnglish})
                    </p>
                  </div>
                </div>

                {/* Right: Stars, Textbook Button & Action CTA */}
                <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center flex-wrap justify-end">
                  {/* Dedicated Textbook Read-Along CTA */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playPop();
                      setReadingTextbookChapter(chapter);
                    }}
                    className="px-3 py-1.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 border-2 border-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-xs press-bounce"
                    title="JCERT आधिकारिक पाठ्यपुस्तक पढ़ें"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                    <span>पाठ्यपुस्तक</span>
                  </button>

                  {/* Quiz score indicator if taken */}
                  {progress.quizScores[chapter.id] && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-2xl bg-emerald-100 border border-emerald-300 font-extrabold text-emerald-900 text-xs">
                      <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Quiz: {progress.quizScores[chapter.id].score}/{progress.quizScores[chapter.id].total}</span>
                    </div>
                  )}

                  {isCompleted ? (
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-amber-200 border border-amber-400 font-black text-amber-950 text-xs">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-600" />
                      <Star className="w-4 h-4 fill-amber-500 text-amber-600" />
                      <Star className="w-4 h-4 fill-amber-500 text-amber-600" />
                    </div>
                  ) : null}

                  <div className="px-4 py-2 rounded-2xl bg-amber-400 group-hover:bg-amber-500 text-amber-950 font-black text-sm flex items-center gap-1.5 shadow-sm border border-amber-600">
                    <Play className="w-4 h-4 fill-current" />
                    <span>{hasFullContent ? 'Start Lesson' : 'Explore'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Official JCERT Textbook Reader Modal */}
      {readingTextbookChapter && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 border-4 border-amber-400 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            {/* Modal Header & Close Button */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-amber-200 sticky top-0 bg-white z-20">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📖</span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-amber-950">
                    JCERT पाठ्यपुस्तक वाचन (Read-Along)
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">
                    झारखंड राज्य प्राथमिक शिक्षा परिषद् आधिकारिक पाठ्यक्रम
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playPop();
                  setReadingTextbookChapter(null);
                }}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center justify-center press-bounce"
                aria-label="Close textbook reader"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <TextbookReader
              chapter={readingTextbookChapter}
              currentLanguage={currentLanguage}
              activeScript={activeScript}
              isInline={false}
              onClose={() => setReadingTextbookChapter(null)}
              onCompleteChapter={() => {
                markChapterComplete(readingTextbookChapter.id, 3);
                setReadingTextbookChapter(null);
                onSelectChapter(readingTextbookChapter);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

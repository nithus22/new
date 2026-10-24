/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronRight, BookOpen, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { getSubjectsForClass, INITIAL_CURRICULUM } from '../data/curriculum';
import { LanguageId } from '../types';
import { sound } from '../utils/audio';
import { Mascot } from './Mascot';
import { loadStoredProgress, LastAccessedChapter } from '../utils/progressStore';

interface SubjectSelectorProps {
  currentLanguage: LanguageId;
  selectedClass: number;
  selectedSubject: string;
  onSelectSubject: (subjectId: 'maths' | 'hindi' | 'evs' | 'english') => void;
  onContinueLearning?: (lastAccessed: LastAccessedChapter) => void;
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  currentLanguage,
  selectedClass,
  selectedSubject,
  onSelectSubject,
  onContinueLearning,
}) => {
  const subjects = getSubjectsForClass(selectedClass);
  const progress = loadStoredProgress();
  const lastAccessed = progress.lastAccessed;

  const handleSubjectPick = (subjectId: 'maths' | 'hindi' | 'evs' | 'english', name: string) => {
    sound.playPop();
    sound.speakText(name, { lang: 'hi-IN', pitch: 1.15 });
    onSelectSubject(subjectId);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Mascot Header */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
        <Mascot
          speechText={`Class ${selectedClass} - ᱵᱤᱥᱚᱭ ᱵᱟᱪᱷᱟᱣ ᱢᱮ! (Pick your subject!)`}
          speechTransliteration="Choose your official JCERT Jharkhand textbook to start learning."
          size="md"
          audioSpeechText={`Class ${selectedClass}. Which official textbook do you want to learn?`}
        />
      </div>

      {/* Continue Learning Banner if last accessed belongs to this class */}
      {lastAccessed && lastAccessed.classNumber === selectedClass && (
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-3xl p-5 border-4 border-amber-600 shadow-xl text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white/90 border-2 border-amber-600 flex items-center justify-center text-3xl shadow-md">
              {lastAccessed.coverEmoji || '📖'}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-900 text-amber-100 text-[11px] font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Continue Learning (ᱪᱟᱞᱟᱣ ᱢᱮ)</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-amber-950 leading-tight">
                {lastAccessed.hindiTitle}
              </h3>
              <p className="text-xs font-bold text-amber-900">
                Class {lastAccessed.classNumber} • {lastAccessed.subjectId.toUpperCase()} • {lastAccessed.santaliTitle || lastAccessed.chapterTitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playCelebration();
              if (onContinueLearning) {
                onContinueLearning(lastAccessed);
              } else {
                onSelectSubject(lastAccessed.subjectId);
              }
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg press-bounce cursor-pointer border-2 border-emerald-700"
            aria-label={`Resume chapter ${lastAccessed.hindiTitle}`}
          >
            <span>Resume Chapter</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-xs font-black text-emerald-900 mb-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Official Jharkhand JCERT Primary Textbooks</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-amber-950 tracking-tight">
          Choose Subject for Class {selectedClass}
        </h2>
        <p className="text-sm font-semibold text-amber-800">
          Source: Jharkhand Council of Educational Research & Training (JCERT)
        </p>
      </div>

      {/* Subject Tiles with Completion Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {subjects.map((sub) => {
          const isSelected = selectedSubject === sub.id;
          const subjectChapters = INITIAL_CURRICULUM.filter(
            (c) => c.classNumber === selectedClass && c.subjectId === sub.id
          );
          const totalChapters = subjectChapters.length;
          const completedCount = subjectChapters.filter((c) =>
            progress.completedChapters.includes(c.id)
          ).length;
          const completionPct = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;

          return (
            <button
              key={sub.id}
              onClick={() => handleSubjectPick(sub.id, sub.bookTitle)}
              className={`p-6 rounded-3xl border-4 transition-all duration-200 text-left flex flex-col justify-between shadow-xl press-bounce cursor-pointer group ${
                isSelected
                  ? 'bg-amber-100 border-amber-600 ring-4 ring-amber-300 scale-102'
                  : 'bg-white hover:bg-amber-50 border-amber-300 hover:border-amber-500'
              }`}
              aria-label={`Select subject ${sub.bookTitle}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shadow-inner shrink-0">
                  {sub.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 border border-amber-300">
                      {sub.chapterCount} {sub.id === 'english' ? 'Units' : 'Chapters'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      JCERT State
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-amber-950 mt-1 truncate">
                    {sub.bookTitle}
                  </h3>
                  <p className="text-sm font-bold text-amber-800">
                    {sub.name} • {sub.hindiName}
                  </p>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5 line-clamp-2">
                    {sub.description}
                  </p>
                </div>
              </div>

              {/* Completion Progress Bar */}
              <div className="mt-4 pt-3 border-t border-amber-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-amber-900">Learning Progress</span>
                  <span className="font-extrabold text-emerald-800">
                    {completedCount} of {totalChapters} completed {completedCount === totalChapters && totalChapters > 0 ? '🎉' : ''}
                  </span>
                </div>
                <div className="w-full bg-amber-200/80 rounded-full h-2.5 overflow-hidden border border-amber-300">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs font-black text-amber-900">
                <span>View All Chapters</span>
                <div className="w-8 h-8 rounded-full bg-amber-200 group-hover:bg-amber-300 flex items-center justify-center text-amber-900 transition-colors">
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, ChevronRight, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';
import { CLASSES, INITIAL_CURRICULUM } from '../data/curriculum';
import { LanguageId } from '../types';
import { LANGUAGES } from '../data/languages';
import { Mascot } from './Mascot';
import { sound } from '../utils/audio';
import { loadStoredProgress, LastAccessedChapter } from '../utils/progressStore';

interface ClassSelectorProps {
  currentLanguage: LanguageId;
  onSelectClass: (classNum: number) => void;
  selectedClass: number;
  onContinueLearning?: (lastAccessed: LastAccessedChapter) => void;
}

export const ClassSelector: React.FC<ClassSelectorProps> = ({
  currentLanguage,
  onSelectClass,
  selectedClass,
  onContinueLearning,
}) => {
  const langConfig = LANGUAGES[currentLanguage];
  const progress = loadStoredProgress();
  const lastAccessed = progress.lastAccessed;

  const handleClassPick = (classNum: number) => {
    sound.playPop();
    const classInfo = CLASSES.find((c) => c.classNumber === classNum);
    if (classInfo) {
      sound.speakText(`Class ${classNum}. ${classInfo.animal}`, {
        lang: 'hi-IN',
        pitch: 1.2,
      });
    }
    onSelectClass(classNum);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Mascot Header */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
        <Mascot
          speechText="ᱚᱠᱟ ᱪᱟᱱᱟᱪ ᱨᱮᱢ ᱯᱟᱲᱦᱟᱣ-ᱟ? (Which class are you in?)"
          speechTransliteration="Choose your Class (1 to 5) with animal friends!"
          size="md"
          audioSpeechText="Oka chanach rem parha-a? Choose your class!"
        />
      </div>

      {/* Continue Learning Option if student visited a chapter previously */}
      {lastAccessed && (
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
                onSelectClass(lastAccessed.classNumber);
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
        <h2 className="text-2xl sm:text-3xl font-black text-amber-950 tracking-tight">
          Choose Your Class (ᱪᱟᱱᱟᱪ / कक्षा)
        </h2>
        <p className="text-sm font-semibold text-amber-800">
          Official JCERT Primary School Textbooks for Jharkhand • Classes 1 to 5
        </p>
      </div>

      {/* 5 Big Animal-Themed Class Buttons with Completion Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {CLASSES.map((cls) => {
          const isSelected = selectedClass === cls.classNumber;
          const classChapters = INITIAL_CURRICULUM.filter((c) => c.classNumber === cls.classNumber);
          const totalChaptersCount = classChapters.length;
          const completedCount = classChapters.filter((c) =>
            progress.completedChapters.includes(c.id)
          ).length;
          const completionPct = totalChaptersCount > 0
            ? Math.round((completedCount / totalChaptersCount) * 100)
            : 0;

          return (
            <button
              key={cls.classNumber}
              onClick={() => handleClassPick(cls.classNumber)}
              className={`relative rounded-3xl p-5 border-4 transition-all duration-200 text-left flex flex-col justify-between shadow-lg press-bounce cursor-pointer group ${
                isSelected
                  ? 'bg-amber-100 border-amber-600 ring-4 ring-amber-300 scale-102'
                  : 'bg-white hover:bg-amber-50 border-amber-300 hover:border-amber-500'
              }`}
              aria-label={`Select Class ${cls.classNumber}`}
            >
              {/* Animal & Class Number Header */}
              <div className="flex items-center justify-between">
                <span className="text-4xl sm:text-5xl group-hover:scale-125 transition-transform duration-200">
                  {cls.animalEmoji}
                </span>

                <div className="w-12 h-12 rounded-2xl bg-amber-400 border-2 border-amber-600 flex items-center justify-center text-amber-950 font-black text-2xl shadow-inner">
                  {cls.classNumber}
                </div>
              </div>

              {/* Class Titles */}
              <div className="my-3 space-y-1">
                <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 border border-amber-300">
                  Class {cls.classNumber}
                </span>

                <h3 className="text-lg sm:text-xl font-black text-amber-950">
                  {cls.label}
                </h3>

                <p className="text-xs text-slate-600 font-bold">
                  {cls.animal}
                </p>
              </div>

              {/* Chapter completion indicator bar */}
              <div className="my-2 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                  <span>Completed</span>
                  <span className="font-extrabold text-emerald-800">
                    {completedCount} / {totalChaptersCount} chapters
                  </span>
                </div>
                <div className="w-full bg-amber-200/80 rounded-full h-2 overflow-hidden border border-amber-300">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between pt-2 border-t border-amber-200 text-xs font-black text-amber-900">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                  <span>Open Books</span>
                </span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

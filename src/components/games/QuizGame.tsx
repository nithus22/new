/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Volume2,
  Sparkles,
  HelpCircle,
  Trophy,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { sound } from '../../utils/audio';
import { saveQuizScore } from '../../utils/progressStore';

interface QuizQuestion {
  id: string;
  question: {
    native: string;
    transliteration: string;
    hindi: string;
    english: string;
  };
  options: Array<{
    id: string;
    text: string;
    emoji?: string;
    isCorrect: boolean;
  }>;
  explanation: string;
}

interface QuizGameProps {
  questions: QuizQuestion[];
  chapterId?: string;
  onComplete: (score: number) => void;
}

export const QuizGame: React.FC<QuizGameProps> = ({ questions, chapterId, onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [attemptedCount, setAttemptedCount] = useState(0);

  const currentQ = questions[currentIdx];

  const handlePickOption = (option: { id: string; text: string; isCorrect: boolean }) => {
    if (selectedOptionId !== null) return; // already picked
    setSelectedOptionId(option.id);
    setAttemptedCount((c) => c + 1);

    if (option.isCorrect) {
      sound.playCorrect();
      setScore((s) => s + 1);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } else {
      sound.playBoing();
    }
  };

  const handleNextQuestion = () => {
    sound.playPop();
    setShowHint(false);
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((idx) => idx + 1);
      setSelectedOptionId(null);
    } else {
      const finalScore = score;
      setIsDone(true);
      sound.playCelebration();
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.5 } });

      if (chapterId) {
        saveQuizScore(chapterId, finalScore, questions.length);
      }
      onComplete(finalScore);
    }
  };

  const handleRetryQuestion = () => {
    sound.playPop();
    setSelectedOptionId(null);
  };

  const handleReset = () => {
    sound.playPop();
    setCurrentIdx(0);
    setSelectedOptionId(null);
    setScore(0);
    setIsDone(false);
    setShowHint(false);
    setAttemptedCount(0);
  };

  if (!currentQ && !isDone) return null;

  return (
    <div className="space-y-6">
      {!isDone && currentQ && (
        <div className="bg-white/95 rounded-3xl p-6 sm:p-7 border-3 border-amber-300 shadow-md space-y-4">
          {/* Header Row */}
          <div className="flex items-center justify-between text-xs font-black text-amber-900 border-b pb-2.5 border-amber-200">
            <span className="px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300">
              Question {currentIdx + 1} of {questions.length}
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-black shadow-xs">
              ⭐ Current Score: {score}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-amber-100 rounded-full overflow-hidden border border-amber-200">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Text Box with Visual Icon Badge */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 space-y-1.5 text-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-xs font-black mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>JCERT Lesson Check</span>
            </div>

            <h4 className="text-xl sm:text-2xl font-black text-amber-950 leading-snug">
              {currentQ.question.native}
            </h4>
            <p className="text-xs sm:text-sm font-bold text-amber-800">
              {currentQ.question.transliteration} • {currentQ.question.hindi}
            </p>
          </div>

          {/* Controls: Listen and Hint */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => {
                sound.playPop();
                sound.speakText(currentQ.question.hindi, { lang: 'hi-IN', pitch: 1.15 });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold border border-amber-300 press-bounce cursor-pointer shadow-xs"
              aria-label="Listen to question in Hindi"
            >
              <Volume2 className="w-4 h-4 text-amber-700" />
              <span>सुनें / Listen</span>
            </button>

            <button
              onClick={() => {
                sound.playPop();
                setShowHint(!showHint);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-900 text-xs font-bold border border-blue-300 press-bounce cursor-pointer shadow-xs"
              aria-label="Toggle hint"
            >
              <HelpCircle className="w-4 h-4 text-blue-700" />
              <span>{showHint ? 'Hide Hint' : '💡 Need a Hint?'}</span>
            </button>
          </div>

          {/* Hint Card */}
          {showHint && (
            <div className="p-3.5 rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-950 text-xs sm:text-sm font-bold animate-fade-in text-center">
              💡 <span className="font-extrabold">Hint:</span> {currentQ.explanation.split('.')[0] || 'Remember what you learned in the textbook lesson!'}
            </div>
          )}

          {/* Option Tiles (Touch Target >= 44px) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {currentQ.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              const answered = selectedOptionId !== null;

              let tileClass = 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-950';
              if (isSelected && opt.isCorrect) {
                tileClass = 'bg-emerald-100 border-emerald-500 text-emerald-950 ring-4 ring-emerald-300 scale-102';
              } else if (isSelected && !opt.isCorrect) {
                tileClass = 'bg-red-100 border-red-500 text-red-950 ring-2 ring-red-300';
              } else if (answered && opt.isCorrect) {
                tileClass = 'bg-amber-200 border-amber-500 text-amber-950 ring-2 ring-amber-400';
              }

              return (
                <button
                  key={opt.id}
                  disabled={answered}
                  onClick={() => handlePickOption(opt)}
                  className={`min-h-[56px] p-4 rounded-2xl border-3 flex flex-col items-center justify-center text-center shadow-md press-bounce transition-all duration-200 cursor-pointer ${tileClass}`}
                  aria-label={`Option: ${opt.text}`}
                >
                  {opt.emoji && <span className="text-4xl mb-1.5">{opt.emoji}</span>}
                  <span className="text-base font-black leading-snug">{opt.text}</span>

                  {isSelected && opt.isCorrect && (
                    <div className="flex items-center gap-1 mt-1.5 text-emerald-700 font-black text-xs">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>सही! Shabaash! (+1 Star)</span>
                    </div>
                  )}

                  {isSelected && !opt.isCorrect && (
                    <div className="flex items-center gap-1 mt-1.5 text-red-700 font-black text-xs">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span>गलत! Try again or see hint</span>
                    </div>
                  )}

                  {answered && opt.isCorrect && !isSelected && (
                    <div className="flex items-center gap-1 mt-1.5 text-amber-800 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-amber-700" />
                      <span>सही उत्तर (Correct Answer)</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation & Action Row */}
          {selectedOptionId !== null && (
            <div className="space-y-3 pt-2">
              <div
                className={`p-3.5 rounded-2xl text-center text-xs sm:text-sm font-bold animate-fade-in border-2 ${
                  currentQ.options.find((o) => o.id === selectedOptionId)?.isCorrect
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-orange-50 border-orange-300 text-orange-950'
                }`}
              >
                {currentQ.options.find((o) => o.id === selectedOptionId)?.isCorrect
                  ? '🌟 बहुत बढ़िया! (Very Good!) '
                  : '💡 सीखें: '}
                {currentQ.explanation}
              </div>

              <div className="flex items-center justify-center gap-3">
                {/* Retry option if wrong */}
                {!currentQ.options.find((o) => o.id === selectedOptionId)?.isCorrect && (
                  <button
                    onClick={handleRetryQuestion}
                    className="px-4 py-2.5 rounded-2xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-black text-xs sm:text-sm flex items-center gap-1.5 border border-amber-400 shadow-sm press-bounce cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Try Question Again</span>
                  </button>
                )}

                {/* Continue button */}
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md press-bounce cursor-pointer border border-emerald-700"
                >
                  <span>{currentIdx + 1 < questions.length ? 'Next Question' : 'Complete Quiz'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quiz Completion Screen */}
      {isDone && (
        <div className="bg-gradient-to-b from-emerald-100 to-amber-100 border-4 border-emerald-400 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-xl">
          <div className="text-6xl animate-bounce">🏆 🌟 🎊</div>
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-950">
              ᱠᱩᱭᱤᱡᱽ ᱢᱩᱪᱟᱹᱫ! Quiz Completed!
            </h3>
            <p className="text-sm font-bold text-emerald-800">
              Your score has been saved to your learning progress!
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border-2 border-emerald-400 text-2xl font-black text-emerald-900 shadow-inner">
            <Trophy className="w-7 h-7 text-amber-500" />
            <span>
              {score} / {questions.length} Correct ({Math.round((score / questions.length) * 100)}%)
            </span>
          </div>

          <div className="w-full max-w-md mx-auto bg-emerald-200 rounded-full h-4 overflow-hidden border border-emerald-300">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-1000"
              style={{ width: `${(score / questions.length) * 100}%` }}
            />
          </div>

          <p className="text-sm sm:text-base font-extrabold text-emerald-900 max-w-lg mx-auto">
            {score === questions.length
              ? '🎯 Perfect score! You are a Jharkhand learning champion!'
              : score >= questions.length / 2
              ? '👍 Great effort! Try again anytime to earn even more stars!'
              : '💪 Keep learning! The more you practice, the easier it gets!'}
          </p>

          <button
            onClick={handleReset}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg press-bounce inline-flex items-center gap-2 border-2 border-emerald-800 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Quiz for More Stars</span>
          </button>
        </div>
      )}
    </div>
  );
};

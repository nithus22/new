import React, { useState } from 'react';
import { RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
import { sound } from '../../utils/audio';

interface CountingGameProps {
  instruction: {
    native: string;
    transliteration: string;
    hindi: string;
    english: string;
  };
  items: Array<{
    id: string;
    emoji: string;
    name: string;
    count: number;
  }>;
  onComplete: (score: number) => void;
}

export const CountingGame: React.FC<CountingGameProps> = ({
  instruction,
  items,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const currentItem = items[currentIndex];

  // Show numbers 1–10 if any item count exceeds 5, otherwise 1–5
  const maxCount = Math.max(...items.map((i) => i.count));
  const numberOptions = Array.from({ length: Math.min(Math.max(maxCount, 5), 10) }, (_, i) => i + 1);

  const handlePickNumber = (num: number) => {
    // Lock out if already locked after a wrong answer, or if correct answer already given
    if (isLocked || (selectedAnswer !== null && isAnswerCorrect === true)) return;

    sound.playPop();
    setSelectedAnswer(num);
    const correct = num === currentItem.count;
    setIsAnswerCorrect(correct);

    if (correct) {
      sound.playCorrect();
      setTimeout(() => {
        if (currentIndex + 1 < items.length) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedAnswer(null);
          setIsAnswerCorrect(null);
        } else {
          setIsCompleted(true);
          sound.playCelebration();
          onComplete(items.length);
        }
      }, 1000);
    } else {
      sound.playBoing();
      setIsLocked(true);
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsAnswerCorrect(null);
        setIsLocked(false);
      }, 1400);
    }
  };

  const handleReset = () => {
    sound.playPop();
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setIsCompleted(false);
    setIsLocked(false);
  };

  return (
    <div className="space-y-6">
      {/* Instruction */}
      <div className="bg-amber-100 rounded-3xl p-4 border-2 border-amber-300 text-center space-y-1">
        <p className="text-base sm:text-lg font-black text-amber-950">
          {instruction.native}
        </p>
        <p className="text-xs sm:text-sm font-bold text-amber-800">
          {instruction.transliteration} • {instruction.hindi}
        </p>
      </div>

      {!isCompleted && currentItem && (
        <div className="bg-white/95 rounded-3xl p-6 border-3 border-amber-300 shadow-md text-center space-y-4">
          <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-amber-200 text-amber-900">
            Item {currentIndex + 1} of {items.length}
          </span>

          {/* Group of items to count */}
          <div className="flex flex-wrap items-center justify-center gap-4 py-4 min-h-[100px]">
            {Array.from({ length: currentItem.count }).map((_, idx) => (
              <span
                key={idx}
                className="text-5xl sm:text-6xl animate-gentle-bounce hover:scale-125 transition-transform cursor-pointer"
                style={{ animationDelay: `${idx * 0.15}s` }}
                onClick={() => {
                  sound.playPop();
                  sound.speakText(`${idx + 1}`, { lang: 'hi-IN' });
                }}
              >
                {currentItem.emoji}
              </span>
            ))}
          </div>

          <p className="text-sm font-bold text-amber-950">
            How many {currentItem.name} are there?
          </p>

          {/* Feedback messages */}
          {isAnswerCorrect === true && (
            <div className="flex items-center justify-center gap-2 text-emerald-700 font-black text-sm animate-fade-in">
              <CheckCircle2 className="w-5 h-5" />
              <span>✅ सही! Correct!</span>
            </div>
          )}
          {isAnswerCorrect === false && (
            <div className="flex items-center justify-center gap-2 text-red-600 font-black text-sm animate-fade-in">
              <XCircle className="w-5 h-5" />
              <span>❌ गलत! Wrong! Try again! ᱟᱨ ᱢᱤᱫ ᱫᱷᱟᱣ ᱞᱮᱠᱷᱟᱭ ᱢᱮ!</span>
            </div>
          )}

          {/* Number Option Buttons */}
          <div className="flex justify-center flex-wrap gap-3 pt-2">
            {numberOptions.map((num) => {
              const isSelected = selectedAnswer === num;
              return (
                <button
                  key={num}
                  onClick={() => handlePickNumber(num)}
                  disabled={isLocked || (selectedAnswer !== null && isAnswerCorrect === true)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl font-black text-2xl border-3 shadow-md press-bounce transition-all ${
                    isSelected && isAnswerCorrect === true
                      ? 'bg-emerald-500 text-white border-emerald-600 scale-110'
                      : isSelected && isAnswerCorrect === false
                      ? 'bg-red-400 text-white border-red-600 animate-wiggle'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                  aria-label={`Number option ${num}`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="bg-emerald-100 border-4 border-emerald-400 rounded-3xl p-6 text-center space-y-3 animate-bounce">
          <div className="text-5xl">🔢 ⭐ 🎈</div>
          <h3 className="text-2xl font-black text-emerald-950">
            ᱞᱮᱠᱷᱟ ᱯᱩᱨᱟᱹᱣ ᱮᱱᱟ! (Counting Complete!)
          </h3>
          <p className="text-sm font-bold text-emerald-800">
            You counted all items correctly in your mother tongue!
          </p>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md press-bounce inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, Volume2 } from 'lucide-react';
import { sound } from '../../utils/audio';

interface MatchingGameProps {
  instruction: {
    native: string;
    transliteration: string;
    hindi: string;
    english: string;
  };
  pairs: Array<{
    id: string;
    emoji: string;
    nativeWord: string;
    transliteration: string;
    hindiWord: string;
  }>;
  onComplete: (score: number) => void;
}

export const MatchingGame: React.FC<MatchingGameProps> = ({
  instruction,
  pairs,
  onComplete,
}) => {
  const [selectedEmojiId, setSelectedEmojiId] = useState<string | null>(null);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleEmojiClick = (id: string) => {
    sound.playPop();
    if (matchedIds.includes(id)) return;
    setSelectedEmojiId(id);

    // If word is already selected
    if (selectedWordId) {
      checkMatch(id, selectedWordId);
    }
  };

  const handleWordClick = (id: string, transliteration: string) => {
    sound.playPop();
    if (matchedIds.includes(id)) return;
    sound.speakText(transliteration, { lang: 'hi-IN', pitch: 1.2 });
    setSelectedWordId(id);

    // If emoji is already selected
    if (selectedEmojiId) {
      checkMatch(selectedEmojiId, id);
    }
  };

  const checkMatch = (emojiId: string, wordId: string) => {
    if (emojiId === wordId) {
      sound.playCorrect();
      const nextMatched = [...matchedIds, emojiId];
      setMatchedIds(nextMatched);
      setSelectedEmojiId(null);
      setSelectedWordId(null);

      if (nextMatched.length === pairs.length) {
        setIsCompleted(true);
        sound.playCelebration();
        onComplete(pairs.length);
      }
    } else {
      sound.playBoing();
      setTimeout(() => {
        setSelectedEmojiId(null);
        setSelectedWordId(null);
      }, 500);
    }
  };

  const handleReset = () => {
    sound.playPop();
    setMatchedIds([]);
    setSelectedEmojiId(null);
    setSelectedWordId(null);
    setIsCompleted(false);
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

      <div className="grid grid-cols-2 gap-4 sm:gap-8">
        {/* Left Column: Emojis / Pictures */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase text-amber-900 tracking-wider text-center">
            Pictures (ᱪᱤᱛᱟᱹᱨ / चित्र)
          </h4>
          {pairs.map((p) => {
            const isMatched = matchedIds.includes(p.id);
            const isSelected = selectedEmojiId === p.id;
            return (
              <button
                key={`emoji-${p.id}`}
                disabled={isMatched}
                onClick={() => handleEmojiClick(p.id)}
                className={`w-full p-4 rounded-3xl border-3 flex items-center justify-center text-4xl shadow-md transition-all press-bounce ${
                  isMatched
                    ? 'bg-emerald-100 border-emerald-400 opacity-60'
                    : isSelected
                    ? 'bg-amber-400 border-amber-600 ring-4 ring-amber-300 scale-102'
                    : 'bg-white hover:bg-amber-50 border-amber-300'
                }`}
                aria-label={`Picture option ${p.hindiWord}`}
              >
                <span>{p.emoji}</span>
                {isMatched && <CheckCircle2 className="w-5 h-5 text-emerald-600 ml-2" />}
              </button>
            );
          })}
        </div>

        {/* Right Column: Native Words */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase text-amber-900 tracking-wider text-center">
            Words (ᱟᱹᱲᱟᱹ / शब्द)
          </h4>
          {pairs.map((p) => {
            const isMatched = matchedIds.includes(p.id);
            const isSelected = selectedWordId === p.id;
            return (
              <button
                key={`word-${p.id}`}
                disabled={isMatched}
                onClick={() => handleWordClick(p.id, p.transliteration)}
                className={`w-full p-4 rounded-3xl border-3 flex flex-col items-center justify-center shadow-md transition-all press-bounce ${
                  isMatched
                    ? 'bg-emerald-100 border-emerald-400 opacity-60'
                    : isSelected
                    ? 'bg-amber-400 border-amber-600 ring-4 ring-amber-300 scale-102'
                    : 'bg-white hover:bg-amber-50 border-amber-300'
                }`}
                aria-label={`Word option ${p.nativeWord}`}
              >
                <span className="text-base sm:text-lg font-black text-amber-950">
                  {p.nativeWord}
                </span>
                <span className="text-xs text-amber-800 font-bold mt-0.5">
                  {p.hindiWord}
                </span>
                {isMatched && <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {isCompleted && (
        <div className="bg-emerald-100 border-4 border-emerald-400 rounded-3xl p-6 text-center space-y-3 animate-bounce">
          <div className="text-5xl">🌟 ⭐ 🎯</div>
          <h3 className="text-2xl font-black text-emerald-950">
            ᱡᱚᱲᱟᱣ ᱯᱩᱨᱟᱹᱣ ᱮᱱᱟ! (All Matched!)
          </h3>
          <p className="text-sm font-bold text-emerald-800">
            Great job! You learned the mother tongue words!
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

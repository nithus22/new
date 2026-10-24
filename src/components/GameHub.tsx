import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Sparkles, Trophy, Star, Gamepad2 } from 'lucide-react';
import { ChapterGameData } from '../types';
import { DragDropGame } from './games/DragDropGame';
import { MatchingGame } from './games/MatchingGame';
import { CountingGame } from './games/CountingGame';
import { TracingGame } from './games/TracingGame';
import { QuizGame } from './games/QuizGame';
import { sound } from '../utils/audio';

interface GameHubProps {
  gameData?: ChapterGameData;
  chapterTitle: string;
  chapterId?: string;
  onBackToLesson: () => void;
  onEarnStars: (stars: number) => void;
}

export const GameHub: React.FC<GameHubProps> = ({
  gameData,
  chapterTitle,
  chapterId,
  onBackToLesson,
  onEarnStars,
}) => {
  const [activeTab, setActiveTab] = useState<'dragDrop' | 'matching' | 'counting' | 'tracing' | 'quiz'>('dragDrop');
  const [completedGames, setCompletedGames] = useState<string[]>([]);

  useEffect(() => {
    setActiveTab('dragDrop');
    setCompletedGames([]);
  }, [chapterId, chapterTitle]);

  if (!gameData) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="text-5xl">🎮 ⏳</div>
        <h3 className="text-2xl font-black text-amber-950">Games Coming Soon</h3>
        <p className="text-sm font-semibold text-amber-800">
          Teacher-approved interactive games for this chapter are currently in development.
        </p>
        <button
          onClick={onBackToLesson}
          className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md press-bounce"
        >
          Back to Lesson
        </button>
      </div>
    );
  }

  const handleGameComplete = (gameKey: string) => {
    if (!completedGames.includes(gameKey)) {
      setCompletedGames((prev) => [...prev, gameKey]);
      onEarnStars(3);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          onClick={() => {
            sound.playPop();
            onBackToLesson();
          }}
          className="px-3 py-1.5 rounded-2xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-xs flex items-center gap-1 border border-amber-400 press-bounce shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lesson</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-600 text-white shadow-xs">
            🎮 Fun Learning Games
          </span>
          <span className="text-xs font-bold text-amber-900">
            {completedGames.length}/5 Completed
          </span>
        </div>
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-2xl sm:text-3xl font-black text-amber-950 tracking-tight">
          Chapter Games: {chapterTitle}
        </h2>
        <p className="text-xs sm:text-sm font-bold text-amber-800">
          Play, practice your mother tongue, and earn stars & stickers!
        </p>
      </div>

      {/* Game Mode Tabs */}
      <div className="flex items-center justify-center flex-wrap gap-2">
        {gameData.dragDrop && (
          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('dragDrop');
            }}
            className={`px-3.5 py-2 rounded-2xl font-black text-xs sm:text-sm transition-all press-bounce border-2 ${
              activeTab === 'dragDrop'
                ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105'
                : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-50'
            }`}
          >
            📦 Drag & Drop {completedGames.includes('dragDrop') && '⭐'}
          </button>
        )}

        {gameData.matching && (
          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('matching');
            }}
            className={`px-3.5 py-2 rounded-2xl font-black text-xs sm:text-sm transition-all press-bounce border-2 ${
              activeTab === 'matching'
                ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105'
                : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-50'
            }`}
          >
            🔗 Matching {completedGames.includes('matching') && '⭐'}
          </button>
        )}

        {gameData.counting && (
          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('counting');
            }}
            className={`px-3.5 py-2 rounded-2xl font-black text-xs sm:text-sm transition-all press-bounce border-2 ${
              activeTab === 'counting'
                ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105'
                : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-50'
            }`}
          >
            🔢 Counting {completedGames.includes('counting') && '⭐'}
          </button>
        )}

        {gameData.tracing && (
          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('tracing');
            }}
            className={`px-3.5 py-2 rounded-2xl font-black text-xs sm:text-sm transition-all press-bounce border-2 ${
              activeTab === 'tracing'
                ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105'
                : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-50'
            }`}
          >
            ✍️ Letter Tracing {completedGames.includes('tracing') && '⭐'}
          </button>
        )}

        {gameData.quiz && (
          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('quiz');
            }}
            className={`px-3.5 py-2 rounded-2xl font-black text-xs sm:text-sm transition-all press-bounce border-2 ${
              activeTab === 'quiz'
                ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105'
                : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-50'
            }`}
          >
            🎯 Picture Quiz {completedGames.includes('quiz') && '⭐'}
          </button>
        )}
      </div>

      {/* Active Game Container */}
      <div className="bg-amber-50/80 rounded-3xl p-4 sm:p-6 border-3 border-amber-300 shadow-xl">
        {activeTab === 'dragDrop' && gameData.dragDrop && (
          <DragDropGame
            key={`${chapterId || chapterTitle}-dragDrop`}
            instruction={gameData.dragDrop.instruction}
            zones={gameData.dragDrop.zones}
            items={gameData.dragDrop.items}
            onComplete={() => handleGameComplete('dragDrop')}
          />
        )}

        {activeTab === 'matching' && gameData.matching && (
          <MatchingGame
            key={`${chapterId || chapterTitle}-matching`}
            instruction={gameData.matching.instruction}
            pairs={gameData.matching.pairs}
            onComplete={() => handleGameComplete('matching')}
          />
        )}

        {activeTab === 'counting' && gameData.counting && (
          <CountingGame
            key={`${chapterId || chapterTitle}-counting`}
            instruction={gameData.counting.instruction}
            items={gameData.counting.items}
            onComplete={() => handleGameComplete('counting')}
          />
        )}

        {activeTab === 'tracing' && gameData.tracing && (
          <TracingGame
            key={`${chapterId || chapterTitle}-tracing`}
            tracingData={gameData.tracing}
            onComplete={() => handleGameComplete('tracing')}
          />
        )}

        {activeTab === 'quiz' && gameData.quiz && (
          <QuizGame
            key={`${chapterId || chapterTitle}-quiz`}
            questions={gameData.quiz}
            chapterId={chapterId}
            onComplete={() => handleGameComplete('quiz')}
          />
        )}
      </div>
    </div>
  );
};

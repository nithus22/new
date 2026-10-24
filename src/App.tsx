/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  LanguageId,
  ScriptMode,
  BridgeMode,
  Chapter,
  ReviewStatus,
  TranslationFeedback,
} from './types';
import { LANGUAGES } from './data/languages';
import { INITIAL_CURRICULUM } from './data/curriculum';
import { sound } from './utils/audio';
import { checkStickerUnlocks, calculateStarRewards, getEffectiveGameData } from './utils/gameLogic';
import { STICKERS } from './data/curriculum';

// Components
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ClassSelector } from './components/ClassSelector';
import { SubjectSelector } from './components/SubjectSelector';
import { ChapterMap } from './components/ChapterMap';
import { LessonView } from './components/LessonView';
import { GameHub } from './components/GameHub';
import { ChatbotModal } from './components/ChatbotModal';
import { StickerBookModal } from './components/StickerBookModal';
import { ReportModal } from './components/ReportModal';
import { TeacherPortal } from './components/TeacherPortal';
import { loadStoredProgress, markChapterComplete, LastAccessedChapter } from './utils/progressStore';
import { useNetworkStatus } from './utils/useNetworkStatus';

type ScreenType = 'welcome' | 'classes' | 'subjects' | 'chapters' | 'lesson' | 'games' | 'teacher';

export default function App() {
  // 1. Language & Script State
  const [currentLanguage, setCurrentLanguage] = useState<LanguageId>(() => {
    const saved = localStorage.getItem('bhasha_language');
    return (saved as LanguageId) || 'santali';
  });

  const [activeScript, setActiveScript] = useState<ScriptMode>(() => {
    const saved = localStorage.getItem('bhasha_script');
    return (saved as ScriptMode) || LANGUAGES['santali'].defaultScript;
  });

  const [bridgeMode, setBridgeMode] = useState<BridgeMode>('mother-tongue');

  // 2. Navigation & Selection State
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(() => {
    const hasLaunched = localStorage.getItem('bhasha_has_launched');
    return hasLaunched ? 'classes' : 'welcome';
  });

  const [selectedClass, setSelectedClass] = useState<number>(1);
  const [selectedSubject, setSelectedSubject] = useState<'maths' | 'hindi' | 'evs' | 'english'>('maths');
  const [selectedChapter, setSelectedChapter] = useState<Chapter>(INITIAL_CURRICULUM[0]);

  // 3. User Progress & Rewards
  const [starsCount, setStarsCount] = useState<number>(() => {
    const saved = localStorage.getItem('bhasha_stars');
    return saved ? parseInt(saved, 10) : 3; // Seed with 3 stars to start with sticker unlocked
  });

  const [completedChapters, setCompletedChapters] = useState<string[]>(() => {
    const saved = localStorage.getItem('bhasha_completed');
    return saved ? JSON.parse(saved) : [];
  });

  const [unlockedStickerIds, setUnlockedStickerIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('bhasha_stickers');
    return saved ? JSON.parse(saved) : ['stk-chotu', 'stk-sal-tree'];
  });

  // 4. Accessibility & Audio Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [highContrast, setHighContrast] = useState<boolean>(false);

  // 5. Modals State
  const [isStickerBookOpen, setIsStickerBookOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatbotMode, setChatbotMode] = useState<'qa' | 'communicator'>('qa');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleOpenChatbot = (mode: 'qa' | 'communicator' = 'qa') => {
    sound.playPop();
    setChatbotMode(mode);
    setIsChatbotOpen(true);
  };

  // 6. Curriculum & Feedback State
  const [curriculum, setCurriculum] = useState<Chapter[]>(INITIAL_CURRICULUM);
  const [feedbackQueue, setFeedbackQueue] = useState<TranslationFeedback[]>([]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('bhasha_language', currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    localStorage.setItem('bhasha_script', activeScript);
  }, [activeScript]);

  useEffect(() => {
    localStorage.setItem('bhasha_stars', starsCount.toString());
  }, [starsCount]);

  useEffect(() => {
    localStorage.setItem('bhasha_completed', JSON.stringify(completedChapters));
  }, [completedChapters]);

  useEffect(() => {
    localStorage.setItem('bhasha_stickers', JSON.stringify(unlockedStickerIds));
  }, [unlockedStickerIds]);

  // Check sticker unlocks when stars increase
  useEffect(() => {
    const newlyUnlocked = checkStickerUnlocks(starsCount, unlockedStickerIds, STICKERS);
    if (newlyUnlocked.length > 0) {
      setUnlockedStickerIds((prev) => [...prev, ...newlyUnlocked]);
    }
  }, [starsCount]);

  // Language change handler
  const handleLanguageChange = (lang: LanguageId) => {
    setCurrentLanguage(lang);
    setActiveScript(LANGUAGES[lang].defaultScript);
  };

  // Welcome screen complete
  const handleSelectLanguageFromWelcome = (lang: LanguageId) => {
    handleLanguageChange(lang);
    localStorage.setItem('bhasha_has_launched', 'true');
    setCurrentScreen('classes');
  };

  // Star earnings
  const handleEarnStars = (stars: number) => {
    setStarsCount((prev) => prev + stars);
  };

  const isOnline = useNetworkStatus();

  // Continue Learning handler
  const handleContinueLearning = (last: LastAccessedChapter) => {
    const targetChapter =
      curriculum.find((c) => c.id === last.chapterId) ||
      curriculum.find((c) => c.classNumber === last.classNumber && c.subjectId === last.subjectId) ||
      curriculum[0];
    setSelectedClass(last.classNumber);
    setSelectedSubject(last.subjectId);
    setSelectedChapter(targetChapter);
    setCurrentScreen('lesson');
  };

  // Complete chapter
  const handleCompleteChapter = () => {
    sound.playCelebration();
    const { progress: updatedProgress } = markChapterComplete(selectedChapter.id, 3);
    setCompletedChapters(updatedProgress.completedChapters);
    setStarsCount(updatedProgress.starsCount);
    setCurrentScreen('games');
  };

  // Submit Feedback
  const handleSubmitFeedback = (fb: TranslationFeedback) => {
    setFeedbackQueue((prev) => [fb, ...prev]);
  };

  const handleResolveFeedback = (id: string) => {
    setFeedbackQueue((prev) => prev.filter((item) => item.id !== id));
  };

  // Teacher updates
  const handleUpdateChapterTranslation = (
    chapterId: string,
    lang: LanguageId,
    newStatus: ReviewStatus,
    newTitle: string,
    newNotes: string
  ) => {
    setCurriculum((prev) =>
      prev.map((ch) => {
        if (ch.id === chapterId) {
          return {
            ...ch,
            languages: {
              ...ch.languages,
              [lang]: {
                ...ch.languages[lang],
                title: newTitle || ch.languages[lang]?.title,
                reviewStatus: newStatus,
                reviewNotes: newNotes,
              },
            },
          };
        }
        return ch;
      })
    );
  };

  // Go Back Handler
  const handleGoBack = () => {
    if (currentScreen === 'teacher') {
      setCurrentScreen('classes');
    } else if (currentScreen === 'games') {
      setCurrentScreen('lesson');
    } else if (currentScreen === 'lesson') {
      setCurrentScreen('chapters');
    } else if (currentScreen === 'chapters') {
      setCurrentScreen('subjects');
    } else if (currentScreen === 'subjects') {
      setCurrentScreen('classes');
    } else if (currentScreen === 'classes') {
      setCurrentScreen('welcome');
    }
  };

  // Filtered chapters for current class and subject
  const activeChapters = curriculum.filter(
    (ch) => ch.classNumber === selectedClass && ch.subjectId === selectedSubject
  );

  return (
    <div className={`min-h-screen flex flex-col font-cartoon ${highContrast ? 'high-contrast' : ''}`}>
      {/* Multilingual Top Bar */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        activeScript={activeScript}
        onScriptChange={setActiveScript}
        bridgeMode={bridgeMode}
        onBridgeModeChange={setBridgeMode}
        starsCount={starsCount}
        onOpenStickerBook={() => setIsStickerBookOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const next = !soundEnabled;
          setSoundEnabled(next);
          sound.setSoundEnabled(next);
        }}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast(!highContrast)}
        onOpenTeacherPortal={() => setCurrentScreen('teacher')}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenChatbot={handleOpenChatbot}
        canGoBack={currentScreen !== 'welcome'}
        onGoBack={handleGoBack}
        currentScreenTitle={
          currentScreen === 'classes'
            ? 'Choose Class (1 to 5)'
            : currentScreen === 'subjects'
            ? `Class ${selectedClass} Subjects`
            : currentScreen === 'chapters'
            ? `Class ${selectedClass} Chapters`
            : currentScreen === 'lesson'
            ? selectedChapter.languages[currentLanguage]?.title || selectedChapter.originalTitleHindi
            : currentScreen === 'games'
            ? 'Learning Games'
            : currentScreen === 'teacher'
            ? 'Teacher & Linguistic Panel'
            : undefined
        }
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {currentScreen === 'welcome' && (
          <WelcomeScreen
            selectedLanguage={currentLanguage}
            onSelectLanguage={handleSelectLanguageFromWelcome}
          />
        )}

        {currentScreen === 'classes' && (
          <ClassSelector
            currentLanguage={currentLanguage}
            selectedClass={selectedClass}
            onSelectClass={(cls) => {
              setSelectedClass(cls);
              if (cls <= 2 && selectedSubject === 'evs') {
                setSelectedSubject('maths');
              }
              setCurrentScreen('subjects');
            }}
            onContinueLearning={handleContinueLearning}
          />
        )}

        {currentScreen === 'subjects' && (
          <SubjectSelector
            currentLanguage={currentLanguage}
            selectedClass={selectedClass}
            selectedSubject={selectedSubject}
            onSelectSubject={(sub) => {
              setSelectedSubject(sub);
              setCurrentScreen('chapters');
            }}
            onContinueLearning={handleContinueLearning}
          />
        )}

        {currentScreen === 'chapters' && (
          <ChapterMap
            chapters={activeChapters.length > 0 ? activeChapters : curriculum.filter((c) => c.classNumber === 1 && c.subjectId === 'maths')}
            currentLanguage={currentLanguage}
            activeScript={activeScript}
            completedChapters={completedChapters}
            selectedClass={selectedClass}
            selectedSubject={selectedSubject}
            onSelectChapter={(ch) => {
              setSelectedChapter(ch);
              setCurrentScreen('lesson');
            }}
          />
        )}

        {currentScreen === 'lesson' && (
          <LessonView
            chapter={selectedChapter}
            currentLanguage={currentLanguage}
            activeScript={activeScript}
            bridgeMode={bridgeMode}
            onOpenGames={() => setCurrentScreen('games')}
            onOpenChatbot={() => setIsChatbotOpen(true)}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onCompleteChapter={handleCompleteChapter}
          />
        )}

        {currentScreen === 'games' && (
          <GameHub
            gameData={getEffectiveGameData(selectedChapter, currentLanguage)}
            chapterTitle={selectedChapter.languages[currentLanguage]?.title || selectedChapter.originalTitleHindi}
            chapterId={selectedChapter.id}
            onBackToLesson={() => setCurrentScreen('lesson')}
            onEarnStars={handleEarnStars}
          />
        )}

        {currentScreen === 'teacher' && (
          <TeacherPortal
            chapters={curriculum}
            onUpdateChapterTranslation={handleUpdateChapterTranslation}
            feedbackQueue={feedbackQueue}
            onResolveFeedback={handleResolveFeedback}
            onClose={() => setCurrentScreen('classes')}
          />
        )}
      </main>

      {/* Persistent Bottom Bar with Mascot Quick Launcher & Offline Ready Badge */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-amber-100/90 backdrop-blur-md border-t-2 border-amber-300 py-1.5 px-4 shadow-sm flex items-center justify-between text-xs font-bold text-amber-900">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-600'
            }`}
          ></span>
          <span className="hidden sm:inline">
            {isOnline
              ? '🌿 Offline PWA Ready • 🌐 Online AI Active • Official JCERT Syllabus'
              : '⚡ Offline Mode • All JCERT Lessons, Games & Glossary Cached'}
          </span>
          <span className="sm:hidden">
            {isOnline ? '🌿 Online' : '⚡ Offline Ready'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-amber-800">
            Mother Tongue: <strong className="text-amber-950 uppercase">{currentLanguage}</strong>
          </span>

          <button
            onClick={() => handleOpenChatbot('qa')}
            className="px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold flex items-center gap-1 shadow-sm press-bounce cursor-pointer"
            aria-label="Open Chotu AI mascot"
          >
            <span>🦌</span>
            <span>Ask Chotu</span>
          </button>

          <button
            onClick={() => handleOpenChatbot('communicator')}
            className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold flex items-center gap-1 shadow-sm press-bounce border border-orange-600 cursor-pointer"
            aria-label="Open Live Santali Communicator"
          >
            <span>🗣️</span>
            <span>Live Santali</span>
          </button>
        </div>
      </footer>

      {/* Floating Modals */}
      <ChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        currentLanguage={currentLanguage}
        currentClass={selectedClass}
        currentSubject={selectedSubject}
        chapterTitle={selectedChapter.originalTitleHindi}
        chapterId={selectedChapter.id}
        initialMode={chatbotMode}
      />

      <StickerBookModal
        isOpen={isStickerBookOpen}
        onClose={() => setIsStickerBookOpen(false)}
        starsCount={starsCount}
        unlockedStickerIds={unlockedStickerIds}
        currentLanguage={currentLanguage}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        currentLanguage={currentLanguage}
        chapterId={selectedChapter.id}
        chapterTitle={selectedChapter.languages[currentLanguage]?.title || selectedChapter.originalTitleHindi}
        onSubmitFeedback={handleSubmitFeedback}
      />
    </div>
  );
}

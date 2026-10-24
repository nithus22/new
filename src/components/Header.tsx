import React from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Sun,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  BookOpen,
  ArrowLeft,
  GraduationCap,
} from 'lucide-react';
import { LanguageId, ScriptMode, BridgeMode } from '../types';
import { LANGUAGES, ACTIVE_LANGUAGES } from '../data/languages';
import { sound } from '../utils/audio';

interface HeaderProps {
  currentLanguage: LanguageId;
  onLanguageChange: (lang: LanguageId) => void;
  activeScript: ScriptMode;
  onScriptChange: (script: ScriptMode) => void;
  bridgeMode: BridgeMode;
  onBridgeModeChange: (mode: BridgeMode) => void;
  starsCount: number;
  onOpenStickerBook: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  onOpenTeacherPortal: () => void;
  onOpenReportModal: () => void;
  onOpenChatbot: (mode?: 'qa' | 'communicator') => void;
  canGoBack?: boolean;
  onGoBack?: () => void;
  currentScreenTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  activeScript,
  onScriptChange,
  bridgeMode,
  onBridgeModeChange,
  starsCount,
  onOpenStickerBook,
  soundEnabled,
  onToggleSound,
  highContrast,
  onToggleHighContrast,
  onOpenTeacherPortal,
  onOpenReportModal,
  onOpenChatbot,
  canGoBack,
  onGoBack,
  currentScreenTitle,
}) => {
  const langConfig = LANGUAGES[currentLanguage];

  return (
    <header className="sticky top-0 z-40 bg-amber-100/95 backdrop-blur-md border-b-4 border-amber-300 shadow-md px-3 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Back button or Logo */}
        <div className="flex items-center gap-2">
          {canGoBack && onGoBack ? (
            <button
              onClick={() => {
                sound.playPop();
                onGoBack();
              }}
              className="p-2 sm:px-3 sm:py-2 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold rounded-2xl flex items-center gap-1 shadow-sm press-bounce border-2 border-amber-600"
              aria-label="Go back to previous screen"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Back</span>
            </button>
          ) : null}

          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => {
              sound.playPop();
              if (onGoBack) onGoBack();
            }}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-0.5 shadow-md flex items-center justify-center text-xl animate-gentle-bounce border-2 border-amber-600">
              🦌
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-amber-950 tracking-tight leading-none flex items-center gap-1">
                Bhasha Setu
                <span className="text-xs bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  JCERT
                </span>
              </h1>
              <p className="text-xs text-amber-800 font-semibold truncate max-w-[150px] sm:max-w-none">
                {currentScreenTitle || 'झारखंड मातृभाषा शिक्षा (Classes 1-5)'}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Language & Script Selectors */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          {/* Language Switcher */}
          <div className="flex items-center bg-white/90 p-1 rounded-2xl border-2 border-amber-300 shadow-inner">
            {ACTIVE_LANGUAGES.map((lang) => {
              const isSelected = lang.id === currentLanguage;
              return (
                <button
                  key={lang.id}
                  onClick={() => {
                    sound.playPop();
                    onLanguageChange(lang.id);
                  }}
                  className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-sm scale-105'
                      : 'text-amber-900 hover:bg-amber-100'
                  }`}
                  aria-label={`Select language ${lang.name}`}
                >
                  <span>{lang.iconEmoji}</span>
                  <span className="font-bold">{lang.name}</span>
                  <span className="hidden md:inline opacity-80 text-[11px]">({lang.nativeName})</span>
                </button>
              );
            })}
          </div>

          {/* Script Mode Selector (if language has multiple scripts, e.g. Ho: Warang Chiti / Devanagari / Roman) */}
          {langConfig.scriptsAvailable.length > 1 && (
            <div className="hidden lg:flex items-center bg-white/80 p-0.5 rounded-xl border border-amber-300 text-xs">
              <span className="px-1.5 text-amber-800 font-semibold text-[11px]">Script:</span>
              {langConfig.scriptsAvailable.map((scr) => (
                <button
                  key={scr}
                  onClick={() => {
                    sound.playPop();
                    onScriptChange(scr);
                  }}
                  className={`px-2 py-0.5 rounded-lg font-bold capitalize text-xs ${
                    activeScript === scr
                      ? 'bg-amber-500 text-white'
                      : 'text-amber-900 hover:bg-amber-100'
                  }`}
                >
                  {scr === 'warangchiti'
                    ? 'Warang Chiti'
                    : scr === 'olchiki'
                    ? 'Ol Chiki'
                    : scr === 'devanagari'
                    ? 'Devanagari'
                    : scr}
                </button>
              ))}
            </div>
          )}

          {/* Bridge Language Toggle (Mother Tongue / Hindi / English) */}
          <div className="flex items-center bg-amber-200/80 p-0.5 rounded-xl border border-amber-400 text-xs">
            <button
              onClick={() => {
                sound.playPop();
                onBridgeModeChange(
                  bridgeMode === 'mother-tongue'
                    ? 'hindi'
                    : bridgeMode === 'hindi'
                    ? 'english'
                    : 'mother-tongue'
                );
              }}
              className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-white text-amber-900 font-bold flex items-center gap-1 shadow-xs"
              title="Toggle Bridge Language (Mother Tongue / Hindi / English)"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              <span className="text-[11px] uppercase tracking-wide">
                Bridge: <span className="text-emerald-700 font-extrabold">{bridgeMode}</span>
              </span>
            </button>
          </div>
        </div>

        {/* Right: Actions, Star Rewards & Accessibility */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Star Reward & Sticker Book button */}
          <button
            onClick={() => {
              sound.playCorrect();
              onOpenStickerBook();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 text-amber-950 font-black rounded-2xl border-2 border-yellow-500 shadow-sm press-bounce text-xs sm:text-sm"
            aria-label={`You have ${starsCount} stars. Open sticker collection.`}
          >
            <Sparkles className="w-4 h-4 text-amber-800 animate-spin" style={{ animationDuration: '6s' }} />
            <span>⭐ {starsCount}</span>
            <span className="hidden sm:inline text-xs font-bold text-amber-800">Stickers</span>
          </button>

          {/* Ask Chotu Mascot Bot Shortcut */}
          <button
            onClick={() => {
              sound.playPop();
              onOpenChatbot('qa');
            }}
            className="p-2 sm:px-2.5 sm:py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold flex items-center gap-1 shadow-sm press-bounce border-2 border-emerald-700 text-xs"
            aria-label="Ask Chotu AI Chatbot"
            title="Ask Chotu questions about lessons"
          >
            <span className="text-sm">🦌</span>
            <span className="hidden md:inline">Ask Chotu</span>
          </button>

          {/* Live Santali Communicator Shortcut */}
          <button
            onClick={() => {
              sound.playPop();
              onOpenChatbot('communicator');
            }}
            className="p-2 sm:px-2.5 sm:py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-bold flex items-center gap-1 shadow-sm press-bounce border-2 border-orange-700 text-xs"
            aria-label="Live Santali Communicator"
            title="Open Live Santali Communicator & Translation"
          >
            <span className="text-sm">🗣️</span>
            <span className="hidden lg:inline">Live Santali</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              sound.playPop();
              onToggleSound();
            }}
            className={`p-2 rounded-2xl border-2 press-bounce transition-colors ${
              soundEnabled
                ? 'bg-amber-200 text-amber-900 border-amber-400 hover:bg-amber-300'
                : 'bg-stone-200 text-stone-500 border-stone-300'
            }`}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* High Contrast Mode Toggle */}
          <button
            onClick={() => {
              sound.playPop();
              onToggleHighContrast();
            }}
            className={`p-2 rounded-2xl border-2 press-bounce transition-colors ${
              highContrast
                ? 'bg-stone-900 text-yellow-300 border-yellow-400'
                : 'bg-amber-200 text-amber-900 border-amber-400 hover:bg-amber-300'
            }`}
            aria-label={highContrast ? 'Disable high contrast' : 'Enable high contrast'}
            title="High Contrast Mode"
          >
            <Sun className="w-4 h-4" />
          </button>

          {/* Report wrong translation */}
          <button
            onClick={() => {
              sound.playPop();
              onOpenReportModal();
            }}
            className="p-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-2xl border border-orange-300 press-bounce"
            title="Report wrong translation to teacher review queue"
            aria-label="Report translation error"
          >
            <AlertCircle className="w-4 h-4" />
          </button>

          {/* Teacher Portal switch */}
          <button
            onClick={() => {
              sound.playPop();
              onOpenTeacherPortal();
            }}
            className="p-2 sm:px-2.5 sm:py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center gap-1 shadow-sm press-bounce border border-blue-800 text-xs"
            aria-label="Teacher and Admin Panel"
            title="Teacher Portal"
          >
            <GraduationCap className="w-4 h-4" />
            <span className="hidden xl:inline">Teacher</span>
          </button>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { Sparkles, Star, Lock, Award, Volume2 } from 'lucide-react';
import { STICKERS } from '../data/curriculum';
import { LanguageId } from '../types';
import { sound } from '../utils/audio';

interface StickerBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  starsCount: number;
  unlockedStickerIds: string[];
  currentLanguage: LanguageId;
}

export const StickerBookModal: React.FC<StickerBookModalProps> = ({
  isOpen,
  onClose,
  starsCount,
  unlockedStickerIds,
  currentLanguage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col border-4 border-amber-400 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 p-4 border-b-2 border-amber-500 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm border border-amber-300">
              📖
            </div>
            <div>
              <h3 className="text-lg font-black text-amber-950 flex items-center gap-1.5 leading-tight">
                <span>Tribal Sticker Book (ᱥᱴᱤᱠᱟᱨ ᱯᱚᱛᱚᱵ)</span>
              </h3>
              <p className="text-xs text-amber-900 font-bold">
                ⭐ {starsCount} Stars Earned • {unlockedStickerIds.length}/{STICKERS.length} Stickers Unlocked
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-amber-950 font-black text-sm flex items-center justify-center shadow-xs"
            aria-label="Close Sticker Book"
          >
            ✕
          </button>
        </div>

        {/* Sticker Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-amber-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {STICKERS.map((sticker) => {
              const isUnlocked = starsCount >= sticker.unlockedAtStars || unlockedStickerIds.includes(sticker.id);
              const nativeName = sticker.nativeNames[currentLanguage] || sticker.nativeNames['santali'];

              return (
                <div
                  key={sticker.id}
                  className={`rounded-3xl p-4 border-3 transition-all flex items-center gap-3.5 shadow-md ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-white via-amber-50 to-orange-50 border-amber-400 hover:scale-102'
                      : 'bg-stone-100 border-stone-300 opacity-65'
                  }`}
                >
                  <div className="relative">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-sm border-2 ${
                        isUnlocked
                          ? 'bg-amber-100 border-amber-400 animate-gentle-bounce'
                          : 'bg-stone-200 border-stone-300 filter grayscale'
                      }`}
                    >
                      {isUnlocked ? sticker.emoji : '🔒'}
                    </div>

                    {isUnlocked && (
                      <span className="absolute -top-1 -right-1 text-xs">✨</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-amber-950">
                        {isUnlocked ? sticker.name : 'Secret Sticker'}
                      </h4>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                        ⭐ {sticker.unlockedAtStars} Stars
                      </span>
                    </div>

                    {isUnlocked ? (
                      <>
                        <p className="text-xs font-extrabold text-emerald-800">
                          {nativeName}
                        </p>
                        <p className="text-[11px] text-slate-600 font-semibold leading-tight">
                          {sticker.description}
                        </p>
                      </>
                    ) : (
                      <p className="text-[11px] text-stone-500 font-bold">
                        Earn {Math.max(0, sticker.unlockedAtStars - starsCount)} more stars to unlock!
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-3 bg-amber-100 border-t border-amber-300 text-center text-xs font-bold text-amber-900">
          Complete chapter games and quizzes to unlock all cultural stickers!
        </div>
      </div>
    </div>
  );
};

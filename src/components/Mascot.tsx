import React, { useState } from 'react';
import { Volume2, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface MascotProps {
  speechText?: string;
  speechTransliteration?: string;
  nativeScriptClass?: string;
  audioSpeechText?: string;
  size?: 'sm' | 'md' | 'lg';
  showBubble?: boolean;
  onTap?: () => void;
}

export const Mascot: React.FC<MascotProps> = ({
  speechText = 'ᱡᱚᱦᱟᱨ! ᱤᱧ ᱪᱷᱳᱴᱩ ᱠᱟᱹᱱᱟᱹᱧ! (Hello! I am Chotu)',
  speechTransliteration,
  nativeScriptClass = 'font-cartoon',
  audioSpeechText = 'Johar! Ing Chhotu kanang. Delabon seched ma!',
  size = 'md',
  showBubble = true,
  onTap,
}) => {
  const [isWiggling, setIsWiggling] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleMascotTap = () => {
    sound.playPop();
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 900);
    if (onTap) onTap();
  };

  const speakAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playPop();
    setIsPlayingAudio(true);
    sound.speakText(audioSpeechText, {
      lang: 'hi-IN',
      rate: 0.85,
      pitch: 1.2,
      onEnd: () => setIsPlayingAudio(false),
    });
  };

  const sizeDims = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24 sm:w-28 sm:h-28',
    lg: 'w-36 h-36 sm:w-44 sm:h-44',
  }[size];

  return (
    <div className="relative inline-flex items-center gap-3 select-none">
      {/* Cartoon Speech Bubble */}
      {showBubble && speechText && (
        <div className="relative bg-white text-amber-950 px-4 py-2.5 rounded-3xl rounded-br-none border-3 border-amber-400 shadow-lg max-w-xs sm:max-w-md animate-fade-in">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={`text-sm sm:text-base font-black leading-snug ${nativeScriptClass}`}>
                {speechText}
              </p>
              {speechTransliteration && (
                <p className="text-xs text-amber-800 font-semibold mt-0.5">
                  {speechTransliteration}
                </p>
              )}
            </div>

            <button
              onClick={speakAudio}
              className={`p-1.5 rounded-full border border-amber-300 transition-colors shrink-0 ${
                isPlayingAudio ? 'bg-amber-400 text-white animate-pulse' : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
              }`}
              title="Hear Chotu speak"
              aria-label="Play audio narration"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Speech bubble arrow pointer */}
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r-3 border-b-3 border-amber-400 rotate-45 transform"></div>
        </div>
      )}

      {/* Mascot Graphic (Chotu the Forest Deer) */}
      <div
        onClick={handleMascotTap}
        className={`relative ${sizeDims} cursor-pointer transition-transform transform active:scale-90 ${
          isWiggling ? 'animate-wiggle' : 'animate-gentle-bounce'
        }`}
        title="Tap me to play!"
        role="button"
        aria-label="Chotu the deer mascot"
      >
        <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-md">
          {/* Antlers with playful curve */}
          <path
            d="M 60 52 Q 45 25 32 30 Q 42 38 52 46"
            stroke="#78350f"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 100 52 Q 115 25 128 30 Q 118 38 108 46"
            stroke="#78350f"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Ears */}
          <ellipse
            cx="48"
            cy="60"
            rx="12"
            ry="24"
            fill="#d97706"
            transform="rotate(-25 48 60)"
          />
          <ellipse
            cx="48"
            cy="60"
            rx="6"
            ry="16"
            fill="#ffedd5"
            transform="rotate(-25 48 60)"
          />
          <ellipse
            cx="112"
            cy="60"
            rx="12"
            ry="24"
            fill="#d97706"
            transform="rotate(25 112 60)"
          />
          <ellipse
            cx="112"
            cy="60"
            rx="6"
            ry="16"
            fill="#ffedd5"
            transform="rotate(25 112 60)"
          />

          {/* Body */}
          <ellipse cx="80" cy="125" rx="36" ry="28" fill="#d97706" />
          <ellipse cx="80" cy="126" rx="22" ry="18" fill="#ffedd5" />

          {/* Head */}
          <circle cx="80" cy="90" r="38" fill="#f59e0b" />
          <circle cx="80" cy="94" r="32" fill="#fed7aa" />

          {/* Cheerful Eyes */}
          <circle cx="67" cy="88" r="6" fill="#1c1917" />
          <circle cx="93" cy="88" r="6" fill="#1c1917" />
          {/* Eye shines */}
          <circle cx="65" cy="86" r="2.2" fill="#ffffff" />
          <circle cx="91" cy="86" r="2.2" fill="#ffffff" />

          {/* Rosy Cheeks */}
          <circle cx="56" cy="98" r="5" fill="#f87171" opacity="0.6" />
          <circle cx="104" cy="98" r="5" fill="#f87171" opacity="0.6" />

          {/* Snout & Heart-shaped Nose */}
          <ellipse cx="80" cy="103" rx="12" ry="8" fill="#ffffff" />
          <path d="M 77 99 Q 80 97 83 99 Q 80 104 77 99 Z" fill="#991b1b" />

          {/* Cheerful Smile */}
          <path
            d="M 74 107 Q 80 113 86 107"
            stroke="#991b1b"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Tribal Sohrai Art forehead motifs */}
          <circle cx="80" cy="68" r="3" fill="#15803d" />
          <circle cx="72" cy="68" r="2" fill="#ea580c" />
          <circle cx="88" cy="68" r="2" fill="#ea580c" />

          {/* Waving Hoof/Hand */}
          <ellipse
            cx="118"
            cy="115"
            rx="8"
            ry="12"
            fill="#d97706"
            transform="rotate(20 118 115)"
          />
        </svg>

        {/* Playful sparkle indicator */}
        <div className="absolute -top-1 -right-1 bg-yellow-400 text-amber-950 p-1 rounded-full shadow-xs border border-yellow-600">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

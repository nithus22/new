import React, { useState } from 'react';
import { Volume2, Play, Sparkles } from 'lucide-react';
import { LanguageId } from '../types';
import { LANGUAGES, ACTIVE_LANGUAGES } from '../data/languages';
import { Mascot } from './Mascot';
import { sound } from '../utils/audio';

interface WelcomeScreenProps {
  onSelectLanguage: (lang: LanguageId) => void;
  selectedLanguage: LanguageId;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectLanguage,
  selectedLanguage,
}) => {
  const [playingAudioLang, setPlayingAudioLang] = useState<LanguageId | null>(null);

  const playGreetingAudio = (e: React.MouseEvent, langId: LanguageId) => {
    e.stopPropagation();
    sound.playPop();
    setPlayingAudioLang(langId);
    const config = LANGUAGES[langId];

    sound.speakText(config.audioGreetingPhonetic, {
      lang: 'hi-IN',
      rate: 0.85,
      pitch: 1.15,
      onEnd: () => setPlayingAudioLang(null),
    });
  };

  const handleLanguagePick = (langId: LanguageId) => {
    sound.playCorrect();
    onSelectLanguage(langId);
  };

  return (
    <div className="min-h-[calc(100vh-68px)] flex flex-col justify-between py-6 px-4 max-w-5xl mx-auto">
      {/* Top Banner & Mascot Welcome */}
      <div className="text-center space-y-4">
        {/* Floating Clouds & Trees Background accents */}
        <div className="flex justify-center items-center gap-2">
          <span className="text-2xl animate-bounce">🌲</span>
          <span className="bg-amber-200 text-amber-900 text-xs sm:text-sm font-extrabold px-3 py-1 rounded-full border-2 border-amber-400 inline-flex items-center gap-1.5 shadow-sm">
            <span>🌾</span> Jharkhand Primary Education (JCERT Classes 1 to 5)
          </span>
          <span className="text-2xl animate-bounce" style={{ animationDelay: '0.3s' }}>🌲</span>
        </div>

        <div className="flex flex-col items-center justify-center my-2">
          <Mascot
            speechText="ᱡᱚᱦᱟᱨ! / 𑢹𑣉𑣀 𑣎𑣋𑣜 / जोहार! Welcome to Bhasha Setu!"
            speechTransliteration="ᱟᱢᱟᱜ ᱯᱟᱹᱨᱥᱤ ᱵᱟᱪᱷᱟᱣ ᱢᱮ! • अपनी मातृभाषा चुनो!"
            size="lg"
            audioSpeechText="Johar! Which is your language? Am chet bhasha te parha-am?"
          />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl sm:text-4xl font-black text-amber-950 tracking-tight">
            Which is your language?
          </h2>
          <p className="text-base sm:text-lg text-amber-800 font-bold">
            <span className="font-olchiki">ᱟᱢᱟᱜ ᱯᱟᱹᱨᱥᱤ ᱚᱠᱟ ᱠᱟᱱᱟ?</span> • <span className="font-warangchiti">𑢠𑣭𑣁𑣀 𑢡𑣂𑣌𑣂 𑢏𑣂𑣝𑣁?</span> • <span className="font-devanagari">आमाः पारसी ओकोया?</span>
          </p>
        </div>
      </div>

      {/* 3 Main Mother Tongue Choices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 my-6">
        {ACTIVE_LANGUAGES.map((lang) => {
          const isSelected = selectedLanguage === lang.id;
          const isAudioPlaying = playingAudioLang === lang.id;

          return (
            <div
              key={lang.id}
              className={`relative group rounded-3xl p-5 sm:p-6 transition-all duration-200 border-4 shadow-xl flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-500 bg-white ring-4 ring-amber-300 scale-102'
                  : 'border-amber-300 bg-white/90 hover:bg-white hover:border-amber-400 hover:shadow-2xl'
              }`}
              style={{
                background: `linear-gradient(to bottom, white, ${lang.bgColor})`,
              }}
            >
              {/* Top Accent Icon & Audio Button */}
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-md border-2 border-amber-300 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {lang.iconEmoji}
                </div>

                <button
                  type="button"
                  onClick={(e) => playGreetingAudio(e, lang.id)}
                  className={`p-2.5 rounded-2xl border-2 transition-all shadow-sm ${
                    isAudioPlaying
                      ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                      : 'bg-white hover:bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                  title={`Listen to greeting in ${lang.name}`}
                  aria-label={`Listen to ${lang.name} audio greeting`}
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {/* Language Name and Native Script */}
              <div className="my-4 space-y-1">
                <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-white/80 border border-amber-200 text-amber-800">
                  {lang.scriptName}
                </span>

                <h3
                  className={`text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 text-slate-900 ${lang.fontClass}`}
                >
                  {lang.nativeName}
                </h3>
                {lang.alternateNative && (
                  <p className="text-sm font-semibold text-slate-600">
                    {lang.alternateNative}
                  </p>
                )}

                <p className="text-lg font-black text-amber-950 mt-1">
                  {lang.name}
                </p>

                <p className="text-xs text-slate-600 font-medium">
                  {lang.description}
                </p>
              </div>

              {/* Greeting Sample */}
              <div className="bg-white/80 rounded-2xl p-2.5 border border-amber-200 mt-2 text-center">
                <p className={`text-sm font-bold text-amber-900 ${lang.fontClass}`}>
                  {lang.greetingText}
                </p>
                <p className="text-[11px] text-amber-700 font-semibold mt-0.5">
                  {lang.greetingTransliteration}
                </p>
              </div>

              {/* Action Big Button */}
              <div className="mt-4 pt-2 border-t border-amber-200">
                <button
                  type="button"
                  onClick={() => handleLanguagePick(lang.id)}
                  aria-label={`Choose ${lang.name}`}
                  className={`w-full py-2.5 px-4 rounded-2xl font-black text-center text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer press-bounce ${
                    isSelected
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-400 group-hover:bg-amber-500 text-amber-950'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Choose {lang.name}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Extensible Language Support Notice (Kurukh, Khortha, etc.) */}
      <div className="bg-amber-100/80 rounded-2xl p-4 border-2 border-dashed border-amber-300 text-center space-y-2">
        <p className="text-xs sm:text-sm font-bold text-amber-900 flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Extensible Mother-Tongue Data Engine (No code changes needed to add more tribal languages)</span>
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="bg-white px-2.5 py-1 rounded-xl font-bold text-slate-700 border border-amber-200">
            Kurukh (कुड़ुख़ / Tolong Siki) - Preview
          </span>
          <span className="bg-white px-2.5 py-1 rounded-xl font-bold text-slate-700 border border-amber-200">
            Khortha (खोरठा) - Preview
          </span>
          <span className="bg-white px-2.5 py-1 rounded-xl font-bold text-slate-700 border border-amber-200">
            Nagpuri (सादरी) - Planned
          </span>
        </div>
      </div>
    </div>
  );
};

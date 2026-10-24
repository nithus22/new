import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Sparkles,
  BookOpen,
  Award,
  Layers,
} from 'lucide-react';
import { Chapter, LanguageId, ScriptMode, BridgeMode } from '../types';
import { getChapterTextbookInfo } from '../utils/textbookData';
import { sound } from '../utils/audio';

interface AnimatedStorybookModalProps {
  chapter: Chapter;
  currentLanguage: LanguageId;
  activeScript: ScriptMode;
  bridgeMode: BridgeMode;
  onClose: () => void;
}

export const AnimatedStorybookModal: React.FC<AnimatedStorybookModalProps> = ({
  chapter,
  currentLanguage,
  activeScript,
  bridgeMode,
  onClose,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [interactiveState, setInteractiveState] = useState<number>(0);

  const textbook = getChapterTextbookInfo(chapter);
  const langData = chapter.languages[currentLanguage] || chapter.languages['santali'];

  // Topic classification for accurate animated scene
  const titleKey = (
    (chapter.originalTitleHindi || '') +
    ' ' +
    (chapter.originalTitleEnglish || '') +
    ' ' +
    chapter.subjectId
  ).toLowerCase();

  const isSwingsStory = titleKey.includes('झूला') || titleKey.includes('झूले') || titleKey.includes('swing');
  const isMangoBasket = titleKey.includes('आम') || titleKey.includes('टोकरी') || titleKey.includes('mango') || titleKey.includes('basket');
  const isArabCamel = titleKey.includes('ऊँट') || titleKey.includes('तुलना') || titleKey.includes('camel') || titleKey.includes('arab');
  const isCountingNumbers = titleKey.includes('संख्या') || titleKey.includes('गिनती') || titleKey.includes('जोड़') || titleKey.includes('घटाव') || titleKey.includes('number') || titleKey.includes('count') || chapter.subjectId === 'maths';
  const isSarhulFestival = titleKey.includes('सरहुल') || titleKey.includes('करम') || titleKey.includes('सोहराय') || titleKey.includes('पर्व') || titleKey.includes('त्योहार') || titleKey.includes('sarhul');
  const isBirsaMunda = titleKey.includes('बिरसा') || titleKey.includes('मुंडा') || titleKey.includes('hero') || titleKey.includes('freedom') || titleKey.includes('birsa');
  const isWaterRiver = titleKey.includes('जल') || titleKey.includes('पानी') || titleKey.includes('नदी') || titleKey.includes('water') || titleKey.includes('river');
  const isForestLeaves = titleKey.includes('पेड़') || titleKey.includes('पत्ता') || titleKey.includes('पत्ते') || titleKey.includes('जंगल') || titleKey.includes('forest') || titleKey.includes('leaf') || titleKey.includes('tree');

  // Stop speech when modal closes or page changes
  useEffect(() => {
    return () => {
      sound.stopSpeech();
    };
  }, [currentPage]);

  // Story pages generated from authentic textbook content
  const pages = [
    {
      title: 'Scene 1: Introduction to the Story',
      hindiSub: `अध्याय ${chapter.chapterNumber}: ${chapter.originalTitleHindi} (${chapter.bookName})`,
      nativeSub: langData.title,
      text:
        textbook.readingPassageHindi.split('\n\n')[0] ||
        `आज की कहानी: "${chapter.originalTitleHindi}"। आइए झारखंड की लोक-संस्कृति और पाठ्यपुस्तक के सुंदर प्रसंग को अपनी मातृभाषा में समझें।`,
      englishText:
        textbook.readingPassageEnglish?.split('\n\n')[0] ||
        `Story Scene 1: Welcome to "${chapter.originalTitleEnglish}" from official JCERT textbook ${chapter.bookName}.`,
    },
    {
      title: 'Scene 2: Core Tale & Activity',
      hindiSub: `${chapter.originalTitleHindi} — मुख्य प्रसंग`,
      nativeSub: `${langData.title} — ᱢᱩᱬᱩᱛ ᱠᱟᱛᱷᱟ`,
      text:
        textbook.readingPassageHindi.split('\n\n')[1] ||
        textbook.readingPassageHindi ||
        `इस पाठ में बच्चे खेल-खेल में नए विचार सीखते हैं और अपनी मातृभाषा में शब्दों के अर्थ समझते हैं।`,
      englishText:
        textbook.readingPassageEnglish?.split('\n\n')[1] ||
        textbook.readingPassageEnglish ||
        `The central theme of ${chapter.originalTitleEnglish} helps children connect textbook concepts with their native surroundings.`,
    },
    {
      title: 'Scene 3: Mother-Tongue Learning & Moral',
      hindiSub: `मातृभाषा सीखें (Learn in Mother Tongue)`,
      nativeSub: `ᱡᱚᱛᱚ ᱠᱷᱚᱱ ᱢᱟᱨᱟᱝ ᱥᱮᱪᱮᱫ (Key Learning)`,
      text: `इस पाठ के मुख्य शब्द: ${textbook.keyVocabulary.map((v) => `${v.word} (${currentLanguage === 'santali' ? v.santaliWord : currentLanguage === 'ho' ? v.hoWord : v.mundariWord})`).join(', ')}।`,
      englishText: `Key vocabulary learned: ${textbook.keyVocabulary.map((v) => `${v.meaningEnglish} = ${v.word}`).join(', ')}.`,
    },
  ];

  const activePage = pages[currentPage] || pages[0];

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      sound.stopSpeech();
      setIsPlayingAudio(false);
      return;
    }

    sound.playPop();
    setIsPlayingAudio(true);

    const speechText =
      bridgeMode === 'english'
        ? activePage.englishText
        : activePage.text;

    sound.speakText(speechText, {
      lang: bridgeMode === 'english' ? 'en-IN' : 'hi-IN',
      rate: 0.85,
      pitch: 1.1,
      onEnd: () => setIsPlayingAudio(false),
    });
  };

  const handleNextPage = () => {
    sound.playPop();
    sound.stopSpeech();
    setIsPlayingAudio(false);
    if (currentPage < pages.length - 1) {
      setCurrentPage((p) => p + 1);
    }
  };

  const handlePrevPage = () => {
    sound.playPop();
    sound.stopSpeech();
    setIsPlayingAudio(false);
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in overflow-y-auto">
      <div className="bg-amber-50 rounded-3xl max-w-2xl w-full border-4 border-amber-400 shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 p-4 border-b-2 border-amber-600 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-1 bg-white/20 rounded-xl">🎬</span>
            <div>
              <h3 className="text-base sm:text-lg font-black leading-tight flex items-center gap-2">
                <span>Animated Chapter Storybook</span>
                <span className="text-[10px] bg-emerald-700 text-white font-bold px-2 py-0.5 rounded-full uppercase">
                  Class {chapter.classNumber} • {chapter.subjectId}
                </span>
              </h3>
              <p className="text-xs text-amber-100 font-bold">
                {chapter.bookName} • {chapter.originalTitleHindi} ({chapter.originalTitleEnglish})
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playPop();
              sound.stopSpeech();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white text-white hover:text-amber-950 font-black flex items-center justify-center transition-colors"
            aria-label="Close Storybook"
          >
            ✕
          </button>
        </div>

        {/* Storybook Stage / Theater */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Animated Illustrated Screen */}
          <div className="relative aspect-video rounded-3xl overflow-hidden border-4 border-amber-300 shadow-inner flex flex-col justify-between p-4 select-none bg-gradient-to-b from-sky-300 via-amber-100 to-emerald-200">
            {/* Top Scene Badge */}
            <div className="flex items-center justify-between z-10">
              <span className="px-3 py-1 rounded-full bg-amber-950/80 text-amber-200 text-xs font-black shadow-sm">
                Page {currentPage + 1} of {pages.length}: {activePage.title}
              </span>
              <span className="text-xs bg-white/90 text-amber-950 font-black px-2.5 py-1 rounded-full border border-amber-300 shadow-xs">
                {chapter.coverEmoji || '📖'} {chapter.originalTitleEnglish}
              </span>
            </div>

            {/* Dynamic Stage Scenery Matching the Real Chapter Topic */}
            <div className="flex-1 flex items-center justify-center relative my-2">
              {/* 1. SWINGS SCENE (झूलों ही झूले) */}
              {isSwingsStory && (
                <div className="flex items-center justify-center gap-6">
                  <div
                    onClick={() => {
                      sound.playPop();
                      setInteractiveState((s) => s + 1);
                      sound.speakText('चल दिल्ली, ले चल कलकत्ता! Swing high!', { lang: 'hi-IN' });
                    }}
                    className="flex flex-col items-center cursor-pointer group"
                    title="Tap to swing higher!"
                  >
                    <div className="text-6xl animate-wiggle transform transition-transform group-hover:scale-125">
                      🧒
                    </div>
                    <div className="text-5xl -mt-3">🪢</div>
                    <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full mt-1">
                      Tap → Swing higher! 🌳
                    </span>
                  </div>
                  <div className="text-7xl animate-pulse">🌳</div>
                </div>
              )}

              {/* 2. MANGO BASKET SCENE (आम की टोकरी) */}
              {isMangoBasket && (
                <div className="flex items-center justify-around w-full px-6">
                  <div className="flex flex-col items-center">
                    <div className="text-6xl animate-bounce">👧</div>
                    <span className="text-xs font-black text-amber-950 bg-amber-200 px-2 rounded-full">
                      छह साल की छोकरी
                    </span>
                  </div>
                  <div
                    onClick={() => {
                      sound.playCorrect();
                      setInteractiveState((s) => s + 1);
                      sound.speakText('टोकरी में मीठे-मीठे आम हैं! Sweet mangoes!', { lang: 'hi-IN' });
                    }}
                    className="flex flex-col items-center cursor-pointer group"
                    title="Tap the mango basket!"
                  >
                    <div className="text-6xl group-hover:scale-125 transition-transform animate-gentle-bounce">
                      🧺
                    </div>
                    <div className="flex gap-1 text-2xl -mt-2">
                      <span>🥭</span>
                      <span>🥭</span>
                      <span>🥭</span>
                    </div>
                    <span className="text-[10px] font-black bg-amber-500 text-amber-950 px-2 py-0.5 rounded-full mt-1">
                      Tap → Pick a Mango!
                    </span>
                  </div>
                </div>
              )}

              {/* 3. ARAB & CAMEL SCENE (तुलना / आकृतियाँ और स्थान) */}
              {isArabCamel && !isSwingsStory && !isMangoBasket && (
                <div className="flex items-center justify-around w-full px-4">
                  <div
                    onClick={() => {
                      sound.playPop();
                      setInteractiveState((s) => s + 1);
                      sound.speakText('ऊँट ने कहा: क्या मैं अंदर आ जाऊँ? Bhitri!', { lang: 'hi-IN' });
                    }}
                    className="flex flex-col items-center cursor-pointer group"
                    title="Tap Camel!"
                  >
                    <div className="text-7xl animate-gentle-bounce group-hover:scale-110 transition-transform">
                      🐪
                    </div>
                    <span className="text-[10px] font-black bg-amber-600 text-white px-2 py-0.5 rounded-full mt-1">
                      Unt (ऊँट / ᱩᱸᱴ)
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-7xl">⛺</div>
                    <span className="text-[10px] font-black bg-amber-800 text-amber-100 px-2 py-0.5 rounded-full mt-1">
                      Tambu (तंबू) • Arab 👳
                    </span>
                  </div>
                </div>
              )}

              {/* 4. COUNTING & NUMBERS SCENE (गणित / संख्याएँ / 1 to 9) */}
              {isCountingNumbers && !isArabCamel && !isSwingsStory && !isMangoBasket && (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-3 text-4xl sm:text-5xl">
                    <span
                      onClick={() => {
                        sound.playPop();
                        sound.speakText('Mit! 1! One!', { lang: 'hi-IN' });
                      }}
                      className="cursor-pointer hover:scale-125 transition-transform"
                    >
                      🍎
                    </span>
                    <span
                      onClick={() => {
                        sound.playPop();
                        sound.speakText('Bar! 2! Two!', { lang: 'hi-IN' });
                      }}
                      className="cursor-pointer hover:scale-125 transition-transform"
                    >
                      🥭
                    </span>
                    <span
                      onClick={() => {
                        sound.playPop();
                        sound.speakText('Pe! 3! Three!', { lang: 'hi-IN' });
                      }}
                      className="cursor-pointer hover:scale-125 transition-transform"
                    >
                      🦜
                    </span>
                    <span
                      onClick={() => {
                        sound.playPop();
                        sound.speakText('Pon! 4! Four!', { lang: 'hi-IN' });
                      }}
                      className="cursor-pointer hover:scale-125 transition-transform"
                    >
                      🐶
                    </span>
                    <span
                      onClick={() => {
                        sound.playPop();
                        sound.speakText('More! 5! Five!', { lang: 'hi-IN' });
                      }}
                      className="cursor-pointer hover:scale-125 transition-transform"
                    >
                      🌺
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/90 px-3 py-1 rounded-xl text-xs font-black text-violet-900 border border-violet-200">
                    <span>Ol Chiki: ᱑ ᱒ ᱓ ᱔ ᱕</span>
                    <span>•</span>
                    <span>Devanagari: १ २ ३ ४ ५</span>
                  </div>
                </div>
              )}

              {/* 5. SARHUL FESTIVAL SCENE */}
              {isSarhulFestival && (
                <div className="flex items-center justify-around w-full">
                  <div className="flex flex-col items-center">
                    <div className="text-6xl animate-pulse">🌳</div>
                    <span className="text-[10px] font-black bg-emerald-700 text-white px-2 py-0.5 rounded-full mt-1">
                      Sal Tree (Sarjom) 🌸
                    </span>
                  </div>
                  <div
                    onClick={() => {
                      sound.playCorrect();
                      sound.speakText('सरहुल! मांदर की थाप पर पारंपरिक झूमर नृत्य!', { lang: 'hi-IN' });
                    }}
                    className="flex flex-col items-center cursor-pointer group"
                    title="Tap Mandar drum!"
                  >
                    <div className="text-6xl group-hover:scale-125 transition-transform animate-wiggle">
                      🥁
                    </div>
                    <span className="text-[10px] font-black bg-amber-500 text-amber-950 px-2 py-0.5 rounded-full mt-1">
                      Mandar Drum
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-6xl animate-bounce">💃</div>
                    <span className="text-[10px] font-black bg-purple-600 text-white px-2 py-0.5 rounded-full mt-1">
                      Jhumar Dance
                    </span>
                  </div>
                </div>
              )}

              {/* 6. BIRSA MUNDA SCENE */}
              {isBirsaMunda && (
                <div className="flex items-center justify-around w-full">
                  <div className="flex flex-col items-center">
                    <div className="text-6xl">🏔️</div>
                    <span className="text-[10px] font-black bg-amber-800 text-white px-2 py-0.5 rounded-full mt-1">
                      Ulihatu Hill 🚩
                    </span>
                  </div>
                  <div
                    onClick={() => {
                      sound.playCorrect();
                      sound.speakText('उलगुलान! अबुआ दिशुम, अबुआ राज! Dharti Aba Birsa Munda!', { lang: 'hi-IN' });
                    }}
                    className="flex flex-col items-center cursor-pointer group"
                    title="Tap Birsa's flute!"
                  >
                    <div className="text-6xl group-hover:scale-125 transition-transform animate-bounce">
                      🪈
                    </div>
                    <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full mt-1">
                      Birsa's Flute (धरती आबा)
                    </span>
                  </div>
                </div>
              )}

              {/* 7. WATER & RIVER SCENE */}
              {isWaterRiver && (
                <div className="flex items-center justify-around w-full">
                  <div className="flex flex-col items-center">
                    <div className="text-6xl animate-pulse">🌧️</div>
                    <span className="text-[10px] font-black bg-sky-600 text-white px-2 py-0.5 rounded-full mt-1">
                      Rain / ᱫᱟᱜ (Dak)
                    </span>
                  </div>
                  <div
                    onClick={() => {
                      sound.playPop();
                      sound.speakText('Nadi! The river flows with crystal fresh water!', { lang: 'hi-IN' });
                    }}
                    className="flex flex-col items-center cursor-pointer group"
                    title="Tap River!"
                  >
                    <div className="text-6xl group-hover:scale-110 transition-transform">
                      🌊
                    </div>
                    <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full mt-1">
                      River / ᱜᱟᱰᱟ (Gada) 🐟
                    </span>
                  </div>
                </div>
              )}

              {/* 8. FOREST & LEAVES SCENE */}
              {isForestLeaves && (
                <div className="flex items-center justify-around w-full">
                  <div className="flex flex-col items-center">
                    <div className="text-6xl animate-gentle-bounce">🌳</div>
                    <span className="text-[10px] font-black bg-emerald-700 text-white px-2 py-0.5 rounded-full mt-1">
                      Sal Tree (Sarjom)
                    </span>
                  </div>
                  <div
                    onClick={() => {
                      sound.playPop();
                      sound.speakText('Sakam! Different shaped leaves of Jharkhand forest!', { lang: 'hi-IN' });
                    }}
                    className="flex flex-col items-center cursor-pointer group"
                    title="Tap Leaves!"
                  >
                    <div className="text-6xl group-hover:scale-125 transition-transform animate-bounce">
                      🍃
                    </div>
                    <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full mt-1">
                      Leaf (ᱥᱟᱠᱟᱢ / Sakam)
                    </span>
                  </div>
                </div>
              )}

              {/* 9. DEFAULT TOPIC-ACCURATE STAGE FOR OTHER CHAPTERS */}
              {!isSwingsStory &&
                !isMangoBasket &&
                !isArabCamel &&
                !isCountingNumbers &&
                !isSarhulFestival &&
                !isBirsaMunda &&
                !isWaterRiver &&
                !isForestLeaves && (
                  <div className="flex items-center justify-center gap-6">
                    <div className="text-6xl sm:text-7xl animate-bounce">
                      {chapter.coverEmoji || '📖'}
                    </div>
                    <div className="text-5xl animate-gentle-bounce">
                      🦌
                    </div>
                  </div>
                )}
            </div>

            {/* Subtitles Bar (Native Script & Hindi Bridge) */}
            <div className="bg-amber-950/85 backdrop-blur-xs rounded-2xl p-2.5 text-center space-y-1 z-10 border border-amber-600/50">
              <p className="text-sm sm:text-base font-extrabold text-amber-200">
                {activePage.nativeSub}
              </p>
              <p className="text-xs font-semibold text-amber-100/90">
                {activePage.hindiSub}
              </p>
            </div>
          </div>

          {/* Story Narrative Card */}
          <div className="bg-white rounded-2xl p-4 border-2 border-amber-300 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                <span>Textbook Story Narration</span>
              </span>

              <button
                onClick={handleToggleAudio}
                className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center gap-1.5 shadow-sm press-bounce border border-amber-700"
              >
                {isPlayingAudio ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Read Aloud</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm sm:text-base font-bold text-amber-950 leading-relaxed whitespace-pre-wrap">
              {activePage.text}
            </p>

            {activePage.englishText && (
              <p className="text-xs text-slate-600 italic border-t border-amber-100 pt-1.5">
                🇬🇧 {activePage.englishText}
              </p>
            )}
          </div>

          {/* Key Vocabulary Pills for this Story */}
          {textbook.keyVocabulary && textbook.keyVocabulary.length > 0 && (
            <div className="p-3 bg-amber-100/80 rounded-2xl border border-amber-200 space-y-1.5">
              <span className="text-[11px] font-black text-amber-900 block">
                🌿 Story Mother-Tongue Vocabulary:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {textbook.keyVocabulary.slice(0, 5).map((v, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      sound.playPop();
                      sound.speakText(`${v.word}. In mother tongue: ${v.santaliWord}`, { lang: 'hi-IN' });
                    }}
                    className="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-200 text-amber-950 text-xs font-bold border border-amber-300 shadow-xs flex items-center gap-1"
                  >
                    <span>{v.word}</span>
                    <span className="text-amber-700 font-extrabold">
                      ({currentLanguage === 'santali' ? v.santaliWord : currentLanguage === 'ho' ? v.hoWord : v.mundariWord})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-amber-200">
            <button
              disabled={currentPage === 0}
              onClick={handlePrevPage}
              className={`px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 border transition-all ${
                currentPage === 0
                  ? 'opacity-40 cursor-not-allowed bg-stone-100 text-stone-400 border-stone-200'
                  : 'bg-amber-200 hover:bg-amber-300 text-amber-950 border-amber-400 press-bounce'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Page</span>
            </button>

            {/* Page Indicators */}
            <div className="flex gap-1.5">
              {pages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentPage === idx ? 'bg-amber-500 scale-125' : 'bg-amber-200 hover:bg-amber-300'
                  }`}
                  aria-label={`Go to page ${idx + 1}`}
                />
              ))}
            </div>

            <button
              disabled={currentPage === pages.length - 1}
              onClick={handleNextPage}
              className={`px-4 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 border transition-all ${
                currentPage === pages.length - 1
                  ? 'opacity-40 cursor-not-allowed bg-stone-100 text-stone-400 border-stone-200'
                  : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-700 shadow-md press-bounce'
              }`}
            >
              <span>Next Page</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Play, RotateCcw, Volume2, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface StoryAnimationProps {
  sceneType: 'inside_outside' | 'big_small' | 'top_bottom' | 'near_far' | 'rolling_sliding' | 'general';
  currentLanguage: string;
  nativeKeywords: Array<{
    native: string;
    transliteration: string;
    hindi: string;
    english: string;
  }>;
  chapterMeta?: {
    chapterNumber: number;
    classNumber: number;
    subjectId: string;
    bookName: string;
    originalTitleHindi?: string;
    originalTitleEnglish?: string;
    coverEmoji?: string;
  };
  chapterTitle?: string;
  conceptKey?: string;
  visualHint?: string;
}

// -----------------------------------------------------------------------
// General scene variant selector - strictly matches real chapter topics
// -----------------------------------------------------------------------
type GeneralVariant =
  | 'village'
  | 'sarhul'
  | 'forest'
  | 'river'
  | 'counting'
  | 'letters'
  | 'heroes'
  | 'school'
  | 'swings'
  | 'market'
  | 'water'
  | 'patterns_shapes'
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'clock_time'
  | 'measurement'
  | 'fractions'
  | 'plants'
  | 'pond'
  | 'english_safari'
  | 'mango_story';

function getGeneralSceneVariant(
  chapter?: {
    chapterNumber: number;
    classNumber: number;
    subjectId: string;
    bookName: string;
    originalTitleHindi?: string;
    originalTitleEnglish?: string;
  },
  conceptKey?: string
): GeneralVariant {
  if (!chapter) return 'village';
  const title = (
    (chapter.originalTitleHindi || '') +
    ' ' +
    (chapter.originalTitleEnglish || '') +
    ' ' +
    (conceptKey || '')
  ).toLowerCase();

  // 1. Swings / Play poem (झूलों ही झूले)
  if (title.includes('झूला') || title.includes('झूले') || title.includes('swing')) {
    return 'swings';
  }

  // 2. Folk story: Mango & Crow (आम की कहानी)
  if (title.includes('आम की कहानी') || title.includes('कौवा') || title.includes('crow')) {
    return 'mango_story';
  }

  // 3. Addition / जोड़ने का खेल (Class 1-5 Maths)
  if (
    title.includes('जोड़') ||
    title.includes('जमा') ||
    title.includes('add') ||
    title.includes('addition') ||
    title.includes('plus')
  ) {
    return 'addition';
  }

  // 4. Subtraction / घटाव (Class 1-5 Maths)
  if (
    title.includes('घटाव') ||
    title.includes('घटाना') ||
    title.includes('कम') ||
    title.includes('subtract') ||
    title.includes('minus')
  ) {
    return 'subtraction';
  }

  // 5. Multiplication & Equal Grouping / Division
  if (
    title.includes('गुणा') ||
    title.includes('भाग') ||
    title.includes('बँटवारा') ||
    title.includes('समूह') ||
    title.includes('multiply') ||
    title.includes('divide') ||
    title.includes('grouping')
  ) {
    return 'multiplication';
  }

  // 6. Time, Clock & Daily Routines (समय / दिनचर्या)
  if (
    title.includes('समय') ||
    title.includes('घड़ी') ||
    title.includes('दिनचर्या') ||
    title.includes('दिन') ||
    title.includes('रात') ||
    title.includes('time') ||
    title.includes('clock')
  ) {
    return 'clock_time';
  }

  // 7. Measurement, Footsteps & Distance (माप / नाप-तौल)
  if (
    title.includes('माप') ||
    title.includes('नाप') ||
    title.includes('दूरी') ||
    title.includes('लंबाई') ||
    title.includes('कदम') ||
    title.includes('तौल') ||
    title.includes('भार') ||
    title.includes('measure') ||
    title.includes('length') ||
    title.includes('weight')
  ) {
    return 'measurement';
  }

  // 8. Fractions & Parts (हिस्सा और भिन्न)
  if (
    title.includes('हिस्सा') ||
    title.includes('भिन्न') ||
    title.includes('आधा') ||
    title.includes('चौथाई') ||
    title.includes('fraction') ||
    title.includes('half')
  ) {
    return 'fractions';
  }

  // 9. Weekly Village Haat & Money (हाट बाज़ार / रुपये-पैसे)
  if (
    title.includes('हाट') ||
    title.includes('बाजार') ||
    title.includes('रुपये') ||
    title.includes('पैसे') ||
    title.includes('सिक्के') ||
    title.includes('टोकरी') ||
    title.includes('market') ||
    title.includes('money') ||
    title.includes('coin')
  ) {
    return 'market';
  }

  // 10. Plants & Trees / Parts of a Plant (पौधों की परी / पेड़-पौधे)
  if (
    title.includes('पौध') ||
    title.includes('जड़') ||
    title.includes('तना') ||
    title.includes('पत्ता') ||
    title.includes('पत्ते') ||
    title.includes('फूल') ||
    title.includes('plant') ||
    title.includes('leaf')
  ) {
    return 'plants';
  }

  // 11. Pond & Animals in Nature (पूनम का दिन / जल और जीव)
  if (
    title.includes('पूनम') ||
    title.includes('तालाब') ||
    title.includes('जीव') ||
    title.includes('जानवर') ||
    title.includes('पशु') ||
    title.includes('पक्षी') ||
    title.includes('pond') ||
    title.includes('creature')
  ) {
    return 'pond';
  }

  // 12. Water & Rain (पानी रे पानी / जल चक्र)
  if (
    title.includes('जल') ||
    title.includes('पानी') ||
    title.includes('नदी') ||
    title.includes('बारिश') ||
    title.includes('बरसात') ||
    title.includes('झरना') ||
    title.includes('बादल') ||
    title.includes('water') ||
    title.includes('river') ||
    title.includes('rain')
  ) {
    return 'water';
  }

  // 13. Shapes & Patterns (आकृतियाँ और पैटर्न)
  if (
    title.includes('आकृति') ||
    title.includes('आकृतियाँ') ||
    title.includes('पैटर्न') ||
    title.includes('shape') ||
    title.includes('pattern') ||
    title.includes('circle') ||
    title.includes('triangle')
  ) {
    return 'patterns_shapes';
  }

  // 14. Birsa Munda & Heroes (हमारे गौरव)
  if (
    title.includes('बिरसा') ||
    title.includes('मुंडा') ||
    title.includes('आजादी') ||
    title.includes('तिरंगा') ||
    title.includes('वीर') ||
    title.includes('hero') ||
    title.includes('birsa')
  ) {
    return 'heroes';
  }

  // 15. Sarhul & Cultural Festivals (त्योहार और पर्व)
  if (
    title.includes('सरहुल') ||
    title.includes('करम') ||
    title.includes('सोहराय') ||
    title.includes('पर्व') ||
    title.includes('त्योहार') ||
    title.includes('मेला') ||
    title.includes('झूमर') ||
    title.includes('sarhul') ||
    title.includes('festival') ||
    title.includes('dance')
  ) {
    return 'sarhul';
  }

  // 16. Numbers & Counting (1 to 9, 10 to 20, 100)
  if (
    title.includes('संख्या') ||
    title.includes('गिनती') ||
    title.includes('कितने') ||
    title.includes('गिनो') ||
    title.includes('number') ||
    title.includes('count')
  ) {
    return 'counting';
  }

  // 17. English Subject Routing
  if (chapter.subjectId === 'english') {
    if (title.includes('वर्ण') || title.includes('अक्षर') || title.includes('letter') || title.includes('alphabet')) {
      return 'letters';
    }
    return 'english_safari';
  }

  // 18. EVS Subject Routing
  if (chapter.subjectId === 'evs') {
    return 'pond';
  }

  // 19. Maths Subject Routing (default for unhandled maths is counting)
  if (chapter.subjectId === 'maths') {
    return 'counting';
  }

  // 20. School
  if (title.includes('स्कूल') || title.includes('दोस्त') || title.includes('school')) {
    return 'school';
  }

  return 'village';
}

// -----------------------------------------------------------------------
// VARIANT A – Jharkhand Village Morning
// -----------------------------------------------------------------------
const VillageScene: React.FC = () => {
  const [childDancing, setChildDancing] = useState(false);
  const [deerVisible, setDeerVisible] = useState(true);
  const [leavesVisible, setLeavesVisible] = useState(false);

  return (
    <div className="w-full flex flex-col items-center gap-3 relative">
      {/* Sky + Sun rising */}
      <div className="relative w-full h-16 bg-gradient-to-b from-orange-200 to-yellow-100 rounded-xl overflow-hidden flex items-center justify-center">
        <div
          className="text-4xl"
          style={{ animation: 'sunRise 3s ease-out forwards' }}
        >
          🌅
        </div>
        <span className="absolute left-4 text-xs font-black text-amber-800">Jharkhand Village Morning</span>
      </div>

      <div className="flex items-end justify-around w-full gap-2">
        {/* Children walking to school */}
        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => {
            sound.playPop();
            setChildDancing(true);
            sound.speakText('Johar! Namaskar! Good Morning!', { lang: 'hi-IN', pitch: 1.3 });
            setTimeout(() => setChildDancing(false), 1500);
          }}
          title="Tap to make child dance"
        >
          <div
            className={`text-5xl transition-all duration-300 ${childDancing ? 'scale-125' : 'animate-bounce'}`}
            style={{ animation: childDancing ? undefined : 'bounce 1s infinite' }}
          >
            🧒
          </div>
          <div className="text-3xl">🏫</div>
          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 rounded-full mt-1">
            {childDancing ? '🎉 Johar!' : 'Tap me!'}
          </span>
        </div>

        {/* Deer peeping */}
        <div className="flex flex-col items-center">
          <div
            className={`cursor-pointer text-5xl transition-all duration-700 ${deerVisible ? 'opacity-100 scale-100' : 'opacity-0 translate-x-20 scale-50'}`}
            style={{ animation: deerVisible ? 'gentleBounce 2s ease-in-out infinite' : undefined }}
            onClick={() => {
              sound.playPop();
              sound.speakText('The deer ran into the forest!', { lang: 'hi-IN' });
              setDeerVisible(false);
              setTimeout(() => setDeerVisible(true), 2500);
            }}
            title="Tap to scare deer"
          >
            🦌
          </div>
          <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 rounded-full mt-1">
            Tap → runs!
          </span>
        </div>

        {/* Tree with falling leaves */}
        <div className="flex flex-col items-center relative">
          <div
            className="text-5xl cursor-pointer"
            style={{ animation: 'gentleBounce 2.5s ease-in-out infinite', animationDelay: '0.5s' }}
            onClick={() => {
              sound.playPop();
              setLeavesVisible(true);
              setTimeout(() => setLeavesVisible(false), 2000);
            }}
            title="Tap for falling leaves"
          >
            🌳
          </div>
          {leavesVisible && (
            <div className="absolute top-0 flex gap-1 animate-bounce pointer-events-none">
              {['🍃', '🍃', '🍃'].map((l, i) => (
                <span
                  key={i}
                  className="text-xl"
                  style={{ animationDelay: `${i * 0.2}s`, animation: 'fall 1.5s ease-in forwards' }}
                >
                  {l}
                </span>
              ))}
            </div>
          )}
          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 rounded-full mt-1">
            Tap → leaves!
          </span>
        </div>
      </div>

      <style>{`
        @keyframes sunRise { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes gentleBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes fall { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(60px) rotate(180deg);opacity:0} }
      `}</style>
    </div>
  );
};

// -----------------------------------------------------------------------
// VARIANT B – Sarhul Spring Festival
// -----------------------------------------------------------------------
const SarhulScene: React.FC = () => {
  const [flowersCount, setFlowersCount] = useState(2);
  const [confetti, setConfetti] = useState(false);

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="flex items-end justify-around w-full gap-4">
        {/* Sal tree with blooming flowers */}
        <div className="flex flex-col items-center">
          <div className="relative flex flex-col items-center">
            <div
              className="text-5xl cursor-pointer"
              onClick={() => {
                sound.playCorrect();
                setFlowersCount(Math.min(flowersCount + 1, 7));
                sound.speakText('Sarhul! Sal flowers bloom in spring!', { lang: 'hi-IN' });
              }}
              title="Tap to bloom flowers"
            >
              🌳
            </div>
            <div className="flex gap-1 mt-1 flex-wrap justify-center max-w-[80px]">
              {Array.from({ length: flowersCount }).map((_, i) => (
                <span
                  key={i}
                  className="text-lg"
                  style={{
                    animation: 'pulse 1.5s ease-in-out infinite',
                    animationDelay: `${i * 0.3}s`,
                  }}
                >
                  🌸
                </span>
              ))}
            </div>
          </div>
          <span className="text-[10px] font-black text-pink-800 bg-pink-100 px-2 rounded-full mt-1">
            Tap → bloom! ({flowersCount}/7)
          </span>
        </div>

        {/* Tribal dancer */}
        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => {
            sound.playCorrect();
            setConfetti(true);
            sound.speakText('Sarhul festival! Johar! Dance and celebrate!', { lang: 'hi-IN' });
            setTimeout(() => setConfetti(false), 2000);
          }}
          title="Tap for confetti"
        >
          <div
            className="text-6xl"
            style={{ animation: 'spin 2s linear infinite' }}
          >
            💃
          </div>
          {confetti && (
            <div className="flex gap-1 text-2xl animate-bounce pointer-events-none">
              🎉🎊✨🌸
            </div>
          )}
          <span className="text-[10px] font-black text-purple-800 bg-purple-100 px-2 rounded-full mt-1">
            Tap → confetti!
          </span>
        </div>

        {/* Mandar drum */}
        <div className="flex flex-col items-center">
          <div
            className="text-5xl cursor-pointer"
            style={{ animation: 'drumBounce 0.5s ease-in-out infinite' }}
            onClick={() => {
              sound.playPop();
              sound.speakText('Mandar! The tribal drum of Jharkhand beats for Sarhul!', { lang: 'hi-IN' });
            }}
            title="Tap the drum"
          >
            🥁
          </div>
          <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 rounded-full mt-1">
            Mandar Drum
          </span>
        </div>
      </div>

      <div className="text-xs font-black text-pink-900 bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
        🌸 Sarhul Spring Festival — Sal Flowers Bloom 🌸
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes drumBounce { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.85)} }
      `}</style>
    </div>
  );
};

// -----------------------------------------------------------------------
// VARIANT C – Forest Animals
// -----------------------------------------------------------------------
const ForestScene: React.FC = () => {
  const animals = [
    { emoji: '🐯', name: 'Bagh / Tiger', sound: 'Bagh! Tiger of Jharkhand forest!' },
    { emoji: '🐘', name: 'Hati / Elephant', sound: 'Hati! Elephant is marang, big!' },
    { emoji: '🦚', name: 'Mor / Peacock', sound: 'Mor! Peacock dances in the rain!' },
    { emoji: '🦌', name: 'Harin / Deer', sound: 'Harin! Deer runs fast in the sal forest!' },
    { emoji: '🐍', name: 'Sap / Snake', sound: 'Sap! Snake moves silently on the ground!' },
    { emoji: '🦋', name: 'Titli / Butterfly', sound: 'Titli! Butterfly flies among flowers!' },
  ];
  const [jumping, setJumping] = useState<number | null>(null);

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="text-xs font-black text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
        🌳 Jharkhand Forest Animals — Tap to Meet Them! 🌳
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 w-full">
        {animals.map((animal, i) => (
          <div
            key={i}
            className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${jumping === i ? 'scale-125' : 'hover:scale-110'}`}
            style={{ animation: `gentleBounce2 ${2 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.25}s` }}
            onClick={() => {
              sound.playPop();
              setJumping(i);
              sound.speakText(animal.sound, { lang: 'hi-IN', pitch: 1.2 });
              setTimeout(() => setJumping(null), 500);
            }}
            title={`Tap to meet the ${animal.name}`}
          >
            <span className="text-4xl">{animal.emoji}</span>
            <span className="text-[9px] font-black text-emerald-900 bg-emerald-100 px-1.5 py-0.5 rounded-full text-center leading-tight mt-1">
              {animal.name}
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes gentleBounce2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
      `}</style>
    </div>
  );
};

// -----------------------------------------------------------------------
// VARIANT D – River and Mountain
// -----------------------------------------------------------------------
const RiverScene: React.FC = () => {
  const [mountainGlow, setMountainGlow] = useState(false);
  const [riverRipple, setRiverRipple] = useState(false);

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Sky with flying birds */}
      <div className="relative h-12 bg-gradient-to-b from-sky-300 to-sky-100 rounded-xl overflow-hidden flex items-center">
        {['🦅', '🦜', '🦢'].map((bird, i) => (
          <span
            key={i}
            className="absolute text-2xl"
            style={{
              animation: 'flyAcross 6s linear infinite',
              animationDelay: `${i * 2}s`,
              top: `${10 + i * 8}px`,
            }}
          >
            {bird}
          </span>
        ))}
      </div>

      {/* Mountains */}
      <div
        className={`flex justify-center gap-3 cursor-pointer transition-all duration-500 ${mountainGlow ? 'brightness-150' : ''}`}
        onClick={() => {
          sound.playCorrect();
          setMountainGlow(true);
          sound.speakText('The mountains of Jharkhand glow amber at sunset! Pahar!', { lang: 'hi-IN' });
          setTimeout(() => setMountainGlow(false), 2000);
        }}
        title="Tap to make mountains glow"
      >
        <span className={`text-5xl transition-all duration-500 ${mountainGlow ? 'text-amber-400' : ''}`} style={{ animation: 'gentleBounce2 3s ease-in-out infinite' }}>🏔️</span>
        <span className={`text-4xl transition-all duration-500 ${mountainGlow ? 'text-amber-300' : ''}`} style={{ animation: 'gentleBounce2 3.5s ease-in-out infinite', animationDelay: '0.5s' }}>⛰️</span>
        <span className={`text-5xl transition-all duration-500 ${mountainGlow ? 'text-amber-400' : ''}`} style={{ animation: 'gentleBounce2 2.8s ease-in-out infinite', animationDelay: '1s' }}>🏔️</span>
      </div>

      {/* River with fish */}
      <div
        className={`relative w-full rounded-xl bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 p-3 flex items-center justify-around cursor-pointer transition-all duration-300 ${riverRipple ? 'scale-105' : ''}`}
        onClick={() => {
          sound.playPop();
          setRiverRipple(true);
          sound.speakText('Nadi! The river flows through Jharkhand! Ripple ripple!', { lang: 'hi-IN' });
          setTimeout(() => setRiverRipple(false), 800);
        }}
        title="Tap river for ripple"
        style={{ animation: 'waveBg 3s ease-in-out infinite' }}
      >
        <span className="text-3xl" style={{ animation: 'swimFish 4s linear infinite' }}>🐟</span>
        <span className="text-2xl font-black text-white drop-shadow">🌊 Nadi (River)</span>
        <span className="text-3xl" style={{ animation: 'swimFish 5s linear infinite reverse', animationDelay: '2s' }}>🐡</span>
      </div>

      <div className="text-[10px] font-black text-sky-900 bg-sky-50 px-3 py-1 rounded-full border border-sky-200 text-center">
        Tap mountains 🏔️ to glow • Tap river 🌊 to ripple
      </div>

      <style>{`
        @keyframes flyAcross { from{transform:translateX(-60px)} to{transform:translateX(calc(100vw + 60px))} }
        @keyframes waveBg { 0%,100%{background-position:0%} 50%{background-position:100%} }
        @keyframes swimFish { 0%,100%{transform:translateX(0)} 50%{transform:translateX(10px)} }
        @keyframes gentleBounce2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
      `}</style>
    </div>
  );
};

// -----------------------------------------------------------------------
// VARIANT E – Counting with Fruits and Flowers
// -----------------------------------------------------------------------
const CountingScene: React.FC = () => {
  const items = ['🌺', '🍎', '🌾', '🌰', '🍯'];
  const numbersOlChiki = ['᱑', '᱒', '᱓', '᱔', '᱕'];
  const numbersDevanagari = ['१', '२', '३', '४', '५'];
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const countWords = [
    'Mit — ᱑ — One!',
    'Bar — ᱒ — Two!',
    'Pon — ᱓ — Three!',
    'Pon-mit — ᱔ — Four!',
    'Mol — ᱕ — Five!',
  ];

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="text-xs font-black text-violet-900 bg-violet-50 px-3 py-1 rounded-full border border-violet-200">
        ✨ Count with Jharkhand Fruits! Tap to hear numbers ✨
      </div>
      <div className="flex justify-around w-full gap-2">
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${activeIdx === i ? 'scale-130' : 'hover:scale-110'}`}
            style={{ animation: `countBounce ${1.5 + i * 0.2}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}
            onClick={() => {
              sound.playCorrect();
              setActiveIdx(i);
              sound.speakText(countWords[i], { lang: 'hi-IN', pitch: 1.3 });
              setTimeout(() => setActiveIdx(null), 1000);
            }}
          >
            {/* Number labels */}
            <div className="flex gap-1 items-center">
              <span className="text-sm font-black text-violet-700">{numbersOlChiki[i]}</span>
              <span className="text-sm font-black text-amber-700">{numbersDevanagari[i]}</span>
            </div>
            <span className="text-4xl">{item}</span>
            <span className="text-xs font-black text-slate-600">{i + 1}</span>
          </div>
        ))}
      </div>
      <div className="text-[10px] font-bold text-violet-700 text-center">
        Ol Chiki numbers: ᱑ ᱒ ᱓ ᱔ ᱕ • Devanagari: १ २ ३ ४ ५
      </div>
      <style>{`
        @keyframes countBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      `}</style>
    </div>
  );
};

// -----------------------------------------------------------------------
// VARIANT F – Alphabet and Letters
// -----------------------------------------------------------------------
const LettersScene: React.FC = () => {
  const letterSets = {
    santali: ['ᱚ', 'ᱟ', 'ᱤ', 'ᱩ', 'ᱮ', 'ᱳ'],
    ho: ['𑢹', '𑢺', '𑢻', '𑢼'],
    hindi: ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ'],
    english: ['A', 'E', 'I', 'O', 'U'],
    mundari: ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ'],
  };
  const soundMap: Record<string, string> = {
    ᱚ: 'O as in Open', ᱟ: 'Ah', ᱤ: 'Ee', ᱩ: 'Oo', ᱮ: 'Eh', ᱳ: 'Oh',
    '𑢹': 'A in Ho script', '𑢺': 'Aa in Ho script', '𑢻': 'I in Ho script', '𑢼': 'E in Ho script',
    अ: 'Uh — A', आ: 'Aaa', इ: 'Ih', ई: 'Eeh', उ: 'Uh', ऊ: 'Ooh',
    A: 'A for Apple', E: 'E for Elephant', I: 'I for India', O: 'O for Orange', U: 'U for Umbrella',
  };
  const [glowing, setGlowing] = useState<number | null>(null);

  // Pick letter set — cycle through by rendering all sets interleaved
  const allLetters = ['ᱚ', 'अ', 'A', 'ᱟ', 'आ', 'E'].slice(0, 6);

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="text-xs font-black text-indigo-900 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
        🔤 Letters of Jharkhand — Tap to Hear! ✏️
      </div>

      {/* Dancing pencil */}
      <div className="text-4xl" style={{ animation: 'pencilDance 1s ease-in-out infinite' }}>✏️</div>

      <div className="flex justify-around w-full gap-2 flex-wrap">
        {allLetters.map((letter, i) => (
          <div
            key={i}
            className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${glowing === i ? 'scale-130' : 'hover:scale-110'}`}
            style={{
              animation: `letterFloat ${2 + i * 0.4}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
            onClick={() => {
              sound.playPop();
              setGlowing(i);
              sound.speakText(soundMap[letter] || letter, { lang: 'hi-IN', pitch: 1.2 });
              setTimeout(() => setGlowing(null), 800);
            }}
            title={`Tap to hear "${letter}"`}
          >
            <span
              className={`text-4xl sm:text-5xl font-black transition-all duration-300 ${
                glowing === i
                  ? 'text-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]'
                  : 'text-indigo-800'
              }`}
            >
              {letter}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes letterFloat { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-10px) rotate(3deg)} }
        @keyframes pencilDance { 0%,100%{transform:rotate(-10deg)} 50%{transform:rotate(10deg)} }
      `}</style>
    </div>
  );
};

// -----------------------------------------------------------------------
// VARIANT G – Birsa Munda and Tribal Heroes
// -----------------------------------------------------------------------
const HeroesScene: React.FC = () => {
  const [flagWaving, setFlagWaving] = useState(false);
  const [starsVisible, setStarsVisible] = useState(3);
  const [typingDone, setTypingDone] = useState(false);

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* Starry sky */}
      <div className="relative w-full h-12 bg-gradient-to-b from-indigo-900 to-purple-800 rounded-xl overflow-hidden flex items-center justify-center gap-2">
        {Array.from({ length: starsVisible }).map((_, i) => (
          <span
            key={i}
            className="text-xl"
            style={{ animation: 'starTwinkle 1.5s ease-in-out infinite', animationDelay: `${i * 0.4}s` }}
          >
            ⭐
          </span>
        ))}
        <button
          className="absolute right-2 text-[9px] text-white bg-purple-900/60 px-1.5 py-0.5 rounded"
          onClick={() => {
            sound.playCorrect();
            setStarsVisible((v) => Math.min(v + 2, 9));
          }}
        >
          + Stars
        </button>
      </div>

      <div className="flex items-end justify-around w-full gap-3">
        {/* Hill with flag */}
        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => {
            sound.playPop();
            setFlagWaving(true);
            sound.speakText('Ulgulan! Revolt! Birsa Munda fought for tribal rights!', { lang: 'hi-IN' });
            setTimeout(() => setFlagWaving(false), 2000);
          }}
          title="Tap the flag"
        >
          <div className={`text-2xl transition-all duration-200 ${flagWaving ? 'animate-wiggle' : ''}`}>🚩</div>
          <div className="text-5xl">🏔️</div>
          <span className="text-[10px] font-black text-red-800 bg-red-100 px-2 rounded-full mt-1">
            {flagWaving ? '⚡ Ulgulan!' : 'Tap → flag waves!'}
          </span>
        </div>

        {/* Flute */}
        <div className="flex flex-col items-center">
          <div
            className="text-5xl cursor-pointer"
            style={{ animation: 'gentleBounce2 2s ease-in-out infinite' }}
            onClick={() => {
              sound.playPop();
              sound.speakText('Birsa Munda played the flute and inspired the tribal people of Jharkhand!', { lang: 'hi-IN' });
            }}
            title="Tap the flute"
          >
            🪈
          </div>
          <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 rounded-full mt-1">
            Birsa's Flute
          </span>
        </div>

        {/* Text tribute */}
        <div className="flex flex-col items-center text-center">
          <div
            className="text-xs font-black text-amber-900 bg-amber-50 border border-amber-300 px-2 py-1 rounded-xl cursor-pointer"
            style={{ animation: 'typeIn 3s steps(20) forwards' }}
            onClick={() => {
              sound.speakText('Dharti Aaba Birsa Munda! Father of the land!', { lang: 'hi-IN' });
              setTypingDone(true);
            }}
          >
            धरती आबा<br />बिरसा मुंडा
          </div>
          <span className="text-[9px] font-bold text-slate-500 mt-1">Tap to hear</span>
        </div>
      </div>

      <style>{`
        @keyframes starTwinkle { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
        @keyframes typeIn { from{clip-path:inset(0 100% 0 0)} to{clip-path:inset(0 0% 0 0)} }
        @keyframes gentleBounce2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
      `}</style>
    </div>
  );
};

// -----------------------------------------------------------------------
// VARIANT H – School Life in Jharkhand
// -----------------------------------------------------------------------
const SchoolScene: React.FC = () => {
  const [teacherGreeting, setTeacherGreeting] = useState(false);
  const [butterflyOut, setButterflyOut] = useState(false);
  const [clockTick, setClockTick] = useState(0);

  // Clock ticking effect
  React.useEffect(() => {
    const interval = setInterval(() => setClockTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const clockEmoji = clockTick % 2 === 0 ? '🕐' : '🕑';

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="flex items-end justify-around w-full gap-3">
        {/* Teacher at blackboard */}
        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => {
            sound.playCorrect();
            setTeacherGreeting(true);
            sound.speakText('Good Morning! Johar! Welcome to class!', { lang: 'hi-IN', pitch: 1.2 });
            setTimeout(() => setTeacherGreeting(false), 2000);
          }}
          title="Tap the teacher"
        >
          <div className={`text-5xl transition-all duration-300 ${teacherGreeting ? 'scale-125' : ''}`}
            style={{ animation: 'teacherBob 2s ease-in-out infinite' }}>
            👩‍🏫
          </div>
          <div className="flex gap-1 text-2xl">📋🖊️</div>
          <span className="text-[10px] font-black text-blue-800 bg-blue-100 px-2 rounded-full mt-1">
            {teacherGreeting ? '🎉 Johar!' : 'Tap Teacher!'}
          </span>
        </div>

        {/* Children with books */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-1">
            {['🧒', '👦'].map((child, i) => (
              <span
                key={i}
                className="text-4xl"
                style={{ animation: 'childSit 3s ease-in-out infinite', animationDelay: `${i * 0.5}s` }}
              >
                {child}
              </span>
            ))}
          </div>
          {/* Book */}
          <div
            className="text-4xl cursor-pointer transition-all duration-300 relative"
            onClick={() => {
              sound.playPop();
              setButterflyOut(true);
              sound.speakText('A butterfly flew out of the book! Books open new worlds!', { lang: 'hi-IN' });
              setTimeout(() => setButterflyOut(false), 2500);
            }}
            title="Tap the book"
          >
            📚
            {butterflyOut && (
              <span
                className="absolute -top-8 left-4 text-3xl pointer-events-none"
                style={{ animation: 'butterflyFly 2.5s ease-out forwards' }}
              >
                🦋
              </span>
            )}
          </div>
          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 rounded-full">
            Tap book → 🦋!
          </span>
        </div>

        {/* Apple + Clock */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-4xl" style={{ animation: 'gentleBounce2 2.5s ease-in-out infinite' }}>🍎</div>
          <div className="text-4xl" style={{ animation: clockTick % 2 === 0 ? undefined : 'tickTock 0.1s ease-in-out' }}>
            {clockEmoji}
          </div>
          <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 rounded-full">
            School time!
          </span>
        </div>
      </div>

      <style>{`
        @keyframes teacherBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes childSit { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-3deg)} 75%{transform:rotate(3deg)} }
        @keyframes butterflyFly { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(40px,-60px) scale(1.5);opacity:0} }
        @keyframes gentleBounce2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes tickTock { 0%{transform:rotate(-5deg)} 100%{transform:rotate(5deg)} }
      `}</style>
    </div>
  );
};

// -----------------------------------------------------------------------
// VARIANT I – Swings Everywhere (झूलों ही झूले)
// -----------------------------------------------------------------------
const SwingsScene: React.FC = () => {
  const [swingHeight, setSwingHeight] = useState<'low' | 'med' | 'high'>('med');
  const [leavesFalling, setLeavesFalling] = useState(false);

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="text-xs font-black text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
        🌳 झूलों ही झूले (Swings Everywhere) — Tap Swing to Go Higher! ⛅
      </div>

      <div className="flex items-center justify-around w-full gap-4">
        {/* Tree & Swing */}
        <div
          className="flex flex-col items-center cursor-pointer group"
          onClick={() => {
            sound.playPop();
            setSwingHeight((h) => (h === 'low' ? 'med' : h === 'med' ? 'high' : 'low'));
            setLeavesFalling(true);
            sound.speakText('अम्मा आज लगा दे झूला! चल दिल्ली, ले चल कलकत्ता!', { lang: 'hi-IN' });
            setTimeout(() => setLeavesFalling(false), 2000);
          }}
          title="Tap swing to push higher"
        >
          <div className="text-7xl">🌳</div>
          <div
            className={`transition-all duration-500 transform ${
              swingHeight === 'high' ? '-translate-y-8 scale-125' : swingHeight === 'med' ? '-translate-y-3 scale-110' : 'translate-y-0'
            }`}
          >
            <div className="text-5xl animate-wiggle">🧒</div>
            <div className="text-3xl -mt-2">🪢</div>
          </div>
          <span className="text-[10px] font-black text-emerald-950 bg-emerald-200 px-2 py-0.5 rounded-full mt-2">
            Swing: {swingHeight.toUpperCase()} (Tap to Push!)
          </span>
        </div>

        {/* Falling Leaves & Clouds */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-4xl animate-float-slow">☁️</div>
          <div className="flex gap-2">
            <span className="text-3xl animate-bounce">🍃</span>
            <span className="text-2xl animate-gentle-bounce">🍂</span>
            <span className="text-3xl animate-bounce" style={{ animationDelay: '0.4s' }}>🍃</span>
          </div>
          <span className="text-[10px] font-bold text-slate-600 bg-white/80 px-2 py-0.5 rounded-full">
            झूल रहा है पत्ता-पत्ता
          </span>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------
// VARIANT J – Weekly Haat & Mango Basket (आम की टोकरी)
// -----------------------------------------------------------------------
const MarketScene: React.FC = () => {
  const [mangoCount, setMangoCount] = useState(6);
  const [coinsCount, setCoinsCount] = useState(3);

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="text-xs font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
        🥭 आम की टोकरी (Basket of Mangoes) • झारखंड का साप्ताहिक हाट 🧺
      </div>

      <div className="flex items-center justify-around w-full gap-4">
        {/* Girl carrying basket */}
        <div className="flex flex-col items-center">
          <div className="text-6xl animate-bounce">👧</div>
          <span className="text-[10px] font-black text-amber-950 bg-amber-200 px-2 rounded-full mt-1">
            छह साल की छोकरी
          </span>
        </div>

        {/* Mango basket */}
        <div
          className="flex flex-col items-center cursor-pointer group"
          onClick={() => {
            sound.playCorrect();
            setMangoCount((c) => (c > 1 ? c - 1 : 6));
            sound.speakText('टोकरी में आम हैं! ᱩᱞ (Ul)! Sweet mango!', { lang: 'hi-IN' });
          }}
          title="Tap basket to taste mango"
        >
          <div className="text-6xl group-hover:scale-120 transition-transform">🧺</div>
          <div className="flex gap-1 text-2xl -mt-2">
            {Array.from({ length: mangoCount }).slice(0, 5).map((_, i) => (
              <span key={i} className="animate-pulse">🥭</span>
            ))}
          </div>
          <span className="text-[10px] font-black text-amber-950 bg-amber-300 px-2.5 py-0.5 rounded-full mt-1">
            {mangoCount} Mangoes (ᱩᱞ / Ul)
          </span>
        </div>

        {/* Coins / Shopping */}
        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => {
            sound.playPop();
            setCoinsCount((c) => (c < 8 ? c + 1 : 1));
            sound.speakText('रुपये-पैसे! Money and coins in the village market!', { lang: 'hi-IN' });
          }}
          title="Tap to add coins"
        >
          <div className="text-4xl animate-wiggle">🪙</div>
          <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 rounded-full mt-1">
            ₹ {coinsCount} Coins
          </span>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------
// VARIANT K – Water & Rivers (पानी रे पानी)
// -----------------------------------------------------------------------
const WaterScene: React.FC = () => {
  const [rainSplash, setRainSplash] = useState(false);
  const [boatMoving, setBoatMoving] = useState(false);

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="text-xs font-black text-sky-900 bg-sky-100 px-3 py-1 rounded-full border border-sky-300">
        🌧️ पानी रे पानी (Water & Rain) • झारखंड के झरने और नदियाँ 🌊
      </div>

      <div className="flex items-center justify-around w-full gap-4">
        {/* Rain Clouds */}
        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => {
            sound.playPop();
            setRainSplash(true);
            sound.speakText('दाग! Dak! Rain is falling from the clouds!', { lang: 'hi-IN' });
            setTimeout(() => setRainSplash(false), 2000);
          }}
          title="Tap cloud for rain"
        >
          <div className="text-6xl animate-pulse">🌧️</div>
          <div className="flex gap-1 text-xl">
            <span>💧</span>
            <span>💧</span>
            <span>💧</span>
          </div>
          <span className="text-[10px] font-black text-sky-950 bg-sky-200 px-2 rounded-full mt-1">
            {rainSplash ? '💦 Splash!' : 'Tap for Rain!'}
          </span>
        </div>

        {/* River Stream & Boat */}
        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => {
            sound.playCorrect();
            setBoatMoving(true);
            sound.speakText('कागज़ की नाव पानी में तैरी! The boat sails down the river!', { lang: 'hi-IN' });
            setTimeout(() => setBoatMoving(false), 2500);
          }}
          title="Tap boat to sail"
        >
          <div className={`text-5xl transition-transform duration-1000 ${boatMoving ? 'translate-x-12 scale-110' : ''}`}>
            ⛵
          </div>
          <div className="text-4xl -mt-2">🌊</div>
          <span className="text-[10px] font-black text-blue-950 bg-blue-200 px-2 rounded-full mt-1">
            गाड़ा (Gada / River)
          </span>
        </div>

        {/* Jumping Frog */}
        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => {
            sound.playPop();
            sound.speakText('Roté! The frog jumps into the water puddle!', { lang: 'hi-IN' });
          }}
        >
          <div className="text-5xl animate-bounce">🐸</div>
          <span className="text-[10px] font-black text-emerald-950 bg-emerald-200 px-2 rounded-full mt-1">
            Frog (ᱨᱚᱴᱮ / Rote)
          </span>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------
// VARIANT L – Patterns, Long & Round (क्या है लंबा, क्या है गोल?)
// -----------------------------------------------------------------------
// -----------------------------------------------------------------------
// VARIANT L – Shapes & Patterns (आकृतियाँ और पैटर्न)
// -----------------------------------------------------------------------
const PatternsShapesScene: React.FC = () => {
  const [selectedShape, setSelectedShape] = useState<'circle' | 'triangle' | 'square' | 'cylinder'>('circle');

  const shapes = [
    {
      id: 'circle' as const,
      name: 'Circle / ᱜᱩᱞᱟᱹᱴ',
      hindi: 'गोल (वृत्त)',
      emoji: '🟡',
      example: 'चूड़ी, सिक्का और रोटी गोल हैं! Bangles & Rotis are round!',
      santali: 'ᱜᱩᱞᱟᱹᱴ (Gulat)',
    },
    {
      id: 'triangle' as const,
      name: 'Triangle / ᱯᱮ ᱠᱳᱬ',
      hindi: 'त्रिकोण (तीन कोने)',
      emoji: '🔺',
      example: 'समोसा और पहाड़ त्रिकोण हैं! Mountains & Samosas have 3 corners!',
      santali: 'ᱯᱮ ᱠᱳᱬ (Pe Kon)',
    },
    {
      id: 'square' as const,
      name: 'Square / ᱪᱟᱹᱣᱠᱟᱹ',
      hindi: 'चौकोर (चार बराबर भुजाएँ)',
      emoji: '🟦',
      example: 'कैरम बोर्ड और खिड़की चौकोर हैं! Windows & Carrom boards are square!',
      santali: 'ᱪᱟᱹᱣᱠᱟᱹ (Chawka)',
    },
    {
      id: 'cylinder' as const,
      name: 'Cylinder / ᱵᱮᱞᱱᱟ',
      hindi: 'बेलनाकार',
      emoji: '🪵',
      example: 'लकड़ी का लट्ठा और गिलास गोल-लंबे हैं! Wooden logs and glasses roll & slide!',
      santali: 'ᱵᱮᱞᱱᱟ (Belna)',
    },
  ];

  const current = shapes.find((s) => s.id === selectedShape) || shapes[0];

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="text-xs font-black text-amber-950 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
        🔷 जादुई आकृतियाँ (Magic Shapes World) • Tap Any Shape to Explore! 🔴
      </div>

      <div className="flex items-center justify-around w-full gap-2 flex-wrap">
        {shapes.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              sound.playCorrect();
              setSelectedShape(s.id);
              sound.speakText(`${s.name}. ${s.example}`, { lang: 'hi-IN' });
            }}
            className={`flex flex-col items-center p-2 rounded-2xl transition-all cursor-pointer border-2 ${
              selectedShape === s.id
                ? 'bg-amber-100 border-amber-500 scale-110 shadow-md ring-2 ring-amber-300'
                : 'bg-white hover:bg-stone-50 border-stone-200'
            }`}
          >
            <span className="text-4xl animate-bounce">{s.emoji}</span>
            <span className="text-[11px] font-black text-amber-950 mt-1">{s.name.split('/')[0]}</span>
            <span className="text-[10px] font-bold text-amber-800">{s.santali}</span>
          </button>
        ))}
      </div>

      {/* Interactive Exploration Card */}
      <div className="p-3 bg-white/95 rounded-2xl border-2 border-amber-300 text-center max-w-sm shadow-xs space-y-1">
        <p className="text-xs font-black text-amber-950">{current.name} • {current.hindi}</p>
        <p className="text-xs font-bold text-emerald-800 leading-snug">{current.example}</p>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------
// VARIANT M – Addition Grove (मजेदार जोड़ / ᱢᱮᱥᱟ)
// -----------------------------------------------------------------------
const AdditionScene: React.FC = () => {
  const [mangoesInBasket, setMangoesInBasket] = useState(2);
  const [justPicked, setJustPicked] = useState(false);

  const olChikiDigits = ['᱐', '᱑', '᱒', '᱓', '᱔', '᱕', '᱖', '᱗', '᱘', '᱙', '᱑᱐'];

  const addMango = () => {
    sound.playPop();
    setJustPicked(true);
    setMangoesInBasket((m) => Math.min(m + 1, 9));
    sound.speakText(`Mesa! Added one more! Now ${mangoesInBasket + 1} mangoes!`, { lang: 'hi-IN' });
    setTimeout(() => setJustPicked(false), 800);
  };

  const resetOrAddTwo = () => {
    sound.playCorrect();
    setMangoesInBasket(1);
    sound.speakText('Let us start again with 1 mango!', { lang: 'hi-IN' });
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="text-xs font-black text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300">
        🥭 आम की बगिया में जोड़ (Addition in Mango Grove) • ᱢᱮᱥᱟ (Mesa) 🧺
      </div>

      <div className="flex items-center justify-around w-full gap-4">
        {/* Tree with plucking button */}
        <div
          onClick={addMango}
          className="flex flex-col items-center cursor-pointer group"
          title="Tap tree to pluck another mango!"
        >
          <div className="text-6xl group-hover:scale-110 transition-transform">🌳</div>
          <span className="text-[10px] font-black text-emerald-950 bg-emerald-200 px-2 py-0.5 rounded-full mt-1">
            Tap Tree to Pick ➕1
          </span>
        </div>

        {/* Live Formula Display */}
        <div className="bg-white/95 px-3 py-2 rounded-2xl border-2 border-amber-400 shadow-sm text-center">
          <div className="text-lg font-black text-amber-950 tracking-wider">
            {mangoesInBasket} + 1 = {mangoesInBasket + 1}
          </div>
          <div className="text-sm font-black text-amber-800 font-olchiki">
            {olChikiDigits[mangoesInBasket]} + ᱑ = {olChikiDigits[mangoesInBasket + 1]}
          </div>
          <span className="text-[9px] font-extrabold text-slate-500 uppercase">ᱢᱮᱥᱟ / जोड़</span>
        </div>

        {/* Basket with collected mangoes */}
        <div className="flex flex-col items-center">
          <div className={`text-5xl transition-transform ${justPicked ? 'scale-125' : ''}`}>
            🧺
          </div>
          <div className="flex gap-1 text-xl -mt-2 flex-wrap justify-center max-w-[100px]">
            {Array.from({ length: mangoesInBasket }).map((_, i) => (
              <span key={i} className="animate-pulse">🥭</span>
            ))}
          </div>
          <span className="text-[10px] font-black text-amber-950 bg-amber-300 px-2 py-0.5 rounded-full mt-1">
            {mangoesInBasket} in Basket
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={addMango}
          className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs press-bounce"
        >
          ➕ Pluck 1 Mango
        </button>
        <button
          onClick={resetOrAddTwo}
          className="px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs border border-amber-300 press-bounce"
        >
          🔄 Reset
        </button>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------
// VARIANT N – Subtraction Sparrows (घटाव / ᱵᱷᱮᱜᱟᱨ)
// -----------------------------------------------------------------------
const SubtractionScene: React.FC = () => {
  const [sparrowsCount, setSparrowsCount] = useState(5);
  const olChikiDigits = ['᱐', '᱑', '᱒', '᱓', '᱔', '᱕'];

  const flyAwayOne = () => {
    if (sparrowsCount <= 0) return;
    sound.playPop();
    const next = sparrowsCount - 1;
    setSparrowsCount(next);
    sound.speakText(`One sparrow flew away into the sky! ${next} sparrows left on the branch!`, { lang: 'hi-IN' });
  };

  const refillBranch = () => {
    sound.playCorrect();
    setSparrowsCount(5);
    sound.speakText('All 5 sparrows flew back to the branch!', { lang: 'hi-IN' });
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="text-xs font-black text-sky-900 bg-sky-100 px-3 py-1 rounded-full border border-sky-300">
        🐦 डाल पर चिड़ियाँ (Subtraction Countdown) • ᱵᱷᱮᱜᱟᱨ (Bhegar / घटाव) 🍃
      </div>

      {/* Sal Branch with birds */}
      <div className="relative w-full max-w-sm h-28 bg-gradient-to-b from-sky-100 to-amber-50 rounded-2xl border-2 border-amber-300 p-2 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-black text-amber-900">
          <span>Sal Branch (ᱫᱟᱨᱮ)</span>
          <span className="bg-white/80 px-2 py-0.5 rounded-full border border-amber-200">
            {sparrowsCount} left • Ol Chiki: {olChikiDigits[sparrowsCount]}
          </span>
        </div>

        {/* Birds row on branch */}
        <div className="flex items-end justify-center gap-3 border-b-4 border-amber-800 pb-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const isPresent = i < sparrowsCount;
            return (
              <div
                key={i}
                onClick={isPresent ? flyAwayOne : undefined}
                className={`text-3xl transition-all duration-500 ${
                  isPresent ? 'cursor-pointer hover:scale-125 animate-bounce' : 'opacity-0 -translate-y-12 pointer-events-none'
                }`}
                title="Tap bird to fly away!"
              >
                🐦
              </div>
            );
          })}
        </div>

        <div className="text-[10px] font-bold text-center text-slate-600">
          Formula: 5 - {5 - sparrowsCount} = {sparrowsCount} • ᱕ - {olChikiDigits[5 - sparrowsCount]} = {olChikiDigits[sparrowsCount]}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={flyAwayOne}
          disabled={sparrowsCount === 0}
          className="px-3 py-1 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black text-xs shadow-xs press-bounce"
        >
          ➖ 1 Bird Flies Away!
        </button>
        <button
          onClick={refillBranch}
          className="px-2.5 py-1 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs border border-emerald-300 press-bounce"
        >
          🕊️ Call All Back (5)
        </button>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------
// VARIANT O – Multiplication & Grouping (गुणा और बराबर समूह / ᱦᱟᱹᱴᱤᱧ)
// -----------------------------------------------------------------------
const MultiplicationScene: React.FC = () => {
  const [groupCount, setGroupCount] = useState(3);
  const [potsPerGroup, setPotsPerGroup] = useState(3);

  const total = groupCount * potsPerGroup;

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="text-xs font-black text-amber-950 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
        🏺 कुम्हार के घड़े (Equal Grouping & Multiplication) • ᱦᱟᱹᱴᱤᱧ / गुणा ✨
      </div>

      {/* Trays of earthen pots */}
      <div className="flex items-center justify-around w-full gap-2 flex-wrap">
        {Array.from({ length: groupCount }).map((_, gIdx) => (
          <div
            key={gIdx}
            className="flex flex-col items-center p-2 rounded-2xl bg-amber-200/60 border-2 border-amber-400 shadow-xs"
          >
            <span className="text-[10px] font-black text-amber-900">Tray {gIdx + 1}</span>
            <div className="flex gap-1 text-2xl my-1">
              {Array.from({ length: potsPerGroup }).map((_, pIdx) => (
                <span key={pIdx} className="animate-gentle-bounce" style={{ animationDelay: `${pIdx * 0.2}s` }}>
                  🏺
                </span>
              ))}
            </div>
            <span className="text-[10px] font-bold text-amber-800">{potsPerGroup} pots</span>
          </div>
        ))}
      </div>

      {/* Math summary */}
      <div className="bg-white px-4 py-1.5 rounded-2xl border-2 border-amber-300 text-center shadow-xs">
        <span className="text-sm font-black text-amber-950">
          {groupCount} groups of {potsPerGroup} = {total} Pots (ᱴᱩᱠᱩᱡ)
        </span>
        <span className="mx-2 text-amber-700 font-bold">•</span>
        <span className="text-sm font-black text-emerald-700">{groupCount} × {potsPerGroup} = {total}</span>
      </div>

      <div className="flex items-center gap-1.5 text-xs">
        <span className="font-bold text-amber-950">Trays:</span>
        {[2, 3, 4].map((n) => (
          <button
            key={n}
            onClick={() => {
              sound.playPop();
              setGroupCount(n);
              sound.speakText(`${n} groups of ${potsPerGroup} is ${n * potsPerGroup}!`, { lang: 'hi-IN' });
            }}
            className={`px-2 py-0.5 rounded-lg font-black ${
              groupCount === n ? 'bg-amber-500 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            {n}
          </button>
        ))}

        <span className="font-bold text-amber-950 ml-2">Pots each:</span>
        {[2, 3, 4].map((n) => (
          <button
            key={n}
            onClick={() => {
              sound.playCorrect();
              setPotsPerGroup(n);
              sound.speakText(`${groupCount} groups of ${n} is ${groupCount * n}!`, { lang: 'hi-IN' });
            }}
            className={`px-2 py-0.5 rounded-lg font-black ${
              potsPerGroup === n ? 'bg-emerald-600 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------
// VARIANT P – Sun, Routine & Clock (समय और दिनचर्या / ᱚᱠᱛᱚ)
// -----------------------------------------------------------------------
const ClockTimeScene: React.FC = () => {
  const [timeStage, setTimeStage] = useState<'morning' | 'noon' | 'evening' | 'night'>('morning');

  const stages = [
    {
      id: 'morning' as const,
      name: 'Morning / ᱥᱮᱛᱟᱜ (Setak)',
      clock: '6:00 AM 🕕',
      skyEmoji: '🌅 🐓',
      desc: 'Dawn breaks over the hills! The rooster crows and children go to school!',
      bgColor: 'from-orange-200 via-amber-100 to-sky-100',
    },
    {
      id: 'noon' as const,
      name: 'Noon / ᱛᱤᱠᱤᱱ (Tikin)',
      clock: '12:00 PM 🕛',
      skyEmoji: '☀️ 🌾',
      desc: 'Sun is high! Lunchtime with mid-day meal in school!',
      bgColor: 'from-amber-200 via-yellow-100 to-emerald-100',
    },
    {
      id: 'evening' as const,
      name: 'Evening / ᱟᱹᱭᱩᱵ (Ayub)',
      clock: '5:00 PM 🕔',
      skyEmoji: '🌇 🐂',
      desc: 'Dusk falls! Cattle return home, children play football on the village ground!',
      bgColor: 'from-rose-200 via-orange-100 to-amber-100',
    },
    {
      id: 'night' as const,
      name: 'Night / ᱧᱤᱫᱟᱹ (Nyida)',
      clock: '9:00 PM 🕘',
      skyEmoji: '🌙 ⭐',
      desc: 'Moon and stars shine bright! Time to sleep and dream sweet dreams!',
      bgColor: 'from-indigo-900 via-purple-900 to-slate-900',
    },
  ];

  const current = stages.find((s) => s.id === timeStage) || stages[0];

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="text-xs font-black text-amber-950 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
        ⏰ समय का पहिया (Daily Time & Clock Routine) • ᱚᱠᱛᱚ (Okto) ☀️
      </div>

      {/* Sky Canvas for selected time */}
      <div
        className={`w-full h-24 rounded-2xl bg-gradient-to-r ${current.bgColor} p-3 flex items-center justify-between border-2 border-amber-300 shadow-inner transition-colors duration-700`}
      >
        <div className="text-4xl animate-bounce">{current.skyEmoji}</div>
        <div className="text-center">
          <span className={`text-base font-black ${timeStage === 'night' ? 'text-amber-200' : 'text-amber-950'}`}>
            {current.clock}
          </span>
          <p className={`text-xs font-bold ${timeStage === 'night' ? 'text-purple-200' : 'text-amber-900'}`}>
            {current.name}
          </p>
        </div>
        <div className="text-3xl animate-pulse">🕰️</div>
      </div>

      {/* Time selector buttons */}
      <div className="flex items-center justify-around w-full gap-1.5 flex-wrap">
        {stages.map((st) => (
          <button
            key={st.id}
            onClick={() => {
              sound.playCorrect();
              setTimeStage(st.id);
              sound.speakText(`${st.name}. ${st.desc}`, { lang: 'hi-IN' });
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all border ${
              timeStage === st.id
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs scale-105'
                : 'bg-white hover:bg-amber-50 text-amber-950 border-amber-200'
            }`}
          >
            {st.name.split('/')[0]}
          </button>
        ))}
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------
// VARIANT Q – Measurement & Steps (नाप-तौल और कदम / ᱡᱚᱠᱷᱟ)
// -----------------------------------------------------------------------
const MeasurementScene: React.FC = () => {
  const [stepCount, setStepCount] = useState(2);

  const takeStep = () => {
    sound.playPop();
    setStepCount((s) => (s < 8 ? s + 1 : 1));
    sound.speakText(`Step ${stepCount + 1}! Measuring distance in footsteps! Kat!`, { lang: 'hi-IN' });
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="text-xs font-black text-amber-950 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
        👣 कदम-कदम से दूरी नापो (Measuring Length & Steps) • ᱡᱚᱠᱷᱟ (Jokha) 📏
      </div>

      {/* Village Trail with milestones */}
      <div className="relative w-full max-w-md h-24 bg-gradient-to-r from-amber-100 via-amber-200 to-emerald-100 rounded-2xl border-2 border-amber-400 p-2 flex items-center justify-between">
        {/* Hut at start */}
        <div className="flex flex-col items-center">
          <span className="text-3xl">🏠</span>
          <span className="text-[9px] font-black text-amber-900">घर (Orak)</span>
        </div>

        {/* Footsteps Path */}
        <div className="flex-1 flex items-center justify-around px-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className={`text-xl transition-all duration-300 ${
                i < stepCount ? 'opacity-100 scale-110 text-amber-800' : 'opacity-20'
              }`}
            >
              👣
            </span>
          ))}
        </div>

        {/* School at end */}
        <div className="flex flex-col items-center">
          <span className="text-3xl">🏫</span>
          <span className="text-[9px] font-black text-emerald-900">स्कूल (Asra)</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={takeStep}
          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-sm press-bounce border border-amber-700"
        >
          👣 Walk 1 Step (कदम / ᱠᱟᱛ)
        </button>
        <span className="text-xs font-black text-amber-950 bg-white px-3 py-1 rounded-xl border border-amber-300">
          Measured: {stepCount} Footsteps
        </span>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------
// VARIANT R – Fractions & Food Sharing (हिस्सा और भिन्न / ᱦᱟᱹᱴᱤᱧ)
// -----------------------------------------------------------------------
const FractionsScene: React.FC = () => {
  const [fractionMode, setFractionMode] = useState<'whole' | 'half' | 'quarter'>('half');

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="text-xs font-black text-amber-950 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
        🫓 रोटी का बँटवारा (Fractions & Equal Sharing) • ᱦᱟᱹᱴᱤᱧ (Hating) 🍉
      </div>

      <div className="flex items-center justify-around w-full gap-4">
        {/* Roti plate display */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-amber-300 border-4 border-amber-600 shadow-md flex items-center justify-center relative overflow-hidden">
            {fractionMode === 'whole' && (
              <span className="text-xs font-black text-amber-950">1 (पूरा)</span>
            )}
            {fractionMode === 'half' && (
              <>
                <div className="w-1/2 h-full bg-amber-400 border-r-2 border-amber-700 flex items-center justify-center text-[11px] font-black">
                  1/2
                </div>
                <div className="w-1/2 h-full bg-amber-200 flex items-center justify-center text-[11px] font-black text-amber-900">
                  1/2
                </div>
              </>
            )}
            {fractionMode === 'quarter' && (
              <div className="grid grid-cols-2 grid-rows-2 w-full h-full text-[10px] font-black text-center">
                <div className="bg-amber-400 border-r border-b border-amber-700 flex items-center justify-center">1/4</div>
                <div className="bg-amber-300 border-b border-amber-700 flex items-center justify-center">1/4</div>
                <div className="bg-amber-300 border-r border-amber-700 flex items-center justify-center">1/4</div>
                <div className="bg-amber-200 flex items-center justify-center">1/4</div>
              </div>
            )}
          </div>
          <span className="text-[10px] font-black text-amber-950 bg-amber-200 px-2.5 py-0.5 rounded-full mt-1.5">
            {fractionMode === 'whole' ? '1 Whole / ᱢᱤᱫᱴᱟᱹᱝ' : fractionMode === 'half' ? '1/2 Half / ᱟᱫᱷᱟ' : '1/4 Quarter / ᱪᱟᱹᱣᱛᱷᱟᱹᱭ'}
          </span>
        </div>

        {/* Friends receiving share */}
        <div className="flex items-center gap-2">
          <div className="text-center">
            <span className="text-4xl animate-bounce">👦</span>
            <span className="text-[10px] font-bold text-amber-900 block">Suren</span>
          </div>
          <span className="text-2xl font-black text-amber-600">🤝</span>
          <div className="text-center">
            <span className="text-4xl animate-bounce" style={{ animationDelay: '0.3s' }}>👧</span>
            <span className="text-[10px] font-bold text-amber-900 block">Muni</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            sound.playPop();
            setFractionMode('whole');
            sound.speakText('One whole roti! Mit-tang!', { lang: 'hi-IN' });
          }}
          className={`px-3 py-1 rounded-xl text-xs font-black ${
            fractionMode === 'whole' ? 'bg-amber-500 text-white' : 'bg-white text-amber-950 border border-amber-300'
          }`}
        >
          1 Whole (पूरा)
        </button>
        <button
          onClick={() => {
            sound.playCorrect();
            setFractionMode('half');
            sound.speakText('Cut into two equal halves! Adha! 1/2 for each friend!', { lang: 'hi-IN' });
          }}
          className={`px-3 py-1 rounded-xl text-xs font-black ${
            fractionMode === 'half' ? 'bg-amber-500 text-white' : 'bg-white text-amber-950 border border-amber-300'
          }`}
        >
          1/2 Half (आधा)
        </button>
        <button
          onClick={() => {
            sound.playCorrect();
            setFractionMode('quarter');
            sound.speakText('Cut into four equal quarters! Chawthay! 1/4 each!', { lang: 'hi-IN' });
          }}
          className={`px-3 py-1 rounded-xl text-xs font-black ${
            fractionMode === 'quarter' ? 'bg-amber-500 text-white' : 'bg-white text-amber-950 border border-amber-300'
          }`}
        >
          1/4 Quarter (चौथाई)
        </button>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------
// VARIANT S – Folk Story: Mango and the Crow (आम की कहानी)
// -----------------------------------------------------------------------
const MangoStoryScene: React.FC = () => {
  const [storyStep, setStoryStep] = useState(1);

  const steps = [
    {
      step: 1,
      title: '1. Girl & Boy Spot Yellow Mango',
      emoji: '👧 🧒 🥭',
      narrative: 'A little girl saw a ripe sweet yellow mango hanging high on the tree branch!',
    },
    {
      step: 2,
      title: '2. Clever Crow Swoops Down',
      emoji: '🌳 🐦 🥭',
      narrative: 'A hungry black crow saw the mango too and flew to grab it in its beak!',
    },
    {
      step: 3,
      title: '3. Bees Buzz & Defend',
      emoji: '🐝 🐝 🐦',
      narrative: 'A swarm of honeybees buzzed around the crow! Bzzzz! The crow dropped the mango!',
    },
    {
      step: 4,
      title: '4. Safe into the Nest & Hands!',
      emoji: '🪺 🥭 🧒 🎉',
      narrative: 'The mango fell gently into a cozy bird nest, and the children caught it happily!',
    },
  ];

  const current = steps.find((s) => s.step === storyStep) || steps[0];

  const nextStep = () => {
    sound.playPop();
    const next = storyStep < 4 ? storyStep + 1 : 1;
    setStoryStep(next);
    sound.speakText(steps[next - 1].narrative, { lang: 'hi-IN' });
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="text-xs font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
        📖 आम की कहानी (Folk Tale: Mango & The Crow) • झिलमिल Class 1 🥭
      </div>

      <div className="w-full max-w-sm bg-white/95 rounded-2xl border-2 border-amber-400 p-3 shadow-md text-center space-y-2">
        <div className="text-5xl animate-bounce py-1">{current.emoji}</div>
        <h5 className="text-xs font-black text-amber-950">{current.title}</h5>
        <p className="text-xs font-bold text-amber-900 leading-snug">{current.narrative}</p>
      </div>

      <button
        onClick={nextStep}
        className="px-4 py-1.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md press-bounce border border-amber-700 flex items-center gap-1.5"
      >
        <span>Next Story Scene 👉 ({storyStep}/4)</span>
      </button>
    </div>
  );
};

// -----------------------------------------------------------------------
// VARIANT T – Living Plant & Tree Parts (पौधों की परी / ᱫᱟᱨᱮ)
// -----------------------------------------------------------------------
const PlantsScene: React.FC = () => {
  const [inspectedPart, setInspectedPart] = useState<'root' | 'stem' | 'leaf' | 'flower'>('leaf');

  const parts = [
    {
      id: 'root' as const,
      name: 'Roots / ᱨᱮᱦᱮᱫ (Rehet)',
      hindi: 'जड़',
      emoji: '🌱',
      info: 'जड़ें मिट्टी से पानी और खनिज चूसती हैं! Roots drink water from soil!',
    },
    {
      id: 'stem' as const,
      name: 'Stem & Trunk / ᱫᱟᱨᱮ (Dare)',
      hindi: 'तना',
      emoji: '🪵',
      info: 'तना पौधे को सीधा रखता है और पानी पहुँचाता है! Stem carries nutrients up!',
    },
    {
      id: 'leaf' as const,
      name: 'Leaves / ᱥᱟᱠᱟᱢ (Sakam)',
      hindi: 'पत्ता',
      emoji: '🍃',
      info: 'हरे पत्ते धूप से खाना बनाते हैं! Green leaves make food with sunlight!',
    },
    {
      id: 'flower' as const,
      name: 'Flower / ᱵᱟᱦᱟ (Baha)',
      hindi: 'फूल',
      emoji: '🌸',
      info: 'फूल मधुमक्खियों को बुलाते हैं और फल बनते हैं! Flowers bloom into fruit!',
    },
  ];

  const current = parts.find((p) => p.id === inspectedPart) || parts[0];

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="text-xs font-black text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
        🌳 पौधों की परी (Parts of a Living Plant) • ᱫᱟᱨᱮ ᱥᱮᱪᱮᱫ 🌸
      </div>

      {/* Interactive Plant Diagram */}
      <div className="flex items-center justify-around w-full gap-2 flex-wrap">
        {parts.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              sound.playCorrect();
              setInspectedPart(p.id);
              sound.speakText(`${p.name}. ${p.info}`, { lang: 'hi-IN' });
            }}
            className={`flex flex-col items-center p-2 rounded-2xl transition-all cursor-pointer border-2 ${
              inspectedPart === p.id
                ? 'bg-emerald-100 border-emerald-500 scale-110 shadow-sm ring-2 ring-emerald-300'
                : 'bg-white hover:bg-emerald-50 border-emerald-200'
            }`}
          >
            <span className="text-3xl animate-gentle-bounce">{p.emoji}</span>
            <span className="text-[11px] font-black text-emerald-950 mt-1">{p.hindi}</span>
            <span className="text-[10px] font-bold text-emerald-800">{p.name.split('/')[1]}</span>
          </button>
        ))}
      </div>

      {/* Info Card */}
      <div className="p-3 bg-white/95 rounded-2xl border-2 border-emerald-400 text-center max-w-sm shadow-xs space-y-1">
        <p className="text-xs font-black text-emerald-950">{current.name} • {current.hindi}</p>
        <p className="text-xs font-bold text-emerald-900 leading-snug">{current.info}</p>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------
// VARIANT U – Village Pond & Ecosystem (पूनम का दिन / जल और जीव)
// -----------------------------------------------------------------------
const PondScene: React.FC = () => {
  const [activeCreature, setActiveCreature] = useState<'fish' | 'duck' | 'frog' | 'lily'>('fish');

  const creatures = [
    {
      id: 'fish' as const,
      name: 'Fish / ᱦᱟᱹᱠᱳ (Hako)',
      hindi: 'मछली',
      emoji: '🐟',
      action: 'मछली जल में तैरती और कूदती है! Golden Mahseer swims in the clean river!',
    },
    {
      id: 'duck' as const,
      name: 'Duck / ᱜᱮᱰᱮ (Gede)',
      hindi: 'बतख',
      emoji: '🦆',
      action: 'बतख पंख फड़फड़ा कर तालाब में तैरती है! Duck quacks and paddles!',
    },
    {
      id: 'frog' as const,
      name: 'Frog / ᱨᱚᱴᱮ (Rote)',
      hindi: 'मेंढक',
      emoji: '🐸',
      action: 'मेंढक टर्र-टर्र बोलता है और छलाँग लगाता है! Frog croaks and jumps on the lily pad!',
    },
    {
      id: 'lily' as const,
      name: 'Lotus / ᱠᱟᱢᱟᱞ (Kamal)',
      hindi: 'कमल का फूल',
      emoji: '🪷',
      action: 'तालाब में सुंदर कमल खिलता है! Lotus blooms gracefully in water!',
    },
  ];

  const current = creatures.find((c) => c.id === activeCreature) || creatures[0];

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="text-xs font-black text-sky-950 bg-sky-100 px-3 py-1 rounded-full border border-sky-300">
        🌊 पूनम का दिन (Village Pond & Wildlife) • ᱯᱩᱠᱷᱨᱤ ᱡᱤᱵᱽ ᱡᱤᱭᱟᱹᱞᱤ 🦆
      </div>

      {/* Pond Water Basin */}
      <div className="relative w-full max-w-md h-28 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 rounded-3xl border-3 border-sky-600 p-3 shadow-inner flex items-center justify-around overflow-hidden">
        {creatures.map((c) => (
          <div
            key={c.id}
            onClick={() => {
              sound.playCorrect();
              setActiveCreature(c.id);
              sound.speakText(`${c.name}. ${c.action}`, { lang: 'hi-IN' });
            }}
            className={`flex flex-col items-center cursor-pointer transition-transform ${
              activeCreature === c.id ? 'scale-125' : 'hover:scale-110'
            }`}
            title={`Tap ${c.name}`}
          >
            <span className="text-4xl animate-bounce">{c.emoji}</span>
            <span className="text-[10px] font-black text-white drop-shadow bg-blue-900/60 px-1.5 py-0.2 rounded-md mt-1">
              {c.name.split('/')[0]}
            </span>
          </div>
        ))}
      </div>

      <div className="p-2.5 bg-white/95 rounded-2xl border-2 border-sky-300 text-center max-w-sm shadow-xs space-y-0.5">
        <p className="text-xs font-black text-sky-950">{current.name}</p>
        <p className="text-xs font-bold text-sky-900">{current.action}</p>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------
// VARIANT V – English Animal Sound Safari (Sunrise / Sunshine)
// -----------------------------------------------------------------------
const EnglishSafariScene: React.FC = () => {
  const [selectedAnimal, setSelectedAnimal] = useState<'lion' | 'elephant' | 'peacock' | 'deer'>('deer');

  const animals = [
    {
      id: 'deer' as const,
      name: 'Chotu the Deer',
      santali: 'ᱡᱤᱞ (Jil)',
      emoji: '🦌',
      soundText: 'Chotu the deer leaps swiftly through the Sal forest of Jharkhand!',
    },
    {
      id: 'lion' as const,
      name: 'Lion',
      santali: 'ᱛᱟᱹᱨᱩᱵ (Tarub)',
      emoji: '🦁',
      soundText: 'Roar! The mighty lion rules the wild reserve!',
    },
    {
      id: 'elephant' as const,
      name: 'Elephant',
      santali: 'ᱦᱟᱹᱛᱤ (Hati)',
      emoji: '🐘',
      soundText: 'Pawoo! The gentle giant elephant walks with heavy feet!',
    },
    {
      id: 'peacock' as const,
      name: 'Peacock',
      santali: 'ᱢᱟᱨᱟᱜ (Marag)',
      emoji: '🦚',
      soundText: 'The colourful peacock spreads its feathers in the monsoon rain!',
    },
  ];

  const current = animals.find((a) => a.id === selectedAnimal) || animals[0];

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="text-xs font-black text-purple-950 bg-purple-100 px-3 py-1 rounded-full border border-purple-300">
        ✨ English Animal Safari (Sunrise / Sunshine) • Tap to Hear Sounds! 🦁
      </div>

      <div className="flex items-center justify-around w-full gap-2 flex-wrap">
        {animals.map((a) => (
          <button
            key={a.id}
            onClick={() => {
              sound.playCorrect();
              setSelectedAnimal(a.id);
              sound.speakText(`${a.name} in Santali is ${a.santali}. ${a.soundText}`, { lang: 'en-IN' });
            }}
            className={`flex flex-col items-center p-2 rounded-2xl transition-all cursor-pointer border-2 ${
              selectedAnimal === a.id
                ? 'bg-purple-100 border-purple-500 scale-110 shadow-md ring-2 ring-purple-300'
                : 'bg-white hover:bg-purple-50 border-purple-200'
            }`}
          >
            <span className="text-4xl animate-gentle-bounce">{a.emoji}</span>
            <span className="text-[11px] font-black text-purple-950 mt-1">{a.name}</span>
            <span className="text-[10px] font-bold text-purple-800">{a.santali}</span>
          </button>
        ))}
      </div>

      <div className="p-2.5 bg-white/95 rounded-2xl border-2 border-purple-300 text-center max-w-sm shadow-xs space-y-0.5">
        <p className="text-xs font-black text-purple-950">{current.name} • {current.santali}</p>
        <p className="text-xs font-bold text-purple-900 leading-snug">{current.soundText}</p>
      </div>
    </div>
  );
};

export const StoryAnimation: React.FC<StoryAnimationProps> = ({
  sceneType,
  currentLanguage,
  nativeKeywords,
  chapterMeta,
  chapterTitle,
  conceptKey,
  visualHint,
}) => {
  const [camelPosition, setCamelPosition] = useState<'outside' | 'inside'>('outside');
  const [isRolling, setIsRolling] = useState(false);
  const [birdPosition, setBirdPosition] = useState<'top' | 'bottom'>('top');
  const [animalBounce, setAnimalBounce] = useState<'elephant' | 'puppy' | null>(null);

  const toggleCamel = () => {
    sound.playPop();
    setCamelPosition((prev) => (prev === 'outside' ? 'inside' : 'outside'));
    if (camelPosition === 'outside') {
      sound.speakText('Camel is going Inside the tent. Bhitri!', { lang: 'hi-IN' });
    } else {
      sound.speakText('Camel is going Outside the tent. Bahre!', { lang: 'hi-IN' });
    }
  };

  const triggerRoll = () => {
    sound.playPop();
    setIsRolling(true);
    sound.speakText('Rolling and sliding down the hill!', { lang: 'hi-IN' });
    setTimeout(() => setIsRolling(false), 2400);
  };

  const toggleBird = () => {
    sound.playPop();
    setBirdPosition((prev) => (prev === 'top' ? 'bottom' : 'top'));
  };

  // Determine general scene variant
  const generalVariant: GeneralVariant = chapterMeta
    ? getGeneralSceneVariant(chapterMeta, conceptKey)
    : 'village';

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border-4 border-amber-300 bg-gradient-to-b from-sky-200 via-amber-100 to-emerald-100 shadow-xl p-4 sm:p-6 min-h-[340px] flex flex-col justify-between select-none">
      {/* Cartoon Background Elements (Clouds & Sun) */}
      <div className="absolute top-3 left-6 text-2xl animate-float-slow opacity-80 pointer-events-none">
        ☁️
      </div>
      <div className="absolute top-6 right-12 text-3xl animate-pulse-soft pointer-events-none">
        ☀️
      </div>
      <div className="absolute top-4 right-1/3 text-xl animate-float-slow opacity-70 pointer-events-none" style={{ animationDelay: '3s' }}>
        ☁️
      </div>

      {/* Header bar with Interactive Hint */}
      <div className="relative z-10 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-2xl border border-amber-300 shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-600 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="text-xs font-black text-amber-950">
            Interactive Cartoon World • Tap to Play!
          </span>
        </div>

        {/* Action button for active scene */}
        {sceneType === 'inside_outside' && (
          <button
            onClick={toggleCamel}
            className="px-3 py-1.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md press-bounce flex items-center gap-1.5 border border-amber-700"
          >
            <span>Move Camel: {camelPosition === 'outside' ? '👉 Go Inside (Bhitri)' : '👈 Go Outside (Bahre)'}</span>
          </button>
        )}

        {sceneType === 'rolling_sliding' && (
          <button
            onClick={triggerRoll}
            className="px-3 py-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md press-bounce flex items-center gap-1.5 border border-emerald-800"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Roll Ball & Slide Block!</span>
          </button>
        )}

        {sceneType === 'top_bottom' && (
          <button
            onClick={toggleBird}
            className="px-3 py-1.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shadow-md press-bounce flex items-center gap-1.5 border border-sky-800"
          >
            <span>Bird Position: {birdPosition === 'top' ? 'Top (Chetan)' : 'Bottom (Latar)'}</span>
          </button>
        )}
      </div>

      {/* Main Interactive Scene Canvas */}
      <div className="relative my-4 flex-1 flex items-center justify-center min-h-[200px]">
        {/* =======================================================
            SCENE 1: INSIDE / OUTSIDE (THE ARAB & CAMEL IN TENT)
            ======================================================= */}
        {sceneType === 'inside_outside' && (
          <div className="w-full flex items-center justify-around gap-2 relative">
            {/* Outside Zone (Desert/Forest) */}
            <div className="flex-1 text-center flex flex-col items-center">
              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-600 text-white mb-2 shadow-xs">
                Outside / ᱵᱟᱦᱨᱮ (Bahre)
              </span>

              {/* Camel Character */}
              <div
                onClick={() => {
                  sound.playPop();
                  sound.speakText('Camel is outside in the cool air! Bahre!', { lang: 'hi-IN' });
                }}
                className={`transition-all duration-700 cursor-pointer transform ${
                  camelPosition === 'outside'
                    ? 'scale-100 opacity-100 translate-x-0'
                    : 'scale-75 opacity-20 -translate-x-12'
                }`}
                title="Camel outside"
              >
                <div className="text-6xl sm:text-7xl animate-gentle-bounce">
                  🐪
                </div>
                <span className="text-xs font-black text-amber-950 bg-white/80 px-2 py-0.5 rounded-md border border-amber-300">
                  Unt (ᱩᱸᱴ / ऊँट)
                </span>
              </div>
            </div>

            {/* Tent Structure */}
            <div className="relative w-44 sm:w-56 h-48 bg-gradient-to-b from-amber-600 to-amber-700 rounded-t-full border-4 border-amber-900 shadow-2xl flex flex-col items-center justify-end pb-3 text-center overflow-hidden">
              {/* Tent Stripes pattern */}
              <div className="absolute inset-0 opacity-15 flex justify-between">
                <div className="w-4 bg-white h-full"></div>
                <div className="w-4 bg-white h-full"></div>
                <div className="w-4 bg-white h-full"></div>
                <div className="w-4 bg-white h-full"></div>
              </div>

              <span className="absolute top-2 text-[11px] font-black uppercase text-amber-100 bg-amber-900/60 px-2 py-0.5 rounded-md">
                Tent / ᱛᱟᱹᱢᱵᱩ
              </span>

              {/* Inside Zone Characters */}
              <div className="relative z-10 flex items-center justify-center gap-1.5 bg-amber-900/40 p-2 rounded-2xl border border-amber-500/50">
                {/* Arab Character */}
                <div className="text-center">
                  <div className="text-4xl animate-bounce">
                    👳
                  </div>
                  <span className="text-[10px] font-bold text-amber-100">Arab</span>
                </div>

                {/* Camel Head peek when inside */}
                {camelPosition === 'inside' && (
                  <div className="text-center animate-fade-in">
                    <div className="text-4xl animate-wiggle">
                      🐪
                    </div>
                    <span className="text-[10px] font-bold text-amber-200">Unt</span>
                  </div>
                )}
              </div>

              <span className="mt-2 text-xs font-black px-2.5 py-1 rounded-xl bg-blue-600 text-white shadow-xs">
                Inside / ᱵᱷᱤᱛᱨᱤ (Bhitri)
              </span>
            </div>
          </div>
        )}

        {/* =======================================================
            SCENE 2: BIGGER & SMALLER (ELEPHANT VS PUPPY)
            ======================================================= */}
        {sceneType === 'big_small' && (
          <div className="w-full flex items-end justify-around gap-4">
            {/* Big Elephant */}
            <div
              onClick={() => {
                sound.playCorrect();
                setAnimalBounce('elephant');
                sound.speakText('Marang! Elephant is big! ᱢᱟᱨᱟᱝ / मरांग!', { lang: 'hi-IN' });
                setTimeout(() => setAnimalBounce(null), 800);
              }}
              className={`text-center cursor-pointer transition-transform ${
                animalBounce === 'elephant' ? 'scale-115' : 'hover:scale-105'
              }`}
            >
              <div className="text-7xl sm:text-8xl animate-gentle-bounce">
                🐘
              </div>
              <div className="mt-2 space-y-0.5">
                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-xs sm:text-sm shadow-sm inline-block">
                  BIGGER / ᱢᱟᱨᱟᱝ (Marang)
                </span>
                <p className="text-xs font-bold text-amber-950">Elephant (ᱦᱟᱹᱛᱤ / हाती)</p>
              </div>
            </div>

            {/* Small Puppy */}
            <div
              onClick={() => {
                sound.playPop();
                setAnimalBounce('puppy');
                sound.speakText('Katij! Puppy is small! ᱠᱟᱹᱴᱤᱡ / हुडिंग!', { lang: 'hi-IN' });
                setTimeout(() => setAnimalBounce(null), 800);
              }}
              className={`text-center cursor-pointer transition-transform ${
                animalBounce === 'puppy' ? 'scale-120' : 'hover:scale-105'
              }`}
            >
              <div className="text-4xl sm:text-5xl animate-bounce">
                🐶
              </div>
              <div className="mt-2 space-y-0.5">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-amber-950 font-black text-xs sm:text-sm shadow-sm inline-block">
                  SMALLER / ᱠᱟᱹᱴᱤᱡ (Katij)
                </span>
                <p className="text-xs font-bold text-amber-950">Puppy (ᱥᱮᱛᱟ / सेता)</p>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================
            SCENE 3: TOP & BOTTOM (BIRD ON SAL TREE VS MONKEY)
            ======================================================= */}
        {sceneType === 'top_bottom' && (
          <div className="w-full flex items-center justify-center gap-6">
            <div className="relative w-48 sm:w-64 h-56 flex flex-col items-center justify-between">
              {/* Tree Canopy (Top) */}
              <div className="relative w-36 h-24 bg-emerald-600 rounded-full border-4 border-emerald-800 shadow-md flex items-center justify-center">
                <span className="text-xs font-black text-white bg-emerald-900/70 px-2 py-0.5 rounded-md absolute top-1">
                  TOP / ᱪᱮᱛᱟᱱ (Chetan)
                </span>
                {birdPosition === 'top' && (
                  <div
                    onClick={() => {
                      sound.playCorrect();
                      sound.speakText('Bird is at the top of the Sal tree! Chetan!', { lang: 'hi-IN' });
                    }}
                    className="text-4xl animate-bounce cursor-pointer"
                    title="Parrot at top"
                  >
                    🦜
                  </div>
                )}
              </div>

              {/* Tree Trunk */}
              <div className="w-8 h-20 bg-amber-800 border-x-2 border-amber-950"></div>

              {/* Ground Roots (Bottom) */}
              <div className="relative w-48 h-12 bg-amber-700/80 rounded-full border-2 border-amber-900 flex items-center justify-center gap-3">
                <span className="text-xs font-black text-amber-100 bg-amber-950/70 px-2 py-0.5 rounded-md absolute -bottom-2">
                  BOTTOM / ᱞᱟᱛᱟᱨ (Latar)
                </span>
                <div
                  onClick={() => {
                    sound.playPop();
                    sound.speakText('Monkey is at the bottom! Latar!', { lang: 'hi-IN' });
                  }}
                  className="text-3xl animate-wiggle cursor-pointer"
                  title="Monkey at bottom"
                >
                  🐒
                </div>
                {birdPosition === 'bottom' && (
                  <div className="text-3xl animate-bounce">
                    🦜
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =======================================================
            SCENE 4: ROLLING & SLIDING LAB (MULTI-OBJECT PHYSICS)
            ======================================================= */}
        {sceneType === 'rolling_sliding' && (
          <div className="w-full flex flex-col items-center gap-2">
            <span className="text-xs font-black text-emerald-950 bg-emerald-100 px-3 py-0.5 rounded-full border border-emerald-300">
              🏔️ लुढ़कना और खिसकना (Rolling & Sliding Playground) • ᱜᱩᱰᱨᱟᱹᱣ ᱟᱨ ᱥᱤᱫᱩᱲ
            </span>

            {/* Green Hill Ramp */}
            <div className="relative w-full max-w-md h-36 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-3xl border-3 border-emerald-700 shadow-inner overflow-hidden p-3 flex flex-col justify-between">
              {/* Slope lines */}
              <div className="absolute inset-0 bg-white/10 -skew-y-6"></div>

              {/* Rolling Football */}
              <div className="flex items-center justify-between z-10">
                <div
                  className={`flex items-center gap-2 transition-all duration-2000 ${
                    isRolling ? 'translate-x-64' : 'translate-x-0'
                  }`}
                >
                  <div className={`text-4xl ${isRolling ? 'animate-spin' : ''}`}>
                    ⚽
                  </div>
                  <span className="text-xs font-black px-2 py-0.5 rounded-md bg-blue-600 text-white">
                    ROLLING / ᱜᱩᱰᱨᱟᱹᱣ (Gudrau)
                  </span>
                </div>
              </div>

              {/* Sliding Slate Box */}
              <div className="flex items-center justify-between z-10">
                <div
                  className={`flex items-center gap-2 transition-all duration-2000 ${
                    isRolling ? 'translate-x-64' : 'translate-x-0'
                  }`}
                >
                  <div className="text-4xl">
                    📦
                  </div>
                  <span className="text-xs font-black px-2 py-0.5 rounded-md bg-orange-600 text-white">
                    SLIDING / ᱥᱤᱫᱩᱲ (Sidur)
                  </span>
                </div>
              </div>
            </div>

            {/* Extra interactive test items */}
            <div className="flex items-center justify-center gap-2 text-xs flex-wrap">
              <button
                onClick={() => {
                  sound.playCorrect();
                  setIsRolling(true);
                  sound.speakText('Coin rolls on edge and slides on flat side! Both!', { lang: 'hi-IN' });
                  setTimeout(() => setIsRolling(false), 2400);
                }}
                className="px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold border border-amber-300 press-bounce"
              >
                🪙 Coin (Both!)
              </button>
              <button
                onClick={() => {
                  sound.playPop();
                  setIsRolling(true);
                  sound.speakText('Log rolls down the grassy hill! Gudrau!', { lang: 'hi-IN' });
                  setTimeout(() => setIsRolling(false), 2400);
                }}
                className="px-2.5 py-1 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold border border-emerald-300 press-bounce"
              >
                🪵 Log (Rolls!)
              </button>
              <button
                onClick={() => {
                  sound.playCorrect();
                  setIsRolling(true);
                  sound.speakText('Football rolls! Gudrau!', { lang: 'hi-IN' });
                  setTimeout(() => setIsRolling(false), 2400);
                }}
                className="px-2.5 py-1 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-950 font-bold border border-blue-300 press-bounce"
              >
                ⚽ Ball (Rolls!)
              </button>
            </div>
          </div>
        )}

        {/* =======================================================
            SCENE 5: NEAR / FAR
            ======================================================= */}
        {sceneType === 'near_far' && (
          <div className="w-full flex items-center justify-between gap-4 px-4">
            <div
              className="flex flex-col items-center cursor-pointer"
              onClick={() => {
                sound.playPop();
                sound.speakText('Near! Lagit! This house is very near!', { lang: 'hi-IN' });
              }}
            >
              <div className="text-7xl animate-gentle-bounce">🏠</div>
              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-600 text-white mt-2 shadow-xs">
                NEAR / ᱞᱟᱜᱤᱛ (Lagit)
              </span>
            </div>
            <div className="text-4xl font-black text-amber-500">↔️</div>
            <div
              className="flex flex-col items-center cursor-pointer"
              onClick={() => {
                sound.playPop();
                sound.speakText('Far! Dure! That mountain is very far away!', { lang: 'hi-IN' });
              }}
            >
              <div className="text-4xl animate-bounce opacity-60">🏔️</div>
              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-sky-600 text-white mt-2 shadow-xs">
                FAR / ᱫᱩᱨᱮ (Dure)
              </span>
            </div>
          </div>
        )}

        {/* =======================================================
            GENERAL SCENE — Bespoke Animated Worlds for All JCERT Chapters
            ======================================================= */}
        {sceneType === 'general' && (
          <div className="w-full">
            {generalVariant === 'village' && <VillageScene />}
            {generalVariant === 'sarhul' && <SarhulScene />}
            {generalVariant === 'forest' && <ForestScene />}
            {generalVariant === 'river' && <RiverScene />}
            {generalVariant === 'counting' && <CountingScene />}
            {generalVariant === 'letters' && <LettersScene />}
            {generalVariant === 'heroes' && <HeroesScene />}
            {generalVariant === 'school' && <SchoolScene />}
            {generalVariant === 'swings' && <SwingsScene />}
            {generalVariant === 'market' && <MarketScene />}
            {generalVariant === 'water' && <WaterScene />}
            {generalVariant === 'patterns_shapes' && <PatternsShapesScene />}
            {generalVariant === 'addition' && <AdditionScene />}
            {generalVariant === 'subtraction' && <SubtractionScene />}
            {generalVariant === 'multiplication' && <MultiplicationScene />}
            {generalVariant === 'clock_time' && <ClockTimeScene />}
            {generalVariant === 'measurement' && <MeasurementScene />}
            {generalVariant === 'fractions' && <FractionsScene />}
            {generalVariant === 'plants' && <PlantsScene />}
            {generalVariant === 'pond' && <PondScene />}
            {generalVariant === 'english_safari' && <EnglishSafariScene />}
            {generalVariant === 'mango_story' && <MangoStoryScene />}
          </div>
        )}
      </div>

      {/* Vocabulary Keyword Pills Row */}
      {nativeKeywords && nativeKeywords.length > 0 && (
        <div className="relative z-10 flex items-center justify-center flex-wrap gap-2 pt-2 border-t border-amber-300/80">
          {nativeKeywords.map((kw, i) => (
            <button
              key={i}
              onClick={() => {
                sound.playPop();
                sound.speakText(`${kw.transliteration}. Hindi me: ${kw.hindi}. English: ${kw.english}.`, {
                  lang: 'hi-IN',
                  pitch: 1.2,
                });
              }}
              className="bg-white/95 hover:bg-amber-100 text-amber-950 px-3 py-1 rounded-xl text-xs font-black border border-amber-300 shadow-xs flex items-center gap-1.5 transition-colors press-bounce"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-700" />
              <span>{kw.native}</span>
              <span className="text-amber-700 opacity-90">({kw.transliteration} = {kw.hindi})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

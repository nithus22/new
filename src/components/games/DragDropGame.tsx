import React, { useState } from 'react';
import { Sparkles, CheckCircle2, RotateCcw, Volume2 } from 'lucide-react';
import { DragItem } from '../../types';
import { sound } from '../../utils/audio';
import { validateDragPlacement } from '../../utils/gameLogic';

interface DragDropGameProps {
  instruction: {
    native: string;
    transliteration: string;
    hindi: string;
    english: string;
  };
  zones: Array<{
    id: string;
    label: {
      native: string;
      transliteration: string;
      hindi: string;
      english: string;
    };
    color: string;
  }>;
  items: DragItem[];
  onComplete: (score: number) => void;
}

export const DragDropGame: React.FC<DragDropGameProps> = ({
  instruction,
  zones,
  items,
  onComplete,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [placedItems, setPlacedItems] = useState<Record<string, string>>({}); // itemId -> zoneId
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  // Available items not yet placed
  const unplacedItems = items.filter((item) => !placedItems[item.id]);

  const handleSelectItem = (item: DragItem) => {
    sound.playPop();
    setSelectedItemId(item.id);
    setErrorFeedback(null);
    sound.speakText(`${item.name.transliteration}. Hindi me: ${item.name.hindi}`, {
      lang: 'hi-IN',
      pitch: 1.2,
    });
  };

  const handlePlaceInZone = (zoneId: string) => {
    if (!selectedItemId) return;
    const isValid = validateDragPlacement(selectedItemId, zoneId, items);

    if (isValid) {
      sound.playCorrect();
      const newPlaced = { ...placedItems, [selectedItemId]: zoneId };
      setPlacedItems(newPlaced);
      setSelectedItemId(null);
      setErrorFeedback(null);

      // Check if all placed
      if (Object.keys(newPlaced).length === items.length) {
        setIsDone(true);
        sound.playCelebration();
        onComplete(items.length);
      }
    } else {
      sound.playBoing();
      setErrorFeedback('Try again! ᱟᱨ ᱢᱤᱫ ᱫᱷᱟᱣ ᱪᱮᱥᱴᱟᱭ ᱢᱮ! / फिर से कोशिश करो!');
      setTimeout(() => setErrorFeedback(null), 2000);
    }
  };

  const handleReset = () => {
    sound.playPop();
    setPlacedItems({});
    setSelectedItemId(null);
    setIsDone(false);
    setErrorFeedback(null);
  };

  return (
    <div className="space-y-6">
      {/* Instruction Card */}
      <div className="bg-amber-100 rounded-3xl p-4 border-2 border-amber-300 text-center space-y-1">
        <p className="text-base sm:text-lg font-black text-amber-950">
          {instruction.native}
        </p>
        <p className="text-xs sm:text-sm font-bold text-amber-800">
          {instruction.transliteration} • {instruction.hindi}
        </p>
      </div>

      {errorFeedback && (
        <div className="bg-red-100 border-2 border-red-400 text-red-900 font-extrabold text-sm py-2 px-4 rounded-2xl text-center animate-wiggle">
          {errorFeedback}
        </div>
      )}

      {/* Target Drop Zones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {zones.map((zone) => {
          const itemsInZone = items.filter((it) => placedItems[it.id] === zone.id);
          const isTargeted = selectedItemId !== null;

          return (
            <div
              key={zone.id}
              onClick={() => handlePlaceInZone(zone.id)}
              className={`min-h-[160px] rounded-3xl p-4 border-4 transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                isTargeted
                  ? 'border-dashed border-amber-500 bg-amber-50 hover:bg-amber-100 ring-2 ring-amber-300'
                  : 'border-solid border-amber-300 bg-white/90'
              }`}
              role="button"
              tabIndex={0}
              aria-label={`Zone ${zone.label.native}`}
            >
              <div className="flex items-center justify-between border-b pb-2 border-amber-200">
                <div>
                  <h4 className="text-lg font-black text-amber-950">
                    {zone.label.native}
                  </h4>
                  <p className="text-xs font-bold text-slate-600">
                    {zone.label.hindi} ({zone.label.english})
                  </p>
                </div>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  {itemsInZone.length} items
                </span>
              </div>

              {/* Items in this zone */}
              <div className="flex flex-wrap gap-2 my-2 min-h-[60px] items-center">
                {itemsInZone.length === 0 ? (
                  <p className="text-xs text-slate-400 font-bold italic w-full text-center">
                    {selectedItemId ? '👉 Tap here to place!' : 'Drop items here'}
                  </p>
                ) : (
                  itemsInZone.map((it) => (
                    <div
                      key={it.id}
                      className="bg-emerald-100 border-2 border-emerald-400 text-emerald-950 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-xs animate-fade-in"
                    >
                      <span className="text-2xl">{it.emoji}</span>
                      <span className="text-xs font-black">{it.name.native}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                  ))
                )}
              </div>

              <div className="text-[11px] font-bold text-amber-800 text-right">
                Zone: {zone.label.transliteration}
              </div>
            </div>
          );
        })}
      </div>

      {/* Items to Pick */}
      {!isDone && (
        <div className="bg-white/90 rounded-3xl p-4 border-2 border-amber-300 shadow-sm space-y-2">
          <p className="text-xs font-black uppercase text-amber-900 tracking-wider">
            1. Tap an item below, then 2. Tap the correct zone above:
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            {unplacedItems.map((item) => {
              const isSelected = selectedItemId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={`px-4 py-3 rounded-2xl border-3 font-black text-sm flex items-center gap-2 shadow-md press-bounce transition-all ${
                    isSelected
                      ? 'bg-amber-400 text-amber-950 border-amber-600 scale-105 ring-4 ring-amber-300'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                  }`}
                  aria-label={`Select item ${item.name.native}`}
                >
                  <span className="text-3xl">{item.emoji}</span>
                  <div className="text-left">
                    <p className="text-sm font-black leading-tight">{item.name.native}</p>
                    <p className="text-[11px] font-bold text-amber-800">{item.name.transliteration}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Completion Banner */}
      {isDone && (
        <div className="bg-emerald-100 border-4 border-emerald-400 rounded-3xl p-6 text-center space-y-3 animate-bounce">
          <div className="text-5xl">🎉 ⭐ 🏆</div>
          <h3 className="text-2xl font-black text-emerald-950">
            ᱥᱟᱹᱨᱤ ᱜᱮ ᱟᱹᱰᱤ ᱱᱟᱯᱟᱭ! (Very Good Job!)
          </h3>
          <p className="text-sm font-bold text-emerald-800">
            You placed all items inside and outside correctly! You earned 3 stars!
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

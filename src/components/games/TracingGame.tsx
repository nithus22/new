import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, CheckCircle2, Sparkles, Volume2 } from 'lucide-react';
import { sound } from '../../utils/audio';

interface TracingGameProps {
  tracingData: {
    letter: string;
    letterName: string;
    script: string;
    sound: string;
    strokeGuide: string;
  };
  onComplete: (score: number) => void;
}

export const TracingGame: React.FC<TracingGameProps> = ({
  tracingData,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokesDrawn, setStrokesDrawn] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    drawBackgroundGuide();
  }, [tracingData]);

  const drawBackgroundGuide = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background guide grid
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Draw large transparent dotted letter as stencil
    ctx.setLineDash([]);
    ctx.font = 'bold 150px "Noto Sans Ol Chiki", "Noto Sans Warang Chiti", "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fef3c7';
    ctx.fillText(tracingData.letter, canvas.width / 2, canvas.height / 2 + 10);

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#d97706';
    ctx.setLineDash([6, 6]);
    ctx.strokeText(tracingData.letter, canvas.width / 2, canvas.height / 2 + 10);
    ctx.setLineDash([]);
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    sound.playPop();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 16;
    ctx.strokeStyle = '#2563eb'; // Bright engaging blue chalk
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setStrokesDrawn((prev) => prev + 1);
  };

  const stopDraw = () => {
    if (isDrawing) {
      setIsDrawing(false);
      if (strokesDrawn > 20 && !isCompleted) {
        setIsCompleted(true);
        sound.playCorrect();
        sound.speakText(`Excellent! You traced ${tracingData.letterName}!`, { lang: 'hi-IN' });
        onComplete(1);
      }
    }
  };

  const handleClear = () => {
    sound.playPop();
    setStrokesDrawn(0);
    setIsCompleted(false);
    drawBackgroundGuide();
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-amber-100 rounded-3xl p-4 border-2 border-amber-300 text-center space-y-1">
        <p className="text-base sm:text-lg font-black text-amber-950">
          Trace the letter: {tracingData.letterName}
        </p>
        <p className="text-xs sm:text-sm font-bold text-amber-800">
          {tracingData.strokeGuide} • Sound: "{tracingData.sound}"
        </p>
      </div>

      {/* Tracing Board Canvas */}
      <div className="flex flex-col items-center">
        <div className="relative rounded-3xl overflow-hidden border-4 border-amber-400 bg-amber-50 shadow-xl touch-none">
          <canvas
            ref={canvasRef}
            width={320}
            height={320}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
            className="cursor-crosshair bg-white"
          />

          {/* Stroke hint */}
          <div className="absolute top-2 left-2 bg-amber-200/90 text-amber-950 text-[11px] font-black px-2 py-0.5 rounded-md">
            ✍️ Trace with finger or mouse
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleClear}
            className="px-4 py-2 rounded-2xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-xs shadow-xs press-bounce flex items-center gap-1.5 border border-amber-400"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear / ᱥᱟᱯᱷᱟᱭ ᱢᱮ</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              sound.speakText(tracingData.sound, { lang: 'hi-IN', pitch: 1.3 });
            }}
            className="px-4 py-2 rounded-2xl bg-sky-200 hover:bg-sky-300 text-sky-950 font-bold text-xs shadow-xs press-bounce flex items-center gap-1.5 border border-sky-400"
          >
            <Volume2 className="w-4 h-4" />
            <span>Hear Sound</span>
          </button>
        </div>
      </div>

      {isCompleted && (
        <div className="bg-emerald-100 border-4 border-emerald-400 rounded-3xl p-6 text-center space-y-3 animate-bounce">
          <div className="text-5xl">✍️ ⭐ 🌟</div>
          <h3 className="text-2xl font-black text-emerald-950">
            ᱥᱟᱹᱨᱤ ᱜᱮ ᱱᱟᱯᱟᱭ! (Great Letter Tracing!)
          </h3>
          <p className="text-sm font-bold text-emerald-800">
            You mastered tracing the {tracingData.script} letter!
          </p>
        </div>
      )}
    </div>
  );
};

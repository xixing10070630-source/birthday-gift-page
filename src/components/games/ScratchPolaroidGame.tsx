import React, { useEffect, useRef, useState } from 'react';
import { Eye, RotateCcw } from 'lucide-react';
import { SCRATCH_CARDS, ScratchCardItem } from '../../data/birthdayData';
import { ResilientImage } from '../ChiikawaMascots';
import { birthdaySound } from '../../utils/sound';

function SingleScratchCard({ item }: { item: ScratchCardItem }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const [percent, setPercent] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const initCoating = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 450;

    // Soft silver-blush Korean foil coating
    const grad = ctx.createLinearGradient(0, 0, 300, 450);
    grad.addColorStop(0, '#F3E5EC');
    grad.addColorStop(0.5, '#E4EEF8');
    grad.addColorStop(1, '#F5EBDC');
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 300, 450);

    // Subtle polka dot foil pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let x = 22; x < 300; x += 38) {
      for (let y = 24; y < 450; y += 40) {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = '#6F6672';
    ctx.font = '600 15px "Plus Jakarta Sans", "Noto Sans SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('用手指或鼠标轻轻刮开显影', 150, 215);
    ctx.font = '400 12px "Plus Jakarta Sans", "Noto Sans SC", sans-serif';
    ctx.fillText(item.label, 150, 240);

    setPercent(0);
    setRevealed(false);
  };

  useEffect(() => {
    initCoating();
  }, [item.id]);

  const computeScratchedPercent = () => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let cleared = 0;
    const stride = 16; // sample every 4th pixel for fast performance
    let totalSampled = 0;
    for (let i = 3; i < pixels.length; i += stride) {
      totalSampled += 1;
      if (pixels[i] === 0) cleared += 1;
    }
    return Math.round((cleared / totalSampled) * 100);
  };

  const scratchAt = (clientX: number, clientY: number) => {
    if (revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();

    const p = computeScratchedPercent();
    setPercent(p);
    if (p >= 52 && !revealed) {
      revealAll();
    }
  };

  const revealAll = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setPercent(100);
    setRevealed(true);
    birthdaySound.playScratchReveal();
  };

  return (
    <div className="bg-white rounded-3xl border border-[rgba(46,40,48,0.08)] shadow-[0_8px_30px_rgba(46,40,48,0.04)] p-4 flex flex-col justify-between space-y-4">
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#EFE8DF]">
        <ResilientImage
          src={item.imageUrl}
          alt={item.title}
          fallbackTitle={item.title}
          className="w-full h-full object-contain"
        />

        <canvas
          ref={canvasRef}
          onPointerDown={(e) => {
            isDrawingRef.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            scratchAt(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (!isDrawingRef.current) return;
            scratchAt(e.clientX, e.clientY);
          }}
          onPointerUp={() => {
            isDrawingRef.current = false;
          }}
          onPointerCancel={() => {
            isDrawingRef.current = false;
          }}
          className={`absolute inset-0 w-full h-full touch-none cursor-crosshair transition-opacity duration-300 ${
            revealed ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        />
      </div>

      <div className="space-y-2 px-1">
        <div className="flex items-center justify-between text-xs text-[#6F6672]">
          <span>{item.label}</span>
          <span className="font-mono-num">{percent}% 显影</span>
        </div>

        <h4 className="font-display text-lg font-semibold text-[#2E2830]">
          {revealed ? item.title : '刮开涂层解锁隐藏底片'}
        </h4>

        <p className="text-xs sm:text-sm text-[#5E5560] leading-relaxed min-h-[2.75rem]">
          {revealed ? item.secretNote : '刮开 52% 以上就会自动全部显影，揭晓里面的小心意。'}
        </p>

        <div className="pt-2.5 flex items-center gap-2">
          {!revealed ? (
            <button
              type="button"
              onClick={revealAll}
              className="kr-btn kr-btn-blush px-4 py-2 text-xs font-medium"
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span>一键显影</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={initCoating}
              className="kr-btn kr-btn-cream px-4 py-2 text-xs font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>再刮一次</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ScratchPolaroidGame() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {SCRATCH_CARDS.map((card) => (
        <SingleScratchCard key={card.id} item={card} />
      ))}
    </div>
  );
}

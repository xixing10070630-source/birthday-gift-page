import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, MailOpen, RotateCcw } from 'lucide-react';
import { ASSETS } from '../data/birthdayData';
import { MascotUsagi } from './ChiikawaMascots';
import { birthdaySound } from '../utils/sound';

const SKY_BLESSINGS = [
  '财运发发发',
  '在意的人都在身边',
  '喜欢的事慢慢实现',
  '事业发发发',
  '平安，也自由',
  '21 岁依然闪闪发光',
];

interface SkyFireworksTabProps {
  onGoToLetter: () => void;
}

type FloatingBless = {
  id: number;
  x: number;
  y: number;
  text: string;
  life: number;
};

export function SkyFireworksTab({ onGoToLetter }: SkyFireworksTabProps) {
  const [replaySeed, setReplaySeed] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [readyForLetter, setReadyForLetter] = useState(false);
  const [floatingBlessings, setFloatingBlessings] = useState<FloatingBless[]>([]);

  const fireworkCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const triggerCustomBurstRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setRevealedCount(0);
    setReadyForLetter(false);
    setFloatingBlessings([]);
    birthdaySound.playCelebrate();

    const canvas = fireworkCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth || 840;
    canvas.height = canvas.offsetHeight || 520;

    interface Rocket {
      x: number;
      y: number;
      targetY: number;
      vy: number;
      color: string;
      wishIndex: number | null;
    }

    interface Spark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      decay: number;
      radius: number;
      color: string;
    }

    const rockets: Rocket[] = [];
    const sparks: Spark[] = [];
    const palette = ['#FDE68A', '#F9C6D3', '#93C5FD', '#A7F3D0', '#FDBA74', '#FFFFFF'];

    // 在爆炸坐标生成漂浮祝福文字
    const showBlessingAt = (bxRatio: number, byRatio: number, text: string) => {
      setFloatingBlessings(prev => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          x: bxRatio,
          y: byRatio,
          text,
          life: 1
        }
      ]);
    };

    const explodeAt = (bx: number, by: number, primaryColor: string) => {
      const outerCount = 54;
      for (let i = 0; i < outerCount; i++) {
        const angle = (Math.PI * 2 * i) / outerCount + (Math.random() - 0.5) * 0.12;
        const speed = 2.6 + Math.random() * 3.4;
        sparks.push({
          x: bx,
          y: by,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.011 + Math.random() * 0.006,
          radius: 2.2 + Math.random() * 1.4,
          color: i % 3 === 0 ? '#FFFFFF' : primaryColor,
        });
      }
      const innerCount = 26;
      const secondaryColor = palette[Math.floor(Math.random() * palette.length)];
      for (let i = 0; i < innerCount; i++) {
        const angle = (Math.PI * 2 * i) / innerCount + Math.random() * 0.2;
        const speed = 1.1 + Math.random() * 1.6;
        sparks.push({
          x: bx,
          y: by,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.014 + Math.random() * 0.005,
          radius: 1.8 + Math.random() * 1.1,
          color: secondaryColor,
        });
      }
    };

    const launchRocket = (xRatio: number, yRatio: number, color: string, wishIndex: number | null) => {
      const w = canvas.width;
      const h = canvas.height;
      rockets.push({
        x: w * xRatio,
        y: h + 10,
        targetY: h * yRatio,
        vy: -(6.8 + Math.random() * 1.4),
        color,
        wishIndex,
      });
    };

    const choreoTargets: Array<{ x: number; y: number; delay: number }> = [
      { x: 0.24, y: 0.26, delay: 150 },
      { x: 0.74, y: 0.24, delay: 850 },
      { x: 0.34, y: 0.38, delay: 1550 },
      { x: 0.68, y: 0.40, delay: 2250 },
      { x: 0.28, y: 0.54, delay: 2950 },
      { x: 0.72, y: 0.52, delay: 3650 },
    ];

    const timers: number[] = [];
    choreoTargets.forEach((t, idx) => {
      const id = window.setTimeout(() => {
        launchRocket(t.x, t.y, palette[idx % palette.length], idx + 1);
      }, t.delay);
      timers.push(id);
    });

    const finishTimer = window.setTimeout(() => {
      setReadyForLetter(true);
    }, 4550);
    timers.push(finishTimer);

    const ambientInterval = window.setInterval(() => {
      const rx = 0.16 + Math.random() * 0.68;
      const ry = 0.18 + Math.random() * 0.36;
      const color = palette[Math.floor(Math.random() * palette.length)];
      launchRocket(rx, ry, color, null);
    }, 1450);
    timers.push(ambientInterval);

    const blessingFloat = window.setInterval(() => {
      setFloatingBlessings(prev =>
        prev
          .map(b => ({
            ...b,
            y: b.y - 0.0035,
            life: b.life - 0.011
          }))
          .filter(b => b.life > 0)
      );
    }, 60);
    timers.push(blessingFloat);

    triggerCustomBurstRef.current = () => {
      const rx = 0.18 + Math.random() * 0.64;
      const ry = 0.16 + Math.random() * 0.34;
      const color = palette[Math.floor(Math.random() * palette.length)];
      launchRocket(rx, ry, color, null);
    };

    let animId = 0;
    const render = () => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;
        r.vy *= 0.988;

        ctx.save();
        ctx.fillStyle = '#FFFBEB';
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = r.color;
        ctx.globalAlpha = 0.55;
        ctx.fillRect(r.x - 1.2, r.y + 2, 2.4, 14);
        ctx.restore();

        if (r.y <= r.targetY || r.vy > -1.4) {
          explodeAt(r.x, r.y, r.color);
          if (r.wishIndex !== null) {
            const nextCount = r.wishIndex;
            birthdaySound.playFlip();
            setRevealedCount((prev) => Math.max(prev, nextCount));
            const blessIndex = r.wishIndex - 1;
            if (blessIndex >= 0 && blessIndex < SKY_BLESSINGS.length) {
              // 烟花炸开瞬间，在此坐标生成文字
              showBlessingAt(r.x / canvas.width, r.y / canvas.height, SKY_BLESSINGS[blessIndex]);
            }
          }
          rockets.splice(i, 1);
        }
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.985;
        s.vy = s.vy * 0.985 + 0.042;
        s.life -= s.decay;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    return () => {
      timers.forEach((id) => clearTimeout(id));
      clearInterval(ambientInterval);
      clearInterval(blessingFloat);
      cancelAnimationFrame(animId);
    };
  }, [replaySeed]);

  return (
    <div
      className="relative rounded-3xl overflow-hidden border border-[rgba(39,45,56,0.08)] shadow-[0_12px_36px_rgba(39,45,56,0.05)] p-5 sm:p-10 mb-12 bg-cover bg-center"
      style={{ backgroundImage: `url(${ASSETS.realChiikawaSky})` }}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-[#FFFDF9]/74 backdrop-blur-[1px]" />

      <div className="relative z-10 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs sm:text-sm font-medium text-[#5A799B] mb-1">
              愿望升空烟花 · 每一朵烟花都在点亮新的祝福
            </p>
            <h1 className="font-display text-2xl sm:text-4xl font-semibold text-[#272D38]">
              21 岁的愿望正在升起
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setReplaySeed((s) => s + 1)}
            className="kr-btn kr-btn-cream px-4 py-2 text-xs sm:text-sm font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>重放愿望烟花</span>
          </button>
        </div>

        <div className="relative min-h-[500px] rounded-3xl bg-gradient-to-b from-[#131D30] via-[#192740] to-[#213352] text-white border border-[rgba(255,255,255,0.1)] shadow-xl p-6 sm:p-10 flex flex-col items-center justify-center text-center overflow-hidden">
          <canvas
            ref={fireworkCanvasRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 w-full h-full"
          />

          {/*漂浮祝福文字，无卡片无方框，爆炸点生成*/}
          <div className="pointer-events-none absolute inset-0">
            {floatingBlessings.map((b) => (
              <div
                key={b.id}
                className="absolute whitespace-nowrap"
                style={{
                  left: `${b.x * 100}%`,
                  top: `${b.y * 100}%`,
                  transform: 'translate(-50%, -60%)',
                  color: '#FFE89A',
                  fontWeight: 700,
                  fontSize: '30px',
                  letterSpacing: '0.05em',
                  opacity: b.life,
                  textShadow: '0 0 10px rgba(255, 200, 80, 0.9), 0 2px 16px rgba(0,0,0,0.5)'
                }}
              >
                {b.text}
              </div>
            ))}
          </div>

          <div className="relative z-10 w-full max-w-2xl space-y-6 py-4">
            <p className="text-xs tracking-widest text-[#B8DFF8]">12.01 · 愿望随烟花绽放</p>

            {readyForLetter && (
              <div className="pt-4 space-y-4 animate-star-rise">
                <div className="mx-auto w-14 h-14 flex items-center justify-center">
                  <MascotUsagi className="w-14 h-14" />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    birthdaySound.playFlip();
                    onGoToLetter();
                  }}
                  className="kr-btn kr-btn-cream px-6 py-3 text-sm font-semibold"
                >
                  <MailOpen className="w-4 h-4 shrink-0" />
                  <span>最后环节：去看给你的信</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

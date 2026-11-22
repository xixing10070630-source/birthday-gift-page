import React, { useEffect, useRef, useState } from 'react';
import { Heart, Play, RotateCcw, Star, Trophy } from 'lucide-react';
import { GAME_MEMORY_CARDS, GameMemoryCard } from '../../data/birthdayData';
import { MascotChiikawa, ResilientImage } from '../ChiikawaMascots';
import { birthdaySound } from '../../utils/sound';

type GameState = 'TITLE_MENU' | 'PLAYING' | 'MEMORY_MODAL' | 'GAME_OVER';

interface FallingItem {
  id: number;
  x: number;
  y: number;
  speed: number;
  kind: 'cake' | 'gift' | 'memory' | 'cloud';
}

interface BgStar {
  x: number;
  y: number;
  r: number;
  speed: number;
  alpha: number;
}

const ARENA_W = 680;
const ARENA_H = 420;
const PLAYER_W = 68;
const ROUND_SECONDS = 35;

export function CatchGiftsGame() {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('yyl_catch_best_v2') || 0);
    } catch {
      return 0;
    }
  });
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [activeMemory, setActiveMemory] = useState<GameMemoryCard | null>(null);
  const [unlockedMemoryIds, setUnlockedMemoryIds] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerXRef = useRef(ARENA_W / 2);
  const itemsRef = useRef<FallingItem[]>([]);
  const bgStarsRef = useRef<BgStar[]>([]);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const timeLeftRef = useRef(ROUND_SECONDS);
  const pausedRef = useRef(false);
  const memoryIndexRef = useRef(0);
  const keysRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const spawnCounterRef = useRef(0);

  const stopAllLoops = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    // Initialize starry sky dots
    bgStarsRef.current = Array.from({ length: 58 }, () => ({
      x: Math.random() * ARENA_W,
      y: Math.random() * ARENA_H,
      r: 0.8 + Math.random() * 1.8,
      speed: 0.25 + Math.random() * 0.6,
      alpha: 0.35 + Math.random() * 0.6,
    }));
    return () => stopAllLoops();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const finishRound = () => {
    stopAllLoops();
    pausedRef.current = false;
    const finalScore = scoreRef.current;
    setGameState('GAME_OVER');
    if (finalScore > bestScore) {
      setBestScore(finalScore);
      try {
        localStorage.setItem('yyl_catch_best_v2', String(finalScore));
      } catch {
        // ignore
      }
    }
    birthdaySound.playCelebrate();
  };

  const startLoopAndTimer = () => {
    stopAllLoops();

    timerRef.current = window.setInterval(() => {
      if (pausedRef.current) return;
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        finishRound();
      }
    }, 1000);

    const drawItem = (ctx: CanvasRenderingContext2D, item: FallingItem) => {
      ctx.save();
      ctx.translate(item.x, item.y);
      if (item.kind === 'cake') {
        ctx.fillStyle = '#FFE4EC';
        ctx.strokeStyle = '#332520';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-13, -9, 26, 20, 5);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#E86A8D';
        ctx.beginPath();
        ctx.arc(0, -11, 5.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (item.kind === 'gift') {
        ctx.fillStyle = '#9BC8EE';
        ctx.strokeStyle = '#332520';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-13, -11, 26, 22, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#F79BB4';
        ctx.fillRect(-3, -11, 6, 22);
        ctx.fillRect(-13, -2, 26, 5);
      } else if (item.kind === 'memory') {
        // Glowing golden milestone star that triggers memory photo card (like the video!)
        ctx.fillStyle = 'rgba(253, 230, 138, 0.28)';
        ctx.beginPath();
        ctx.arc(0, 0, 21, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FDE047';
        ctx.strokeStyle = '#332520';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const outerA = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const innerA = outerA + Math.PI / 5;
          const ox = Math.cos(outerA) * 14;
          const oy = Math.sin(outerA) * 14;
          const ix = Math.cos(innerA) * 6.5;
          const iy = Math.sin(innerA) * 6.5;
          if (i === 0) ctx.moveTo(ox, oy);
          else ctx.lineTo(ox, oy);
          ctx.lineTo(ix, iy);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        // Storm cloud obstacle
        ctx.fillStyle = '#64748B';
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-7, 2, 9, 0, Math.PI * 2);
        ctx.arc(7, 2, 9, 0, Math.PI * 2);
        ctx.arc(0, -4, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawChiikawaPlayer = (ctx: CanvasRenderingContext2D, cx: number) => {
      const cy = ARENA_H - 36;
      ctx.save();
      ctx.translate(cx, cy);

      // Small triangular glider / star pad under Chiikawa (echoing the video's bottom catcher!)
      ctx.fillStyle = 'rgba(184, 223, 248, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 18, 30, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tiny authentic Chiikawa ears
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#332520';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(-16, -16, 5.5, 0, Math.PI * 2);
      ctx.arc(16, -16, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Round body
      ctx.beginPath();
      ctx.ellipse(0, 0, 26, 21, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pink cheeks
      ctx.fillStyle = '#F8A8B8';
      ctx.beginPath();
      ctx.ellipse(-15, 3, 5, 3, 0, 0, Math.PI * 2);
      ctx.ellipse(15, 3, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glossy eyes
      ctx.fillStyle = '#332520';
      ctx.beginPath();
      ctx.arc(-8, -3, 3.2, 0, Math.PI * 2);
      ctx.arc(8, -3, 3.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-8.6, -4, 1.2, 0, Math.PI * 2);
      ctx.arc(7.4, -4, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Tiny 'w' smile
      ctx.strokeStyle = '#332520';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-4, 2);
      ctx.quadraticCurveTo(-2, 5, 0, 2);
      ctx.quadraticCurveTo(2, 5, 4, 2);
      ctx.stroke();

      ctx.restore();
    };

    const loop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Deep starry night sky gradient matching the video
      const grad = ctx.createLinearGradient(0, 0, 0, ARENA_H);
      grad.addColorStop(0, '#091A34');
      grad.addColorStop(1, '#1A3B69');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, ARENA_W, ARENA_H);

      // Drifting twinkling stars
      for (const s of bgStarsRef.current) {
        if (!pausedRef.current) {
          s.y += s.speed;
          if (s.y > ARENA_H) {
            s.y = -2;
            s.x = Math.random() * ARENA_W;
          }
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!pausedRef.current) {
        if (keysRef.current.left) {
          playerXRef.current = Math.max(PLAYER_W / 2 + 8, playerXRef.current - 7.5);
        }
        if (keysRef.current.right) {
          playerXRef.current = Math.min(ARENA_W - PLAYER_W / 2 - 8, playerXRef.current + 7.5);
        }

        spawnCounterRef.current += 1;
        if (spawnCounterRef.current % 25 === 0) {
          const roll = Math.random();
          const kind: FallingItem['kind'] =
            roll < 0.36 ? 'cake' : roll < 0.66 ? 'gift' : roll < 0.84 ? 'memory' : 'cloud';
          itemsRef.current.push({
            id: Date.now() + Math.random(),
            x: 28 + Math.random() * (ARENA_W - 56),
            y: -18,
            speed: 2.5 + Math.random() * 2.1,
            kind,
          });
        }

        const nextItems: FallingItem[] = [];
        for (const item of itemsRef.current) {
          item.y += item.speed;

          const hitX = Math.abs(item.x - playerXRef.current) < PLAYER_W / 2 + 10;
          const hitY = item.y >= ARENA_H - 58 && item.y <= ARENA_H - 12;

          if (hitX && hitY) {
            if (item.kind === 'cloud') {
              birthdaySound.playCatchOops();
              livesRef.current -= 1;
              setLives(livesRef.current);
              if (livesRef.current <= 0) {
                finishRound();
                return;
              }
            } else if (item.kind === 'memory') {
              birthdaySound.playGachaPop();
              scoreRef.current += 35;
              setScore(scoreRef.current);

              const card = GAME_MEMORY_CARDS[memoryIndexRef.current % GAME_MEMORY_CARDS.length];
              memoryIndexRef.current += 1;
              setUnlockedMemoryIds((prev) => (prev.includes(card.id) ? prev : [...prev, card.id]));
              setActiveMemory(card);
              pausedRef.current = true;
              setGameState('MEMORY_MODAL');
            } else {
              birthdaySound.playCatchGood();
              scoreRef.current += item.kind === 'cake' ? 15 : 25;
              setScore(scoreRef.current);
            }
            continue;
          }

          if (item.y < ARENA_H + 24) {
            nextItems.push(item);
          }
        }
        itemsRef.current = nextItems;
      }

      for (const item of itemsRef.current) {
        drawItem(ctx, item);
      }
      drawChiikawaPlayer(ctx, playerXRef.current);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  };

  const startGame = () => {
    playerXRef.current = ARENA_W / 2;
    itemsRef.current = [];
    scoreRef.current = 0;
    livesRef.current = 3;
    timeLeftRef.current = ROUND_SECONDS;
    pausedRef.current = false;
    spawnCounterRef.current = 0;

    setScore(0);
    setLives(3);
    setTimeLeft(ROUND_SECONDS);
    setActiveMemory(null);
    setGameState('PLAYING');
    startLoopAndTimer();
  };

  const handleContinueAfterMemory = () => {
    setActiveMemory(null);
    pausedRef.current = false;
    setGameState('PLAYING');
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'PLAYING') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = ARENA_W / rect.width;
    const x = (e.clientX - rect.left) * scaleX;
    playerXRef.current = Math.max(PLAYER_W / 2 + 6, Math.min(ARENA_W - PLAYER_W / 2 - 6, x));
  };

  return (
    <div className="bg-white/95 rounded-3xl border border-[rgba(39,45,56,0.08)] shadow-[0_10px_30px_rgba(39,45,56,0.05)] p-5 sm:p-8 space-y-5">
      {/* Unobtrusive Top HUD */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[rgba(39,45,56,0.08)]">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-[#687182]">当前得分</p>
            <p className="font-mono-num text-xl font-semibold text-[#272D38]">{score}</p>
          </div>
          <div>
            <p className="text-xs text-[#687182]">剩余时间</p>
            <p className="font-mono-num text-xl font-semibold text-[#C94A6D]">{timeLeft}s</p>
          </div>
          <div>
            <p className="text-xs text-[#687182]">回忆彩蛋</p>
            <p className="font-mono-num text-xl font-semibold text-[#5A799B]">
              {unlockedMemoryIds.length} / {GAME_MEMORY_CARDS.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#687182]">生命值</p>
            <div className="flex items-center gap-1 pt-0.5" aria-label={`剩余 ${lives} 颗爱心`}>
              {[0, 1, 2].map((idx) => (
                <Heart
                  key={idx}
                  className={`w-4 h-4 ${
                    idx < lives ? 'fill-[#E86A8D] text-[#E86A8D]' : 'text-[#D8D0D8]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#687182]">
          <Trophy className="w-4 h-4 text-[#E7B854]" />
          <span>最高记录:</span>
          <span className="font-mono-num font-semibold text-[#272D38]">{bestScore}</span>
        </div>
      </div>

      {/* Starry Night Sky Play Arena (echoing the video!) */}
      <div className="relative rounded-2xl overflow-hidden border border-[rgba(39,45,56,0.14)] bg-[#091A34] max-w-3xl mx-auto">
        <canvas
          ref={canvasRef}
          width={ARENA_W}
          height={ARENA_H}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          className="w-full h-auto block touch-none cursor-ew-resize"
        />

        {/* Authentic Chiikawa corner reaction sticker (matching the bottom-left sticker in her video) */}
        <div className="pointer-events-none absolute left-3 bottom-3 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/90 border-2 border-[#332520] shadow-md flex items-center justify-center">
          <MascotChiikawa className="w-12 h-12 sm:w-14 sm:h-14" />
        </div>

        {gameState === 'TITLE_MENU' && (
          <div className="absolute inset-0 bg-[#0D213F]/90 backdrop-blur-xs text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-[#332520] flex items-center justify-center">
              <MascotChiikawa className="w-14 h-14" />
            </div>
            <h3 className="font-display text-2xl font-semibold">
              星空下的 Chiikawa 接礼物
            </h3>
            <p className="text-sm text-slate-200 max-w-md leading-relaxed">
              拖动屏幕、移动鼠标或按左右方向键控制吉伊，接住星空里掉落的草莓蛋糕、礼物盒和闪闪发光的「回忆星星」（可解锁照片彩蛋），躲开小乌云！
            </p>
            <button
              type="button"
              onClick={startGame}
              className="kr-btn kr-btn-blush px-6 py-3 text-sm font-semibold"
            >
              <Play className="w-4 h-4 shrink-0" />
              <span>开始接礼物</span>
            </button>
          </div>
        )}

        {/* White Milestone Memory Card Popup (matching 00:08 in her video!) */}
        {gameState === 'MEMORY_MODAL' && activeMemory && (
          <div className="absolute inset-0 bg-[#091A34]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="w-full max-w-sm max-h-full overflow-y-auto bg-white rounded-2xl border border-[rgba(39,45,56,0.12)] shadow-2xl p-4 sm:p-5 text-center space-y-2.5">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FEF3C7] text-[#D97706] mx-auto">
                <Star className="w-4 h-4 fill-[#F59E0B]" />
              </div>
              <p className="text-xs font-mono-num text-[#687182]">{activeMemory.dateLabel}</p>
              <h4 className="font-display text-lg font-semibold text-[#272D38]">
                {activeMemory.title}
              </h4>
              <div className="rounded-xl overflow-hidden border border-[rgba(39,45,56,0.08)] h-52 sm:h-56 bg-[#FAF6F0]">
                <ResilientImage
                  src={activeMemory.imageUrl}
                  alt={activeMemory.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-xs sm:text-sm text-[#475366] leading-relaxed">
                {activeMemory.note}
              </p>
              <button
                type="button"
                onClick={handleContinueAfterMemory}
                className="kr-btn kr-btn-cocoa w-full py-2.5 text-sm font-medium"
              >
                收下回忆 · 继续游戏
              </button>
            </div>
          </div>
        )}

        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-[#0D213F]/92 backdrop-blur-xs text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
            <h3 className="font-display text-2xl font-semibold">
              本局接住 <span className="font-mono-num text-[#FDE047]">{score}</span> 分礼物
            </h3>
            <p className="text-sm text-slate-200 max-w-sm leading-relaxed">
              成功解锁了 {unlockedMemoryIds.length} / {GAME_MEMORY_CARDS.length} 张星空回忆彩蛋！
            </p>
            <button
              type="button"
              onClick={startGame}
              className="kr-btn kr-btn-blush px-6 py-3 text-sm font-semibold"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span>再玩一次</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

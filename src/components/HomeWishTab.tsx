import React, { useEffect, useRef, useState } from 'react';
import { Flame, MailOpen, Mic, MicOff, RotateCcw, Send, Wind } from 'lucide-react';
import { ASSETS } from '../data/birthdayData';
import { MascotChiikawa, MascotHachiware, MascotUsagi } from './ChiikawaMascots';
import { birthdaySound } from '../utils/sound';
import { TabKey } from './TopBar';

export type HomeStage = 'envelope' | 'cover' | 'candle';
type EnvelopePhase = 'sealed' | 'unsealing' | 'rising';

interface HomeWishTabProps {
  onNavigate: (tab: TabKey) => void;
}

interface WishRecord {
  id: string;
  text: string;
  createdAt: string;
}

const WISH_STORAGE_KEY = 'yyl_birthday_wishes_v1';

export function HomeWishTab({ onNavigate }: HomeWishTabProps) {
  const [stage, setStage] = useState<HomeStage>('envelope');
  const [envelopePhase, setEnvelopePhase] = useState<EnvelopePhase>('sealed');
  const [coverStep, setCoverStep] = useState(0);
  const [lightingCandle, setLightingCandle] = useState(false);
  const [candleBright, setCandleBright] = useState(false);
  const envelopeTimersRef = useRef<number[]>([]);

  const [candlesLit, setCandlesLit] = useState(true);
  const [micActive, setMicActive] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [micError, setMicError] = useState('');

  const DEFAULT_WISH_TEXT =
    '希望杨燕灵同学在新的一岁天天开心，吃嘛嘛香，永远有出发下一站的好心情和勇气！';

  const [wishText, setWishText] = useState('');
  const [wishes, setWishes] = useState<WishRecord[]>(() => {
    try {
      const saved = localStorage.getItem(WISH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as WishRecord[];
        return parsed.map((w) =>
          w.id === 'default-wish' ? { ...w, text: DEFAULT_WISH_TEXT } : w
        );
      }
    } catch {
      // ignore storage errors
    }
    return [
      {
        id: 'default-wish',
        text: DEFAULT_WISH_TEXT,
        createdAt: '12.01 零点愿望',
      },
    ];
  });

  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const blowHoldFramesRef = useRef(0);

  useEffect(() => {
    try {
      localStorage.setItem(WISH_STORAGE_KEY, JSON.stringify(wishes));
    } catch {
      // ignore storage quota errors
    }
  }, [wishes]);

  const stopMicMonitor = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setMicActive(false);
    setMicLevel(0);
    blowHoldFramesRef.current = 0;
  };

  useEffect(() => {
    return () => {
      stopMicMonitor();
      envelopeTimersRef.current.forEach((id) => clearTimeout(id));
    };
  }, []);

  // Video-paced stacked blessing reveal under "21" (00:02 -> 00:04 in video)
  useEffect(() => {
    if (stage !== 'cover') return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setCoverStep(4);
      return;
    }

    setCoverStep(1);
    const s1 = window.setTimeout(() => setCoverStep(2), 380);
    const s2 = window.setTimeout(() => setCoverStep(3), 720);
    const s3 = window.setTimeout(() => setCoverStep(4), 1120);

    return () => {
      clearTimeout(s1);
      clearTimeout(s2);
      clearTimeout(s3);
    };
  }, [stage]);

  // Click envelope once (like 00:00 in video) -> unseals ribbon -> card rises -> lands on 21 card
  const handleOpenEnvelope = () => {
    if (envelopePhase !== 'sealed') return;
    birthdaySound.playFlip();

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setStage('cover');
      setCoverStep(4);
      return;
    }

    setEnvelopePhase('unsealing');
    const t1 = window.setTimeout(() => setEnvelopePhase('rising'), 360);
    const t2 = window.setTimeout(() => setStage('cover'), 900);
    envelopeTimersRef.current = [t1, t2];
  };

  // Click "点亮蜡烛" -> striped candle on 21 card lights up with warm glow -> transitions to cake wish stage
  const handleLightCandle = () => {
    if (lightingCandle) return;
    birthdaySound.playFlip();
    setLightingCandle(true);
    setCandleBright(false);

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const t = window.setTimeout(() => {
      setLightingCandle(false);
      setCandlesLit(true);
      setStage('candle');
    }, prefersReduced ? 350 : 950);
    envelopeTimersRef.current.push(t);
  };

  // Brighten the video-style candle flame & golden room aura right after entering Stage 3 or relighting
  useEffect(() => {
    if (stage !== 'candle' || !candlesLit) {
      setCandleBright(false);
      return;
    }
    setCandleBright(false);
    const t = window.setTimeout(() => setCandleBright(true), 80);
    return () => clearTimeout(t);
  }, [stage, candlesLit]);

  const launchConfetti = () => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const colors = ['#F497B2', '#8FC5EE', '#F7D774', '#A7DFC5', '#FAD2DF'];
    const particles = Array.from({ length: 72 }, () => ({
      x: canvas.width * (0.2 + Math.random() * 0.6),
      y: canvas.height * 0.45,
      vx: (Math.random() - 0.5) * 9,
      vy: -Math.random() * 8 - 3,
      size: 5 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.25,
      life: 1,
    }));

    let frameId = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22;
        p.rot += p.vRot;
        p.life -= 0.011;
        if (p.life > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.65);
          ctx.restore();
        }
      }
      if (alive) frameId = requestAnimationFrame(render);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    frameId = requestAnimationFrame(render);
    window.setTimeout(() => cancelAnimationFrame(frameId), 3500);
  };

  const extinguishCandles = () => {
    if (!candlesLit) return;
    setCandlesLit(false);
    stopMicMonitor();
    birthdaySound.playCelebrate();
    launchConfetti();
  };

  const startMicBlowDetection = async () => {
    setMicError('');
    if (micActive) {
      stopMicMonitor();
      return;
    }
    if (!candlesLit) setCandlesLit(true);
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicError('当前浏览器暂不支持麦克风权限，可以直接点击“许好愿了 · 吹灭蜡烛”哦。');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      setMicActive(true);

      const tick = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;
        setMicLevel(Math.min(100, Math.round((avg / 95) * 100)));

        if (avg > 42) {
          blowHoldFramesRef.current += 1;
          if (blowHoldFramesRef.current >= 7) {
            extinguishCandles();
            return;
          }
        } else {
          blowHoldFramesRef.current = Math.max(0, blowHoldFramesRef.current - 1);
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setMicError('未开启麦克风权限，直接点击“许好愿了 · 吹灭蜡烛”也能完成仪式~');
      stopMicMonitor();
    }
  };

  const handleSaveWish = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = wishText.trim();
    if (!trimmed) return;
    birthdaySound.playGachaPop();
    const now = new Date();
    const timeLabel = `${now.getMonth() + 1}.${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setWishes((prev) => [{ id: `w-${Date.now()}`, text: trimmed, createdAt: timeLabel }, ...prev]);
    setWishText('');
  };

  return (
    <div
      className="relative rounded-3xl overflow-hidden border border-[rgba(39,45,56,0.08)] shadow-[0_12px_36px_rgba(39,45,56,0.05)] p-5 sm:p-8 mb-12 bg-cover bg-center"
      style={{ backgroundImage: `url(${ASSETS.realChiikawaGroup})` }}
    >
      {/* Gentle readability veil so real Chiikawa characters shine at edges */}
      <div aria-hidden="true" className="absolute inset-0 bg-[#FFFDF9]/74 backdrop-blur-[1px]" />

      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-end">
          <span className="text-xs font-medium text-[#272D38] bg-white/85 px-3 py-1 rounded-lg">
            12 月 1 日 · 杨燕灵 21 岁生日快乐
          </span>
        </div>

        {/* STAGE 1: Video-style Chiikawa Envelope (click envelope -> fast smooth unseal & rise) */}
        {stage === 'envelope' && (
          <section className="min-h-[480px] flex flex-col items-center justify-center py-6 text-center">
            <button
              type="button"
              onClick={handleOpenEnvelope}
              className="group relative w-full max-w-[430px] perspective-1000 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D96B88] cursor-pointer"
              aria-label="点击打开 Chiikawa 生日信封"
            >
              {/* Inner letter peeking & gliding smoothly out of the envelope */}
              <div className="relative mx-auto w-[84%] z-10">
                <div
                  className={`paper-card rounded-2xl border-2 border-[#332520] shadow-lg px-6 pt-5 pb-14 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    envelopePhase === 'rising'
                      ? '-translate-y-20 scale-[1.06]'
                      : envelopePhase === 'unsealing'
                      ? '-translate-y-6'
                      : 'translate-y-3 group-hover:-translate-y-1'
                  }`}
                >
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <MascotChiikawa className="w-10 h-10" />
                    <MascotHachiware className="w-10 h-10" />
                    <MascotUsagi className="w-10 h-10" />
                  </div>
                  <p className="text-xs text-[#687182] mb-0.5">致</p>
                  <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#272D38] tracking-wide mb-2.5">
                    杨燕灵
                  </h1>
                  <div className="inline-flex items-center gap-1.5 text-base font-semibold text-[#272D38]">
                    <span className="px-2.5 py-0.5 bg-[#E6EFF8] rounded shadow-2xs -rotate-2">生</span>
                    <span className="px-2.5 py-0.5 bg-[#314259] text-white rounded shadow-2xs rotate-1">日</span>
                    <span className="px-2.5 py-0.5 bg-[#F5E8CE] rounded shadow-2xs -rotate-1">快</span>
                    <span className="px-2.5 py-0.5 bg-[#FAE8EE] rounded shadow-2xs rotate-2">乐</span>
                  </div>
                </div>
              </div>

              {/* Cute Kawaii Chiikawa Pastel Envelope Pocket + Split Satin Ribbon Bow */}
              <div
                className={`relative -mt-12 z-20 rounded-[28px] bg-gradient-to-b from-[#FFF7F9] via-[#FCE6EE] to-[#F7D6E2] border-2 border-[#6A524A] shadow-[0_14px_34px_rgba(217,107,136,0.2)] px-6 pt-12 pb-7 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  envelopePhase === 'rising' ? 'translate-y-12 opacity-0 scale-95' : 'translate-y-0 opacity-100'
                }`}
              >
                {/* Soft inner stitched stationery border */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-2 rounded-[22px] border border-dashed border-[#DF9BB0]/75"
                />

                {/* Cute V-shaped pocket flap with scalloped cream lace edge & pastel polka dots */}
                <svg
                  viewBox="0 0 420 150"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M0 0 L210 92 L0 150 Z" fill="#F9DCE7" opacity="0.7" />
                  <path d="M420 0 L210 92 L420 150 Z" fill="#F5D3E0" opacity="0.7" />
                  {/* Tiny pastel dots */}
                  <circle cx="48" cy="48" r="3" fill="#FFFFFF" opacity="0.7" />
                  <circle cx="88" cy="78" r="2.5" fill="#FFFFFF" opacity="0.6" />
                  <circle cx="372" cy="48" r="3" fill="#FFFFFF" opacity="0.7" />
                  <circle cx="332" cy="78" r="2.5" fill="#FFFFFF" opacity="0.6" />
                  <circle cx="52" cy="118" r="2.5" fill="#FFFFFF" opacity="0.65" />
                  <circle cx="368" cy="118" r="2.5" fill="#FFFFFF" opacity="0.65" />
                  {/* Cream stitched V-fold */}
                  <path
                    d="M0 0 L210 92 L420 0"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0 0 L210 92 L420 0"
                    fill="none"
                    stroke="#D98BA4"
                    strokeOpacity="0.55"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                </svg>

                {/* Cute corner sparkle & heart doodles */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 28 28"
                  className="pointer-events-none absolute bottom-4 left-5 w-6 h-6 text-[#E48CA5]"
                >
                  <path
                    d="M14 23 C14 23 4 16.5 4 9.8 C4 6.5 6.6 4 9.6 4 C11.5 4 13.1 5 14 6.6 C14.9 5 16.5 4 18.4 4 C21.4 4 24 6.5 24 9.8 C24 16.5 14 23 14 23 Z"
                    fill="#F4A5BC"
                    stroke="#6A524A"
                    strokeWidth="1.4"
                  />
                </svg>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 28 28"
                  className="pointer-events-none absolute bottom-4 right-5 w-6 h-6"
                >
                  <path
                    d="M14 3 L16.8 10.5 L24.5 11.2 L18.5 16.3 L20.4 24 L14 19.7 L7.6 24 L9.5 16.3 L3.5 11.2 L11.2 10.5 Z"
                    fill="#FDE68A"
                    stroke="#6A524A"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Split horizontal baby-blue satin ribbon unfastening left & right */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-[46%] -translate-y-1/2 flex items-center justify-center px-3 z-20"
                >
                  <div
                    className={`h-4 flex-1 rounded-l-full bg-gradient-to-r from-[#C8DFF3] to-[#A9CBEB] border border-[#6A524A]/35 shadow-xs transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      envelopePhase !== 'sealed' ? '-translate-x-28 opacity-0' : 'translate-x-0 opacity-100'
                    }`}
                  />
                  <div className="w-12 shrink-0" />
                  <div
                    className={`h-4 flex-1 rounded-r-full bg-gradient-to-l from-[#C8DFF3] to-[#A9CBEB] border border-[#6A524A]/35 shadow-xs transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      envelopePhase !== 'sealed' ? 'translate-x-28 opacity-0' : 'translate-x-0 opacity-100'
                    }`}
                  />
                </div>

                {/* Center Kawaii Chiikawa Scalloped Sticker Seal + Mini Bow */}
                <div
                  className={`relative z-30 mx-auto w-20 h-20 flex items-center justify-center mb-3 transition-transform duration-400 ${
                    envelopePhase !== 'sealed' ? 'scale-110 -translate-y-2' : 'scale-100 group-hover:scale-105'
                  }`}
                >
                  {/* Little blue ribbon bow perched on top of the sticker */}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 40 24"
                    className="pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 w-9 h-5 z-20"
                  >
                    <path d="M20 12 C11 2 2 5 4 13 C6 18 14 15 20 12 Z" fill="#B5D3EE" stroke="#6A524A" strokeWidth="1.4" />
                    <path d="M20 12 C29 2 38 5 36 13 C34 18 26 15 20 12 Z" fill="#C9E1F6" stroke="#6A524A" strokeWidth="1.4" />
                    <circle cx="20" cy="12" r="3.2" fill="#E6F2FC" stroke="#6A524A" strokeWidth="1.3" />
                  </svg>

                  <div className="w-18 h-18 rounded-full bg-white border-2 border-[#6A524A] shadow-[0_4px_0_rgba(106,82,74,0.16)] flex items-center justify-center">
                    <MascotChiikawa className="w-14 h-14" />
                  </div>
                </div>

                <span className="relative z-30 mt-1 kr-btn kr-btn-cream px-5 py-1.5 text-xs font-semibold">
                  <MailOpen className="w-3.5 h-3.5 shrink-0 text-[#D96B88]" />
                  <span>{envelopePhase === 'sealed' ? '点击拆开 Chiikawa 信封' : '正在拆开...'}</span>
                </span>
              </div>
            </button>
          </section>
        )}

        {/* STAGE 2: Centered Square 21 Card matching Video Proportions, Speed & Single "点亮蜡烛" Action */}
        {stage === 'cover' && (
          <section className="min-h-[500px] flex items-center justify-center py-2">
            <div
              className="w-full max-w-[490px] mx-auto rounded-2xl border-2 border-[rgba(92,78,70,0.22)] shadow-[0_18px_42px_rgba(39,45,56,0.12)] px-6 py-7 sm:px-9 sm:py-8 flex flex-col items-center text-center relative overflow-hidden bg-cover bg-center"
              style={{ backgroundImage: "url('/assets/aistudio/____2__71206e83.jpg')" }}
            >
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#F7FCFB]/48" />

              {/* Top right 12.01 stamp matching video */}
              <div className="relative z-10 w-full flex items-center justify-between text-xs text-[#272D38]">
                <span className="px-2 py-0.5 bg-white/80 rounded font-medium font-[Verdana,sans-serif] text-[20px] leading-snug">
                  致 杨燕灵
                </span>
                <span className="font-mono-num px-2.5 py-0.5 bg-[#DCE9F5] text-[#354E69] rounded rotate-6 font-semibold shadow-2xs text-[20px] leading-snug">
                  12.01
                </span>
              </div>

              {/* 4 Letter Tiles: 生 日 快 乐 */}
              <div className="relative z-10 mt-2 inline-flex items-center gap-2 text-xl sm:text-2xl font-bold text-[#272D38]">
                <span className="px-3 py-1 bg-[#E6EFF8] rounded shadow-2xs -rotate-2">生</span>
                <span className="px-3 py-1 bg-[#314259] text-white rounded shadow-2xs rotate-1">日</span>
                <span className="px-3 py-1 bg-[#F5E8CE] rounded shadow-2xs -rotate-1">快</span>
                <span className="px-3 py-1 bg-[#FAE8EE] rounded shadow-2xs rotate-2">乐</span>
              </div>

              <p className="relative z-10 mt-2 text-[18px] leading-snug font-medium text-[#525E70] bg-white/75 px-2.5 py-0.5 rounded">
                杨燕灵
              </p>

              {/* Warm golden candlelight glow spreading across the 21 card when "点亮蜡烛" is clicked */}
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 z-20 transition-all duration-500 ease-out ${
                  lightingCandle ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                }`}
                style={{
                  background:
                    'radial-gradient(circle at 50% 42%, rgba(255, 224, 130, 0.72) 0%, rgba(253, 186, 116, 0.34) 30%, rgba(255, 247, 237, 0) 68%)',
                }}
              />

              {/* Big Hero Number 21 with blue-and-white diagonal striped birthday candle */}
              <div className="relative z-[25] mt-0.5 mb-1 inline-flex items-center justify-center">
                <span
                  className={`relative z-10 font-display text-[100px] font-bold tracking-tight leading-none transition-all duration-400 ${
                    lightingCandle
                      ? 'text-[#5A7FA6] drop-shadow-[0_0_20px_rgba(253,224,71,0.72)]'
                      : 'text-[#4D749E] drop-shadow-[0_2px_10px_rgba(255,255,255,0.95)]'
                  }`}
                >
                  21
                </span>

                {/* Blue-and-white diagonal striped candle perched in the lower middle of 21 */}
                <svg
                  viewBox="0 0 44 88"
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-2 z-20 w-10 h-20 overflow-visible"
                >
                  <defs>
                    <pattern
                      id="cover-candle-stripes"
                      width="8"
                      height="8"
                      patternUnits="userSpaceOnUse"
                      patternTransform="rotate(-32)"
                    >
                      <rect width="8" height="8" fill="#FFFFFF" />
                      <rect width="4" height="8" fill="#3B628E" />
                    </pattern>
                    <clipPath id="cover-candle-clip">
                      <rect x="17" y="38" width="10" height="44" rx="2.5" />
                    </clipPath>
                  </defs>

                  {/* Candle glow halo when lit */}
                  {lightingCandle && (
                    <g>
                      <circle cx="22" cy="24" r="24" fill="#FDE047" opacity="0.34" />
                      <circle cx="22" cy="24" r="14" fill="#FB923C" opacity="0.32" />
                    </g>
                  )}

                  {/* Candle stick */}
                  <g clipPath="url(#cover-candle-clip)">
                    <rect x="17" y="38" width="10" height="44" fill="url(#cover-candle-stripes)" />
                    <rect x="23.5" y="38" width="3.5" height="44" fill="#1E3A5F" opacity="0.18" />
                  </g>
                  <rect
                    x="17"
                    y="38"
                    width="10"
                    height="44"
                    rx="2.5"
                    fill="none"
                    stroke="#2B486B"
                    strokeOpacity="0.35"
                    strokeWidth="0.9"
                  />
                  {/* Candle top rim & wick */}
                  <ellipse cx="22" cy="38.5" rx="5" ry="1.6" fill="#F8FAFC" stroke="#2B486B" strokeOpacity="0.25" strokeWidth="0.6" />
                  <line x1="22" y1="31" x2="22" y2="38" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Flame appears when "点亮蜡烛" is clicked */}
                  {lightingCandle && (
                    <g className="animate-flame" style={{ transformOrigin: '22px 31px' }}>
                      <path d="M22 10 C28.5 19.5 27.5 30 22 31.5 C16.5 30 15.5 19.5 22 10 Z" fill="#FB923C" />
                      <path d="M22 15 C25.8 21.5 25.2 29 22 30.2 C18.8 29 18.2 21.5 22 15 Z" fill="#FEF08A" />
                      <ellipse cx="22" cy="25" rx="1.8" ry="3.6" fill="#FFFFFF" opacity="0.95" />
                    </g>
                  )}
                </svg>
              </div>

              {/* Tightly Stacked Overlapping Washi Tape Blessings (00:02 -> 00:04 pace) */}
              <div className="relative z-30 w-full max-w-[420px] flex flex-col items-center -space-y-1.5 mt-1 mb-5">
                <div
                  className={`relative z-30 washi-tape-blue washi-tape-torn px-6 py-1.5 text-[25px] leading-snug font-semibold text-[#272D38] -rotate-2 transition-all duration-450 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    coverStep >= 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-105'
                  }`}
                >
                  今天，你最大
                </div>

                <div
                  className={`relative z-20 flex flex-wrap sm:flex-nowrap items-center justify-center gap-1.5 w-full pt-0.5 transition-all duration-450 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    coverStep >= 3 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-105'
                  }`}
                >
                  <span className="washi-tape-pink washi-tape-torn px-3.5 py-2 text-[19px] leading-[16px] whitespace-nowrap font-semibold text-[#272D38] -rotate-6 shadow-sm">
                    想吃就吃，想玩就玩
                  </span>
                  <span className="washi-tape-pink washi-tape-torn px-3.5 py-1.5 text-[20px] leading-snug whitespace-nowrap font-semibold text-[#3C4454] rotate-6 shadow-sm">
                    累了就歇一歇
                  </span>
                </div>

                <div
                  className={`relative z-10 washi-tape-pink washi-tape-torn px-7 py-1.5 text-[17px] leading-snug font-medium text-[#272D38] rotate-1 mt-1 transition-all duration-450 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    coverStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                  }`}
                >
                  那平常日子也有好消息
                </div>

                <div
                  className={`relative z-0 bg-[#c3fce9] border border-[rgba(39,45,56,0.1)] px-4 py-2 text-[17px] font-[system-ui] leading-relaxed text-[#475366] rounded-md shadow-xs -rotate-1 mt-1 transition-all duration-450 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    coverStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                  }`}
                >
                  财运发发发 事业发发发 爱情发发发 全部都发发发
                </div>
              </div>

              {/* Single Centered Action Button matching 00:04 in video */}
              <div
                className={`relative z-30 flex items-center justify-center pt-1 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  coverStep >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
                }`}
              >
                <button
                  type="button"
                  onClick={handleLightCandle}
                  disabled={lightingCandle}
                  className="kr-btn kr-btn-cocoa px-6 py-2 text-xs sm:text-sm font-medium"
                >
                  {lightingCandle ? '烛光亮起...' : '点亮蜡烛'}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* STAGE 3: Video-style Dark Room Single Glowing Candle & Wish Jar */}
        {stage === 'candle' && (
          <section className="space-y-8">
            <div
              onClick={() => {
                if (candlesLit) {
                  extinguishCandles();
                } else {
                  onNavigate('arcade');
                }
              }}
              className="relative max-w-[580px] mx-auto min-h-[430px] rounded-2xl bg-[#101826] text-white border border-[rgba(255,255,255,0.08)] shadow-[0_18px_50px_rgba(12,18,30,0.34)] px-6 py-10 sm:px-10 sm:py-12 flex flex-col items-center justify-center overflow-hidden cursor-pointer"
            >
              <canvas
                ref={confettiCanvasRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 w-full h-full z-20"
              />

              {/* Warm candle-light room aura that brightens smoothly when lit */}
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 transition-all duration-700 ease-out ${
                  candlesLit
                    ? candleBright
                      ? 'opacity-100 scale-100'
                      : 'opacity-20 scale-75'
                    : 'opacity-0 scale-50'
                }`}
                style={{
                  background:
                    'radial-gradient(circle at 50% 34%, rgba(255, 214, 120, 0.34) 0%, rgba(251, 146, 60, 0.14) 28%, rgba(16, 24, 38, 0) 68%)',
                }}
              />

              <div className="relative z-10 max-w-md mx-auto flex flex-col items-center text-center space-y-5">
                {/* Birthday Cake with Glowing Blue-and-White Diagonal Striped Candles */}
                <div className="relative flex flex-col items-center justify-center h-52 w-64 select-none">
                  {candlesLit && (
                    <div
                      aria-hidden="true"
                      className={`absolute top-2 w-40 h-28 rounded-full blur-2xl transition-all duration-700 ${
                        candleBright ? 'bg-[#FDE047]/42 scale-110 opacity-100' : 'bg-[#FDE047]/15 scale-60 opacity-30'
                      }`}
                    />
                  )}

                  <svg viewBox="0 0 240 205" className="w-60 h-52 overflow-visible" role="img" aria-label="21岁生日蛋糕与许愿蜡烛">
                    <defs>
                      <pattern
                        id="cake-candle-stripes"
                        width="8"
                        height="8"
                        patternUnits="userSpaceOnUse"
                        patternTransform="rotate(-32)"
                      >
                        <rect width="8" height="8" fill="#FFFFFF" />
                        <rect width="4" height="8" fill="#446E9B" />
                      </pattern>
                    </defs>

                    {/* Porcelain cake plate */}
                    <ellipse cx="120" cy="182" rx="92" ry="13" fill="#E2E8F0" opacity="0.28" />
                    <ellipse cx="120" cy="177" rx="86" ry="11" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
                    <ellipse cx="120" cy="174" rx="74" ry="7.5" fill="#F1F5F9" />

                    {/* Lower cake body */}
                    <path
                      d="M54 128 L54 168 Q120 181 186 168 L186 128 Z"
                      fill="#FAD2DF"
                      stroke="#7A5B53"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    {/* Strawberry cream filling band */}
                    <path
                      d="M54 148 Q120 159 186 148 L186 155 Q120 166 54 155 Z"
                      fill="#FFFDF9"
                      opacity="0.9"
                    />
                    {/* Lower tier whipped cream drips */}
                    <path
                      d="M54 128 Q120 138 186 128 L186 138 C176 146 168 134 158 143 C148 151 140 135 130 144 C120 152 110 136 100 144 C90 152 80 135 70 142 C62 148 56 139 54 137 Z"
                      fill="#FFFDF9"
                    />

                    {/* Upper cake tier */}
                    <path
                      d="M72 95 L72 126 Q120 135 168 126 L168 95 Z"
                      fill="#FCE8EF"
                      stroke="#7A5B53"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    {/* Upper tier cream top & drips */}
                    <path
                      d="M72 95 Q120 103 168 95 L168 106 C158 114 149 102 140 111 C131 119 124 104 115 112 C106 120 97 104 88 111 C80 117 75 107 72 105 Z"
                      fill="#FFFDF9"
                    />
                    <ellipse cx="120" cy="95" rx="48" ry="10.5" fill="#FFFDF9" stroke="#7A5B53" strokeWidth="1.4" />

                    {/* Cute strawberries on cake top rim */}
                    <g transform="translate(81, 88)">
                      <path d="M0 9 C-4 4 -3 -2 2 -2 C7 -2 8 4 4 9 C2.5 11 1.5 11 0 9 Z" fill="#EC6B87" stroke="#7A5B53" strokeWidth="1" />
                      <path d="M-1 -2 L2 0 L5 -2" fill="none" stroke="#65A36E" strokeWidth="1.4" strokeLinecap="round" />
                    </g>
                    <g transform="translate(154, 88)">
                      <path d="M0 9 C-4 4 -3 -2 2 -2 C7 -2 8 4 4 9 C2.5 11 1.5 11 0 9 Z" fill="#EC6B87" stroke="#7A5B53" strokeWidth="1" />
                      <path d="M-1 -2 L2 0 L5 -2" fill="none" stroke="#65A36E" strokeWidth="1.4" strokeLinecap="round" />
                    </g>

                    {/* Sprinkles & heart topper on lower tier */}
                    <circle cx="88" cy="161" r="2.2" fill="#8FC5EE" />
                    <circle cx="152" cy="161" r="2.2" fill="#F7D774" />
                    <circle cx="120" cy="163" r="2.5" fill="#EC6B87" />
                    <rect x="102" y="118" width="5" height="2.4" rx="1.2" transform="rotate(-18 102 118)" fill="#8FC5EE" />
                    <rect x="134" y="116" width="5" height="2.4" rx="1.2" transform="rotate(20 134 116)" fill="#F497B2" />

                    {/* Three Blue-and-White Diagonal Striped Candles */}
                    {[
                      { x: 95, topY: 56, height: 37 },
                      { x: 120, topY: 46, height: 47 },
                      { x: 145, topY: 56, height: 37 },
                    ].map((c, idx) => (
                      <g key={c.x}>
                        <rect
                          x={c.x - 4.5}
                          y={c.topY}
                          width="9"
                          height={c.height}
                          rx="2.5"
                          fill="url(#cake-candle-stripes)"
                          stroke="#2B486B"
                          strokeOpacity="0.45"
                          strokeWidth="0.9"
                        />
                        <rect
                          x={c.x + 1}
                          y={c.topY}
                          width="3.2"
                          height={c.height}
                          rx="1.5"
                          fill="#1E3A5F"
                          opacity="0.16"
                        />
                        <ellipse cx={c.x} cy={c.topY + 0.5} rx="4.5" ry="1.4" fill="#F8FAFC" />
                        <line
                          x1={c.x}
                          y1={c.topY - 6}
                          x2={c.x}
                          y2={c.topY}
                          stroke="#94A3B8"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />

                        {candlesLit ? (
                          <g
                            className={`animate-flame transition-all duration-700 ${
                              candleBright ? 'opacity-100 scale-100' : 'opacity-30 scale-75'
                            }`}
                            style={{
                              transformOrigin: `${c.x}px ${c.topY - 6}px`,
                              animationDelay: `${idx * 140}ms`,
                            }}
                          >
                            <ellipse cx={c.x} cy={c.topY - 16} rx="14" ry="16" fill="#FBBF24" opacity="0.24" />
                            <path
                              d={`M${c.x} ${c.topY - 30} C${c.x + 6.5} ${c.topY - 19} ${c.x + 5.5} ${c.topY - 7} ${c.x} ${c.topY - 5.5} C${c.x - 5.5} ${c.topY - 7} ${c.x - 6.5} ${c.topY - 19} ${c.x} ${c.topY - 30} Z`}
                              fill="#FB923C"
                            />
                            <path
                              d={`M${c.x} ${c.topY - 24} C${c.x + 3.6} ${c.topY - 16.5} ${c.x + 3} ${c.topY - 8.5} ${c.x} ${c.topY - 7.2} C${c.x - 3} ${c.topY - 8.5} ${c.x - 3.6} ${c.topY - 16.5} ${c.x} ${c.topY - 24} Z`}
                              fill="#FEF08A"
                            />
                            <ellipse cx={c.x} cy={c.topY - 12} rx="1.6" ry="3.2" fill="#FFFFFF" opacity="0.92" />
                          </g>
                        ) : (
                          <path
                            d={`M${c.x} ${c.topY - 7} Q${c.x + 4} ${c.topY - 16} ${c.x - 2} ${c.topY - 24} Q${c.x - 4} ${c.topY - 30} ${c.x + 1} ${c.topY - 36}`}
                            fill="none"
                            stroke="#94A3B8"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            opacity="0.6"
                          />
                        )}
                      </g>
                    ))}
                  </svg>
                </div>

                <div className="space-y-2">
                  <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight [text-wrap:balance]">
                    {candlesLit ? '闭上眼睛，许个愿吧' : '蜡烛吹灭啦，21 岁愿望一定算数'}
                  </h2>
                  <p className="text-sm text-slate-300">
                    {candlesLit ? '慢慢想，今天有很多时间。' : '点击屏幕或下方按钮，进入游戏厅接住礼物和回忆彩蛋！'}
                  </p>
                </div>

                {micActive && candlesLit && (
                  <div className="w-full max-w-xs space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>麦克风吹气感应中</span>
                      <span className="font-mono-num">{micLevel}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden">
                      <div className="h-full bg-[#FDE68A] transition-all duration-75" style={{ width: `${micLevel}%` }} />
                    </div>
                  </div>
                )}

                {micError && <p className="text-xs text-[#F9C6D3]">{micError}</p>}

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {candlesLit ? (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          extinguishCandles();
                        }}
                        className="kr-btn kr-btn-sky px-6 py-3 text-sm font-semibold"
                      >
                        <Wind className="w-4 h-4 shrink-0" />
                        <span>许好愿了 · 吹灭蜡烛</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startMicBlowDetection();
                        }}
                        className={`kr-btn px-4 py-3 text-sm font-medium ${
                          micActive ? 'kr-btn-blush' : 'kr-btn-cream'
                        }`}
                      >
                        {micActive ? <Mic className="w-4 h-4 shrink-0" /> : <MicOff className="w-4 h-4 shrink-0" />}
                        <span>{micActive ? '停止麦克风' : '对着麦克风吹气'}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('arcade');
                        }}
                        className="kr-btn kr-btn-blush px-6 py-3 text-sm font-semibold"
                      >
                        下一步：去游戏厅玩耍
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCandlesLit(true);
                        }}
                        className="kr-btn kr-btn-cream px-4 py-3 text-xs sm:text-sm font-medium"
                      >
                        <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                        <span>重燃蜡烛</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Wish Jar */}
            <div className="bg-white/95 rounded-3xl border border-[rgba(39,45,56,0.08)] p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <form onSubmit={handleSaveWish} className="lg:col-span-6 space-y-3">
                <h3 className="font-display text-xl font-semibold text-[#272D38]">
                  把 21 岁的心愿悄悄写在这里
                </h3>
                <textarea
                  rows={3}
                  value={wishText}
                  onChange={(e) => setWishText(e.target.value)}
                  placeholder="写下今年最想实现的小愿望..."
                  className="w-full rounded-2xl border border-[rgba(39,45,56,0.12)] bg-[#F6F8FB] px-4 py-3 text-sm text-[#272D38] placeholder:text-[#8E96A4] focus:outline-none focus:border-[#6B8EB3]"
                />
                <button
                  type="submit"
                  className="kr-btn kr-btn-cocoa px-5 py-2.5 text-sm font-medium"
                >
                  <Send className="w-4 h-4 shrink-0" />
                  <span>存进愿望罐</span>
                </button>
              </form>

              <div className="lg:col-span-6 space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {wishes.map((w) => (
                  <div key={w.id} className="paper-card rounded-2xl border border-[rgba(39,45,56,0.08)] px-4 py-3">
                    <div className="flex items-center justify-between text-xs text-[#687182] mb-1">
                      <span className="inline-flex items-center gap-1 text-[#D96B88] font-medium">
                        <Flame className="w-3.5 h-3.5" />
                        心愿纸条
                      </span>
                      <span className="font-mono-num">{w.createdAt}</span>
                    </div>
                    <p className="text-sm text-[#272D38] leading-relaxed">{w.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

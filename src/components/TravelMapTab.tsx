import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, ImagePlus, MapPin, Pencil, RotateCcw } from 'lucide-react';
import { ASSETS, TRAVEL_STOPS, TravelStop } from '../data/birthdayData';
import { MascotHachiware, ResilientImage } from './ChiikawaMascots';
import { compressImageFile } from '../utils/imageCompress';
import { birthdaySound } from '../utils/sound';

const TRAVEL_CUSTOM_STORAGE_KEY = 'yyl_travel_custom_v1';

interface CustomStopOverride {
  image?: string;
  story?: string;
}

interface TravelMapTabProps {
  onGoToFireworks?: () => void;
}

const SEGMENT_COUNT = TRAVEL_STOPS.length - 1;

function buildPartialDashArray(progress: number, totalLength: number): string {
  if (progress <= 0.001) return '0 9999';
  if (progress >= 0.999) return '7 9';

  const target = progress * totalLength;
  const parts: number[] = [];
  let acc = 0;

  while (acc + 7 < target) {
    parts.push(7);
    acc += 7;
    if (acc + 9 < target) {
      parts.push(9);
      acc += 9;
    } else {
      parts.push(9999);
      return parts.join(' ');
    }
  }

  const rem = Math.max(0.2, target - acc);
  parts.push(Number(rem.toFixed(1)), 9999);
  return parts.join(' ');
}

export function TravelMapTab({ onGoToFireworks }: TravelMapTabProps) {
  // Starts null: photo & story card stay hidden until a city on the map is clicked
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [furthestIndex, setFurthestIndex] = useState<number>(-1);
  const [segmentProgress, setSegmentProgress] = useState<number[]>(() =>
    Array.from({ length: SEGMENT_COUNT }, () => 0)
  );
  const segmentProgressRef = useRef<number[]>(Array.from({ length: SEGMENT_COUNT }, () => 0));
  const darkPathRefs = useRef<(SVGPathElement | null)[]>([]);
  const animRafRef = useRef<number | null>(null);

  const [overrides, setOverrides] = useState<Record<string, CustomStopOverride>>(() => {
    try {
      const raw = localStorage.getItem(TRAVEL_CUSTOM_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Record<string, CustomStopOverride>) : {};
    } catch {
      return {};
    }
  });
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [draftStory, setDraftStory] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (animRafRef.current !== null) cancelAnimationFrame(animRafRef.current);
    };
  }, []);

  useEffect(() => {
    if (furthestIndex <= 0) return;

    const targetSegments = Math.min(SEGMENT_COUNT, furthestIndex);
    const startSnapshot = [...segmentProgressRef.current];
    const pendingIndices: number[] = [];
    for (let i = 0; i < targetSegments; i++) {
      if (startSnapshot[i] < 1) pendingIndices.push(i);
    }
    if (pendingIndices.length === 0) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      const next = [...startSnapshot];
      for (const i of pendingIndices) next[i] = 1;
      segmentProgressRef.current = next;
      setSegmentProgress(next);
      return;
    }

    if (animRafRef.current !== null) cancelAnimationFrame(animRafRef.current);

    const startTime = performance.now();
    const durationPerSeg = 480;
    const staggerMs = 220;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const next = [...startSnapshot];
      let allDone = true;

      pendingIndices.forEach((segIdx, orderIdx) => {
        const localElapsed = elapsed - orderIdx * staggerMs;
        if (localElapsed <= 0) {
          allDone = false;
          return;
        }
        const rawT = Math.min(1, localElapsed / durationPerSeg);
        const eased = 1 - Math.pow(1 - rawT, 3);
        const targetVal = startSnapshot[segIdx] + (1 - startSnapshot[segIdx]) * eased;
        next[segIdx] = targetVal;
        if (rawT < 1) allDone = false;
      });

      segmentProgressRef.current = next;
      setSegmentProgress(next);

      if (!allDone) {
        animRafRef.current = requestAnimationFrame(tick);
      } else {
        animRafRef.current = null;
      }
    };

    animRafRef.current = requestAnimationFrame(tick);
  }, [furthestIndex]);

  useEffect(() => {
    try {
      localStorage.setItem(TRAVEL_CUSTOM_STORAGE_KEY, JSON.stringify(overrides));
    } catch {
      // ignore quota limits
    }
  }, [overrides]);

  const activeIndex = selectedId ? TRAVEL_STOPS.findIndex((s) => s.id === selectedId) : -1;
  const currentStop: TravelStop | null = activeIndex >= 0 ? TRAVEL_STOPS[activeIndex] : null;
  const currentOverride = currentStop ? overrides[currentStop.id] || {} : {};
  const displayImage = currentStop ? currentOverride.image || currentStop.defaultImage : '';
  const displayStory = currentStop ? currentOverride.story ?? currentStop.story : '';

  const selectStop = (id: string) => {
    birthdaySound.playFlip();
    const clickedIdx = TRAVEL_STOPS.findIndex((s) => s.id === id);
    if (clickedIdx >= 0) {
      setFurthestIndex((prev) => Math.max(prev, clickedIdx));
    }
    setSelectedId(id);
    setIsEditingNote(false);
    setUploadError('');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentStop) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    try {
      const compressed = await compressImageFile(file, 960, 0.82);
      setOverrides((prev) => ({
        ...prev,
        [currentStop.id]: {
          ...prev[currentStop.id],
          image: compressed,
        },
      }));
      birthdaySound.playGachaPop();
    } catch {
      setUploadError('这张图片暂时无法读取，换一张试试看吧。');
    } finally {
      e.target.value = '';
    }
  };

  const startEditNote = () => {
    setDraftStory(displayStory);
    setIsEditingNote(true);
  };

  const saveEditNote = () => {
    if (!currentStop) return;
    const trimmed = draftStory.trim();
    if (!trimmed) return;
    setOverrides((prev) => ({
      ...prev,
      [currentStop.id]: {
        ...prev[currentStop.id],
        story: trimmed,
      },
    }));
    setIsEditingNote(false);
    birthdaySound.playGachaPop();
  };

  const resetCurrentStop = () => {
    if (!currentStop) return;
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[currentStop.id];
      return next;
    });
    setIsEditingNote(false);
  };

  const buildSegmentPath = (fromStop: TravelStop, toStop: TravelStop) => {
    const cx = (fromStop.mapX + toStop.mapX) / 2;
    return `M ${fromStop.mapX} ${fromStop.mapY} C ${cx} ${fromStop.mapY}, ${cx} ${toStop.mapY}, ${toStop.mapX} ${toStop.mapY}`;
  };

  return (
    <div
      className="relative rounded-3xl overflow-hidden border border-[rgba(39,45,56,0.08)] shadow-[0_12px_36px_rgba(39,45,56,0.05)] p-5 sm:p-8 mb-12 bg-cover bg-center"
      style={{ backgroundImage: `url(${ASSETS.realChiikawaGroup})` }}
    >
      {/* Gentle readability veil */}
      <div aria-hidden="true" className="absolute inset-0 bg-[#FFFDF9]/74 backdrop-blur-[1px]" />

      <div className="relative z-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs sm:text-sm font-medium text-[#5A799B] mb-2">
              手绘旅行路线图 · 点击地图上的城市展开写真与回忆
            </p>
            <h1 className="font-display text-2xl sm:text-4xl font-semibold text-[#272D38] [text-wrap:balance]">
              我们一起走过的地方
            </h1>
          </div>

          {onGoToFireworks && (
            <button
              type="button"
              onClick={onGoToFireworks}
              className="kr-btn kr-btn-sky px-4 py-2 text-xs sm:text-sm font-medium self-start md:self-auto"
            >
              <span>下一步：去看愿望烟花</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          )}
        </div>

        {/* Hand-Drawn Illustrated Route Map */}
        <section className="bg-white/94 rounded-3xl border border-[rgba(39,45,56,0.08)] shadow-[0_10px_30px_rgba(39,45,56,0.05)] p-4 sm:p-6">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#F4F8FC] via-[#FDFBF7] to-[#F7EEF3] border border-[rgba(39,45,56,0.06)]">
            <svg
              viewBox="0 0 800 385"
              className="w-full h-auto block select-none"
              role="img"
              aria-label="手绘旅游地图：澳门、南昌、深圳、桂林、柳州、首尔、济州岛"
            >
              <g opacity="0.65">
                <ellipse cx="128" cy="82" rx="48" ry="18" fill="#FFFFFF" />
                <ellipse cx="158" cy="76" rx="28" ry="14" fill="#FFFFFF" />
                <ellipse cx="455" cy="72" rx="58" ry="20" fill="#FFFFFF" />
                <ellipse cx="695" cy="80" rx="46" ry="17" fill="#FFFFFF" />
                <path d="M135 224 Q165 162 195 224" fill="#E8F0E5" />
                <path d="M352 248 Q382 184 412 248" fill="#DCEFE6" />
                <path d="M392 248 Q422 192 452 248" fill="#CEE6DA" />
                <path d="M510 175 Q540 120 572 175" fill="#EDEAF6" />
                <path d="M565 316 Q590 306 615 316 T665 316 T715 316 T765 316" fill="none" stroke="#9FCBEC" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M590 336 Q615 326 640 336 T690 336 T740 336" fill="none" stroke="#9FCBEC" strokeWidth="2.5" strokeLinecap="round" />
                <g transform="translate(742, 62)" opacity="0.7">
                  <circle cx="0" cy="0" r="18" fill="#FFFFFF" stroke="#B4C4D6" strokeWidth="1.5" />
                  <path d="M0 -12 L4 0 L0 12 L-4 0 Z" fill="#D96B88" />
                  <path d="M-12 0 L0 -4 L12 0 L0 4 Z" fill="#8FB7DB" />
                </g>
              </g>

              {/* Soft base dashed route segments (phase-locked per segment) */}
              {TRAVEL_STOPS.slice(1).map((stop, idx) => {
                const d = buildSegmentPath(TRAVEL_STOPS[idx], stop);
                return (
                  <path
                    key={`route-base-${stop.id}`}
                    d={d}
                    fill="none"
                    stroke="#C5D7EA"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="7 9"
                  />
                );
              })}

              {/* Darkened dashed route segments that trace progressively dash-by-dash as cities are clicked */}
              {TRAVEL_STOPS.slice(1).map((stop, idx) => {
                const d = buildSegmentPath(TRAVEL_STOPS[idx], stop);
                const progress = segmentProgress[idx] ?? 0;
                const measuredLen = darkPathRefs.current[idx]?.getTotalLength() || 180;
                return (
                  <path
                    key={`route-dark-${stop.id}`}
                    ref={(el) => {
                      darkPathRefs.current[idx] = el;
                    }}
                    d={d}
                    fill="none"
                    stroke="#1E426D"
                    strokeWidth="4.8"
                    strokeOpacity={progress > 0.001 ? 1 : 0}
                    strokeLinecap="round"
                    strokeDasharray={buildPartialDashArray(progress, measuredLen)}
                  />
                );
              })}

              {TRAVEL_STOPS.map((stop, idx) => {
                const isSelected = stop.id === selectedId;
                const isReached = idx <= furthestIndex;
                return (
                  <g
                    key={stop.id}
                    onClick={() => selectStop(stop.id)}
                    className="cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-label={`查看第${stop.order}站 ${stop.city}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectStop(stop.id);
                      }
                    }}
                  >
                    {isSelected && (
                      <circle cx={stop.mapX} cy={stop.mapY} r="23" fill={stop.accentColor} opacity="0.24" />
                    )}
                    <circle
                      cx={stop.mapX}
                      cy={stop.mapY}
                      r={isSelected ? 14 : 11}
                      fill={isSelected ? stop.accentColor : isReached ? '#335A86' : '#FFFFFF'}
                      stroke={isSelected ? '#272D38' : isReached ? '#2B4F78' : stop.accentColor}
                      strokeWidth="3"
                      className="transition-colors duration-300"
                    />
                    <text
                      x={stop.mapX}
                      y={stop.mapY + 4}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="700"
                      fill={isSelected || isReached ? '#FFFFFF' : '#272D38'}
                    >
                      {stop.order}
                    </text>
                    <g transform={`translate(${stop.mapX}, ${stop.mapY + 30})`}>
                      <rect
                        x="-32"
                        y="-13"
                        width="64"
                        height="24"
                        rx="8"
                        fill={isSelected ? '#272D38' : isReached ? '#E6EFF8' : '#FFFFFF'}
                        stroke={isReached ? 'rgba(43,79,120,0.32)' : 'rgba(39,45,56,0.12)'}
                        strokeWidth="1.2"
                        className="transition-colors duration-300"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight={isSelected || isReached ? '600' : '500'}
                        fill={isSelected ? '#FFFFFF' : isReached ? '#1E3A5F' : '#272D38'}
                      >
                        {stop.city}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          {!currentStop && (
            <p className="mt-4 text-center text-xs sm:text-sm text-[#687182]">
              请点击上方手绘地图里的任意城市站标，展开对应的旅行照片与日记。
            </p>
          )}
        </section>

        {/* Only render photo & story card AFTER clicking a city */}
        {currentStop && (
          <section className="paper-card rounded-3xl border border-[rgba(39,45,56,0.1)] shadow-[0_12px_36px_rgba(39,45,56,0.05)] p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-6 flex flex-col gap-3">
                <div className="relative rounded-2xl overflow-hidden border border-[rgba(39,45,56,0.09)] bg-white p-2.5 shadow-xs">
                  <ResilientImage
                    src={displayImage}
                    alt={`${currentStop.city}旅行记忆画面`}
                    fallbackTitle={currentStop.city}
                    className="w-full h-auto block rounded-xl"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="kr-btn kr-btn-blush px-4 py-2 text-xs sm:text-sm font-medium"
                  >
                    <ImagePlus className="w-4 h-4 shrink-0" />
                    <span>替换这站的真实旅行照片</span>
                  </button>

                  {(currentOverride.image || currentOverride.story) && (
                    <button
                      type="button"
                      onClick={resetCurrentStop}
                      className="kr-btn kr-btn-cream px-3.5 py-2 text-xs font-medium"
                    >
                      <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                      <span>恢复默认</span>
                    </button>
                  )}
                </div>
                {uploadError && <p className="text-xs text-[#C94A6D]">{uploadError}</p>}
              </div>

              <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-[#687182]">
                    <MapPin className="w-3.5 h-3.5 text-[#D96B88] shrink-0" />
                    <span className="font-mono-num">第 {currentStop.order} 站</span>
                    <span aria-hidden="true">·</span>
                    <span>{currentStop.englishName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{currentStop.seasonTag}</span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <h2 className="font-display text-3xl font-semibold text-[#272D38]">
                      {currentStop.city}
                    </h2>
                    <MascotHachiware className="w-11 h-11 shrink-0" />
                  </div>

                  <p className="text-sm font-medium text-[#5A799B]">
                    {currentStop.moodLine}
                  </p>

                  {isEditingNote ? (
                    <div className="space-y-3">
                      <textarea
                        rows={4}
                        value={draftStory}
                        onChange={(e) => setDraftStory(e.target.value)}
                        className="w-full rounded-2xl border border-[rgba(39,45,56,0.14)] bg-white p-3.5 text-sm text-[#272D38] focus:outline-none focus:border-[#6B8EB3]"
                      />
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={saveEditNote}
                          className="kr-btn kr-btn-cocoa px-4 py-2 text-xs font-medium"
                        >
                          保存回忆文字
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingNote(false)}
                          className="kr-btn kr-btn-cream px-4 py-2 text-xs font-medium"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <p className="text-sm sm:text-base text-[#3C4454] leading-relaxed">
                        {displayStory}
                      </p>
                      
                   </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[rgba(39,45,56,0.08)]">
                  <button
                    type="button"
                    onClick={() => {
                      const prevIdx = (activeIndex - 1 + TRAVEL_STOPS.length) % TRAVEL_STOPS.length;
                      selectStop(TRAVEL_STOPS[prevIdx].id);
                    }}
                    className="kr-btn kr-btn-cream px-4 py-2 text-sm font-medium"
                  >
                    <ChevronLeft className="w-4 h-4 shrink-0" />
                    <span>上一站</span>
                  </button>

                  <span className="font-mono-num text-xs text-[#687182]">
                    {activeIndex + 1} / {TRAVEL_STOPS.length}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      const nextIdx = (activeIndex + 1) % TRAVEL_STOPS.length;
                      selectStop(TRAVEL_STOPS[nextIdx].id);
                    }}
                    className="kr-btn kr-btn-cocoa px-4 py-2 text-sm font-medium"
                  >
                    <span>下一站</span>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

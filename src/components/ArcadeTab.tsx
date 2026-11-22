import React, { useState } from 'react';
import { ArrowRight, Gamepad2, Sparkles } from 'lucide-react';
import { ASSETS } from '../data/birthdayData';
import { CatchGiftsGame } from './games/CatchGiftsGame';
import { ScratchPolaroidGame } from './games/ScratchPolaroidGame';

type ArcadeGameKey = 'catch' | 'scratch';

interface ArcadeTabProps {
  onGoToTravel?: () => void;
}

export function ArcadeTab({ onGoToTravel }: ArcadeTabProps) {
  const [activeGame, setActiveGame] = useState<ArcadeGameKey>('catch');

  return (
    <div
      className="relative rounded-3xl overflow-hidden border border-[rgba(39,45,56,0.08)] shadow-[0_12px_36px_rgba(39,45,56,0.05)] p-5 sm:p-8 mb-12 bg-cover bg-center"
      style={{ backgroundImage: `url(${ASSETS.realChiikawaSky})` }}
    >
      {/* Gentle readability veil */}
      <div aria-hidden="true" className="absolute inset-0 bg-[#FFFDF9]/74 backdrop-blur-[1px]" />

      <div className="relative z-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs sm:text-sm font-medium text-[#C94A6D] mb-2">
              Chiikawa 游乐场 · 21 岁限定小游戏
            </p>
            <h1 className="font-display text-2xl sm:text-4xl font-semibold text-[#272D38] [text-wrap:balance]">
              今天你是头号小玩家
            </h1>
          </div>

          {onGoToTravel && (
            <button
              type="button"
              onClick={onGoToTravel}
              className="kr-btn kr-btn-cream px-4 py-2 text-xs sm:text-sm font-medium self-start md:self-auto"
            >
              <span>下一步：看手绘旅游地图</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          )}
        </div>

        <div className="inline-flex flex-wrap items-center gap-2 p-1.5 bg-white/85 border border-[rgba(92,78,70,0.14)] rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveGame('catch')}
            className={`kr-tab px-4 py-2 text-xs sm:text-sm font-medium ${
              activeGame === 'catch' ? 'kr-tab-active' : 'kr-tab-idle'
            }`}
          >
            <Gamepad2 className="w-4 h-4 shrink-0" />
            <span>接住生日小礼物</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveGame('scratch')}
            className={`kr-tab px-4 py-2 text-xs sm:text-sm font-medium ${
              activeGame === 'scratch' ? 'kr-tab-active' : 'kr-tab-idle'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>拍立得显影刮刮卡</span>
          </button>
        </div>

        <div>
          {activeGame === 'catch' && <CatchGiftsGame />}
          {activeGame === 'scratch' && <ScratchPolaroidGame />}
        </div>
      </div>
    </div>
  );
}

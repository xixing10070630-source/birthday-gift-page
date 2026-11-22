import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export type TabKey = 'home' | 'arcade' | 'travel' | 'fireworks' | 'letter';

interface TopBarProps {
  onGoHome: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
}

export function TopBar({ onGoHome, isMusicPlaying, onToggleMusic }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#FBF8F3]/92 backdrop-blur-md border-b border-[rgba(92,78,70,0.12)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Single-line Brand wordmark */}
        <button
          type="button"
          onClick={onGoHome}
          className="font-display text-lg sm:text-xl font-semibold tracking-tight text-[#3D322C] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D96B88]"
        >
          杨燕灵 · 21岁快乐
        </button>

        {/* Minimal header: brand wordmark + music toggle (navigation tabs hidden for immersive step flow) */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onToggleMusic}
            aria-pressed={isMusicPlaying}
            className={`kr-btn px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D96B88] ${
              isMusicPlaying ? 'kr-btn-blush' : 'kr-btn-cream'
            }`}
          >
            {isMusicPlaying ? <Volume2 className="w-4 h-4 shrink-0" /> : <VolumeX className="w-4 h-4 shrink-0" />}
            <span>{isMusicPlaying ? '八音盒播放中' : '开启音乐'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

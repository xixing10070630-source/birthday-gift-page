import React, { useEffect, useState } from 'react';
import { TopBar, TabKey } from './components/TopBar';
import { HomeWishTab } from './components/HomeWishTab';
import { TravelMapTab } from './components/TravelMapTab';
import { ArcadeTab } from './components/ArcadeTab';
import { SkyFireworksTab } from './components/SkyFireworksTab';
import { LetterFinalTab } from './components/LetterFinalTab';
import { birthdaySound } from './utils/sound';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  useEffect(() => {
    return () => {
      birthdaySound.stopBgm();
    };
  }, []);

  const handleToggleMusic = () => {
    const playing = birthdaySound.toggleBgm();
    setIsMusicPlaying(playing);
  };

  const handleSelectTab = (tab: TabKey) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8FB] text-[#272D38] relative overflow-x-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(circle at 14% 12%, rgba(226, 236, 247, 0.85) 0%, transparent 45%), radial-gradient(circle at 86% 18%, rgba(250, 232, 238, 0.65) 0%, transparent 45%), radial-gradient(circle at 50% 94%, rgba(245, 235, 214, 0.45) 0%, transparent 48%)',
        }}
      />

      <TopBar
        onGoHome={() => handleSelectTab('home')}
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={handleToggleMusic}
      />

      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-7 sm:pt-10">
        {activeTab === 'home' && <HomeWishTab onNavigate={handleSelectTab} />}
        {activeTab === 'arcade' && <ArcadeTab onGoToTravel={() => handleSelectTab('travel')} />}
        {activeTab === 'travel' && <TravelMapTab onGoToFireworks={() => handleSelectTab('fireworks')} />}
        {activeTab === 'fireworks' && <SkyFireworksTab onGoToLetter={() => handleSelectTab('letter')} />}
        {activeTab === 'letter' && <LetterFinalTab onNavigate={handleSelectTab} />}
      </main>

      <footer className="relative z-10 border-t border-[rgba(39,45,56,0.08)] py-5 mt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-center text-xs text-[#687182]">
          <span>12 月 1 日 · 祝杨燕灵 21 岁生日快乐</span>
        </div>
      </footer>
    </div>
  );
}

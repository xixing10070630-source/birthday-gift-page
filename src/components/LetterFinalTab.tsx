import React, { useEffect, useState } from 'react';
import { MailOpen, Pencil } from 'lucide-react';
import { ASSETS } from '../data/birthdayData';
import { MascotChiikawa } from './ChiikawaMascots';
import { birthdaySound } from '../utils/sound';
import { TabKey } from './TopBar';

const LETTER_STORAGE_KEY = 'yyl_birthday_letter_v1';

const DEFAULT_LETTER = `杨杨杨燕灵同学，21岁生日快乐吖！虽然你已经钦点礼物作为你的生日礼物了，但我还是想送一个特别的玩意儿给你，我的大学搭子~从有这个想法到手搓落实下来把我们去过的地方、拍过的照片、吃过的漂亮饭重新翻看一遍又一遍，才发现原来这三年有这么多陪伴彼此的瞬间，我不会忘记我们一起通过的宵，不会忘记每趟与你同行的旅行，不会忘记两人突发奇想拍下板出发的瞬间，更不会忘记那些踩过的雷哈哈哈。
21岁是闪闪发光的新开始（可以进赌场收票了哈哈哈哈bushi），希望你新的一岁继续吃吃喝喝嘻嘻哈哈，每天都开开心心的，永远有随时出发的勇气和好心情，别内耗，想做什么就做什么，别给自己设限。虽然不知道以后我们是否还会联系，是否还会继续一起出去玩，但不妨碍当下我们的链接，或许以后各有安排，但回想起我们一起度过的每一个瞬间，我会想：幸好在大学遇见了你！
anyway祝这位寿星生日快乐啦！
——永远站在你这边的好朋友`;
interface LetterFinalTabProps {
  onNavigate: (tab: TabKey) => void;
}

export function LetterFinalTab({ onNavigate }: LetterFinalTabProps) {
  const [letterOpened, setLetterOpened] = useState(false);

  const [letterBody, setLetterBody] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LETTER_STORAGE_KEY);
      if (saved) return saved;
    } catch {
      // ignore
    }
    return DEFAULT_LETTER;
  });
  const [isEditingLetter, setIsEditingLetter] = useState(false);
  const [draftLetter, setDraftLetter] = useState(letterBody);

  useEffect(() => {
    try {
      localStorage.setItem(LETTER_STORAGE_KEY, letterBody);
    } catch {
      // ignore
    }
  }, [letterBody]);

  const handleSaveLetter = () => {
    if (draftLetter.trim()) {
      setLetterBody(draftLetter.trim());
    }
    setIsEditingLetter(false);
    birthdaySound.playGachaPop();
  };

  return (
    <div
      className="relative rounded-3xl overflow-hidden border border-[rgba(39,45,56,0.08)] shadow-[0_12px_36px_rgba(39,45,56,0.05)] p-5 sm:p-10 mb-12 bg-cover bg-center"
      style={{ backgroundImage: `url(${ASSETS.realChiikawaGroup})` }}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-[#FFFDF9]/74 backdrop-blur-[1px]" />

      <div className="relative z-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs sm:text-sm font-medium text-[#C94A6D] mb-1">
              最后环节 · 献给 21 岁的杨燕灵
            </p>
            <h1 className="font-display text-2xl sm:text-4xl font-semibold text-[#272D38]">
              一封给你的信
            </h1>
          </div>
        </div>

        {!letterOpened ? (
          <div
            onClick={() => {
              birthdaySound.playFlip();
              setLetterOpened(true);
            }}
            className="min-h-[420px] flex flex-col items-center justify-center text-center py-8 space-y-6 cursor-pointer"
          >
            <div className="paper-card rounded-3xl border-2 border-[#332520] shadow-xl px-8 py-10 max-w-md w-full space-y-5">
              <div className="mx-auto w-20 h-20 rounded-full bg-white border-2 border-[#332520] flex items-center justify-center shadow-sm">
                <MascotChiikawa className="w-16 h-16" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#687182]">12 月 1 日 · 21 岁生日快乐</p>
                <h2 className="font-display text-2xl font-semibold text-[#272D38]">
                  给杨燕灵的信
                </h2>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  birthdaySound.playFlip();
                  setLetterOpened(true);
                }}
                className="kr-btn kr-btn-blush px-6 py-3 text-sm font-semibold"
              >
                <MailOpen className="w-4 h-4 shrink-0" />
                <span>点击屏幕打开信封</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto paper-card rounded-2xl border border-[rgba(39,45,56,0.1)] shadow-[0_14px_38px_rgba(39,45,56,0.08)] p-7 sm:p-12 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(39,45,56,0.08)] pb-4">
              <div className="flex items-center gap-3">
                <MascotChiikawa className="w-11 h-11" />
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#272D38]">
                    给 杨燕灵
                  </h2>
                  <p className="text-xs text-[#687182]">12 月 1 日 · 21 岁生日快乐</p>
                </div>
              </div>

             
            </div>

            {isEditingLetter ? (
              <div className="space-y-3">
                <textarea
                  rows={8}
                  value={draftLetter}
                  onChange={(e) => setDraftLetter(e.target.value)}
                  className="w-full rounded-xl border border-[rgba(39,45,56,0.14)] bg-white p-4 text-sm text-[#272D38] leading-relaxed focus:outline-none focus:border-[#6B8EB3]"
                />
                <button
                  type="button"
                  onClick={handleSaveLetter}
                  className="kr-btn kr-btn-cocoa px-5 py-2.5 text-sm font-medium"
                >
                  保存信件内容
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-sm sm:text-base tex">
              {letterBody.split('\n').filter(s=>s.trim()).map((para,idx)=> {
                // 固定：索引0,1,2 正文缩进靠左；索引3 落款靠右
                const isSign = idx === 3;
                return (
                  <p 
                    key={idx} 
                    style={{
                      textIndent: isSign ? 0 : '2em',
                      textAlign: isSign ? 'right' : 'left',
                      margin:0
                    }}
                  >
                    {para}
                  </p >
                )
              })}
            </div>
            )}

            <div className="pt-6 border-t border-[rgba(39,45,56,0.08)] flex flex-wrap items-center justify-between gap-4">
              <span className="text-sm font-medium text-[#272D38]">—— 永远站在你这边的好朋友</span>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="kr-btn kr-btn-sky px-4 py-2 text-xs sm:text-sm font-medium"
                >
                  回到开场信封
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('fireworks')}
                  className="kr-btn kr-btn-blush px-4 py-2 text-xs sm:text-sm font-medium"
                >
                  再看一次烟花
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

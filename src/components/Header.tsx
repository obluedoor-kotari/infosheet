import React from 'react';
import { Bookmark, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeView: 'TODAY' | 'SCRAP';
  onViewChange: (view: 'TODAY' | 'SCRAP') => void;
  scrapCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeView, onViewChange, scrapCount }) => {
  const today = new Date();
  const dateString = today.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });

  return (
    <header className="border-b border-[#E8E8E3] bg-[#FBFBFA]/90 backdrop-blur-md sticky top-0 z-30 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-[#737373] mb-1 font-editorial-sans font-semibold">
              <span className="inline-block w-2 h-2 rounded-full bg-[#1A1A1A]"></span>
              <span>Daily Trend Research Editor</span>
              <span className="text-[#C4C4BD]">/</span>
              <span>{dateString}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-editorial-serif font-bold text-[#1A1A1A] tracking-tight">
              Daily Trend Info Sheet
            </h1>
            <p className="text-xs sm:text-sm text-[#666660] mt-1 font-editorial-sans">
              오늘의 트렌드 신호를 발견하고, 내 생각을 남기고, 필요한 것만 축적한다.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-end">
            <div className="inline-flex p-1 rounded-lg bg-[#EFEFED] border border-[#E0E0DB]">
              <button
                id="view-today-tab"
                type="button"
                onClick={() => onViewChange('TODAY')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${
                  activeView === 'TODAY'
                    ? 'bg-white text-[#1A1A1A] shadow-xs font-semibold'
                    : 'text-[#666660] hover:text-[#1A1A1A]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>TODAY</span>
              </button>
              <button
                id="view-scrap-tab"
                type="button"
                onClick={() => onViewChange('SCRAP')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${
                  activeView === 'SCRAP'
                    ? 'bg-white text-[#1A1A1A] shadow-xs font-semibold'
                    : 'text-[#666660] hover:text-[#1A1A1A]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>SCRAP</span>
                {scrapCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 text-[10px] rounded-full bg-[#1A1A1A] text-white font-mono">
                    {scrapCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

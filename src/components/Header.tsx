import React from 'react';
import { Bookmark, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeView: 'TODAY' | 'SCRAP';
  onViewChange: (view: 'TODAY' | 'SCRAP') => void;
  scrapCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeView, onViewChange, scrapCount }) => {
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="bg-white border-b border-[#E5E5E5] sticky top-0 z-40">
      {/* 01 TOP UTILITY BAR (matching Laurits style top line) */}
      <div className="border-b border-[#E5E5E5] px-4 sm:px-8 py-3 text-[11px] font-editorial-sans tracking-wide">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-editorial-display font-bold text-sm tracking-tight text-black">
              TrendSheet<sup>®</sup>
            </span>
            <nav className="hidden md:flex items-center gap-5 text-[#666666] text-xs">
              <span className="hover:text-black transition-colors cursor-default">• SPACE</span>
              <span className="hover:text-black transition-colors cursor-default">• DESIGN</span>
              <span className="hover:text-black transition-colors cursor-default">• TREND</span>
              <span className="hover:text-black transition-colors cursor-default">• RESEARCH</span>
              <span className="hover:text-black transition-colors cursor-default">• ARCHIVE</span>
            </nav>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="hidden sm:inline font-mono text-[11px] text-[#888888] tracking-wider uppercase">
              {dateString}
            </span>

            {/* View Switcher: Architectural Tabs */}
            <div className="inline-flex border border-[#111111]">
              <button
                id="view-today-tab"
                type="button"
                onClick={() => onViewChange('TODAY')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-editorial-sans font-medium transition-colors cursor-pointer ${
                  activeView === 'TODAY'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-[#F5F5F5]'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>TODAY</span>
              </button>
              <button
                id="view-scrap-tab"
                type="button"
                onClick={() => onViewChange('SCRAP')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-editorial-sans font-medium border-l border-[#111111] transition-colors cursor-pointer ${
                  activeView === 'SCRAP'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-[#F5F5F5]'
                }`}
              >
                <Bookmark className="w-3 h-3" />
                <span>SCRAP</span>
                {scrapCount > 0 && (
                  <span className={`text-[10px] px-1 font-mono ${activeView === 'SCRAP' ? 'text-[#F3C044]' : 'text-black font-bold'}`}>
                    ({scrapCount})
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 02 MONUMENTAL EDITORIAL MASTHEAD */}
      <div className="px-4 sm:px-8 pt-6 pb-5 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-1">
          <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] text-[#777777] uppercase">
            DAILY TREND RESEARCH JOURNAL · VOL. 2026
          </span>
          <span className="hidden sm:inline text-[11px] font-editorial-sans text-[#777777]">
            Curated daily signals for architects, product designers & trend strategists
          </span>
        </div>

        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-magazine font-black text-black tracking-[-0.04em] uppercase leading-[0.9] select-none py-1">
          MAGAZINE
        </h1>
      </div>
    </header>
  );
};

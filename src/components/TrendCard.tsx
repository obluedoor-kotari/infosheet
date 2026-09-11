import React, { useState, useEffect } from 'react';
import { ExternalLink, Star, MessageSquarePlus, Calendar, Building2 } from 'lucide-react';
import { TrendCardItem } from '../types';

interface TrendCardProps {
  item: TrendCardItem;
  index: number;
  userMemo: string;
  isScrapped: boolean;
  onUpdateMemo: (id: string, memo: string) => void;
  onToggleScrap: (item: TrendCardItem) => void;
}

export const TrendCard: React.FC<TrendCardProps> = ({
  item,
  index,
  userMemo,
  isScrapped,
  onUpdateMemo,
  onToggleScrap,
}) => {
  const [memoOpen, setMemoOpen] = useState<boolean>(Boolean(userMemo));
  const [memoText, setMemoText] = useState<string>(userMemo || '');

  useEffect(() => {
    setMemoText(userMemo || '');
    if (userMemo) {
      setMemoOpen(true);
    }
  }, [userMemo]);

  const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setMemoText(val);
    onUpdateMemo(item.id, val);
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Space & Interior':
        return 'bg-[#EFEFEA] text-[#3D3D38] border-[#D8D8CE]';
      case 'Consumer':
        return 'bg-[#EBF1F5] text-[#2C4454] border-[#D0DDE6]';
      case 'Lifestyle':
      default:
        return 'bg-[#F2ECE4] text-[#4A3D31] border-[#DFD5C8]';
    }
  };

  return (
    <article
      id={`trend-card-${item.id}`}
      className="bg-white rounded-xl border border-[#E0E0DB] overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
    >
      {/* 01 MAIN IMAGE */}
      <div>
        <div className="relative aspect-16/10 sm:aspect-16/9 w-full bg-[#EAEAE5] overflow-hidden border-b border-[#EAEAE5]">
          <img
            src={item.mainImage}
            alt={item.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
          />

          {/* Signal Index Number Badge */}
          <div className="absolute top-3 left-3 bg-[#1A1A1A]/85 backdrop-blur-xs text-white font-mono text-[11px] font-semibold px-2 py-0.5 rounded-sm">
            SIGNAL 0{index + 1}
          </div>

          {/* Scrap Button - Top Right of Image for clean alignment */}
          <button
            type="button"
            onClick={() => onToggleScrap(item)}
            className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-editorial-sans transition-all cursor-pointer backdrop-blur-md shadow-xs ${
              isScrapped
                ? 'bg-[#1A1A1A] text-[#F3C044] font-semibold ring-1 ring-white/20'
                : 'bg-white/90 text-[#404040] hover:bg-white hover:text-[#1A1A1A]'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isScrapped ? 'fill-[#F3C044] text-[#F3C044]' : 'text-[#737373]'}`} />
            <span className="text-[11px]">{isScrapped ? '★ SCRAPPED' : '☆ SCRAP'}</span>
          </button>

          {/* Image Attribution */}
          {item.imageSource && (
            <div className="absolute bottom-2 right-2 max-w-[80%] text-[10px] text-white/90 font-mono bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-sm truncate">
              {item.imageSource}
            </div>
          )}
        </div>

        {/* CONTENT BODY */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* 02 TREND KEYWORD */}
          <div>
            <span className="text-[11px] font-mono tracking-widest text-[#787870] uppercase">
              TREND KEYWORD
            </span>
            <div className="text-base sm:text-lg font-editorial-sans font-bold text-[#1A1A1A] tracking-tight mt-0.5">
              {item.trendKeyword}
            </div>
          </div>

          {/* 03 TITLE */}
          <h3 className="text-base sm:text-lg font-editorial-serif font-bold text-[#1A1A1A] leading-snug">
            {item.title}
          </h3>

          {/* 04 OVERVIEW */}
          <p className="text-xs sm:text-sm text-[#474742] leading-relaxed font-editorial-sans font-normal whitespace-pre-line">
            {item.overview}
          </p>

          {/* 05 CATEGORY & 06 SOURCE */}
          <div className="pt-3 border-t border-[#F0F0EB] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-editorial-sans font-medium border ${getCategoryBadgeClass(
                  item.category
                )}`}
              >
                {item.category}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-[#73736C] font-editorial-sans">
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3 text-[#9E9E94]" />
                {item.source.mediaOrBrand}
              </span>
              <span className="flex items-center gap-1 font-mono text-[#8C8C84]">
                <Calendar className="w-3 h-3 text-[#9E9E94]" />
                {item.source.publishedDate}
              </span>
              <a
                href={item.source.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#1A1A1A] hover:underline underline-offset-2 font-medium"
              >
                <span>원문</span>
                <ExternalLink className="w-3 h-3 text-[#787870]" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 07 MEMO SECTION (Inline personal thought editor) */}
      <div className="p-5 sm:p-6 pt-0">
        <div className="bg-[#FAF9F5] rounded-lg border border-[#EAEAE3] p-3.5 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold tracking-wider text-[#73736C] uppercase">
                THINK · RESEARCH MEMO
              </span>
              {memoText && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#3D8F5C]" title="자동 저장됨" />
              )}
            </div>

            {!memoOpen && !memoText && (
              <button
                type="button"
                onClick={() => setMemoOpen(true)}
                className="text-[11px] font-editorial-sans text-[#52524E] hover:text-[#1A1A1A] flex items-center gap-1 cursor-pointer"
              >
                <MessageSquarePlus className="w-3 h-3" />
                <span>+ ADD MEMO</span>
              </button>
            )}
          </div>

          {memoOpen ? (
            <div className="space-y-1">
              <textarea
                value={memoText}
                onChange={handleMemoChange}
                placeholder="아이디어나 생각을 기록하세요. (자동 저장됩니다)"
                rows={2}
                className="w-full text-xs font-editorial-sans text-[#1A1A1A] bg-transparent border-0 focus:ring-0 focus:outline-none p-0 resize-none placeholder:text-[#999990] leading-relaxed"
              />
              <div className="flex justify-between items-center text-[10px] text-[#A0A096] font-mono pt-1 border-t border-[#ECECE6]">
                <span>{memoText.length > 0 ? `${memoText.length}자` : '비어 있음'}</span>
                <span>Auto-saved to localStorage</span>
              </div>
            </div>
          ) : (
            <p
              onClick={() => setMemoOpen(true)}
              className="text-xs font-editorial-sans text-[#8C8C84] cursor-pointer hover:text-[#52524E] py-1"
            >
              + 생각을 기록하려면 클릭하세요...
            </p>
          )}
        </div>
      </div>
    </article>
  );
};

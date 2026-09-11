import React, { useState, useEffect } from 'react';
import { ExternalLink, Star, MessageSquarePlus, Calendar } from 'lucide-react';
import { TrendCardItem } from '../types';

interface TrendCardProps {
  item: TrendCardItem;
  index: number;
  userMemo: string;
  isScrapped: boolean;
  onUpdateMemo: (id: string, memo: string) => void;
  onToggleScrap: (item: TrendCardItem) => void;
}

// Bulletproof zero-network SVG fallback for architectural trend visual
const ARCHITECTURAL_FALLBACK_SVG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><rect width="800" height="500" fill="%23f4f4f4"/><path d="M100 400 L400 120 L700 400 Z" fill="none" stroke="%23cccccc" stroke-width="2"/><line x1="200" y1="400" x2="200" y2="260" stroke="%23cccccc" stroke-width="1.5"/><line x1="600" y1="400" x2="600" y2="260" stroke="%23cccccc" stroke-width="1.5"/><line x1="400" y1="120" x2="400" y2="400" stroke="%23bbbbbb" stroke-width="1.5"/><text x="400" y="440" font-family="monospace" font-size="12" fill="%23888888" text-anchor="middle" letter-spacing="2">ARCHITECTURAL SPATIAL ARCHIVE</text></svg>';

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

  return (
    <article
      id={`trend-card-${item.id}`}
      className="bg-white border border-[#E5E5E5] flex flex-col justify-between hover:border-black transition-colors group"
    >
      {/* 01 IMAGE HEADER */}
      <div>
        <div className="relative aspect-16/10 w-full bg-[#EEEEEE] overflow-hidden border-b border-[#E5E5E5]">
          <img
            src={item.mainImage}
            alt={item.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              if (!target.src.includes('photo-1600585154340')) {
                target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
              } else {
                target.src = ARCHITECTURAL_FALLBACK_SVG;
              }
            }}
            className="w-full h-full object-cover object-center group-hover:scale-[1.015] transition-transform duration-500"
          />

          {/* Signal Tag */}
          <div className="absolute top-2.5 left-2.5 bg-black text-white font-mono text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
            SIGNAL 0{index + 1}
          </div>

          {/* Scrap Button - Minimalist Architectural Save Button */}
          <button
            type="button"
            onClick={() => onToggleScrap(item)}
            className={`absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-editorial-sans transition-all cursor-pointer border ${
              isScrapped
                ? 'bg-black text-white border-black font-semibold'
                : 'bg-white/95 text-black border-black/20 hover:bg-white hover:border-black'
            }`}
          >
            <Star className={`w-3 h-3 ${isScrapped ? 'fill-[#F3C044] text-[#F3C044]' : 'text-black'}`} />
            <span>{isScrapped ? 'SAVED' : 'SAVE'}</span>
          </button>

          {/* Image Attribution */}
          {item.imageSource && (
            <div className="absolute bottom-2 right-2 max-w-[80%] text-[9px] text-white/90 font-mono bg-black/75 px-1.5 py-0.5 truncate">
              {item.imageSource}
            </div>
          )}
        </div>

        {/* 02 EDITORIAL CARD BODY */}
        <div className="p-5 sm:p-6 space-y-3.5">
          {/* Date & Keyword Meta Bar (matching magazine style) */}
          <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-[#777777]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#999999]" />
              <span>{item.source.publishedDate || '2026.09.11'}</span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-black bg-[#F2F2F0] px-1.5 py-0.5">
              {item.trendKeyword}
            </span>
          </div>

          {/* Title: High Contrast Architectural Sans Heading */}
          <h3 className="text-base sm:text-lg font-editorial-display font-bold text-black leading-snug tracking-tight group-hover:text-[#333333] transition-colors">
            {item.title}
          </h3>

          {/* Category & Source: Underlined style matching reference image */}
          <div className="text-[11px] font-editorial-sans text-[#666666] flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="underline underline-offset-3 decoration-1 decoration-[#999999] text-[#222222] font-medium">
              {item.category === 'Space & Interior' ? 'Architecture / Space' : item.category}
            </span>
            <span className="text-[#CCCCCC]">/</span>
            <a
              href={item.source.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-black underline underline-offset-3 decoration-1 decoration-[#CCCCCC] hover:decoration-black transition-colors"
            >
              <span>{item.source.mediaOrBrand}</span>
              <ExternalLink className="w-2.5 h-2.5 text-[#999999]" />
            </a>
          </div>

          {/* Overview Body */}
          <p className="text-xs sm:text-[13px] text-[#444444] leading-relaxed font-editorial-sans whitespace-pre-line pt-1">
            {item.overview}
          </p>
        </div>
      </div>

      {/* 03 RESEARCH MEMO SECTION */}
      <div className="p-5 sm:p-6 pt-0">
        <div className="border border-[#E5E5E5] bg-[#FAFAF8] p-3 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold tracking-widest text-[#777777] uppercase">
                RESEARCH NOTE
              </span>
              {memoText && (
                <span className="w-1.5 h-1.5 rounded-full bg-black" title="자동 저장됨" />
              )}
            </div>

            {!memoOpen && !memoText && (
              <button
                type="button"
                onClick={() => setMemoOpen(true)}
                className="text-[11px] font-editorial-sans text-[#666666] hover:text-black flex items-center gap-1 cursor-pointer"
              >
                <MessageSquarePlus className="w-3 h-3" />
                <span>+ ADD NOTE</span>
              </button>
            )}
          </div>

          {memoOpen ? (
            <div className="space-y-1">
              <textarea
                value={memoText}
                onChange={handleMemoChange}
                placeholder="아이디어, 시사점 또는 메모를 기록하세요. (자동 저장)"
                rows={2}
                className="w-full text-xs font-editorial-sans text-black bg-transparent border-0 focus:ring-0 focus:outline-none p-0 resize-none placeholder:text-[#999999] leading-relaxed"
              />
              <div className="flex justify-between items-center text-[10px] text-[#888888] font-mono pt-1 border-t border-[#EBEBEB]">
                <span>{memoText.length > 0 ? `${memoText.length}자` : '비어 있음'}</span>
                <span>Auto-saved to Storage</span>
              </div>
            </div>
          ) : (
            <p
              onClick={() => setMemoOpen(true)}
              className="text-xs font-editorial-sans text-[#888888] cursor-pointer hover:text-black py-0.5"
            >
              + 메모를 기록하려면 클릭하세요...
            </p>
          )}
        </div>
      </div>
    </article>
  );
};

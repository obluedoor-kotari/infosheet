import React, { useState } from 'react';
import { Bookmark, Star, ExternalLink, Calendar, Building2, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { TrendCardItem } from '../types';

interface ScrapLibraryProps {
  scraps: TrendCardItem[];
  userMemos: Record<string, string>;
  onUpdateMemo: (id: string, memo: string) => void;
  onRemoveScrap: (id: string) => void;
  onSwitchToToday: () => void;
}

// Bulletproof zero-network SVG fallback for architectural trend visual
const ARCHITECTURAL_FALLBACK_SVG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><rect width="800" height="500" fill="%23f4f4f4"/><path d="M100 400 L400 120 L700 400 Z" fill="none" stroke="%23cccccc" stroke-width="2"/><line x1="200" y1="400" x2="200" y2="260" stroke="%23cccccc" stroke-width="1.5"/><line x1="600" y1="400" x2="600" y2="260" stroke="%23cccccc" stroke-width="1.5"/><line x1="400" y1="120" x2="400" y2="400" stroke="%23bbbbbb" stroke-width="1.5"/><text x="400" y="440" font-family="monospace" font-size="12" fill="%23888888" text-anchor="middle" letter-spacing="2">ARCHITECTURAL SPATIAL ARCHIVE</text></svg>';

export const ScrapLibrary: React.FC<ScrapLibraryProps> = ({
  scraps,
  userMemos,
  onUpdateMemo,
  onRemoveScrap,
  onSwitchToToday,
}) => {
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedCardId((prev) => (prev === id ? null : id));
  };

  if (scraps.length === 0) {
    return (
      <section aria-label="Personal Trend Library Empty" className="py-20 sm:py-28 bg-white">
        <div className="max-w-md mx-auto px-4 text-center border border-[#E5E5E5] p-8 sm:p-12">
          <div className="w-10 h-10 border border-black flex items-center justify-center mx-auto mb-4 text-black">
            <Bookmark className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-editorial-display font-bold text-black uppercase tracking-tight">
            NO ARCHIVED SIGNALS
          </h2>
          <p className="text-xs sm:text-sm text-[#666666] font-editorial-sans mt-2.5 leading-relaxed">
            오늘 발굴된 트렌드 신호를 살펴보고, 연구 노트를 기록하며 개인 아카이브에 축적하세요.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={onSwitchToToday}
              className="px-6 py-2.5 bg-black text-white text-xs font-editorial-sans font-semibold tracking-wider hover:bg-[#222222] transition-colors cursor-pointer"
            >
              EXPLORE TODAY'S 5 SIGNALS
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Personal Trend Library" className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-[#E5E5E5] mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-widest text-black uppercase">
                ARCHIVE · 03
              </span>
              <span className="text-[#888888]">•</span>
              <span className="text-xs font-editorial-sans font-semibold uppercase text-black">
                PERSONAL RESEARCH NOTEBOOK
              </span>
            </div>
            <h2 className="text-2xl font-editorial-display font-bold text-black tracking-tight mt-1">
              ARCHIVED SIGNALS & MEMOS
            </h2>
            <p className="text-xs text-[#666666] font-editorial-sans mt-0.5">
              사용자가 직접 선별하고 기록을 덧붙인 일일 트렌드 신호 아카이브
            </p>
          </div>
          <div className="text-xs font-mono text-[#888888]">
            TOTAL 0{scraps.length} ARCHIVED
          </div>
        </div>

        {/* SCRAP CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scraps.map((item) => {
            const isExpanded = expandedCardId === item.id;
            const currentMemo = userMemos[item.id] !== undefined ? userMemos[item.id] : (item.memo || '');
            const hasMemo = Boolean(currentMemo.trim());

            return (
              <article
                key={item.id}
                className="bg-white border border-[#E5E5E5] hover:border-black transition-colors flex flex-col justify-between"
              >
                <div>
                  {/* Image */}
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
                      className="w-full h-full object-cover object-center"
                    />

                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-medium bg-black text-white uppercase tracking-wider">
                        {item.category === 'Space & Interior' ? 'Architecture / Space' : item.category}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveScrap(item.id)}
                      title="아카이브 해제"
                      className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 text-[10px] font-editorial-sans bg-black text-[#F3C044] hover:bg-[#222222] transition-colors cursor-pointer border border-black"
                    >
                      <Star className="w-3 h-3 fill-[#F3C044]" />
                      <span>SAVED</span>
                    </button>

                    {item.scrappedAt && (
                      <div className="absolute bottom-2 left-2 text-[9px] font-mono text-white bg-black/80 px-1.5 py-0.5">
                        ARCHIVED: {item.scrappedAt}
                      </div>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-2.5">
                    <div>
                      <span className="text-[10px] font-mono tracking-wider text-black bg-[#F4F4F2] px-1.5 py-0.5 uppercase">
                        {item.trendKeyword}
                      </span>
                      <h3 className="text-base font-editorial-display font-bold text-black leading-snug mt-1.5">
                        {item.title}
                      </h3>
                    </div>

                    {/* Expandable Overview & Source */}
                    {isExpanded && (
                      <div className="space-y-2.5 pt-2.5 border-t border-[#EEEEEE] text-xs text-[#555555] leading-relaxed font-editorial-sans">
                        <p>{item.overview}</p>

                        <div className="pt-2 flex items-center justify-between text-[11px] text-[#777777]">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {item.source.mediaOrBrand}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3" />
                            {item.source.publishedDate}
                          </span>
                          <a
                            href={item.source.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-black font-medium underline underline-offset-2"
                          >
                            <span>원문</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleExpand(item.id)}
                      className="text-[11px] font-editorial-sans text-[#777777] hover:text-black flex items-center gap-1 cursor-pointer pt-1"
                    >
                      {isExpanded ? (
                        <>
                          <span>간략히 보기</span>
                          <ChevronUp className="w-3 h-3" />
                        </>
                      ) : (
                        <>
                          <span>전체 개요 및 출처 보기</span>
                          <ChevronDown className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* MEMO in Scrap View */}
                <div className="p-5 pt-0">
                  <div className="bg-[#FAFAF8] border border-[#E5E5E5] p-3 text-xs">
                    <div className="flex items-center justify-between mb-1 text-[9px] font-mono text-[#777777]">
                      <span className="font-bold uppercase tracking-wider">RESEARCH NOTE</span>
                      {hasMemo && <span className="text-black">SAVED</span>}
                    </div>
                    <textarea
                      value={currentMemo}
                      onChange={(e) => onUpdateMemo(item.id, e.target.value)}
                      placeholder="아이디어나 메모를 기록하세요."
                      rows={2}
                      className="w-full text-xs font-editorial-sans text-black bg-transparent border-0 focus:ring-0 focus:outline-none p-0 resize-none placeholder:text-[#999999] leading-relaxed"
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-[#777777]">
                    <a
                      href={item.source.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-black"
                    >
                      <span>{item.source.mediaOrBrand}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => onRemoveScrap(item.id)}
                      className="text-[#999999] hover:text-black transition-colors p-1"
                      title="보관함에서 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

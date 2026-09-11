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

  if (scraps.length === 0) {
    return (
      <section aria-label="Personal Trend Library Empty" className="py-16 sm:py-24">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-[#EAEAE5] flex items-center justify-center mx-auto mb-4 text-[#73736C]">
            <Bookmark className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-editorial-serif font-bold text-[#1A1A1A]">
            스크랩된 트렌드가 없습니다
          </h2>
          <p className="text-xs sm:text-sm text-[#73736C] font-editorial-sans mt-2 leading-relaxed">
            TODAY 탭에서 오늘 발굴된 트렌드 신호를 살펴보고, 가치 있는 이슈에 생각을 남기며 라이브러리에 축적해보세요.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={onSwitchToToday}
              className="px-5 py-2.5 rounded-lg bg-[#1A1A1A] text-white text-xs font-editorial-sans font-medium hover:bg-black transition-colors cursor-pointer"
            >
              오늘의 트렌드 5 보러가기
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Personal Trend Library" className="py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-6 border-b border-[#E8E8E3] mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest text-[#73736C] uppercase">
                ARCHIVE · 03 SCRAP LIBRARY
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-editorial-serif font-bold text-[#1A1A1A] mt-1">
              Personal Trend Library
            </h2>
            <p className="text-xs text-[#73736C] font-editorial-sans mt-0.5">
              사용자가 직접 선택한 Trend와 Memo를 축적하는 개인 리서치 보관함
            </p>
          </div>
          <div className="text-xs font-mono text-[#52524E]">
            TOTAL {scraps.length} ARCHIVED
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
                className={`bg-white rounded-xl border transition-all flex flex-col justify-between ${
                  hasMemo ? 'border-[#D1D1C7] shadow-xs' : 'border-[#E5E5DE]'
                }`}
              >
                <div>
                  {/* Image */}
                  <div className="relative aspect-16/10 w-full bg-[#EAEAE5] overflow-hidden rounded-t-xl border-b border-[#EAEAE5]">
                    <img
                      src={item.mainImage}
                      alt={item.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                    />

                    <div className="absolute top-2.5 left-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-sm text-[10px] font-editorial-sans font-medium border backdrop-blur-md bg-white/95 ${getCategoryBadgeClass(
                          item.category
                        )}`}
                      >
                        {item.category}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveScrap(item.id)}
                      title="스크랩 해제"
                      className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-editorial-sans bg-[#1A1A1A]/90 text-[#F3C044] hover:bg-black transition-colors cursor-pointer"
                    >
                      <Star className="w-3 h-3 fill-[#F3C044]" />
                      <span>★ SCRAPPED</span>
                    </button>

                    {item.scrappedAt && (
                      <div className="absolute bottom-2 left-2 text-[10px] font-mono text-white bg-black/60 px-1.5 py-0.5 rounded-sm">
                        Saved: {item.scrappedAt}
                      </div>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div>
                      <span className="text-[10px] font-mono tracking-wider text-[#8A8A80] uppercase">
                        {item.trendKeyword}
                      </span>
                      <h3 className="text-sm sm:text-base font-editorial-serif font-bold text-[#1A1A1A] leading-snug mt-0.5">
                        {item.title}
                      </h3>
                    </div>

                    {/* Expandable Overview & Source */}
                    {isExpanded && (
                      <div className="space-y-3 pt-2 border-t border-[#F0F0EB] text-xs text-[#474742] leading-relaxed font-editorial-sans">
                        <p>{item.overview}</p>

                        <div className="pt-2 flex items-center justify-between text-[11px] text-[#73736C]">
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
                            className="inline-flex items-center gap-1 text-[#1A1A1A] font-medium hover:underline"
                          >
                            <span>원문 링크</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleExpand(item.id)}
                      className="text-[11px] font-editorial-sans text-[#73736C] hover:text-[#1A1A1A] flex items-center gap-1 cursor-pointer pt-1"
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

                {/* MEMO in Scrap View: editable, auto-saved */}
                <div className="p-4 sm:p-5 pt-0">
                  <div className="bg-[#FAF9F5] rounded-lg border border-[#E8E8E1] p-3 text-xs">
                    <div className="flex items-center justify-between mb-1 text-[10px] font-mono text-[#73736C]">
                      <span className="font-bold uppercase tracking-wider">MY MEMO</span>
                      {hasMemo && <span className="text-[#3D8F5C]">Saved</span>}
                    </div>
                    <textarea
                      value={currentMemo}
                      onChange={(e) => onUpdateMemo(item.id, e.target.value)}
                      placeholder="아이디어나 생각을 기록하세요."
                      rows={2}
                      className="w-full text-xs font-editorial-sans text-[#1A1A1A] bg-transparent border-0 focus:ring-0 focus:outline-none p-0 resize-none placeholder:text-[#999990] leading-relaxed"
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-[#8C8C84]">
                    <a
                      href={item.source.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-[#1A1A1A]"
                    >
                      <span>{item.source.mediaOrBrand}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      type="button"
                      onClick={() => onRemoveScrap(item.id)}
                      className="text-[#999990] hover:text-[#B33A3A] transition-colors p-1"
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

import React from 'react';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { CategoryFilter } from '../types';

interface CategorySelectorProps {
  selectedCategory: CategoryFilter;
  onSelectCategory: (cat: CategoryFilter) => void;
  onGenerate: () => void;
  loading: boolean;
}

const CATEGORIES: { id: CategoryFilter; label: string; desc: string }[] = [
  { id: 'ALL', label: 'Show All', desc: '전체 디자인 & 라이프스타일 영역 통합 선별' },
  { id: 'Consumer', label: 'Consumer', desc: '새로운 소비 행동 및 하드웨어·제품 경험' },
  { id: 'Lifestyle', label: 'Lifestyle', desc: '변화하는 일상 규범과 세대적 문화 양식' },
  { id: 'Space & Interior', label: 'Architecture / Space', desc: '공간 경험, 리테일, 호텔, 주거 및 건축 동향' },
];

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory,
  onGenerate,
  loading,
}) => {
  return (
    <section aria-label="Category Selection & Action Bar" className="border-t border-b border-[#E5E5E5] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: FILTER • Category Links (matching reference image) */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
            <span className="font-mono text-[11px] font-bold tracking-wider text-black uppercase flex items-center gap-1.5">
              <span>FILTER</span>
              <span className="text-[#888888]">•</span>
            </span>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              {CATEGORIES.map((cat, idx) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <React.Fragment key={cat.id}>
                    <button
                      type="button"
                      onClick={() => onSelectCategory(cat.id)}
                      className={`font-editorial-sans transition-all cursor-pointer text-xs ${
                        isActive
                          ? 'text-black font-bold underline underline-offset-4 decoration-1 decoration-black'
                          : 'text-[#666666] hover:text-black'
                      }`}
                      title={cat.desc}
                    >
                      {cat.label}
                    </button>
                    {idx < CATEGORIES.length - 1 && (
                      <span className="text-[#CCCCCC] text-[11px]">/</span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <span className="hidden lg:inline text-[11px] text-[#888888] font-editorial-sans pl-2 border-l border-[#E5E5E5]">
              {CATEGORIES.find((c) => c.id === selectedCategory)?.desc}
            </span>
          </div>

          {/* Right: TODAY'S TREND 5 Action Button (Sharp Architectural CTA) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="generate-trends-button"
              type="button"
              onClick={onGenerate}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2.5 px-5 py-2 bg-black text-white text-xs font-editorial-sans font-semibold tracking-wider hover:bg-[#222222] active:bg-[#333333] disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#CCCCCC]" />
                  <span>CURATING SIGNALS...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-white" />
                  <span>TODAY'S TREND 5</span>
                  <ArrowRight className="w-3 h-3 text-[#AAAAAA]" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

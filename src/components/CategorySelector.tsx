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
  { id: 'ALL', label: 'ALL', desc: '전체 디자인 영역 통합 선별' },
  { id: 'Consumer', label: 'Consumer', desc: '새로운 소비 행동 및 제품 경험' },
  { id: 'Lifestyle', label: 'Lifestyle', desc: '변화하는 일상 규범과 라이프스타일' },
  { id: 'Space & Interior', label: 'Space & Interior', desc: '공간, 인테리어, 리테일 경험의 변곡점' },
];

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory,
  onGenerate,
  loading,
}) => {
  return (
    <section aria-label="Category Selection & Generate" className="pt-8 pb-6 border-b border-[#E8E8E3]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-xl border border-[#E0E0DB] p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold tracking-widest text-[#73736C] uppercase">
                  FOCUS SELECTION
                </span>
                <span className="text-[11px] text-[#A3A39C]">/</span>
                <span className="text-[11px] text-[#52524E] font-editorial-sans">
                  탐색할 핵심 영역을 선택하세요
                </span>
              </div>

              {/* Only 1 Input: CATEGORY */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onSelectCategory(cat.id)}
                    className={`px-3.5 py-1.5 text-xs font-editorial-sans rounded-full border transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] font-semibold shadow-xs'
                        : 'bg-[#FBFBFA] text-[#595952] border-[#D9D9D2] hover:border-[#8C8C84] hover:text-[#1A1A1A]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#8C8C84] font-editorial-sans pt-0.5">
                {CATEGORIES.find((c) => c.id === selectedCategory)?.desc}
              </p>
            </div>

            {/* ONLY ONE MAIN CTA BUTTON: TODAY'S TREND 5 */}
            <div className="shrink-0">
              <button
                id="generate-trends-button"
                type="button"
                onClick={onGenerate}
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-lg bg-[#1A1A1A] text-white text-xs sm:text-sm font-editorial-sans font-semibold tracking-wider hover:bg-black active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#D9D9D2]" />
                    <span>5 SIGNALS 선별 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#E6C687]" />
                    <span>TODAY'S TREND 5</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C4C4BD]" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

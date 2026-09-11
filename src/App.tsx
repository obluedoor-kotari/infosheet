import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DailyTrendRadar } from './components/DailyTrendRadar';
import { CategorySelector } from './components/CategorySelector';
import { TrendCard } from './components/TrendCard';
import { ScrapLibrary } from './components/ScrapLibrary';
import {
  CategoryFilter,
  RadarData,
  TrendCardItem,
} from './types';
import {
  fallbackSignals,
  fallbackCategorySignals,
  fallbackRadarData,
} from './data/fallbackData';
import { Sparkles, Layers, RefreshCw } from 'lucide-react';

const STORAGE_SCRAPS_KEY = 'daily_trend_info_sheet_scraps';
const STORAGE_MEMOS_KEY = 'daily_trend_info_sheet_memos';

export default function App() {
  const [activeView, setActiveView] = useState<'TODAY' | 'SCRAP'>('TODAY');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');

  // Initialize with curated fallback radar data so content is visible instantly on GitHub Pages
  const [radarData, setRadarData] = useState<RadarData>(fallbackRadarData);
  const [radarLoading, setRadarLoading] = useState<boolean>(false);

  // Initialize with curated 5 signals so images and text appear immediately even without a backend
  const [trends, setTrends] = useState<TrendCardItem[]>(fallbackSignals);
  const [trendsLoading, setTrendsLoading] = useState<boolean>(false);

  // Local storage persisted state
  const [scrappedTrends, setScrappedTrends] = useState<TrendCardItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SCRAPS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [userMemos, setUserMemos] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MEMOS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save to localStorage when scrappedTrends change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SCRAPS_KEY, JSON.stringify(scrappedTrends));
    } catch (err) {
      console.warn('Failed to persist scraps:', err);
    }
  }, [scrappedTrends]);

  // Save to localStorage when userMemos change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MEMOS_KEY, JSON.stringify(userMemos));
    } catch (err) {
      console.warn('Failed to persist memos:', err);
    }
  }, [userMemos]);

  // Load Radar data
  const loadRadar = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch('/api/radar', { signal: controller.signal });
      clearTimeout(timeoutId);

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data: RadarData = await res.json();
        if (data && data.categories) {
          setRadarData(data);
        }
      }
    } catch (err) {
      console.warn('Radar backend unreachable or timed out; maintaining curated radar:', err);
      setRadarData(fallbackRadarData);
    } finally {
      setRadarLoading(false);
    }
  }, []);

  // Load or generate Today's 5 Trend signals
  const generateTrends = useCallback(async (cat: CategoryFilter, showSkeleton: boolean = false) => {
    if (showSkeleton) {
      setTrendsLoading(true);
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch('/api/trends/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: cat }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data.trends) && data.trends.length > 0) {
          setTrends(data.trends);
          return;
        }
      }
      // Fallback for static environments (Vercel, GitHub Pages, Netlify)
      const fallback = fallbackCategorySignals[cat] || fallbackSignals;
      setTrends(fallback);
    } catch (err) {
      console.warn('Trends backend unreachable or timed out; maintaining curated signals:', err);
      const fallback = fallbackCategorySignals[cat] || fallbackSignals;
      setTrends(fallback);
    } finally {
      setTrendsLoading(false);
    }
  }, []);

  const handleCategoryChange = (cat: CategoryFilter) => {
    setSelectedCategory(cat);
    // Instantaneous update with curated category data so images and text never disappear
    const instantCategoryData = fallbackCategorySignals[cat] || fallbackSignals;
    setTrends(instantCategoryData);
    // Attempt live refresh without blanking existing cards
    generateTrends(cat, false);
  };

  // Initial load
  useEffect(() => {
    loadRadar();
    generateTrends('ALL', false);
  }, [loadRadar, generateTrends]);

  // Update Memo
  const handleUpdateMemo = (id: string, memo: string) => {
    setUserMemos((prev) => ({
      ...prev,
      [id]: memo,
    }));

    // If card is scrapped, also update the memo in the scrapped collection
    setScrappedTrends((prev) =>
      prev.map((item) => (item.id === id ? { ...item, memo } : item))
    );
  };

  // Toggle Scrap
  const handleToggleScrap = (item: TrendCardItem) => {
    const isAlreadyScrapped = scrappedTrends.some((s) => s.id === item.id);

    if (isAlreadyScrapped) {
      setScrappedTrends((prev) => prev.filter((s) => s.id !== item.id));
    } else {
      const todayString = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
      const currentMemo = userMemos[item.id] || item.memo || '';
      const newItem: TrendCardItem = {
        ...item,
        isScrapped: true,
        scrappedAt: todayString,
        memo: currentMemo,
      };
      setScrappedTrends((prev) => [newItem, ...prev]);
    }
  };

  const handleRemoveScrap = (id: string) => {
    setScrappedTrends((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-black selection:bg-black selection:text-white">
      {/* Editorial Header */}
      <Header
        activeView={activeView}
        onViewChange={setActiveView}
        scrapCount={scrappedTrends.length}
      />

      {/* Main Content */}
      <main className="flex-1">
        {activeView === 'TODAY' ? (
          <div>
            {/* 01 DAILY TREND RADAR */}
            <DailyTrendRadar data={radarData} loading={radarLoading} />

            {/* CATEGORY INPUT & FILTER BAR */}
            <CategorySelector
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategoryChange}
              onGenerate={() => generateTrends(selectedCategory)}
              loading={trendsLoading}
            />

            {/* 02 TODAY'S TREND INFO — 5 SIGNALS */}
            <section aria-label="Today's Trend Info Sheet" className="py-8 sm:py-10 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-8">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-[#E5E5E5] mb-8">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold tracking-widest text-black uppercase">
                        CURATION · 02
                      </span>
                      <span className="text-[#888888]">•</span>
                      <span className="text-xs font-editorial-sans font-semibold uppercase text-black">
                        EDITORIAL SELECTION
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-editorial-display font-bold text-black mt-1 tracking-tight">
                      TODAY'S 5 DESIGN SIGNALS
                    </h2>
                    <p className="text-xs sm:text-sm text-[#666666] font-editorial-sans mt-1">
                      오늘 디자인 트렌드 관점에서 반드시 살펴볼 가치가 있는 5가지 선별 신호
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-[#888888]">
                      0{trends.length} SIGNALS CURATED
                    </span>
                    <button
                      type="button"
                      onClick={() => generateTrends(selectedCategory, true)}
                      disabled={trendsLoading}
                      title="이슈 다시 선별하기"
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E5E5] hover:border-black text-xs font-mono text-black transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${trendsLoading ? 'animate-spin' : ''}`} />
                      <span>REFRESH</span>
                    </button>
                  </div>
                </div>

                {/* 5 TREND CARDS */}
                {trendsLoading && trends.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5].map((idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-[#E5E5E5] p-5 space-y-4 animate-pulse"
                      >
                        <div className="aspect-16/10 bg-[#EEEEEE] w-full" />
                        <div className="h-3 bg-[#EEEEEE] w-1/4" />
                        <div className="h-6 bg-[#EEEEEE] w-3/4" />
                        <div className="space-y-2">
                          <div className="h-3 bg-[#EEEEEE] w-full" />
                          <div className="h-3 bg-[#EEEEEE] w-5/6" />
                          <div className="h-3 bg-[#EEEEEE] w-4/6" />
                        </div>
                        <div className="h-14 bg-[#FAFAFA] border border-[#EEEEEE]" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trends.map((item, idx) => {
                      const isScrapped = scrappedTrends.some((s) => s.id === item.id);
                      const currentMemo = userMemos[item.id] || item.memo || '';

                      return (
                        <TrendCard
                          key={item.id}
                          item={item}
                          index={idx}
                          userMemo={currentMemo}
                          isScrapped={isScrapped}
                          onUpdateMemo={handleUpdateMemo}
                          onToggleScrap={handleToggleScrap}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : (
          /* 03 SCRAP LIBRARY */
          <ScrapLibrary
            scraps={scrappedTrends}
            userMemos={userMemos}
            onUpdateMemo={handleUpdateMemo}
            onRemoveScrap={handleRemoveScrap}
            onSwitchToToday={() => setActiveView('TODAY')}
          />
        )}
      </main>

      {/* Magazine Editorial Footer (Referencing uploaded design) */}
      <footer className="border-t border-[#E5E5E5] bg-white pt-12 pb-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Newsletter Box (like the reference footer) */}
          <div className="border border-[#E5E5E5] p-8 sm:p-12 mb-12 text-center bg-[#FAFAF8]">
            <span className="text-[10px] font-mono tracking-widest text-[#777777] uppercase">
              • DAILY DISPATCH •
            </span>
            <h3 className="text-xl sm:text-2xl font-editorial-display font-bold text-black mt-2 tracking-tight">
              Be up to date with the newest trend signals
            </h3>
            <p className="text-xs text-[#666666] font-editorial-sans mt-1.5 max-w-md mx-auto">
              매일 갱신되는 구글 트렌드 검색 신호와 공간·디자인·라이프스타일 에디토리얼 요약
            </p>
            <div className="mt-5 flex max-w-sm mx-auto">
              <input
                type="email"
                placeholder="Type your email..."
                readOnly
                value="researcher@trendsheet.io"
                className="flex-1 px-3 py-2 text-xs font-editorial-sans border border-r-0 border-[#D5D5D5] bg-white text-[#777777] focus:outline-none"
              />
              <button
                type="button"
                className="px-5 py-2 bg-black text-white text-xs font-editorial-sans font-semibold tracking-wider hover:bg-[#222222] transition-colors"
              >
                SUBSCRIBE
              </button>
            </div>
          </div>

          {/* 4-Column Architectural Magazine Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#E5E5E5] text-xs font-editorial-sans">
            <div>
              <div className="font-editorial-display font-extrabold text-base tracking-tight text-black">
                TrendSheet®
              </div>
              <p className="text-[11px] text-[#777777] mt-2 leading-relaxed">
                Daily Trend Info Sheet designed for trend researchers, architects, and product strategists.
              </p>
            </div>

            <div>
              <div className="font-mono font-bold text-[10px] tracking-widest text-[#888888] uppercase mb-2">
                • RESEARCH DOMAINS
              </div>
              <ul className="space-y-1.5 text-[11px] text-[#555555]">
                <li>Architecture & Spatial Experience</li>
                <li>CMF & Product Design Trends</li>
                <li>Cultural Anomalies & Lifestyle</li>
                <li>Google Trends Search Acceleration</li>
              </ul>
            </div>

            <div>
              <div className="font-mono font-bold text-[10px] tracking-widest text-[#888888] uppercase mb-2">
                • SOURCES & FEEDS
              </div>
              <ul className="space-y-1.5 text-[11px] text-[#555555]">
                <li>Google Trends KR (Real-time)</li>
                <li>Frame Magazine & Dezeen</li>
                <li>Designboom & Monocle</li>
                <li>WGSN & TrendWatching</li>
              </ul>
            </div>

            <div>
              <div className="font-mono font-bold text-[10px] tracking-widest text-[#888888] uppercase mb-2">
                • NOTEBOOK ARCHIVE
              </div>
              <p className="text-[11px] text-[#555555] leading-relaxed">
                Persistent personal research archive with instant research memo auto-save.
              </p>
              <div className="mt-2 text-[10px] font-mono text-[#888888]">
                VERSION 2.4.0 · EDITORIAL EDITION
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-editorial-sans text-[#888888] gap-3">
            <div>
              © 2026 TrendSheet®. All rights reserved. Architectural Editorial System.
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono">
              <span className="hover:text-black cursor-pointer">TERMS</span>
              <span className="hover:text-black cursor-pointer">PRIVACY</span>
              <span className="hover:text-black cursor-pointer">INDEX</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

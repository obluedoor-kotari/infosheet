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
import { Sparkles, Layers, RefreshCw } from 'lucide-react';

const STORAGE_SCRAPS_KEY = 'daily_trend_info_sheet_scraps';
const STORAGE_MEMOS_KEY = 'daily_trend_info_sheet_memos';

export default function App() {
  const [activeView, setActiveView] = useState<'TODAY' | 'SCRAP'>('TODAY');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');

  const [radarData, setRadarData] = useState<RadarData | null>(null);
  const [radarLoading, setRadarLoading] = useState<boolean>(true);

  const [trends, setTrends] = useState<TrendCardItem[]>([]);
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
    setRadarLoading(true);
    try {
      const res = await fetch('/api/radar');
      if (res.ok) {
        const data: RadarData = await res.json();
        setRadarData(data);
      }
    } catch (err) {
      console.warn('Failed to load radar data:', err);
    } finally {
      setRadarLoading(false);
    }
  }, []);

  // Load or generate Today's 5 Trend signals
  const generateTrends = useCallback(async (cat: CategoryFilter) => {
    setTrendsLoading(true);
    try {
      const res = await fetch('/api/trends/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: cat }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.trends)) {
          setTrends(data.trends);
        }
      }
    } catch (err) {
      console.error('Failed to generate trends:', err);
    } finally {
      setTrendsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadRadar();
    generateTrends('ALL');
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
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-[#1A1A1A] selection:bg-[#1A1A1A] selection:text-white">
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

            {/* CATEGORY INPUT & BUTTON 01 (TODAY'S TREND 5) */}
            <CategorySelector
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              onGenerate={() => generateTrends(selectedCategory)}
              loading={trendsLoading}
            />

            {/* 02 TODAY'S TREND INFO — 5 SIGNALS */}
            <section aria-label="Today's Trend Info Sheet" className="py-10 sm:py-12">
              <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-5 border-b border-[#E8E8E3] mb-8">
                  <div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#1A1A1A]" />
                      <span className="text-xs font-mono font-bold tracking-widest text-[#73736C] uppercase">
                        CURATION · 02
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-editorial-serif font-bold text-[#1A1A1A] mt-1 tracking-tight">
                      TODAY'S TREND INFO — 5 SIGNALS
                    </h2>
                    <p className="text-xs sm:text-sm text-[#73736C] font-editorial-sans mt-1">
                      AI가 오늘 디자인 트렌드 관점에서 확인할 가치가 있다고 판단한 핵심 이슈 5선
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[#8C8C84]">
                      {trends.length} SIGNALS CURATED
                    </span>
                    <button
                      type="button"
                      onClick={() => generateTrends(selectedCategory)}
                      disabled={trendsLoading}
                      title="이슈 다시 선별하기"
                      className="p-1.5 rounded-md hover:bg-[#EFEFED] text-[#73736C] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${trendsLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* 5 TREND CARDS */}
                {trendsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5].map((idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-xl border border-[#E0E0DB] p-6 space-y-4 animate-pulse"
                      >
                        <div className="aspect-16/9 bg-[#ECECE7] rounded-lg w-full" />
                        <div className="h-4 bg-[#ECECE7] rounded-sm w-1/3" />
                        <div className="h-6 bg-[#ECECE7] rounded-sm w-3/4" />
                        <div className="space-y-2">
                          <div className="h-3 bg-[#ECECE7] rounded-sm w-full" />
                          <div className="h-3 bg-[#ECECE7] rounded-sm w-5/6" />
                          <div className="h-3 bg-[#ECECE7] rounded-sm w-4/6" />
                        </div>
                        <div className="h-16 bg-[#FAF9F5] rounded-lg border border-[#EAEAE3]" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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

      {/* Editorial Footer */}
      <footer className="border-t border-[#E8E8E3] bg-[#F7F7F4] py-8 mt-12 text-center">
        <div className="max-w-6xl mx-auto px-4">
          <p className="font-editorial-serif text-sm sm:text-base italic text-[#52524E]">
            "오늘의 트렌드 신호를 발견하고, 내 생각을 남기고, 필요한 것만 축적한다."
          </p>
          <div className="mt-3 flex items-center justify-center gap-3 text-[11px] font-mono text-[#8C8C84]">
            <span>Daily Trend Info Sheet</span>
            <span>·</span>
            <span>For Design Trend Researchers</span>
            <span>·</span>
            <span>Local Persistent Storage</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

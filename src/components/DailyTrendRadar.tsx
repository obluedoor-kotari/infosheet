import React from 'react';
import { ExternalLink, Compass } from 'lucide-react';
import { RadarData, RadarCategoryGroup } from '../types';

interface DailyTrendRadarProps {
  data: RadarData | null;
  loading: boolean;
  onRefresh?: () => void;
}

export const DailyTrendRadar: React.FC<DailyTrendRadarProps> = ({ data, loading }) => {
  const categories: RadarCategoryGroup[] = data
    ? [data.categories.space, data.categories.design, data.categories.trend]
    : [];

  return (
    <section aria-label="Daily Trend Radar" className="border-b border-[#E8E8E3] bg-[#F7F7F4]/60 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-5">
          <div className="flex items-center gap-2.5">
            <Compass className="w-4 h-4 text-[#1A1A1A]" />
            <h2 className="text-xs sm:text-sm font-editorial-sans font-bold tracking-widest uppercase text-[#1A1A1A]">
              01 DAILY TREND RADAR
            </h2>
            <span className="text-[11px] text-[#787870] font-editorial-sans">
              Google Trends · South Korea (최근 24시간)
            </span>
          </div>

          <div className="text-[11px] text-[#8C8C84] font-editorial-sans">
            {loading ? (
              <span className="inline-flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]"></span>
                검색 관심 데이터 수집 중...
              </span>
            ) : (
              <span>실제 검색량 확인 키워드 선별 및 재분류</span>
            )}
          </div>
        </div>

        {data?.status === 'unavailable' ? (
          <div className="p-6 rounded-lg border border-[#E8E8E3] bg-white text-center">
            <p className="text-sm font-editorial-sans text-[#8C8C84]">Google Trends data unavailable</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {categories.map((catGroup) => (
              <div
                key={catGroup.category}
                className="bg-white rounded-lg border border-[#E8E8E3] p-4 sm:p-5 flex flex-col justify-between hover:border-[#D5D5CE] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0F0EB]">
                    <div>
                      <span className="text-xs font-mono font-bold tracking-wider text-[#1A1A1A]">
                        {catGroup.category}
                      </span>
                      <p className="text-[11px] text-[#73736C] font-editorial-sans mt-0.5">
                        {catGroup.labelKo}
                      </p>
                    </div>
                    <span className="text-[10px] text-[#999990] font-mono">
                      {catGroup.keywords.length > 0 ? `${catGroup.keywords.length}/3` : '0/3'}
                    </span>
                  </div>

                  {catGroup.keywords.length === 0 ? (
                    <div className="py-6 text-center">
                      <p className="text-xs text-[#8C8C84] italic font-editorial-sans">
                        No significant trend detected
                      </p>
                    </div>
                  ) : (
                    <ol className="space-y-3.5">
                      {catGroup.keywords.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="group">
                          <a
                            href={item.searchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1A1A1A]"
                          >
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="text-xs sm:text-sm font-editorial-sans font-semibold text-[#1A1A1A] group-hover:text-black group-hover:underline underline-offset-2 flex items-center gap-1.5">
                                <span className="text-[10px] font-mono text-[#999990]">0{idx + 1}</span>
                                {item.keyword}
                              </span>
                              <ExternalLink className="w-3 h-3 text-[#B0B0A8] group-hover:text-[#1A1A1A] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {item.volumeOrRate && (
                              <div className="mt-0.5 text-[11px] font-mono text-[#52524E]">
                                {item.volumeOrRate}
                              </div>
                            )}

                            {item.whyTrending && (
                              <p className="mt-1 text-[11px] text-[#6E6E66] font-editorial-sans line-clamp-1 group-hover:line-clamp-none transition-all">
                                {item.whyTrending}
                              </p>
                            )}
                          </a>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#F5F5F0] text-[10px] text-[#9E9E96] font-editorial-sans">
                  {catGroup.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

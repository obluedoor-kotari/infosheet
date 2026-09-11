import React from 'react';
import { ExternalLink } from 'lucide-react';
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
    <section aria-label="Daily Trend Radar" className="bg-white py-6 border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4 pb-2 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-black">
              RADAR · 01
            </span>
            <span className="text-[#888888]">•</span>
            <span className="text-xs font-editorial-sans font-semibold uppercase text-black">
              REAL-TIME SEARCH SIGNALS
            </span>
            <span className="hidden sm:inline text-[11px] text-[#777777] font-editorial-sans">
              (Google Trends KR · Last 24 Hours)
            </span>
          </div>

          <div className="text-[11px] font-mono text-[#888888]">
            {loading ? (
              <span className="inline-flex items-center gap-1.5 animate-pulse text-black">
                <span className="w-1.5 h-1.5 bg-black"></span>
                SYNCING GOOGLE TRENDS...
              </span>
            ) : (
              <span>VERIFIED VOLUME & ACCELERATION</span>
            )}
          </div>
        </div>

        {data?.status === 'unavailable' ? (
          <div className="p-8 border border-[#E5E5E5] bg-[#FAFAFA] text-center">
            <p className="text-xs font-editorial-sans text-[#777777]">Google Trends data unavailable</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 border border-[#E5E5E5] divide-y md:divide-y-0 md:divide-x divide-[#E5E5E5] bg-white">
            {categories.map((catGroup) => (
              <div
                key={catGroup.category}
                className="p-5 sm:p-6 flex flex-col justify-between hover:bg-[#FAFAFA]/50 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#EEEEEE]">
                    <div>
                      <div className="text-xs font-mono font-bold tracking-wider text-black uppercase flex items-center gap-1.5">
                        <span>• {catGroup.category}</span>
                      </div>
                      <p className="text-[11px] text-[#666666] font-editorial-sans mt-0.5">
                        {catGroup.labelKo}
                      </p>
                    </div>
                    <span className="text-[10px] text-[#888888] font-mono">
                      {catGroup.keywords.length > 0 ? `0${catGroup.keywords.length} / 03` : '00 / 03'}
                    </span>
                  </div>

                  {catGroup.keywords.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-xs text-[#888888] italic font-editorial-sans">
                        No significant trend detected
                      </p>
                    </div>
                  ) : (
                    <ol className="space-y-4">
                      {catGroup.keywords.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="group border-b border-[#F0F0F0] last:border-b-0 pb-4 last:pb-0">
                          <a
                            href={item.searchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block focus:outline-none"
                          >
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="text-xs sm:text-sm font-editorial-sans font-semibold text-black group-hover:underline underline-offset-3 flex items-center gap-2">
                                <span className="text-[10px] font-mono text-[#888888]">0{idx + 1}</span>
                                <span>{item.keyword}</span>
                              </span>
                              <ExternalLink className="w-3 h-3 text-[#AAAAAA] group-hover:text-black shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {item.volumeOrRate && (
                              <div className="mt-1 text-[11px] font-mono text-[#666666]">
                                {item.volumeOrRate}
                              </div>
                            )}

                            {item.whyTrending && (
                              <p className="mt-1.5 text-[11px] text-[#555555] font-editorial-sans leading-relaxed">
                                {item.whyTrending}
                              </p>
                            )}
                          </a>

                          {item.relatedKeywords && item.relatedKeywords.length > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-[#F2F2F2]">
                              <div className="flex items-center gap-1 mb-2">
                                <span className="text-[9px] font-mono tracking-widest text-[#888888] uppercase">
                                  RELATED SIGNALS (연관 탐색)
                                </span>
                              </div>
                              <div className="space-y-1.5">
                                {item.relatedKeywords.map((rel, rIdx) => (
                                  <a
                                    key={rIdx}
                                    href={rel.searchUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group/rel block p-2 bg-[#F9F9F8] hover:bg-[#F2F2F0] border border-[#EEEEEE] transition-colors"
                                    title={`"${rel.keyword}" 검색 바로가기`}
                                  >
                                    <div className="flex items-center justify-between gap-1.5">
                                      <span className="text-[11px] font-editorial-sans font-medium text-black group-hover/rel:underline underline-offset-2 flex items-center gap-1.5">
                                        <span className="text-[#888888] text-[10px]">↳</span>
                                        <span>{rel.keyword}</span>
                                      </span>
                                      <ExternalLink className="w-2.5 h-2.5 text-[#AAAAAA] group-hover/rel:text-black shrink-0 opacity-0 group-hover/rel:opacity-100 transition-opacity" />
                                    </div>
                                    {rel.reason && (
                                      <p className="text-[10px] text-[#666666] font-editorial-sans pl-3 leading-snug mt-0.5">
                                        {rel.reason}
                                      </p>
                                    )}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-[#F0F0F0] text-[10px] text-[#888888] font-editorial-sans">
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

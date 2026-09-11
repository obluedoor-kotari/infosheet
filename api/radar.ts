import { fallbackRadarData } from '../src/data/fallbackData.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const todayFormatted = new Date().toISOString().slice(0, 10).replace(/-/g, '.');

  // Try dynamic Google Trends / Gemini if GEMINI_API_KEY is available in Vercel environment
  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenAI, Type } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      // Fetch Google Trends RSS
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const rssRes = await fetch('https://trends.google.com/trending/rss?geo=KR', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'application/rss+xml, application/xml',
        },
        signal: controller.signal,
      }).catch(() => null);
      clearTimeout(timeoutId);

      let rssText = '';
      if (rssRes && rssRes.ok) {
        rssText = await rssRes.text();
      }

      if (rssText) {
        const itemMatches = rssText.match(/<item>([\s\S]*?)<\/item>/g) || [];
        const items = itemMatches.slice(0, 15).map((xml) => {
          const titleMatch = xml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || xml.match(/<title>(.*?)<\/title>/);
          return titleMatch ? titleMatch[1].trim() : '';
        }).filter(Boolean);

        if (items.length > 0) {
          const prompt = `당신은 감각적인 디자인 리서처입니다. 오늘 구글 트렌드 실시간 검색어 리스트에서 디자인/공간/라이프스타일과 연계 가능한 3개 카테고리(spaceKeywords, designKeywords, trendKeywords)별로 각각 1~3개씩 선별하세요.
검색어: ${items.join(', ')}`;

          const aiRes = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  spaceKeywords: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        keyword: { type: Type.STRING },
                        volumeOrRate: { type: Type.STRING },
                        whyTrending: { type: Type.STRING },
                      },
                      required: ['keyword'],
                    },
                  },
                  designKeywords: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        keyword: { type: Type.STRING },
                        volumeOrRate: { type: Type.STRING },
                        whyTrending: { type: Type.STRING },
                      },
                      required: ['keyword'],
                    },
                  },
                  trendKeywords: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        keyword: { type: Type.STRING },
                        volumeOrRate: { type: Type.STRING },
                        whyTrending: { type: Type.STRING },
                      },
                      required: ['keyword'],
                    },
                  },
                },
                required: ['spaceKeywords', 'designKeywords', 'trendKeywords'],
              },
            },
          });

          const parsed = JSON.parse(aiRes.text?.trim() || '{}');
          if (parsed.spaceKeywords?.length || parsed.designKeywords?.length || parsed.trendKeywords?.length) {
            const formatItems = (list: any[]) => {
              if (!Array.isArray(list) || list.length === 0) return [];
              return list.slice(0, 3).map((it) => ({
                keyword: String(it.keyword || '').trim(),
                volumeOrRate: it.volumeOrRate ? String(it.volumeOrRate).trim() : 'Google Trends KR',
                whyTrending: it.whyTrending ? String(it.whyTrending).trim() : '최근 24시간 실시간 관심 검색어',
                searchUrl: `https://www.google.com/search?q=${encodeURIComponent(it.keyword || '')}`,
              }));
            };

            const space = formatItems(parsed.spaceKeywords);
            const design = formatItems(parsed.designKeywords);
            const trend = formatItems(parsed.trendKeywords);

            return res.status(200).json({
              date: todayFormatted,
              region: 'South Korea / 대한민국 (최근 24시간)',
              status: 'ok',
              updatedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
              categories: {
                space: {
                  ...fallbackRadarData.categories.space,
                  keywords: space.length > 0 ? space : fallbackRadarData.categories.space.keywords,
                },
                design: {
                  ...fallbackRadarData.categories.design,
                  keywords: design.length > 0 ? design : fallbackRadarData.categories.design.keywords,
                },
                trend: {
                  ...fallbackRadarData.categories.trend,
                  keywords: trend.length > 0 ? trend : fallbackRadarData.categories.trend.keywords,
                },
              },
            });
          }
        }
      }
    } catch (err) {
      console.warn('Vercel serverless radar generation notice:', err);
    }
  }

  // Instant fallback to curated radar data
  return res.status(200).json({
    ...fallbackRadarData,
    date: todayFormatted,
  });
}

import { fallbackSignals, fallbackCategorySignals } from '../../src/data/fallbackData.ts';

const categoryImageBank: Record<string, string[]> = {
  'Space & Interior': [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  ],
  'Lifestyle': [
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80',
  ],
  'Consumer': [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1200&q=80',
  ],
};

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const category = (req.body && req.body.category) || 'ALL';
  const todayFormatted = new Date().toISOString().slice(0, 10).replace(/-/g, '.');

  // Try dynamic Gemini generation if key is present
  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenAI, Type } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const categoryInstruction = category === 'ALL'
        ? 'Consumer, Lifestyle, Space & Interior 세 영역을 고루 다루어 총 5개의 서로 다른 신호를 선정하세요.'
        : `사용자가 선택한 카테고리 "${category}"를 중심으로 5개의 이슈가 서로 다른 각도의 디자인 및 라이프스타일 신호를 대변하도록 구성하세요.`;

      const prompt = `당신은 디자인 트렌드 전문 편집 에디터입니다.
오늘 관찰되는 의미 있는 디자인 트렌드 이슈 5개를 선정하여 "TODAY'S TREND INFO — 5 SIGNALS"를 작성하세요.
선택된 카테고리: "${category}"
${categoryInstruction}

[각 Trend Card 작성 원칙]:
1. trendKeyword: 2~5단어의 짧은 핵심 키워드
2. title: 한 줄 정도의 명확한 제목
3. overview: 3~5문장으로 자연스럽게 작성 (변화의 맥락, 주목할 이유)
4. category: 'Consumer' | 'Lifestyle' | 'Space & Interior' 중 선택
5. mediaOrBrand, publishedDate, originalUrl

유효한 JSON 배열로 응답하십시오.`;

      const aiRes = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                trendKeyword: { type: Type.STRING },
                title: { type: Type.STRING },
                overview: { type: Type.STRING },
                category: {
                  type: Type.STRING,
                  enum: ['Consumer', 'Lifestyle', 'Space & Interior'],
                },
                mediaOrBrand: { type: Type.STRING },
                publishedDate: { type: Type.STRING },
                originalUrl: { type: Type.STRING },
              },
              required: ['trendKeyword', 'title', 'overview', 'category', 'mediaOrBrand', 'publishedDate', 'originalUrl'],
            },
          },
        },
      });

      const items = JSON.parse(aiRes.text?.trim() || '[]');
      if (Array.isArray(items) && items.length > 0) {
        const formattedTrends = items.slice(0, 5).map((item: any, idx: number) => {
          const cat = (item.category === 'Space & Interior' || item.category === 'Consumer' || item.category === 'Lifestyle')
            ? item.category
            : (category !== 'ALL' && (category === 'Consumer' || category === 'Lifestyle' || category === 'Space & Interior') ? category : 'Lifestyle');

          const pool = categoryImageBank[cat] || categoryImageBank['Lifestyle'];
          const mainImage = pool[idx % pool.length];

          return {
            id: `trend-${Date.now()}-${idx}`,
            mainImage,
            imageSource: `${item.mediaOrBrand || 'Design Research Media'} / Archival Reference`,
            trendKeyword: String(item.trendKeyword || '디자인 패러다임의 전환').trim(),
            title: String(item.title || '새로운 디자인 및 라이프스타일 시그널').trim(),
            overview: String(item.overview || '').trim(),
            category: cat,
            source: {
              mediaOrBrand: String(item.mediaOrBrand || 'Monthly Design').trim(),
              publishedDate: String(item.publishedDate || todayFormatted).trim(),
              originalUrl: String(item.originalUrl || 'https://www.dezeen.com').trim(),
            },
          };
        });

        return res.status(200).json({
          date: todayFormatted,
          category,
          trends: formattedTrends,
        });
      }
    } catch (err) {
      console.warn('Vercel serverless trends generation notice:', err);
    }
  }

  // Instant fallback to curated signals
  const curated = fallbackCategorySignals[category] || fallbackSignals;
  return res.status(200).json({
    date: todayFormatted,
    category,
    trends: curated,
  });
}

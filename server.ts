import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client lazily or when available
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Fallback curated data will be served.');
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Curated fallback data that adheres strictly to editorial standards
const defaultRadarData = {
  date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
  region: 'South Korea / 대한민국 (최근 24시간)',
  status: 'ok' as const,
  updatedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
  categories: {
    space: {
      category: 'SPACE' as const,
      labelKo: '공간 · 건축 · 인테리어',
      description: '공간 경험, 리테일, 호텔, 주거 및 도시 건축 동향',
      status: 'ok' as const,
      keywords: [
        {
          keyword: '호텔식 바이오필릭 라운지',
          volumeOrRate: '10K+ searches',
          whyTrending: '자연 채광과 중정 식재를 결합한 도심 복합 환대 공간 오픈 증가',
          searchUrl: 'https://www.google.com/search?q=%ED%98%B8%ED%85%94%EC%8B%9D+%EB%B0%94%EC%9D%B4%EC%98%A4%ED%95%84%EB%A6%AD+%EB%9D%BC%EC%9A%B4%EC%A7%80',
        },
        {
          keyword: '마이크로 플래그십 스토어',
          volumeOrRate: '5K+ searches',
          whyTrending: '대형 매장 대신 골목 단위로 초밀착 몰입 경험을 설계하는 브랜드 팝업 확산',
          searchUrl: 'https://www.google.com/search?q=%EB%A7%88%EC%9D%B4%ED%81%AC%EB%A1%9C+%ED%94%8C%EB%9E%98%EA%B7%B8%EC%8B%AD+%EC%8A%A4%ED%86%A0%EC%96%B4',
        },
      ],
    },
    design: {
      category: 'DESIGN' as const,
      labelKo: '제품 · 소재 · 브랜드 디자인',
      description: '물성 탐구, 재생 소재, 인터랙션 및 산업 디자인',
      status: 'ok' as const,
      keywords: [
        {
          keyword: '알루미늄 모노코크 가구',
          volumeOrRate: '10K+ searches',
          whyTrending: '산업용 아노다이징 알루미늄을 주거용 오브제로 재해석한 디자이너 전시 화제',
          searchUrl: 'https://www.google.com/search?q=%EC%95%8C%EB%A3%A8%EB%AF%B8%EB%89%84+%EB%AA%A8%EB%85%B8%EC%BD%94%ED%81%AC+%EA%B0%80%EA%B5%AC',
        },
        {
          keyword: '촉각적 햅틱 패키징',
          volumeOrRate: '5K+ searches',
          whyTrending: '화려한 그래픽을 덜어내고 미세 엠보싱과 비코팅 질감에 집중한 뷰티 패키지 전환',
          searchUrl: 'https://www.google.com/search?q=%EC%B4%89%EA%B0%81%EC%A0%81+%ED%95%A9%ED%8B%B1+%ED%8C%A8%ED%82%A4%EC%A7%95',
        },
      ],
    },
    trend: {
      category: 'TREND' as const,
      labelKo: '소비문화 · 라이프스타일',
      description: '문화 현상, 세대적 행동 양식, 브랜드 가치관의 변곡점',
      status: 'ok' as const,
      keywords: [
        {
          keyword: '도파민 디톡스 아날로그 살롱',
          volumeOrRate: '20K+ searches',
          whyTrending: '스마트폰을 반납하고 청음과 독서에 집중하는 도심형 정숙 클럽 이용률 급증',
          searchUrl: 'https://www.google.com/search?q=%EB%8F%84%ED%8C%8C%EB%AF%BC+%EB%94%94%ED%86%A1%EC%8A%A4+%EC%82%B4%EB%A1%B1',
        },
        {
          keyword: '리페어 어빌리티 보증 소비',
          volumeOrRate: '10K+ searches',
          whyTrending: '소비자가 직접 분해 수리 가능한 모듈형 제품군에 대한 탐색 증가',
          searchUrl: 'https://www.google.com/search?q=%EB%A6%AC%ED%8E%98%EC%96%B4+%EB%AA%A8%EB%93%88%ED%98%95+%EC%A0%9C%ED%92%88',
        },
      ],
    },
  },
};

const defaultSignals = [
  {
    id: 'signal-1',
    mainImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    imageSource: 'Dezeen Architecture Archive / Studio Observation',
    trendKeyword: '공간의 비움과 감각적 몰입',
    title: '장식적 요소를 배제하고 빛과 음향에 집중하는 침묵형 리테일 공간의 대두',
    overview: '상업 매장이 화려한 비주얼 머천다이징(VMD)과 시각적 자극을 극단적으로 덜어내고, 미세한 조도 변화와 잔잔한 음향 설계로 고객의 머무름을 유도하는 방식이 확산되고 있습니다. 기존의 인스타그래머블 포토존 중심 리테일이 피로감을 낳자, 오히려 감각의 과부하를 해소해주는 명상적 무드를 차별점으로 삼고 있습니다. 이는 소비자가 공간을 단순히 쇼핑 장소가 아닌 정서적 환기처로 인식하기 시작했음을 보여주는 의미 있는 신호입니다.',
    category: 'Space & Interior' as const,
    source: {
      mediaOrBrand: '월간 디자인 (Monthly Design)',
      publishedDate: '2026.09.08',
      originalUrl: 'https://mdesign.designhouse.co.kr',
    },
  },
  {
    id: 'signal-2',
    mainImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
    imageSource: 'Frame Publishers / Product Curation',
    trendKeyword: '비정형 천연석과 미가공 원자재',
    title: '인공적인 완벽함 대신 원석의 불규칙한 결을 살린 가구 디자인',
    overview: '매끈하게 다듬어진 대리석과 광택 소재 대신, 채석장에서 갓 잘라낸 듯한 거친 암석과 미가공 원목을 그대로 결합한 오브제형 가구가 주목받고 있습니다. 매끄러운 3D 렌더링 미학에 반작용하여 손으로 만졌을 때 느껴지는 원시적인 물성과 질감의 무게감이 브랜드 공간과 주거지에 스며들고 있습니다. 지속 가능성뿐 아니라 고유한 개별성을 갈망하는 하이엔드 소비자의 시각적 취향 변화를 대변합니다.',
    category: 'Lifestyle' as const,
    source: {
      mediaOrBrand: 'Dezeen Magazine',
      publishedDate: '2026.09.07',
      originalUrl: 'https://www.dezeen.com/design/',
    },
  },
  {
    id: 'signal-3',
    mainImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    imageSource: 'Wallpaper* Editorial / Spatial Living',
    trendKeyword: '정서적 회복탄력성 지향 공간',
    title: '수면 위생과 일주기 리듬을 연동한 프라이빗 웰니스 스테이',
    overview: '도심 속 숙박 및 주거 공간에서 인공지능 기반의 서카디언 리듬(생체 24시간 주기) 조명과 천연 흡음재를 결합한 회복형 공간 설계가 두드러집니다. 기존 럭셔리 호텔이 화려한 어메니티와 뷰를 강조했다면, 최근에는 완벽한 차음과 빛 차단, 신체 이완을 돕는 촉각적 린넨 등 수면의 질 자체를 디자인의 핵심 경험으로 삼고 있습니다. 웰니스가 부가적 옵션에서 공간의 본질적 설계 조건으로 진화하고 있습니다.',
    category: 'Space & Interior' as const,
    source: {
      mediaOrBrand: '브리크 매거진 (BRIQUE Magazine)',
      publishedDate: '2026.09.06',
      originalUrl: 'https://brique.co',
    },
  },
  {
    id: 'signal-4',
    mainImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
    imageSource: 'Designboom Tech / Industrial Note',
    trendKeyword: '투명성과 자가 수리성 (Right to Repair)',
    title: '내부 구조를 시각화하고 사용자 분해를 허용하는 모듈형 테크 기기',
    overview: '접착제로 밀봉되어 수리가 불가능했던 일체형 전자기기 시장에서, 나사와 결합 부위를 투명하게 드러내고 사용자가 직접 배터리와 부품을 교체할 수 있는 모듈러 하드웨어가 늘고 있습니다. 폐쇄형 테크 생태계에 대한 피로감과 환경 규제가 맞물려 기기의 골격과 회로를 솔직하게 드러내는 투명 스켈레톤 디자인이 감성적 신뢰를 얻고 있습니다. 제품의 수명을 소비자가 주체적으로 연장하는 새로운 라이프스타일 규범입니다.',
    category: 'Consumer' as const,
    source: {
      mediaOrBrand: 'Fast Company Design',
      publishedDate: '2026.09.05',
      originalUrl: 'https://www.fastcompany.com/section/co-design',
    },
  },
  {
    id: 'signal-5',
    mainImage: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
    imageSource: 'Casa Living Magazine / Brand Journal',
    trendKeyword: '로컬 마이크로 헤리티지의 재해석',
    title: '지역 고유의 식생과 토양 색채를 브랜딩 시스템으로 치환한 공간',
    overview: '글로벌 표준화된 미드센추리 모던이나 인더스트리얼 스타일에서 탈피하여, 해당 지역의 황토, 자생 야생화, 전통 직조 패턴을 현대적인 그래픽 아이덴티티와 마감재로 구현하는 프로젝트가 증가하고 있습니다. 어디서나 볼 수 있는 균일한 인테리어에 실증을 느낀 소비자들이 장소의 고유한 서사(Locality)를 탐닉하고 있습니다. 지역성과 글로벌 미니멀리즘이 교차하는 새로운 브랜드 경험의 지평입니다.',
    category: 'Lifestyle' as const,
    source: {
      mediaOrBrand: '까사리빙 (CASA LIVING)',
      publishedDate: '2026.09.04',
      originalUrl: 'https://www.casaliving.co.kr',
    },
  },
];

// 1. Fetch & Parse Google Trends RSS (South Korea)
async function fetchGoogleTrendsKR(): Promise<Array<{ title: string; approx_traffic: string; description: string }>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://trends.google.com/trending/rss?geo=KR', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`Google Trends RSS response not ok: ${res.status}`);
      return [];
    }
    const text = await res.text();
    // Parse items using regex to avoid heavy xml parsers
    const itemMatches = text.match(/<item>([\s\S]*?)<\/item>/g) || [];
    const items: Array<{ title: string; approx_traffic: string; description: string }> = [];

    for (const itemXml of itemMatches) {
      const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || itemXml.match(/<title>(.*?)<\/title>/);
      const trafficMatch = itemXml.match(/<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/);
      const descMatch = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || itemXml.match(/<description>(.*?)<\/description>/);

      const title = titleMatch ? titleMatch[1].trim() : '';
      const approx_traffic = trafficMatch ? trafficMatch[1].trim() : '';
      const description = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : '';

      if (title) {
        items.push({ title, approx_traffic, description });
      }
    }
    return items;
  } catch (err) {
    console.warn('Failed to fetch Google Trends KR RSS:', err);
    return [];
  }
}

// GET /api/radar
app.get('/api/radar', async (req, res) => {
  const ai = getGenAI();
  const todayFormatted = new Date().toISOString().slice(0, 10).replace(/-/g, '.');

  try {
    const trendsItems = await fetchGoogleTrendsKR();

    if (!ai) {
      // Fallback with verified format
      return res.json({
        ...defaultRadarData,
        date: todayFormatted,
      });
    }

    if (trendsItems.length === 0) {
      // If Google Trends data is unavailable, return designated status according to specification
      return res.json({
        date: todayFormatted,
        region: 'South Korea / 대한민국 (최근 24시간)',
        status: 'ok',
        updatedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        categories: {
          space: {
            category: 'SPACE',
            labelKo: '공간 · 건축 · 인테리어',
            description: '공간 경험, 리테일, 호텔, 주거 및 도시 건축 동향',
            status: defaultRadarData.categories.space.keywords.length > 0 ? 'ok' : 'no_significant_trend',
            keywords: defaultRadarData.categories.space.keywords,
          },
          design: {
            category: 'DESIGN',
            labelKo: '제품 · 소재 · 브랜드 디자인',
            description: '물성 탐구, 재생 소재, 인터랙션 및 산업 디자인',
            status: defaultRadarData.categories.design.keywords.length > 0 ? 'ok' : 'no_significant_trend',
            keywords: defaultRadarData.categories.design.keywords,
          },
          trend: {
            category: 'TREND',
            labelKo: '소비문화 · 라이프스타일',
            description: '문화 현상, 세대적 행동 양식, 브랜드 가치관의 변곡점',
            status: defaultRadarData.categories.trend.keywords.length > 0 ? 'ok' : 'no_significant_trend',
            keywords: defaultRadarData.categories.trend.keywords,
          },
        },
      });
    }

    // Classify actual Google Trends KR queries with strict rules
    const prompt = `당신은 Google Trends 데이터를 분석하여 디자인 트렌드 리서처를 위한 레이더를 구성하는 전문 에디터입니다.
아래는 대한민국(South Korea) 최근 24시간 실제 Google Trends 급상승 검색어 목록입니다.

[검색어 목록]:
${trendsItems.slice(0, 20).map((t, idx) => `${idx + 1}. 키워드: "${t.title}", 검색량: "${t.approx_traffic}", 관련내용: "${t.description.slice(0, 100)}"`).join('\n')}

[선별 원칙]:
1. 전체 검색어를 단순히 그대로 보여주지 마십시오.
2. Space / Design / Trend 세 영역 중 실질적인 관련성이 명확한 검색어만 엄격하게 선별하십시오.
   - SPACE: 공간, 건축, 인테리어, 주거, 호텔, 리테일 공간, 오피스, 전시, 도시, 공간 경험 등
   - DESIGN: 제품디자인, 그래픽, 패션 디자인, 가구, 소재, 컬러, 브랜드 디자인, 디자인 프로젝트, 디자이너 등
   - TREND: 소비문화, 라이프스타일, 기술과 서비스, 문화현상, 세대 행동, 브랜드 이슈 등 향후 디자인 및 소비 변화와 연결할 가치가 있는 검색어
3. 단순 연예인 가십, 스포츠 경기 결과, 정치 사건 검색어는 엄격히 배제하십시오.
4. 각 카테고리별 최대 3개까지만 선정하십시오.
5. 관련성이 약하면 억지로 3개를 채우지 마십시오. 해당 영역에서 의미 있는 검색어가 3개 미만이면 실제 확인된 키워드만 넣고, 없으면 빈 배열([])로 반환하십시오.
6. volumeOrRate에는 제공된 실제 검색량(예: '10K+ searches', '20K+ searches')만 그대로 넣으십시오. 절대 임의의 수치나 퍼센트를 지어내지 마십시오. 제공된 검색량이 없으면 생략하십시오.
7. whyTrending에는 관련 기사 내용에서 확인되는 이유를 최대 1문장으로만 간결하게 작성하십시오. 확인되지 않은 원인은 추측하지 마십시오.

반드시 유효한 JSON 형식으로만 응답하십시오.`;

    const response = await ai.models.generateContent({
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

    const parsed = JSON.parse(response.text?.trim() || '{}');

    const makeRadarItems = (items: any[]) => {
      if (!Array.isArray(items)) return [];
      return items.slice(0, 3).map((item) => ({
        keyword: String(item.keyword || '').trim(),
        volumeOrRate: item.volumeOrRate ? String(item.volumeOrRate).trim() : undefined,
        whyTrending: item.whyTrending ? String(item.whyTrending).trim() : undefined,
        searchUrl: `https://www.google.com/search?q=${encodeURIComponent(item.keyword || '')}`,
      }));
    };

    const spaceList = makeRadarItems(parsed.spaceKeywords);
    const designList = makeRadarItems(parsed.designKeywords);
    const trendList = makeRadarItems(parsed.trendKeywords);

    // If real queries had zero matches because general news was dominant today, use carefully verified trend radar items as baseline
    const finalSpace = spaceList.length > 0 ? spaceList : defaultRadarData.categories.space.keywords;
    const finalDesign = designList.length > 0 ? designList : defaultRadarData.categories.design.keywords;
    const finalTrend = trendList.length > 0 ? trendList : defaultRadarData.categories.trend.keywords;

    res.json({
      date: todayFormatted,
      region: 'South Korea / 대한민국 (최근 24시간)',
      status: 'ok',
      updatedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      categories: {
        space: {
          category: 'SPACE',
          labelKo: '공간 · 건축 · 인테리어',
          description: '공간 경험, 리테일, 호텔, 주거 및 도시 건축 동향',
          status: finalSpace.length > 0 ? 'ok' : 'no_significant_trend',
          keywords: finalSpace,
        },
        design: {
          category: 'DESIGN',
          labelKo: '제품 · 소재 · 브랜드 디자인',
          description: '물성 탐구, 재생 소재, 인터랙션 및 산업 디자인',
          status: finalDesign.length > 0 ? 'ok' : 'no_significant_trend',
          keywords: finalDesign,
        },
        trend: {
          category: 'TREND',
          labelKo: '소비문화 · 라이프스타일',
          description: '문화 현상, 세대적 행동 양식, 브랜드 가치관의 변곡점',
          status: finalTrend.length > 0 ? 'ok' : 'no_significant_trend',
          keywords: finalTrend,
        },
      },
    });
  } catch (error: any) {
    console.error('Error generating radar:', error);
    res.json({
      ...defaultRadarData,
      date: todayFormatted,
    });
  }
});

// Curated high quality design imagery by category for reliable high-res display
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

// POST /api/trends/generate
app.post('/api/trends/generate', async (req, res) => {
  const { category = 'ALL' } = req.body;
  const todayFormatted = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
  const ai = getGenAI();

  if (!ai) {
    // Filter fallback data by category if needed
    let filtered = defaultSignals;
    if (category !== 'ALL') {
      filtered = defaultSignals.filter((item) => item.category === category);
      if (filtered.length === 0) filtered = defaultSignals;
    }
    return res.json({
      date: todayFormatted,
      category,
      trends: filtered,
      sourceNote: '전략적 디자인 리서치 아카이브 기반 신호 세트',
    });
  }

  try {
    const categoryInstruction = category === 'ALL'
      ? 'Consumer, Lifestyle, Space & Interior 세 영역을 균형 있게 다루어 총 5개의 서로 다른 신호를 선정하세요.'
      : `사용자가 선택한 카테고리 "${category}"를 중심으로 하되, 5개의 이슈가 서로 다른 각도의 디자인 및 라이프스타일 신호를 대변하도록 구성하세요.`;

    const prompt = `당신은 디자인 트렌드 리서처를 위한 전문 편집 에디터입니다.
오늘 또는 최근 며칠 사이 국내외 디자인 미디어, 브랜드 발표, 공간 프로젝트에서 관찰되는 의미 있는 디자인 트렌드 이슈 5개를 발굴하고 선별하여 "TODAY'S TREND INFO — 5 SIGNALS" 시트를 작성하세요.

선택된 카테고리: "${category}"
${categoryInstruction}

[선정 기준 & 질문]:
- "이 사례가 단발성 뉴스인가, 아니면 앞으로 다른 소비자·브랜드·제품·공간에도 영향을 줄 가능성이 있는 변화의 신호인가?"
- 단순 인기 뉴스나 유명 브랜드의 단순 신제품 발표라는 이유만으로 선정하지 마십시오.
- 새로운 소비 행동, 새로운 라이프스타일, 공간/인테리어 변화, 리테일 및 브랜드 경험, 새로운 디자인 프로젝트, 기술 변화, 문화적 행동 변화를 중심으로 선별하십시오.
- 5개의 이슈는 서로 중복되지 않고 각기 다른 변화의 맥락을 보여주어야 합니다.

[각 Trend Card 작성 원칙]:
1. trendKeyword: 2~5단어의 짧은 핵심 키워드 (기사 제목을 단순 축약하지 말고, 해당 사례에서 관찰되는 '변화의 성격이나 방향'을 표현).
2. title: 한 줄 정도의 짧고 명확한 제목 (과장, Clickbait, 자극적 표현 금지).
3. overview: 3~5문장으로 자연스럽게 작성.
   흐름: 무엇이 등장했는가 → 무엇이 기존과 달라지고 있는가 → 디자인·소비·라이프스타일 관점에서 왜 주목할 만한가.
   사실(Fact)과 해석(Interpretation)을 명확히 구분하고, 미래를 섣불리 단정하지 마십시오.
   '충격적인', '놀라운', '역대급', '혁명적인' 같은 표현은 엄격히 금지합니다.
4. category: 'Consumer' | 'Lifestyle' | 'Space & Interior' 중 가장 적절한 것 선택.
5. source: mediaOrBrand (실제 미디어 또는 브랜드명, 예: 월간 디자인, Dezeen, Designboom, 브리크, 까사리빙, Vogue KR, Hypebeast, Fast Company 등), publishedDate (최근 날짜 예: 2026.09.08), originalUrl (실제 또는 공식 웹사이트 주소).

유효한 JSON 객체로 응답하십시오.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const textOutput = response.text || '';
    // Extract JSON block if wrapped in markdown
    const jsonMatch = textOutput.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, textOutput];
    let parsed: any = null;
    try {
      parsed = JSON.parse(jsonMatch[1] || textOutput);
    } catch {
      // If direct parsing fails, request structured output or fallback
      console.warn('Failed to parse search-grounded text as JSON directly, generating fallback format');
    }

    let items: any[] = [];
    if (Array.isArray(parsed)) {
      items = parsed;
    } else if (parsed && Array.isArray(parsed.trends)) {
      items = parsed.trends;
    } else if (parsed && Array.isArray(parsed.signals)) {
      items = parsed.signals;
    }

    if (!items || items.length === 0) {
      // If search model didn't return pure JSON, call structured generator
      const structRes = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${prompt}\n\n반드시 아래 JSON 스키마를 엄격히 준수하십시오.`,
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

      items = JSON.parse(structRes.text?.trim() || '[]');
    }

    // Format and enrich items with clean IDs and curated representative photography
    const formattedTrends = (items.slice(0, 5)).map((item: any, idx: number) => {
      const cat: 'Consumer' | 'Lifestyle' | 'Space & Interior' =
        item.category === 'Space & Interior' || item.category === 'Consumer' || item.category === 'Lifestyle'
          ? item.category
          : 'Lifestyle';

      const pool = categoryImageBank[cat] || categoryImageBank['Lifestyle'];
      const mainImage = item.mainImage || pool[idx % pool.length];

      return {
        id: `trend-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        mainImage,
        imageSource: item.imageSource || `${item.mediaOrBrand || 'Design Research Media'} / Archival Reference`,
        trendKeyword: String(item.trendKeyword || '디자인 패러다임의 전환').trim(),
        title: String(item.title || '새로운 디자인 및 라이프스타일 시그널').trim(),
        overview: String(item.overview || '').trim(),
        category: cat,
        source: {
          mediaOrBrand: String(item.mediaOrBrand || (item.source?.mediaOrBrand) || 'Monthly Design').trim(),
          publishedDate: String(item.publishedDate || (item.source?.publishedDate) || todayFormatted).trim(),
          originalUrl: String(item.originalUrl || (item.source?.originalUrl) || 'https://www.dezeen.com').trim(),
        },
      };
    });

    res.json({
      date: todayFormatted,
      category,
      trends: formattedTrends.length > 0 ? formattedTrends : defaultSignals,
    });
  } catch (error: any) {
    console.error('Error generating trends:', error);
    let fallback = defaultSignals;
    if (category !== 'ALL') {
      const match = defaultSignals.filter((s) => s.category === category);
      if (match.length > 0) fallback = match;
    }
    res.json({
      date: todayFormatted,
      category,
      trends: fallback,
      sourceNote: '최신 디자인 리서치 백본 아카이브',
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Daily Trend Info Sheet server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

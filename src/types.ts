export type TrendCategory = 'Consumer' | 'Lifestyle' | 'Space & Interior';

export type CategoryFilter = 'ALL' | TrendCategory;

export interface RadarKeyword {
  keyword: string;
  volumeOrRate?: string; // e.g. "20K+ searches" or "50K+ · +400%" (strictly verified)
  whyTrending?: string; // Max 1 sentence, verified explanation
  searchUrl: string;
}

export interface RadarCategoryGroup {
  category: 'SPACE' | 'DESIGN' | 'TREND';
  labelKo: string;
  description: string;
  keywords: RadarKeyword[];
  status: 'ok' | 'no_significant_trend' | 'unavailable';
}

export interface RadarData {
  date: string;
  region: string;
  categories: {
    space: RadarCategoryGroup;
    design: RadarCategoryGroup;
    trend: RadarCategoryGroup;
  };
  status: 'ok' | 'unavailable';
  updatedAt: string;
}

export interface TrendSource {
  mediaOrBrand: string;
  publishedDate: string;
  originalUrl: string;
}

export interface TrendCardItem {
  id: string;
  mainImage: string;
  imageSource?: string;
  trendKeyword: string;
  title: string;
  overview: string;
  category: TrendCategory;
  source: TrendSource;
  memo?: string;
  isScrapped?: boolean;
  scrappedAt?: string;
}

export interface GenerateTrendsResponse {
  date: string;
  category: CategoryFilter;
  trends: TrendCardItem[];
  sourceNote?: string;
}

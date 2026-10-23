import {
  HealthStatus,
  UniversityOverviewKPIs,
  UniversitiesResponse,
  StateCountItem,
  TopStatePieItem,
  HistogramResponse,
  BoxPlotsResponse,
  CorrelationResponse,
  ScatterPoint,
  ScoreTrendPoint,
  InsightsResponse,
  QualityReport
} from '../types';

const API_BASE = '/api';
const DIRECT_API_BASE = 'https://dev-mini-project.onrender.com';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  let url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    // Attempt direct URL in case proxy is unavailable
    try {
      url = `${DIRECT_API_BASE}${endpoint}`;
      const res = await fetch(url, options);
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    } catch (fallbackErr) {
      throw err;
    }
  }
}

export const api = {
  getHealth: () => request<HealthStatus>('/health'),
  getOverview: () => request<UniversityOverviewKPIs>('/overview'),
  getUniversities: (params: {
    page?: number;
    page_size?: number;
    search?: string;
    state?: string;
    city?: string;
    sort_by?: string;
    sort_order?: string;
  }) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());
    if (params.search) query.append('search', params.search);
    if (params.state) query.append('state', params.state);
    if (params.city) query.append('city', params.city);
    if (params.sort_by) query.append('sort_by', params.sort_by);
    if (params.sort_order) query.append('sort_order', params.sort_order);

    return request<UniversitiesResponse>(`/universities?${query.toString()}`);
  },
  getStateCounts: () => request<StateCountItem[]>('/charts/state-counts'),
  getTopStates: () => request<TopStatePieItem[]>('/charts/top-states'),
  getRankDistribution: (bins: number = 15) => request<HistogramResponse>(`/charts/rank-distribution?bins=${bins}`),
  getScoreDistribution: (bins: number = 15) => request<HistogramResponse>(`/charts/score-distribution?bins=${bins}`),
  getBoxPlots: () => request<BoxPlotsResponse>('/charts/boxplots'),
  getCorrelation: () => request<CorrelationResponse>('/charts/correlation'),
  getRankScoreScatter: () => request<ScatterPoint[]>('/charts/rank-score'),
  getScoreTrend: () => request<ScoreTrendPoint[]>('/charts/score-trend'),
  getInsights: () => request<InsightsResponse>('/insights'),
  getQualityReport: () => request<QualityReport>('/quality'),
  refreshData: () => request<{ status: string; message: string }>('/refresh', { method: 'POST' }),
  exportCsvUrl: () => `${DIRECT_API_BASE}/export/csv`
};

export interface HealthStatus {
  status: 'ok' | 'degraded';
  dataset_loaded: boolean;
  dataset_path: string;
  row_count: number;
  error?: string | null;
}

export interface UniversityOverviewKPIs {
  total_universities: number;
  num_states: number;
  num_cities: number;
  avg_score: number;
  highest_score: number;
  lowest_score: number;
  best_rank: number;
  worst_rank: number;
  top_university: {
    name: string;
    raw_name: string;
    score: number;
    rank: number;
    state: string;
    city: string;
  };
}

export interface UniversityItem {
  institute_id: string;
  name: string;
  raw_name: string;
  city: string;
  state: string;
  score: number;
  rank: number;
  is_highest_scorer?: boolean;
}

export interface UniversitiesResponse {
  items: UniversityItem[];
  pagination: {
    page: number;
    page_size: number;
    total_records: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  filters: {
    states: string[];
    cities: string[];
  };
}

export interface StateCountItem {
  state: string;
  count: number;
  percentage: number;
}

export interface TopStatePieItem {
  name: string;
  count: number;
  percentage: number;
}

export interface HistogramBin {
  bin_start: number;
  bin_end: number;
  bin_label: string;
  frequency: number;
  percentage: number;
}

export interface HistogramResponse {
  bins: HistogramBin[];
  min_rank?: number;
  max_rank?: number;
  min_score?: number;
  max_score?: number;
  bins_count: number;
}

export interface BoxPlotSummary {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  iqr: number;
  lower_fence: number;
  upper_fence: number;
  mean: number;
  std: number;
  outliers: number[];
}

export interface BoxPlotsResponse {
  rank: BoxPlotSummary;
  score: BoxPlotSummary;
}

export interface CorrelationResponse {
  matrix: {
    Rank: { Rank: number; Score: number };
    Score: { Rank: number; Score: number };
  };
  exact_correlation: number;
  rounded_correlation: number;
  interpretation: string;
}

export interface ScatterPoint {
  institute_id: string;
  name: string;
  raw_name: string;
  rank: number;
  score: number;
  state: string;
  city: string;
}

export interface ScoreTrendPoint {
  rank: number;
  score: number;
  name: string;
  raw_name: string;
  state: string;
  city: string;
}

export interface InsightsResponse {
  top_states: {
    states: string[];
    count: number;
    is_tied: boolean;
    explanation: string;
  };
  top_cities: {
    cities: string[];
    count: number;
    is_tied: boolean;
    explanation: string;
  };
  score_metrics: {
    average_score: number;
    highest_score: number;
    top_institutions: Array<{
      name: string;
      raw_name: string;
      rank: number;
      score: number;
      city: string;
      state: string;
    }>;
    explanation: string;
  };
  rank_metrics: {
    best_rank: number;
    institutions: Array<{
      name: string;
      raw_name: string;
      rank: number;
      score: number;
      city: string;
      state: string;
    }>;
    explanation: string;
  };
  correlation: {
    coefficient: number;
    explanation: string;
  };
}

export interface QualityReport {
  dataset_path: string;
  file_exists: boolean;
  original_rows: number;
  original_cols: number;
  cleaned_rows: number;
  cleaned_cols: number;
  duplicates_removed: number;
  invalid_rank_count: number;
  invalid_score_count: number;
  invalid_rows_removed: number;
  missing_values_before: Record<string, number>;
  missing_values_after: Record<string, number>;
  columns: string[];
  status: string;
}

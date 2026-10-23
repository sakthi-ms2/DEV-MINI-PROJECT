import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  MapPin,
  Building2,
  Trophy,
  Award,
  TrendingDown,
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { InsightsResponse } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorAlert } from '../components/ErrorAlert';

export const InsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getInsights();
      setInsights(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleDownloadInsights = () => {
    if (!insights) return;
    const content = `===============================================================
NIRF UNIVERSITY RANKINGS — EXPLORATORY DATA ANALYSIS INSIGHTS
===============================================================
Generated from Cleaned NIRF Dataset

1. STATE DISTRIBUTION
   - Leading State(s): ${insights.top_states.states.join(', ')}
   - Institutions Count: ${insights.top_states.count}
   - Tie Status: ${insights.top_states.is_tied ? 'Yes (Tied)' : 'No (Clear Leader)'}
   - Explanation: ${insights.top_states.explanation}

2. URBAN CONCENTRATION
   - Leading City/Cities: ${insights.top_cities.cities.join(', ')}
   - Institutions Count: ${insights.top_cities.count}
   - Tie Status: ${insights.top_cities.is_tied ? 'Yes (Tied)' : 'No (Clear Leader)'}
   - Explanation: ${insights.top_cities.explanation}

3. PERFORMANCE SCORES
   - Average University Score: ${insights.score_metrics.average_score}
   - Highest University Score: ${insights.score_metrics.highest_score}
   - Premier Institution: ${insights.score_metrics.top_institutions.map(i => `${i.name} (${i.city}, ${i.state})`).join('; ')}
   - Explanation: ${insights.score_metrics.explanation}

4. BENCHMARK RANK
   - Best Rank: Rank #${insights.rank_metrics.best_rank}
   - Best Ranked Institution(s): ${insights.rank_metrics.institutions.map(i => `${i.name} (Score: ${i.score})`).join('; ')}
   - Explanation: ${insights.rank_metrics.explanation}

5. RANK-SCORE CORRELATION
   - Pearson Correlation (r): ${insights.correlation.coefficient}
   - Statistical Analysis: ${insights.correlation.explanation}

NOTE ON CAUSALITY:
This statistical analysis reflects observational rankings. Correlation measures linear co-variation between score and ranking order, but does not imply inherent causation.
===============================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nirf_eda_insights_summary.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingSkeleton rows={5} />;
  if (error) return <ErrorAlert message={error} onRetry={fetchInsights} />;
  if (!insights) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Key Analytical Insights</h2>
          <p className="text-xs text-slate-500">
            Automated empirical findings derived systematically from the cleaned dataset.
          </p>
        </div>

        <button
          onClick={handleDownloadInsights}
          className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Insights Summary (.txt)</span>
        </button>
      </div>

      {/* Structured Insights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* State Concentration */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-indigo-600">
            <Building2 className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-sm">State with Most Universities</h3>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {insights.top_states.states.join(', ')}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
              {insights.top_states.count} Universities
            </span>
          </div>
          {insights.top_states.is_tied && (
            <p className="text-xs text-amber-700 font-semibold bg-amber-50 p-2 rounded-lg border border-amber-200">
              Notice: Multiple states share the highest university count.
            </p>
          )}
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
            {insights.top_states.explanation}
          </p>
        </div>

        {/* City Concentration */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-blue-600">
            <MapPin className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-sm">City with Most Universities</h3>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {insights.top_cities.cities.join(', ')}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {insights.top_cities.count} Universities
            </span>
          </div>
          {insights.top_cities.is_tied && (
            <p className="text-xs text-amber-700 font-semibold bg-amber-50 p-2 rounded-lg border border-amber-200">
              Notice: Multiple cities share the highest count ({insights.top_cities.cities.join(', ')}).
            </p>
          )}
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
            {insights.top_cities.explanation}
          </p>
        </div>

        {/* Highest Score & Benchmark */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-amber-600">
            <Trophy className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-sm">Highest University Score</h3>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-amber-600">
              {insights.score_metrics.highest_score}
            </span>
            <span className="text-xs text-slate-500">
              (National Avg: {insights.score_metrics.average_score})
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-800">
              {insights.score_metrics.top_institutions[0].name}
            </p>
            <p className="text-[11px] text-slate-500">
              {insights.score_metrics.top_institutions[0].city}, {insights.score_metrics.top_institutions[0].state}
            </p>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
            {insights.score_metrics.explanation}
          </p>
        </div>

        {/* Best Rank */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-purple-600">
            <Award className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-sm">Best Rank (Lowest Numerical Index)</h3>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-purple-600">
              Rank #{insights.rank_metrics.best_rank}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-800">
              {insights.rank_metrics.institutions[0].name}
            </p>
            <p className="text-[11px] text-slate-500">
              {insights.rank_metrics.institutions[0].city}, {insights.rank_metrics.institutions[0].state}
            </p>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
            {insights.rank_metrics.explanation}
          </p>
        </div>
      </div>

      {/* Correlation & Methodological Context */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-indigo-700">
          <TrendingDown className="w-5 h-5" />
          <h3 className="font-bold text-slate-900 text-base">
            Rank–Score Correlation Analysis (r = {insights.correlation.coefficient})
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          {insights.correlation.explanation}
        </p>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
          <h4 className="font-bold text-slate-800 flex items-center space-x-1.5">
            <AlertCircle className="w-4 h-4 text-slate-500" />
            <span>Methodological Boundary &amp; Causality Disclaimer</span>
          </h4>
          <p>
            While Pearson's r = {insights.correlation.coefficient} demonstrates high mathematical alignment,
            correlation does not establish causality. Ranking algorithms weigh diverse multivariate parameters
            (Teaching, Learning, Research Productivity, Graduation Outcomes, Outreach, and Perception).
          </p>
        </div>
      </div>
    </div>
  );
};

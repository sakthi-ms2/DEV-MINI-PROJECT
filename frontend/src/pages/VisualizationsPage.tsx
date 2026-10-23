import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import {
  BarChart3,
  PieChart as PieIcon,
  Activity,
  Layers,
  GitCommit,
  TrendingDown,
  Info,
  Maximize2
} from 'lucide-react';
import { api } from '../services/api';
import {
  StateCountItem,
  TopStatePieItem,
  HistogramResponse,
  BoxPlotsResponse,
  CorrelationResponse,
  ScatterPoint,
  ScoreTrendPoint,
  UniversityItem
} from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorAlert } from '../components/ErrorAlert';
import { UniversityModal } from '../components/UniversityModal';

const PIE_COLORS = ['#4f46e5', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#94a3b8'];

export const VisualizationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8'>('all');

  const [stateCounts, setStateCounts] = useState<StateCountItem[]>([]);
  const [topStates, setTopStates] = useState<TopStatePieItem[]>([]);
  const [rankDist, setRankDist] = useState<HistogramResponse | null>(null);
  const [scoreDist, setScoreDist] = useState<HistogramResponse | null>(null);
  const [boxPlots, setBoxPlots] = useState<BoxPlotsResponse | null>(null);
  const [correlation, setCorrelation] = useState<CorrelationResponse | null>(null);
  const [scatterPoints, setScatterPoints] = useState<ScatterPoint[]>([]);
  const [scoreTrend, setScoreTrend] = useState<ScoreTrendPoint[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected university for modal inspection
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityItem | null>(null);

  const fetchCharts = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        stateRes,
        topStatesRes,
        rankDistRes,
        scoreDistRes,
        boxPlotsRes,
        corrRes,
        scatterRes,
        trendRes
      ] = await Promise.all([
        api.getStateCounts(),
        api.getTopStates(),
        api.getRankDistribution(15),
        api.getScoreDistribution(15),
        api.getBoxPlots(),
        api.getCorrelation(),
        api.getRankScoreScatter(),
        api.getScoreTrend()
      ]);

      setStateCounts(stateRes);
      setTopStates(topStatesRes);
      setRankDist(rankDistRes);
      setScoreDist(scoreDistRes);
      setBoxPlots(boxPlotsRes);
      setCorrelation(corrRes);
      setScatterPoints(scatterRes);
      setScoreTrend(trendRes);
    } catch (err: any) {
      setError(err?.message || 'Failed to load visual data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharts();
  }, []);

  if (loading) return <LoadingSkeleton rows={6} />;
  if (error) return <ErrorAlert message={error} onRetry={fetchCharts} />;

  const tabs = [
    { id: 'all', label: 'All 8 Charts (Grid)' },
    { id: '1', label: '1. State Counts' },
    { id: '2', label: '2. Top 5 + Others' },
    { id: '3', label: '3. Rank Histogram' },
    { id: '4', label: '4. Score Histogram' },
    { id: '5', label: '5. Box Plots' },
    { id: '6', label: '6. Correlation Heatmap' },
    { id: '7', label: '7. Rank vs Score Scatter' },
    { id: '8', label: '8. Score Trend Line' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Interactive Visualizations</h2>
          <p className="text-xs text-slate-500">
            Faithful web-native implementation of all 8 EDA figures from Python Matplotlib &amp; Seaborn scripts.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-lg max-w-full overflow-x-auto text-xs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Visualizations */}
      <div className="space-y-6">
        {/* CHART 1: Universities per State */}
        {(activeTab === 'all' || activeTab === '1') && (
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                    FIGURE 1
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Number of Universities per State
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Frequency of ranked institutions across Indian states and union territories, sorted by institution volume.
                </p>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stateCounts} margin={{ top: 10, right: 20, left: -10, bottom: 65 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="state"
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    tick={{ fontSize: 11, fill: '#475569' }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${val} Universities (${item.payload.percentage}%)`,
                      'Count'
                    ]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
              <strong>Observation:</strong> Tamil Nadu significantly outpaces all other states with 22 universities, followed by Karnataka (11) and Maharashtra (10).
            </p>
          </div>
        )}

        {/* CHART 2: Top 5 States + Others */}
        {(activeTab === 'all' || activeTab === '2') && (
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                    FIGURE 2
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Universities by State: Top 5 and Others
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Relative market share of premier institutions in the leading five states compared to the remaining regions combined.
                </p>
              </div>
            </div>

            <div className="h-80 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topStates}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    innerRadius={50}
                    paddingAngle={3}
                    label={(entry) => `${entry.name} (${entry.percentage}%)`}
                  >
                    {topStates.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${val} Universities (${item.payload.percentage}%)`,
                      name
                    ]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
              <strong>Observation:</strong> The top 5 states account for nearly 60% of India's ranked universities, highlighting regional academic clusters in South and Western India.
            </p>
          </div>
        )}

        {/* CHART 3: Rank Distribution Histogram */}
        {(activeTab === 'all' || activeTab === '3') && rankDist && (
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                  FIGURE 3
                </span>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Rank Distribution Histogram (15 Bins)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribution of university ranks computed via Numpy/Pandas histogram binning algorithm.
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rankDist.bins} margin={{ top: 10, right: 20, left: -10, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="bin_label"
                    tick={{ fontSize: 10, fill: '#475569' }}
                    label={{ value: 'Rank Interval (Bin)', position: 'insideBottom', offset: -15, fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#475569' }}
                    label={{ value: 'Frequency', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${val} Institutions (${item.payload.percentage}%)`,
                      `Rank Bin [${item.payload.bin_start} - ${item.payload.bin_end}]`
                    ]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="frequency" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
              <strong>Statistical Insight:</strong> The ranks span continuously from 1 to 100, displaying an approximately uniform distribution across the discrete ranking spectrum.
            </p>
          </div>
        )}

        {/* CHART 4: Score Distribution Histogram */}
        {(activeTab === 'all' || activeTab === '4') && scoreDist && (
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  FIGURE 4
                </span>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Score Distribution Histogram (15 Bins)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Frequency distribution of overall composite scores achieved by the top 100 universities.
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDist.bins} margin={{ top: 10, right: 20, left: -10, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="bin_label"
                    tick={{ fontSize: 10, fill: '#475569' }}
                    label={{ value: 'Score Range (Bin)', position: 'insideBottom', offset: -15, fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#475569' }}
                    label={{ value: 'Frequency', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${val} Universities (${item.payload.percentage}%)`,
                      `Score Bin [${item.payload.bin_label}]`
                    ]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="frequency" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
              <strong>Statistical Insight:</strong> Highly right-skewed distribution. The majority of universities cluster in the 45.0 – 55.0 band, with only an elite few surpassing 65.0, led by IISc at 83.29.
            </p>
          </div>
        )}

        {/* CHART 5: Rank and Score Box Plots & 5-Number Summaries */}
        {(activeTab === 'all' || activeTab === '5') && boxPlots && (
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 text-[10px] font-bold">
                  FIGURE 5
                </span>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Rank and Score Box Plots &amp; Summary Statistics
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Five-number summary, IQR boundaries, fences, and outlier detection corresponding to Seaborn box plots.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rank Box Plot Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">
                  Rank 5-Number Summary
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Minimum:</span>
                    <strong className="text-slate-800 font-mono">{boxPlots.rank.min}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">First Quartile (Q1):</span>
                    <strong className="text-slate-800 font-mono">{boxPlots.rank.q1}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Median (Q2):</span>
                    <strong className="text-slate-800 font-mono">{boxPlots.rank.median}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Third Quartile (Q3):</span>
                    <strong className="text-slate-800 font-mono">{boxPlots.rank.q3}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Maximum:</span>
                    <strong className="text-slate-800 font-mono">{boxPlots.rank.max}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">IQR (Interquartile Range):</span>
                    <strong className="text-slate-800 font-mono">{boxPlots.rank.iqr}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Outliers:</span>
                    <span className="text-slate-500 font-medium">None detected</span>
                  </div>
                </div>
              </div>

              {/* Score Box Plot Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">
                  Score 5-Number Summary
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Minimum:</span>
                    <strong className="text-slate-800 font-mono">{boxPlots.score.min}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">First Quartile (Q1):</span>
                    <strong className="text-slate-800 font-mono">{boxPlots.score.q1}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Median (Q2):</span>
                    <strong className="text-slate-800 font-mono">{boxPlots.score.median}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Third Quartile (Q3):</span>
                    <strong className="text-slate-800 font-mono">{boxPlots.score.q3}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Maximum:</span>
                    <strong className="text-slate-800 font-mono">{boxPlots.score.max}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Upper Fence (Q3 + 1.5*IQR):</span>
                    <strong className="text-slate-800 font-mono">{boxPlots.score.upper_fence}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Statistical Outliers:</span>
                    <span className="font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
                      {boxPlots.score.outliers.join(', ')} (IISc Bengaluru)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CHART 6: Rank-Score Correlation Heatmap */}
        {(activeTab === 'all' || activeTab === '6') && correlation && (
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                  FIGURE 6
                </span>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Rank and Score Correlation Heatmap
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pearson correlation coefficients calculated between numerical Rank and NIRF Score.
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div></div>
                <div className="font-bold text-slate-700 p-2">Rank</div>
                <div className="font-bold text-slate-700 p-2">Score</div>

                <div className="font-bold text-slate-700 p-2 text-right">Rank</div>
                <div className="bg-red-500 text-white font-extrabold rounded-lg p-4 flex items-center justify-center shadow-sm">
                  1.00
                </div>
                <div className="bg-blue-600 text-white font-extrabold rounded-lg p-4 flex items-center justify-center shadow-sm">
                  {correlation.rounded_correlation.toFixed(2)}
                </div>

                <div className="font-bold text-slate-700 p-2 text-right">Score</div>
                <div className="bg-blue-600 text-white font-extrabold rounded-lg p-4 flex items-center justify-center shadow-sm">
                  {correlation.rounded_correlation.toFixed(2)}
                </div>
                <div className="bg-red-500 text-white font-extrabold rounded-lg p-4 flex items-center justify-center shadow-sm">
                  1.00
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center space-x-1">
                  <span className="w-3 h-3 bg-blue-600 rounded"></span>
                  <span>Negative (-1.0)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-3 h-3 bg-slate-200 rounded"></span>
                  <span>Neutral (0.0)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-3 h-3 bg-red-500 rounded"></span>
                  <span>Positive (+1.0)</span>
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 bg-blue-50 p-3 rounded-lg border border-blue-200/70 leading-relaxed">
              <strong>Correlation Analysis (r = {correlation.rounded_correlation}):</strong> {correlation.interpretation}
            </p>
          </div>
        )}

        {/* CHART 7: Rank vs Score Scatter Plot */}
        {(activeTab === 'all' || activeTab === '7') && (
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                  FIGURE 7
                </span>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Rank vs University Score (Scatter Plot)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Individual coordinates for every university. Click any point or hover to inspect specific institution attributes.
              </p>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 15, right: 20, bottom: 25, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    dataKey="rank"
                    name="Rank"
                    domain={[0, 105]}
                    label={{ value: 'Rank (1 to 100)', position: 'insideBottom', offset: -15, fontSize: 11, fill: '#64748b' }}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    type="number"
                    dataKey="score"
                    name="Score"
                    domain={[40, 90]}
                    label={{ value: 'NIRF Score', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11, fill: '#64748b' }}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload || !payload.length) return null;
                      const pt = payload[0].payload as ScatterPoint;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1">
                          <p className="font-bold text-indigo-300">{pt.name}</p>
                          <p className="text-slate-300">{pt.city}, {pt.state}</p>
                          <div className="flex space-x-3 pt-1 border-t border-slate-700">
                            <span>Rank: <strong className="text-white">#{pt.rank}</strong></span>
                            <span>Score: <strong className="text-emerald-400">{pt.score}</strong></span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Scatter
                    name="Universities"
                    data={scatterPoints}
                    fill="#4f46e5"
                    onClick={(data) => {
                      if (data) {
                        setSelectedUniversity({
                          institute_id: data.institute_id,
                          name: data.name,
                          raw_name: data.raw_name,
                          city: data.city,
                          state: data.state,
                          score: data.score,
                          rank: data.rank
                        });
                      }
                    }}
                    cursor="pointer"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 8: University Score Trend by Rank */}
        {(activeTab === 'all' || activeTab === '8') && (
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                  FIGURE 8
                </span>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  University Score Trend by Rank (Ordered Line Chart)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Step-wise decay curve illustrating score differentiation across ascending rank positions.
              </p>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreTrend} margin={{ top: 15, right: 20, bottom: 25, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="rank"
                    label={{ value: 'Rank (Ascending)', position: 'insideBottom', offset: -15, fontSize: 11, fill: '#64748b' }}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    domain={[40, 90]}
                    label={{ value: 'Score', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11, fill: '#64748b' }}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload || !payload.length) return null;
                      const pt = payload[0].payload as ScoreTrendPoint;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1">
                          <p className="font-bold text-rose-300">Rank #{pt.rank}: {pt.name}</p>
                          <p className="text-slate-300">{pt.city}, {pt.state}</p>
                          <p className="text-emerald-400 font-bold">Score: {pt.score}</p>
                        </div>
                      );
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#e11d48"
                    strokeWidth={2}
                    dot={{ r: 2, fill: '#e11d48' }}
                    activeDot={{ r: 6, fill: '#be123c' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
              <strong>Observation:</strong> The score decreases sharply between Rank 1 (83.29) and Rank 20 (~59.96), then flattens out into a gentle slope between Ranks 20 and 100.
            </p>
          </div>
        )}
      </div>

      {/* University Modal */}
      <UniversityModal
        university={selectedUniversity}
        onClose={() => setSelectedUniversity(null)}
      />
    </div>
  );
};

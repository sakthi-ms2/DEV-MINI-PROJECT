import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  Map,
  MapPin,
  TrendingUp,
  Trophy,
  Award,
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { UniversityOverviewKPIs, StateCountItem, TopStatePieItem } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorAlert } from '../components/ErrorAlert';
import { PageId } from '../components/Sidebar';

const PIE_COLORS = ['#4f46e5', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#94a3b8'];

interface OverviewPageProps {
  onNavigate: (page: PageId) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  const [kpis, setKpis] = useState<UniversityOverviewKPIs | null>(null);
  const [topStates, setTopStates] = useState<TopStatePieItem[]>([]);
  const [stateCounts, setStateCounts] = useState<StateCountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, pieData, statesData] = await Promise.all([
        api.getOverview(),
        api.getTopStates(),
        api.getStateCounts()
      ]);
      setKpis(overviewData);
      setTopStates(pieData);
      setStateCounts(statesData.slice(0, 10)); // Top 10 for overview chart
    } catch (err: any) {
      setError(err?.message || 'Failed to load overview data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton rows={5} />;
  if (error) return <ErrorAlert message={error} onRetry={fetchData} />;
  if (!kpis) return null;

  const kpiCards = [
    {
      title: 'Total Universities',
      value: kpis.total_universities.toLocaleString(),
      subtitle: 'Ranked institutions in dataset',
      icon: <GraduationCap className="w-6 h-6 text-indigo-600" />,
      bg: 'bg-indigo-50/70',
      border: 'border-indigo-100'
    },
    {
      title: 'Number of States',
      value: kpis.num_states,
      subtitle: 'Represented states & UTs',
      icon: <Map className="w-6 h-6 text-blue-600" />,
      bg: 'bg-blue-50/70',
      border: 'border-blue-100'
    },
    {
      title: 'Number of Cities',
      value: kpis.num_cities,
      subtitle: 'Unique municipal centres',
      icon: <MapPin className="w-6 h-6 text-cyan-600" />,
      bg: 'bg-cyan-50/70',
      border: 'border-cyan-100'
    },
    {
      title: 'Average University Score',
      value: kpis.avg_score.toFixed(2),
      subtitle: 'Mean NIRF composite score',
      icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-100'
    },
    {
      title: 'Highest University Score',
      value: kpis.highest_score.toFixed(2),
      subtitle: kpis.top_university.name,
      icon: <Trophy className="w-6 h-6 text-amber-600" />,
      bg: 'bg-amber-50/70',
      border: 'border-amber-100'
    },
    {
      title: 'Best Rank',
      value: `#${kpis.best_rank}`,
      subtitle: 'Lowest numerical ranking index',
      icon: <Award className="w-6 h-6 text-purple-600" />,
      bg: 'bg-purple-50/70',
      border: 'border-purple-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Hero / Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ministry of Education NIRF Dataset Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Indian University Rankings Dashboard
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
            Exploratory Data Analysis examining spatial distribution, score variances, and rank-score
            correlations across India's top 100 higher education institutions.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={() => onNavigate('visualizations')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-md shadow-indigo-600/30"
            >
              <span>Explore Visualizations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('explorer')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition border border-white/10"
            >
              <span>Search Universities</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6 Dynamic KPI Cards */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
          Key Performance Indicators
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiCards.map((card, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-xl p-5 border ${card.border} shadow-sm hover:shadow-md transition-all flex items-start space-x-4`}
            >
              <div className={`p-3 rounded-xl ${card.bg} flex-shrink-0`}>
                {card.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {card.title}
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 truncate">
                  {card.value}
                </p>
                <p className="text-xs text-slate-500 mt-1 truncate" title={card.subtitle}>
                  {card.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Analytics Quick Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* State Distribution Chart Preview */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Top States by University Count
              </h3>
              <p className="text-xs text-slate-500">Distribution across highest-ranked states</p>
            </div>
            <button
              onClick={() => onNavigate('visualizations')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateCounts} margin={{ top: 10, right: 10, left: -20, bottom: 35 }}>
                <XAxis
                  dataKey="state"
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value: any) => [`${value} Universities`, 'Count']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 States + Others Donut Preview */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Geographic Concentration
              </h3>
              <p className="text-xs text-slate-500">Top 5 States vs Remainder ("Others")</p>
            </div>
            <button
              onClick={() => onNavigate('visualizations')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1"
            >
              <span>Detailed Pie</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topStates}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={3}
                >
                  {topStates.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any, item: any) => [
                    `${value} Universities (${item.payload.percentage}%)`,
                    name
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Performing Institution Spotlight */}
      <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-600/30">
            #1
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                National Benchmark Institution
              </span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Score: {kpis.highest_score}
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 mt-0.5">
              {kpis.top_university.name}
            </h4>
            <p className="text-xs text-slate-600">
              Location: {kpis.top_university.city}, {kpis.top_university.state}
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('explorer')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition shadow-sm whitespace-nowrap"
        >
          View in Explorer Table
        </button>
      </div>
    </div>
  );
};

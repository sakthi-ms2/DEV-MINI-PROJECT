import React, { useState, useEffect } from 'react';
import {
  Search,
  RotateCcw,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Trophy,
  Building,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { UniversityItem, UniversitiesResponse } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorAlert } from '../components/ErrorAlert';
import { UniversityModal } from '../components/UniversityModal';

export const ExplorerPage: React.FC = () => {
  const [data, setData] = useState<UniversitiesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [sortBy, setSortBy] = useState('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Selected university for detail modal
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityItem | null>(null);

  const fetchUniversities = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getUniversities({
        page,
        page_size: pageSize,
        search: search.trim() || undefined,
        state: stateFilter || undefined,
        city: cityFilter || undefined,
        sort_by: sortBy,
        sort_order: sortOrder
      });
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch universities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, [page, pageSize, stateFilter, cityFilter, sortBy, sortOrder]);

  // Handle search with enter or button click
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUniversities();
  };

  const handleResetFilters = () => {
    setSearch('');
    setStateFilter('');
    setCityFilter('');
    setSortBy('rank');
    setSortOrder('asc');
    setPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  // Export currently filtered table client-side CSV download
  const handleExportFiltered = () => {
    if (!data || data.items.length === 0) return;
    const headers = ['Institute ID', 'University Name', 'City', 'State', 'Score', 'Rank'];
    const rows = data.items.map((item) => [
      `"${item.institute_id}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.city}"`,
      `"${item.state}"`,
      item.score,
      item.rank
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nirf_filtered_universities_p${page}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">University Data Explorer</h2>
            <p className="text-xs text-slate-500">
              Interactive directory with comprehensive search, multi-attribute filtering, and profile inspection.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportFiltered}
              disabled={!data || data.items.length === 0}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition disabled:opacity-50"
              title="Download currently filtered table view as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Filtered Table</span>
            </button>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Reset all filters and sorting"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search by name, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </form>

          {/* State Filter */}
          <div className="relative">
            <select
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-slate-700"
            >
              <option value="">All States ({data?.filters.states.length || 0})</option>
              {data?.filters.states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div className="relative">
            <select
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-slate-700"
            >
              <option value="">All Cities ({data?.filters.cities.length || 0})</option>
              {data?.filters.cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Page Size */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 whitespace-nowrap">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-slate-700"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 (All)</option>
            </select>
          </div>
        </div>

        {/* Total Records Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong className="text-slate-800">{data?.pagination.total_records ?? 0}</strong> matching universities
          </span>
          <span className="text-indigo-600 font-medium">
            Tip: Click any university row to view detailed profile
          </span>
        </div>
      </div>

      {/* Error / Loading State */}
      {error && <ErrorAlert message={error} onRetry={fetchUniversities} />}

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSkeleton rows={pageSize > 10 ? 10 : pageSize} />
        ) : !data || data.items.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Universities Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No institutions matched your current query or filter criteria. Try resetting or adjusting filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-semibold uppercase tracking-wider">
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition"
                    onClick={() => handleSort('rank')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Rank</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>University Name</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Institute ID</th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition"
                    onClick={() => handleSort('city')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>City</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition"
                    onClick={() => handleSort('state')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>State</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition text-right"
                    onClick={() => handleSort('score')}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Score</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {data.items.map((item) => {
                  const isTop = item.is_highest_scorer;
                  return (
                    <tr
                      key={item.institute_id + item.rank}
                      onClick={() => setSelectedUniversity(item)}
                      className={`cursor-pointer transition-colors ${
                        isTop
                          ? 'bg-amber-50/70 hover:bg-amber-100/70 border-l-4 border-l-amber-500'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs ${
                          item.rank <= 3
                            ? 'bg-indigo-600 text-white font-extrabold shadow-sm'
                            : item.rank <= 10
                            ? 'bg-indigo-100 text-indigo-800 font-bold'
                            : 'bg-slate-100 text-slate-700 font-semibold'
                        }`}>
                          {item.rank}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center space-x-2">
                          <span>{item.name}</span>
                          {isTop && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                              <Trophy className="w-2.5 h-2.5" />
                              <span>Highest Scorer</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {item.institute_id || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {item.city}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                          {item.state}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 font-mono">
                          {item.score.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {data && data.pagination.total_pages > 1 && (
          <div className="px-4 py-3 bg-slate-50/60 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500">
              Page <strong className="text-slate-800">{data.pagination.page}</strong> of{' '}
              <strong className="text-slate-800">{data.pagination.total_pages}</strong>
            </span>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!data.pagination.has_prev}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-medium transition flex items-center space-x-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => setPage(page + 1)}
                disabled={!data.pagination.has_next}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-medium transition flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* University Detail Modal */}
      <UniversityModal
        university={selectedUniversity}
        onClose={() => setSelectedUniversity(null)}
      />
    </div>
  );
};

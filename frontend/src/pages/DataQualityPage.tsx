import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  RotateCw,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Database,
  Filter,
  FileCode,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { QualityReport } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorAlert } from '../components/ErrorAlert';

export const DataQualityPage: React.FC = () => {
  const [report, setReport] = useState<QualityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchQuality = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getQualityReport();
      setReport(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch data quality metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuality();
  }, []);

  const handleRefreshDataset = async () => {
    setReloading(true);
    setSuccessMsg(null);
    setError(null);
    try {
      await api.refreshData();
      await fetchQuality();
      setSuccessMsg('Dataset successfully reloaded from disk and cleaned in memory.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err?.message || 'Failed to reload dataset');
    } finally {
      setReloading(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={5} />;
  if (error) return <ErrorAlert message={error} onRetry={fetchQuality} />;
  if (!report) return null;

  // Columns comparison
  const columnNames = Object.keys({ ...report.missing_values_before, ...report.missing_values_after });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Data Quality &amp; Cleaning Audit</h2>
          <p className="text-xs text-slate-500">
            Audit log detailing ingestion metrics, missing value treatments, and sanitization steps.
          </p>
        </div>

        <button
          onClick={handleRefreshDataset}
          disabled={reloading}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${reloading ? 'animate-spin' : ''}`} />
          <span>{reloading ? 'Reloading...' : 'Reload & Recalculate'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Row Count & Ingestion Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase mb-2">
            <span>Raw CSV Rows</span>
            <Database className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{report.original_rows}</p>
          <p className="text-[11px] text-slate-500 mt-1">Total lines detected in original CSV</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase mb-2">
            <span>Cleaned Active Rows</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{report.cleaned_rows}</p>
          <p className="text-[11px] text-slate-500 mt-1">Validated rows used in active EDA</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase mb-2">
            <span>Duplicates Removed</span>
            <Filter className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{report.duplicates_removed}</p>
          <p className="text-[11px] text-slate-500 mt-1">Identical duplicate entries stripped</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase mb-2">
            <span>Invalid Values Dropped</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{report.invalid_rows_removed}</p>
          <p className="text-[11px] text-slate-500 mt-1">Rows lacking numeric Rank or Score</p>
        </div>
      </div>

      {/* Missing Values Before vs After Cleaning Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Missing Values Audit: Before vs. After Cleaning
          </h3>
          <span className="text-xs text-slate-500">
            Missing text filled with "Unknown", invalid numeric dropped
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Column Name</th>
                <th className="py-3 px-4">Raw Null Count</th>
                <th className="py-3 px-4">Cleaned Null Count</th>
                <th className="py-3 px-4">Applied Transformation Logic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {columnNames.map((col) => {
                const beforeCount = report.missing_values_before[col] ?? 0;
                const afterCount = report.missing_values_after[col] ?? 0;
                let transformation = 'Trimmed whitespace and preserved';
                if (col === 'Rank' || col === 'Score') {
                  transformation = 'Converted to numeric with pd.to_numeric(errors="coerce"); dropped non-numeric';
                } else if (['Name', 'City', 'State'].includes(col)) {
                  transformation = 'Stripped whitespace; missing values replaced with "Unknown"';
                }

                return (
                  <tr key={col} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                      {col}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        beforeCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {beforeCount} nulls
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        afterCount > 0 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {afterCount} nulls
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {transformation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dataset Storage & Pipeline Details */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
          Storage &amp; Pipeline Configuration
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex flex-col sm:flex-row sm:justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Dataset File Location:</span>
            <span className="font-mono text-slate-800 break-all">{report.dataset_path}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Loading Status:</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {report.status.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-slate-500 font-medium">Detected Columns:</span>
            <span className="text-slate-700 font-mono text-[11px]">{report.columns.join(', ')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  Menu,
  RotateCw,
  Printer,
  CheckCircle2,
  AlertTriangle,
  GraduationCap
} from 'lucide-react';
import { HealthStatus } from '../types';

interface NavbarProps {
  onToggleSidebar: () => void;
  health: HealthStatus | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  health,
  onRefresh,
  isRefreshing
}) => {
  const isHealthy = health?.status === 'ok';

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 transition-colors no-print">
      <div className="flex items-center justify-between">
        {/* Left Section: Mobile Menu & Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="hidden sm:flex w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-none">
                NIRF University Rankings
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5 hidden sm:block">
                Exploratory Data Analysis Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Status Pill, Refresh, Print */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Health Badge */}
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isHealthy
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
            title={health?.dataset_path ? `Loaded: ${health.dataset_path}` : 'Checking connection...'}
          >
            {isHealthy ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">Dataset Active:</span>
                <span className="font-semibold">{health?.row_count ?? 100} Universities</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Backend Connecting...</span>
              </>
            )}
          </div>

          {/* Refresh Dataset Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-all disabled:opacity-50"
            title="Reload CSV and recalculate EDA metrics"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Reloading...' : 'Reload Data'}</span>
          </button>

          {/* Print Report Button */}
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 transition-all"
            title="Print or export dashboard view"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Report</span>
          </button>
        </div>
      </div>
    </header>
  );
};

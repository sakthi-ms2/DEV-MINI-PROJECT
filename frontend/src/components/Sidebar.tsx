import React from 'react';
import {
  LayoutDashboard,
  Search,
  BarChart3,
  Lightbulb,
  ShieldCheck,
  Info,
  Download,
  GraduationCap
} from 'lucide-react';

export type PageId = 'overview' | 'explorer' | 'visualizations' | 'insights' | 'quality' | 'about';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  totalRecords?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isOpen,
  onCloseMobile,
  totalRecords = 100
}) => {
  const navItems: { id: PageId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'explorer', label: 'University Explorer', icon: <Search className="w-5 h-5" />, badge: `${totalRecords}` },
    { id: 'visualizations', label: 'Visualizations (8)', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'insights', label: 'Insights & Findings', icon: <Lightbulb className="w-5 h-5" /> },
    { id: 'quality', label: 'Data Quality & Audit', icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'about', label: 'About Project', icon: <Info className="w-5 h-5" /> }
  ];

  const handleNavClick = (id: PageId) => {
    onSelectPage(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-tight leading-tight">NIRF Analytics</h1>
            <p className="text-xs text-indigo-300 font-medium">EDA Dashboard</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Navigation
          </div>
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-indigo-700/60 text-indigo-100 font-bold'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Direct CSV Download footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <a
            href="/api/export/csv"
            download="nirf_cleaned_rankings.csv"
            className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-xs font-semibold text-slate-200 hover:text-white border border-slate-700/60 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Download Cleaned CSV</span>
          </a>
          <p className="text-[10px] text-center text-slate-300 mt-2">
            Python EDA &amp; FastAPI Connected
          </p>
        </div>
      </aside>
    </>
  );
};

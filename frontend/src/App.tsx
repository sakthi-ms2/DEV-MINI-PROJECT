import React, { useState, useEffect } from 'react';
import { Sidebar, PageId } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { OverviewPage } from './pages/OverviewPage';
import { ExplorerPage } from './pages/ExplorerPage';
import { VisualizationsPage } from './pages/VisualizationsPage';
import { InsightsPage } from './pages/InsightsPage';
import { DataQualityPage } from './pages/DataQualityPage';
import { AboutPage } from './pages/AboutPage';
import { api } from './services/api';
import { HealthStatus } from './types';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHealth = async () => {
    try {
      const res = await api.getHealth();
      setHealth(res);
    } catch (err) {
      setHealth({
        status: 'degraded',
        dataset_loaded: false,
        dataset_path: '',
        row_count: 0,
        error: 'Backend is offline or unreachable'
      });
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await api.refreshData();
      await fetchHealth();
      // Reload current page by triggering event or window refresh if needed
      window.dispatchEvent(new Event('nirf-data-refreshed'));
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
        totalRecords={health?.row_count ?? 100}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          health={health}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentPage === 'overview' && <OverviewPage onNavigate={setCurrentPage} />}
          {currentPage === 'explorer' && <ExplorerPage />}
          {currentPage === 'visualizations' && <VisualizationsPage />}
          {currentPage === 'insights' && <InsightsPage />}
          {currentPage === 'quality' && <DataQualityPage />}
          {currentPage === 'about' && <AboutPage />}
        </main>

        {/* Footer */}
        <footer className="py-4 px-6 border-t border-slate-200/80 bg-white/60 text-center text-xs text-slate-500 no-print">
          NIRF University Rankings EDA Dashboard &bull; FastAPI + React Architecture &bull; Academic Mini-Project
        </footer>
      </div>
    </div>
  );
};

export default App;

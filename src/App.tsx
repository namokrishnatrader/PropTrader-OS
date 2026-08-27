import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { AlertBanner } from './components/layout/AlertBanner';
import { Navigation } from './components/layout/Navigation';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { PayoutCalculator } from './components/payout/PayoutCalculator';
import { TradingJournal } from './components/journal/TradingJournal';
import { DisciplineCenter } from './components/discipline/DisciplineCenter';
import { PerformanceCalendar } from './components/calendar/PerformanceCalendar';
import { NYSRulesGuide } from './components/rules/NYSRulesGuide';
import { Activity, Zap } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="max-w-7xl mx-auto px-6 sm:px-8 py-8 relative z-10">
      {activeTab === 'overview' && <OverviewDashboard />}
      {activeTab === 'payout' && <PayoutCalculator />}
      {activeTab === 'journal' && <TradingJournal />}
      {activeTab === 'habits' && <DisciplineCenter />}
      {activeTab === 'calendar' && <PerformanceCalendar />}
      {activeTab === 'rules' && <NYSRulesGuide />}
    </main>
  );
};

const FooterContent: React.FC = () => {
  const { config } = useApp();

  return (
    <footer className="border-t border-white/[0.06] bg-[#07090E]/90 backdrop-blur-md py-6 mt-16 text-xs text-slate-400 relative z-10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-indigo-400" />
          <span className="text-slate-200 font-semibold">PropTrader Command &amp; Discipline OS</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-medium">${config.baseCapital.toLocaleString()} NYS Model</span>
        </div>

        <div className="flex flex-wrap items-center gap-3.5 text-slate-400 text-xs">
          <span className="flex items-center gap-1 text-amber-300">
            <Zap className="w-3 h-3 text-amber-400" />
            Reset: 21:00 UTC
          </span>
          <span>•</span>
          <span>Trailing Floor: {(config.trailingMaxLossPercent * 100).toFixed(0)}% Locked</span>
          <span>•</span>
          <span>Daily Loss: {(config.dailyLossPercent * 100).toFixed(0)}%</span>
          <span>•</span>
          <span>Open Risk: &lt; {(config.maxOpenRiskPercent * 100).toFixed(0)}% (${(config.baseCapital * config.maxOpenRiskPercent).toLocaleString()})</span>
        </div>
      </div>
    </footer>
  );
};

export function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-300 font-sans relative overflow-x-hidden">
        
        {/* Ambient Spatial Background Lighting Spheres */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {/* Top-Left Indigo/Purple Glow */}
          <div className="absolute -top-40 -left-40 w-[650px] h-[650px] rounded-full bg-gradient-to-br from-indigo-600/15 via-purple-600/10 to-transparent blur-[140px]" />
          
          {/* Bottom-Right Emerald/Teal Glow */}
          <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full bg-gradient-to-tl from-emerald-500/12 via-teal-500/8 to-transparent blur-[150px]" />
          
          {/* Top-Right Subtle Cyan Accent Glow */}
          <div className="absolute top-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-cyan-500/[0.04] blur-[130px]" />
        </div>

        <div className="relative z-10">
          {/* Persistent Danger Alert Barometer */}
          <AlertBanner />

          {/* Spatial Header */}
          <Header />

          {/* Navigation Bar */}
          <Navigation />

          {/* Active Tab View */}
          <MainContent />
        </div>

        {/* Spatial Footer */}
        <FooterContent />
      </div>
    </AppProvider>
  );
}

export default App;

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Award,
  BookOpen,
  CheckSquare,
  Calendar,
  ShieldCheck,
} from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, payoutStatus, journalEntries, habits, config } = useApp();

  const completedHabitsCount = habits.filter(h => h.completed).length;

  const tabs: TabItem[] = [
    {
      id: 'overview',
      label: 'Overview & Health',
      shortLabel: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'payout',
      label: 'Payout Consistency',
      shortLabel: 'Payouts',
      icon: Award,
      badge: payoutStatus.isEligibleForPayout ? 'Ready' : `${payoutStatus.qualifyingDaysCount}/${config.qualifyingDaysTarget}`,
      badgeColor: payoutStatus.isEligibleForPayout
        ? 'bg-emerald-500/20 text-emerald-300 border-t border-emerald-400/30 border-b border-black/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
        : 'bg-white/[0.06] text-slate-400 border border-white/[0.08]',
    },
    {
      id: 'journal',
      label: 'Execution Journal',
      shortLabel: 'Journal',
      icon: BookOpen,
      badge: journalEntries.length > 0 ? journalEntries.length : undefined,
      badgeColor: 'bg-white/[0.06] text-slate-300 border border-white/[0.08]',
    },
    {
      id: 'habits',
      label: 'Habits & Psychology',
      shortLabel: 'Discipline',
      icon: CheckSquare,
      badge: `${completedHabitsCount}/${habits.length}`,
      badgeColor: completedHabitsCount === habits.length
        ? 'bg-emerald-500/20 text-emerald-300 border-t border-emerald-400/30 border-b border-black/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
        : 'bg-white/[0.06] text-slate-400 border border-white/[0.08]',
    },
    {
      id: 'calendar',
      label: 'Performance Calendar',
      shortLabel: 'Calendar',
      icon: Calendar,
    },
    {
      id: 'rules',
      label: 'NYS Rules Guide',
      shortLabel: 'Rules',
      icon: ShieldCheck,
    },
  ];

  return (
    <nav className="border-b border-white/[0.06] bg-[#070A11]/60 backdrop-blur-xl sticky top-16 z-30 overflow-x-auto scrollbar-none shadow-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex space-x-1.5 py-3 min-w-max">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-b from-indigo-500/25 to-indigo-700/35 text-indigo-200 border-t border-indigo-400/40 border-x border-indigo-500/20 border-b border-black/50 shadow-[0_4px_15px_rgba(99,102,241,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-300 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'text-slate-400'}`} />
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">{tab.shortLabel}</span>

                {tab.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold leading-none ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

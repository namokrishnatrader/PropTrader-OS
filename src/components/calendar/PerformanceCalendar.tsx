import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import type { DailyJournalEntry } from '../../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  X,
} from 'lucide-react';

export const PerformanceCalendar: React.FC = () => {
  const { journalEntries, config, setActiveTab } = useApp();

  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 7, 1));
  const [selectedEntry, setSelectedEntry] = useState<DailyJournalEntry | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const entriesByDate = useMemo(() => {
    const map = new Map<string, DailyJournalEntry>();
    journalEntries.forEach(entry => {
      map.set(entry.date, entry);
    });
    return map;
  }, [journalEntries]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthEntries = useMemo(() => {
    return journalEntries.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [journalEntries, year, month]);

  const monthStats = useMemo(() => {
    const totalProfit = monthEntries.reduce((s, e) => s + e.netProfit, 0);
    const qualifyingDays = monthEntries.filter(e => e.netProfit >= config.minProfitPerDayPayout).length;
    const greenDays = monthEntries.filter(e => e.netProfit > 0).length;
    const redDays = monthEntries.filter(e => e.netProfit < 0).length;
    const totalDays = monthEntries.length;
    const winRate = totalDays > 0 ? (greenDays / totalDays) * 100 : 0;

    return {
      totalProfit,
      qualifyingDays,
      greenDays,
      redDays,
      totalDays,
      winRate,
    };
  }, [monthEntries, config.minProfitPerDayPayout]);

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-3d-card p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-300 border-t border-indigo-400/30 border-b border-black/40 shadow-[0_0_12px_rgba(99,102,241,0.3)]">
                <CalendarIcon className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">Monthly Performance Calendar</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Visualizing daily P&amp;L performance and tracking the {config.qualifyingDaysTarget} qualifying days target.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2.5 rounded-xl btn-3d-secondary text-slate-300 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-5 py-2 rounded-xl glass-3d-inset text-xs font-bold text-white min-w-[150px] text-center drop-shadow-sm">
              {monthNames[month]} {year}
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2.5 rounded-xl btn-3d-secondary text-slate-300 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Monthly KPI Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-3d-card-interactive p-5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Month Net P&amp;L</div>
            <div className={`text-2xl font-bold mt-1 ${monthStats.totalProfit >= 0 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]'}`}>
              {monthStats.totalProfit >= 0 ? '+' : ''}${monthStats.totalProfit.toLocaleString()}
            </div>
          </div>
          <TrendingUp className={`w-6 h-6 ${monthStats.totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} />
        </div>

        <div className="glass-3d-card-interactive p-5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Qualifying Days</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
              {monthStats.qualifyingDays} <span className="text-xs font-normal text-slate-400">/ {config.qualifyingDaysTarget}</span>
            </div>
          </div>
          <Award className="w-6 h-6 text-emerald-400" />
        </div>

        <div className="glass-3d-card-interactive p-5">
          <div className="text-[11px] text-slate-400 font-medium">Win Rate</div>
          <div className="text-2xl font-bold text-white mt-1 drop-shadow-sm">
            {monthStats.winRate.toFixed(0)}% <span className="text-xs font-medium text-slate-400">({monthStats.greenDays}W - {monthStats.redDays}L)</span>
          </div>
        </div>

        <div className="glass-3d-card-interactive p-5">
          <div className="text-[11px] text-slate-400 font-medium">Days Traded</div>
          <div className="text-2xl font-bold text-indigo-300 mt-1 drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]">
            {monthStats.totalDays} <span className="text-xs font-medium text-slate-400">Sessions</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass-3d-card p-8">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2.5 mb-3 text-center text-xs font-semibold text-slate-400">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7 gap-2.5">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[90px] sm:min-h-[110px] rounded-2xl bg-black/20 border border-white/[0.02]" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const entry = entriesByDate.get(dateStr);
            const isQualifying = entry && entry.netProfit >= config.minProfitPerDayPayout;
            const isProfit = entry && entry.netProfit > 0;
            const isLoss = entry && entry.netProfit < 0;

            return (
              <div
                key={dateStr}
                onClick={() => entry && setSelectedEntry(entry)}
                className={`min-h-[90px] sm:min-h-[110px] p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                  entry ? 'cursor-pointer hover:scale-[1.03] hover:shadow-xl' : 'cursor-default'
                } ${
                  isQualifying
                    ? 'bg-gradient-to-b from-emerald-950/40 to-slate-950/80 border-t-emerald-400/40 border-emerald-500/25 shadow-[0_4px_15px_rgba(16,185,129,0.15)]'
                    : isProfit
                    ? 'bg-gradient-to-b from-indigo-950/30 to-slate-950/80 border-t-indigo-400/30 border-indigo-500/20'
                    : isLoss
                    ? 'bg-gradient-to-b from-rose-950/30 to-slate-950/80 border-t-rose-400/30 border-rose-500/20'
                    : 'glass-3d-inset'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-bold ${entry ? 'text-white' : 'text-slate-500'}`}>
                    {dayNum}
                  </span>
                  {isQualifying && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]" title="Qualifying Day" />
                  )}
                </div>

                {entry ? (
                  <div className="space-y-0.5 mt-1">
                    <div
                      className={`text-xs font-bold ${
                        entry.netProfit >= 0 ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.3)]' : 'text-rose-400'
                      }`}
                    >
                      {entry.netProfit >= 0 ? '+' : ''}${entry.netProfit.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 hidden sm:block truncate font-medium">
                      {entry.assetsTraded.join(', ')}
                    </div>
                    <div className="text-[9px] text-slate-500 hidden sm:block font-medium">
                      {entry.tradesCount} trades
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-600 self-center font-medium">-</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md glass-3d-elevated p-7 shadow-2xl">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-indigo-400" />
                <h3 className="font-semibold text-white text-sm">
                  Trading Session — {selectedEntry.date}
                </h3>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3.5 p-4 rounded-2xl glass-3d-inset">
                <div>
                  <div className="text-slate-400 text-[11px] font-medium">Net P&amp;L</div>
                  <div className={`text-lg font-bold ${selectedEntry.netProfit >= 0 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'text-rose-400'}`}>
                    {selectedEntry.netProfit >= 0 ? '+' : ''}${selectedEntry.netProfit.toLocaleString()}
                  </div>
                  {selectedEntry.netProfit >= config.minProfitPerDayPayout && (
                    <span className="text-[10px] text-emerald-400 font-semibold">Qualifying Day</span>
                  )}
                </div>

                <div>
                  <div className="text-slate-400 text-[11px] font-medium">Trades Count</div>
                  <div className="text-lg font-bold text-white">
                    {selectedEntry.tradesCount} {selectedEntry.tradesCount === 1 ? 'Trade' : 'Trades'}
                  </div>
                </div>
              </div>

              <div className="space-y-2 p-4 rounded-2xl glass-3d-inset">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Session:</span>
                  <span className="font-semibold text-white">{selectedEntry.session}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Instruments:</span>
                  <span className="text-indigo-300 font-semibold">{selectedEntry.assetsTraded.join(', ')}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Setup Grade:</span>
                  <span className="font-semibold text-white">Grade {selectedEntry.setupGrade}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Emotion:</span>
                  <span className="text-emerald-400 font-semibold">{selectedEntry.emotion}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Discipline Score:</span>
                  <span className="text-emerald-400 font-bold">{selectedEntry.disciplineScore}%</span>
                </div>
              </div>

              {selectedEntry.notes && (
                <div className="p-3.5 rounded-2xl glass-3d-inset text-[11px] text-slate-300">
                  <strong className="text-slate-400 block mb-1">Notes:</strong>
                  {selectedEntry.notes}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setSelectedEntry(null);
                    setActiveTab('journal');
                  }}
                  className="btn-3d-primary w-full py-3 rounded-xl text-xs font-semibold"
                >
                  View in Journal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

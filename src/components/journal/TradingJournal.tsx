import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import type { DailyJournalEntry, TradingSession, SetupGrade, EmotionTag, MistakeTag } from '../../types';
import { NYS_CONFIG } from '../../constants/rules';
import {
  BookOpen,
  Plus,
  Filter,
  Trash2,
  Edit2,
  AlertTriangle,
  Search,
} from 'lucide-react';

const EMOTION_OPTIONS: EmotionTag[] = ['Calm', 'Disciplined', 'Confident', 'Boredom', 'FOMO', 'Revenge', 'Anxious'];
const MISTAKE_OPTIONS: MistakeTag[] = [
  'Valid SL',
  'Perfect Execution',
  'Chased Entry',
  'Removed SL',
  'Overleveraged',
  'Overtraded',
  'Early Exit',
  'Held Through Reset',
];

export const TradingJournal: React.FC = () => {
  const { journalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry, config } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [filterSession, setFilterSession] = useState<string>('ALL');
  const [filterGrade, setFilterGrade] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formSession, setFormSession] = useState<TradingSession>('New York');
  const [formTradesCount, setFormTradesCount] = useState<string>('2');
  const [formNetProfit, setFormNetProfit] = useState<string>(config.minProfitPerDayPayout.toString());
  const [formMaxDrawdown, setFormMaxDrawdown] = useState<string>('60');
  const [formLotsTraded, setFormLotsTraded] = useState<string>('1.5');
  const [formAssets, setFormAssets] = useState<string>('XAUUSD');
  const [formSetupGrade, setFormSetupGrade] = useState<SetupGrade>('A+');
  const [formEmotion, setFormEmotion] = useState<EmotionTag>('Calm');
  const [formMistakes, setFormMistakes] = useState<MistakeTag[]>(['Valid SL', 'Perfect Execution']);
  const [formNotes, setFormNotes] = useState<string>('');
  const [formChartUrl, setFormChartUrl] = useState<string>('');
  const [formDisciplineScore, setFormDisciplineScore] = useState<string>('100');

  const toggleMistakeTag = (tag: MistakeTag) => {
    setFormMistakes(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormSession('New York');
    setFormTradesCount('2');
    setFormNetProfit(config.minProfitPerDayPayout.toString());
    setFormMaxDrawdown('60');
    setFormLotsTraded('1.5');
    setFormAssets('XAUUSD');
    setFormSetupGrade('A+');
    setFormEmotion('Calm');
    setFormMistakes(['Valid SL', 'Perfect Execution']);
    setFormNotes('');
    setFormChartUrl('');
    setFormDisciplineScore('100');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (entry: DailyJournalEntry) => {
    setEditingId(entry.id);
    setFormDate(entry.date);
    setFormSession(entry.session);
    setFormTradesCount(entry.tradesCount.toString());
    setFormNetProfit(entry.netProfit.toString());
    setFormMaxDrawdown(entry.highestFloatingDrawdown.toString());
    setFormLotsTraded(entry.lotsTraded.toString());
    setFormAssets(entry.assetsTraded.join(', '));
    setFormSetupGrade(entry.setupGrade);
    setFormEmotion(entry.emotion);
    setFormMistakes(entry.mistakes);
    setFormNotes(entry.notes);
    setFormChartUrl(entry.chartUrl || '');
    setFormDisciplineScore(entry.disciplineScore.toString());
    setIsModalOpen(true);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const tradesCountNum = parseInt(formTradesCount) || 1;
    const netProfitNum = parseFloat(formNetProfit) || 0;
    const maxDrawdownNum = parseFloat(formMaxDrawdown) || 0;
    const lotsNum = parseFloat(formLotsTraded) || 1.0;
    const scoreNum = Math.min(100, Math.max(0, parseInt(formDisciplineScore) || 100));
    const assetsList = formAssets.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);

    const isOvertraded = tradesCountNum > NYS_CONFIG.MAX_TRADES_PER_SESSION;
    const ruleBreach = isOvertraded || formMistakes.includes('Removed SL');

    const entryData = {
      date: formDate,
      session: formSession,
      tradesCount: tradesCountNum,
      netProfit: netProfitNum,
      highestFloatingDrawdown: maxDrawdownNum,
      lotsTraded: lotsNum,
      assetsTraded: assetsList,
      setupGrade: formSetupGrade,
      emotion: formEmotion,
      mistakes: formMistakes,
      ruleBreach,
      breachReason: ruleBreach
        ? isOvertraded
          ? `Overtrading (${tradesCountNum} trades > 2 trade limit)`
          : formMistakes.join(', ')
        : undefined,
      notes: formNotes,
      chartUrl: formChartUrl || undefined,
      disciplineScore: isOvertraded ? Math.min(60, scoreNum) : scoreNum,
    };

    if (editingId) {
      updateJournalEntry(editingId, entryData);
    } else {
      addJournalEntry(entryData);
    }

    setIsModalOpen(false);
  };

  const filteredEntries = useMemo(() => {
    return journalEntries.filter(entry => {
      if (filterSession !== 'ALL' && entry.session !== filterSession) return false;
      if (filterGrade !== 'ALL' && entry.setupGrade !== filterGrade) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNotes = entry.notes.toLowerCase().includes(q);
        const matchAssets = entry.assetsTraded.some(a => a.toLowerCase().includes(q));
        const matchEmotion = entry.emotion.toLowerCase().includes(q);
        if (!matchNotes && !matchAssets && !matchEmotion) return false;
      }
      return true;
    });
  }, [journalEntries, filterSession, filterGrade, searchQuery]);

  const stats = useMemo(() => {
    const total = journalEntries.length;
    if (total === 0) {
      return { total: 0, winRate: 0, totalProfit: 0, profitFactor: 0, avgWin: 0, avgLoss: 0, bestDay: 0, worstDay: 0 };
    }

    const wins = journalEntries.filter(e => e.netProfit > 0);
    const losses = journalEntries.filter(e => e.netProfit < 0);

    const winSum = wins.reduce((s, e) => s + e.netProfit, 0);
    const lossSum = Math.abs(losses.reduce((s, e) => s + e.netProfit, 0));

    const totalProfit = journalEntries.reduce((s, e) => s + e.netProfit, 0);
    const winRate = (wins.length / total) * 100;
    const profitFactor = lossSum > 0 ? winSum / lossSum : winSum > 0 ? 99.9 : 0;
    const avgWin = wins.length > 0 ? winSum / wins.length : 0;
    const avgLoss = losses.length > 0 ? lossSum / losses.length : 0;

    let bestDay = 0;
    let worstDay = 0;
    journalEntries.forEach(e => {
      if (e.netProfit > bestDay) bestDay = e.netProfit;
      if (e.netProfit < worstDay) worstDay = e.netProfit;
    });

    return {
      total,
      winRate,
      totalProfit,
      profitFactor,
      avgWin,
      avgLoss,
      bestDay,
      worstDay,
    };
  }, [journalEntries]);

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Top Header */}
      <div className="glass-3d-card p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-300 border-t border-indigo-400/30 border-b border-black/40 shadow-[0_0_12px_rgba(99,102,241,0.3)]">
                <BookOpen className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Daily Execution &amp; Trading Journal
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Audit setups, psychological triggers, and enforce the 2-trade limit per session.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Log Session Entry
          </button>
        </div>
      </div>

      {/* Analytics Summary Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="glass-3d-card-interactive p-5">
          <div className="text-[11px] text-slate-400 font-medium">Total Sessions</div>
          <div className="text-2xl font-bold text-slate-50 mt-1 drop-shadow-sm">{stats.total}</div>
        </div>

        <div className="glass-3d-card-interactive p-5">
          <div className="text-[11px] text-slate-400 font-medium">Win Rate</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">{stats.winRate.toFixed(1)}%</div>
        </div>

        <div className="glass-3d-card-interactive p-5">
          <div className="text-[11px] text-slate-400 font-medium">Profit Factor</div>
          <div className="text-2xl font-bold text-indigo-300 mt-1 drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]">{stats.profitFactor.toFixed(2)}</div>
        </div>

        <div className="glass-3d-card-interactive p-5">
          <div className="text-[11px] text-slate-400 font-medium">Avg Win / Loss</div>
          <div className="text-xs font-bold text-slate-100 mt-2">
            +${stats.avgWin.toFixed(0)} / -${stats.avgLoss.toFixed(0)}
          </div>
        </div>

        <div className="glass-3d-card-interactive p-5">
          <div className="text-[11px] text-slate-400 font-medium">Best Day</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">+${stats.bestDay.toLocaleString()}</div>
        </div>

        <div className="glass-3d-card-interactive p-5">
          <div className="text-[11px] text-slate-400 font-medium">Max Loss Day</div>
          <div className="text-2xl font-bold text-rose-400 mt-1 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]">${stats.worstDay.toLocaleString()}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-3d-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search notes, symbols (XAUUSD, BTCUSD), emotions..."
            className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Session:</span>
            <select
              value={filterSession}
              onChange={e => setFilterSession(e.target.value)}
              className="glass-3d-inset rounded-lg px-3 py-1.5 text-slate-200 text-xs"
            >
              <option value="ALL">All Sessions</option>
              <option value="London">London</option>
              <option value="New York">New York</option>
              <option value="Asian">Asian</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Grade:</span>
            <select
              value={filterGrade}
              onChange={e => setFilterGrade(e.target.value)}
              className="glass-3d-inset rounded-lg px-3 py-1.5 text-slate-200 text-xs"
            >
              <option value="ALL">All Grades</option>
              <option value="A+">A+</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
        </div>
      </div>

      {/* Journal Entries Table */}
      <div className="glass-3d-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-black/40 text-slate-400 font-medium">
                <th className="py-3.5 px-4">Date &amp; Session</th>
                <th className="py-3.5 px-4">Trades</th>
                <th className="py-3.5 px-4">Net P&amp;L</th>
                <th className="py-3.5 px-4">Max Drawdown</th>
                <th className="py-3.5 px-4">Setup</th>
                <th className="py-3.5 px-4">Emotion</th>
                <th className="py-3.5 px-4">Execution Tags</th>
                <th className="py-3.5 px-4">Discipline</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 text-xs">
                    No journal entries found. Click "Log Session Entry" to record your trades.
                  </td>
                </tr>
              ) : (
                filteredEntries.map(entry => {
                  const isOvertrade = entry.tradesCount > NYS_CONFIG.MAX_TRADES_PER_SESSION;

                  return (
                    <tr key={entry.id} className="hover:bg-white/[0.03] transition">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-100">{entry.date}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 font-medium">
                          <span>{entry.session}</span>
                          <span>•</span>
                          <span className="text-indigo-300">{entry.assetsTraded.join(', ')}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            isOvertrade
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/25'
                              : 'bg-white/[0.05] text-slate-300 border border-white/[0.08]'
                          }`}
                        >
                          {entry.tradesCount} {entry.tradesCount === 1 ? 'trade' : 'trades'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div
                          className={`text-xs font-bold ${
                            entry.netProfit >= config.minProfitPerDayPayout
                              ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                              : entry.netProfit >= 0
                              ? 'text-indigo-300'
                              : 'text-rose-400'
                          }`}
                        >
                          {entry.netProfit >= 0 ? '+' : ''}${entry.netProfit.toLocaleString()}
                        </div>
                        {entry.netProfit >= config.minProfitPerDayPayout && (
                          <span className="text-[10px] text-emerald-400 font-semibold">
                            Qualifying Day
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap font-medium">
                        -${entry.highestFloatingDrawdown.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            entry.setupGrade === 'A+'
                              ? 'bg-indigo-500/20 text-indigo-200 border-t border-indigo-400/30 border-b border-black/40'
                              : entry.setupGrade === 'A'
                              ? 'bg-blue-500/20 text-blue-200 border-t border-blue-400/30 border-b border-black/40'
                              : 'bg-white/[0.05] text-slate-400'
                          }`}
                        >
                          Grade {entry.setupGrade}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            entry.emotion === 'Calm' || entry.emotion === 'Disciplined'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                              : entry.emotion === 'FOMO' || entry.emotion === 'Revenge'
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/25'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                          }`}
                        >
                          {entry.emotion}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {entry.mistakes.map(m => (
                            <span
                              key={m}
                              className={`px-2 py-0.5 text-[10px] rounded-md font-medium ${
                                m === 'Valid SL' || m === 'Perfect Execution'
                                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-950/70 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                        {entry.notes && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs mt-1">
                            {entry.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold ${
                            entry.disciplineScore >= 90
                              ? 'text-emerald-400'
                              : entry.disciplineScore >= 70
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {entry.disciplineScore}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditModal(entry)}
                          className="p-2 text-slate-400 hover:text-white mr-1 transition rounded-lg hover:bg-white/[0.06]"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteJournalEntry(entry.id)}
                          className="p-2 text-slate-500 hover:text-rose-400 transition rounded-lg hover:bg-white/[0.06]"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log / Edit Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-xl glass-3d-elevated p-8 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <h3 className="font-semibold text-white flex items-center gap-2 text-base">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                {editingId ? 'Edit Trading Journal Session' : 'Log Daily Trading Session'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full p-2.5 glass-3d-inset rounded-xl text-white font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Trading Session</label>
                  <select
                    value={formSession}
                    onChange={e => setFormSession(e.target.value as TradingSession)}
                    className="w-full p-2.5 glass-3d-inset rounded-xl text-white font-medium"
                  >
                    <option value="London">London Session</option>
                    <option value="New York">New York Session</option>
                    <option value="Asian">Asian Session</option>
                    <option value="Overlap">London / NY Overlap</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5 flex items-center justify-between">
                    <span>Trades</span>
                    <span className="text-[10px] text-amber-400 font-semibold">&le; 2 Max</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formTradesCount}
                    onChange={e => setFormTradesCount(e.target.value)}
                    className={`w-full p-2.5 glass-3d-inset rounded-xl text-white font-medium ${
                      parseInt(formTradesCount) > 2 ? 'border-red-500 text-red-400' : ''
                    }`}
                    required
                  />
                </div>
              </div>

              {parseInt(formTradesCount) > 2 && (
                <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/50 text-red-200 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>
                    <strong>Overtrading Warning:</strong> NYS model permits max 2 trades per session.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Net P&amp;L ($)</label>
                  <input
                    type="number"
                    step="5"
                    value={formNetProfit}
                    onChange={e => setFormNetProfit(e.target.value)}
                    placeholder="e.g. 300 or -120"
                    className="w-full p-2.5 glass-3d-inset rounded-xl text-white font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Max Drawdown ($)</label>
                  <input
                    type="number"
                    step="5"
                    value={formMaxDrawdown}
                    onChange={e => setFormMaxDrawdown(e.target.value)}
                    placeholder="e.g. 60"
                    className="w-full p-2.5 glass-3d-inset rounded-xl text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Assets Traded</label>
                  <input
                    type="text"
                    value={formAssets}
                    onChange={e => setFormAssets(e.target.value)}
                    placeholder="e.g. XAUUSD, BTCUSD"
                    className="w-full p-2.5 glass-3d-inset rounded-xl text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Setup Grade</label>
                  <select
                    value={formSetupGrade}
                    onChange={e => setFormSetupGrade(e.target.value as SetupGrade)}
                    className="w-full p-2.5 glass-3d-inset rounded-xl text-white font-medium"
                  >
                    <option value="A+">Grade A+ (Prime)</option>
                    <option value="A">Grade A (High Quality)</option>
                    <option value="B">Grade B (Standard)</option>
                    <option value="C">Grade C (Low Quality)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Emotion Tag</label>
                  <select
                    value={formEmotion}
                    onChange={e => setFormEmotion(e.target.value as EmotionTag)}
                    className="w-full p-2.5 glass-3d-inset rounded-xl text-white font-medium"
                  >
                    {EMOTION_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Discipline Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formDisciplineScore}
                    onChange={e => setFormDisciplineScore(e.target.value)}
                    className="w-full p-2.5 glass-3d-inset rounded-xl text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2">Execution &amp; Discipline Tags</label>
                <div className="flex flex-wrap gap-2">
                  {MISTAKE_OPTIONS.map(tag => {
                    const isSelected = formMistakes.includes(tag);
                    const isPositive = tag === 'Valid SL' || tag === 'Perfect Execution';
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleMistakeTag(tag)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          isSelected
                            ? isPositive
                              ? 'bg-emerald-500/20 text-emerald-200 border-t border-emerald-400/40 border-b border-black/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                              : 'bg-rose-500/20 text-rose-200 border-t border-rose-400/40 border-b border-black/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                            : 'glass-3d-inset text-slate-400 hover:text-white'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Session Reflections</label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="Orderblock entry context, liquidity sweeps, trade reflections..."
                  className="w-full p-3 glass-3d-inset rounded-xl text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="btn-3d-primary flex-1 py-3 rounded-xl text-xs font-semibold"
                >
                  {editingId ? 'Update Session Entry' : 'Save Session to Journal'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-3d-secondary px-5 py-3 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

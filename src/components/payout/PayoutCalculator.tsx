import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { simulateAdditionalProfit } from '../../utils/consistencyEngine';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  ArrowRight,
  Sparkles,
  BarChart3,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';

export const PayoutCalculator: React.FC = () => {
  const { payoutStatus, journalEntries, setActiveTab, config } = useApp();

  const [simulatedDailyProfit, setSimulatedDailyProfit] = useState<string>(config.minProfitPerDayPayout.toString());
  const [simulatedDaysCount, setSimulatedDaysCount] = useState<string>('3');

  const simDaily = parseFloat(simulatedDailyProfit) || 0;
  const simDays = parseInt(simulatedDaysCount) || 0;
  const totalSimulatedExtraProfit = simDaily * simDays;

  const simulation = simulateAdditionalProfit(
    payoutStatus.totalAccumulatedProfit,
    payoutStatus.highestSingleDayProfit,
    totalSimulatedExtraProfit,
    config.consistencyCapPercent
  );

  const triggerCelebration = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const dailyPnLChartData = React.useMemo(() => {
    return journalEntries.map((entry) => ({
      name: entry.date.slice(5),
      profit: entry.netProfit,
      isQualifying: entry.netProfit >= config.minProfitPerDayPayout,
      isBestDay: entry.netProfit === payoutStatus.highestSingleDayProfit,
    }));
  }, [journalEntries, payoutStatus.highestSingleDayProfit, config.minProfitPerDayPayout]);

  const maxPayoutGrossAllowed = config.baseCapital * config.maxPayoutCapPercent;
  const maxPayoutNetAllowed = maxPayoutGrossAllowed * config.profitSplitRate;

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Top Banner: 3D Spatial Payout Status Header */}
      <div className="glass-3d-card p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-300 border-t border-emerald-400/30 border-b border-black/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                <Award className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Payout Readiness &amp; {(config.consistencyCapPercent * 100).toFixed(0)}% Consistency Engine
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Criteria: Minimum {config.qualifyingDaysTarget} days with &ge; ${config.minProfitPerDayPayout} profit, {(config.consistencyCapPercent * 100).toFixed(0)}% single-day consistency limit, and ${maxPayoutGrossAllowed.toLocaleString()} maximum payout cap (${maxPayoutNetAllowed.toLocaleString()} net at {(config.profitSplitRate * 100).toFixed(0)}% split).
            </p>
          </div>

          {/* Primary Eligibility Badge */}
          <div className="flex items-center gap-3">
            {payoutStatus.isEligibleForPayout ? (
              <div className="px-6 py-4 rounded-2xl bg-gradient-to-b from-emerald-900/60 to-emerald-950/80 border-t border-emerald-400/40 border-b border-black/60 shadow-[0_8px_25px_rgba(16,185,129,0.3)] text-emerald-200 flex items-center gap-3.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                <div>
                  <div className="text-xs font-bold uppercase text-emerald-300 tracking-wider">
                    Payout Ready
                  </div>
                  <div className="text-xs font-medium text-slate-200 mt-0.5">
                    Eligible for ${maxPayoutGrossAllowed.toLocaleString()} withdrawal (${maxPayoutNetAllowed.toLocaleString()} net)
                  </div>
                </div>
                <button
                  onClick={triggerCelebration}
                  className="ml-2 p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-200 transition shadow-sm"
                  title="Celebrate!"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="px-6 py-4 rounded-2xl bg-gradient-to-b from-amber-950/50 to-slate-950/80 border-t border-amber-400/30 border-b border-black/60 shadow-[0_8px_25px_rgba(245,158,11,0.2)] text-amber-300 flex items-center gap-3.5">
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                <div>
                  <div className="text-xs font-bold uppercase text-amber-200 tracking-wider">
                    Payout In Progress
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {payoutStatus.additionalProfitNeededForConsistency > 0
                      ? `Need $${payoutStatus.additionalProfitNeededForConsistency.toFixed(2)} extra profit to satisfy ${(config.consistencyCapPercent * 100).toFixed(0)}% rule`
                      : `Need ${Math.max(0, config.qualifyingDaysTarget - payoutStatus.qualifyingDaysCount)} more qualifying days ($${config.minProfitPerDayPayout}+)`}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Qualifying Days Tracker */}
        <div className="glass-3d-card-interactive p-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Qualifying Days (&ge; ${config.minProfitPerDayPayout})
            </span>
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                payoutStatus.qualifyingDaysMet
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                  : 'bg-white/[0.06] text-slate-300 border border-white/[0.08]'
              }`}
            >
              {payoutStatus.qualifyingDaysMet ? 'Met' : 'In Progress'}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold text-slate-50 drop-shadow-sm">
              {payoutStatus.qualifyingDaysCount}
            </span>
            <span className="text-slate-400 text-xs font-medium">/ {config.qualifyingDaysTarget} Days Required</span>
          </div>

          <div className="space-y-2">
            <div className="w-full h-2 rounded-full glass-3d-inset overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  payoutStatus.qualifyingDaysMet
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]'
                    : 'bg-gradient-to-r from-indigo-500 to-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.8)]'
                }`}
                style={{ width: `${Math.min(100, (payoutStatus.qualifyingDaysCount / config.qualifyingDaysTarget) * 100)}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 flex justify-between font-medium">
              <span>Threshold: ${config.minProfitPerDayPayout}+ / day</span>
              <span className="text-slate-300">{Math.round((payoutStatus.qualifyingDaysCount / config.qualifyingDaysTarget) * 100)}% Complete</span>
            </div>
          </div>
        </div>

        {/* 2. Consistency Cap Calculator */}
        <div className="glass-3d-card-interactive p-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              {(config.consistencyCapPercent * 100).toFixed(0)}% Consistency Cap
            </span>
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                payoutStatus.consistencyMet
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/25 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
              }`}
            >
              {payoutStatus.consistencyMet ? 'Compliant' : 'Over Cap'}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl sm:text-4xl font-bold ${
                payoutStatus.consistencyMet ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'text-amber-400'
              }`}
            >
              {payoutStatus.consistencyPercentage.toFixed(1)}%
            </span>
            <span className="text-slate-400 text-xs font-medium">/ {(config.consistencyCapPercent * 100).toFixed(1)}% Max</span>
          </div>

          <div className="text-xs space-y-1.5 text-slate-300 pt-2.5 border-t border-white/[0.06]">
            <div className="flex justify-between">
              <span className="text-slate-400">Best Single Day:</span>
              <span className="font-semibold text-slate-100">${payoutStatus.highestSingleDayProfit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Maximum Allowed:</span>
              <span className="text-indigo-300 font-semibold">${payoutStatus.maxAllowedSingleDayProfit.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* 3. Payout Calculation & Split */}
        <div className="glass-3d-card-interactive p-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Withdrawal Split
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/25">
              {(config.profitSplitRate * 100).toFixed(0)}% Trader Split
            </span>
          </div>

          <div className="space-y-0.5">
            <div className="text-xs text-slate-400">Gross Cap (${maxPayoutGrossAllowed.toLocaleString()}):</div>
            <div className="text-3xl sm:text-4xl font-bold text-slate-50 drop-shadow-sm">
              ${payoutStatus.grossPayoutAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-slate-400">Trader Net Payout:</span>
            <span className="text-lg font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
              ${payoutStatus.traderNetPayoutAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

      </div>

      {/* Breakdown Details: Daily P&L Chart & Simulation Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        
        {/* Left: Daily P&L Chart (7 Cols) */}
        <div className="lg:col-span-7 glass-3d-card p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <h3 className="font-semibold text-white text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                Daily Profit &amp; Loss vs. ${config.minProfitPerDayPayout} Target
              </h3>
              <div className="flex items-center gap-3 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" /> &ge; ${config.minProfitPerDayPayout}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.8)]" /> Profit
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" /> Loss
                </span>
              </div>
            </div>

            <div className="h-64 w-full mt-5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyPnLChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} tickFormatter={val => `$${val}`} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const val = Number(payload[0].value);
                        return (
                          <div className="glass-3d-elevated p-3.5 text-xs shadow-2xl space-y-1">
                            <p className="text-slate-400 font-semibold">{label}</p>
                            <p className={val >= config.minProfitPerDayPayout ? 'text-emerald-400 font-bold' : val >= 0 ? 'text-indigo-300 font-bold' : 'text-rose-400 font-bold'}>
                              Net P&amp;L: ${val.toLocaleString()}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {val >= config.minProfitPerDayPayout ? 'Qualifying Day' : val >= 0 ? 'Profitable' : 'Loss Day'}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={config.minProfitPerDayPayout} stroke="#10B981" strokeDasharray="3 3" />
                  <ReferenceLine y={0} stroke="#334155" />
                  <Bar dataKey="profit" radius={[6, 6, 0, 0]}>
                    {dailyPnLChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.profit >= config.minProfitPerDayPayout
                            ? '#10B981'
                            : entry.profit >= 0
                            ? '#6366F1'
                            : '#EF4444'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Total Accumulated Profit: <strong className="text-white">${payoutStatus.totalAccumulatedProfit.toLocaleString()}</strong></span>
            <span>Qualifying Days: <strong className="text-emerald-400">{payoutStatus.qualifyingDaysCount} / {config.qualifyingDaysTarget} Days</strong></span>
          </div>
        </div>

        {/* Right: Simulation Sandbox (5 Cols) */}
        <div className="lg:col-span-5 glass-3d-card p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <h3 className="font-semibold text-white text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                {(config.consistencyCapPercent * 100).toFixed(0)}% Consistency Forecast
              </h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 font-semibold">
                Simulation
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Test how future profitable sessions will dilute your highest single day to bring it under the {(config.consistencyCapPercent * 100).toFixed(0)}% cap.
            </p>

            <div className="grid grid-cols-2 gap-3.5 mt-4 text-xs">
              <div>
                <label className="block text-[11px] text-slate-300 font-medium mb-1.5">
                  Expected Profit / Day ($)
                </label>
                <input
                  type="number"
                  step="50"
                  value={simulatedDailyProfit}
                  onChange={e => setSimulatedDailyProfit(e.target.value)}
                  className="w-full p-2.5 glass-3d-inset rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                  placeholder="300"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 font-medium mb-1.5">
                  Number of Future Days
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={simulatedDaysCount}
                  onChange={e => setSimulatedDaysCount(e.target.value)}
                  className="w-full p-2.5 glass-3d-inset rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                  placeholder="3"
                />
              </div>
            </div>

            <div className="mt-4 p-4 rounded-2xl glass-3d-inset space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Simulated Extra Profit:</span>
                <span className="text-indigo-300 font-semibold">+${totalSimulatedExtraProfit.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Forecasted Total Profit:</span>
                <span className="text-white font-bold">${simulation.newTotalProfit.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Forecasted Best Day %:</span>
                <span
                  className={`font-semibold ${
                    simulation.isNowCompliant ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {simulation.newConsistencyPercentage.toFixed(1)}% / {(config.consistencyCapPercent * 100).toFixed(1)}%
                </span>
              </div>

              <div className="flex justify-between text-slate-300 pt-2 border-t border-white/[0.06]">
                <span className="text-slate-400 font-medium">Remaining Shortfall:</span>
                <span
                  className={`font-bold ${
                    simulation.remainingShortfall === 0 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'text-amber-400'
                  }`}
                >
                  ${simulation.remainingShortfall.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('journal')}
            className="btn-3d-secondary w-full py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
          >
            <span>Log Trading Session</span>
            <ArrowRight className="w-4 h-4 text-indigo-400" />
          </button>
        </div>

      </div>
    </div>
  );
};

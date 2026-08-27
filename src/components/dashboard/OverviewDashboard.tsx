import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Shield,
  AlertOctagon,
  CheckCircle2,
  DollarSign,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

export const OverviewDashboard: React.FC = () => {
  const {
    account,
    config,
    trailingFloor,
    dailyDrawdown,
    payoutStatus,
    journalEntries,
    setActiveTab,
  } = useApp();

  // Prepare chart data for Equity Progression vs Trailing Floor
  const chartData = React.useMemo(() => {
    let runningEquity = config.baseCapital;
    let runningPeak = config.baseCapital;

    const sortedEntries = [...journalEntries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const initialPoint = {
      date: 'Start',
      equity: config.baseCapital,
      trailingFloor: config.baseCapital * (1 - config.trailingMaxLossPercent),
      pnl: 0,
    };

    const points = sortedEntries.map(entry => {
      runningEquity += entry.netProfit;
      runningPeak = Math.max(runningPeak, runningEquity);
      const floor = runningPeak * (1 - config.trailingMaxLossPercent);
      return {
        date: entry.date.slice(5),
        equity: runningEquity,
        trailingFloor: floor,
        pnl: entry.netProfit,
      };
    });

    return [initialPoint, ...points];
  }, [journalEntries, config.baseCapital, config.trailingMaxLossPercent]);

  const totalGainDollars = account.currentEquity - config.baseCapital;
  const totalGainPercent = config.baseCapital > 0 ? (totalGainDollars / config.baseCapital) * 100 : 0;
  const maxOpenRiskAllowed = config.baseCapital * config.maxOpenRiskPercent;

  return (
    <div className="space-y-7 animate-fade-in">
      
      {/* Top 3D Spatial Executive Card */}
      <div className="glass-3d-card p-8 relative overflow-hidden">
        {/* Subtle internal light flare */}
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/15 text-indigo-300 border-t border-indigo-400/30 border-x border-indigo-500/10 border-b border-black/40 shadow-[0_2px_8px_rgba(99,102,241,0.2)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                ${config.baseCapital.toLocaleString()} Live Account
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Cycle: {payoutStatus.cycleDaysRemaining} Days Remaining
              </span>
            </div>

            <div className="mt-3.5">
              <div className="text-xs text-slate-400 font-medium">
                Total Account Equity
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-50 tracking-tight flex flex-wrap items-baseline gap-3.5 mt-1.5 drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)]">
                <span>${account.currentEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <span
                  className={`text-sm font-semibold flex items-center px-2.5 py-1 rounded-lg border ${
                    totalGainDollars >= 0
                      ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                      : 'text-rose-300 bg-rose-500/10 border-rose-500/20'
                  }`}
                >
                  {totalGainDollars >= 0 ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                  {totalGainDollars >= 0 ? '+' : ''}${totalGainDollars.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({totalGainPercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Quick 3D Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('journal')}
              className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              Log Session
            </button>
            <button
              onClick={() => setActiveTab('payout')}
              className="btn-3d-secondary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Payout Status ({payoutStatus.qualifyingDaysCount}/{config.qualifyingDaysTarget})
            </button>
            <button
              onClick={() => setActiveTab('habits')}
              className="btn-3d-secondary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              Habits &amp; Discipline
            </button>
          </div>
        </div>
      </div>

      {/* ROW 1: 4 Interactive 3D KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Equity & Peak */}
        <div className="glass-3d-card-interactive p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Account Equity
              </span>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.25)]">
                Active
              </span>
            </div>

            <div className="mt-3.5">
              <div className="text-2xl sm:text-3xl font-bold text-slate-50 tracking-tight tabular-nums drop-shadow-sm">
                ${account.currentEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                <span>Peak Recorded:</span>
                <span className="text-slate-200 font-semibold">${account.peakRecordedEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-white/[0.06] text-xs text-slate-400 flex items-center justify-between">
            <span>Base Capital:</span>
            <span className="text-slate-300 font-semibold">${config.baseCapital.toLocaleString()}</span>
          </div>
        </div>

        {/* KPI 2: Trailing Floor & Buffer */}
        <div className={`glass-3d-card-interactive p-6 flex flex-col justify-between ${
          trailingFloor.isDanger
            ? 'border-t-amber-400/40 border-amber-500/20 bg-gradient-to-b from-amber-950/40 to-slate-950/90'
            : trailingFloor.isBreached
            ? 'border-t-red-400/40 border-red-500/30 bg-gradient-to-b from-red-950/40 to-slate-950/90'
            : ''
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                Trailing Floor
              </span>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/[0.06] text-slate-200 border border-white/[0.08]">
                {(config.trailingMaxLossPercent * 100).toFixed(0)}% Floor
              </span>
            </div>

            <div className="mt-3.5">
              <div className="text-2xl sm:text-3xl font-bold text-slate-50 tracking-tight tabular-nums drop-shadow-sm">
                ${trailingFloor.lockedFloor.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs mt-2 flex items-center justify-between">
                <span className="text-slate-400">Remaining Buffer:</span>
                <span className={`font-semibold tabular-nums ${trailingFloor.isDanger ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`}>
                  +${trailingFloor.bufferDollars.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({trailingFloor.bufferPercent.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          {/* 3D Glass Inset Buffer Meter */}
          <div className="mt-5 pt-3.5 border-t border-white/[0.06]">
            <div className="w-full h-2 rounded-full glass-3d-inset overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  trailingFloor.isDanger
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                    : trailingFloor.isBreached
                    ? 'bg-gradient-to-r from-red-500 to-rose-400 shadow-[0_0_12px_rgba(239,68,68,0.8)]'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, (trailingFloor.bufferDollars / (config.baseCapital * config.trailingMaxLossPercent)) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 3: Today's Drawdown & Daily Remaining */}
        <div className={`glass-3d-card-interactive p-6 flex flex-col justify-between ${
          dailyDrawdown.isDailyWarning
            ? 'border-t-amber-400/40 border-amber-500/20 bg-gradient-to-b from-amber-950/40 to-slate-950/90'
            : dailyDrawdown.isDailyBreached
            ? 'border-t-red-400/40 border-red-500/30 bg-gradient-to-b from-red-950/40 to-slate-950/90'
            : ''
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-amber-400" />
                Daily Drawdown
              </span>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                ${dailyDrawdown.maxDailyLossLimit.toLocaleString()} Max
              </span>
            </div>

            <div className="mt-3.5">
              <div className="text-2xl sm:text-3xl font-bold text-slate-50 tracking-tight tabular-nums drop-shadow-sm">
                ${dailyDrawdown.remainingLossAllowance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs mt-2 flex items-center justify-between">
                <span className="text-slate-400">Today's Net P&amp;L:</span>
                <span className={`font-semibold tabular-nums ${dailyDrawdown.todayPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {dailyDrawdown.todayPnL >= 0 ? '+' : ''}${dailyDrawdown.todayPnL.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Daily Drawdown Meter */}
          <div className="mt-5 pt-3.5 border-t border-white/[0.06]">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
              <span>Limit Used</span>
              <span className="text-slate-200 font-semibold">{dailyDrawdown.percentDailyLimitUsed.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 rounded-full glass-3d-inset overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  dailyDrawdown.percentDailyLimitUsed > 50
                    ? 'bg-gradient-to-r from-rose-500 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.8)]'
                    : 'bg-gradient-to-r from-indigo-500 to-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.8)]'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, dailyDrawdown.percentDailyLimitUsed))}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 4: Open Stop-Loss Risk */}
        <div className={`glass-3d-card-interactive p-6 flex flex-col justify-between ${
          account.existingOpenRisk >= maxOpenRiskAllowed
            ? 'border-t-red-400/40 border-red-500/30 bg-gradient-to-b from-red-950/40 to-slate-950/90'
            : account.existingOpenRisk >= maxOpenRiskAllowed * 0.8
            ? 'border-t-amber-400/40 border-amber-500/20 bg-gradient-to-b from-amber-950/40 to-slate-950/90'
            : ''
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                Open SL Risk
              </span>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25 shadow-[0_0_8px_rgba(168,85,247,0.2)]">
                &lt; {(config.maxOpenRiskPercent * 100).toFixed(0)}% Limit
              </span>
            </div>

            <div className="mt-3.5">
              <div className="text-2xl sm:text-3xl font-bold text-slate-50 tracking-tight tabular-nums drop-shadow-sm">
                ${account.existingOpenRisk.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs mt-2 flex items-center justify-between">
                <span>Maximum Allowed:</span>
                <span className="text-purple-300 font-semibold">${maxOpenRiskAllowed.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Open Risk Meter */}
          <div className="mt-5 pt-3.5 border-t border-white/[0.06]">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
              <span>Risk Remaining:</span>
              <span className="text-emerald-400 font-semibold">
                ${Math.max(0, maxOpenRiskAllowed - account.existingOpenRisk).toFixed(2)}
              </span>
            </div>
            <div className="w-full h-2 rounded-full glass-3d-inset overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  account.existingOpenRisk >= maxOpenRiskAllowed
                    ? 'bg-gradient-to-r from-red-500 to-rose-400 shadow-[0_0_12px_rgba(239,68,68,0.8)]'
                    : account.existingOpenRisk >= maxOpenRiskAllowed * 0.8
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-400 shadow-[0_0_12px_rgba(168,85,247,0.8)]'
                }`}
                style={{ width: `${Math.min(100, maxOpenRiskAllowed > 0 ? (account.existingOpenRisk / maxOpenRiskAllowed) * 100 : 0)}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* ROW 2: Two-Column 3D Spatial Layout (60% Equity Chart | 40% NYS Rule Status & Payout Readiness) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 my-7">
        
        {/* Main Equity Curve & Trailing Floor Chart (7 Cols ~ 60%) */}
        <div className="lg:col-span-7 glass-3d-card p-8 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
            <div>
              <h3 className="font-semibold text-white text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Equity Progression vs. Trailing Floor
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Visualizing equity growth against the {(config.trailingMaxLossPercent * 100).toFixed(0)}% non-descending floor
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                <span className="text-slate-200">Equity</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                <span className="text-slate-200">Trailing Floor</span>
              </div>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full mt-5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis
                  domain={['dataMin - 1000', 'dataMax + 1000']}
                  stroke="#475569"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={val => `$${(val / 1000).toFixed(1)}k`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="glass-3d-elevated p-3.5 shadow-2xl text-xs space-y-1.5">
                          <p className="text-slate-400 font-semibold">{label}</p>
                          <p className="text-indigo-300">
                            Equity: <span className="font-bold text-white">${Number(payload[0].value).toLocaleString()}</span>
                          </p>
                          {payload[1] && (
                            <p className="text-rose-400">
                              Trailing Floor: <span className="font-bold">${Number(payload[1].value).toLocaleString()}</span>
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={config.baseCapital} stroke="#334155" strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#equityGrad)"
                />
                <Area
                  type="stepAfter"
                  dataKey="trailingFloor"
                  stroke="#EF4444"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#floorGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* NYS Rule Status & Payout Readiness (5 Cols ~ 40%) */}
        <div className="lg:col-span-5 glass-3d-card p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <h3 className="font-semibold text-white text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Account Status &amp; Payout
              </h3>
              <span
                className={`text-[10px] px-3 py-1 rounded-full font-semibold ${
                  payoutStatus.isEligibleForPayout
                    ? 'bg-emerald-500/15 text-emerald-300 border-t border-emerald-400/30 border-b border-black/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'bg-amber-500/15 text-amber-300 border-t border-amber-400/30 border-b border-black/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                }`}
              >
                {payoutStatus.isEligibleForPayout ? 'Payout Ready' : 'In Progress'}
              </span>
            </div>

            <div className="space-y-4 mt-5 text-xs">
              {/* Daily Reset Info */}
              <div className="p-4 rounded-2xl glass-3d-inset flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-slate-300 font-medium">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>Daily Reset Schedule</span>
                </div>
                <span className="text-slate-100 font-semibold">21:00 UTC</span>
              </div>

              {/* Consistency Diagnostic */}
              <div className="p-4 rounded-2xl glass-3d-inset space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">{(config.consistencyCapPercent * 100).toFixed(0)}% Consistency Cap:</span>
                  <span
                    className={`font-bold ${
                      payoutStatus.consistencyMet ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'text-amber-400'
                    }`}
                  >
                    {payoutStatus.consistencyPercentage.toFixed(1)}% / {(config.consistencyCapPercent * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>Best Day: ${payoutStatus.highestSingleDayProfit.toLocaleString()}</span>
                  <span>Allowed: ${payoutStatus.maxAllowedSingleDayProfit.toFixed(0)}</span>
                </div>
              </div>

              {/* Qualifying Days Counter */}
              <div className="p-4 rounded-2xl glass-3d-inset space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Qualifying Days (&ge; ${config.minProfitPerDayPayout}):</span>
                  <span
                    className={`font-bold ${
                      payoutStatus.qualifyingDaysMet ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'text-amber-400'
                    }`}
                  >
                    {payoutStatus.qualifyingDaysCount} / {config.qualifyingDaysTarget} Days
                  </span>
                </div>
                <div className="w-full h-2 rounded-full glass-3d-inset overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)] rounded-full transition-all"
                    style={{ width: `${Math.min(100, (payoutStatus.qualifyingDaysCount / config.qualifyingDaysTarget) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.06]">
            <button
              onClick={() => setActiveTab('payout')}
              className="btn-3d-secondary w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
            >
              <span>View Full Payout Audit</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

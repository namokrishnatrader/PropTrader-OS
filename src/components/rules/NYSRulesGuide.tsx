import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  TrendingDown,
  ShieldAlert,
  Award,
  Coins,
  CheckCircle2,
  XCircle,
  Sliders,
  AlertTriangle,
} from 'lucide-react';

export const NYSRulesGuide: React.FC = () => {
  const { config } = useApp();

  const [simStartingBalance, setSimStartingBalance] = useState<string>(config.baseCapital.toString());
  const [simCurrentEquity, setSimCurrentEquity] = useState<string>((config.baseCapital * 0.98).toString());
  const [simPeakEquity, setSimPeakEquity] = useState<string>((config.baseCapital * 1.04).toString());
  const [simOpenRisk1, setSimOpenRisk1] = useState<string>((config.baseCapital * 0.005).toString());
  const [simOpenRisk2, setSimOpenRisk2] = useState<string>((config.baseCapital * 0.004).toString());
  const [simSingleDayProfit, setSimSingleDayProfit] = useState<string>((config.baseCapital * 0.006).toString());
  const [simTotalProfit, setSimTotalProfit] = useState<string>((config.baseCapital * 0.03).toString());

  const sod = parseFloat(simStartingBalance) || config.baseCapital;
  const eq = parseFloat(simCurrentEquity) || config.baseCapital;
  const peak = parseFloat(simPeakEquity) || config.baseCapital;
  const r1 = parseFloat(simOpenRisk1) || 0;
  const r2 = parseFloat(simOpenRisk2) || 0;
  const combinedRisk = r1 + r2;
  const bestDay = parseFloat(simSingleDayProfit) || 0;
  const totProfit = parseFloat(simTotalProfit) || 0;

  const trailingFloor = peak * (1 - config.trailingMaxLossPercent);
  const trailingBuffer = eq - trailingFloor;
  const isFloorBreached = eq <= trailingFloor;

  const dailyMaxLoss = config.baseCapital * config.dailyLossPercent;
  const dailyLoss = sod - eq;
  const isDailyBreached = dailyLoss >= dailyMaxLoss;

  const maxAllowedOpenRisk = config.baseCapital * config.maxOpenRiskPercent;
  const isOpenRiskBreached = combinedRisk >= maxAllowedOpenRisk;

  const consistencyPct = totProfit > 0 ? (bestDay / totProfit) * 100 : 0;
  const consistencyCapPct = config.consistencyCapPercent * 100;
  const isConsistencyBreached = consistencyPct > consistencyCapPct;
  const consistencyShortfall = isConsistencyBreached ? (bestDay / config.consistencyCapPercent) - totProfit : 0;

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Top Banner */}
      <div className="glass-3d-card p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-300 border-t border-indigo-400/30 border-b border-black/40 shadow-[0_0_12px_rgba(99,102,241,0.3)]">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                NYS Account Rules &amp; Compliance Guide
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Official trading parameters and guidelines for your ${config.baseCapital.toLocaleString()} funded account.
            </p>
          </div>

          <span className="px-4 py-2 text-xs font-semibold bg-indigo-500/15 text-indigo-300 border-t border-indigo-400/30 border-b border-black/40 shadow-[0_0_10px_rgba(99,102,241,0.2)] rounded-xl">
            NYS Markets Model V2.4
          </span>
        </div>
      </div>

      {/* Elegant 2-Column Rules Grid (3D Spatial Glass) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        
        {/* Rule 1: Drawdown & Trailing Floor */}
        <div className="glass-3d-card p-7 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.06]">
              <TrendingDown className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-white text-base">
                1. Drawdown, Trailing Floor &amp; Daily Reset
              </h3>
            </div>

            <div className="space-y-4 mt-4 text-xs text-slate-300">
              <div>
                <div className="text-white font-semibold text-sm flex items-center justify-between">
                  <span>{(config.dailyLossPercent * 100).toFixed(0)}% Daily Loss Limit</span>
                  <span className="text-amber-400 font-bold drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">${dailyMaxLoss.toLocaleString()} Max</span>
                </div>
                <p className="text-slate-400 mt-1.5 leading-relaxed">
                  Calculated from start-of-day equity. Resets strictly at <strong className="text-white">21:00 UTC</strong> every day.
                </p>
              </div>

              <div className="pt-3.5 border-t border-white/[0.06]">
                <div className="text-white font-semibold text-sm flex items-center justify-between">
                  <span>{(config.trailingMaxLossPercent * 100).toFixed(0)}% Trailing Max Loss Floor</span>
                  <span className="text-rose-400 font-bold drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]">${(config.baseCapital * config.trailingMaxLossPercent).toLocaleString()} Buffer</span>
                </div>
                <p className="text-slate-400 mt-1.5 leading-relaxed">
                  Locked {(config.trailingMaxLossPercent * 100).toFixed(0)}% below highest peak recorded equity. The floor <strong className="text-white">never ratchets downward</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl glass-3d-inset text-[11px] text-slate-400 font-medium">
            Rule: If equity drops below the floor, the account hard breaches.
          </div>
        </div>

        {/* Rule 2: Open Risk & 10-Minute Scaling */}
        <div className="glass-3d-card p-7 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.06]">
              <ShieldAlert className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-white text-base">
                2. Open Risk &amp; Trade Idea Clusters
              </h3>
            </div>

            <div className="space-y-4 mt-4 text-xs text-slate-300">
              <div>
                <div className="text-white font-semibold text-sm flex items-center justify-between">
                  <span>Strict &lt; {(config.maxOpenRiskPercent * 100).toFixed(0)}% Open Risk</span>
                  <span className="text-purple-300 font-bold drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">${maxAllowedOpenRisk.toLocaleString()} Ceiling</span>
                </div>
                <p className="text-slate-400 mt-1.5 leading-relaxed">
                  Total Stop Loss risk across all active open positions must stay below ${(maxAllowedOpenRisk).toLocaleString()} at all times.
                </p>
              </div>

              <div className="pt-3.5 border-t border-white/[0.06]">
                <div className="text-white font-semibold text-sm flex items-center justify-between">
                  <span>{(config.tradeIdeaMaxRiskPercent * 100).toFixed(0)}% 10-Minute Cluster Rule</span>
                  <span className="text-indigo-300 font-bold drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]">${(config.baseCapital * config.tradeIdeaMaxRiskPercent).toLocaleString()} Limit</span>
                </div>
                <p className="text-slate-400 mt-1.5 leading-relaxed">
                  Multiple entries opened within 10 minutes in the same instrument must not exceed ${(config.baseCapital * config.tradeIdeaMaxRiskPercent).toLocaleString()} peak floating drawdown.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl glass-3d-inset text-[11px] text-slate-400 font-medium">
            Anti-Overtrading: Maximum 2 trades allowed per trading session.
          </div>
        </div>

        {/* Rule 3: Payout Consistency & Withdrawal Split */}
        <div className="glass-3d-card p-7 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.06]">
              <Award className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-white text-base">
                3. Payout Consistency &amp; Withdrawal
              </h3>
            </div>

            <div className="space-y-4 mt-4 text-xs text-slate-300">
              <div>
                <div className="text-white font-semibold text-sm flex items-center justify-between">
                  <span>{(config.consistencyCapPercent * 100).toFixed(0)}% Single-Day Consistency Cap</span>
                  <span className="text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">Max {(config.consistencyCapPercent * 100).toFixed(0)}%</span>
                </div>
                <p className="text-slate-400 mt-1.5 leading-relaxed">
                  No single trading day can make up more than {(config.consistencyCapPercent * 100).toFixed(0)}% of your total net profit.
                </p>
              </div>

              <div className="pt-3.5 border-t border-white/[0.06]">
                <div className="text-white font-semibold text-sm flex items-center justify-between">
                  <span>{config.qualifyingDaysTarget} Qualifying Days (&ge; ${config.minProfitPerDayPayout})</span>
                  <span className="text-indigo-300 font-bold drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]">{config.qualifyingDaysTarget} Days Required</span>
                </div>
                <p className="text-slate-400 mt-1.5 leading-relaxed">
                  Must log at least {config.qualifyingDaysTarget} distinct trading days with net profit of ${config.minProfitPerDayPayout} or higher per 30-day cycle.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl glass-3d-inset text-[11px] text-slate-400 font-medium">
            Payout Cap: ${(config.baseCapital * config.maxPayoutCapPercent).toLocaleString()} gross (${((config.baseCapital * config.maxPayoutCapPercent) * config.profitSplitRate).toLocaleString()} net at {(config.profitSplitRate * 100).toFixed(0)}% split).
          </div>
        </div>

        {/* Rule 4: Supported Instruments & Sizing Specs */}
        <div className="glass-3d-card p-7 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.06]">
              <Coins className="w-5 h-5 text-indigo-400" />
              <h3 className="font-semibold text-white text-base">
                4. Supported Instruments &amp; Leverage
              </h3>
            </div>

            <div className="space-y-4 mt-4 text-xs text-slate-300">
              <div>
                <div className="text-white font-semibold text-sm flex items-center justify-between">
                  <span>Gold (XAUUSD) &amp; Silver (XAGUSD)</span>
                  <span className="text-indigo-300 font-bold drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]">1:30 Leverage</span>
                </div>
                <p className="text-slate-400 mt-1.5 leading-relaxed">
                  Gold: 1 lot = 100 oz ($1.00 move = $100). Silver: 1 lot = 5,000 oz ($0.01 move = $50).
                </p>
              </div>

              <div className="pt-3.5 border-t border-white/[0.06]">
                <div className="text-white font-semibold text-sm flex items-center justify-between">
                  <span>Bitcoin (BTCUSD) &amp; Ethereum (ETHUSD)</span>
                  <span className="text-purple-300 font-bold drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">1:2 Leverage</span>
                </div>
                <p className="text-slate-400 mt-1.5 leading-relaxed">
                  1 contract = 1 Coin. $1.00 move = $1.00 per contract.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl glass-3d-inset text-[11px] text-slate-400 font-medium">
            Hard Stop Loss must be placed immediately upon entry for all assets.
          </div>
        </div>

      </div>

      {/* Interactive Compliance Scenario Simulator */}
      <div className="glass-3d-card p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-white text-base">
              Interactive Compliance Simulator
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Test account numbers against official rules
          </span>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 text-xs">
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Peak Equity ($)</label>
            <input
              type="number"
              value={simPeakEquity}
              onChange={e => setSimPeakEquity(e.target.value)}
              className="w-full p-2.5 glass-3d-inset rounded-xl text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Start-of-Day ($)</label>
            <input
              type="number"
              value={simStartingBalance}
              onChange={e => setSimStartingBalance(e.target.value)}
              className="w-full p-2.5 glass-3d-inset rounded-xl text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Current Equity ($)</label>
            <input
              type="number"
              value={simCurrentEquity}
              onChange={e => setSimCurrentEquity(e.target.value)}
              className="w-full p-2.5 glass-3d-inset rounded-xl text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Trade 1 Risk ($)</label>
            <input
              type="number"
              value={simOpenRisk1}
              onChange={e => setSimOpenRisk1(e.target.value)}
              className="w-full p-2.5 glass-3d-inset rounded-xl text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Trade 2 Risk ($)</label>
            <input
              type="number"
              value={simOpenRisk2}
              onChange={e => setSimOpenRisk2(e.target.value)}
              className="w-full p-2.5 glass-3d-inset rounded-xl text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Best Day P&amp;L ($)</label>
            <input
              type="number"
              value={simSingleDayProfit}
              onChange={e => setSimSingleDayProfit(e.target.value)}
              className="w-full p-2.5 glass-3d-inset rounded-xl text-white font-bold"
            />
          </div>
        </div>

        {/* Total Profit input for consistency */}
        <div className="text-xs flex items-center gap-3">
          <label className="text-slate-400 font-medium">Total Accumulated Net Profit ($):</label>
          <input
            type="number"
            value={simTotalProfit}
            onChange={e => setSimTotalProfit(e.target.value)}
            className="w-36 p-2 glass-3d-inset rounded-xl text-white font-bold"
          />
        </div>

        {/* Simulator Verdicts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 text-xs">
          {/* 1. Trailing Floor Check */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
            isFloorBreached
              ? 'bg-red-950/50 border-t-red-400/40 border-red-500/30 text-red-200'
              : trailingBuffer < (config.baseCapital * 0.005)
              ? 'bg-amber-950/40 border-t-amber-400/40 border-amber-500/30 text-amber-200'
              : 'bg-emerald-950/30 border-t-emerald-400/30 border-emerald-500/20 text-emerald-300'
          }`}>
            <div>
              <div className="flex items-center justify-between font-bold">
                <span>{(config.trailingMaxLossPercent * 100).toFixed(0)}% Trailing Floor</span>
                {isFloorBreached ? <XCircle className="w-4 h-4 text-red-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <div className="mt-2.5 text-white font-bold text-sm">Floor: ${trailingFloor.toFixed(2)}</div>
              <div className="text-[11px] text-slate-300 font-medium">Buffer: ${trailingBuffer.toFixed(2)}</div>
            </div>
            <div className="text-[10px] uppercase font-bold mt-2.5">
              {isFloorBreached ? 'Breached' : trailingBuffer < (config.baseCapital * 0.005) ? 'Danger' : 'Safe'}
            </div>
          </div>

          {/* 2. Daily Loss Limit Check */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
            isDailyBreached
              ? 'bg-red-950/50 border-t-red-400/40 border-red-500/30 text-red-200'
              : dailyLoss >= (dailyMaxLoss * 0.5)
              ? 'bg-amber-950/40 border-t-amber-400/40 border-amber-500/30 text-amber-200'
              : 'bg-emerald-950/30 border-t-emerald-400/30 border-emerald-500/20 text-emerald-300'
          }`}>
            <div>
              <div className="flex items-center justify-between font-bold">
                <span>{(config.dailyLossPercent * 100).toFixed(0)}% Daily Loss</span>
                {isDailyBreached ? <XCircle className="w-4 h-4 text-red-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <div className="mt-2.5 text-white font-bold text-sm">Loss: ${dailyLoss > 0 ? dailyLoss.toFixed(2) : '0.00'}</div>
              <div className="text-[11px] text-slate-300 font-medium">Limit: ${dailyMaxLoss.toLocaleString()}</div>
            </div>
            <div className="text-[10px] uppercase font-bold mt-2.5">
              {isDailyBreached ? 'Limit Hit' : dailyLoss >= (dailyMaxLoss * 0.5) ? 'Warning' : 'Compliant'}
            </div>
          </div>

          {/* 3. Combined Open Risk Check */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
            isOpenRiskBreached
              ? 'bg-red-950/50 border-t-red-400/40 border-red-500/30 text-red-200'
              : combinedRisk >= (maxAllowedOpenRisk * 0.8)
              ? 'bg-amber-950/40 border-t-amber-400/40 border-amber-500/30 text-amber-200'
              : 'bg-emerald-950/30 border-t-emerald-400/30 border-emerald-500/20 text-emerald-300'
          }`}>
            <div>
              <div className="flex items-center justify-between font-bold">
                <span>&lt; {(config.maxOpenRiskPercent * 100).toFixed(0)}% Open Risk</span>
                {isOpenRiskBreached ? <XCircle className="w-4 h-4 text-red-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <div className="mt-2.5 text-white font-bold text-sm">Total Risk: ${combinedRisk.toFixed(2)}</div>
              <div className="text-[11px] text-slate-300 font-medium">Cap: ${maxAllowedOpenRisk.toLocaleString()}</div>
            </div>
            <div className="text-[10px] uppercase font-bold mt-2.5">
              {isOpenRiskBreached ? 'Breached' : combinedRisk >= (maxAllowedOpenRisk * 0.8) ? 'Near Cap' : 'Compliant'}
            </div>
          </div>

          {/* 4. Consistency Rule Check */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
            isConsistencyBreached
              ? 'bg-amber-950/40 border-t-amber-400/40 border-amber-500/30 text-amber-200'
              : 'bg-emerald-950/30 border-t-emerald-400/30 border-emerald-500/20 text-emerald-300'
          }`}>
            <div>
              <div className="flex items-center justify-between font-bold">
                <span>{(config.consistencyCapPercent * 100).toFixed(0)}% Consistency</span>
                {isConsistencyBreached ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <div className="mt-2.5 text-white font-bold text-sm">{consistencyPct.toFixed(1)}% of Total</div>
              <div className="text-[11px] text-slate-300 font-medium">
                {isConsistencyBreached ? `Need +$${consistencyShortfall.toFixed(0)}` : 'Within Cap'}
              </div>
            </div>
            <div className="text-[10px] uppercase font-bold mt-2.5">
              {isConsistencyBreached ? 'Over Cap' : 'Eligible'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { PropFirmConfig } from '../../types';
import {
  RotateCcw,
  Sliders,
  CheckCircle2,
  DollarSign,
  X,
  RefreshCw,
  Zap,
} from 'lucide-react';

const PRESET_ACCOUNTS = [
  { label: '$25,000', size: 25_000, desc: '$750 Daily / $1,250 Max Loss' },
  { label: '$50,000', size: 50_000, desc: '$1,500 Daily / $2,500 Max Loss' },
  { label: '$100,000', size: 100_000, desc: '$3,000 Daily / $5,000 Max Loss' },
  { label: '$200,000', size: 200_000, desc: '$6,000 Daily / $10,000 Max Loss' },
];

export const AccountSetupModal: React.FC = () => {
  const {
    isAccountSetupOpen,
    setIsAccountSetupOpen,
    config,
    initializeAccount,
    updateConfig,
    loadDemoData,
  } = useApp();

  const [baseSize, setBaseSize] = useState<number>(config.baseCapital);
  const [dailyLossPct, setDailyLossPct] = useState<number>(config.dailyLossPercent * 100);
  const [trailingMaxLossPct, setTrailingMaxLossPct] = useState<number>(config.trailingMaxLossPercent * 100);
  const [maxOpenRiskPct, setMaxOpenRiskPct] = useState<number>(config.maxOpenRiskPercent * 100);
  const [minProfitDay, setMinProfitDay] = useState<number>(config.minProfitPerDayPayout);
  const [consistencyCapPct, setConsistencyCapPct] = useState<number>(config.consistencyCapPercent * 100);
  const [qualifyingDays, setQualifyingDays] = useState<number>(config.qualifyingDaysTarget);
  const [profitSplitPct, setProfitSplitPct] = useState<number>(config.profitSplitRate * 100);

  const [confirmWipeMode, setConfirmWipeMode] = useState<boolean>(false);

  useEffect(() => {
    if (isAccountSetupOpen) {
      setBaseSize(config.baseCapital);
      setDailyLossPct(config.dailyLossPercent * 100);
      setTrailingMaxLossPct(config.trailingMaxLossPercent * 100);
      setMaxOpenRiskPct(config.maxOpenRiskPercent * 100);
      setMinProfitDay(config.minProfitPerDayPayout);
      setConsistencyCapPct(config.consistencyCapPercent * 100);
      setQualifyingDays(config.qualifyingDaysTarget);
      setProfitSplitPct(config.profitSplitRate * 100);
      setConfirmWipeMode(false);
    }
  }, [isAccountSetupOpen, config]);

  if (!isAccountSetupOpen) return null;

  const handleSelectPreset = (size: number) => {
    setBaseSize(size);
    setMinProfitDay(Math.round(size * 0.0025));
  };

  const getFormConfig = (): PropFirmConfig => ({
    baseCapital: baseSize,
    dailyLossPercent: dailyLossPct / 100,
    trailingMaxLossPercent: trailingMaxLossPct / 100,
    maxOpenRiskPercent: maxOpenRiskPct / 100,
    minProfitPerDayPayout: minProfitDay,
    consistencyCapPercent: consistencyCapPct / 100,
    qualifyingDaysTarget: qualifyingDays,
    maxPayoutCapPercent: 0.02,
    profitSplitRate: profitSplitPct / 100,
    tradeIdeaMaxRiskPercent: 0.02,
  });

  const handleSaveParamsOnly = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(getFormConfig());
    setIsAccountSetupOpen(false);
  };

  const handleWipeAndStartClean = () => {
    initializeAccount(getFormConfig());
  };

  const handleLoadSampleData = () => {
    loadDemoData();
    setIsAccountSetupOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl glass-3d-elevated overflow-hidden flex flex-col max-h-[92vh] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/[0.08] bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-300 border-t border-indigo-400/30 border-b border-black/40 shadow-[0_0_10px_rgba(99,102,241,0.3)]">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Account Initializer &amp; Parameters</h2>
              <p className="text-[11px] text-slate-400 font-medium">Configure your funded account size and prop rules</p>
            </div>
          </div>
          <button
            onClick={() => setIsAccountSetupOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-8 space-y-6 overflow-y-auto text-xs">
          
          {/* Quick Account Size Presets */}
          <div>
            <label className="block text-slate-300 font-semibold mb-2.5 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
              <span>Base Account Capital Size</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PRESET_ACCOUNTS.map(preset => {
                const isSelected = baseSize === preset.size;
                return (
                  <button
                    key={preset.size}
                    type="button"
                    onClick={() => handleSelectPreset(preset.size)}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-b from-indigo-500/25 to-indigo-700/35 border-t-indigo-400/40 border-indigo-500/20 text-white shadow-[0_4px_15px_rgba(99,102,241,0.25)]'
                        : 'glass-3d-inset text-slate-400 hover:text-slate-200 hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="font-bold text-sm text-white">{preset.label}</div>
                    <div className="text-[10px] text-slate-400 mt-1 leading-snug font-medium">{preset.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Custom Input */}
            <div className="mt-3.5 flex items-center gap-2.5">
              <span className="text-slate-400 text-xs font-medium">Custom Capital ($):</span>
              <input
                type="number"
                step="5000"
                min="10000"
                max="1000000"
                value={baseSize}
                onChange={e => setBaseSize(parseFloat(e.target.value) || 0)}
                className="w-40 px-3 py-1.5 glass-3d-inset rounded-xl text-white font-bold focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
          </div>

          {/* Rule Limits Grid */}
          <div className="space-y-4 pt-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-slate-200 font-semibold text-xs">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Risk &amp; Payout Limits</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Daily Loss % */}
              <div className="p-4 rounded-2xl glass-3d-inset space-y-2">
                <div className="flex justify-between items-center font-medium">
                  <span className="text-slate-300">Daily Drawdown Limit</span>
                  <span className="text-amber-300 font-bold drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]">{dailyLossPct}% (${((baseSize * dailyLossPct) / 100).toLocaleString()})</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="0.5"
                  value={dailyLossPct}
                  onChange={e => setDailyLossPct(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="text-[10px] text-slate-500 flex justify-between font-medium">
                  <span>1%</span>
                  <span>Default: 3%</span>
                  <span>6%</span>
                </div>
              </div>

              {/* Trailing Max Loss % */}
              <div className="p-4 rounded-2xl glass-3d-inset space-y-2">
                <div className="flex justify-between items-center font-medium">
                  <span className="text-slate-300">Trailing Max Loss Floor</span>
                  <span className="text-rose-400 font-bold drop-shadow-[0_0_6px_rgba(244,63,94,0.4)]">{trailingMaxLossPct}% (${((baseSize * trailingMaxLossPct) / 100).toLocaleString()})</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="10"
                  step="0.5"
                  value={trailingMaxLossPct}
                  onChange={e => setTrailingMaxLossPct(parseFloat(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <div className="text-[10px] text-slate-500 flex justify-between font-medium">
                  <span>2%</span>
                  <span>Default: 5%</span>
                  <span>10%</span>
                </div>
              </div>

              {/* Max Open Risk % */}
              <div className="p-4 rounded-2xl glass-3d-inset space-y-2">
                <div className="flex justify-between items-center font-medium">
                  <span className="text-slate-300">Max Open SL Risk</span>
                  <span className="text-purple-300 font-bold drop-shadow-[0_0_6px_rgba(168,85,247,0.4)]">{maxOpenRiskPct}% (${((baseSize * maxOpenRiskPct) / 100).toLocaleString()})</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.25"
                  value={maxOpenRiskPct}
                  onChange={e => setMaxOpenRiskPct(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="text-[10px] text-slate-500 flex justify-between font-medium">
                  <span>0.5%</span>
                  <span>Default: 1.0%</span>
                  <span>3.0%</span>
                </div>
              </div>

              {/* Min Qualifying Profit / Day */}
              <div className="p-4 rounded-2xl glass-3d-inset space-y-2">
                <div className="flex justify-between items-center font-medium">
                  <span className="text-slate-300">Min Profit / Day for Payout</span>
                  <span className="text-emerald-400 font-bold drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]">${minProfitDay}</span>
                </div>
                <input
                  type="number"
                  step="25"
                  min="50"
                  value={minProfitDay}
                  onChange={e => setMinProfitDay(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 glass-3d-inset rounded-xl text-white font-bold focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Clean Reset Confirmation / Start Fresh */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-indigo-950/40 to-slate-950/80 border-t border-indigo-400/30 border-indigo-500/20 shadow-xl space-y-3.5">
            <div className="flex items-center gap-2 text-indigo-200 font-bold text-xs">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>Account Initializer &amp; Clean Live Start</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Clicking <strong>"Wipe &amp; Start Live"</strong> resets your live dashboard:
              <br />• Equity: <strong className="text-white">${baseSize.toLocaleString()}</strong> | Peak: <strong className="text-white">${baseSize.toLocaleString()}</strong>
              <br />• Trailing Floor: <strong className="text-rose-400">${(baseSize * (1 - trailingMaxLossPct / 100)).toLocaleString()}</strong> | Buffer: <strong className="text-emerald-400">+${((baseSize * trailingMaxLossPct) / 100).toLocaleString()}</strong>
              <br />• P&amp;L: <strong className="text-white">$0.00</strong> | Qualifying Days: <strong className="text-white">0 / {qualifyingDays}</strong>
            </p>

            {confirmWipeMode ? (
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleWipeAndStartClean}
                  className="btn-3d-emerald px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Yes, Wipe &amp; Start Live ($0 P&amp;L)
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmWipeMode(false)}
                  className="btn-3d-secondary px-4 py-2.5 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmWipeMode(true)}
                className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Wipe Data &amp; Start Fresh ($0 P&amp;L)
              </button>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-8 py-4.5 border-t border-white/[0.08] bg-black/40">
          <button
            type="button"
            onClick={handleLoadSampleData}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Load 15-Day Sample Dataset</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleSaveParamsOnly}
              className="btn-3d-secondary px-4 py-2 rounded-xl text-xs font-semibold"
            >
              Update Parameters Only
            </button>
            <button
              type="button"
              onClick={() => setIsAccountSetupOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-white text-xs font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  Volume2,
  VolumeX,
  Database,
  Edit3,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { DataManagementModal } from '../common/DataManagementModal';
import { AccountSetupModal } from '../common/AccountSetupModal';

export const Header: React.FC = () => {
  const {
    account,
    config,
    updateEquity,
    updateOpenRisk,
    soundAlertsEnabled,
    toggleSoundAlerts,
    trailingFloor,
    setIsAccountSetupOpen,
  } = useApp();

  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isEquityEditOpen, setIsEquityEditOpen] = useState(false);
  const [tempEquity, setTempEquity] = useState(account.currentEquity.toString());
  const [tempOpenRisk, setTempOpenRisk] = useState(account.existingOpenRisk.toString());

  const handleSaveQuickUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const eq = parseFloat(tempEquity);
    const risk = parseFloat(tempOpenRisk);
    if (!isNaN(eq) && eq > 0) {
      updateEquity(eq);
    }
    if (!isNaN(risk) && risk >= 0) {
      updateOpenRisk(risk);
    }
    setIsEquityEditOpen(false);
  };

  const openQuickEdit = () => {
    setTempEquity(account.currentEquity.toString());
    setTempOpenRisk(account.existingOpenRisk.toString());
    setIsEquityEditOpen(true);
  };

  return (
    <>
      <header className="h-16 px-6 lg:px-8 border-b border-white/[0.08] bg-[#0A0E18]/70 backdrop-blur-2xl sticky top-0 z-40 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-indigo-500/20 to-indigo-700/30 border-t border-white/20 border-x border-white/5 border-b border-black/40 shadow-[0_4px_15px_rgba(99,102,241,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-center text-indigo-300">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-semibold tracking-tight text-slate-50 text-sm drop-shadow-sm">
                PropTrader OS
              </span>
              <span className="text-[11px] font-medium text-emerald-300 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border-t border-emerald-400/25 border-x border-emerald-500/10 border-b border-black/40 shadow-[0_2px_8px_rgba(16,185,129,0.15)]">
                ${config.baseCapital.toLocaleString()} Live Account
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Balances & Account Initializer */}
        <div className="flex items-center gap-3">
          {/* Quick Equity Preview with 3D Bevel */}
          <button
            onClick={openQuickEdit}
            className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-gradient-to-b from-slate-800/60 to-slate-900/80 hover:from-slate-700/60 hover:to-slate-800/80 border-t border-white/15 border-x border-white/5 border-b border-black/50 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] transition group text-left"
            title="Click to update live equity"
          >
            <div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                <span>Equity</span>
                <Edit3 className="w-2.5 h-2.5 text-slate-500 group-hover:text-indigo-400 transition" />
              </div>
              <div className="text-xs font-semibold text-slate-50 tabular-nums">
                ${account.currentEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="border-l border-white/[0.08] pl-3">
              <div className="text-[10px] text-slate-400 font-medium">Buffer</div>
              <div
                className={`text-xs font-semibold tabular-nums ${
                  trailingFloor.isDanger ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                +${trailingFloor.bufferDollars.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </div>
            </div>
          </button>

          {/* Reset / Setup Account Button with 3D Bevel */}
          <button
            onClick={() => setIsAccountSetupOpen(true)}
            className="btn-3d-secondary flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Reset Account</span>
          </button>

          {/* Sound Alert Toggle */}
          <button
            onClick={toggleSoundAlerts}
            className={`p-2 rounded-xl border transition ${
              soundAlertsEnabled
                ? 'bg-indigo-500/15 border-t-white/20 border-indigo-500/30 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                : 'bg-slate-900/60 border-white/[0.06] text-slate-500 hover:text-slate-400'
            }`}
            title={soundAlertsEnabled ? 'Sound Alerts: Active' : 'Sound Alerts: Muted'}
          >
            {soundAlertsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Backup Data Manager */}
          <button
            onClick={() => setIsDataModalOpen(true)}
            className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border-t border-white/10 border-x border-white/5 border-b border-black/40 text-slate-400 hover:text-slate-200 transition shadow-sm"
            title="Data Persistence & Backup"
          >
            <Database className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Quick Balance Update Modal */}
      {isEquityEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md glass-3d-elevated p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Live Account Equity &amp; Open Risk
              </h3>
              <button
                onClick={() => setIsEquityEditOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuickUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Current Account Equity ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={tempEquity}
                    onChange={e => setTempEquity(e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 glass-3d-inset rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
                    placeholder="100000.00"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Base capital: ${config.baseCapital.toLocaleString()}. Trailing floor locks {(config.trailingMaxLossPercent * 100).toFixed(0)}% below peak equity.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Active Open Stop-Loss Risk ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={tempOpenRisk}
                    onChange={e => setTempOpenRisk(e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 glass-3d-inset rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Rule: Stop loss risk across open positions must stay below ${(config.baseCapital * config.maxOpenRiskPercent).toLocaleString()} (<span className="text-white">{(config.maxOpenRiskPercent * 100).toFixed(0)}%</span> limit).
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="btn-3d-primary flex-1 py-2.5 rounded-xl text-xs font-semibold"
                >
                  Save Updates
                </button>
                <button
                  type="button"
                  onClick={() => setIsEquityEditOpen(false)}
                  className="btn-3d-secondary px-4 py-2.5 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Setup Modal */}
      <AccountSetupModal />

      {/* Data Management Modal */}
      <DataManagementModal isOpen={isDataModalOpen} onClose={() => setIsDataModalOpen(false)} />
    </>
  );
};

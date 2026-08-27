import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';

export const AlertBanner: React.FC = () => {
  const { trailingFloor, account, config } = useApp();
  const [dismissedWarnings, setDismissedWarnings] = React.useState<Record<string, boolean>>({});

  const maxAllowedRisk = config.baseCapital * config.maxOpenRiskPercent;
  const warningRiskLevel = maxAllowedRisk * 0.85;

  const isFloorDanger = trailingFloor.isDanger;
  const isFloorBreached = trailingFloor.isBreached;
  const isOpenRiskCritical = account.existingOpenRisk >= maxAllowedRisk;
  const isOpenRiskWarning = account.existingOpenRisk >= warningRiskLevel && !isOpenRiskCritical;

  if (!isFloorDanger && !isFloorBreached && !isOpenRiskCritical && !isOpenRiskWarning) {
    return null;
  }

  const dismiss = (key: string) => {
    setDismissedWarnings(prev => ({ ...prev, [key]: true }));
  };

  return (
    <div className="sticky top-0 z-50 flex flex-col gap-2 w-full px-6 pt-3">
      {/* HARD BREACH OF TRAILING FLOOR */}
      {isFloorBreached && (
        <div className="flex items-center justify-between px-4 py-3 bg-red-950/90 border border-red-500/50 rounded-xl text-red-100 shadow-lg">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-red-300 uppercase tracking-wide">Account Breach:</span>
              <span className="ml-1.5 text-slate-200">
                Current Equity (${account.currentEquity.toLocaleString()}) dropped below locked Trailing Floor (${trailingFloor.lockedFloor.toLocaleString()}).
              </span>
            </div>
          </div>
          <span className="px-2.5 py-0.5 text-xs font-semibold bg-red-600 text-white rounded-md">Breach</span>
        </div>
      )}

      {/* TRAILING FLOOR DANGER BUFFER */}
      {isFloorDanger && !dismissedWarnings['floorDanger'] && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-amber-950/80 border border-amber-500/40 rounded-xl text-amber-100 shadow-md">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-amber-300">Buffer Warning:</span>
              <span className="ml-1.5 text-slate-300">
                Remaining buffer to Trailing Floor is <span className="font-semibold text-white">${trailingFloor.bufferDollars.toFixed(2)}</span> ({trailingFloor.bufferPercent.toFixed(2)}%). Consider reducing position sizing.
              </span>
            </div>
          </div>
          <button onClick={() => dismiss('floorDanger')} className="text-slate-400 hover:text-white p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* OPEN RISK CRITICAL */}
      {isOpenRiskCritical && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-red-950/80 border border-red-500/40 rounded-xl text-red-100 shadow-md">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-red-300">Open Risk Exceeded:</span>
              <span className="ml-1.5 text-slate-300">
                Active Open Risk is <span className="font-semibold text-white">${account.existingOpenRisk.toLocaleString()}</span> (Limit: ${(maxAllowedRisk).toLocaleString()}).
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-300 rounded border border-red-500/30">
            &ge; ${(maxAllowedRisk).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
};

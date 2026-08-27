import { SUPPORTED_ASSETS, NYS_CONFIG } from '../constants/rules';
import type { TradeClusterEntry } from '../types';

export interface LotCalculationResult {
  lotSize: number;
  pipRiskValue: number;
  totalRiskDollars: number;
  combinedOpenRiskDollars: number;
  maxAllowedOpenRiskDollars: number;
  isHardBreach: boolean;
  breachMessage?: string;
  marginRequiredEst: number;
  riskPercentOfCapital: number;
  isWarningNearLimit: boolean;
}

export interface TrailingFloorResult {
  lockedFloor: number;
  bufferDollars: number;
  bufferPercent: number;
  isDanger: boolean; // buffer < $500
  isBreached: boolean; // equity <= floor
  peakEquity: number;
  trailingPercent: number;
}

export interface DailyDrawdownResult {
  startOfDayBalance: number;
  maxDailyLossLimit: number; // calculated from baseCapital * dailyLossPercent
  hardBreachLevel: number; // startOfDay - maxDailyLossLimit
  todayPnL: number; // currentEquity - startOfDayBalance
  todayLossUsedDollars: number;
  remainingLossAllowance: number;
  percentDailyLimitUsed: number;
  isDailyBreached: boolean;
  isDailyWarning: boolean;
}

/**
 * Calculates the locked Trailing Maximum Loss Floor from peak recorded equity.
 */
export function calculateTrailingFloor(
  currentEquity: number,
  recordedPeak: number,
  trailingPercent: number = 0.05,
  baseCapital: number = 100_000
): TrailingFloorResult {
  const peak = Math.max(baseCapital, recordedPeak, currentEquity);
  const lockedFloor = peak * (1 - trailingPercent);
  const bufferDollars = currentEquity - lockedFloor;
  const bufferPercent = currentEquity > 0 ? (bufferDollars / currentEquity) * 100 : 0;
  
  return {
    lockedFloor,
    bufferDollars,
    bufferPercent,
    isDanger: bufferDollars < (baseCapital * 0.005) && bufferDollars > 0, // e.g. < $500 for $100k
    isBreached: bufferDollars <= 0,
    peakEquity: peak,
    trailingPercent,
  };
}

/**
 * Calculates daily drawdown against the daily loss limit (e.g. 3% of capital).
 */
export function calculateDailyDrawdown(
  currentEquity: number,
  startOfDayBalance: number,
  dailyLossPercent: number = 0.03,
  baseCapital: number = 100_000
): DailyDrawdownResult {
  const sod = startOfDayBalance > 0 ? startOfDayBalance : baseCapital;
  const maxDailyLossLimit = baseCapital * dailyLossPercent; // e.g. $3,000 for $100k
  const hardBreachLevel = sod - maxDailyLossLimit;
  const todayPnL = currentEquity - sod;
  
  const todayLossUsedDollars = todayPnL < 0 ? Math.abs(todayPnL) : 0;
  const remainingLossAllowance = Math.max(0, maxDailyLossLimit - todayLossUsedDollars);
  const percentDailyLimitUsed = maxDailyLossLimit > 0 ? (todayLossUsedDollars / maxDailyLossLimit) * 100 : 0;

  return {
    startOfDayBalance: sod,
    maxDailyLossLimit,
    hardBreachLevel,
    todayPnL,
    todayLossUsedDollars,
    remainingLossAllowance,
    percentDailyLimitUsed,
    isDailyBreached: todayPnL <= -maxDailyLossLimit,
    isDailyWarning: todayLossUsedDollars >= maxDailyLossLimit * 0.5,
  };
}

/**
 * Pre-Trade Lot Size & Risk Engine with dynamic open risk limit.
 */
export function calculateLotSize(
  assetId: string,
  stopLossDistance: number,
  plannedRiskDollars: number,
  existingOpenRiskDollars: number = 0,
  currentPrice: number = 1.0,
  baseCapital: number = 100_000,
  maxOpenRiskPercent: number = 0.01
): LotCalculationResult {
  const asset = SUPPORTED_ASSETS.find(a => a.id === assetId) || SUPPORTED_ASSETS[0];
  const maxAllowedOpenRiskDollars = baseCapital * maxOpenRiskPercent; // e.g. $1,000 for 1% of $100k
  const combinedOpenRisk = plannedRiskDollars + existingOpenRiskDollars;
  const isHardBreach = combinedOpenRisk >= maxAllowedOpenRiskDollars;
  const isWarningNearLimit = combinedOpenRisk >= maxAllowedOpenRiskDollars * 0.9 && !isHardBreach;

  let breachMessage: string | undefined;
  if (isHardBreach) {
    breachMessage = `HARD BREACH VIOLATION: Total open risk ($${combinedOpenRisk.toFixed(2)}) must stay strictly below $${maxAllowedOpenRiskDollars.toLocaleString()} (< ${(maxOpenRiskPercent * 100).toFixed(1)}% limit).`;
  }

  let rawLotSize = 0;
  if (stopLossDistance > 0 && asset.pipValuePerStandardLot > 0) {
    rawLotSize = plannedRiskDollars / (stopLossDistance * asset.pipValuePerStandardLot);
  }

  const lotSize = Math.round(rawLotSize * 100) / 100;
  const pipRiskValue = lotSize * asset.pipValuePerStandardLot;
  
  const marginRequiredEst = (lotSize * asset.contractSize * (currentPrice > 0 ? currentPrice : 1.0)) / asset.leverageRatio;
  const riskPercentOfCapital = baseCapital > 0 ? (plannedRiskDollars / baseCapital) * 100 : 0;

  return {
    lotSize: Math.max(0.01, lotSize),
    pipRiskValue,
    totalRiskDollars: plannedRiskDollars,
    combinedOpenRiskDollars: combinedOpenRisk,
    maxAllowedOpenRiskDollars,
    isHardBreach,
    breachMessage,
    marginRequiredEst,
    riskPercentOfCapital,
    isWarningNearLimit,
  };
}

/**
 * Trade Idea 10-Minute Rolling Cluster Validator
 */
export function validateTradeCluster(
  entries: TradeClusterEntry[],
  tradeIdeaMaxRiskPercent: number = 0.02,
  baseCapital: number = 100_000,
  windowMinutes: number = NYS_CONFIG.TRADE_IDEA_CLUSTER_WINDOW_MINS
): {
  totalClusterRisk: number;
  totalClusterDrawdown: number;
  clusterCapDollars: number;
  isBreached: boolean;
  warningMessage?: string;
} {
  const now = new Date().getTime();
  const windowMs = windowMinutes * 60 * 1000;
  const clusterCapDollars = baseCapital * tradeIdeaMaxRiskPercent; // e.g. $2,000 for 2% of $100k

  const activeEntries = entries.filter(e => {
    const entryTime = new Date(e.timestamp).getTime();
    return now - entryTime <= windowMs;
  });

  const totalClusterRisk = activeEntries.reduce((sum, e) => sum + e.riskDollars, 0);
  const totalClusterDrawdown = activeEntries.reduce((sum, e) => sum + e.peakFloatingDrawdown, 0);
  
  const isBreached = totalClusterDrawdown >= clusterCapDollars || totalClusterRisk > clusterCapDollars;
  
  let warningMessage: string | undefined;
  if (isBreached) {
    warningMessage = `TRADE IDEA RULE VIOLATION: Peak drawdown or open risk for scaled positions within 10 minutes ($${Math.max(totalClusterDrawdown, totalClusterRisk).toFixed(2)}) exceeds the $${clusterCapDollars.toLocaleString()} (${(tradeIdeaMaxRiskPercent * 100).toFixed(0)}%) cap.`;
  }

  return {
    totalClusterRisk,
    totalClusterDrawdown,
    clusterCapDollars,
    isBreached,
    warningMessage,
  };
}

import { DEFAULT_PROP_CONFIG, NYS_CONFIG } from '../constants/rules';
import type { DailyJournalEntry, PayoutStatusResult, PropFirmConfig } from '../types';

/**
 * Computes the Consistency Rule, Qualifying Profitable Days, and Payout Readiness using dynamic PropFirmConfig.
 */
export function calculatePayoutStatus(
  journalEntries: DailyJournalEntry[],
  config: PropFirmConfig = DEFAULT_PROP_CONFIG,
  cycleStartDateStr: string = '2026-08-01'
): PayoutStatusResult {
  const validEntries = journalEntries;
  const totalAccumulatedProfit = validEntries.reduce((sum, entry) => sum + entry.netProfit, 0);

  const minProfitDay = config.minProfitPerDayPayout || 250;
  const targetDays = config.qualifyingDaysTarget || 7;
  const consistencyCap = config.consistencyCapPercent || 0.15;
  const maxPayoutGrossCap = (config.baseCapital || 100_000) * (config.maxPayoutCapPercent || 0.02);
  const profitSplit = config.profitSplitRate || 0.80;

  const qualifyingDays = validEntries.filter(entry => entry.netProfit >= minProfitDay);
  const qualifyingDaysCount = qualifyingDays.length;
  const qualifyingDaysMet = qualifyingDaysCount >= targetDays;

  let highestSingleDayProfit = 0;
  let highestSingleDayDate = '';

  validEntries.forEach(entry => {
    if (entry.netProfit > highestSingleDayProfit) {
      highestSingleDayProfit = entry.netProfit;
      highestSingleDayDate = entry.date;
    }
  });

  const maxAllowedSingleDayProfit = Math.max(0, totalAccumulatedProfit * consistencyCap);

  let consistencyPercentage = 0;
  if (totalAccumulatedProfit > 0 && highestSingleDayProfit > 0) {
    consistencyPercentage = (highestSingleDayProfit / totalAccumulatedProfit) * 100;
  }

  const consistencyMet =
    totalAccumulatedProfit > 0 &&
    highestSingleDayProfit <= maxAllowedSingleDayProfit + 0.001;

  let additionalProfitNeededForConsistency = 0;
  if (highestSingleDayProfit > 0) {
    const requiredTotalProfit = highestSingleDayProfit / consistencyCap;
    if (requiredTotalProfit > totalAccumulatedProfit) {
      additionalProfitNeededForConsistency = requiredTotalProfit - totalAccumulatedProfit;
    }
  }

  const isEligibleForPayout =
    consistencyMet &&
    qualifyingDaysMet &&
    totalAccumulatedProfit >= minProfitDay * targetDays;

  const grossPayoutAmount = isEligibleForPayout
    ? Math.min(maxPayoutGrossCap, Math.max(0, totalAccumulatedProfit))
    : 0;

  const traderNetPayoutAmount = grossPayoutAmount * profitSplit;

  const cycleStart = new Date(cycleStartDateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24));
  const cycleDaysRemaining = Math.max(0, NYS_CONFIG.CYCLE_DURATION_DAYS - diffDays);

  return {
    totalAccumulatedProfit,
    qualifyingDaysCount,
    qualifyingDaysTarget: targetDays,
    qualifyingDaysMet,
    highestSingleDayProfit,
    highestSingleDayDate,
    maxAllowedSingleDayProfit,
    consistencyPercentage,
    consistencyMet,
    additionalProfitNeededForConsistency,
    isEligibleForPayout,
    grossPayoutAmount,
    traderNetPayoutAmount,
    cycleDaysRemaining,
  };
}

export function simulateAdditionalProfit(
  currentTotalProfit: number,
  highestDayProfit: number,
  simulatedExtraProfit: number,
  consistencyCap: number = 0.15
): {
  newTotalProfit: number;
  newConsistencyPercentage: number;
  isNowCompliant: boolean;
  remainingShortfall: number;
} {
  const newTotalProfit = currentTotalProfit + simulatedExtraProfit;
  const newAllowedMax = newTotalProfit * consistencyCap;
  const newConsistencyPercentage = newTotalProfit > 0 ? (highestDayProfit / newTotalProfit) * 100 : 100;
  const isNowCompliant = highestDayProfit <= newAllowedMax;
  
  const requiredTotal = highestDayProfit / consistencyCap;
  const remainingShortfall = Math.max(0, requiredTotal - newTotalProfit);

  return {
    newTotalProfit,
    newConsistencyPercentage,
    isNowCompliant,
    remainingShortfall,
  };
}

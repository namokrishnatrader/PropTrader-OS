// Data types for PropTrader Command & Discipline OS

export type TradingSession = 'London' | 'New York' | 'Asian' | 'Overlap';
export type SetupGrade = 'A+' | 'A' | 'B' | 'C';
export type EmotionTag = 'Calm' | 'FOMO' | 'Boredom' | 'Confident' | 'Revenge' | 'Anxious' | 'Disciplined';
export type MistakeTag = 
  | 'Valid SL'
  | 'Chased Entry'
  | 'Removed SL'
  | 'Overleveraged'
  | 'Overtraded'
  | 'Early Exit'
  | 'Held Through Reset'
  | 'Perfect Execution';

export type AssetCategory = 'Metals' | 'Crypto';

export interface AssetConfig {
  id: string;
  name: string;
  symbol: string;
  category: AssetCategory;
  leverage: string;
  leverageRatio: number;
  contractSize: number;
  pipSize: number;
  pipValuePerStandardLot: number;
  typicalSpread: number;
  description: string;
}

export interface TradeClusterEntry {
  id: string;
  timestamp: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  lotSize: number;
  riskDollars: number;
  peakFloatingDrawdown: number;
}

export interface DailyJournalEntry {
  id: string;
  date: string;
  session: TradingSession;
  tradesCount: number;
  netProfit: number;
  highestFloatingDrawdown: number;
  lotsTraded: number;
  assetsTraded: string[];
  setupGrade: SetupGrade;
  emotion: EmotionTag;
  mistakes: MistakeTag[];
  ruleBreach: boolean;
  breachReason?: string;
  notes: string;
  chartUrl?: string;
  disciplineScore: number;
}

export interface DailyHabitItem {
  id: string;
  label: string;
  category: 'physical' | 'preparation' | 'execution' | 'psychology';
  description: string;
  completed: boolean;
  weight: number;
}

export interface DailyDisciplineRecord {
  date: string;
  habits: DailyHabitItem[];
  disciplineScore: number;
  mentalClarityScore: number;
  fomoUrgeScore: number;
  revengeUrgeScore: number;
  notes: string;
  savedAt: string;
}

export interface PropFirmConfig {
  baseCapital: number;
  dailyLossPercent: number;
  trailingMaxLossPercent: number;
  maxOpenRiskPercent: number;
  minProfitPerDayPayout: number;
  consistencyCapPercent: number;
  qualifyingDaysTarget: number;
  maxPayoutCapPercent: number;
  profitSplitRate: number;
  tradeIdeaMaxRiskPercent: number;
}

export interface AccountState {
  baseCapital: number;
  currentEquity: number;
  currentBalance: number;
  startOfDayBalance: number;
  peakRecordedEquity: number;
  existingOpenRisk: number;
  streakDays: number;
  cycleStartDate: string;
  config: PropFirmConfig;
}

export interface PayoutStatusResult {
  totalAccumulatedProfit: number;
  qualifyingDaysCount: number;
  qualifyingDaysTarget: number;
  qualifyingDaysMet: boolean;
  highestSingleDayProfit: number;
  highestSingleDayDate: string;
  maxAllowedSingleDayProfit: number;
  consistencyPercentage: number;
  consistencyMet: boolean;
  additionalProfitNeededForConsistency: number;
  isEligibleForPayout: boolean;
  grossPayoutAmount: number;
  traderNetPayoutAmount: number;
  cycleDaysRemaining: number;
}

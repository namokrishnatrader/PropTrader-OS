import type { AssetConfig, DailyHabitItem, PropFirmConfig } from '../types';

export const DEFAULT_PROP_CONFIG: PropFirmConfig = {
  baseCapital: 100_000,
  dailyLossPercent: 0.03, // 3%
  trailingMaxLossPercent: 0.05, // 5%
  maxOpenRiskPercent: 0.01, // 1%
  minProfitPerDayPayout: 250, // $250
  consistencyCapPercent: 0.15, // 15%
  qualifyingDaysTarget: 7, // 7 days
  maxPayoutCapPercent: 0.02, // 2%
  profitSplitRate: 0.80, // 80%
  tradeIdeaMaxRiskPercent: 0.02, // 2%
};

export const NYS_CONFIG = {
  BASE_CAPITAL: 100_000,
  DAILY_RESET_UTC_HOUR: 21, // 21:00 UTC Daily Reset
  CYCLE_DURATION_DAYS: 30, // 30-day payout cycle
  RECOMMENDED_DAILY_PROFIT_TARGET: 300, // $250 - $350 target
  MAX_DAILY_LOSS_SOFT_STOP: 150, // $100 - $150 disciplined daily loss stop
  MAX_TRADES_PER_SESSION: 2, // Anti-overtrading rule
  TRADE_IDEA_CLUSTER_WINDOW_MINS: 10, // 10m cluster window
  FLOOR_DANGER_BUFFER_THRESHOLD: 500, // $500 buffer warning trigger
  OPEN_RISK_WARNING_THRESHOLD: 900, // $900 warning trigger
};

export const SUPPORTED_ASSETS: AssetConfig[] = [
  {
    id: 'xauusd',
    name: 'Gold (XAU / USD)',
    symbol: 'XAUUSD',
    category: 'Metals',
    leverage: '1:30',
    leverageRatio: 30,
    contractSize: 100, // 1 lot = 100 oz
    pipSize: 0.01, // 1 pip/cent = $0.01 move
    pipValuePerStandardLot: 1.0, // $0.01 move = $1.00 per lot ($1.00 move = $100 per lot)
    typicalSpread: 1.5,
    description: '1:30 leverage | 1 lot = 100 oz | $1.00 move = $100 / lot',
  },
  {
    id: 'xagusd',
    name: 'Silver (XAG / USD)',
    symbol: 'XAGUSD',
    category: 'Metals',
    leverage: '1:30',
    leverageRatio: 30,
    contractSize: 5000, // 1 lot = 5000 oz
    pipSize: 0.01, // $0.01 move = $50 per lot
    pipValuePerStandardLot: 50.0, // $0.01 move = $50.00 per lot ($1.00 move = $5,000 / lot)
    typicalSpread: 2.0,
    description: '1:30 leverage | 1 lot = 5,000 oz | $0.01 move = $50 / lot',
  },
  {
    id: 'btcusd',
    name: 'Bitcoin (BTC / USD)',
    symbol: 'BTCUSD',
    category: 'Crypto',
    leverage: '1:2',
    leverageRatio: 2,
    contractSize: 1, // 1 contract = 1 BTC
    pipSize: 1.0, // $1.00 move = $1 per contract
    pipValuePerStandardLot: 1.0,
    typicalSpread: 15.0,
    description: '1:2 leverage | 1 contract = 1 BTC | $1.00 move = $1 / contract',
  },
  {
    id: 'ethusd',
    name: 'Ethereum (ETH / USD)',
    symbol: 'ETHUSD',
    category: 'Crypto',
    leverage: '1:2',
    leverageRatio: 2,
    contractSize: 1, // 1 contract = 1 ETH
    pipSize: 1.0, // $1.00 move = $1 per contract
    pipValuePerStandardLot: 1.0,
    typicalSpread: 1.5,
    description: '1:2 leverage | 1 contract = 1 ETH | $1.00 move = $1 / contract',
  },
];

export const DEFAULT_HABITS: DailyHabitItem[] = [
  {
    id: 'habit-workout',
    label: 'Physical Workout / Gym Completed',
    category: 'physical',
    description: 'Elevate heart rate, release dopamine and stress prior to market open.',
    completed: false,
    weight: 15,
  },
  {
    id: 'habit-sleep',
    label: 'Minimum 7+ Hours Quality Sleep',
    category: 'physical',
    description: 'Ensure mental restoration, cognitive sharpness, and zero sleep-debt impulsivity.',
    completed: false,
    weight: 15,
  },
  {
    id: 'habit-premarket',
    label: 'Pre-Market Analysis & HTF Key Levels Marked',
    category: 'preparation',
    description: 'Mark key liquidity pools, HTF orderblocks/FVGs, and establish daily bias.',
    completed: false,
    weight: 20,
  },
  {
    id: 'habit-sl-placed',
    label: 'Hard Stop Loss Placed Immediately at Entry',
    category: 'execution',
    description: 'SL committed instantly at entry. Strict rule: Never widen or remove SL.',
    completed: false,
    weight: 20,
  },
  {
    id: 'habit-terminal-close',
    label: 'Terminal / Charts Closed at Target or Stop',
    category: 'execution',
    description: 'Walk away after hitting daily profit target or disciplined daily loss stop.',
    completed: false,
    weight: 20,
  },
  {
    id: 'habit-screen-break',
    label: 'No P&L Staring / Screen Break Every 45 Mins',
    category: 'psychology',
    description: 'Step away from screen. Do not obsess over floating candle flickers.',
    completed: false,
    weight: 10,
  },
];

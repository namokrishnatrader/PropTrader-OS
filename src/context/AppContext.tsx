import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type {
  AccountState,
  DailyJournalEntry,
  DailyHabitItem,
  DailyDisciplineRecord,
  TradeClusterEntry,
  PayoutStatusResult,
  PropFirmConfig,
} from '../types';
import { DEFAULT_HABITS, DEFAULT_PROP_CONFIG } from '../constants/rules';
import { INITIAL_ACCOUNT_STATE, MOCK_JOURNAL_ENTRIES } from '../constants/mockData';
import { calculateTrailingFloor, calculateDailyDrawdown } from '../utils/riskCalculations';
import type { TrailingFloorResult, DailyDrawdownResult } from '../utils/riskCalculations';
import { calculatePayoutStatus } from '../utils/consistencyEngine';

const STORAGE_KEY_ACCOUNT = 'proptrader_account_state_v3';
const STORAGE_KEY_JOURNAL = 'proptrader_journal_entries_v3';
const STORAGE_KEY_HABITS = 'proptrader_habits_v3';
const STORAGE_KEY_DISCIPLINE_RECORD = 'proptrader_discipline_record_v3';
const STORAGE_KEY_CLUSTERS = 'proptrader_clusters_v3';
const STORAGE_KEY_SOUND = 'proptrader_sound_alerts_v3';

interface AppContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Account State & Setup Modal
  account: AccountState;
  config: PropFirmConfig;
  updateAccount: (partial: Partial<AccountState>) => void;
  updateConfig: (partial: Partial<PropFirmConfig>) => void;
  initializeAccount: (newConfig: PropFirmConfig) => void;
  updateEquity: (newEquity: number) => void;
  updateOpenRisk: (riskDollars: number) => void;

  isAccountSetupOpen: boolean;
  setIsAccountSetupOpen: (open: boolean) => void;

  // Journal
  journalEntries: DailyJournalEntry[];
  addJournalEntry: (entry: Omit<DailyJournalEntry, 'id'>) => void;
  updateJournalEntry: (id: string, entry: Partial<DailyJournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;

  // Habits & Discipline
  habits: DailyHabitItem[];
  savedDisciplineRecord: DailyDisciplineRecord | null;
  saveDailyDisciplineLog: (
    habitsToSave: DailyHabitItem[],
    mentalClarity: number,
    fomoUrge: number,
    revengeUrge: number,
    notes: string
  ) => void;
  resetDailyHabits: () => void;
  currentDisciplineScore: number;

  // 10-Minute Clusters
  tradeClusters: TradeClusterEntry[];
  addTradeClusterEntry: (entry: Omit<TradeClusterEntry, 'id'>) => void;
  clearTradeClusters: () => void;

  // Computed & Live Metrics
  trailingFloor: TrailingFloorResult;
  dailyDrawdown: DailyDrawdownResult;
  payoutStatus: PayoutStatusResult;

  // Settings & Actions
  soundAlertsEnabled: boolean;
  toggleSoundAlerts: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
  loadDemoData: () => void;
  resetAllData: () => void;
  playAlertBeep: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isAccountSetupOpen, setIsAccountSetupOpen] = useState<boolean>(false);

  const [account, setAccount] = useState<AccountState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACCOUNT);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.config) parsed.config = DEFAULT_PROP_CONFIG;
        return parsed;
      } catch (e) {
        console.error('Failed to parse account state', e);
      }
    }
    return INITIAL_ACCOUNT_STATE;
  });

  const [journalEntries, setJournalEntries] = useState<DailyJournalEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_JOURNAL);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse journal entries', e);
      }
    }
    return MOCK_JOURNAL_ENTRIES;
  });

  const [habits, setHabits] = useState<DailyHabitItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_HABITS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse habits', e);
      }
    }
    return DEFAULT_HABITS;
  });

  const [savedDisciplineRecord, setSavedDisciplineRecord] = useState<DailyDisciplineRecord | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DISCIPLINE_RECORD);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse discipline record', e);
      }
    }
    return null;
  });

  const [tradeClusters, setTradeClusters] = useState<TradeClusterEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CLUSTERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse clusters', e);
      }
    }
    return [];
  });

  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_SOUND) !== 'false';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACCOUNT, JSON.stringify(account));
  }, [account]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_JOURNAL, JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    if (savedDisciplineRecord) {
      localStorage.setItem(STORAGE_KEY_DISCIPLINE_RECORD, JSON.stringify(savedDisciplineRecord));
    }
  }, [savedDisciplineRecord]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CLUSTERS, JSON.stringify(tradeClusters));
  }, [tradeClusters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SOUND, soundAlertsEnabled.toString());
  }, [soundAlertsEnabled]);

  const config = account.config || DEFAULT_PROP_CONFIG;

  const playAlertBeep = useCallback(() => {
    if (!soundAlertsEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.warn('Audio playback failed', e);
    }
  }, [soundAlertsEnabled]);

  const updateAccount = useCallback((partial: Partial<AccountState>) => {
    setAccount(prev => {
      const updated = { ...prev, ...partial };
      if (partial.currentEquity !== undefined) {
        if (partial.currentEquity > prev.peakRecordedEquity) {
          updated.peakRecordedEquity = partial.currentEquity;
        }
      }
      return updated;
    });
  }, []);

  const updateConfig = useCallback((partial: Partial<PropFirmConfig>) => {
    setAccount(prev => ({
      ...prev,
      config: {
        ...prev.config,
        ...partial,
      },
    }));
  }, []);

  const initializeAccount = useCallback((newConfig: PropFirmConfig) => {
    const base = newConfig.baseCapital || 100_000;
    const cleanAccount: AccountState = {
      baseCapital: base,
      currentEquity: base,
      currentBalance: base,
      startOfDayBalance: base,
      peakRecordedEquity: base,
      existingOpenRisk: 0,
      streakDays: 0,
      cycleStartDate: new Date().toISOString().split('T')[0],
      config: newConfig,
    };
    setAccount(cleanAccount);
    setJournalEntries([]);
    setHabits(DEFAULT_HABITS.map(h => ({ ...h, completed: false })));
    setSavedDisciplineRecord(null);
    setTradeClusters([]);
    setIsAccountSetupOpen(false);
  }, []);

  const updateEquity = useCallback((newEquity: number) => {
    setAccount(prev => ({
      ...prev,
      currentEquity: newEquity,
      currentBalance: newEquity,
      peakRecordedEquity: Math.max(prev.peakRecordedEquity, newEquity),
    }));
  }, []);

  const updateOpenRisk = useCallback((riskDollars: number) => {
    setAccount(prev => ({
      ...prev,
      existingOpenRisk: riskDollars,
    }));
  }, []);

  const addJournalEntry = useCallback((entry: Omit<DailyJournalEntry, 'id'>) => {
    const newEntry: DailyJournalEntry = {
      ...entry,
      id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    setJournalEntries(prev => [newEntry, ...prev]);

    setAccount(prev => {
      const newEquity = prev.currentEquity + entry.netProfit;
      return {
        ...prev,
        currentEquity: newEquity,
        currentBalance: newEquity,
        peakRecordedEquity: Math.max(prev.peakRecordedEquity, newEquity),
        streakDays: entry.ruleBreach ? 0 : (entry.disciplineScore >= 90 ? prev.streakDays + 1 : prev.streakDays),
      };
    });
  }, []);

  const updateJournalEntry = useCallback((id: string, updatedFields: Partial<DailyJournalEntry>) => {
    setJournalEntries(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  }, []);

  const deleteJournalEntry = useCallback((id: string) => {
    setJournalEntries(prev => prev.filter(item => item.id !== id));
  }, []);

  const saveDailyDisciplineLog = useCallback((
    habitsToSave: DailyHabitItem[],
    mentalClarity: number,
    fomoUrge: number,
    revengeUrge: number,
    notes: string
  ) => {
    setHabits(habitsToSave);
    
    const totalWeight = habitsToSave.reduce((sum, h) => sum + h.weight, 0);
    const completedWeight = habitsToSave.filter(h => h.completed).reduce((sum, h) => sum + h.weight, 0);
    const score = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 100;

    const record: DailyDisciplineRecord = {
      date: new Date().toISOString().split('T')[0],
      habits: habitsToSave,
      disciplineScore: score,
      mentalClarityScore: mentalClarity,
      fomoUrgeScore: fomoUrge,
      revengeUrgeScore: revengeUrge,
      notes,
      savedAt: new Date().toISOString(),
    };

    setSavedDisciplineRecord(record);

    if (score >= 90) {
      setAccount(prev => ({
        ...prev,
        streakDays: prev.streakDays + 1,
      }));
    }
  }, []);

  const resetDailyHabits = useCallback(() => {
    const resetHabits = DEFAULT_HABITS.map(h => ({ ...h, completed: false }));
    setHabits(resetHabits);
    setSavedDisciplineRecord(null);
  }, []);

  const currentDisciplineScore = useMemo(() => {
    const totalWeight = habits.reduce((sum, h) => sum + h.weight, 0);
    if (totalWeight === 0) return 100;
    const completedWeight = habits.filter(h => h.completed).reduce((sum, h) => sum + h.weight, 0);
    return Math.round((completedWeight / totalWeight) * 100);
  }, [habits]);

  const addTradeClusterEntry = useCallback((entry: Omit<TradeClusterEntry, 'id'>) => {
    const newEntry: TradeClusterEntry = {
      ...entry,
      id: `cluster-${Date.now()}`,
    };
    setTradeClusters(prev => [...prev, newEntry]);
  }, []);

  const clearTradeClusters = useCallback(() => {
    setTradeClusters([]);
  }, []);

  const toggleSoundAlerts = useCallback(() => {
    setSoundAlertsEnabled(prev => !prev);
  }, []);

  const trailingFloor = useMemo(() => {
    return calculateTrailingFloor(
      account.currentEquity,
      account.peakRecordedEquity,
      config.trailingMaxLossPercent,
      config.baseCapital
    );
  }, [account.currentEquity, account.peakRecordedEquity, config.trailingMaxLossPercent, config.baseCapital]);

  const dailyDrawdown = useMemo(() => {
    return calculateDailyDrawdown(
      account.currentEquity,
      account.startOfDayBalance,
      config.dailyLossPercent,
      config.baseCapital
    );
  }, [account.currentEquity, account.startOfDayBalance, config.dailyLossPercent, config.baseCapital]);

  const payoutStatus = useMemo(() => {
    return calculatePayoutStatus(journalEntries, config, account.cycleStartDate);
  }, [journalEntries, config, account.cycleStartDate]);

  const exportDataJSON = useCallback(() => {
    const bundle = {
      version: '3.0.0',
      exportedAt: new Date().toISOString(),
      account,
      journalEntries,
      habits,
      savedDisciplineRecord,
      tradeClusters,
    };
    return JSON.stringify(bundle, null, 2);
  }, [account, journalEntries, habits, savedDisciplineRecord, tradeClusters]);

  const importDataJSON = useCallback((jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.account) setAccount(data.account);
      if (Array.isArray(data.journalEntries)) setJournalEntries(data.journalEntries);
      if (Array.isArray(data.habits)) setHabits(data.habits);
      if (data.savedDisciplineRecord) setSavedDisciplineRecord(data.savedDisciplineRecord);
      if (Array.isArray(data.tradeClusters)) setTradeClusters(data.tradeClusters);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }, []);

  const loadDemoData = useCallback(() => {
    setAccount(INITIAL_ACCOUNT_STATE);
    setJournalEntries(MOCK_JOURNAL_ENTRIES);
    setHabits(DEFAULT_HABITS.map(h => ({ ...h, completed: true })));
    setTradeClusters([]);
  }, []);

  const resetAllData = useCallback(() => {
    initializeAccount(DEFAULT_PROP_CONFIG);
  }, [initializeAccount]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        account,
        config,
        updateAccount,
        updateConfig,
        initializeAccount,
        updateEquity,
        updateOpenRisk,
        isAccountSetupOpen,
        setIsAccountSetupOpen,
        journalEntries,
        addJournalEntry,
        updateJournalEntry,
        deleteJournalEntry,
        habits,
        savedDisciplineRecord,
        saveDailyDisciplineLog,
        resetDailyHabits,
        currentDisciplineScore,
        tradeClusters,
        addTradeClusterEntry,
        clearTradeClusters,
        trailingFloor,
        dailyDrawdown,
        payoutStatus,
        soundAlertsEnabled,
        toggleSoundAlerts,
        exportDataJSON,
        importDataJSON,
        loadDemoData,
        resetAllData,
        playAlertBeep,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

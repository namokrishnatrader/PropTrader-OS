import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { DailyHabitItem } from '../../types';
import {
  CheckSquare,
  RotateCcw,
  Flame,
  CheckCircle2,
  Circle,
  Sliders,
  Shield,
  Save,
  Check,
} from 'lucide-react';

export const DisciplineCenter: React.FC = () => {
  const {
    habits,
    saveDailyDisciplineLog,
    resetDailyHabits,
    currentDisciplineScore,
    savedDisciplineRecord,
    account,
  } = useApp();

  const [draftHabits, setDraftHabits] = useState<DailyHabitItem[]>(habits);
  const [draftMentalClarity, setDraftMentalClarity] = useState<number>(() => {
    return savedDisciplineRecord ? savedDisciplineRecord.mentalClarityScore : 8;
  });
  const [draftFomoUrge, setDraftFomoUrge] = useState<number>(() => {
    return savedDisciplineRecord ? savedDisciplineRecord.fomoUrgeScore : 2;
  });
  const [draftRevengeUrge, setDraftRevengeUrge] = useState<number>(() => {
    return savedDisciplineRecord ? savedDisciplineRecord.revengeUrgeScore : 1;
  });
  const [draftNotes, setDraftNotes] = useState<string>(() => {
    return savedDisciplineRecord ? savedDisciplineRecord.notes : '';
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setDraftHabits(habits);
  }, [habits]);

  const toggleDraftHabit = (id: string) => {
    setDraftHabits(prev =>
      prev.map(h => (h.id === id ? { ...h, completed: !h.completed } : h))
    );
  };

  const handleSaveDailyLog = () => {
    saveDailyDisciplineLog(
      draftHabits,
      draftMentalClarity,
      draftFomoUrge,
      draftRevengeUrge,
      draftNotes
    );

    setToastMessage('Daily Habits & Discipline Log Saved Successfully!');
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleReset = () => {
    resetDailyHabits();
    setDraftMentalClarity(8);
    setDraftFomoUrge(2);
    setDraftRevengeUrge(1);
    setDraftNotes('');
    setToastMessage('Habits reset for today.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const draftTotalWeight = draftHabits.reduce((sum, h) => sum + h.weight, 0);
  const draftCompletedWeight = draftHabits.filter(h => h.completed).reduce((sum, h) => sum + h.weight, 0);
  const draftScore = draftTotalWeight > 0 ? Math.round((draftCompletedWeight / draftTotalWeight) * 100) : 100;
  const completedCount = draftHabits.filter(h => h.completed).length;

  return (
    <div className="space-y-7 animate-fade-in relative">
      
      {/* Toast Notification with 3D glow */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 animate-bounce">
          <div className="flex items-center gap-2.5 px-5 py-3.5 bg-emerald-950/95 border-t border-emerald-400/40 border-b border-black/60 text-emerald-200 rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.4)] text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="glass-3d-card p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-300 border-t border-indigo-400/30 border-b border-black/40 shadow-[0_0_12px_rgba(99,102,241,0.3)]">
                <CheckSquare className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Daily Lifestyle, Psychology &amp; Discipline Audit
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Track your preparation, physical routine, and mental state to prevent impulsive trading.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="btn-3d-secondary px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" /> Reset Today's Checklist
            </button>
          </div>
        </div>
      </div>

      {/* Discipline Score & Streak Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="glass-3d-card-interactive p-7 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">
              Committed Discipline Score
            </span>
            <div className="text-3xl sm:text-4xl font-bold text-slate-50 mt-2 drop-shadow-sm">
              {currentDisciplineScore}%
            </div>
            <div className="text-xs text-slate-400 mt-1.5">
              Draft Preview: <span className="text-indigo-300 font-semibold">{draftScore}%</span> ({completedCount}/{draftHabits.length} Habits)
            </div>
          </div>
          <div className="w-16 h-16 rounded-2xl glass-3d-inset flex items-center justify-center">
            <span className="text-base font-bold text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">{currentDisciplineScore}%</span>
          </div>
        </div>

        <div className="glass-3d-card-interactive p-7 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">
              Disciplined Streak
            </span>
            <div className="text-3xl sm:text-4xl font-bold text-amber-300 mt-2 flex items-center gap-2.5 drop-shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              <Flame className="w-7 h-7 text-amber-400 fill-amber-400 animate-bounce" />
              <span>{account.streakDays} Days</span>
            </div>
            <div className="text-xs text-slate-400 mt-1.5 font-medium">
              Consecutive days with &ge; 90% discipline
            </div>
          </div>
        </div>

        <div className="glass-3d-card-interactive p-7 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">
              Log Status
            </span>
            <div className="text-base font-bold text-emerald-400 mt-2 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>{savedDisciplineRecord ? 'Log Saved' : 'Unsaved Draft'}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1.5">
              {savedDisciplineRecord ? `Saved at ${new Date(savedDisciplineRecord.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Click Save Daily Log below'}
            </div>
          </div>
        </div>

      </div>

      {/* Main Checklist & Psychology Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        
        {/* Left: Non-Negotiable Routine Checklist (7 Cols) */}
        <div className="lg:col-span-7 glass-3d-card p-8 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <h3 className="font-semibold text-white text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              Daily Routine &amp; Execution Checklist
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Interactive Checklist
            </span>
          </div>

          <div className="space-y-3">
            {draftHabits.map(habit => {
              return (
                <div
                  key={habit.id}
                  onClick={() => toggleDraftHabit(habit.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    habit.completed
                      ? 'bg-gradient-to-r from-indigo-950/40 to-indigo-900/20 border-t-indigo-400/30 border-indigo-500/20 shadow-[0_4px_15px_rgba(99,102,241,0.15)] text-white'
                      : 'glass-3d-inset text-slate-300 hover:border-white/[0.15]'
                  }`}
                >
                  <button className="mt-0.5 text-indigo-400">
                    {habit.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-indigo-400 fill-indigo-500/20 drop-shadow-[0_0_6px_rgba(99,102,241,0.6)]" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${habit.completed ? 'text-indigo-200' : 'text-white'}`}>
                        {habit.label}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {habit.weight}% weight
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {habit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Psychology Tilt & Mental Clarity Sliders (5 Cols) */}
        <div className="lg:col-span-5 glass-3d-card p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <h3 className="font-semibold text-white text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                Psychological Tilt Audit
              </h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25 font-semibold">
                Self-Calibration
              </span>
            </div>

            <div className="space-y-5 mt-5 text-xs">
              {/* Mental Clarity Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-slate-300 font-medium">
                  <span>Mental Clarity &amp; Focus</span>
                  <span className="text-indigo-300 font-bold">{draftMentalClarity} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={draftMentalClarity}
                  onChange={e => setDraftMentalClarity(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>1 (Fatigued)</span>
                  <span>10 (Peak Focus)</span>
                </div>
              </div>

              {/* FOMO Urge Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-slate-300 font-medium">
                  <span>FOMO / Chasing Urge</span>
                  <span className={draftFomoUrge > 5 ? 'text-rose-400 font-bold drop-shadow-[0_0_6px_rgba(244,63,94,0.4)]' : 'text-emerald-400 font-bold'}>
                    {draftFomoUrge} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={draftFomoUrge}
                  onChange={e => setDraftFomoUrge(parseInt(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>1 (Zero Urge)</span>
                  <span>10 (Severe FOMO)</span>
                </div>
              </div>

              {/* Revenge Urge Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-slate-300 font-medium">
                  <span>Revenge / Make-It-Back Urge</span>
                  <span className={draftRevengeUrge > 4 ? 'text-rose-400 font-bold drop-shadow-[0_0_6px_rgba(244,63,94,0.4)]' : 'text-emerald-400 font-bold'}>
                    {draftRevengeUrge} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={draftRevengeUrge}
                  onChange={e => setDraftRevengeUrge(parseInt(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>1 (Calm Acceptance)</span>
                  <span>10 (Desire to Revenge Trade)</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Mental Reflections &amp; Routine Notes</label>
                <textarea
                  rows={2}
                  value={draftNotes}
                  onChange={e => setDraftNotes(e.target.value)}
                  placeholder="Record emotional state, sleep quality, and physical focus..."
                  className="w-full p-3 glass-3d-inset rounded-xl text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl glass-3d-inset text-xs text-slate-400">
            <strong className="text-white block mb-1">Discipline Protocol:</strong>
            If FOMO &gt; 5 or Revenge &gt; 3, shut down the trading terminal for the session.
          </div>
        </div>

      </div>

      {/* Prominent 3D Embossed SUBMIT BUTTON */}
      <div className="glass-3d-card p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-semibold text-white text-base flex items-center gap-2">
            <Save className="w-5 h-5 text-emerald-400" />
            Commit Daily Discipline Audit
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Clicking Save Daily Log commits your habit scores and reflections to LocalStorage and updates your streak.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveDailyLog}
          className="btn-3d-emerald w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5"
        >
          <Check className="w-4 h-4" />
          <span>Save Daily Log / Submit</span>
        </button>
      </div>

    </div>
  );
};

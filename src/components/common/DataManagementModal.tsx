import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Download, Upload, RefreshCw, Trash2, X, CheckCircle, AlertTriangle, FileCode } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DataManagementModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { exportDataJSON, importDataJSON, loadDemoData, resetAllData } = useApp();
  const [importText, setImportText] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl glass-3d-elevated overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/[0.08] bg-black/40">
          <div className="flex items-center gap-3">
            <FileCode className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Data Persistence &amp; Backup Manager</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 space-y-6 overflow-y-auto text-xs">
          {feedback && (
            <div
              className={`p-4 rounded-2xl flex items-center gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300'
                  : 'bg-red-950/60 border border-red-500/50 text-red-300'
              }`}
            >
              {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Export & Demo actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl glass-3d-inset flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
                  <Download className="w-4 h-4 text-indigo-400" />
                  Export to JSON
                </h3>
                <p className="text-slate-400 mt-1 leading-relaxed text-[11px]">
                  Save all balances, journal entries, and habit history to a local backup file.
                </p>
              </div>
              <button
                onClick={() => {
                  const jsonStr = exportDataJSON();
                  const blob = new Blob([jsonStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `PropTrader-Backup-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  setFeedback({ type: 'success', message: 'Backup JSON downloaded successfully!' });
                }}
                className="mt-4 w-full py-2.5 px-4 btn-3d-primary rounded-xl flex items-center justify-center gap-2 text-xs font-semibold"
              >
                <Download className="w-4 h-4" /> Download Backup File
              </button>
            </div>

            <div className="p-6 rounded-2xl glass-3d-inset flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  Load Sample Dataset
                </h3>
                <p className="text-slate-400 mt-1 leading-relaxed text-[11px]">
                  Populate with 15 realistic trading days, qualifying days, and discipline records.
                </p>
              </div>
              <button
                onClick={() => {
                  loadDemoData();
                  setFeedback({ type: 'success', message: 'Realistic 15-day Demo Dataset loaded successfully!' });
                  setTimeout(() => onClose(), 1000);
                }}
                className="mt-4 w-full py-2.5 px-4 btn-3d-secondary rounded-xl flex items-center justify-center gap-2 text-xs font-semibold"
              >
                <RefreshCw className="w-4 h-4 text-emerald-400" /> Load Demo Data
              </button>
            </div>
          </div>

          {/* Import JSON Section */}
          <div className="p-6 rounded-2xl glass-3d-inset space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
              <Upload className="w-4 h-4 text-purple-400" />
              Import Data from JSON String
            </h3>
            <textarea
              rows={4}
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder="Paste your backup JSON content here..."
              className="w-full p-3 glass-3d-inset rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 text-xs font-medium"
            />
            <button
              onClick={() => {
                if (!importText.trim()) {
                  setFeedback({ type: 'error', message: 'Please paste a valid JSON backup text.' });
                  return;
                }
                const success = importDataJSON(importText.trim());
                if (success) {
                  setFeedback({ type: 'success', message: 'Account and journal data imported successfully!' });
                  setImportText('');
                  setTimeout(() => onClose(), 1200);
                } else {
                  setFeedback({ type: 'error', message: 'Failed to import JSON: Invalid structure.' });
                }
              }}
              disabled={!importText.trim()}
              className="btn-3d-primary py-2.5 px-5 rounded-xl text-xs font-semibold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" /> Restore Data
            </button>
          </div>

          {/* Factory Reset */}
          <div className="p-6 rounded-2xl bg-red-950/25 border-t border-red-400/30 border-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-red-300 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-400" />
                Reset All Local Storage Data
              </h4>
              <p className="text-slate-400 mt-0.5 text-[11px]">
                Clear all custom entries and revert to baseline state.
              </p>
            </div>
            {showResetConfirm ? (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    resetAllData();
                    setShowResetConfirm(false);
                    setFeedback({ type: 'success', message: 'All data reset to clean baseline state.' });
                    setTimeout(() => onClose(), 1000);
                  }}
                  className="btn-3d-primary bg-gradient-to-b from-red-500 to-red-700 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Confirm Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="btn-3d-secondary px-3.5 py-2 rounded-xl text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 font-semibold rounded-xl text-xs transition"
              >
                Clear Data
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

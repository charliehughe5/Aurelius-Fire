import React, { useState } from 'react';
import { api } from '../../api';
import {
  Database,
  Play,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Check,
  Building2,
  FileText,
  Calendar,
  Layers,
} from 'lucide-react';

export const TestDataManager: React.FC = () => {
  const [loadingAction, setLoadingAction] = useState<'seed' | 'purge' | null>(null);
  const [lastActionResult, setLastActionResult] = useState<{
    success: boolean;
    message: string;
    result?: any;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setLoadingAction('seed');
    setError(null);
    try {
      const res = await api.seedTestData();
      setLastActionResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to seed sample test dataset.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePurge = async () => {
    if (!window.confirm('Are you sure you want to purge all test records ([TEST] tag)? This action is irreversible.')) {
      return;
    }
    setLoadingAction('purge');
    setError(null);
    try {
      const res = await api.purgeTestData();
      setLastActionResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to purge test data.');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900">Test Data & Verification Engine</h2>
              <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                Part 45 Standard
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Seed a complete, interconnected test dataset across all CRM modules (Client, Premises, Quote, Job,
              Findings, FRA Report, Action Plan) to test end-to-end user journeys without contaminating production data.
            </p>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Strict Production Isolation Enforced</span>
          </div>
        </div>
      </div>

      {lastActionResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">{lastActionResult.message}</div>
            {lastActionResult.result && (
              <div className="text-[11px] text-emerald-700 font-mono">
                {JSON.stringify(lastActionResult.result)}
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Execution Failed</div>
            <div className="text-[11px] text-rose-700">{error}</div>
          </div>
        </div>
      )}

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Seed Sample Dataset */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                <Play className="w-4 h-4 ml-0.5" />
              </div>
              <span>Seed Sample Test Dataset</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Injects a fully qualified UK commercial retail test scenario tagged with <code className="bg-slate-100 px-1 rounded text-purple-700 font-mono">[TEST]</code>:
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pl-1">
              <li className="flex items-center space-x-2">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Client: <strong>Miller Booksellers Ltd</strong> (David Miller)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Premises: <strong>14 Charing Cross Road, London</strong></span>
              </li>
              <li className="flex items-center space-x-2">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Accepted Quote: <strong>£444.00 total</strong> (Commercial PAS 79)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Scheduled Job: <strong>Ready for assessment</strong></span>
              </li>
              <li className="flex items-center space-x-2">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Report & 2 Actions: <strong>1 Urgent Electrical, 1 Lighting Routine</strong></span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleSeed}
            disabled={loadingAction !== null}
            className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center justify-center space-x-2"
          >
            {loadingAction === 'seed' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Injecting Test Entities...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Inject Sample Test Dataset</span>
              </>
            )}
          </button>
        </div>

        {/* Purge All Test Data */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
                <Trash2 className="w-4 h-4" />
              </div>
              <span>Purge All Test Data</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Safely finds and deletes any clients, premises, quotes, jobs, findings, actions, and reports containing the <code className="bg-slate-100 px-1 rounded text-purple-700 font-mono">[TEST]</code> identifier.
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 space-y-1">
              <div className="font-semibold flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Zero Contamination Guarantee</span>
              </div>
              <p>
                Production records (clients with real corporate names and assessment records) are strictly excluded from deletion.
              </p>
            </div>
          </div>

          <button
            onClick={handlePurge}
            disabled={loadingAction !== null}
            className="w-full py-2.5 bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center justify-center space-x-2"
          >
            {loadingAction === 'purge' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Purging Test Entities...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Purge Test Records</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

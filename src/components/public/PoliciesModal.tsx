import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { LegalPolicy } from '../../types';
import { X, ShieldCheck, FileText, Scale, Lock, RefreshCw, MessageSquare, Archive } from 'lucide-react';

interface PoliciesModalProps {
  initialKey?: string;
  isOpen: boolean;
  onClose: () => void;
}

const POLICY_ICONS: Record<string, any> = {
  terms_and_conditions: Scale,
  privacy_notice: Lock,
  cancellation_policy: RefreshCw,
  complaints_procedure: MessageSquare,
  document_retention: Archive,
};

export const PoliciesModal: React.FC<PoliciesModalProps> = ({
  initialKey = 'terms_and_conditions',
  isOpen,
  onClose,
}) => {
  const [policies, setPolicies] = useState<LegalPolicy[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>(initialKey);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setSelectedKey(initialKey);
      setLoading(true);
      api
        .getPolicies()
        .then((res) => {
          setPolicies(res);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [isOpen, initialKey]);

  if (!isOpen) return null;

  const activePolicy = policies.find((p) => p.key === selectedKey) || policies[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200/80 overflow-hidden">
        {/* Apple-style Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 backdrop-blur-md">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Legal Policies, Engagement Terms & Compliance
              </h3>
              <p className="text-[11px] text-slate-500">
                Aurelius Commercial Fire Safety • Regulatory Reform (Fire Safety) Order 2005
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body with Sidebar Tabs */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Tabs */}
          <div className="w-full md:w-64 bg-slate-50/50 border-r border-slate-100 p-3 space-y-1 overflow-y-auto shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
              Statutory Documents
            </div>
            {policies.map((p) => {
              const Icon = POLICY_ICONS[p.key] || FileText;
              const isSelected = selectedKey === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => setSelectedKey(p.key)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span className="truncate">{p.title}</span>
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-white">
            {loading ? (
              <div className="text-center py-16 text-slate-400 text-sm">Loading legal policies...</div>
            ) : activePolicy ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{activePolicy.title}</h4>
                    <span className="text-xs text-slate-400">
                      Version: {activePolicy.version} • Reviewed:{' '}
                      {new Date(activePolicy.updatedAt).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                    UK Jurisdiction
                  </span>
                </div>
                <div className="prose prose-sm max-w-none text-slate-700 text-xs sm:text-sm whitespace-pre-line leading-relaxed font-sans select-text">
                  {activePolicy.content}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-sm">Policy document not found.</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md flex items-center justify-between text-xs text-slate-500">
          <span>Compliant with PAS 79-1:2020, RRFSO 2005 & Building Safety Act 2022</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition font-semibold text-xs active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { LegalPolicy } from '../../types';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface PoliciesModalProps {
  initialKey?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PoliciesModal: React.FC<PoliciesModalProps> = ({ initialKey = 'terms_and_conditions', isOpen, onClose }) => {
  const [policies, setPolicies] = useState<LegalPolicy[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>(initialKey);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setSelectedKey(initialKey);
      setLoading(true);
      api.getPolicies().then((res) => {
        setPolicies(res);
        setLoading(false);
      }).catch((err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [isOpen, initialKey]);

  if (!isOpen) return null;

  const activePolicy = policies.find((p) => p.key === selectedKey) || policies[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2 text-slate-800">
            <ShieldCheck className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-base">Legal Framework, Terms & Data Policies</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body with Sidebar Tabs */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Tabs */}
          <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-3 space-y-1 overflow-y-auto shrink-0">
            {policies.map((p) => (
              <button
                key={p.key}
                onClick={() => setSelectedKey(p.key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition flex items-center space-x-2 ${
                  selectedKey === p.key
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{p.title}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {loading ? (
              <div className="text-center py-12 text-slate-400 text-sm">Loading policies...</div>
            ) : activePolicy ? (
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{activePolicy.title}</h4>
                    <span className="text-xs text-slate-500">
                      Version: {activePolicy.version} • Last reviewed:{' '}
                      {new Date(activePolicy.updatedAt).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    UK Jurisdiction
                  </span>
                </div>
                <div className="prose prose-sm max-w-none text-slate-700 text-xs sm:text-sm whitespace-pre-line leading-relaxed font-sans">
                  {activePolicy.content}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-sm">Policy document not found.</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Compliant with UK General Data Protection Regulation & RRFSO 2005</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { FireRiskAssessmentRecord, Premises } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
import {
  FileCheck,
  Search,
  Plus,
  Send,
  Download,
  Calendar,
  Building2,
  X,
  FileText,
  ShieldCheck,
  Clock,
  Eye,
} from 'lucide-react';

export const FraDelivery: React.FC = () => {
  const { allClients } = useAuth();
  const [fras, setFras] = useState<FireRiskAssessmentRecord[]>([]);
  const [premisesList, setPremisesList] = useState<Premises[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Upload Form
  const [formClientId, setFormClientId] = useState(allClients[0]?.id || '');
  const [formPremisesId, setFormPremisesId] = useState('');
  const [assessorName, setAssessorName] = useState('David Miller (MIFireE)');
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [reviewTrigger, setReviewTrigger] = useState(
    'Annual review (12 months) or following material alteration'
  );
  const [recommendedReviewDate, setRecommendedReviewDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [overallRiskRating, setOverallRiskRating] = useState<'Tolerable' | 'Moderate' | 'Substantial'>('Moderate');
  const [executiveSummary, setExecutiveSummary] = useState(
    'PAS 79-1:2020 Life Safety Fire Risk Assessment completed. Overall risk rating determined as Moderate. Remedial actions required for fire door self-closing devices and emergency lighting discharge testing records.'
  );

  useEffect(() => {
    loadFras();
    api.getPremises().then(setPremisesList);
  }, []);

  const loadFras = async () => {
    const list = await api.getFras();
    setFras(list);
  };

  const handleIssueFra = async (id: string) => {
    try {
      await api.issueFra(id);
      await loadFras();
    } catch (err) {
      console.error('Failed to issue FRA:', err);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClientId || !formPremisesId) {
      alert('Please select both a client and a premises.');
      return;
    }

    try {
      await api.uploadFra({
        clientId: formClientId,
        premisesId: formPremisesId,
        assessorName,
        assessmentDate,
        reviewTrigger,
        recommendedReviewDate,
        overallRiskRating,
        executiveSummary,
        fileName: `FRA_Report_${Date.now()}.pdf`,
        fileUrl: `/reports/fra_${Date.now()}.pdf`,
      });

      setIsUploadModalOpen(false);
      await loadFras();
    } catch (err) {
      console.error('Failed to upload FRA:', err);
    }
  };

  const filteredFras = fras.filter((f) => {
    const matchesSearch =
      f.reportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.premisesName?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Fire Risk Assessment Delivery Hub</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Deliver externally authored PAS 79 fire risk assessment reports, establish statutory review triggers, and issue to client portals
          </p>
        </div>
        <button
          onClick={() => {
            setFormClientId(allClients[0]?.id || '');
            setIsUploadModalOpen(true);
          }}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Upload & Deliver Assessment</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search report number, premises, client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-hidden"
          />
        </div>
      </div>

      {/* FRA Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredFras.length === 0 ? (
          <EmptyState
            title="No assessments delivered yet"
            description="Upload completed external FRA reports to issue them securely to clients."
            icon={ShieldCheck}
            actionLabel="Deliver First Report"
            onAction={() => setIsUploadModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Report Number</th>
                  <th className="py-3 px-4">Client Organisation</th>
                  <th className="py-3 px-4">Premises</th>
                  <th className="py-3 px-4">Assessor</th>
                  <th className="py-3 px-4">Assessment Date</th>
                  <th className="py-3 px-4">Risk Rating</th>
                  <th className="py-3 px-4">Next Review Due</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFras.map((fra) => (
                  <tr key={fra.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                      {fra.reportNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{fra.clientName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{fra.premisesName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{fra.assessorName}</td>
                    <td className="py-3.5 px-4 text-slate-500">{fra.assessmentDate}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          fra.overallRiskRating === 'Substantial'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : fra.overallRiskRating === 'Moderate'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {fra.overallRiskRating}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {fra.recommendedReviewDate}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={fra.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <a
                        href={fra.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 text-slate-700 hover:bg-slate-100 rounded text-xs font-medium border border-slate-200 transition inline-flex items-center space-x-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF</span>
                      </a>
                      {fra.status === 'Draft' && (
                        <button
                          onClick={() => handleIssueFra(fra.id)}
                          className="px-2.5 py-1 text-emerald-700 hover:bg-emerald-50 rounded text-xs font-medium border border-emerald-200 transition inline-flex items-center space-x-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Issue to Client</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Completed External FRA Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <form
            onSubmit={handleUploadSubmit}
            className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 border border-slate-200 space-y-4 my-8"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Upload & Deliver Completed Assessment</h3>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Client *</label>
                <select
                  required
                  value={formClientId}
                  onChange={(e) => {
                    setFormClientId(e.target.value);
                    setFormPremisesId('');
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                >
                  <option value="">Select client...</option>
                  {allClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Premises *</label>
                <select
                  required
                  value={formPremisesId}
                  onChange={(e) => setFormPremisesId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                >
                  <option value="">Select premises...</option>
                  {premisesList
                    .filter((p) => !formClientId || p.clientId === formClientId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.premisesName} ({p.postcode})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lead Assessor</label>
                  <input
                    type="text"
                    required
                    value={assessorName}
                    onChange={(e) => setAssessorName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assessment Date</label>
                  <input
                    type="date"
                    required
                    value={assessmentDate}
                    onChange={(e) => setAssessmentDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Overall Risk Level</label>
                  <select
                    value={overallRiskRating}
                    onChange={(e) => setOverallRiskRating(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  >
                    <option value="Tolerable">Tolerable</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Substantial">Substantial</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Recommended Next Review</label>
                  <input
                    type="date"
                    required
                    value={recommendedReviewDate}
                    onChange={(e) => setRecommendedReviewDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Review Triggers</label>
                <input
                  type="text"
                  value={reviewTrigger}
                  onChange={(e) => setReviewTrigger(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Executive Summary / Findings</label>
                <textarea
                  rows={3}
                  value={executiveSummary}
                  onChange={(e) => setExecutiveSummary(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
              >
                Deliver Report
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

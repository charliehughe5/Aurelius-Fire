import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { ActionRecord, RiskRating, ActionPriority, ActionCategory } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
import {
  AlertTriangle,
  Search,
  Plus,
  CheckCircle2,
  X,
  FileCheck,
  Building2,
  Clock,
  ShieldAlert,
  Download,
} from 'lucide-react';

const CATEGORIES: ActionCategory[] = [
  'Means of Escape',
  'Fire Detection & Warning',
  'Fire Doors & Compartmentation',
  'Emergency Lighting',
  'Fire Fighting Equipment',
  'Management, Training & Drills',
  'Ignition Sources & Electrical',
  'Dangerous Substances & Storage',
  'Testing & Maintenance Records',
  'Other Fire Safety Measure',
];

export const ActionManagement: React.FC = () => {
  const { allClients } = useAuth();
  const [actions, setActions] = useState<ActionRecord[]>([]);
  const [premisesList, setPremisesList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');

  // Review / Detail Modal
  const [selectedAction, setSelectedAction] = useState<ActionRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Action Form
  const [formClientId, setFormClientId] = useState(allClients[0]?.id || '');
  const [formPremisesId, setFormPremisesId] = useState('');
  const [deficiencyFound, setDeficiencyFound] = useState('');
  const [recommendedAction, setRecommendedAction] = useState('');
  const [legalRequirement, setLegalRequirement] = useState(
    'Article 14(2)(b) & Article 17 of the Regulatory Reform (Fire Safety) Order 2005'
  );
  const [riskRating, setRiskRating] = useState<RiskRating>('MEDIUM');
  const [priority, setPriority] = useState<ActionPriority>('1 Month');
  const [category, setCategory] = useState<ActionCategory>('Fire Doors & Compartmentation');
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });

  useEffect(() => {
    loadActions();
    api.getPremises().then(setPremisesList);
  }, []);

  useEffect(() => {
    if (!formClientId && allClients.length > 0) {
      setFormClientId(allClients[0].id);
    }
  }, [allClients, formClientId]);

  const loadActions = async () => {
    const list = await api.getActions();
    setActions(list);
  };

  const handleVerifyAndClose = async (id: string) => {
    try {
      await api.verifyAndCloseAction(id);
      await loadActions();
      if (selectedAction?.id === id) {
        setSelectedAction((prev) => (prev ? { ...prev, status: 'Closed' } : null));
      }
    } catch (err) {
      console.error('Failed to verify and close action:', err);
    }
  };

  const handleCreateActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClientId || !formPremisesId || !deficiencyFound || !recommendedAction) {
      alert('Please fill out all mandatory action fields.');
      return;
    }

    try {
      await api.createAction({
        clientId: formClientId,
        premisesId: formPremisesId,
        deficiencyFound,
        recommendedAction,
        legalRequirement,
        riskRating,
        priority,
        category,
        targetCompletionDate: targetDate,
      });

      setIsAddModalOpen(false);
      setDeficiencyFound('');
      setRecommendedAction('');
      await loadActions();
    } catch (err) {
      console.error('Failed to create action:', err);
    }
  };

  const filteredActions = actions.filter((act) => {
    const matchesSearch =
      act.actionReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.deficiencyFound.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.premisesName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.clientName?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterRisk !== 'ALL' && act.riskRating !== filterRisk) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Fire Safety Action & Rectification Hub</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Deficiency management, risk-ranked remedial directives, client evidence verification and assessor closure sign-off
          </p>
        </div>
        <button
          onClick={() => {
            setFormClientId(allClients[0]?.id || '');
            setIsAddModalOpen(true);
          }}
          className="px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add Deficiency Action</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search action ref, deficiency, premises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto">
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterRisk(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                filterRisk === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Risks' : `${st} Risk`}
            </button>
          ))}
        </div>
      </div>

      {/* Actions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredActions.length === 0 ? (
          <EmptyState
            title="No actions found"
            description="All fire safety actions have been closed or none match the filter."
            icon={CheckCircle2}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Ref</th>
                  <th className="py-3 px-4">Risk Rating</th>
                  <th className="py-3 px-4">Premises & Client</th>
                  <th className="py-3 px-4">Deficiency / Recommended Action</th>
                  <th className="py-3 px-4">Target Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredActions.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                      {act.actionReference}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={act.riskRating} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-semibold text-slate-900">{act.premisesName}</div>
                      <div className="text-[10px] text-slate-400">{act.clientName}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-medium text-slate-900">{act.deficiencyFound}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{act.recommendedAction}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{act.category}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {act.targetCompletionDate || 'ASAP'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={act.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedAction(act)}
                        className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded text-xs font-medium border border-slate-200 transition"
                      >
                        Review Evidence
                      </button>
                      {act.status !== 'Closed' && (
                        <button
                          onClick={() => handleVerifyAndClose(act.id)}
                          className="px-2.5 py-1 text-emerald-700 hover:bg-emerald-50 rounded text-xs font-medium border border-emerald-200 transition inline-flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Close</span>
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

      {/* Action Review & Assessor Sign-Off Modal */}
      {selectedAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 space-y-5 my-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Remedial Action {selectedAction.actionReference}
                  </h3>
                  <StatusBadge status={selectedAction.riskRating} size="sm" />
                  <StatusBadge status={selectedAction.status} size="sm" />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Site: {selectedAction.premisesName} ({selectedAction.clientName})
                </p>
              </div>
              <button
                onClick={() => setSelectedAction(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                  Deficiency Identified:
                </div>
                <p className="text-slate-700 font-medium">{selectedAction.deficiencyFound}</p>
                <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px] pt-1">
                  Required Remedial Directive:
                </div>
                <p className="text-slate-700">{selectedAction.recommendedAction}</p>
                {selectedAction.legalRequirement && (
                  <div className="text-[10px] text-slate-500 italic pt-1">
                    Statutory reference: {selectedAction.legalRequirement}
                  </div>
                )}
              </div>

              {/* Client Submitted Evidence */}
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                <div className="font-bold text-emerald-900 uppercase tracking-wider text-[10px] flex items-center space-x-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>Client Remediation Evidence:</span>
                </div>
                {selectedAction.completionEvidenceNotes ? (
                  <p className="text-slate-700 leading-relaxed">
                    "{selectedAction.completionEvidenceNotes}"
                  </p>
                ) : (
                  <p className="text-slate-400 italic text-[11px]">
                    No client completion notes submitted yet.
                  </p>
                )}

                {selectedAction.evidenceFileUrl && (
                  <div className="pt-2">
                    <a
                      href={selectedAction.evidenceFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-800 shadow-2xs hover:bg-emerald-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{selectedAction.evidenceFileName || 'View Evidence Attachment'}</span>
                    </a>
                  </div>
                )}
              </div>

              {selectedAction.status === 'Closed' && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 text-xs">
                  <div className="font-bold">Verified & Closed by Assessor</div>
                  <div className="text-[11px] text-blue-700 mt-0.5">
                    Signed off by {selectedAction.verifiedBy || 'Lead Assessor'} on{' '}
                    {selectedAction.verifiedAt ? new Date(selectedAction.verifiedAt).toLocaleDateString('en-GB') : 'recently'}.
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedAction(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Back
              </button>
              {selectedAction.status !== 'Closed' && (
                <button
                  onClick={() => handleVerifyAndClose(selectedAction.id)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Evidence & Sign Off (Close)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Action Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateActionSubmit}
            className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 border border-slate-200 space-y-4 my-8"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Fire Safety Deficiency</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
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
                  <label className="block font-semibold text-slate-700 mb-1">Risk Severity</label>
                  <select
                    value={riskRating}
                    onChange={(e) => setRiskRating(e.target.value as RiskRating)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="IMMEDIATE">IMMEDIATE</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority Period</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ActionPriority)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="1 Month">1 Month</option>
                    <option value="3 Months">3 Months</option>
                    <option value="6 Months">6 Months</option>
                    <option value="Ongoing">Ongoing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Safety Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ActionCategory)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deficiency / Non-Compliance Observed *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Ground floor final exit door wedged open with fire door closer disconnected"
                  value={deficiencyFound}
                  onChange={(e) => setDeficiencyFound(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Recommended Remedial Directive *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Remove wedge immediately; reconnect and calibrate overhead hydraulic self-closer to latch flush"
                  value={recommendedAction}
                  onChange={(e) => setRecommendedAction(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Statutory Reference</label>
                  <input
                    type="text"
                    value={legalRequirement}
                    onChange={(e) => setLegalRequirement(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-xs"
              >
                Record Action
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

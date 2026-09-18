import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Premises, Client, PremisesType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { DirectEmailModal } from '../common/DirectEmailModal';
import {
  Building2,
  Search,
  Plus,
  Copy,
  Archive,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  MapPin,
  X,
  FileCheck,
  CheckSquare,
  Mail,
} from 'lucide-react';

const PREMISES_TYPES: PremisesType[] = [
  'Offices & Commercial',
  'Shops & Retail',
  'Warehouses & Industrial',
  'Residential Flats / HMO Common Parts',
  'Care Homes & Healthcare',
  'Hotels & Sleeping Accommodation',
  'Educational Premises & Nurseries',
  'Places of Assembly & Leisure',
  'Restaurants, Pubs & Hospitality',
  'Mixed-Use Building',
  'Other',
];

export const PremisesManagement: React.FC = () => {
  const { allClients } = useAuth();
  const [premisesList, setPremisesList] = useState<Premises[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>('ALL');
  const [selectedPremises, setSelectedPremises] = useState<Premises | null>(null);
  const [emailModalPremises, setEmailModalPremises] = useState<Premises | null>(null);

  // Readiness modal
  const [readinessData, setReadinessData] = useState<{
    status: 'READY' | 'INFORMATION REQUIRED';
    items: { label: string; satisfied: boolean; mandatory: boolean }[];
  } | null>(null);
  const [isReadinessModalOpen, setIsReadinessModalOpen] = useState(false);

  // Add / Duplicate modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [premisesToArchive, setPremisesToArchive] = useState<Premises | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [formData, setFormData] = useState({
    clientId: allClients[0]?.id || '',
    premisesName: '',
    addressLine1: '',
    city: 'London',
    postcode: '',
    jurisdiction: 'England & Wales (RRFSO 2005)' as any,
    premisesType: 'Offices & Commercial' as PremisesType,
    numberOfFloors: 2,
    approxFloorAreaSqM: 250,
    maxOccupancy: 25,
    sleepingAccommodation: false,
    publicAccess: false,
    contactOnSite: '',
    contactOnSitePhone: '',
    accessInstructions: '',
  });

  useEffect(() => {
    if (!formData.clientId && allClients.length > 0) {
      setFormData((prev) => ({ ...prev, clientId: allClients[0].id }));
    }
  }, [allClients, formData.clientId]);

  useEffect(() => {
    loadPremises();
  }, []);

  const loadPremises = async () => {
    const data = await api.getPremises(undefined, true);
    setPremisesList(data);
  };

  const handleOpenReadiness = async (premises: Premises) => {
    setSelectedPremises(premises);
    try {
      const res = await api.getPremisesReadiness(premises.id);
      setReadinessData(res);
      setIsReadinessModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePremises = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      const activeClientId = formData.clientId || allClients[0]?.id;
      if (!activeClientId) {
        setFormError('A client organisation must be selected or created first.');
        setIsSubmitting(false);
        return;
      }
      const created = await api.createPremises({
        ...formData,
        clientId: activeClientId,
      });
      setIsAddModalOpen(false);
      setFormData({
        clientId: allClients[0]?.id || '',
        premisesName: '',
        addressLine1: '',
        city: 'London',
        postcode: '',
        jurisdiction: 'England & Wales (RRFSO 2005)' as any,
        premisesType: 'Offices & Commercial' as PremisesType,
        numberOfFloors: 2,
        approxFloorAreaSqM: 250,
        maxOccupancy: 25,
        sleepingAccommodation: false,
        publicAccess: false,
        contactOnSite: '',
        contactOnSitePhone: '',
        accessInstructions: '',
      });
      await loadPremises();
      showToast(`Premises "${created.premisesName}" created successfully!`);
    } catch (err: any) {
      console.error('Failed to create premises:', err);
      setFormError(err.message || 'Failed to create premises. Please verify the fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await api.duplicatePremises(id);
      await loadPremises();
    } catch (err) {
      console.error('Failed to duplicate premises:', err);
    }
  };

  const handleArchiveConfirm = async () => {
    if (!premisesToArchive) return;
    try {
      await api.archivePremises(premisesToArchive.id);
      setPremisesToArchive(null);
      await loadPremises();
    } catch (err) {
      console.error('Failed to archive premises:', err);
    }
  };

  const filteredPremises = premisesList.filter((p) => {
    const matchesSearch =
      p.premisesName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.addressLine1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.postcode.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedClientId !== 'ALL' && p.clientId !== selectedClientId) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Premises & Property Portfolio Hub</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-premises management, building specifications, UK statutory jurisdiction, and pre-assessment readiness
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({
              clientId: allClients[0]?.id || '',
              premisesName: '',
              addressLine1: '',
              city: 'London',
              postcode: '',
              jurisdiction: 'England & Wales (RRFSO 2005)',
              premisesType: 'Offices & Commercial',
              numberOfFloors: 2,
              approxFloorAreaSqM: 250,
              maxOccupancy: 25,
              sleepingAccommodation: false,
              publicAccess: false,
              contactOnSite: '',
              contactOnSitePhone: '',
              accessInstructions: '',
            });
            setIsAddModalOpen(true);
          }}
          className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Premises</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search premises name, address, postcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-hidden"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium shrink-0">Client:</span>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-slate-800 w-full sm:w-64"
          >
            <option value="ALL">All Clients ({allClients.length})</option>
            {allClients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Premises List Grid / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredPremises.length === 0 ? (
          <EmptyState
            title="No premises found"
            description="No premises match the current search or client filter."
            icon={Building2}
            actionLabel="Add Premises"
            onAction={() => setIsAddModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Premises Name & Address</th>
                  <th className="py-3 px-4">Client Organisation</th>
                  <th className="py-3 px-4">Building Specs</th>
                  <th className="py-3 px-4">Jurisdiction</th>
                  <th className="py-3 px-4">Pre-Assessment Readiness</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPremises.map((p) => {
                  const client = allClients.find((c) => c.id === p.clientId);
                  const isReady = p.preAssessmentReadinessStatus === 'READY';

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 transition ${
                        p.isArchived ? 'opacity-60 bg-slate-50/50' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                          <Building2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                          <span>{p.premisesName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{p.addressLine1}, {p.city} {p.postcode}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800">{client?.companyName || 'Unknown'}</span>
                        <div className="text-[10px] text-slate-400">{client?.contactName}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{p.premisesType}</div>
                        <div className="text-[10px] text-slate-400">
                          {p.numberOfFloors} storeys • {p.approxFloorAreaSqM} m² • Max {p.maxOccupancy} occ.
                          {p.sleepingAccommodation && (
                            <span className="ml-1 text-rose-600 font-semibold">(Sleeping)</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {p.jurisdiction}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleOpenReadiness(p)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium border transition ${
                            isReady
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {isReady ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-600" />
                          )}
                          <span>{p.preAssessmentReadinessStatus || 'INFO REQUIRED'}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={p.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => setEmailModalPremises(p)}
                          className="px-2 py-1 text-blue-700 hover:bg-blue-50 rounded text-xs font-medium border border-blue-200 transition inline-flex items-center space-x-1"
                          title="Direct Email about this premises"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Email</span>
                        </button>
                        <button
                          onClick={() => handleOpenReadiness(p)}
                          className="px-2 py-1 text-slate-700 hover:bg-slate-100 rounded text-xs font-medium border border-slate-200 transition"
                        >
                          Checklist
                        </button>
                        <button
                          onClick={() => handleDuplicate(p.id)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition rounded"
                          title="Duplicate Premises"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setPremisesToArchive(p)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition rounded"
                          title="Archive Premises"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pre-Assessment Readiness Checklist Modal */}
      {isReadinessModalOpen && selectedPremises && readinessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-900">Pre-Assessment Readiness Checklist</h3>
                  <StatusBadge status={readinessData.status} size="sm" />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Site: {selectedPremises.premisesName} ({selectedPremises.postcode})
                </p>
              </div>
              <button
                onClick={() => setIsReadinessModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Under our operating procedure, all mandatory pre-inspection criteria must be satisfied prior to the assessor arriving on site to prevent aborted visits or incomplete assessments.
            </p>

            <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200 max-h-72 overflow-y-auto">
              {readinessData.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs p-2 rounded bg-white border border-slate-200/80"
                >
                  <div className="flex items-center space-x-2">
                    {item.satisfied ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <span className={item.satisfied ? 'text-slate-800' : 'text-slate-600 font-medium'}>
                      {item.label}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      item.mandatory
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.mandatory ? 'Mandatory' : 'Optional'}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-900 flex items-start space-x-2">
              <FileCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Site Contact: {selectedPremises.contactOnSite || 'Responsible Person'} (
                {selectedPremises.contactOnSitePhone || 'Call main desk'})
                <br />
                Access note: {selectedPremises.accessInstructions || 'Report to main reception.'}
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsReadinessModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Close Checklist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Premises Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <form
            onSubmit={handleCreatePremises}
            className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 border border-slate-200 space-y-4 my-8"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Register New Premises</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            {allClients.length === 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg">
                <strong>Notice:</strong> No client organisations found. Please create a client organisation first before adding premises.
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign to Client Organisation *</label>
                <select
                  required
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                >
                  {allClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Premises / Building Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alexandra House - Block B"
                  value={formData.premisesName}
                  onChange={(e) => setFormData({ ...formData, premisesName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Address Line 1 *</label>
                  <input
                    type="text"
                    required
                    placeholder="124 Queen Street"
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Postcode *</label>
                  <input
                    type="text"
                    required
                    placeholder="EC1A 1BB"
                    value={formData.postcode}
                    onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jurisdiction</label>
                  <select
                    value={formData.jurisdiction}
                    onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  >
                    <option value="England & Wales (RRFSO 2005)">England & Wales (RRFSO 2005)</option>
                    <option value="Scotland (Fire Scotland Act 2005)">Scotland (Fire Scotland Act 2005)</option>
                    <option value="Northern Ireland (Fire Services Order 2006)">Northern Ireland</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Premises Type</label>
                  <select
                    value={formData.premisesType}
                    onChange={(e) => setFormData({ ...formData, premisesType: e.target.value as PremisesType })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  >
                    {PREMISES_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Storeys</label>
                  <input
                    type="number"
                    value={formData.numberOfFloors}
                    onChange={(e) => setFormData({ ...formData, numberOfFloors: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Floor Area (m²)</label>
                  <input
                    type="number"
                    value={formData.approxFloorAreaSqM}
                    onChange={(e) => setFormData({ ...formData, approxFloorAreaSqM: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Occupants</label>
                  <input
                    type="number"
                    value={formData.maxOccupancy}
                    onChange={(e) => setFormData({ ...formData, maxOccupancy: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center space-x-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.sleepingAccommodation}
                    onChange={(e) => setFormData({ ...formData, sleepingAccommodation: e.target.checked })}
                    className="rounded text-blue-700"
                  />
                  <span>Sleeping accommodation</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.publicAccess}
                    onChange={(e) => setFormData({ ...formData, publicAccess: e.target.checked })}
                    className="rounded text-blue-700"
                  />
                  <span>Public access</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Site Escort / Contact</label>
                  <input
                    type="text"
                    placeholder="e.g. Caretaker / Facilities Mgr"
                    value={formData.contactOnSite}
                    onChange={(e) => setFormData({ ...formData, contactOnSite: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Escort Phone</label>
                  <input
                    type="text"
                    placeholder="07700 900789"
                    value={formData.contactOnSitePhone}
                    onChange={(e) => setFormData({ ...formData, contactOnSitePhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Access Notes & Restrictions</label>
                <input
                  type="text"
                  placeholder="e.g. Keycard needed for roof, parking at rear bay 3"
                  value={formData.accessInstructions}
                  onChange={(e) => setFormData({ ...formData, accessInstructions: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
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
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 rounded-lg shadow-xs flex items-center space-x-1"
              >
                <span>{isSubmitting ? 'Saving Premises...' : 'Save Premises'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-xs border border-slate-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Archive Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!premisesToArchive}
        title="Archive Premises"
        message={`Are you sure you want to archive "${premisesToArchive?.premisesName}"? It will be marked as archived and hidden from active assessment schedules.`}
        confirmLabel="Archive Premises"
        isDestructive={true}
        onConfirm={handleArchiveConfirm}
        onCancel={() => setPremisesToArchive(null)}
      />

      {emailModalPremises && (
        <DirectEmailModal
          isOpen={!!emailModalPremises}
          onClose={() => setEmailModalPremises(null)}
          defaultRecipientEmail={
            allClients.find((c) => c.id === emailModalPremises.clientId)?.contactEmail || ''
          }
          defaultRecipientName={
            allClients.find((c) => c.id === emailModalPremises.clientId)?.contactName ||
            emailModalPremises.premisesName
          }
          clientId={emailModalPremises.clientId}
          premisesId={emailModalPremises.id}
          defaultSubject={`Premises Information & Access • ${emailModalPremises.premisesName}`}
          defaultMessage={`Dear Dutyholder,\n\nI am contacting you regarding your site "${emailModalPremises.premisesName}" (${emailModalPremises.addressLine1}, ${emailModalPremises.postcode}).\n\nPlease ensure full access is available to all plant rooms, boiler areas, and electrical cupboards for the assessment.\n\nKind regards,\nCharlie Hughes\nAurelius Commercial Fire Safety`}
          onSuccess={() => setEmailModalPremises(null)}
        />
      )}
    </div>
  );
};

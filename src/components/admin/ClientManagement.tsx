import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Client, Premises, Quote, Invoice } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Users,
  Search,
  Plus,
  Building2,
  Phone,
  Mail,
  MoreVertical,
  Archive,
  RotateCcw,
  ExternalLink,
  X,
  FileText,
  CreditCard,
  Edit,
} from 'lucide-react';

export const ClientManagement: React.FC = () => {
  const { allClients, refreshClients, selectClient, setPortalMode } = useAuth();
  const [clients, setClients] = useState<Client[]>(allClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientDetailData, setClientDetailData] = useState<any>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clientToArchive, setClientToArchive] = useState<Client | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    billingAddress: '',
    notes: '',
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const list = await api.getClients(true);
    setClients(list);
  };

  const handleOpenDetail = async (client: Client) => {
    setSelectedClient(client);
    try {
      const full = await api.getClient(client.id);
      setClientDetailData(full);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createClient(formData);
      setIsAddModalOpen(false);
      setFormData({
        companyName: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        billingAddress: '',
        notes: '',
      });
      await refreshClients();
      await loadClients();
    } catch (err) {
      console.error('Failed to create client:', err);
    }
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    try {
      await api.updateClient(selectedClient.id, formData);
      setIsEditModalOpen(false);
      await refreshClients();
      await loadClients();
      if (selectedClient) {
        handleOpenDetail({ ...selectedClient, ...formData });
      }
    } catch (err) {
      console.error('Failed to update client:', err);
    }
  };

  const handleArchiveConfirm = async () => {
    if (!clientToArchive) return;
    setIsArchiving(true);
    try {
      if (clientToArchive.isArchived) {
        await api.restoreClient(clientToArchive.id);
      } else {
        await api.archiveClient(clientToArchive.id);
      }
      setClientToArchive(null);
      await refreshClients();
      await loadClients();
    } catch (err) {
      console.error('Failed to toggle archive on client:', err);
    } finally {
      setIsArchiving(false);
    }
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'ARCHIVED') return c.isArchived;
    if (filterStatus === 'ACTIVE') return !c.isArchived;
    return c.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Client CRM & Organisation Accounts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage Responsible Persons, dutyholders, multi-site property accounts and billing profiles
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({
              companyName: '',
              contactName: '',
              contactEmail: '',
              contactPhone: '',
              billingAddress: '',
              notes: '',
            });
            setIsAddModalOpen(true);
          }}
          className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search company, contact, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'ACTIVE', 'ARCHIVED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                filterStatus === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredClients.length === 0 ? (
          <EmptyState
            title="No clients yet"
            description="No clients match your filter criteria or none have been added yet."
            icon={Users}
            actionLabel="Add First Client"
            onAction={() => setIsAddModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Organisation / Company</th>
                  <th className="py-3 px-4">Responsible Person / Contact</th>
                  <th className="py-3 px-4">Premises</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment Terms</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className={`hover:bg-slate-50/80 transition ${
                      client.isArchived ? 'opacity-60 bg-slate-50/50' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{client.companyName}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">
                        {client.billingAddress}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium">{client.contactName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-2 mt-0.5">
                        <span className="flex items-center space-x-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{client.contactEmail}</span>
                        </span>
                        {client.contactPhone && (
                          <span className="flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{client.contactPhone}</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleOpenDetail(client)}
                        className="inline-flex items-center space-x-1 text-blue-700 font-medium hover:underline"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{client.premisesIds?.length || 0} sites</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={client.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {client.paymentTerms || 'Payment prior to delivery'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenDetail(client)}
                        className="px-2 py-1 text-slate-700 hover:bg-slate-100 rounded text-xs font-medium border border-slate-200 transition"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => {
                          selectClient(client);
                          setPortalMode('CLIENT');
                        }}
                        className="px-2 py-1 text-emerald-700 hover:bg-emerald-50 rounded text-xs font-medium border border-emerald-200 transition inline-flex items-center space-x-1"
                        title="Impersonate & Open Client Portal"
                      >
                        <span>Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setClientToArchive(client)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition rounded"
                        title={client.isArchived ? 'Restore' : 'Archive'}
                      >
                        {client.isArchived ? (
                          <RotateCcw className="w-3.5 h-3.5" />
                        ) : (
                          <Archive className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Client Detail Drawer */}
      {selectedClient && clientDetailData && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-slate-900">{selectedClient.companyName}</h2>
                  <StatusBadge status={selectedClient.status} size="sm" />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Responsible Person: {selectedClient.contactName} • {selectedClient.contactEmail}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setFormData({
                      companyName: selectedClient.companyName,
                      contactName: selectedClient.contactName,
                      contactEmail: selectedClient.contactEmail,
                      contactPhone: selectedClient.contactPhone || '',
                      billingAddress: selectedClient.billingAddress || '',
                      notes: selectedClient.notes || '',
                    });
                    setIsEditModalOpen(true);
                  }}
                  className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg transition"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Premises List for Client */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                    <Building2 className="w-4 h-4 text-blue-700" />
                    <span>Premises Portfolio ({clientDetailData.premises?.length || 0})</span>
                  </h3>
                </div>
                <div className="space-y-2">
                  {clientDetailData.premises?.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                      No premises registered for this client.
                    </div>
                  ) : (
                    clientDetailData.premises?.map((prem: Premises) => (
                      <div
                        key={prem.id}
                        className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">{prem.premisesName}</div>
                          <div className="text-slate-500 text-[11px]">{prem.addressLine1}, {prem.postcode}</div>
                          <div className="mt-1 flex items-center space-x-2 text-[10px] text-slate-400">
                            <span>{prem.premisesType}</span>
                            <span>•</span>
                            <span>{prem.numberOfFloors} floors</span>
                            <span>•</span>
                            <span>{prem.approxFloorAreaSqM} m²</span>
                          </div>
                        </div>
                        <StatusBadge status={prem.status} size="sm" />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quotes & Invoices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Quotes ({clientDetailData.quotes?.length || 0})</span>
                  </h4>
                  {clientDetailData.quotes?.map((q: Quote) => (
                    <div key={q.id} className="text-xs flex justify-between items-center py-1 border-b border-slate-200/60">
                      <div>
                        <span className="font-semibold text-slate-800">{q.quoteNumber}</span>
                        <div className="text-[10px] text-slate-400">{q.validUntil}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">£{q.totalAmount.toFixed(2)}</span>
                        <div className="text-[10px]"><StatusBadge status={q.status} size="sm" /></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Invoices ({clientDetailData.invoices?.length || 0})</span>
                  </h4>
                  {clientDetailData.invoices?.map((inv: Invoice) => (
                    <div key={inv.id} className="text-xs flex justify-between items-center py-1 border-b border-slate-200/60">
                      <div>
                        <span className="font-semibold text-slate-800">{inv.invoiceNumber}</span>
                        <div className="text-[10px] text-slate-400">Due: {inv.dueDate}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">£{inv.totalAmount.toFixed(2)}</span>
                        <div className="text-[10px]"><StatusBadge status={inv.status} size="sm" /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Client Portal Quick Action */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-900">Switch to Client Perspective</div>
                  <div className="text-[11px] text-emerald-700">
                    Test what this client sees in their portal
                  </div>
                </div>
                <button
                  onClick={() => {
                    selectClient(selectedClient);
                    setPortalMode('CLIENT');
                  }}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition"
                >
                  Open Client Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateClient}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New Organisation / Client</h3>
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
                <label className="block font-semibold text-slate-700 mb-1">Company / Organisation Name *</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. Apex Property Management Ltd"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="e.g. Rachel Adams"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="rachel@company.co.uk"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telephone</label>
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="07700 900456"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Billing Address</label>
                  <input
                    type="text"
                    value={formData.billingAddress}
                    onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                    placeholder="100 Commercial Way, London"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Special billing instructions, multi-premises portfolio..."
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
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
              >
                Create Client Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Client Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleUpdateClient}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Client Organisation</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Organisation Name *</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telephone</label>
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Billing Address</label>
                  <input
                    type="text"
                    value={formData.billingAddress}
                    onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Archive Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!clientToArchive}
        title={clientToArchive?.isArchived ? 'Restore Client' : 'Archive Client'}
        message={`Are you sure you want to ${
          clientToArchive?.isArchived ? 'restore' : 'archive'
        } "${clientToArchive?.companyName}"? Archived clients remain in history and can be restored at any time.`}
        confirmLabel={clientToArchive?.isArchived ? 'Restore Client' : 'Archive Client'}
        isDestructive={!clientToArchive?.isArchived}
        onConfirm={handleArchiveConfirm}
        onCancel={() => setClientToArchive(null)}
      />
    </div>
  );
};

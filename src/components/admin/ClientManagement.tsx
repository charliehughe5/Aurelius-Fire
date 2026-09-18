import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Client, Premises, Quote, Invoice, Contact, Invitation, Job } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { DirectEmailModal } from '../common/DirectEmailModal';
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
  UserPlus,
  Send,
  Key,
  Copy,
  Trash2,
  Briefcase,
  Check,
  ShieldAlert,
  ChevronLeft,
} from 'lucide-react';

export const ClientManagement: React.FC = () => {
  const { allClients, refreshClients, selectClient, setPortalMode } = useAuth();
  const [clients, setClients] = useState<Client[]>(allClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientDetailData, setClientDetailData] = useState<any>(null);

  // Drawer tabs
  const [drawerTab, setDrawerTab] = useState<'overview' | 'contacts' | 'invitations' | 'jobs'>('overview');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clientToArchive, setClientToArchive] = useState<Client | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [emailModalClient, setEmailModalClient] = useState<Client | null>(null);

  // Contacts Modal
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    jobTitle: '',
    contactType: 'Site Keyholder',
    isPrimary: false,
  });

  // Invitations Modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    recipientName: '',
    role: 'CLIENT' as 'CLIENT' | 'ASSESSOR' | 'COLLABORATOR',
  });

  // Form fields
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    billingAddress: '',
    notes: '',
  });
  const [isSubmittingClient, setIsSubmittingClient] = useState(false);
  const [clientFormError, setClientFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Premises from Client Drawer
  const [isAddPremisesOpen, setIsAddPremisesOpen] = useState(false);
  const [isSubmittingPremises, setIsSubmittingPremises] = useState(false);
  const [premisesFormError, setPremisesFormError] = useState<string | null>(null);
  const [premisesFormData, setPremisesFormData] = useState({
    premisesName: '',
    addressLine1: '',
    city: 'London',
    postcode: '',
    premisesType: 'Offices & Commercial' as any,
    approxFloorAreaSqM: 150,
    numberOfFloors: 2,
    sleepingAccommodation: false,
    publicAccess: false,
    contactOnSite: '',
    contactOnSitePhone: '',
    accessInstructions: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

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

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    try {
      await api.createContact({
        organisationId: selectedClient.id,
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone,
        jobTitle: contactForm.jobTitle,
        contactType: contactForm.contactType,
        isPrimary: contactForm.isPrimary,
      });
      setIsAddContactOpen(false);
      setContactForm({
        name: '',
        email: '',
        phone: '',
        jobTitle: '',
        contactType: 'Site Keyholder',
        isPrimary: false,
      });
      const updated = await api.getClient(selectedClient.id);
      setClientDetailData(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to add contact');
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!selectedClient || !window.confirm('Delete this contact person?')) return;
    try {
      await api.deleteContact(contactId);
      const updated = await api.getClient(selectedClient.id);
      setClientDetailData(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to delete contact');
    }
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    try {
      await api.createInvitation({
        organisationId: selectedClient.id,
        email: inviteForm.email,
        name: inviteForm.recipientName,
        recipientName: inviteForm.recipientName,
        role: inviteForm.role,
      });
      setIsInviteModalOpen(false);
      setInviteForm({
        email: '',
        recipientName: '',
        role: 'CLIENT',
      });
      const updated = await api.getClient(selectedClient.id);
      setClientDetailData(updated);
      showToast(`Onboarding invitation sent successfully to ${inviteForm.email}`);
    } catch (err: any) {
      alert(err.message || 'Failed to generate invitation');
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!selectedClient || !window.confirm('Revoke this invitation?')) return;
    try {
      await api.cancelInvitation(invitationId);
      const updated = await api.getClient(selectedClient.id);
      setClientDetailData(updated);
      showToast('Invitation successfully revoked.');
    } catch (err: any) {
      alert(err.message || 'Failed to revoke invitation');
    }
  };

  const handleCopyInviteLink = (token: string) => {
    const url = `${window.location.origin}/invite?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    showToast('Invitation activation link copied to clipboard!');
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingClient(true);
    setClientFormError(null);
    try {
      const created = await api.createClient({
        companyName: formData.companyName,
        contactName: formData.contactName,
        email: formData.contactEmail,
        telephone: formData.contactPhone,
        billingAddress: formData.billingAddress,
        notes: formData.notes,
      });
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
      showToast(`Client organisation "${created.companyName}" successfully created!`);
      // Open detail drawer for newly created client
      handleOpenDetail(created);
    } catch (err: any) {
      console.error('Failed to create client:', err);
      setClientFormError(err.message || 'Failed to create client organisation. Please check the fields.');
    } finally {
      setIsSubmittingClient(false);
    }
  };

  const handleCreatePremisesForClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    setIsSubmittingPremises(true);
    setPremisesFormError(null);
    try {
      await api.createPremises({
        ...premisesFormData,
        clientId: selectedClient.id,
      });
      setIsAddPremisesOpen(false);
      setPremisesFormData({
        premisesName: '',
        addressLine1: '',
        city: 'London',
        postcode: '',
        premisesType: 'Offices & Commercial' as any,
        approxFloorAreaSqM: 150,
        numberOfFloors: 2,
        sleepingAccommodation: false,
        publicAccess: false,
        contactOnSite: '',
        contactOnSitePhone: '',
        accessInstructions: '',
      });
      const updated = await api.getClient(selectedClient.id);
      setClientDetailData(updated);
      showToast(`Premises successfully added to ${selectedClient.companyName}!`);
    } catch (err: any) {
      console.error('Failed to create premises for client:', err);
      setPremisesFormError(err.message || 'Failed to add premises.');
    } finally {
      setIsSubmittingPremises(false);
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

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
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
                        onClick={() => setEmailModalClient(client)}
                        className="px-2 py-1 text-blue-700 hover:bg-blue-50 rounded text-xs font-medium border border-blue-200 transition inline-flex items-center space-x-1"
                        title="Send Direct Email to Client"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email</span>
                      </button>
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
                <button
                  onClick={() => setSelectedClient(null)}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back to Clients</span>
                </button>
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

            {/* Drawer Subtab Navigation */}
            <div className="flex items-center space-x-1 px-6 pt-3 pb-2 border-b border-slate-200 bg-white overflow-x-auto text-xs font-semibold">
              {[
                { id: 'overview', label: 'Overview & Sites', count: clientDetailData.premises?.length },
                { id: 'contacts', label: 'Multi-Contacts (Part 11)', count: clientDetailData.contacts?.length },
                { id: 'invitations', label: 'Invitations (Part 12)', count: clientDetailData.invitations?.length },
                { id: 'jobs', label: 'Jobs (Part 17)', count: clientDetailData.jobs?.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDrawerTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition flex items-center space-x-1.5 ${
                    drawerTab === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        drawerTab === tab.id ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {drawerTab === 'overview' && (
                <>
                  {/* Premises List for Client */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                        <Building2 className="w-4 h-4 text-blue-700" />
                        <span>Premises Portfolio ({clientDetailData.premises?.length || 0})</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setPremisesFormData({
                            premisesName: '',
                            addressLine1: '',
                            city: 'London',
                            postcode: '',
                            premisesType: 'Offices & Commercial',
                            approxFloorAreaSqM: 150,
                            numberOfFloors: 2,
                            sleepingAccommodation: false,
                            publicAccess: false,
                            contactOnSite: selectedClient.contactName || '',
                            contactOnSitePhone: selectedClient.telephone || '',
                            accessInstructions: '',
                          });
                          setPremisesFormError(null);
                          setIsAddPremisesOpen(true);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg flex items-center space-x-1 shadow-2xs transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add Premises</span>
                      </button>
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
                </>
              )}

              {/* Contacts Tab (Part 11) */}
              {drawerTab === 'contacts' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Authorised Contacts & Keyholders
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Manage primary responsible person, site access keyholders, and billing contacts.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddContactOpen(true)}
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition flex items-center space-x-1 shadow-2xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add Contact</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(!clientDetailData.contacts || clientDetailData.contacts.length === 0) ? (
                      <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                        <Users className="w-8 h-8 text-slate-300 mx-auto" />
                        <div className="text-xs font-medium text-slate-600">No additional contacts registered</div>
                        <p className="text-[11px] text-slate-400">Click &quot;Add Contact&quot; to assign site keyholders or billing representatives.</p>
                      </div>
                    ) : (
                      clientDetailData.contacts.map((ct: Contact) => (
                        <div
                          key={ct.id}
                          className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-900">{ct.name}</span>
                              {ct.isPrimary && (
                                <span className="px-2 py-0.2 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                                  Primary Lead
                                </span>
                              )}
                              <span className="px-2 py-0.2 bg-slate-200 text-slate-700 text-[10px] rounded-full font-medium">
                                {ct.contactType}
                              </span>
                            </div>
                            <div className="text-slate-500 text-[11px] flex items-center space-x-3">
                              <span className="flex items-center space-x-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{ct.email}</span>
                              </span>
                              {ct.phone && (
                                <span className="flex items-center space-x-1">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{ct.phone}</span>
                                </span>
                              )}
                              {ct.jobTitle && <span className="text-slate-400">({ct.jobTitle})</span>}
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteContact(ct.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Remove contact"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Invitations Tab (Part 12) */}
              {drawerTab === 'invitations' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Client Onboarding Invitations
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Send portal access invitations with token validation and expiry control.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setInviteForm({
                          email: selectedClient.contactEmail || '',
                          recipientName: selectedClient.contactName || '',
                          role: 'CLIENT',
                        });
                        setIsInviteModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition flex items-center space-x-1 shadow-2xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Portal Invite</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(!clientDetailData.invitations || clientDetailData.invitations.length === 0) ? (
                      <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                        <Send className="w-8 h-8 text-slate-300 mx-auto" />
                        <div className="text-xs font-medium text-slate-600">No invitations generated yet</div>
                        <p className="text-[11px] text-slate-400">Send an onboarding invite link to let the client activate their portal.</p>
                      </div>
                    ) : (
                      clientDetailData.invitations.map((inv: Invitation) => (
                        <div
                          key={inv.id}
                          className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-slate-900">{inv.recipientName}</span>
                              <span className="text-slate-500 ml-2">({inv.email})</span>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                inv.status === 'Accepted'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : inv.status === 'Expired'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                            <div className="font-mono text-[10px] text-slate-400">
                              Token: {inv.token.substring(0, 16)}...
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleCopyInviteLink(inv.token)}
                                className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded text-[11px] font-medium flex items-center space-x-1"
                              >
                                {copiedToken === inv.token ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-slate-400" />
                                    <span>Copy Link</span>
                                  </>
                                )}
                              </button>
                              {inv.status === 'Pending' && (
                                <button
                                  onClick={() => handleCancelInvitation(inv.id)}
                                  className="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded text-[11px]"
                                >
                                  Revoke
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Assessment Jobs Tab (Part 17) */}
              {drawerTab === 'jobs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Assessment Jobs Lifecycle
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Active and completed fire risk assessment jobs assigned to this client.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {(!clientDetailData.jobs || clientDetailData.jobs.length === 0) ? (
                      <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                        <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
                        <div className="text-xs font-medium text-slate-600">No jobs recorded for this client</div>
                        <p className="text-[11px] text-slate-400">Create an assessment job from the Calendar &amp; Jobs Hub.</p>
                      </div>
                    ) : (
                      clientDetailData.jobs.map((job: Job) => (
                        <div
                          key={job.id}
                          className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-blue-700">{job.jobNumber}</span>
                              <span className="font-semibold text-slate-900">{job.premisesName}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {job.appointmentDate} • Assessor: {job.assessorName}
                            </div>
                          </div>
                          <StatusBadge status={job.status} size="sm" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
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

            {clientFormError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
                <span>{clientFormError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Organisation Name *</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. Camden Retail Property Ltd"
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
                disabled={isSubmittingClient}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 rounded-lg shadow-xs flex items-center space-x-1"
              >
                <span>{isSubmittingClient ? 'Creating...' : 'Create Client Record'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Premises to Selected Client Modal */}
      {isAddPremisesOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreatePremisesForClient}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Premises to {selectedClient.companyName}</h3>
                <p className="text-xs text-slate-500">Register a new property under this client organisation</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPremisesOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {premisesFormError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
                <span>{premisesFormError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Premises / Building Name *</label>
                <input
                  type="text"
                  required
                  value={premisesFormData.premisesName}
                  onChange={(e) => setPremisesFormData({ ...premisesFormData, premisesName: e.target.value })}
                  placeholder="e.g. Unit 4, Camden Wharf / Head Office"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={premisesFormData.addressLine1}
                    onChange={(e) => setPremisesFormData({ ...premisesFormData, addressLine1: e.target.value })}
                    placeholder="12 High Street"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Postcode *</label>
                  <input
                    type="text"
                    required
                    value={premisesFormData.postcode}
                    onChange={(e) => setPremisesFormData({ ...premisesFormData, postcode: e.target.value })}
                    placeholder="NW1 8AB"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Premises Type</label>
                  <select
                    value={premisesFormData.premisesType}
                    onChange={(e) => setPremisesFormData({ ...premisesFormData, premisesType: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  >
                    <option value="Offices & Commercial">Offices & Commercial</option>
                    <option value="Shops & Retail">Shops & Retail</option>
                    <option value="Industrial & Storage">Industrial & Storage</option>
                    <option value="Sleeping Accommodation">Sleeping Accommodation</option>
                    <option value="Residential Care">Residential Care</option>
                    <option value="Educational Premises">Educational Premises</option>
                    <option value="Assembly & Recreation">Assembly & Recreation</option>
                    <option value="Healthcare">Healthcare</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Town / City</label>
                  <input
                    type="text"
                    value={premisesFormData.city}
                    onChange={(e) => setPremisesFormData({ ...premisesFormData, city: e.target.value })}
                    placeholder="London"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Approx Floor Area (m²)</label>
                  <input
                    type="number"
                    value={premisesFormData.approxFloorAreaSqM}
                    onChange={(e) => setPremisesFormData({ ...premisesFormData, approxFloorAreaSqM: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Number of Floors</label>
                  <input
                    type="number"
                    value={premisesFormData.numberOfFloors}
                    onChange={(e) => setPremisesFormData({ ...premisesFormData, numberOfFloors: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">On-Site Contact Name</label>
                  <input
                    type="text"
                    value={premisesFormData.contactOnSite}
                    onChange={(e) => setPremisesFormData({ ...premisesFormData, contactOnSite: e.target.value })}
                    placeholder="e.g. Site Manager"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">On-Site Contact Phone</label>
                  <input
                    type="text"
                    value={premisesFormData.contactOnSitePhone}
                    onChange={(e) => setPremisesFormData({ ...premisesFormData, contactOnSitePhone: e.target.value })}
                    placeholder="07700 900123"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Access Instructions / Keyholder Notes</label>
                <textarea
                  rows={2}
                  value={premisesFormData.accessInstructions}
                  onChange={(e) => setPremisesFormData({ ...premisesFormData, accessInstructions: e.target.value })}
                  placeholder="Keybox code, reception signing-in, alarm procedures..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddPremisesOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingPremises}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 rounded-lg shadow-xs flex items-center space-x-1"
              >
                <span>{isSubmittingPremises ? 'Adding Premises...' : 'Save & Link Premises'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-xs border border-slate-700 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
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

      {/* Add Contact Modal (Part 11) */}
      {isAddContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleAddContact}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-blue-700" />
                <span>Add Contact Person</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddContactOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="e.g. David Wright"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="david@company.co.uk"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telephone</label>
                  <input
                    type="text"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="07700 900789"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={contactForm.jobTitle}
                    onChange={(e) => setContactForm({ ...contactForm, jobTitle: e.target.value })}
                    placeholder="e.g. Facilities Manager"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role / Responsibility</label>
                  <select
                    value={contactForm.contactType}
                    onChange={(e) => setContactForm({ ...contactForm, contactType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 font-medium"
                  >
                    <option value="Primary">Primary Lead</option>
                    <option value="Site Keyholder">Site Keyholder</option>
                    <option value="Responsible Person">Responsible Person</option>
                    <option value="Finance/Billing">Finance / Billing</option>
                    <option value="Technical/Facilities">Technical / Facilities</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center space-x-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contactForm.isPrimary}
                  onChange={(e) => setContactForm({ ...contactForm, isPrimary: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700 font-medium">Designate as Primary Organisation Contact</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddContactOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
              >
                Save Contact
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Send Invitation Modal (Part 12) */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSendInvitation}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Send className="w-5 h-5 text-blue-700" />
                <span>Send Portal Onboarding Invitation</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Recipient Name *</label>
                <input
                  type="text"
                  required
                  value={inviteForm.recipientName}
                  onChange={(e) => setInviteForm({ ...inviteForm, recipientName: e.target.value })}
                  placeholder="e.g. Rachel Adams"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Recipient Email Address *</label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="rachel@company.co.uk"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Portal Access Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 font-medium"
                >
                  <option value="CLIENT">Client Portal User (View Reports, Invoices, Compliance)</option>
                  <option value="COLLABORATOR">Collaborator (Responsible Person / Site Keyholder)</option>
                  <option value="ASSESSOR">Assessor Portal Access</option>
                </select>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900 leading-relaxed">
                A secure, cryptographic 7-day single-use invitation token will be generated and logged to the transmission audit trail.
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
              >
                Generate &amp; Dispatch Invitation
              </button>
            </div>
          </form>
        </div>
      )}
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
      {emailModalClient && (
        <DirectEmailModal
          isOpen={!!emailModalClient}
          onClose={() => setEmailModalClient(null)}
          defaultRecipientEmail={emailModalClient.contactEmail || ''}
          defaultRecipientName={emailModalClient.contactName || emailModalClient.companyName}
          clientId={emailModalClient.id}
          defaultSubject={`Aurelius Fire Safety • Communication regarding ${emailModalClient.companyName}`}
          onSuccess={() => setEmailModalClient(null)}
        />
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  Premises,
  Quote,
  Invoice,
  Appointment,
  FireRiskAssessmentRecord,
  ActionRecord,
  DocumentRecord,
  MessageRecord,
} from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
import {
  Building2,
  FileText,
  CreditCard,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Upload,
  Download,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  FileCheck,
  Check,
  X,
  Printer,
  ChevronRight,
  Info,
} from 'lucide-react';

export const ClientPortal: React.FC = () => {
  const { currentClient } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'premises' | 'quotes' | 'invoices' | 'appointments' | 'fras' | 'actions' | 'documents' | 'messages'
  >('overview');

  // Client Data States
  const [clientPremises, setClientPremises] = useState<Premises[]>([]);
  const [clientQuotes, setClientQuotes] = useState<Quote[]>([]);
  const [clientInvoices, setClientInvoices] = useState<Invoice[]>([]);
  const [clientAppointments, setClientAppointments] = useState<Appointment[]>([]);
  const [clientFras, setClientFras] = useState<FireRiskAssessmentRecord[]>([]);
  const [clientActions, setClientActions] = useState<ActionRecord[]>([]);
  const [clientDocuments, setClientDocuments] = useState<DocumentRecord[]>([]);
  const [clientMessages, setClientMessages] = useState<MessageRecord[]>([]);

  // Modals
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [evidenceAction, setEvidenceAction] = useState<ActionRecord | null>(null);
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [evidenceFileName, setEvidenceFileName] = useState('');

  // Booking Request State
  const [bookingPremisesId, setBookingPremisesId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('09:30');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Chat message
  const [chatInput, setChatInput] = useState('');
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);

  // Readiness Checklist Modal
  const [readinessPremises, setReadinessPremises] = useState<Premises | null>(null);
  const [checklistAlarm, setChecklistAlarm] = useState(true);
  const [checklistLighting, setChecklistLighting] = useState(true);
  const [checklistDrawings, setChecklistDrawings] = useState(false);
  const [checklistEscort, setChecklistEscort] = useState(true);
  const [checklistNotes, setChecklistNotes] = useState('');

  // Add Premises State
  const [isAddPremisesModalOpen, setIsAddPremisesModalOpen] = useState(false);
  const [isSubmittingPremises, setIsSubmittingPremises] = useState(false);
  const [premisesFormError, setPremisesFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
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

  const handleCreateClientPremises = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClient) return;
    setIsSubmittingPremises(true);
    setPremisesFormError(null);
    try {
      const created = await api.createPremises({
        ...premisesFormData,
        clientId: currentClient.id,
      });
      setIsAddPremisesModalOpen(false);
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
      await loadAllClientData(currentClient.id);
      showToast(`Premises "${created.premisesName}" successfully registered!`);
    } catch (err: any) {
      console.error('Failed to create premises:', err);
      setPremisesFormError(err.message || 'Failed to register premises. Please check fields.');
    } finally {
      setIsSubmittingPremises(false);
    }
  };

  useEffect(() => {
    if (currentClient) {
      loadAllClientData(currentClient.id);
    }
  }, [currentClient]);

  const loadAllClientData = async (clientId: string) => {
    try {
      const [prem, qu, inv, app, fr, act, doc, msg] = await Promise.all([
        api.getPremises(clientId),
        api.getQuotes(clientId),
        api.getInvoices(clientId),
        api.getAppointments(clientId),
        api.getFras(clientId),
        api.getActions(clientId),
        api.getDocuments(clientId),
        api.getMessages(clientId),
      ]);
      setClientPremises(prem);
      setClientQuotes(qu);
      setClientInvoices(inv);
      setClientAppointments(app);
      setClientFras(fr);
      setClientActions(act);
      setClientDocuments(doc);
      setClientMessages(msg);
    } catch (err) {
      console.error('Error loading client data:', err);
    }
  };

  if (!currentClient) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-xs">No client account currently selected.</p>
      </div>
    );
  }

  // Action: Client Accepts Quote
  const handleAcceptQuote = async (quoteId: string) => {
    try {
      await api.acceptQuote(quoteId, currentClient.contactName);
      await loadAllClientData(currentClient.id);
      setSelectedQuote(null);
      alert('Thank you! Quotation accepted. Your invoice has been generated.');
    } catch (err) {
      console.error('Failed to accept quote:', err);
    }
  };

  // Action: Pay Invoice via Stripe (Part 15)
  const handlePayInvoice = async (invoice: Invoice) => {
    try {
      const intent = await api.createPaymentIntent({
        amountPence: Math.round(invoice.totalAmount * 100),
        clientId: currentClient.id,
        organisationId: currentClient.id,
        invoiceId: invoice.id,
        quoteId: invoice.quoteId,
        description: `Payment for Invoice ${invoice.invoiceNumber}`,
      });

      await api.confirmPayment({
        paymentIntentId: intent.paymentIntentId || `pi_stripe_${Date.now()}`,
        clientId: currentClient.id,
        organisationId: currentClient.id,
        amount: invoice.totalAmount,
        invoiceId: invoice.id,
        quoteId: invoice.quoteId,
        paymentMethod: 'card',
      });
      await loadAllClientData(currentClient.id);
      setSelectedInvoice(null);
      alert('Payment of £' + invoice.totalAmount.toFixed(2) + ' processed successfully via Stripe.');
    } catch (err) {
      console.error('Payment failed:', err);
      alert('Payment processing encountered an issue. Please try again.');
    }
  };

  // Action: Submit Action Evidence
  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceAction) return;

    setIsSubmittingEvidence(true);
    try {
      await api.updateActionClient(evidenceAction.id, {
        completionEvidenceNotes: evidenceNotes,
        markCompleted: true,
        evidenceFile: {
          fileName: evidenceFileName || 'remedial_photo_evidence.jpg',
          fileUrl: `/uploads/${Date.now()}_evidence.jpg`,
        },
      });

      setEvidenceAction(null);
      setEvidenceNotes('');
      setEvidenceFileName('');
      await loadAllClientData(currentClient.id);
    } catch (err) {
      console.error('Failed to submit evidence:', err);
    } finally {
      setIsSubmittingEvidence(false);
    }
  };

  // Action: Request Booking
  const handleRequestBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingPremisesId || !bookingDate) return;

    try {
      await api.requestAppointment({
        clientId: currentClient.id,
        premisesId: bookingPremisesId,
        appointmentDate: bookingDate,
        startTime: bookingTime,
        clientNotes: bookingNotes,
      });

      setIsBookingModalOpen(false);
      setBookingNotes('');
      await loadAllClientData(currentClient.id);
      alert('Your assessment visit slot has been requested. Our assessor will confirm shortly.');
    } catch (err) {
      console.error('Failed to request appointment:', err);
    }
  };

  // Action: Save Readiness Checklist
  const handleSaveReadiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!readinessPremises) return;

    const isReady = checklistAlarm && checklistLighting && checklistEscort;
    try {
      await api.updatePremises(readinessPremises.id, {
        preAssessmentReadinessStatus: isReady ? 'READY' : 'IN_PROGRESS',
        accessArrangements: `Alarm log: ${checklistAlarm ? 'Present' : 'Missing'}; Emergency light log: ${
          checklistLighting ? 'Present' : 'Missing'
        }; Drawings: ${checklistDrawings ? 'Available' : 'None'}; Escort: ${
          checklistEscort ? 'Confirmed' : 'Unconfirmed'
        }. Notes: ${checklistNotes}`,
      });

      setReadinessPremises(null);
      await loadAllClientData(currentClient.id);
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    try {
      await api.sendMessage({
        clientId: currentClient.id,
        messageText: chatInput.trim(),
      });
      setChatInput('');
      const updated = await api.getMessages(currentClient.id);
      setClientMessages(updated);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Stats calculation
  const openActions = clientActions.filter((a) => a.status !== 'Closed').length;
  const pendingInvoices = clientInvoices.filter((i) => i.status !== 'Paid');

  return (
    <div className="space-y-6">
      {/* Top Banner: Client Organisation Context */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold text-[10px] tracking-wider uppercase">
                Designated Responsible Person Portal
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-medium text-slate-600">
                FSO 2005 Statutory Compliance
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {currentClient.companyName}
            </h1>
            <p className="text-xs text-slate-500">
              Responsible Person: <strong className="text-slate-800">{currentClient.contactName}</strong> ({currentClient.contactEmail}) • Billing Address: {currentClient.billingAddress}
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start">
            <button
              onClick={() => setIsAddPremisesModalOpen(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1.5"
            >
              <Building2 className="w-4 h-4" />
              <span>+ Add Premises</span>
            </button>
            <button
              onClick={() => {
                setBookingPremisesId(clientPremises[0]?.id || '');
                setIsBookingModalOpen(true);
              }}
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Request Visit</span>
            </button>
          </div>
        </div>

        {/* 4-STEP CLIENT COMPLIANCE JOURNEY */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                Guided Step-by-Step Flow
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                How to Complete Your Fire Safety Compliance
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              Sites Registered: <strong className="text-slate-800">{clientPremises.length}</strong> • Actions Pending: <strong className="text-slate-800">{openActions}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Step 1 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between space-y-2 hover:border-blue-300 transition">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                  <span>STEP 1</span>
                  {clientPremises.length > 0 ? (
                    <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                      {clientPremises.length} Added
                    </span>
                  ) : (
                    <span className="text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                      Required
                    </span>
                  )}
                </div>
                <div className="font-bold text-slate-900 text-xs">Register Premises</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Add your commercial, residential or retail properties requiring statutory assessment.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPremisesModalOpen(true)}
                className="w-full py-1.5 px-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center space-x-1"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>+ Add Premises</span>
              </button>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between space-y-2 hover:border-blue-300 transition">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                  <span>STEP 2</span>
                  <span className="text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                    Readiness
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-xs">Pre-Assessment Checklist</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Verify alarm test logbooks, emergency lighting records, and keys before the assessor arrives.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('premises');
                  if (clientPremises.length > 0) {
                    setReadinessPremises(clientPremises[0]);
                    setChecklistNotes(clientPremises[0].accessArrangements || '');
                  }
                }}
                className="w-full py-1.5 px-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Checklist & Escort</span>
              </button>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between space-y-2 hover:border-blue-300 transition">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                  <span>STEP 3</span>
                  <span className="text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                    {clientQuotes.length} Quotes
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-xs">Quotes & Bookings</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Review fixed fee proposals, book visit dates, and access VAT invoices for accounting.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('quotes')}
                className="w-full py-1.5 px-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Quotations</span>
              </button>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between space-y-2 hover:border-blue-300 transition">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                  <span>STEP 4</span>
                  <span className={`px-1.5 py-0.5 rounded font-semibold text-[10px] ${openActions > 0 ? 'text-rose-700 bg-rose-100' : 'text-emerald-700 bg-emerald-100'}`}>
                    {openActions > 0 ? `${openActions} Open` : 'Compliant'}
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-xs">Remedial Evidence</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Upload contractor invoices and photos of repaired fire doors or signage to close actions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('actions')}
                className="w-full py-1.5 px-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Action Tracker</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto border-t border-slate-100 mt-6 pt-4 text-xs font-medium">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: ShieldCheck },
            { id: 'premises', label: `My Premises (${clientPremises.length})`, icon: Building2 },
            { id: 'quotes', label: `Quotes (${clientQuotes.length})`, icon: FileText },
            { id: 'invoices', label: `Invoices (${clientInvoices.length})`, icon: CreditCard },
            { id: 'appointments', label: `Bookings (${clientAppointments.length})`, icon: Calendar },
            { id: 'fras', label: `FRA Reports (${clientFras.length})`, icon: ShieldCheck },
            {
              id: 'actions',
              label: `Action Plan (${openActions} Open)`,
              icon: AlertTriangle,
              highlight: openActions > 0,
            },
            { id: 'documents', label: `Compliance Certs (${clientDocuments.length})`, icon: FileCheck },
            { id: 'messages', label: 'Messages', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap flex items-center space-x-1.5 ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${tab.highlight ? 'ring-1 ring-rose-300' : ''}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Assessed Properties
              </div>
              <div className="text-2xl font-bold text-slate-900">{clientPremises.length}</div>
              <p className="text-[11px] text-slate-400">Total sites registered under dutyholder</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Issued FRA Reports
              </div>
              <div className="text-2xl font-bold text-blue-700">{clientFras.length}</div>
              <p className="text-[11px] text-slate-400">Available for formal authority inspection</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Remedial Actions
              </div>
              <div className="text-2xl font-bold text-rose-700">{openActions} Open</div>
              <p className="text-[11px] text-slate-400">Requires proof of rectification</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Outstanding Balance
              </div>
              <div className="text-2xl font-bold text-emerald-700">
                £
                {pendingInvoices
                  .reduce((sum, i) => sum + i.totalAmount, 0)
                  .toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-400">
                {pendingInvoices.length} unpaid invoice awaiting clearance
              </p>
            </div>
          </div>

          {/* Urgent Notices or Open Actions Banner */}
          {openActions > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-rose-900">
                <div className="font-bold">Immediate Dutyholder Attention Required</div>
                <p>
                  You have <strong>{openActions} fire safety action(s)</strong> awaiting rectification evidence.
                  Submit your photos or contractor maintenance notes directly through this portal for assessor verification.
                </p>
                <button
                  onClick={() => setActiveTab('actions')}
                  className="font-bold underline text-rose-700 hover:text-rose-900 pt-1 block"
                >
                  View Remedial Action Plan →
                </button>
              </div>
            </div>
          )}

          {/* Quick List: Active Premises Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              Premises Compliance Summary
            </h3>
            <div className="divide-y divide-slate-100">
              {clientPremises.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">{p.premisesName}</div>
                    <div className="text-slate-500">
                      {p.addressLine1}, {p.postcode} • {p.premisesType}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={p.status} size="sm" />
                    <button
                      onClick={() => {
                        setReadinessPremises(p);
                        setChecklistNotes(p.accessArrangements || '');
                      }}
                      className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded border border-slate-200 text-xs font-medium"
                    >
                      Pre-Assessment Checklist
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PREMISES */}
      {activeTab === 'premises' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900">Registered Premises & Readiness</h2>
              <p className="text-xs text-slate-500">Manage all business locations under your statutory duty</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddPremisesModalOpen(true)}
              className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center space-x-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>+ Add Premises</span>
            </button>
          </div>

          {clientPremises.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Premises Registered Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Get started by adding your first building, commercial unit, or property portfolio to arrange statutory fire risk assessments.
              </p>
              <button
                type="button"
                onClick={() => setIsAddPremisesModalOpen(true)}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs inline-flex items-center space-x-1"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>+ Register Your First Premises</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientPremises.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{p.premisesName}</h3>
                      <p className="text-xs text-slate-500">
                        {p.addressLine1}, {p.postcode}
                      </p>
                    </div>
                    <StatusBadge status={p.status} size="sm" />
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1.5 text-slate-600">
                    <div>
                      <span className="text-slate-400">Type:</span> {p.premisesType} • {p.numberOfFloors} floors
                    </div>
                    <div>
                      <span className="text-slate-400">Sleeping Risk:</span>{' '}
                      <span className={p.sleepingRisk ? 'text-rose-700 font-bold' : 'text-slate-600'}>
                        {p.sleepingRisk ? 'Yes (Occupants asleep)' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Pre-Assessment Readiness:</span>{' '}
                      <span
                        className={`font-semibold ${
                          p.preAssessmentReadinessStatus === 'READY'
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {p.preAssessmentReadinessStatus || 'INFORMATION REQUIRED'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setReadinessPremises(p);
                      setChecklistNotes(p.accessArrangements || '');
                    }}
                    className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                  >
                    Complete Readiness Checklist
                  </button>
                  <button
                    onClick={() => {
                      setBookingPremisesId(p.id);
                      setIsBookingModalOpen(true);
                    }}
                    className="text-xs text-slate-600 hover:text-blue-700 font-medium"
                  >
                    Book Visit →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: QUOTES */}
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">Quotations & Commercial Proposals</h2>
          {clientQuotes.length === 0 ? (
            <EmptyState
              title="No quotes issued"
              description="You do not have any active quotations yet."
              icon={FileText}
            />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Quote Number</th>
                    <th className="py-3 px-4">Premises</th>
                    <th className="py-3 px-4">Total (Zero VAT)</th>
                    <th className="py-3 px-4">Valid Until</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientQuotes.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-semibold">{q.quoteNumber}</td>
                      <td className="py-3 px-4">{q.premisesName}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        £{q.totalAmount.toFixed(2)}{' '}
                        <span className="text-[10px] font-normal text-emerald-600 block sm:inline">(Zero VAT)</span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{q.validUntil}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={q.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedQuote(q)}
                          className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded text-xs font-medium border border-slate-200"
                        >
                          Review & Sign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: INVOICES & STRIPE PAYMENTS */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">Commercial Invoices & Stripe Payments</h2>
          {clientInvoices.length === 0 ? (
            <EmptyState
              title="No invoices found"
              description="You have no outstanding or past invoices."
              icon={CreditCard}
            />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Invoice Ref</th>
                    <th className="py-3 px-4">Premises</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-semibold">{inv.invoiceNumber}</td>
                      <td className="py-3 px-4">{inv.premisesName}</td>
                      <td className="py-3 px-4 text-slate-500">{inv.dueDate}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        £{inv.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={inv.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {inv.status !== 'Paid' ? (
                          <button
                            onClick={() => handlePayInvoice(inv)}
                            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold shadow-xs"
                          >
                            Pay Online (Stripe)
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-semibold text-xs flex items-center justify-end space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Paid</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900">Assessment Appointments</h2>
            <button
              onClick={() => {
                setBookingPremisesId(clientPremises[0]?.id || '');
                setIsBookingModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition"
            >
              Request Slot
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientAppointments.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                      <Calendar className="w-4 h-4 text-blue-700" />
                      <span>{app.appointmentDate}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {app.startTime} - {app.endTime}
                    </div>
                  </div>
                  <StatusBadge status={app.status} size="sm" />
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                  <div className="font-semibold text-slate-900">{app.premisesName}</div>
                  <div className="text-[11px] text-slate-500">
                    Lead Assessor: {app.assessorName}
                  </div>
                  {app.assessorNotes && (
                    <div className="text-[11px] text-blue-700 pt-1">
                      Assessor Note: "{app.assessorNotes}"
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: FRA REPORTS */}
      {activeTab === 'fras' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Delivered Fire Risk Assessments (PAS 79)
          </h2>
          {clientFras.length === 0 ? (
            <EmptyState
              title="No assessment reports delivered"
              description="Your completed fire risk assessment reports will appear here once finalized by your assessor."
              icon={ShieldCheck}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clientFras.map((fra) => (
                <div
                  key={fra.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {fra.reportNumber}
                      </div>
                      <div className="text-xs text-slate-500">{fra.premisesName}</div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        fra.overallRiskRating === 'Substantial'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : fra.overallRiskRating === 'Moderate'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {fra.overallRiskRating} Risk
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    "{fra.executiveSummary}"
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                    <div>
                      Assessed: <strong className="text-slate-800">{fra.assessmentDate}</strong>
                    </div>
                    <div>
                      Next Review Due:{' '}
                      <strong className="text-slate-800">{fra.recommendedReviewDate}</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">Assessor: {fra.assessorName}</span>
                    <a
                      href={fra.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download FRA (PDF)</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: ACTION PLAN & RECTIFICATION */}
      {activeTab === 'actions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Fire Safety Remedial Action Plan
              </h2>
              <p className="text-xs text-slate-500">
                Provide proof of rectification (notes or photo attachments) to close statutory deficiencies
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {clientActions.map((act) => (
              <div
                key={act.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {act.actionReference}
                    </span>
                    <StatusBadge status={act.riskRating} size="sm" />
                    <StatusBadge status={act.status} size="sm" />
                  </div>
                  <div className="text-xs text-slate-500">
                    Target Date: <strong className="text-slate-800">{act.targetCompletionDate}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] block font-bold">
                      Deficiency Identified:
                    </span>
                    <p className="text-slate-800 mt-0.5">{act.deficiencyFound}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] block font-bold">
                      Required Action:
                    </span>
                    <p className="text-slate-800 mt-0.5">{act.recommendedAction}</p>
                  </div>
                </div>

                {/* Evidence Details */}
                {act.completionEvidenceNotes && (
                  <div className="text-xs p-3 bg-emerald-50/60 rounded-lg border border-emerald-200">
                    <span className="text-emerald-900 font-bold uppercase text-[10px] block">
                      Submitted Rectification Proof:
                    </span>
                    <p className="text-slate-700 mt-1">"{act.completionEvidenceNotes}"</p>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  {act.status !== 'Closed' ? (
                    <button
                      onClick={() => {
                        setEvidenceAction(act);
                        setEvidenceNotes(act.completionEvidenceNotes || '');
                      }}
                      className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Rectification Evidence</span>
                    </button>
                  ) : (
                    <div className="text-xs text-emerald-700 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verified & Signed Off by Assessor</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: COMPLIANCE CERTS */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Maintenance Certificates & Records
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-900 text-xs">{doc.title}</h3>
                    <StatusBadge status={doc.complianceStatus} size="sm" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{doc.category}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Premises: {doc.premisesName}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-mono text-[11px]">
                    Expires: {doc.expiryDate || 'N/A'}
                  </span>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded border border-slate-200 font-medium"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: MESSAGES */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden h-[500px] flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-xs font-bold text-slate-900">
              Assessor Dialogue • Aurelius Commercial Fire Safety Operations (Charlie Hughes)
            </h3>
            <p className="text-[11px] text-slate-500">
              Direct assistance with site access, document submissions, and fire safety directives
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {clientMessages.map((m) => {
              const isClient = m.senderRole === 'CLIENT';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center space-x-1 text-[10px] text-slate-400 mb-0.5">
                    <span className="font-semibold text-slate-600">{m.senderName}</span>
                    <span>•</span>
                    <span>
                      {new Date(m.createdAt).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div
                    className={`p-3 rounded-2xl max-w-md text-xs leading-relaxed ${
                      isClient
                        ? 'bg-blue-700 text-white rounded-br-xs'
                        : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200'
                    }`}
                  >
                    {m.messageText}
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex space-x-2">
            <input
              type="text"
              required
              placeholder="Type your message to the lead assessor..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Quote Review & Acceptance Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 space-y-4 my-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Quotation Acceptance • {selectedQuote.quoteNumber}
                </h3>
                <p className="text-xs text-slate-500">Site: {selectedQuote.premisesName}</p>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Scope Description</th>
                    <th className="p-2.5 text-right">Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedQuote.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5">{it.description}</td>
                      <td className="p-2.5 text-right font-mono">£{it.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-right text-xs">
                <div>Subtotal: £{selectedQuote.netAmount.toFixed(2)}</div>
                <div className="text-emerald-700 font-medium">VAT (0%): £0.00 (Zero VAT / Non-VAT Registered)</div>
                <div className="font-bold text-sm text-slate-900">
                  Total Due: £{selectedQuote.totalAmount.toFixed(2)}
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl text-[11px] text-blue-900 leading-relaxed border border-blue-200">
                <span className="font-bold block">Statutory Declaration:</span>
                By clicking "Accept Quotation", you formally authorise Aurelius Commercial Fire Safety to conduct
                the assessment according to British Standard PAS 79-1:2020. An electronic commercial invoice
                will be generated.
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedQuote(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Back
              </button>
              {selectedQuote.status === 'Sent' && (
                <button
                  onClick={() => handleAcceptQuote(selectedQuote.id)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept Quotation & Authorise</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Evidence Submission Modal */}
      {evidenceAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSubmitEvidence}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Submit Rectification Evidence</h3>
              <button
                type="button"
                onClick={() => setEvidenceAction(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Action: <strong className="text-slate-900">{evidenceAction.deficiencyFound}</strong>
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Remediation Details / Contractor Note *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Overhead door closer adjusted and tested. Fire door now latches positively against seal."
                  value={evidenceNotes}
                  onChange={(e) => setEvidenceNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Attachment Name / Photo Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. door_closer_repair_photo.jpg"
                  value={evidenceFileName}
                  onChange={(e) => setEvidenceFileName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEvidenceAction(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingEvidence}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-xs"
              >
                {isSubmittingEvidence ? 'Submitting...' : 'Submit for Assessor Sign-Off'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Booking Slot Request Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleRequestBooking}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Request Assessment Visit</h3>
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Premises *</label>
                <select
                  required
                  value={bookingPremisesId}
                  onChange={(e) => setBookingPremisesId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                >
                  {clientPremises.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.premisesName} ({p.postcode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preferred Date *</label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preferred Time Slot</label>
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                >
                  <option value="09:30">09:30 AM (Morning Slot)</option>
                  <option value="11:30">11:30 AM (Midday Slot)</option>
                  <option value="14:00">02:00 PM (Afternoon Slot)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Access Notes / Site Contact
                </label>
                <input
                  type="text"
                  placeholder="e.g. Building manager on site, park in rear bay"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pre-Assessment Readiness Checklist Modal */}
      {readinessPremises && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveReadiness}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Pre-Assessment Readiness</h3>
                <p className="text-xs text-slate-500">Site: {readinessPremises.premisesName}</p>
              </div>
              <button
                type="button"
                onClick={() => setReadinessPremises(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                To guarantee an efficient site assessment, please verify the following statutory preparations:
              </p>

              <label className="flex items-start space-x-2 p-2 bg-slate-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklistAlarm}
                  onChange={(e) => setChecklistAlarm(e.target.checked)}
                  className="mt-0.5 rounded text-blue-700"
                />
                <span className="text-slate-800">
                  <strong>Fire Alarm System Logbook:</strong> Available on site showing weekly test records and 6-monthly service certificate (BS 5839).
                </span>
              </label>

              <label className="flex items-start space-x-2 p-2 bg-slate-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklistLighting}
                  onChange={(e) => setChecklistLighting(e.target.checked)}
                  className="mt-0.5 rounded text-blue-700"
                />
                <span className="text-slate-800">
                  <strong>Emergency Lighting Log:</strong> Annual 3-hour discharge test certificate and monthly flicker test logs available (BS 5266).
                </span>
              </label>

              <label className="flex items-start space-x-2 p-2 bg-slate-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklistDrawings}
                  onChange={(e) => setChecklistDrawings(e.target.checked)}
                  className="mt-0.5 rounded text-blue-700"
                />
                <span className="text-slate-800">
                  <strong>Building Floor Plans / Spatial Layouts:</strong> Physical or electronic drawings available showing escape routes.
                </span>
              </label>

              <label className="flex items-start space-x-2 p-2 bg-slate-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklistEscort}
                  onChange={(e) => setChecklistEscort(e.target.checked)}
                  className="mt-0.5 rounded text-blue-700"
                />
                <span className="text-slate-800">
                  <strong>Escort & Keyholder Availability:</strong> A designated staff member will be on site with master keys to plant rooms and roof voids.
                </span>
              </label>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Access Notes / Hazardous Areas
                </label>
                <textarea
                  rows={2}
                  value={checklistNotes}
                  onChange={(e) => setChecklistNotes(e.target.value)}
                  placeholder="e.g. High voltage riser on 3rd floor requires maintenance escort"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReadinessPremises(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
              >
                Save Readiness Confirmation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Premises Modal for Client */}
      {isAddPremisesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateClientPremises}
            className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 border border-slate-200 space-y-4 my-8"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Register New Premises</h3>
                <p className="text-xs text-slate-500">Add a property or commercial unit for fire risk assessment</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPremisesModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {premisesFormError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{premisesFormError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Premises / Building Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3, Riverside Retail Park"
                  value={premisesFormData.premisesName}
                  onChange={(e) => setPremisesFormData({ ...premisesFormData, premisesName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Address Line 1</label>
                  <input
                    type="text"
                    placeholder="12 Commercial Way"
                    value={premisesFormData.addressLine1}
                    onChange={(e) => setPremisesFormData({ ...premisesFormData, addressLine1: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Postcode *</label>
                  <input
                    type="text"
                    required
                    placeholder="SE1 7PB"
                    value={premisesFormData.postcode}
                    onChange={(e) => setPremisesFormData({ ...premisesFormData, postcode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Town / City</label>
                  <input
                    type="text"
                    placeholder="London"
                    value={premisesFormData.city}
                    onChange={(e) => setPremisesFormData({ ...premisesFormData, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
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
                    <option value="Sleeping Accommodation">Sleeping Accommodation (HMO/Hotel)</option>
                    <option value="Residential Care">Residential Care</option>
                    <option value="Educational Premises">Educational Premises</option>
                    <option value="Assembly & Recreation">Assembly & Recreation</option>
                    <option value="Healthcare">Healthcare</option>
                  </select>
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
                  <label className="block font-semibold text-slate-700 mb-1">Number of Storeys</label>
                  <input
                    type="number"
                    value={premisesFormData.numberOfFloors}
                    onChange={(e) => setPremisesFormData({ ...premisesFormData, numberOfFloors: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center space-x-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={premisesFormData.sleepingAccommodation}
                    onChange={(e) => setPremisesFormData({ ...premisesFormData, sleepingAccommodation: e.target.checked })}
                    className="rounded text-blue-700"
                  />
                  <span>Sleeping accommodation on site</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={premisesFormData.publicAccess}
                    onChange={(e) => setPremisesFormData({ ...premisesFormData, publicAccess: e.target.checked })}
                    className="rounded text-blue-700"
                  />
                  <span>Open to members of public</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">On-Site Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Facilities Lead / Store Mgr"
                    value={premisesFormData.contactOnSite}
                    onChange={(e) => setPremisesFormData({ ...premisesFormData, contactOnSite: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">On-Site Telephone</label>
                  <input
                    type="text"
                    placeholder="07700 900555"
                    value={premisesFormData.contactOnSitePhone}
                    onChange={(e) => setPremisesFormData({ ...premisesFormData, contactOnSitePhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Access Notes & Keyholder Instructions</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Ring buzzer 4B, parking permits at main reception"
                  value={premisesFormData.accessInstructions}
                  onChange={(e) => setPremisesFormData({ ...premisesFormData, accessInstructions: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddPremisesModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingPremises}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 rounded-lg shadow-xs flex items-center space-x-1"
              >
                <span>{isSubmittingPremises ? 'Registering...' : 'Save & Register Premises'}</span>
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
    </div>
  );
};

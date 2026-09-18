import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Quote, Client, Premises, QuoteItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
import { DirectEmailModal } from '../common/DirectEmailModal';
import {
  FileText,
  Search,
  Plus,
  Send,
  CheckCircle,
  XCircle,
  Eye,
  Printer,
  X,
  Building2,
  Calendar,
  AlertCircle,
  Mail,
  CalendarCheck,
  CalendarX,
  Clock,
  Check,
  UserPlus,
  Building,
} from 'lucide-react';

export const QuotesManagement: React.FC = () => {
  const { allClients, loadAllClientData } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [premisesList, setPremisesList] = useState<Premises[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Preview / Send Modal
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isCreatingModalOpen, setIsCreatingModalOpen] = useState(false);

  // Assessor Review & Booking Decision Modal
  const [decisionQuote, setDecisionQuote] = useState<Quote | null>(null);
  const [decisionAction, setDecisionAction] = useState<'confirm' | 'counter' | 'decline'>('confirm');
  const [confirmedDate, setConfirmedDate] = useState('');
  const [confirmedTime, setConfirmedTime] = useState('09:30 AM');
  const [counterDate, setCounterDate] = useState('');
  const [counterTime, setCounterTime] = useState('10:00 AM');
  const [declineReason, setDeclineReason] = useState('Premises outside current regional coverage area');
  const [assessorNotes, setAssessorNotes] = useState('');
  const [isProcessingDecision, setIsProcessingDecision] = useState(false);

  // Direct Email Modal state
  const [emailModalQuote, setEmailModalQuote] = useState<Quote | null>(null);

  // New quote mode: 'existing' vs 'new_client_premises'
  const [newQuoteMode, setNewQuoteMode] = useState<'existing' | 'new_client_premises'>('existing');
  const [formClientId, setFormClientId] = useState(allClients[0]?.id || '');
  const [formPremisesId, setFormPremisesId] = useState('');
  // Auto-add client & premises fields
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTelephone, setNewTelephone] = useState('');
  const [newPremisesName, setNewPremisesName] = useState('');
  const [newPremisesAddress, setNewPremisesAddress] = useState('');
  const [newPostcode, setNewPostcode] = useState('');

  const [formValidDays, setFormValidDays] = useState(30);
  const [formItems, setFormItems] = useState<QuoteItem[]>([
    {
      id: 'item_1',
      description: 'Comprehensive Life Safety Fire Risk Assessment (PAS 79-1:2020)',
      quantity: 1,
      unitPrice: 425,
      total: 425,
    },
    {
      id: 'item_2',
      description: 'Visual compartmentation & fire door survey sample',
      quantity: 1,
      unitPrice: 120,
      total: 120,
    },
  ]);

  useEffect(() => {
    loadQuotes();
    api.getPremises().then(setPremisesList);
  }, []);

  const loadQuotes = async () => {
    const list = await api.getQuotes();
    setQuotes(list);
  };

  const handleSendQuote = async (id: string) => {
    try {
      await api.sendQuote(id);
      await loadQuotes();
      if (selectedQuote?.id === id) {
        setSelectedQuote((prev) => (prev ? { ...prev, status: 'Sent' } : null));
      }
    } catch (err) {
      console.error('Failed to send quote:', err);
    }
  };

  const handleAcceptQuote = async (id: string) => {
    try {
      await api.acceptQuote(id, 'Admin Assessor on Client Behalf');
      await loadQuotes();
      if (selectedQuote?.id === id) {
        setSelectedQuote((prev) => (prev ? { ...prev, status: 'Client Accepted - Awaiting Assessor' } : null));
      }
    } catch (err) {
      console.error('Failed to accept quote:', err);
    }
  };

  // Assessor decision submit
  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionQuote) return;

    setIsProcessingDecision(true);
    try {
      if (decisionAction === 'confirm') {
        const res = await api.assessorConfirmQuote(decisionQuote.id, {
          confirmedDate: confirmedDate || decisionQuote.preferredSlotDate,
          confirmedTime: confirmedTime || decisionQuote.preferredSlotTime || '09:30 AM',
          assessorNotes,
        });
        if (selectedQuote?.id === decisionQuote.id) setSelectedQuote(res.quote);
      } else if (decisionAction === 'counter') {
        const res = await api.assessorCounterQuote(decisionQuote.id, {
          proposedDate: counterDate,
          proposedTime: counterTime,
          assessorNotes,
        });
        if (selectedQuote?.id === decisionQuote.id) setSelectedQuote(res.quote);
      } else if (decisionAction === 'decline') {
        const res = await api.assessorDeclineQuote(decisionQuote.id, {
          declineReason,
          assessorNotes,
        });
        if (selectedQuote?.id === decisionQuote.id) setSelectedQuote(res.quote);
      }

      await loadQuotes();
      await loadAllClientData();
      setDecisionQuote(null);
    } catch (err: any) {
      alert(err.message || 'Failed to process decision.');
    } finally {
      setIsProcessingDecision(false);
    }
  };

  const handleCreateQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newQuoteMode === 'existing' && (!formClientId || !formPremisesId)) {
      alert('Please select both a client and a premises.');
      return;
    }

    if (newQuoteMode === 'new_client_premises' && (!newCompanyName || !newEmail || !newPremisesName)) {
      alert('Please provide client company name, email, and premises name.');
      return;
    }

    const net = formItems.reduce((sum, item) => sum + item.total, 0);
    const vat = 0;
    const total = net;

    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + formValidDays);

    try {
      await api.createQuote({
        clientId: newQuoteMode === 'existing' ? formClientId : undefined,
        premisesId: newQuoteMode === 'existing' ? formPremisesId : undefined,
        // Auto-add payload
        companyName: newQuoteMode === 'new_client_premises' ? newCompanyName : undefined,
        clientName: newQuoteMode === 'new_client_premises' ? newContactName || newCompanyName : undefined,
        email: newQuoteMode === 'new_client_premises' ? newEmail : undefined,
        telephone: newQuoteMode === 'new_client_premises' ? newTelephone : undefined,
        premisesName: newQuoteMode === 'new_client_premises' ? newPremisesName : undefined,
        premisesAddress: newQuoteMode === 'new_client_premises' ? newPremisesAddress : undefined,
        postcode: newQuoteMode === 'new_client_premises' ? newPostcode : undefined,
        items: formItems,
        netAmount: net,
        vatRate: 0,
        vatAmount: 0,
        totalAmount: total,
        validUntil: validUntilDate.toISOString().split('T')[0],
        termsAndConditions:
          'Payment required prior to attendance or release of formal documentation. Quote valid for 30 calendar days. 100% Flat fee with Zero VAT.',
        statutoryStatement:
          'In accordance with the Regulatory Reform (Fire Safety) Order 2005, the client remains the designated Responsible Person.',
      });

      setIsCreatingModalOpen(false);
      // Reset form
      setNewCompanyName('');
      setNewContactName('');
      setNewEmail('');
      setNewTelephone('');
      setNewPremisesName('');
      setNewPremisesAddress('');
      setNewPostcode('');

      await loadQuotes();
      await loadAllClientData();
      const updatedPremises = await api.getPremises();
      setPremisesList(updatedPremises);
    } catch (err: any) {
      alert(err.message || 'Failed to create quote.');
    }
  };

  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.premisesName?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus !== 'ALL') {
      if (
        filterStatus === 'Client Accepted - Awaiting Assessor' ||
        filterStatus === 'Awaiting Assessor' ||
        filterStatus === 'Awaiting Assessor Confirmation'
      ) {
        if (
          q.status !== 'Client Accepted - Awaiting Assessor' &&
          q.status !== 'Awaiting Assessor Confirmation'
        ) {
          return false;
        }
      } else if (q.status !== filterStatus) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quoting & Assessment Scheduling</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage proposals, client slot selections, assessor acceptance/rejections, and direct communications
          </p>
        </div>
        <button
          onClick={() => {
            setFormClientId(allClients[0]?.id || '');
            setNewQuoteMode('existing');
            setIsCreatingModalOpen(true);
          }}
          className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>New Quote</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search quote number, client, premises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto">
          {['ALL', 'Draft', 'Sent', 'Client Accepted - Awaiting Assessor', 'Assessor Confirmed', 'Date Counter-Offered', 'Assessor Declined'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                filterStatus === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'Client Accepted - Awaiting Assessor' ? 'Awaiting Assessor' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredQuotes.length === 0 ? (
          <EmptyState
            title="No quotes found"
            description="No quotes match your search criteria or none have been generated yet."
            icon={FileText}
            actionLabel="Generate Quote"
            onAction={() => setIsCreatingModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Quote Number</th>
                  <th className="py-3 px-4">Client Organisation</th>
                  <th className="py-3 px-4">Premises</th>
                  <th className="py-3 px-4">Preferred / Confirmed Slot</th>
                  <th className="py-3 px-4">Total (Zero VAT)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuotes.map((q) => {
                  const isAwaitingAssessor =
                    q.status === 'Client Accepted - Awaiting Assessor' ||
                    (q.preferredSlotDate && q.status !== 'Assessor Confirmed' && q.status !== 'Assessor Declined');

                  return (
                    <tr key={q.id} className={`hover:bg-slate-50/80 transition ${isAwaitingAssessor ? 'bg-amber-50/30' : ''}`}>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        {q.quoteNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {q.clientName || 'Unknown Client'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-medium text-slate-900">{q.premisesName}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {q.preferredSlotDate ? (
                          <div className="flex flex-col text-[11px]">
                            <span className="font-semibold text-slate-900 flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-blue-600" />
                              <span>{q.preferredSlotDate}</span>
                            </span>
                            <span className="text-slate-500">{q.preferredSlotTime || '09:30 AM'}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Not yet selected</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        £{q.totalAmount.toFixed(2)}{' '}
                        <span className="text-[10px] font-normal text-emerald-600 block sm:inline">(Zero VAT)</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={q.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {/* Direct Email trigger */}
                        <button
                          type="button"
                          onClick={() => setEmailModalQuote(q)}
                          className="px-2 py-1 text-slate-700 hover:bg-slate-100 rounded text-xs font-medium border border-slate-200 transition inline-flex items-center space-x-1"
                          title="Direct Email to Client"
                        >
                          <Mail className="w-3.5 h-3.5 text-blue-600" />
                          <span>Email</span>
                        </button>

                        {/* If awaiting assessor decision */}
                        {isAwaitingAssessor && (
                          <button
                            type="button"
                            onClick={() => {
                              setDecisionQuote(q);
                              setDecisionAction('confirm');
                              setConfirmedDate(q.preferredSlotDate || '');
                              setConfirmedTime(q.preferredSlotTime || '09:30 AM');
                              setCounterDate(q.preferredSlotDate || '');
                              setCounterTime('10:00 AM');
                              setAssessorNotes('');
                            }}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold shadow-xs transition inline-flex items-center space-x-1 animate-pulse"
                            title="Client accepted price and requested slot. Click to confirm, counter, or decline."
                          >
                            <CalendarCheck className="w-3.5 h-3.5" />
                            <span>Review Request</span>
                          </button>
                        )}

                        <button
                          onClick={() => setEmailModalQuote(q)}
                          className="px-2 py-1 text-blue-700 hover:bg-blue-50 rounded text-xs font-medium border border-blue-200 transition inline-flex items-center space-x-1"
                          title="Direct Email about this Quote"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email</span>
                        </button>

                        <button
                          onClick={() => setSelectedQuote(q)}
                          className="px-2 py-1 text-slate-700 hover:bg-slate-100 rounded text-xs font-medium border border-slate-200 transition inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>

                        {q.status === 'Draft' && (
                          <button
                            onClick={() => handleSendQuote(q.id)}
                            className="px-2 py-1 text-blue-700 hover:bg-blue-50 rounded text-xs font-medium border border-blue-200 transition inline-flex items-center space-x-1"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assessor Decision Modal (Confirm, Counter, or Decline) */}
      {decisionQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <form
            onSubmit={handleDecisionSubmit}
            className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 space-y-4 my-6 animate-in fade-in zoom-in-95"
          >
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Assessor Booking Decision • {decisionQuote.quoteNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  Client: <strong className="text-slate-800">{decisionQuote.clientName}</strong> • Premises:{' '}
                  <strong className="text-slate-800">{decisionQuote.premisesName}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDecisionQuote(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Client Requested Slot Info */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1 text-xs">
              <div className="font-bold text-blue-900 flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-blue-700" />
                <span>Client Preferred Visit Slot:</span>
              </div>
              <div className="text-blue-950 text-sm font-semibold">
                {decisionQuote.preferredSlotDate || 'Flexible'} at {decisionQuote.preferredSlotTime || '09:30 AM'}
              </div>
              {decisionQuote.preferredSlotNotes && (
                <div className="text-blue-800 italic">"{decisionQuote.preferredSlotNotes}"</div>
              )}
            </div>

            {/* 3 Decision Choices */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDecisionAction('confirm')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                  decisionAction === 'confirm'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-xs">Accept & Confirm</span>
              </button>

              <button
                type="button"
                onClick={() => setDecisionAction('counter')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                  decisionAction === 'counter'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-xs">Recommend Date</span>
              </button>

              <button
                type="button"
                onClick={() => setDecisionAction('decline')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                  decisionAction === 'decline'
                    ? 'border-rose-600 bg-rose-50 text-rose-900 font-bold shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <XCircle className="w-5 h-5 text-rose-600" />
                <span className="text-xs">Decline / Reject</span>
              </button>
            </div>

            {/* Dynamic Decision Controls */}
            {decisionAction === 'confirm' && (
              <div className="space-y-3 text-xs bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-200">
                <div className="font-bold text-emerald-900 text-xs">
                  Confirm Assessment Booking & Unlock Pre-Assessment Form
                </div>
                <p className="text-[11px] text-emerald-800">
                  Accepting confirms the booking slot in your calendar, automatically produces the VAT commercial
                  invoice, and unlocks the full Pre-Assessment Questionnaire and Service Agreement in the Client Portal.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Confirmed Date *</label>
                    <input
                      type="date"
                      required
                      value={confirmedDate}
                      onChange={(e) => setConfirmedDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Confirmed Time</label>
                    <select
                      value={confirmedTime}
                      onChange={(e) => setConfirmedTime(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                    >
                      <option value="09:30 AM">09:30 AM (Morning Slot)</option>
                      <option value="11:30 AM">11:30 AM (Midday Slot)</option>
                      <option value="02:00 PM">02:00 PM (Afternoon Slot)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {decisionAction === 'counter' && (
              <div className="space-y-3 text-xs bg-blue-50/40 p-3.5 rounded-xl border border-blue-200">
                <div className="font-bold text-blue-900 text-xs">Propose Alternative Assessment Date</div>
                <p className="text-[11px] text-blue-800">
                  Recommend a suitable alternative date and time based on your regional inspection schedule.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Proposed Alternative Date *</label>
                    <input
                      type="date"
                      required
                      value={counterDate}
                      onChange={(e) => setCounterDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Proposed Time</label>
                    <select
                      value={counterTime}
                      onChange={(e) => setCounterTime(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                    >
                      <option value="09:30 AM">09:30 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {decisionAction === 'decline' && (
              <div className="space-y-3 text-xs bg-rose-50/40 p-3.5 rounded-xl border border-rose-200">
                <div className="font-bold text-rose-900 text-xs">Decline / Reject Assessment Work</div>
                <p className="text-[11px] text-rose-800">
                  If the premises is outside your coverage area, fully booked, or outside your specialist non-sleeping
                  scope, you can decline the instruction. An official explanation will be sent to the client.
                </p>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Decline Reason *</label>
                  <select
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                  >
                    <option value="Premises outside current regional coverage area">
                      Premises outside current regional coverage area
                    </option>
                    <option value="High-risk or sleeping risk premises outside standard commercial scope">
                      High-risk or sleeping risk premises outside standard commercial scope
                    </option>
                    <option value="Assessor fully booked for next 6-8 weeks">
                      Assessor fully booked for next 6-8 weeks
                    </option>
                    <option value="Complex multi-stair high-rise building requiring specialized Type 4 survey">
                      Complex multi-stair high-rise building requiring specialized Type 4 survey
                    </option>
                    <option value="Client access constraints unachievable">Client access constraints unachievable</option>
                  </select>
                </div>
              </div>
            )}

            {/* Notes to Client */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-xs">
                Assessor Notes / Message to Client
              </label>
              <textarea
                rows={3}
                value={assessorNotes}
                onChange={(e) => setAssessorNotes(e.target.value)}
                placeholder="Optional notes or instructions pushed directly to client..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDecisionQuote(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessingDecision}
                className={`px-5 py-2 rounded-lg text-xs font-bold text-white shadow-xs transition ${
                  decisionAction === 'confirm'
                    ? 'bg-emerald-700 hover:bg-emerald-800'
                    : decisionAction === 'counter'
                    ? 'bg-blue-700 hover:bg-blue-800'
                    : 'bg-rose-700 hover:bg-rose-800'
                }`}
              >
                {isProcessingDecision
                  ? 'Processing...'
                  : decisionAction === 'confirm'
                  ? 'Confirm Booking & Push to Client'
                  : decisionAction === 'counter'
                  ? 'Send Alternative Date to Client'
                  : 'Confirm Decline of Work'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quote Preview / PDF Document View Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden my-6">
            {/* Modal Bar */}
            <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-700" />
                <span className="font-bold text-xs text-slate-800">
                  Quotation Preview • {selectedQuote.quoteNumber}
                </span>
                <StatusBadge status={selectedQuote.status} size="sm" />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setEmailModalQuote(selectedQuote)}
                  className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-medium text-slate-700 flex items-center space-x-1"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Email Client</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-medium text-slate-700 flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setSelectedQuote(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Formal Quotation Document */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-800 text-xs font-sans">
              {/* Letterhead */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    AURELIUS COMMERCIAL FIRE SAFETY
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Life Safety Fire Risk Assessment & Compliance Consultancy
                    <br />
                    Charlie Hughes • Non-Sleeping Commercial Premises Specialist
                    <br />
                    Liverpool • Wirral • Merseyside
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-slate-900">
                    {selectedQuote.quoteNumber}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Date: {selectedQuote.date || new Date().toLocaleDateString('en-GB')}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Valid Until: {selectedQuote.validUntil}
                  </div>
                </div>
              </div>

              {/* Client & Premises Details */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-600 tracking-wider">
                    Client Organisation:
                  </div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {selectedQuote.clientName}
                  </div>
                  <div className="text-slate-600 mt-1">
                    Responsible Person / Duty Holder
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-600 tracking-wider">
                    Premises to be Assessed:
                  </div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {selectedQuote.premisesName}
                  </div>
                  <div className="text-slate-600 mt-1">
                    {selectedQuote.premisesAddress}
                  </div>
                </div>
              </div>

              {/* Preferred / Confirmed Slot Box */}
              {selectedQuote.preferredSlotDate && (
                <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-blue-900 text-xs">
                      {selectedQuote.status === 'Assessor Confirmed'
                        ? 'Confirmed Assessment Visit Date'
                        : 'Client Preferred Visit Slot'}
                    </div>
                    <div className="text-blue-950 font-semibold mt-0.5">
                      {selectedQuote.preferredSlotDate} at {selectedQuote.preferredSlotTime || '09:30 AM'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDecisionQuote(selectedQuote);
                      setDecisionAction('confirm');
                      setConfirmedDate(selectedQuote.preferredSlotDate || '');
                      setConfirmedTime(selectedQuote.preferredSlotTime || '09:30 AM');
                    }}
                    className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    Adjust / Confirm Slot
                  </button>
                </div>
              )}

              {/* Scope */}
              <div className="space-y-1">
                <div className="font-bold text-slate-900 text-xs">Assessment Scope:</div>
                <p className="text-slate-600 leading-relaxed">{selectedQuote.scope}</p>
              </div>

              {/* Itemised Table */}
              <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Fee</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedQuote.items.map((item, index) => (
                    <tr key={index}>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{item.description}</td>
                      <td className="py-2.5 px-3 text-center">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono">£{item.unitPrice.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold">
                        £{item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 text-right">
                  <div className="flex justify-between py-1 text-slate-600 border-b border-slate-100">
                    <span>Net Subtotal:</span>
                    <span className="font-mono">£{selectedQuote.netAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-emerald-700 border-b border-slate-100">
                    <span>VAT (0% - Non VAT Registered):</span>
                    <span className="font-mono">£0.00</span>
                  </div>
                  <div className="flex justify-between py-1 font-bold text-slate-900 text-sm">
                    <span>Total Fixed Fee:</span>
                    <span className="font-mono text-base">£{selectedQuote.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Statutory Statement & Legal Terms */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-[11px] text-slate-600 leading-relaxed">
                <div className="font-bold text-slate-900 text-xs">
                  Statutory Responsibility & Commercial Terms:
                </div>
                <p>{selectedQuote.statutoryStatement}</p>
                <p>{selectedQuote.termsAndConditions}</p>
              </div>

              {/* Acceptance / Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <div>
                  {selectedQuote.status === 'Assessor Confirmed' && (
                    <span className="text-emerald-700 font-semibold flex items-center space-x-1 text-xs">
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirmed by Assessor Charlie Hughes</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedQuote(null)}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-medium border border-slate-200 transition"
                  >
                    Back to Quotes
                  </button>
                  {selectedQuote.status === 'Draft' && (
                    <button
                      onClick={() => handleSendQuote(selectedQuote.id)}
                      className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center space-x-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Quote to Client</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Quote Modal (with Auto-Add Client and Premises) */}
      {isCreatingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateQuoteSubmit}
            className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 border border-slate-200 space-y-4 my-8"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Generate New Quotation</h3>
                <p className="text-xs text-slate-500">
                  Select an existing client or automatically register client & premises on quote creation
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toggle Mode */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setNewQuoteMode('existing')}
                className={`flex-1 py-1.5 rounded-lg text-center transition ${
                  newQuoteMode === 'existing'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Select Existing Client & Premises
              </button>
              <button
                type="button"
                onClick={() => setNewQuoteMode('new_client_premises')}
                className={`flex-1 py-1.5 rounded-lg text-center transition flex items-center justify-center space-x-1 ${
                  newQuoteMode === 'new_client_premises'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Auto-Add New Client & Premises</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {newQuoteMode === 'existing' ? (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Client Organisation *</label>
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
                          {c.companyName} ({c.contactName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Premises to Assess *</label>
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
                            {p.premisesName} ({p.addressLine1}, {p.postcode})
                          </option>
                        ))}
                    </select>
                  </div>
                </>
              ) : (
                /* Auto-Add New Client & Premises form fields */
                <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200 space-y-3">
                  <div className="font-bold text-blue-900 text-xs flex items-center space-x-1.5">
                    <Building className="w-4 h-4 text-blue-700" />
                    <span>New Client & Premises Details (Auto-Added to CRM)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
                      <input
                        type="text"
                        required
                        value={newCompanyName}
                        onChange={(e) => setNewCompanyName(e.target.value)}
                        placeholder="e.g. Acme Commercial Ltd"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Contact Person *</label>
                      <input
                        type="text"
                        required
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="e.g. sarah@acme.co.uk"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Telephone</label>
                      <input
                        type="tel"
                        value={newTelephone}
                        onChange={(e) => setNewTelephone(e.target.value)}
                        placeholder="e.g. 0151 400 1234"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="border-t border-blue-200/60 pt-2 grid grid-cols-3 gap-2.5">
                    <div className="col-span-3">
                      <label className="block font-semibold text-slate-700 mb-1">Premises Name *</label>
                      <input
                        type="text"
                        required
                        value={newPremisesName}
                        onChange={(e) => setNewPremisesName(e.target.value)}
                        placeholder="e.g. Acme Head Office & Warehouse"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
                      <input
                        type="text"
                        value={newPremisesAddress}
                        onChange={(e) => setNewPremisesAddress(e.target.value)}
                        placeholder="e.g. 14 Hamilton Square, Birkenhead"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Postcode</label>
                      <input
                        type="text"
                        value={newPostcode}
                        onChange={(e) => setNewPostcode(e.target.value)}
                        placeholder="e.g. CH41 6AU"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Itemised Scope & Services
                </label>
                <div className="space-y-2">
                  {formItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-12 gap-2 items-center"
                    >
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...formItems];
                          updated[idx].description = e.target.value;
                          setFormItems(updated);
                        }}
                        className="col-span-8 bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-800"
                      />
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const updated = [...formItems];
                          const price = Number(e.target.value);
                          updated[idx].unitPrice = price;
                          updated[idx].total = price * updated[idx].quantity;
                          setFormItems(updated);
                        }}
                        className="col-span-3 bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-800 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (formItems.length > 1) {
                            setFormItems(formItems.filter((_, i) => i !== idx));
                          }
                        }}
                        className="col-span-1 text-slate-400 hover:text-rose-600 text-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormItems([
                        ...formItems,
                        {
                          id: `item_${Date.now()}`,
                          description: 'Additional building survey add-on',
                          quantity: 1,
                          unitPrice: 95,
                          total: 95,
                        },
                      ]);
                    }}
                    className="text-xs text-blue-700 hover:underline font-medium"
                  >
                    + Add line item
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Validity Period (Days)
                  </label>
                  <input
                    type="number"
                    value={formValidDays}
                    onChange={(e) => setFormValidDays(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Calculated Total
                  </label>
                  <div className="p-2 bg-slate-100 rounded-lg font-bold text-slate-900 text-sm">
                    £
                    {formItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}{' '}
                    <span className="text-xs font-normal text-emerald-600">(Zero VAT)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreatingModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
              >
                Create Quotation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Direct Email Modal */}
      {emailModalQuote && (
        <DirectEmailModal
          isOpen={!!emailModalQuote}
          onClose={() => setEmailModalQuote(null)}
          defaultRecipientEmail={
            allClients.find((c) => c.id === emailModalQuote.clientId)?.email || 'client@example.co.uk'
          }
          defaultRecipientName={emailModalQuote.clientName}
          clientId={emailModalQuote.clientId}
          premisesId={emailModalQuote.premisesId}
          quoteId={emailModalQuote.id}
          defaultSubject={`Update regarding Fire Risk Assessment Quote • ${emailModalQuote.quoteNumber}`}
          defaultMessage={`Dear ${emailModalQuote.clientName || 'Client'},\n\nI am contacting you regarding your Fire Risk Assessment Quote ${emailModalQuote.quoteNumber} for ${emailModalQuote.premisesName}.\n\nKind regards,\nCharlie Hughes\nAurelius Commercial Fire Safety`}
          onSuccess={() => setEmailModalQuote(null)}
        />
      )}
    </div>
  );
};

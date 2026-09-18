import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Invoice, PaymentRecord, BusinessSettings } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  CreditCard,
  Search,
  CheckCircle,
  Eye,
  Printer,
  X,
  RotateCcw,
  FileText,
  Building,
  Check,
  Settings,
  Zap,
  Key,
  Lock,
  EyeOff,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const InvoicesPayments: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Preview Modal
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Refund Modal
  const [refundPaymentRecord, setRefundPaymentRecord] = useState<PaymentRecord | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);

  // Stripe Gateway Status & Quick Modal
  const [stripeStatus, setStripeStatus] = useState<{
    isConfigured: boolean;
    mode: 'test' | 'live';
    publishableKey: string;
    hasSecretKey: boolean;
    hasWebhookSecret: boolean;
    statementDescriptor: string;
    autoReceipts: boolean;
    currency: string;
  } | null>(null);

  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const [modalSettings, setModalSettings] = useState<BusinessSettings | null>(null);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [isSavingStripe, setIsSavingStripe] = useState(false);
  const [isTestingStripe, setIsTestingStripe] = useState(false);
  const [stripeTestResult, setStripeTestResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    loadInvoices();
    loadStripeGatewayStatus();
  }, []);

  const loadInvoices = async () => {
    const list = await api.getInvoices();
    setInvoices(list);
  };

  const loadStripeGatewayStatus = async () => {
    try {
      const status = await api.getStripeGatewayStatus();
      setStripeStatus(status);
    } catch (err) {
      console.error('Failed to load Stripe gateway status:', err);
    }
  };

  const handleOpenStripeModal = async () => {
    try {
      const current = await api.getSettings();
      setModalSettings(current);
      setStripeTestResult(null);
      setIsStripeModalOpen(true);
    } catch (err) {
      console.error('Failed to load settings for Stripe modal:', err);
    }
  };

  const handleSaveStripeModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalSettings) return;
    setIsSavingStripe(true);
    try {
      const updated = await api.updateSettings(modalSettings);
      setModalSettings(updated);
      await loadStripeGatewayStatus();
      setIsStripeModalOpen(false);
    } catch (err) {
      console.error('Failed to save Stripe settings from modal:', err);
    } finally {
      setIsSavingStripe(false);
    }
  };

  const handleTestStripeInModal = async () => {
    if (!modalSettings) return;
    setIsTestingStripe(true);
    setStripeTestResult(null);
    try {
      const res = await api.testStripeConnection({
        secretKey: modalSettings.stripeSecretKey,
      });
      setStripeTestResult({
        success: res.success,
        message: res.message,
        error: res.error,
      });
    } catch (err: any) {
      setStripeTestResult({
        success: false,
        error: err.message || 'Connection test failed.',
      });
    } finally {
      setIsTestingStripe(false);
    }
  };

  const handleOpenDetail = async (inv: Invoice) => {
    try {
      const full = await api.getInvoice(inv.id);
      setSelectedInvoice(full);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecordOfflinePayment = async (invoice: Invoice) => {
    try {
      await api.confirmPayment({
        paymentIntentId: `bacs_${Date.now()}`,
        clientId: invoice.clientId,
        amount: invoice.totalAmount,
        invoiceId: invoice.id,
        quoteId: invoice.quoteId,
        paymentMethod: 'bank_transfer',
      });
      await loadInvoices();
      if (selectedInvoice?.id === invoice.id) {
        handleOpenDetail(invoice);
      }
    } catch (err) {
      console.error('Failed to record payment:', err);
    }
  };

  const handleProcessRefund = async () => {
    if (!refundPaymentRecord) return;
    setIsRefunding(true);
    try {
      await api.refundPayment(refundPaymentRecord.id, refundReason || 'Assessor refund requested');
      setRefundPaymentRecord(null);
      setRefundReason('');
      await loadInvoices();
      if (selectedInvoice) {
        handleOpenDetail(selectedInvoice);
      }
    } catch (err) {
      console.error('Failed to process refund:', err);
    } finally {
      setIsRefunding(false);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.premisesName?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus !== 'ALL' && inv.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Invoicing & Stripe Payment Operations</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            VAT compliance invoices, online Stripe card processing, BACS bank transfers, and refund management
          </p>
        </div>

        {/* Stripe Gateway Quick Action */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleOpenStripeModal}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs transition flex items-center space-x-1.5"
          >
            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
            <span>Configure Stripe Details</span>
          </button>
        </div>
      </div>

      {/* Stripe Gateway Status Banner */}
      <div
        className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          stripeStatus?.isConfigured
            ? stripeStatus.mode === 'live'
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-blue-50/70 border-blue-200 text-blue-950'
            : 'bg-amber-50/70 border-amber-200 text-amber-950'
        }`}
      >
        <div className="flex items-start sm:items-center space-x-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              stripeStatus?.isConfigured
                ? stripeStatus.mode === 'live'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-blue-600 text-white'
                : 'bg-amber-500 text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold">
                {stripeStatus?.isConfigured
                  ? `Stripe Gateway Active (${stripeStatus.mode === 'live' ? 'Live Production Mode' : 'Test Mode'})`
                  : 'Stripe Sandbox Simulator Active (Details Pending)'}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  stripeStatus?.isConfigured
                    ? stripeStatus.mode === 'live'
                      ? 'bg-emerald-200 text-emerald-800'
                      : 'bg-blue-200 text-blue-800'
                    : 'bg-amber-200 text-amber-800'
                }`}
              >
                {stripeStatus?.isConfigured ? stripeStatus.mode : 'Sandbox'}
              </span>
            </div>
            <p className="text-[11px] opacity-90 mt-0.5">
              {stripeStatus?.isConfigured
                ? `Publishable key ${stripeStatus.publishableKey || 'registered'}. Card payments process automatically via Stripe.`
                : 'You can add your Stripe keys anytime in CRM Settings. Customers can safely accept quotes and simulate card payments right now.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenStripeModal}
          className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-800 text-xs font-semibold shrink-0 transition flex items-center justify-center space-x-1"
        >
          <Settings className="w-3.5 h-3.5 text-slate-600" />
          <span>{stripeStatus?.isConfigured ? 'Manage Stripe Keys' : 'Add Stripe Keys'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search invoice number, client, premises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto">
          {['ALL', 'Unpaid', 'Paid', 'Refunded', 'Overdue'].map((st) => (
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

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <EmptyState
            title="No outstanding invoices"
            description="No invoices match the selected filter criteria."
            icon={CreditCard}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Invoice Ref</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Premises</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {inv.clientName || 'Client Organisation'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{inv.premisesName}</td>
                    <td className="py-3.5 px-4 text-slate-500">{inv.dueDate}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                      £{inv.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={inv.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenDetail(inv)}
                        className="px-2 py-1 text-slate-700 hover:bg-slate-100 rounded text-xs font-medium border border-slate-200 transition inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      {inv.status !== 'Paid' && (
                        <button
                          onClick={() => handleRecordOfflinePayment(inv)}
                          className="px-2 py-1 text-emerald-700 hover:bg-emerald-50 rounded text-xs font-medium border border-emerald-200 transition inline-flex items-center space-x-1"
                          title="Record BACS / Bank transfer received"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Record BACS</span>
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

      {/* Invoice Detail / Tax Invoice View Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-xs text-slate-800">
                  Tax Invoice • {selectedInvoice.invoiceNumber}
                </span>
                <StatusBadge status={selectedInvoice.status} size="sm" />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-medium text-slate-700 flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 text-slate-800 text-xs font-sans">
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    AURELIUS COMMERCIAL FIRE SAFETY
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Charlie Hughes • Non-Sleeping Commercial Premises Specialist
                    <br />
                    VAT Status: Small Business / Not VAT Registered (Zero VAT)
                    <br />
                    charlie.a.s.hughes@gmail.com • 020 8050 4912
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-700">COMMERCIAL INVOICE</div>
                  <div className="text-xs font-mono font-semibold text-slate-800 mt-1">
                    Invoice No: {selectedInvoice.invoiceNumber}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Issue Date: {new Date(selectedInvoice.createdAt).toLocaleDateString('en-GB')}
                    <br />
                    Due Date: {selectedInvoice.dueDate}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 block mb-1">
                    Billed To:
                  </span>
                  <div className="font-semibold text-slate-900 text-sm">
                    {selectedInvoice.client?.companyName || selectedInvoice.clientName}
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    Attn: {selectedInvoice.client?.contactName}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    {selectedInvoice.client?.billingAddress}
                  </div>
                </div>
                <div>
                  <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 block mb-1">
                    Assessed Location:
                  </span>
                  <div className="font-semibold text-slate-900 text-sm">
                    {selectedInvoice.premises?.premisesName || selectedInvoice.premisesName}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    {selectedInvoice.premises?.addressLine1}, {selectedInvoice.premises?.postcode}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-center w-16">Qty</th>
                    <th className="p-3 text-right w-24">Unit Rate</th>
                    <th className="p-3 text-right w-24">Net Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.items?.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="p-3 font-medium text-slate-900">{item.description}</td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right font-mono">£{item.unitPrice.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono font-semibold">
                        £{item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 border-t border-slate-200 pt-3">
                  <div className="flex justify-between text-slate-600">
                    <span>Net Assessment Fee:</span>
                    <span className="font-mono">£{selectedInvoice.netAmount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>VAT (Zero-Rated / No VAT):</span>
                    <span className="font-mono">£0.00</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-1.5">
                    <span>Total Due (GBP):</span>
                    <span className="font-mono text-emerald-700">
                      £{selectedInvoice.totalAmount?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Details & Bank Transfer */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-[11px] text-slate-600">
                <div className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-700" />
                  <span>Direct Bank Transfer (BACS) Details:</span>
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Bank:</span> Barclays Bank UK
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Sort Code:</span> 20-00-00
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Account No:</span> 83920194
                  </div>
                </div>
                <div className="text-[10px] text-slate-500">
                  Please quote invoice reference <span className="font-mono font-bold text-slate-800">{selectedInvoice.invoiceNumber}</span> on all payments.
                </div>
              </div>

              {/* Payment Records on this Invoice */}
              {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Recorded Payments:
                  </h4>
                  {selectedInvoice.payments.map((p: PaymentRecord) => (
                    <div
                      key={p.id}
                      className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-emerald-900">
                          £{p.amount.toFixed(2)} via {p.paymentMethod}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-mono">
                          Ref: {p.stripePaymentIntentId || p.id} • {new Date(p.createdAt).toLocaleDateString('en-GB')}
                        </div>
                      </div>
                      {p.status === 'succeeded' && (
                        <button
                          onClick={() => setRefundPaymentRecord(p)}
                          className="px-2 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-100 rounded border border-rose-200 flex items-center space-x-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Refund</span>
                        </button>
                      )}
                      {p.status === 'refunded' && (
                        <span className="text-xs font-semibold text-rose-700">Refunded</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
              >
                Back to Invoices
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundPaymentRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Process Payment Refund</h3>
            <p className="text-xs text-slate-600">
              Refund payment of <span className="font-bold">£{refundPaymentRecord.amount.toFixed(2)}</span>. This will update the invoice to refunded status and log the audit entry.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Refund *
              </label>
              <textarea
                rows={2}
                required
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="e.g. Assessment cancelled by mutual agreement within notice period"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setRefundPaymentRecord(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessRefund}
                disabled={isRefunding}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs disabled:opacity-50"
              >
                {isRefunding ? 'Processing...' : 'Confirm Refund'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stripe Quick Configuration Modal */}
      {isStripeModalOpen && modalSettings && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Stripe Payment Gateway Details</h3>
                  <p className="text-[11px] text-slate-500">
                    Add or update your Stripe credentials directly within your CRM
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStripeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStripeModal} className="space-y-4 text-xs">
              {/* Environment Toggle */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">Environment Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModalSettings({ ...modalSettings, stripeMode: 'test' })}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition text-left ${
                      modalSettings.stripeMode !== 'live'
                        ? 'bg-blue-50 border-blue-400 text-blue-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Test Mode (pk_test / sk_test)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalSettings({ ...modalSettings, stripeMode: 'live' })}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition text-left ${
                      modalSettings.stripeMode === 'live'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Live Production Mode
                  </button>
                </div>
              </div>

              {/* Publishable Key */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1 flex items-center space-x-1">
                  <Key className="w-3.5 h-3.5 text-blue-600" />
                  <span>Stripe Publishable Key</span>
                </label>
                <input
                  type="text"
                  placeholder={modalSettings.stripeMode === 'live' ? 'pk_live_...' : 'pk_test_...'}
                  value={modalSettings.stripePublishableKey || ''}
                  onChange={(e) =>
                    setModalSettings({ ...modalSettings, stripePublishableKey: e.target.value.trim() })
                  }
                  className="w-full font-mono text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Secret Key */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1 flex items-center space-x-1">
                  <Lock className="w-3.5 h-3.5 text-rose-600" />
                  <span>Stripe Secret Key</span>
                </label>
                <div className="relative">
                  <input
                    type={showSecretKey ? 'text' : 'password'}
                    placeholder={modalSettings.stripeMode === 'live' ? 'sk_live_...' : 'sk_test_...'}
                    value={modalSettings.stripeSecretKey || ''}
                    onChange={(e) =>
                      setModalSettings({ ...modalSettings, stripeSecretKey: e.target.value.trim() })
                    }
                    className="w-full font-mono text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 pr-10 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Statement Descriptor */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Statement Descriptor (Card Bill Line)
                </label>
                <input
                  type="text"
                  maxLength={22}
                  placeholder="AURELIUS FIRE"
                  value={modalSettings.stripeStatementDescriptor || 'AURELIUS FIRE'}
                  onChange={(e) =>
                    setModalSettings({ ...modalSettings, stripeStatementDescriptor: e.target.value })
                  }
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 uppercase"
                />
              </div>

              {/* Webhook Secret */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Webhook Secret (whsec_..., optional)
                </label>
                <input
                  type="password"
                  placeholder="whsec_..."
                  value={modalSettings.stripeWebhookSecret || ''}
                  onChange={(e) =>
                    setModalSettings({ ...modalSettings, stripeWebhookSecret: e.target.value.trim() })
                  }
                  className="w-full font-mono text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              {/* Test Result Message */}
              {stripeTestResult && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-start space-x-2 ${
                    stripeTestResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  {stripeTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <p>{stripeTestResult.message || stripeTestResult.error}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleTestStripeInModal}
                  disabled={isTestingStripe}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingStripe ? 'animate-spin' : ''}`} />
                  <span>{isTestingStripe ? 'Testing...' : 'Test Connection'}</span>
                </button>

                <div className="flex items-center space-x-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsStripeModalOpen(false)}
                    className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingStripe}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSavingStripe ? 'Saving...' : 'Save Stripe Keys'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

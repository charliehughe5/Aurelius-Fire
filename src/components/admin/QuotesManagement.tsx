import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Quote, Client, Premises, QuoteItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
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
} from 'lucide-react';

export const QuotesManagement: React.FC = () => {
  const { allClients } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [premisesList, setPremisesList] = useState<Premises[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Preview / Send Modal
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isCreatingModalOpen, setIsCreatingModalOpen] = useState(false);

  // New quote form state
  const [formClientId, setFormClientId] = useState(allClients[0]?.id || '');
  const [formPremisesId, setFormPremisesId] = useState('');
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
        setSelectedQuote((prev) => (prev ? { ...prev, status: 'Accepted' } : null));
      }
    } catch (err) {
      console.error('Failed to accept quote:', err);
    }
  };

  const handleDeclineQuote = async (id: string) => {
    try {
      await api.declineQuote(id);
      await loadQuotes();
      if (selectedQuote?.id === id) {
        setSelectedQuote((prev) => (prev ? { ...prev, status: 'Declined' } : null));
      }
    } catch (err) {
      console.error('Failed to decline quote:', err);
    }
  };

  const handleCreateQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClientId || !formPremisesId) {
      alert('Please select both a client and a premises.');
      return;
    }

    const net = formItems.reduce((sum, item) => sum + item.total, 0);
    const vat = net * 0.2;
    const total = net + vat;

    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + formValidDays);

    try {
      await api.createQuote({
        clientId: formClientId,
        premisesId: formPremisesId,
        items: formItems,
        netAmount: net,
        vatRate: 20,
        vatAmount: vat,
        totalAmount: total,
        validUntil: validUntilDate.toISOString().split('T')[0],
        termsAndConditions:
          'Payment required prior to attendance or release of formal documentation. Quote valid for 30 calendar days.',
        statutoryStatement:
          'In accordance with the Regulatory Reform (Fire Safety) Order 2005, the client remains the designated Responsible Person.',
      });
      setIsCreatingModalOpen(false);
      await loadQuotes();
    } catch (err) {
      console.error('Failed to create quote:', err);
    }
  };

  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.premisesName?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus !== 'ALL' && q.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quoting Engine & Proposals</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Formal commercial proposals, PAS 79 itemised scopes, statutory terms and automated invoice conversion
          </p>
        </div>
        <button
          onClick={() => {
            setFormClientId(allClients[0]?.id || '');
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

        <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'Draft', 'Sent', 'Accepted', 'Declined'].map((st) => (
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
                  <th className="py-3 px-4">Net / VAT</th>
                  <th className="py-3 px-4">Total (GBP)</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                      {q.quoteNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {q.clientName || 'Unknown Client'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="font-medium text-slate-900">{q.premisesName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      £{q.netAmount.toFixed(2)} + £{q.vatAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                      £{q.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{q.validUntil}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={q.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
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
                      {q.status === 'Sent' && (
                        <button
                          onClick={() => handleAcceptQuote(q.id)}
                          className="px-2 py-1 text-emerald-700 hover:bg-emerald-50 rounded text-xs font-medium border border-emerald-200 transition inline-flex items-center space-x-1"
                          title="Record acceptance and auto-create Invoice"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Accept</span>
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
                    APEX FIRE SAFETY UK
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Life Safety Fire Risk Assessment & Compliance Engineering
                    <br />
                    120 Moorgate, London, EC2M 6UR
                    <br />
                    operations@apexfire.co.uk • 020 7946 0199
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-700">FORMAL QUOTATION</div>
                  <div className="text-xs font-mono font-semibold text-slate-800 mt-1">
                    Ref: {selectedQuote.quoteNumber}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Date: {new Date(selectedQuote.createdAt).toLocaleDateString('en-GB')}
                    <br />
                    Valid Until: {selectedQuote.validUntil}
                  </div>
                </div>
              </div>

              {/* Client & Premises Details Box */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 block mb-1">
                    Client Organisation:
                  </span>
                  <div className="font-semibold text-slate-900 text-sm">
                    {selectedQuote.clientName}
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    Designated Responsible Person / Contact
                  </div>
                </div>
                <div>
                  <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 block mb-1">
                    Assessed Premises:
                  </span>
                  <div className="font-semibold text-slate-900 text-sm">
                    {selectedQuote.premisesName}
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    {selectedQuote.premisesAddress}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Scope Description</th>
                      <th className="p-3 text-center w-16">Qty</th>
                      <th className="p-3 text-right w-24">Unit Rate</th>
                      <th className="p-3 text-right w-24">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedQuote.items.map((item, idx) => (
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
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 border-t border-slate-200 pt-3">
                  <div className="flex justify-between text-slate-600">
                    <span>Net Subtotal:</span>
                    <span className="font-mono">£{selectedQuote.netAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>VAT ({selectedQuote.vatRate}%):</span>
                    <span className="font-mono">£{selectedQuote.vatAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-1.5">
                    <span>Total (inc. VAT):</span>
                    <span className="font-mono text-blue-700">
                      £{selectedQuote.totalAmount.toFixed(2)}
                    </span>
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
                  {selectedQuote.status === 'Accepted' && (
                    <span className="text-emerald-700 font-semibold flex items-center space-x-1 text-xs">
                      <CheckCircle className="w-4 h-4" />
                      <span>
                        Accepted by {selectedQuote.acceptedByName || 'Client'} on{' '}
                        {selectedQuote.acceptedAt ? new Date(selectedQuote.acceptedAt).toLocaleDateString('en-GB') : 'recently'}
                      </span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {selectedQuote.status === 'Draft' && (
                    <button
                      onClick={() => handleSendQuote(selectedQuote.id)}
                      className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center space-x-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Quote to Client</span>
                    </button>
                  )}
                  {selectedQuote.status === 'Sent' && (
                    <button
                      onClick={() => handleAcceptQuote(selectedQuote.id)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center space-x-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Record Client Acceptance</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Quote Modal */}
      {isCreatingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateQuoteSubmit}
            className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 border border-slate-200 space-y-4 my-8"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Generate New Quotation</h3>
              <button
                type="button"
                onClick={() => setIsCreatingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
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
                    {(
                      formItems.reduce((sum, item) => sum + item.total, 0) * 1.2
                    ).toFixed(2)}{' '}
                    (inc. VAT)
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
    </div>
  );
};

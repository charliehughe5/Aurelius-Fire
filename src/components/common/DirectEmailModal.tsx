import React, { useState } from 'react';
import { api } from '../../api';
import { Mail, Send, X, CheckCircle, AlertCircle } from 'lucide-react';

interface DirectEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRecipientEmail?: string;
  defaultRecipientName?: string;
  defaultSubject?: string;
  defaultMessage?: string;
  clientId?: string;
  premisesId?: string;
  quoteId?: string;
  onSuccess?: () => void;
}

export const DirectEmailModal: React.FC<DirectEmailModalProps> = ({
  isOpen,
  onClose,
  defaultRecipientEmail = '',
  defaultRecipientName = '',
  defaultSubject = 'Fire Risk Assessment Communication • Aurelius Fire Safety',
  defaultMessage = '',
  clientId,
  premisesId,
  quoteId,
  onSuccess,
}) => {
  const [recipientEmail, setRecipientEmail] = useState(defaultRecipientEmail);
  const [recipientName, setRecipientName] = useState(defaultRecipientName);
  const [subject, setSubject] = useState(defaultSubject);
  const [messageBody, setMessageBody] = useState(defaultMessage);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleTemplateSelect = (template: string) => {
    if (template === 'date_confirm') {
      setSubject('Fire Risk Assessment Date Confirmation • Aurelius Fire Safety');
      setMessageBody(
        `Dear ${recipientName || 'Client'},\n\nI am writing to confirm your upcoming fire risk assessment appointment. The inspection will take between 1.5 to 3 hours.\n\nPlease ensure full access is available to all plant rooms, electrical cupboards, and escape routes. Please also ensure that statutory logbooks (fire alarm, emergency lighting, EICR, gas certificates) are accessible on site.\n\nShould you need to discuss any aspect of the visit, please do not hesitate to reply directly.\n\nKind regards,\nCharlie Hughes\nLead Fire Risk Assessor\nAurelius Fire Safety`
      );
    } else if (template === 'pre_assessment') {
      setSubject('Action Required: Complete Pre-Assessment Questionnaire & Paperwork');
      setMessageBody(
        `Dear ${recipientName || 'Client'},\n\nIn advance of your scheduled Fire Risk Assessment, please log in to your Client Portal to complete the comprehensive Pre-Assessment Questionnaire.\n\nProviding advance details regarding building layout, occupancy, and maintenance logbooks ensures your on-site assessment proceeds swiftly and thoroughly.\n\nThank you for your co-operation.\n\nKind regards,\nCharlie Hughes\nAurelius Fire Safety`
      );
    } else if (template === 'contract') {
      setSubject('Statutory Terms of Agreement & Service Contract Ready for Signature');
      setMessageBody(
        `Dear ${recipientName || 'Client'},\n\nYour Service Agreement Contract for the statutory Fire Risk Assessment has been generated and is ready for your digital signature in your Client Portal.\n\nPlease review and execute the agreement prior to the assessor's attendance.\n\nKind regards,\nAurelius Fire Safety`
      );
    } else if (template === 'lead_time') {
      setSubject('Quote Received • Assessment Scheduling & Diary Information');
      setMessageBody(
        `Dear ${recipientName || 'Client'},\n\nThank you for accepting your Fire Risk Assessment quote and submitting your preferred inspection slot.\n\nPlease note that it can take up to 4 weeks for our lead assessor to confirm regional logistics and schedule final dates. We will keep you closely informed via email.\n\nKind regards,\nAurelius Fire Safety Team`
      );
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !subject || !messageBody) return;

    setIsSending(true);
    setStatusMessage(null);

    try {
      const res = await api.sendDirectEmail({
        recipientEmail,
        recipientName,
        subject,
        messageBody,
        clientId,
        premisesId,
        quoteId,
      });

      setStatusMessage({ type: 'success', text: res.message || 'Email sent successfully!' });
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to dispatch email. Please try again.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 space-y-4 my-6 animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Direct Email Dispatch</h3>
              <p className="text-xs text-slate-500">Send an official communication recorded in the audit trail</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-3.5 text-xs">
          {/* Quick template buttons */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Insert Quick Template</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleTemplateSelect('date_confirm')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-medium transition"
              >
                📅 Confirm Visit Date
              </button>
              <button
                type="button"
                onClick={() => handleTemplateSelect('pre_assessment')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-medium transition"
              >
                📋 Pre-Assessment Form
              </button>
              <button
                type="button"
                onClick={() => handleTemplateSelect('contract')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-medium transition"
              >
                ✍️ Terms Agreement
              </button>
              <button
                type="button"
                onClick={() => handleTemplateSelect('lead_time')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-medium transition"
              >
                ⏳ 4-Week Schedule Notice
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Recipient Name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. John Smith"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Recipient Email *</label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="e.g. client@company.co.uk"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subject *</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Message Body *</label>
            <textarea
              rows={7}
              required
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder="Write your email message here..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-hidden font-sans text-xs leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-400">
              Dispatched via secure CRM mail gateway & logged to message thread
            </span>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Sending...' : 'Send Email'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

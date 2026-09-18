import React, { useState, useRef } from 'react';
import { Quote } from '../../types';
import { api } from '../../api';
import {
  FileText,
  CheckCircle,
  X,
  PenTool,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Building,
  User,
} from 'lucide-react';

interface ContractSigningModalProps {
  quote: Quote;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedQuote: Quote) => void;
}

export const ContractSigningModal: React.FC<ContractSigningModalProps> = ({
  quote,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [signerName, setSignerName] = useState(quote.clientName || '');
  const [signerPosition, setSignerPosition] = useState('Responsible Person / Dutyholder');
  const [typedSignature, setTypedSignature] = useState(quote.clientName || '');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Canvas drawing ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'type' | 'draw'>('draw');

  if (!isOpen) return null;

  // Drawing pad handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e3a8a';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setErrorMsg('You must agree to the statutory terms of service.');
      return;
    }

    let sigData = typedSignature;
    if (signatureMode === 'draw') {
      if (!hasDrawn) {
        setErrorMsg('Please provide a handwritten signature on the signature pad.');
        return;
      }
      sigData = canvasRef.current?.toDataURL() || typedSignature;
    } else {
      if (!typedSignature.trim()) {
        setErrorMsg('Please enter your full name as signature.');
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.signContract(quote.id, {
        signerName,
        signerPosition,
        signatureData: sigData,
      });

      onSuccess(res.quote);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit digital agreement signature.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 space-y-4 my-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Fire Safety Service Agreement & Terms of Engagement
              </h3>
              <p className="text-xs text-slate-500">
                Statutory Contract • Quote Ref: {quote.quoteNumber} • {quote.premisesName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Contract Text Scroll Box */}
        <div className="h-48 overflow-y-auto p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-3 leading-relaxed">
          <div className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1">
            TERMS OF ENGAGEMENT FOR TYPE 1 LIFE SAFETY FIRE RISK ASSESSMENT
          </div>

          <p>
            <strong>1. PARTIES & STATUTORY CONTEXT:</strong> This agreement is between Aurelius Commercial Fire
            Safety Ltd (Lead Assessor: Charlie Hughes, NEBOSH Fire Safety Certificate) and the Client named below.
            The assessment is conducted in accordance with the Regulatory Reform (Fire Safety) Order 2005 (England &
            Wales) and British Standard <strong>PAS 79-1:2020</strong>.
          </p>

          <p>
            <strong>2. SCOPE & DURATION OF INSPECTION:</strong>
            <br />
            • The on-site assessment consists of a Type 1 non-intrusive survey of all accessible communal areas, escape
            stairwells, plant rooms, electrical cupboards, risers, and external perimeters.
            <br />
            • <em>Duration:</em> The on-site inspection shall not exceed <strong>3 hours</strong>. A standard survey
            typically takes between 90 minutes and 3 hours depending on building layout.
          </p>

          <p>
            <strong>3. CLIENT & RESPONSIBLE PERSON OBLIGATIONS:</strong>
            <br />
            • <em>Full Access:</em> The client must ensure unhindered physical access to all required compartments.
            <br />
            • <em>Designated Escort:</em> A designated site manager or keyholder must accompany the assessor
            throughout the survey with all keys and fobs.
            <br />
            • <em>Paperwork on Arrival:</em> The client agrees to place all commissioning certificates, fire alarm
            logbooks, emergency lighting service sheets, and Electrical Installation Condition Reports (EICR) on the
            desk prior to inspection.
          </p>

          <p>
            <strong>4. LIMITATIONS & EXCLUSIONS:</strong>
            <br />
            The assessment does not involve destructive opening of ceilings, walls, or locked structural cavities. The
            duty of statutory compliance remains with the Responsible Person; appointing an assessor does not transfer
            legal liability under Article 5 of the Fire Safety Order.
          </p>

          <p>
            <strong>5. ACTION PLAN & REPORT DELIVERY:</strong>
            <br />
            Following site inspection, Aurelius Fire Safety will deliver a digital photographic Fire Risk Assessment
            with a prioritized statutory action plan (High, Medium, Low severity items) within 5 working days.
          </p>
        </div>

        {/* Signing Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Signer Full Name *</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="e.g. Charlie Hughes"
                  className="w-full pl-9 bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Signer Position / Title *</label>
              <div className="relative">
                <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={signerPosition}
                  onChange={(e) => setSignerPosition(e.target.value)}
                  placeholder="e.g. Managing Director / Dutyholder"
                  className="w-full pl-9 bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Signature Mode Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700">Digital Execution Signature *</label>
              <div className="flex space-x-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSignatureMode('draw')}
                  className={`px-2 py-0.5 rounded font-medium ${
                    signatureMode === 'draw'
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Draw Signature
                </button>
                <button
                  type="button"
                  onClick={() => setSignatureMode('type')}
                  className={`px-2 py-0.5 rounded font-medium ${
                    signatureMode === 'type'
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Type Signature
                </button>
              </div>
            </div>

            {signatureMode === 'draw' ? (
              <div className="space-y-1">
                <div className="border border-slate-300 rounded-xl bg-slate-50 relative overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={110}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-28 cursor-crosshair bg-white"
                  />
                  {!hasDrawn && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs">
                      Sign here using mouse, trackpad or touchscreen
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-[11px] text-slate-500 hover:text-rose-600 underline"
                  >
                    Clear Signature
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  required
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  placeholder="Type your official legal signature"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-serif italic text-base text-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-hidden"
                />
              </div>
            )}
          </div>

          {/* Declaration Checkbox */}
          <label className="flex items-start space-x-2.5 p-3 bg-blue-50/60 border border-blue-200 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              required
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 rounded text-blue-700 focus:ring-blue-600"
            />
            <span className="text-[11px] text-blue-900 leading-snug">
              <strong>Statutory Binding Declaration:</strong> I warrant that I have authority to execute this agreement
              on behalf of the client organisation, and agree that the site access requirements, maximum 3-hour visit
              scope, and commissioning paperwork obligations are accepted prior to assessor attendance.
            </span>
          </label>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="text-[11px] text-slate-400">
              Execution Date: {new Date().toLocaleDateString('en-GB')}
            </div>
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
                disabled={isSubmitting}
                className="px-5 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Signing...' : 'Execute Agreement & Sign'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

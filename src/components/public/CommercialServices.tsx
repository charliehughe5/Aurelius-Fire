import React from 'react';
import {
  Store,
  Briefcase,
  Building2,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileText,
  Clock,
  Flame,
} from 'lucide-react';

interface CommercialServicesProps {
  onGetQuoteClick: () => void;
}

export const CommercialServices: React.FC<CommercialServicesProps> = ({ onGetQuoteClick }) => {
  return (
    <div className="space-y-12 py-6">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-700 text-xs font-bold border border-amber-500/20">
          <Flame className="w-4 h-4 text-amber-600" />
          <span>Specialised Non-Sleeping Commercial Premises</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Commercial Fire Risk Assessments by Aurelius
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Under the Regulatory Reform (Fire Safety) Order 2005, every UK business with employees or visitors must have a
          documented, suitable, and sufficient Fire Risk Assessment. Aurelius provides comprehensive NEBOSH-style
          evaluations specifically designed for commercial operations.
        </p>
      </div>

      {/* Distinction Banner: No Sleeping Accommodation */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-3 text-amber-400 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>Understanding the Commercial vs. Sleeping Distinction (Level 4)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700 space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Commercial Non-Sleeping (Aurelius Core Scope)</span>
            </h3>
            <p className="leading-relaxed text-slate-300">
              Shops, boutiques, offices, hair salons, cafes, and light workshops. Occupants are awake and familiar with
              or guided toward clear escape routes.
            </p>
            <ul className="space-y-1.5 pt-2 text-slate-400">
              <li>✓ Non-destructive, visual assessment of all escape corridors & fire doors</li>
              <li>✓ Audit of fire alarms, emergency lighting, and extinguisher logs</li>
              <li>✓ Fast turnarounds with zero disruption to daily trading</li>
              <li>✓ Fixed, transparent pricing from £245 + VAT</li>
            </ul>
          </div>

          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700 space-y-2">
            <h3 className="font-bold text-amber-400 text-sm flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Residential Sleeping Accommodations (Level 4 Scope)</span>
            </h3>
            <p className="leading-relaxed text-slate-400">
              Hotels, HMOs, hostels, and residential apartment blocks carry sleeping risks. Under PAS 79 standards,
              they frequently require intrusive/destructive opening-up (Level 4) of ceilings and risers.
            </p>
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-200 text-[11px] leading-relaxed">
              Aurelius does not conduct Level 4 destructive opening-up. We keep our scope laser-focused on commercial
              businesses, guaranteeing fast, fixed-fee audits without invasive structural damage.
            </div>
          </div>
        </div>
      </div>

      {/* Commercial Premises Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Small Shops */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Small Shops & High Street Retail</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tailored for independent retailers, boutiques, convenience stores, and showrooms. We assess stockroom
              storage hazards, combustible packaging, travel distances, and staff evacuation plans.
            </p>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-800">Key Focus Areas:</div>
              <ul className="text-[11px] text-slate-600 space-y-0.5">
                <li>• Stockroom combustible storage & aisle clearances</li>
                <li>• Shopfloor escape paths & customer egress</li>
                <li>• Fire extinguisher suitability & testing records</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">From £245 + VAT</span>
            <button
              onClick={onGetQuoteClick}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center space-x-1"
            >
              <span>Instant Quote</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Commercial Offices */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Commercial Offices & Workspaces</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Designed for professional service firms, agencies, serviced offices, and corporate suites. We audit fire
              doors, emergency lighting, server rooms, and multi-tenant evacuation protocols.
            </p>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-800">Key Focus Areas:</div>
              <ul className="text-[11px] text-slate-600 space-y-0.5">
                <li>• Fire door seals, latches & self-closing devices</li>
                <li>• Server room electrical fire suppression & shutdown</li>
                <li>• PEEPs (Personal Emergency Evacuation Plans)</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">From £295 + VAT</span>
            <button
              onClick={onGetQuoteClick}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center space-x-1"
            >
              <span>Instant Quote</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Commercial Units & Studios */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Studios, Salons & Trade Units</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Covering hair and beauty salons, photography studios, customer cafes, and light commercial trade units.
              Pragmatic advice focused on your exact equipment and layout.
            </p>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-800">Key Focus Areas:</div>
              <ul className="text-[11px] text-slate-600 space-y-0.5">
                <li>• High-wattage salon/studio electrical testing (PAT)</li>
                <li>• Flammable liquids, chemicals, and solvent storage</li>
                <li>• Fast customer evacuation in dense layouts</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">From £265 + VAT</span>
            <button
              onClick={onGetQuoteClick}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center space-x-1"
            >
              <span>Instant Quote</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">Ready for a Fixed Commercial Quote?</h3>
          <p className="text-slate-400 text-xs sm:text-sm">
            Instant calculation with Charlie's rates and direct email dispatch. No spam, no obligation.
          </p>
        </div>
        <button
          onClick={onGetQuoteClick}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-2 shrink-0"
        >
          <span>Calculate My Instant Quote</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import {
  Store,
  Briefcase,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Award,
  Check,
  X,
  FileCheck,
  Flame,
  Zap,
} from 'lucide-react';

interface CommercialServicesProps {
  onGetQuoteClick: () => void;
  onOpenPolicy?: (key: string) => void;
}

export const CommercialServices: React.FC<CommercialServicesProps> = ({ onGetQuoteClick, onOpenPolicy }) => {
  return (
    <div className="space-y-16 py-6 selection:bg-slate-900 selection:text-white">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200">
          <Award className="w-3.5 h-3.5 text-amber-600" />
          <span>NEBOSH Style Commercial Fire Risk Assessments</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
          Commercial Premises We Assess.
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-light">
          Aurelius provides rigorous, pragmatic fire risk assessments strictly tailored for UK commercial operations.
          Clear fixed fees, zero VAT, and full compliance under the Regulatory Reform (Fire Safety) Order 2005.
        </p>
      </div>

      {/* TICKS AND CROSSES SECTION */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Scope of Coverage</h2>
          <p className="text-xs text-slate-500 mt-1">
            We focus exclusively on commercial workplaces where occupants are awake during operating hours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Green Ticks: What We Cover */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                <span>What We Cover</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">Commercial Non-Sleeping</span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Commercial Workplaces & Retail</h3>
              <p className="text-xs text-slate-500 mt-1">
                Visual, non-destructive fire risk assessment in accordance with PAS 79-1:2020.
              </p>
            </div>

            <ul className="space-y-3 pt-1 text-sm text-slate-800">
              <li className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-slate-900 font-semibold">Small Shops & High Street Retail</strong>
                  <div className="text-xs text-slate-500 mt-0.5">Boutiques, newsagents, grocers, and commercial showrooms.</div>
                </div>
              </li>

              <li className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-slate-900 font-semibold">Commercial Offices & Co-working</strong>
                  <div className="text-xs text-slate-500 mt-0.5">Single-storey or multi-storey office workspaces and studios.</div>
                </div>
              </li>

              <li className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-slate-900 font-semibold">Salons, Barbers & Aesthetics Studios</strong>
                  <div className="text-xs text-slate-500 mt-0.5">Customer-facing service studios, beauty clinics, and therapy rooms.</div>
                </div>
              </li>

              <li className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-slate-900 font-semibold">Cafes, Delis & Coffee Shops</strong>
                  <div className="text-xs text-slate-500 mt-0.5">Daytime seating, bakeries, and sandwich shops (no sleeping units).</div>
                </div>
              </li>

              <li className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-slate-900 font-semibold">Trade Counters & Light Workshops</strong>
                  <div className="text-xs text-slate-500 mt-0.5">Commercial workshops, trade supply counters, and clean storage.</div>
                </div>
              </li>
            </ul>

            <div className="p-3.5 rounded-2xl bg-emerald-50 text-xs text-emerald-900 flex items-center justify-between border border-emerald-100 font-medium">
              <span>Transparent flat fee • Zero VAT</span>
              <span className="font-bold text-sm">From £245</span>
            </div>
          </div>

          {/* Red Crosses: What We Do NOT Cover */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
                <X className="w-3.5 h-3.5 text-rose-600 stroke-[3]" />
                <span>What We Do Not Cover</span>
              </span>
              <span className="text-xs text-rose-600 font-semibold">Sleeping Accommodation</span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Sleeping Risk & Residential Buildings</h3>
              <p className="text-xs text-slate-500 mt-1">
                Aurelius does not assess any premises containing sleeping accommodation.
              </p>
            </div>

            <ul className="space-y-3 pt-1 text-sm text-slate-700">
              <li className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-slate-900 font-semibold">Sleeping Accommodation of Any Kind</strong>
                  <div className="text-xs text-slate-500 mt-0.5">Any premises where occupants sleep overnight.</div>
                </div>
              </li>

              <li className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-slate-900 font-semibold">Flats & Residential Apartment Blocks</strong>
                  <div className="text-xs text-slate-500 mt-0.5">Communal parts or individual dwellings in block of flats.</div>
                </div>
              </li>

              <li className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-slate-900 font-semibold">Houses in Multiple Occupation (HMOs)</strong>
                  <div className="text-xs text-slate-500 mt-0.5">Multi-tenant student houses, shared flats, and bedsits.</div>
                </div>
              </li>

              <li className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-slate-900 font-semibold">Hotels, B&Bs, Hostels & Guest Houses</strong>
                  <div className="text-xs text-slate-500 mt-0.5">Short-stay or tourist overnight sleeping accommodation.</div>
                </div>
              </li>

              <li className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-slate-900 font-semibold">Care Homes, Nursing Homes & Medical</strong>
                  <div className="text-xs text-slate-500 mt-0.5">Residential care facilities with non-ambulant sleeping residents.</div>
                </div>
              </li>
            </ul>

            <div className="p-3.5 rounded-2xl bg-slate-50 text-xs text-slate-600 border border-slate-200">
              <span className="font-semibold text-slate-800">Clear Boundaries:</span> Our strict commercial scope keeps
              pricing lower and inspection turnarounds within 48 hours for UK business owners.
            </div>
          </div>
        </div>
      </div>

      {/* COMMERCIAL PREMISES DETAILED BREAKDOWN */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Premises We Assess</h2>
          <p className="text-xs text-slate-500 mt-1">Detailed focus areas for every category of commercial property.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Small Shops */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Small Shops & High Street Retail</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tailored for independent retailers, boutiques, convenience stores, and trade showrooms. We assess
                stockroom storage hazards, combustible packaging, customer egress routes, and staff fire awareness.
              </p>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="font-semibold text-slate-800">Key Inspection Elements:</div>
                <ul className="text-[11px] text-slate-600 space-y-1">
                  <li>• Stockroom combustible storage & clear aisles</li>
                  <li>• Customer egress and emergency exit push bars</li>
                  <li>• Fire extinguisher suitability & service logs</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-sm font-extrabold text-slate-900">£245</span>
                <span className="text-[11px] text-slate-400 block">Flat fee • No VAT</span>
              </div>
              <button
                onClick={onGetQuoteClick}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition flex items-center space-x-1.5"
              >
                <span>Quote</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Commercial Offices */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Commercial Offices & Workspaces</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Designed for professional service firms, agencies, serviced offices, and corporate suites. We audit fire
                doors, emergency escape lighting, server room protection, and multi-tenant coordination.
              </p>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="font-semibold text-slate-800">Key Inspection Elements:</div>
                <ul className="text-[11px] text-slate-600 space-y-1">
                  <li>• Fire door seals, latches & self-closers</li>
                  <li>• Server room electrical fire precautions</li>
                  <li>• Emergency escape lighting coverage & logs</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-sm font-extrabold text-slate-900">£295</span>
                <span className="text-[11px] text-slate-400 block">Flat fee • No VAT</span>
              </div>
              <button
                onClick={onGetQuoteClick}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition flex items-center space-x-1.5"
              >
                <span>Quote</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Studios & Salons */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Studios, Salons & Cafes</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Covering hair and beauty salons, photography studios, daytime cafes, and light commercial trade units.
                Pragmatic advice focused on your specific equipment and floor layout.
              </p>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="font-semibold text-slate-800">Key Inspection Elements:</div>
                <ul className="text-[11px] text-slate-600 space-y-1">
                  <li>• High-power equipment & portable appliance testing</li>
                  <li>• Flammable liquids, chemicals, and solvent storage</li>
                  <li>• Rapid evacuation pathways for visitors</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-sm font-extrabold text-slate-900">£265</span>
                <span className="text-[11px] text-slate-400 block">Flat fee • No VAT</span>
              </div>
              <button
                onClick={onGetQuoteClick}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition flex items-center space-x-1.5"
              >
                <span>Quote</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* APPLE-STYLE BOTTOM BANNER */}
      <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-xl font-bold text-white tracking-tight">Need a Quote for Your Commercial Premises?</h3>
          <p className="text-slate-400 text-xs sm:text-sm">
            Instant calculation with Charlie's rates and direct email dispatch. No sales calls, no VAT.
          </p>
        </div>
        <button
          onClick={onGetQuoteClick}
          className="px-7 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-full shadow-lg transition-all duration-200 flex items-center space-x-2 shrink-0 active:scale-95"
        >
          <span>Calculate Instant Quote</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

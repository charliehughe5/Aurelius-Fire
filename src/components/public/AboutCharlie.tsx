import React from 'react';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  Phone,
  Mail,
  ArrowRight,
  Building2,
  Store,
  Briefcase,
  AlertTriangle,
  Clock,
  FileCheck,
} from 'lucide-react';

interface AboutCharlieProps {
  onGetQuoteClick: () => void;
  onContactClick?: () => void;
}

export const AboutCharlie: React.FC<AboutCharlieProps> = ({ onGetQuoteClick }) => {
  return (
    <div className="space-y-12 py-6">
      {/* Hero Profile Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
              <Award className="w-4 h-4 text-amber-400" />
              <span>NEBOSH-Certified Fire Risk Assessor • Commercial Specialist</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Charlie Hughes
            </h1>
            <p className="text-amber-400 text-base sm:text-lg font-medium">
              Founder & Principal Assessor at Aurelius Fire Safety
            </p>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Delivering straightforward, audit-ready Fire Risk Assessments strictly tailored for UK commercial
              premises — small shops, retail outlets, offices, and commercial workspaces with no sleeping risk.
            </p>

            {/* Quick Badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>NEBOSH Fire Safety</span>
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>PAS 79-1:2020 Compliant</span>
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>RRFSO 2005 Legal Assurance</span>
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>48-Hour Report Delivery</span>
              </span>
            </div>

            {/* CTAs */}
            <div className="pt-4 flex flex-wrap gap-3">
              <button
                onClick={onGetQuoteClick}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition flex items-center space-x-2"
              >
                <span>Get Instant Quote with Charlie's Pricing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="mailto:charlie.a.s.hughes@gmail.com"
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm rounded-xl border border-slate-700 transition flex items-center space-x-2"
              >
                <Mail className="w-4 h-4 text-slate-400" />
                <span>Email Charlie Directly</span>
              </a>
            </div>
          </div>

          {/* Assessor Card */}
          <div className="lg:col-span-4 bg-slate-800/80 rounded-2xl p-6 border border-slate-700 space-y-4 text-xs">
            <div className="flex items-center space-y-3 flex-col text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-extrabold text-2xl flex items-center justify-center shadow-lg ring-4 ring-amber-400/20">
                CH
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Charlie Hughes</h3>
                <p className="text-slate-400">Founder & Lead Fire Risk Assessor</p>
                <p className="text-amber-400 font-mono text-[11px] mt-0.5">Aurelius Fire Safety</p>
              </div>
            </div>

            <div className="border-t border-slate-700/80 pt-3 space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Specialisation:</span>
                <span className="font-semibold text-white">Commercial (Non-Sleeping)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Qualification:</span>
                <span className="font-semibold text-amber-300">NEBOSH Fire Safety</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Report Standard:</span>
                <span className="font-semibold text-white">PAS 79-1:2020</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Coverage:</span>
                <span className="font-semibold text-white">UK Commercial Premises</span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
              <div className="flex items-center space-x-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px]">charlie.a.s.hughes@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px]">020 8050 4912 / Direct Line</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Philosophy & Commercial Focus */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Why Charlie Founded Aurelius</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            "Large fire engineering consultancies charge excessive corporate retainers and dump 90-page boilerplate
            documents filled with technical jargon on small business owners. Most shop owners and office managers don't
            need academic theory — they need to know exactly what is required to keep their team safe and comply with the
            law without overspending."
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            At Aurelius, every assessment is personally reviewed and structured to be practical, prioritized, and
            transparent. You get clear photographic action items, honest advice, and reports recognized by UK Fire and
            Rescue authorities, insurance brokers, and commercial landlords.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Commercial Focus — No Sleeping Risk</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Aurelius specialises exclusively in <span className="font-semibold text-slate-800">commercial non-sleeping premises</span>:
            high street shops, boutique retail stores, offices, commercial units, and customer-facing premises.
          </p>
          <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Why No Sleeping Risk (Level 4)?</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Residential blocks, HMOs, and hotels require intrusive Level 4 destructive opening-up of floors and walls
              due to sleeping occupants. Commercial shops and offices carry daytime risk without sleeping accommodation.
              By focusing on commercial premises, Charlie provides fast, predictable, fixed pricing with zero unnecessary
              structural destruction.
            </p>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            This sharp focus guarantees you receive an assessment from a specialist who understands commercial leases,
            retail fire exits, office server room safety, and local authority inspection criteria.
          </p>
        </div>
      </div>

      {/* Premises Specialities */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Commercial Premises Charlie Assesses</h2>
          <p className="text-slate-500 text-xs mt-1">
            All assessments conducted strictly to PAS 79-1:2020 and RRFSO 2005 standards
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Small Shops & High Street Retail</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Retail stores, boutiques, convenience shops, and showrooms. Stock room fire loads, clear escape paths,
              fire extinguisher positioning, and staff escape drills.
            </p>
            <div className="text-[11px] font-semibold text-emerald-700 pt-1">Starting from £245.00 + VAT</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Commercial Offices & Workspaces</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Single and multi-storey office spaces, co-working suites, and administrative buildings. Fire doors,
              emergency lighting, electrical equipment risks, and evacuation plans.
            </p>
            <div className="text-[11px] font-semibold text-emerald-700 pt-1">Starting from £295.00 + VAT</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Commercial Units & Studios</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Light workshops, creative studios, commercial salons, and customer-facing business premises. Tailored
              practical advice with photographic significant findings.
            </p>
            <div className="text-[11px] font-semibold text-emerald-700 pt-1">Starting from £265.00 + VAT</div>
          </div>
        </div>
      </div>

      {/* Assurance Box */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-2 text-amber-400 font-bold text-sm">
            <FileCheck className="w-5 h-5" />
            <span>100% Statutory Compliance Guarantee</span>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Every Aurelius Fire Risk Assessment is signed off under PAS 79 methodology and guaranteed to satisfy UK
            Fire & Rescue Services audits, insurance renewals, and commercial lease terms.
          </p>
        </div>

        <button
          onClick={onGetQuoteClick}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition shrink-0 flex items-center space-x-2"
        >
          <span>Get Your Instant Quote</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

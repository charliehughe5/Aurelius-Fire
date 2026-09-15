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
  Check,
  X,
  Clock,
  FileCheck,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface AboutCharlieProps {
  onGetQuoteClick: () => void;
  onContactClick?: () => void;
  onOpenPolicy?: (key: string) => void;
}

export const AboutCharlie: React.FC<AboutCharlieProps> = ({ onGetQuoteClick, onOpenPolicy }) => {
  return (
    <div className="space-y-16 py-6 selection:bg-slate-900 selection:text-white">
      {/* 1. APPLE-STYLE HERO PROFILE CARD */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-8 sm:p-14 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-8 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 text-amber-300 text-xs font-semibold border border-white/15 backdrop-blur-md">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>NEBOSH Certified • Commercial Fire Safety Specialist</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white font-sans">
                Charlie Hughes
              </h1>
              <p className="text-amber-400 text-base sm:text-lg font-medium">
                Founder & Principal Fire Risk Assessor • Aurelius Commercial Fire Safety
              </p>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light max-w-2xl">
              Specialising exclusively in non-sleeping commercial premises across the UK. Providing small business
              owners, retailers, and office managers with pragmatic, audit-ready Fire Risk Assessments without the
              inflated corporate consultancies or confusing technical jargon.
            </p>

            {/* Micro Feature Pills */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              <span className="px-3 py-1 rounded-full bg-white/5 text-slate-200 text-xs font-medium border border-white/10 flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span>NEBOSH Fire Safety Certified</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-slate-200 text-xs font-medium border border-white/10 flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span>PAS 79-1:2020 Methodology</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-slate-200 text-xs font-medium border border-white/10 flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span>Zero VAT • Flat Fixed Pricing</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-slate-200 text-xs font-medium border border-white/10 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>48-Hour Report Delivery</span>
              </span>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap gap-3.5">
              <button
                onClick={onGetQuoteClick}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-full shadow-lg transition-all duration-200 flex items-center space-x-2 active:scale-95"
              >
                <span>Calculate Fixed Quote with Charlie</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="mailto:charlie.a.s.hughes@gmail.com"
                className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-full border border-slate-700 transition flex items-center space-x-2 active:scale-95"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Charlie Directly</span>
              </a>
            </div>
          </div>

          {/* Assessor Profile Card */}
          <div className="lg:col-span-4 bg-slate-900/90 rounded-3xl p-6 border border-slate-800 space-y-5 text-xs">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg ring-4 ring-amber-400/20">
                CH
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Charlie Hughes</h3>
                <p className="text-slate-400 text-xs mt-0.5">Principal Fire Risk Assessor</p>
                <p className="text-amber-400 font-medium text-[11px]">Aurelius Commercial Fire Safety</p>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3.5 space-y-2.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Accreditation:</span>
                <span className="font-semibold text-white">NEBOSH Fire Safety</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Commercial Standard:</span>
                <span className="font-semibold text-white">PAS 79-1:2020</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Statutory Framework:</span>
                <span className="font-semibold text-white">RRFSO 2005 & BSA 2022</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pricing Policy:</span>
                <span className="font-semibold text-emerald-400">Flat Fee • Zero VAT</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <a href="mailto:charlie.a.s.hughes@gmail.com" className="text-[11px] text-slate-300 hover:text-white truncate">
                  charlie.a.s.hughes@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-[11px]">020 8050 4912 (Direct Assessor Line)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE TICKS & CROSSES PHILOSOPHY SECTION */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            What Premises Charlie Covers
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Strictly commercial non-sleeping scope. Clear, honest boundaries for every client.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Covered (Green Ticks) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                <span>Premises Charlie Covers</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">Commercial Non-Sleeping</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">Commercial Workplaces & Retail</h3>

            <ul className="space-y-3 pt-1 text-sm text-slate-800">
              <li className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-slate-900 font-semibold">Small Shops & High Street Retail:</strong>
                  <div className="text-xs text-slate-500 mt-0.5">Boutiques, grocers, stationers, newsagents, showrooms.</div>
                </div>
              </li>

              <li className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-slate-900 font-semibold">Commercial Offices & Workspaces:</strong>
                  <div className="text-xs text-slate-500 mt-0.5">Single and multi-storey office premises, co-working spaces, suites.</div>
                </div>
              </li>

              <li className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-slate-900 font-semibold">Studios, Salons & Aesthetics Clinics:</strong>
                  <div className="text-xs text-slate-500 mt-0.5">Hairdressers, barbershops, beauty studios, therapy rooms.</div>
                </div>
              </li>

              <li className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-slate-900 font-semibold">Cafes, Delis & Coffee Shops:</strong>
                  <div className="text-xs text-slate-500 mt-0.5">Daytime customer seating, sandwich bars, bakeries (no sleeping rooms).</div>
                </div>
              </li>

              <li className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-slate-900 font-semibold">Light Commercial Workshops & Trade Units:</strong>
                  <div className="text-xs text-slate-500 mt-0.5">Trade counters, fabrication spaces, clean storage facilities.</div>
                </div>
              </li>
            </ul>

            <div className="p-3.5 rounded-2xl bg-emerald-50 text-xs text-emerald-900 font-medium border border-emerald-100 flex items-center justify-between">
              <span>Transparent flat fee • Zero VAT</span>
              <span className="font-bold">Starting from £245</span>
            </div>
          </div>

          {/* Not Covered (Red Crosses) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
                <X className="w-3.5 h-3.5 text-rose-600 stroke-[3]" />
                <span>Premises Charlie Does Not Cover</span>
              </span>
              <span className="text-xs text-rose-600 font-semibold">Sleeping Accommodation</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">Sleeping Risk & Residential Buildings</h3>

            <ul className="space-y-3 pt-1 text-sm text-slate-700">
              <li className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-slate-900 font-semibold">Sleeping Accommodation of Any Kind:</strong>
                  <div className="text-xs text-slate-500 mt-0.5">Any building where occupants sleep overnight.</div>
                </div>
              </li>

              <li className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-slate-900 font-semibold">Flats & Residential Apartment Blocks:</strong>
                  <div className="text-xs text-slate-500 mt-0.5">Common parts or individual dwellings in block of flats.</div>
                </div>
              </li>

              <li className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-slate-900 font-semibold">Houses in Multiple Occupation (HMOs):</strong>
                  <div className="text-xs text-slate-500 mt-0.5">Multi-occupier student houses, bedsits, shared tenant houses.</div>
                </div>
              </li>

              <li className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-slate-900 font-semibold">Hotels, B&Bs, Hostels & Guest Houses:</strong>
                  <div className="text-xs text-slate-500 mt-0.5">Overnight hospitality accommodation for guests.</div>
                </div>
              </li>

              <li className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-slate-900 font-semibold">Care Homes, Nursing Homes & Medical:</strong>
                  <div className="text-xs text-slate-500 mt-0.5">Healthcare premises with sleeping or bedridden occupants.</div>
                </div>
              </li>
            </ul>

            <div className="p-3.5 rounded-2xl bg-slate-50 text-xs text-slate-600 border border-slate-200">
              <span className="font-semibold text-slate-800">Clear Philosophy:</span> By staying strictly within
              commercial non-sleeping premises, Charlie guarantees prompt scheduling, fixed flat fees, and no
              unnecessary structural disruption.
            </div>
          </div>
        </div>
      </section>

      {/* 3. CHARLIE'S APPROACH */}
      <section className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200/80 space-y-6">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">The Aurelius Approach</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Pragmatic Fire Safety for Real Businesses
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            "Large corporate consultancies charge thousands of pounds and produce 80-page boilerplate documents filled
            with academic jargon that business owners never read. At Aurelius, I cut straight to the core: What are the
            real fire risks in your shop or office? How do we fix them pragmatically? And how do we keep your staff,
            customers, and lease fully protected under UK law?"
          </p>
          <div className="pt-2 text-xs font-semibold text-slate-800">— Charlie Hughes, Founder & Assessor</div>
        </div>
      </section>

      {/* 4. BOTTOM CTA BANNER */}
      <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-xl font-bold text-white tracking-tight">Ready for a Fixed Commercial Quote?</h3>
          <p className="text-slate-400 text-xs sm:text-sm">
            Get an instant calculation and dispatched quote in under 60 seconds. Flat fee with zero VAT.
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

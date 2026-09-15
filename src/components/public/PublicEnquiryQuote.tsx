import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { PremisesType, Quote } from '../../types';
import {
  ShieldAlert,
  Calculator,
  ArrowRight,
  CheckCircle,
  FileCheck,
  AlertCircle,
  Clock,
  Sparkles,
  Info,
  Store,
  Briefcase,
  Building2,
  Mail,
  Phone,
  MapPin,
  Printer,
  CheckCircle2,
  ChevronRight,
  Award,
  ShieldCheck,
  Check,
  X,
  Send,
  Calendar,
  ExternalLink,
} from 'lucide-react';

interface PublicEnquiryQuoteProps {
  onViewClientPortal?: () => void;
  onOpenPolicy?: (key: string) => void;
  onGoToAboutCharlie?: () => void;
}

const COMMERCIAL_PREMISES = [
  {
    id: 'Shops & Retail',
    name: 'Small Shop / High Street Retail',
    description: 'Independent shops, retail boutiques, convenience stores, and trade showrooms (<150m²)',
    icon: Store,
    flatFee: 245,
    defaultArea: 120,
    defaultFloors: 1,
    tag: 'Most Popular for Retail',
  },
  {
    id: 'Offices & Commercial',
    name: 'Commercial Office (1–2 Floors)',
    description: 'Professional practices, creative studios, agency suites, and commercial workspaces (<250m²)',
    icon: Briefcase,
    flatFee: 295,
    defaultArea: 200,
    defaultFloors: 2,
    tag: 'Standard Commercial',
  },
  {
    id: 'Multi-Storey Office',
    name: 'Multi-Storey Office (3+ Floors)',
    description: 'Multi-level office buildings with vertical escape stairs and partitioned floorplates (250–600m²)',
    icon: Building2,
    flatFee: 365,
    defaultArea: 400,
    defaultFloors: 3,
    tag: 'Multi-Storey',
  },
  {
    id: 'Warehouses & Industrial',
    name: 'Commercial Workshop / Trade Unit',
    description: 'Light workshops, trade counters, production studios, and storage units',
    icon: Building2,
    flatFee: 345,
    defaultArea: 300,
    defaultFloors: 1,
    tag: 'Trade & Industrial',
  },
  {
    id: 'Commercial Salon / Cafe',
    name: 'Salon / Studio / Cafe (No Sleeping)',
    description: 'Hair salons, barbershops, beauty aesthetics suites, cafes, and daytime coffee shops',
    icon: Store,
    flatFee: 265,
    defaultArea: 140,
    defaultFloors: 1,
    tag: 'Customer-Facing',
  },
];

export const PublicEnquiryQuote: React.FC<PublicEnquiryQuoteProps> = ({
  onViewClientPortal,
  onOpenPolicy,
  onGoToAboutCharlie,
}) => {
  const { refreshClients } = useAuth();

  // Calculator inputs
  const [selectedPremisesKey, setSelectedPremisesKey] = useState<string>('Shops & Retail');
  const [approxFloorAreaSqM, setApproxFloorAreaSqM] = useState<number>(120);
  const [numberOfFloors, setNumberOfFloors] = useState<number>(1);
  const [isReviewOfPreviousFra, setIsReviewOfPreviousFra] = useState<boolean>(false);

  // Indicative calculation state
  const [calculatedTotal, setCalculatedTotal] = useState<number>(245);
  const [quoteItems, setQuoteItems] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Instant Quote Client Contact Info (for email dispatch)
  const [name, setName] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [telephone, setTelephone] = useState<string>('');
  const [premisesAddress, setPremisesAddress] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  // Submission & Dispatched Quote State
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchedQuote, setDispatchedQuote] = useState<Quote | null>(null);
  const [dispatchMessage, setDispatchMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [acceptedSuccess, setAcceptedSuccess] = useState<boolean>(false);

  // When premises selection changes, auto-set sensible default area and floors
  const handleSelectPremises = (key: string) => {
    setSelectedPremisesKey(key);
    const found = COMMERCIAL_PREMISES.find((p) => p.id === key);
    if (found) {
      setApproxFloorAreaSqM(found.defaultArea);
      setNumberOfFloors(found.defaultFloors);
    }
  };

  // Auto-calculate quote using backend pricing engine
  useEffect(() => {
    let isCurrent = true;
    setIsCalculating(true);

    const mappingType =
      selectedPremisesKey === 'Multi-Storey Office'
        ? 'Offices & Commercial'
        : selectedPremisesKey === 'Commercial Salon / Cafe'
        ? 'Shops & Retail'
        : (selectedPremisesKey as PremisesType);

    api
      .calculateQuote({
        premisesType: mappingType,
        approxFloorAreaSqM: Number(approxFloorAreaSqM) || 120,
        numberOfFloors: Number(numberOfFloors) || 1,
        maxOccupancy: 15,
        sleepingAccommodation: false, // Strict commercial non-sleeping
        multiOccupancyBuilding: false,
        isReviewOfPreviousFra: isReviewOfPreviousFra,
        outsideLondonTravel: false,
        compartmentationSampling: false,
      })
      .then((res) => {
        if (isCurrent) {
          // Zero-VAT transparent price
          setCalculatedTotal(res.totalAmount);
          setQuoteItems(res.items);
          setIsCalculating(false);
        }
      })
      .catch((err) => {
        console.error('Failed to calculate price:', err);
        // Fallback to local flat fee
        const found = COMMERCIAL_PREMISES.find((p) => p.id === selectedPremisesKey);
        let base = found ? found.flatFee : 245;
        if (isReviewOfPreviousFra) base = Math.max(195, base - 50);
        setCalculatedTotal(base);
        if (isCurrent) setIsCalculating(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedPremisesKey, approxFloorAreaSqM, numberOfFloors, isReviewOfPreviousFra]);

  // Handle Instant Quote Dispatch
  const handleInstantDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !company.trim() || !email.trim() || !premisesAddress.trim()) {
      setErrorMessage('Please provide your name, company name, email address, and premises address.');
      return;
    }

    setIsDispatching(true);
    try {
      const res = await api.instantDispatchQuote({
        name,
        email,
        company,
        telephone,
        premisesAddress,
        premisesType: selectedPremisesKey,
        approxSizeSqM: approxFloorAreaSqM,
        numberOfFloors,
        isReview: isReviewOfPreviousFra,
        notes: additionalNotes,
      });

      setDispatchedQuote(res.quote);
      setDispatchMessage(res.message);
      await refreshClients();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch quote. Please check your details.');
    } finally {
      setIsDispatching(false);
    }
  };

  // Instant Quote Acceptance
  const handleAcceptDispatchedQuote = async () => {
    if (!dispatchedQuote) return;
    try {
      const res = await api.acceptQuote(dispatchedQuote.id, name, email);
      setAcceptedSuccess(true);
      setDispatchedQuote(res.quote);
      await refreshClients();
    } catch (err: any) {
      alert(err.message || 'Could not process quote acceptance.');
    }
  };

  return (
    <div className="space-y-16 py-6 selection:bg-slate-900 selection:text-white">
      {/* 1. APPLE-STYLE HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-8 sm:p-14 lg:p-16 border border-slate-800 shadow-2xl">
        {/* Subtle atmospheric glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold tracking-wide border border-white/15">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>NEBOSH Certified • PAS 79-1:2020 • Regulatory Reform Order 2005</span>
          </div>

          {/* Clean Apple-style Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.1] font-sans">
            Commercial Fire Risk Assessments.
            <br />
            <span className="text-slate-400 font-normal text-3xl sm:text-4xl md:text-5xl block mt-2">
              For shops, offices & workspaces.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-light">
            Conducted by <strong className="text-white font-semibold">Charlie Hughes</strong>. We specialise exclusively
            in UK commercial premises with <strong className="text-amber-300 font-semibold">no sleeping risk</strong>.
            Transparent fixed pricing. Zero VAT. Audit-ready compliance delivered in 48 hours.
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <a
              href="#instant-quote"
              className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-100 text-slate-950 font-semibold text-sm rounded-full shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 active:scale-95"
            >
              <span>Calculate Instant Quote</span>
              <ArrowRight className="w-4 h-4 text-slate-900" />
            </a>
            <a
              href="#coverage-section"
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-800/80 hover:bg-slate-700/80 text-white font-medium text-sm rounded-full border border-slate-700/80 backdrop-blur-md transition-all duration-200 flex items-center justify-center space-x-2 active:scale-95"
            >
              <span>See What We Cover</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>
          </div>

          {/* 4 Apple-style Value Metric Pills */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <div className="text-xs text-slate-400 font-medium">Flat Pricing</div>
              <div className="text-lg font-bold text-white mt-0.5">From £245</div>
              <div className="text-[11px] text-amber-400 font-medium mt-1">Zero VAT added</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <div className="text-xs text-slate-400 font-medium">Turnaround</div>
              <div className="text-lg font-bold text-white mt-0.5">48 Hours</div>
              <div className="text-[11px] text-emerald-400 font-medium mt-1">Digital PDF report</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <div className="text-xs text-slate-400 font-medium">Clear Scope</div>
              <div className="text-lg font-bold text-white mt-0.5">Commercial</div>
              <div className="text-[11px] text-blue-400 font-medium mt-1">No sleeping risk</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <div className="text-xs text-slate-400 font-medium">UK Legislation</div>
              <div className="text-lg font-bold text-white mt-0.5">Audit-Ready</div>
              <div className="text-[11px] text-purple-400 font-medium mt-1">RRFSO 2005 & BSA</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TICKS & CROSSES BENTO GRID: WHAT WE COVER VS WHAT WE DO NOT COVER */}
      <section id="coverage-section" className="space-y-8 scroll-mt-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
            <span>Premises Suitability</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            What We Cover. And What We Don't.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Aurelius specialises exclusively in commercial workplaces where occupants are awake and active during
            business hours. We do not provide fire risk assessments for premises containing sleeping accommodation.
          </p>
        </div>

        {/* Side-by-Side Comparison Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Card 1: What We Cover (Green Ticks) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200/80 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  <span>We Cover These Premises</span>
                </span>
                <span className="text-xs text-slate-400 font-medium">Commercial Non-Sleeping</span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">Commercial Workplaces & Retail</h3>
                <p className="text-xs text-slate-500 mt-1">
                  All assessments conducted strictly to PAS 79-1:2020 standards by Charlie Hughes (NEBOSH).
                </p>
              </div>

              {/* Ticks List */}
              <ul className="space-y-3 pt-2">
                <li className="flex items-start space-x-3 text-sm text-slate-800">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold text-slate-900">Small Shops & High Street Retail:</strong>
                    <span className="text-slate-600 text-xs block mt-0.5">
                      Boutiques, independent stores, convenience shops, and commercial showrooms.
                    </span>
                  </div>
                </li>

                <li className="flex items-start space-x-3 text-sm text-slate-800">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold text-slate-900">Commercial Offices & Workspaces:</strong>
                    <span className="text-slate-600 text-xs block mt-0.5">
                      Single-storey or multi-storey offices, creative studios, agency suites, and coworking spaces.
                    </span>
                  </div>
                </li>

                <li className="flex items-start space-x-3 text-sm text-slate-800">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold text-slate-900">Hair Salons, Barbers & Beauty Studios:</strong>
                    <span className="text-slate-600 text-xs block mt-0.5">
                      Aesthetics clinics, nail bars, and therapy rooms with customer-facing layouts.
                    </span>
                  </div>
                </li>

                <li className="flex items-start space-x-3 text-sm text-slate-800">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold text-slate-900">Cafes, Delis & Coffee Shops:</strong>
                    <span className="text-slate-600 text-xs block mt-0.5">
                      Daytime customer seating, sandwich bars, bakeries, and tea rooms (no sleeping rooms above).
                    </span>
                  </div>
                </li>

                <li className="flex items-start space-x-3 text-sm text-slate-800">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold text-slate-900">Light Commercial Workshops & Trade Units:</strong>
                    <span className="text-slate-600 text-xs block mt-0.5">
                      Trade counters, craft production workshops, and commercial storage units.
                    </span>
                  </div>
                </li>

                <li className="flex items-start space-x-3 text-sm text-slate-800">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold text-slate-900">Professional Practices & Consultancies:</strong>
                    <span className="text-slate-600 text-xs block mt-0.5">
                      Accountants, solicitors, veterinary surgeries, dental clinics, and architects.
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-950 flex items-center justify-between">
              <div>
                <span className="font-bold">Visual Non-Destructive Assessment</span>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Rapid, non-disruptive, audit-ready compliance for your business.
                </p>
              </div>
              <span className="font-bold text-sm text-emerald-900">From £245</span>
            </div>
          </div>

          {/* Card 2: What We Do NOT Cover (Red Crosses) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200/80 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
                  <X className="w-3.5 h-3.5 text-rose-600 stroke-[3]" />
                  <span>We Do Not Cover</span>
                </span>
                <span className="text-xs text-rose-600 font-semibold">Sleeping Accommodation</span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">Sleeping Risk & Residential</h3>
                <p className="text-xs text-slate-500 mt-1">
                  We strictly do not assess any building with overnight sleeping accommodation.
                </p>
              </div>

              {/* Crosses List */}
              <ul className="space-y-3 pt-2">
                <li className="flex items-start space-x-3 text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold text-slate-900">Sleeping Accommodation of Any Kind:</strong>
                    <span className="text-slate-500 text-xs block mt-0.5">
                      Any property where persons sleep overnight is outside our operational scope.
                    </span>
                  </div>
                </li>

                <li className="flex items-start space-x-3 text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold text-slate-900">Residential Flats & Apartment Blocks:</strong>
                    <span className="text-slate-500 text-xs block mt-0.5">
                      We do not inspect communal areas or private dwellings of residential blocks.
                    </span>
                  </div>
                </li>

                <li className="flex items-start space-x-3 text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold text-slate-900">Houses in Multiple Occupation (HMOs):</strong>
                    <span className="text-slate-500 text-xs block mt-0.5">
                      Multi-tenant student houses, bedsits, and shared residential houses.
                    </span>
                  </div>
                </li>

                <li className="flex items-start space-x-3 text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold text-slate-900">Hotels, B&Bs, Hostels & Guest Houses:</strong>
                    <span className="text-slate-500 text-xs block mt-0.5">
                      Short-stay hospitality accommodation with sleeping guests.
                    </span>
                  </div>
                </li>

                <li className="flex items-start space-x-3 text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold text-slate-900">Care Homes, Nursing Homes & Hospitals:</strong>
                    <span className="text-slate-500 text-xs block mt-0.5">
                      Facilities with vulnerable or non-ambulant sleeping residents.
                    </span>
                  </div>
                </li>

                <li className="flex items-start space-x-3 text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold text-slate-900">Airbnbs & Short-Term Holiday Lets:</strong>
                    <span className="text-slate-500 text-xs block mt-0.5">
                      Residential units rented for temporary tourist or visitor overnight stays.
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Why this focus benefits you:</span> By avoiding complex
              residential sleeping surveys, Charlie Hughes delivers faster turnarounds and lower, transparent fixed
              costs for commercial business owners.
            </div>
          </div>
        </div>
      </section>

      {/* 3. APPLE-STYLE INSTANT FIXED PRICING CALCULATOR & EMAIL DISPATCH */}
      <section id="instant-quote" className="space-y-8 scroll-mt-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center space-x-2 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <Calculator className="w-4 h-4 text-amber-600" />
              <span>Instant Fixed Pricing Engine</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">
              Select Your Premises. Get Your Fixed Quote.
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Transparent fixed prices. Flat fee with zero VAT added. Dispatched immediately to your email.
            </p>
          </div>

          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Assessor: Charlie Hughes (NEBOSH)</span>
          </div>
        </div>

        {/* If Quote has been dispatched, show full interactive quote confirmation */}
        {dispatchedQuote ? (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-emerald-500 shadow-xl space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center shrink-0">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono">
                      {dispatchedQuote.quoteNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">Official Commercial Quote</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                    Quote Dispatched to {email}
                  </h3>
                </div>
              </div>

              <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-2xl border sm:border-0 border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Fixed Total Fee (No VAT)</div>
                <div className="text-3xl font-black text-slate-900 tracking-tight">
                  £{dispatchedQuote.totalAmount.toFixed(2)}
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                  100% Flat Fee • Zero VAT Added
                </div>
              </div>
            </div>

            {/* Quote details breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="font-bold text-slate-900 text-sm">Premises & Contact Details</div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Client / Company:</span>
                  <span className="font-semibold text-slate-800">{company} ({name})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Premises Address:</span>
                  <span className="font-semibold text-slate-800 text-right">{premisesAddress}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Premises Type:</span>
                  <span className="font-semibold text-slate-800">{selectedPremisesKey}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Floor Area & Levels:</span>
                  <span className="font-semibold text-slate-800">{approxFloorAreaSqM} m² ({numberOfFloors} Floor{numberOfFloors > 1 ? 's' : ''})</span>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="font-bold text-slate-900 text-sm">Assessment Scope & Compliance</div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Lead Assessor:</span>
                  <span className="font-semibold text-slate-800">Charlie Hughes (NEBOSH Fire Safety)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Governing Standard:</span>
                  <span className="font-semibold text-slate-800">PAS 79-1:2020 Commercial</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Legislation:</span>
                  <span className="font-semibold text-slate-800">Regulatory Reform (Fire Safety) Order 2005</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Turnaround:</span>
                  <span className="font-semibold text-emerald-700">48-Hour Digital PDF Delivery</span>
                </div>
              </div>
            </div>

            {/* Itemized pricing breakdown (No VAT) */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <div className="bg-slate-100/80 px-4 py-3 font-bold text-slate-800 flex justify-between">
                <span>Item Description</span>
                <span>Amount</span>
              </div>
              <div className="divide-y divide-slate-100">
                {dispatchedQuote.items.map((item, idx) => (
                  <div key={idx} className="px-4 py-3 flex justify-between items-center text-slate-700">
                    <div>
                      <div className="font-semibold text-slate-900">{item.description}</div>
                      <div className="text-[11px] text-slate-400">PAS 79-1:2020 Compliance Evaluation</div>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-sm">£{item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 px-4 py-3 flex justify-between items-center border-t border-slate-200 font-bold text-slate-900">
                <div>
                  <span>Total Amount Payable</span>
                  <span className="text-slate-400 font-normal text-[11px] block">Flat price • Zero VAT added</span>
                </div>
                <span className="text-lg font-black text-slate-900">£{dispatchedQuote.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions for the client */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                {!acceptedSuccess ? (
                  <button
                    onClick={handleAcceptDispatchedQuote}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Quote Online</span>
                  </button>
                ) : (
                  <div className="px-4 py-2.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Quote Accepted! Charlie Hughes will contact you.</span>
                  </div>
                )}

                <button
                  onClick={() => window.print()}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center space-x-2 border border-slate-200"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF</span>
                </button>
              </div>

              {onViewClientPortal && (
                <button
                  onClick={onViewClientPortal}
                  className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition flex items-center space-x-2"
                >
                  <span>Open Client Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setDispatchedQuote(null)}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                ← Calculate another commercial quote
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Premises selection cards */}
            <div className="lg:col-span-7 space-y-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Select Commercial Premises Type
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {COMMERCIAL_PREMISES.map((prem) => {
                  const Icon = prem.icon;
                  const isSelected = selectedPremisesKey === prem.id;
                  return (
                    <button
                      key={prem.id}
                      type="button"
                      onClick={() => handleSelectPremises(prem.id)}
                      className={`p-4 rounded-2xl text-left transition-all duration-200 flex flex-col justify-between border ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-white/10 text-amber-300 border border-white/15'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {prem.tag}
                          </span>
                        </div>

                        <div className="font-bold text-sm tracking-tight">{prem.name}</div>
                        <p
                          className={`text-xs line-clamp-2 leading-relaxed ${
                            isSelected ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          {prem.description}
                        </p>
                      </div>

                      <div className="pt-4 mt-2 border-t border-current/10 flex items-center justify-between text-xs">
                        <span className={isSelected ? 'text-slate-400' : 'text-slate-500'}>Fixed Rate:</span>
                        <span className={`font-extrabold text-sm ${isSelected ? 'text-amber-400' : 'text-slate-900'}`}>
                          £{prem.flatFee} <span className="text-[10px] font-normal">flat fee</span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Adjustments: Area, Floors, Annual Review */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 mt-6">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  2. Building Dimensions & Annual Review
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Approx. Floor Area (m²)</label>
                    <input
                      type="number"
                      value={approxFloorAreaSqM}
                      onChange={(e) => setApproxFloorAreaSqM(Math.max(10, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 text-slate-800 font-medium"
                      placeholder="e.g. 120"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Most small shops are under 150m²</span>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Number of Floors</label>
                    <select
                      value={numberOfFloors}
                      onChange={(e) => setNumberOfFloors(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 text-slate-800 font-medium"
                    >
                      <option value={1}>Single Floor / Ground Level</option>
                      <option value={2}>2 Storeys (e.g. Ground + 1st)</option>
                      <option value={3}>3 Storeys</option>
                      <option value={4}>4+ Storeys</option>
                    </select>
                    <span className="text-[11px] text-slate-400 mt-1 block">Includes any upper office mezzanine</span>
                  </div>
                </div>

                {/* Annual Review Discount Toggle */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <label className="flex items-center space-x-2.5 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={isReviewOfPreviousFra}
                      onChange={(e) => setIsReviewOfPreviousFra(e.target.checked)}
                      className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900"
                    />
                    <span className="text-slate-700 font-medium">
                      This is an annual review of an existing Fire Risk Assessment
                    </span>
                  </label>
                  {isReviewOfPreviousFra && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      £50 Review Discount Applied
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Instant Calculation Summary & Quote Dispatch Form */}
            <div className="lg:col-span-5 space-y-6">
              {/* Apple-style Price Display Card */}
              <div className="bg-slate-950 text-white p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-xl space-y-5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-400">Fixed Assessment Price</div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
                    Zero VAT
                  </span>
                </div>

                <div className="flex items-baseline space-x-2">
                  <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
                    {isCalculating ? '...' : `£${calculatedTotal.toFixed(2)}`}
                  </div>
                  <span className="text-slate-400 text-xs font-medium">flat fee</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Premises Category:</span>
                    <span className="font-semibold text-white">{selectedPremisesKey}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Scope of Assessment:</span>
                    <span className="font-semibold text-white">Commercial Non-Sleeping (PAS 79)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>VAT Amount:</span>
                    <span className="font-semibold text-emerald-400">£0.00 (Zero VAT)</span>
                  </div>
                </div>

                {/* Dispatch Form */}
                <form onSubmit={handleInstantDispatch} className="space-y-3.5 pt-2 border-t border-slate-800 text-xs">
                  <div className="font-bold text-white text-sm">Have this Quote Dispatched to You</div>

                  {errorMessage && (
                    <div className="p-3 bg-red-500/20 border border-red-500/30 text-red-200 rounded-xl text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Smith"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Company / Trading Name *</label>
                      <input
                        type="text"
                        required
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g. Smith Retail Ltd"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Telephone</label>
                      <input
                        type="tel"
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                        placeholder="e.g. 020 7946 0123"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Email Address (for instant quote) *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. john@smithretail.co.uk"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Premises Address to Assess *</label>
                    <input
                      type="text"
                      required
                      value={premisesAddress}
                      onChange={(e) => setPremisesAddress(e.target.value)}
                      placeholder="e.g. 45 High Street, London, EC1A 1AA"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Notes / Preferred Inspection Dates</label>
                    <input
                      type="text"
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="e.g. Needs assessment completed next Tuesday"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isDispatching}
                    className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 active:scale-98"
                  >
                    {isDispatching ? (
                      <span>Calculating & Dispatched...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Me My Formal Quote</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-400 text-center leading-normal">
                    Instant dispatch. No phone pressure. Includes official reference number, client portal access, and
                    30-day price hold.
                  </p>
                </form>
              </div>

              {/* Assessor Trust Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-sm">
                    CH
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Charlie Hughes</div>
                    <div className="text-slate-500 text-[11px]">NEBOSH Fire Safety Certified Assessor</div>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  "Every assessment is conducted personally or strictly reviewed under PAS 79-1:2020. You receive an
                  action plan prioritized by genuine life-safety risk rather than pedantic theory."
                </p>
                {onGoToAboutCharlie && (
                  <button
                    onClick={onGoToAboutCharlie}
                    className="text-amber-700 hover:text-amber-800 font-semibold text-xs flex items-center space-x-1"
                  >
                    <span>Read Charlie's background & credentials</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 4. THE 3-STEP AUDIT-PROOF PROCESS */}
      <section className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200/80 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">How It Works</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Compliance Made Straightforward
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Three simple steps to protect your staff, visitors, and business from fire safety enforcement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
              1
            </div>
            <h3 className="font-bold text-sm text-slate-900">1. Instant Quote & Date Selection</h3>
            <p className="text-slate-600 leading-relaxed">
              Select your commercial premises type to receive a transparent fixed price with zero VAT. Choose an
              inspection date that fits your business trading hours.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
              2
            </div>
            <h3 className="font-bold text-sm text-slate-900">2. Pragmatic On-Site Survey</h3>
            <p className="text-slate-600 leading-relaxed">
              Charlie Hughes conducts a visual, non-destructive site evaluation covering escape routes, fire doors,
              alarms, emergency lighting, and staff protocols.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
              3
            </div>
            <h3 className="font-bold text-sm text-slate-900">3. 48-Hour Report & Action Plan</h3>
            <p className="text-slate-600 leading-relaxed">
              Receive your formal PAS 79-1:2020 report, photographic significant findings, and prioritized action plan
              accepted by UK Fire Authorities, insurers, and landlords.
            </p>
          </div>
        </div>
      </section>

      {/* 5. LEGAL & STATUTORY STATEMENT FOOTER */}
      <section className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="space-y-1 text-center sm:text-left">
          <div className="font-semibold text-slate-700">
            Aurelius Commercial Fire Safety • Regulatory Reform (Fire Safety) Order 2005
          </div>
          <div>
            Carried out under PAS 79-1:2020 methodology. Section 156 of the Building Safety Act 2022 compliant.
          </div>
        </div>

        {onOpenPolicy && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenPolicy('terms_and_conditions')}
              className="text-slate-600 hover:text-slate-900 underline"
            >
              Engagement Terms
            </button>
            <span>•</span>
            <button
              onClick={() => onOpenPolicy('privacy_notice')}
              className="text-slate-600 hover:text-slate-900 underline"
            >
              Privacy Notice
            </button>
            <span>•</span>
            <button
              onClick={() => onOpenPolicy('cancellation_policy')}
              className="text-slate-600 hover:text-slate-900 underline"
            >
              Cancellation Policy
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

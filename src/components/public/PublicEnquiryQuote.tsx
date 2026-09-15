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
  AlertTriangle,
  Send,
  Calendar,
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
    description: 'Retail stores, boutiques, convenience shops, and showrooms (<150m²)',
    icon: Store,
    baseFee: 245,
    defaultArea: 120,
    defaultFloors: 1,
  },
  {
    id: 'Offices & Commercial',
    name: 'Commercial Office (1-2 Floors)',
    description: 'Offices, professional practices, agency suites, and workspaces (<250m²)',
    icon: Briefcase,
    baseFee: 295,
    defaultArea: 200,
    defaultFloors: 2,
  },
  {
    id: 'Multi-Storey Office',
    name: 'Medium / Multi-Storey Office',
    description: 'Offices spanning 3+ floors or larger open-plan floorplates (250 - 600m²)',
    icon: Building2,
    baseFee: 365,
    defaultArea: 400,
    defaultFloors: 3,
  },
  {
    id: 'Warehouses & Industrial',
    name: 'Commercial Workshop / Trade Unit',
    description: 'Light workshops, trade counters, storage facilities, and studios',
    icon: Building2,
    baseFee: 345,
    defaultArea: 300,
    defaultFloors: 1,
  },
  {
    id: 'Commercial Salon / Cafe',
    name: 'Salon / Studio / Cafe (No Sleeping)',
    description: 'Hair salons, beauty studios, coffee shops, and customer-facing units',
    icon: Store,
    baseFee: 265,
    defaultArea: 140,
    defaultFloors: 1,
  },
];

export const PublicEnquiryQuote: React.FC<PublicEnquiryQuoteProps> = ({
  onViewClientPortal,
  onOpenPolicy,
  onGoToAboutCharlie,
}) => {
  const { refreshClients, switchUser, setPortalMode, allUsers } = useAuth();

  // Calculator inputs
  const [selectedPremisesKey, setSelectedPremisesKey] = useState<string>('Shops & Retail');
  const [approxFloorAreaSqM, setApproxFloorAreaSqM] = useState<number>(120);
  const [numberOfFloors, setNumberOfFloors] = useState<number>(1);
  const [isReviewOfPreviousFra, setIsReviewOfPreviousFra] = useState<boolean>(false);
  const [hasSleepingAccommodation, setHasSleepingAccommodation] = useState<boolean>(false);

  // Quote result from calculation
  const [quoteResult, setQuoteResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Instant Quote Client Contact Info (for dispatch)
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

  // On premises selection, update recommended area & floors
  const handleSelectPremises = (key: string) => {
    setSelectedPremisesKey(key);
    const found = COMMERCIAL_PREMISES.find((p) => p.id === key);
    if (found) {
      setApproxFloorAreaSqM(found.defaultArea);
      setNumberOfFloors(found.defaultFloors);
    }
  };

  // Auto-calculate indicative quote on input changes
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
        approxFloorAreaSqM: Number(approxFloorAreaSqM) || 100,
        numberOfFloors: Number(numberOfFloors) || 1,
        maxOccupancy: 15,
        sleepingAccommodation: hasSleepingAccommodation,
        multiOccupancyBuilding: false,
        isReviewOfPreviousFra: isReviewOfPreviousFra,
        outsideLondonTravel: false,
        compartmentationSampling: false,
      })
      .then((res) => {
        if (isCurrent) {
          setQuoteResult(res);
          setIsCalculating(false);
        }
      })
      .catch((err) => {
        console.error('Failed to calculate price:', err);
        if (isCurrent) setIsCalculating(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedPremisesKey, approxFloorAreaSqM, numberOfFloors, isReviewOfPreviousFra, hasSleepingAccommodation]);

  // Handle Instant Quote Dispatch
  const handleInstantDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !company.trim() || !email.trim() || !premisesAddress.trim()) {
      setErrorMessage('Please fill in your name, company, email, and premises address to receive your quote.');
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
    <div className="space-y-12 py-4">
      {/* 1. HERO SECTION: COMMERCIAL NEBOSH FOCUS */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
            <Award className="w-4 h-4 text-amber-400" />
            <span>NEBOSH-Style Fire Risk Assessments • PAS 79-1:2020 Compliant</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Commercial Fire Risk Assessments for Small Shops, Offices & Businesses
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Conducted by <span className="text-amber-300 font-semibold">Charlie Hughes</span> at{' '}
            <span className="text-white font-bold">Aurelius</span>. We specialise strictly in{' '}
            <span className="underline decoration-amber-500 font-semibold text-white">
              commercial premises with no sleeping risk
            </span>
            . Clear, pragmatic, audit-ready compliance under the Regulatory Reform (Fire Safety) Order 2005.
          </p>

          {/* Key Selling Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
              <div className="font-bold text-amber-400">Fixed Transparent Rates</div>
              <div className="text-slate-400 text-[11px] mt-0.5">From £245 + VAT</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
              <div className="font-bold text-emerald-400">48-Hour Report</div>
              <div className="text-slate-400 text-[11px] mt-0.5">Fast digital delivery</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
              <div className="font-bold text-blue-400">No Sleeping Risk</div>
              <div className="text-slate-400 text-[11px] mt-0.5">Commercial Focus</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
              <div className="font-bold text-purple-400">Audit-Proof Guarantee</div>
              <div className="text-slate-400 text-[11px] mt-0.5">Fire Authority Accepted</div>
            </div>
          </div>

          {/* CTAs */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <a
              href="#instant-quote-section"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition flex items-center space-x-2"
            >
              <span>Instant Quote & Email Dispatch</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            {onGoToAboutCharlie && (
              <button
                onClick={onGoToAboutCharlie}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl border border-slate-700 transition flex items-center space-x-2"
              >
                <span>About Charlie Hughes</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. THE COMMERCIAL DISTINCTION: NO SLEEPING RISK (EXPLAINING LEVEL 4) */}
      <div className="bg-amber-50/70 rounded-2xl p-6 sm:p-8 border border-amber-200/90 shadow-2xs">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-950">
              Why We Specialise in Commercial Premises with NO Sleeping Risk
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Under UK Fire Safety guidance (PAS 79), premises with residential sleeping occupants (such as HMOs, blocks
              of flats, and hotels) require specialized, complex, and often intrusive{' '}
              <span className="font-bold text-slate-900">Level 4 destructive sampling</span> of walls, floors, and
              compartmentation.
            </p>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              At <span className="font-bold text-slate-900">Aurelius</span>, Charlie Hughes specialises in{' '}
              <span className="font-bold text-slate-900">commercial non-sleeping premises</span>: high street retail,
              independent shops, commercial offices, salons, cafes, and light workshops. Because there is no sleeping
              accommodation, our assessments are rapid, non-destructive, affordable, and focused 100% on what keeps your
              staff, customers, and business protected and legally compliant.
            </p>
          </div>
        </div>
      </div>

      {/* 3. INSTANT QUOTE GENERATOR & EMAIL DISPATCH */}
      <div id="instant-quote-section" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center space-x-2 text-amber-600 text-xs font-bold uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              <span>Instant Fixed Pricing Engine</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              Instant Commercial Fire Risk Assessment Quote
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Select your premises type for an immediate fixed price. Enter your details to have the formal quote
              dispatched directly to your email.
            </p>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Assessor: <span className="font-semibold text-slate-800">Charlie Hughes (NEBOSH Fire Safety)</span>
          </div>
        </div>

        {/* Dispatched Quote View (When already generated) */}
        {dispatchedQuote ? (
          <div className="bg-white rounded-3xl p-8 border-2 border-emerald-500 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center shrink-0">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono">
                      {dispatchedQuote.quoteNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">Official Formal Quote</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                    Quote Dispatched to {email}
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-500">Fixed Total Fee</div>
                <div className="text-2xl font-black text-slate-900">
                  £{dispatchedQuote.totalAmount.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-slate-500">inc. VAT</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  (£{dispatchedQuote.netAmount.toFixed(2)} + 20% UK VAT)
                </div>
              </div>
            </div>

            {/* Quote details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 text-sm">Premises & Client Details</div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Client / Company:</span>
                  <span className="font-semibold text-slate-800">{company} ({name})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Premises Address:</span>
                  <span className="font-semibold text-slate-800 text-right max-w-[220px] truncate">
                    {premisesAddress}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Premises Classification:</span>
                  <span className="font-semibold text-slate-800">{selectedPremisesKey} (Commercial, Non-Sleeping)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assessor:</span>
                  <span className="font-semibold text-amber-800">Charlie Hughes (NEBOSH)</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 text-sm">Statutory Scope & Inclusions</div>
                <ul className="space-y-1.5 text-slate-600">
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>PAS 79-1:2020 Life Safety Non-Destructive Commercial Assessment</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Executive Summary & Prioritised Significant Findings Action Plan</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>48-Hour Official Report Delivery with Photographic Evidence</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>12-Month Compliance & Fire Authority Audit Acceptance Guarantee</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
              <div className="flex flex-wrap gap-2">
                {!acceptedSuccess ? (
                  <button
                    onClick={handleAcceptDispatchedQuote}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Accept Quote Online</span>
                  </button>
                ) : (
                  <div className="px-4 py-2 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Quote Accepted! Invoice Generated</span>
                  </div>
                )}

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center space-x-1.5"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Print / Save Quote</span>
                </button>
              </div>

              <div className="flex gap-2">
                {onViewClientPortal && (
                  <button
                    onClick={() => {
                      const clientUser = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
                      if (clientUser) switchUser(clientUser);
                      setPortalMode('CLIENT');
                    }}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition flex items-center space-x-1.5"
                  >
                    <span>View in Client Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => {
                    setDispatchedQuote(null);
                    setAcceptedSuccess(false);
                  }}
                  className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Calculate Another
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Interactive Quote Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Commercial Premises Selection & Specifications (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                    Step 1: Select Your Commercial Premises Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {COMMERCIAL_PREMISES.map((prem) => {
                      const Icon = prem.icon;
                      const isSelected = selectedPremisesKey === prem.id;
                      return (
                        <button
                          key={prem.id}
                          type="button"
                          onClick={() => handleSelectPremises(prem.id)}
                          className={`p-3.5 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                  isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-xs text-slate-900">
                                £{prem.baseFee} <span className="text-[10px] text-slate-400 font-normal">+ VAT</span>
                              </span>
                            </div>
                            <div className="font-bold text-xs text-slate-900 pt-1">{prem.name}</div>
                            <div className="text-[11px] text-slate-500 leading-tight">{prem.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dimensions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Approx Floor Area (m²)
                    </label>
                    <input
                      type="number"
                      min={20}
                      max={5000}
                      step={10}
                      value={approxFloorAreaSqM}
                      onChange={(e) => setApproxFloorAreaSqM(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Approx {Math.round(approxFloorAreaSqM * 10.764)} sq ft
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Number of Floors
                    </label>
                    <select
                      value={numberOfFloors}
                      onChange={(e) => setNumberOfFloors(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value={1}>Single Storey (Ground Floor only)</option>
                      <option value={2}>2 Storeys (e.g. Ground + 1st / Basement)</option>
                      <option value={3}>3 Storeys</option>
                      <option value={4}>4 Storeys or more</option>
                    </select>
                    <span className="text-[11px] text-slate-400 mt-1 block">Vertical escape complexity</span>
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="flex items-center space-x-3 cursor-pointer p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200">
                    <input
                      type="checkbox"
                      checked={isReviewOfPreviousFra}
                      onChange={(e) => setIsReviewOfPreviousFra(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-800">
                        Annual Review of Previous FRA (20% Discount)
                      </span>
                      <p className="text-slate-500 text-[11px]">
                        Select if you have an existing written fire risk assessment on file for this premises.
                      </p>
                    </div>
                  </label>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-2.5 text-xs text-slate-600">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">Strict Non-Sleeping Scope: </span>
                      All quotes apply strictly to commercial premises without sleeping accommodation. No residential
                      Level 4 intrusive opening-up is required or included.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Price Preview & Instant Dispatch Form (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Live Price Card */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Instant Quote Breakdown
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold font-mono">
                    Fixed Guarantee
                  </span>
                </div>

                {quoteResult ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Net Professional Assessment Fee:</span>
                      <span className="font-semibold font-mono text-white">
                        £{quoteResult.netAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>UK VAT (20%):</span>
                      <span className="font-mono">£{quoteResult.vatAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-800 pt-3 flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block">Total Payable</span>
                        <span className="text-[11px] text-emerald-400 font-medium">All inclusive</span>
                      </div>
                      <div className="text-2xl font-black text-amber-400 font-mono">
                        £{quoteResult.totalAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-slate-400">
                    {isCalculating ? 'Calculating fixed price...' : 'Select premises details'}
                  </div>
                )}
              </div>

              {/* Instant Dispatch Form ("sends it to them etc.") */}
              <form
                onSubmit={handleInstantDispatch}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4"
              >
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Step 2: Send This Quote to Your Email
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    We will instantly generate your official formal quote and dispatch it to your inbox.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Business / Company Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. High Street Cafe Ltd"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="07123 456789"
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Premises Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 14 High Street, Camden, London, NW1 7JE"
                      value={premisesAddress}
                      onChange={(e) => setPremisesAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isDispatching}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isDispatching ? 'Generating & Sending...' : 'Send My Instant Quote Now'}</span>
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  Instant quote generation. No sales push, no spam. Subject to Aurelius Standard Terms.
                </p>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* 4. CHARLIE HUGHES SPOTLIGHT */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Meet Your Assessor</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Charlie Hughes</h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            With formal NEBOSH certification and extensive commercial risk auditing experience, Charlie Hughes
            founded Aurelius to provide small shop owners, office managers, and business operators with honest,
            approachable fire risk assessments without corporate overheads.
          </p>
        </div>

        <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-3 justify-center">
          {onGoToAboutCharlie && (
            <button
              onClick={onGoToAboutCharlie}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition text-center"
            >
              Read Full Bio & Qualifications
            </button>
          )}
          <a
            href="mailto:charlie.a.s.hughes@gmail.com"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition text-center"
          >
            Direct Contact: 020 8050 4912
          </a>
        </div>
      </div>
    </div>
  );
};

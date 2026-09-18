import React, { useState } from 'react';
import { Quote, Premises } from '../../types';
import { api } from '../../api';
import {
  FileText,
  CheckCircle,
  Building,
  Users,
  Zap,
  Flame,
  DoorClosed,
  Bell,
  FileCheck,
  Save,
  X,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Calendar,
} from 'lucide-react';

interface PreAssessmentQuestionnaireProps {
  quote: Quote;
  premises?: Premises;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedQuote: Quote) => void;
}

export const PreAssessmentQuestionnaire: React.FC<PreAssessmentQuestionnaireProps> = ({
  quote,
  premises,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const existingData = quote.preAssessmentData || {};

  const [activeStep, setActiveStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: General Building
    approxYearBuilt: existingData.approxYearBuilt || '1995',
    constructionType: existingData.constructionType || 'Brick & Block / Concrete Floors',
    numberOfFloors: existingData.numberOfFloors || premises?.numberOfFloors || 2,
    numberOfBasements: existingData.numberOfBasements || premises?.numberOfBasements || 0,
    approxFloorAreaSqM: existingData.approxFloorAreaSqM || premises?.approxFloorAreaSqM || 250,
    numberOfUnitsFlats: existingData.numberOfUnitsFlats || '1 commercial unit',
    externalFacadeCladding: existingData.externalFacadeCladding || 'Traditional masonry brickwork - no combustible cladding',

    // Step 2: Occupancy & Risk Profile
    maxOccupancy: existingData.maxOccupancy || premises?.maxOccupancy || 25,
    numberOfEmployees: existingData.numberOfEmployees || premises?.numberOfEmployees || 10,
    publicVisitorsAllowed: existingData.publicVisitorsAllowed ?? true,
    operatingHours: existingData.operatingHours || '08:00 - 18:00 Monday to Friday',
    sleepingRiskOnSite: existingData.sleepingRiskOnSite ?? Boolean(premises?.sleepingAccommodation),
    disabledPersonsMobility: existingData.disabledPersonsMobility || 'None regular; ground floor level access available',
    peepsInPlace: existingData.peepsInPlace ?? false,
    assemblyPointLocation: existingData.assemblyPointLocation || 'Front Car Park adjacent to Main Gate Signpost',

    // Step 3: Ignition Sources & Electrical Safety
    eicrStatus: existingData.eicrStatus || 'Satisfactory - In Date',
    eicrLastTestDate: existingData.eicrLastTestDate || '2024-03-15',
    patTestingStatus: existingData.patTestingStatus || 'Annual PAT Completed',
    patLastTestDate: existingData.patLastTestDate || '2025-01-10',
    trailingLeadsManaged: existingData.trailingLeadsManaged ?? true,
    cubeAdaptorsProhibited: existingData.cubeAdaptorsProhibited ?? true,
    lithiumBatteryCharging: existingData.lithiumBatteryCharging || 'Dedicated supervised charging bench; e-scooters prohibited on premises',
    heatingType: existingData.heatingType || 'Wet central heating radiators with external gas boiler',
    portableHeatersUsed: existingData.portableHeatersUsed ?? false,
    commercialKitchenTR19: existingData.commercialKitchenTR19 || 'N/A - Standard office tea point only',
    lightningProtectionTested: existingData.lightningProtectionTested || 'N/A or Annual Test Valid',

    // Step 4: Housekeeping & Hazardous Materials
    wasteStorageArrangement: existingData.wasteStorageArrangement || 'Locked metal wheelie bins located 6m away from building facade',
    flammableLiquidsStored: existingData.flammableLiquidsStored || 'None or minimal cleaning chemicals in locked COSHH steel cabinet',
    hotWorkPermitInPlace: existingData.hotWorkPermitInPlace ?? true,
    smokingPolicy: existingData.smokingPolicy || 'Strictly no smoking on site; designated external smoking shelter 10m away',

    // Step 5: Means of Escape & Fire Doors
    travelDistancesSatisfactory: existingData.travelDistancesSatisfactory ?? true,
    fireDoorsCondition: existingData.fireDoorsCondition || 'FD30S self-closing fire doors installed to plant rooms and stair enclosures',
    fireDoorsWedgedOpen: existingData.fireDoorsWedgedOpen ?? false,
    finalExitDoorsUnlocked: existingData.finalExitDoorsUnlocked ?? true,
    panicBarsOperational: existingData.panicBarsOperational ?? true,
    escapeRoutesClear: existingData.escapeRoutesClear ?? true,

    // Step 6: Fire Alarm, Emergency Lighting & Paperwork
    fireAlarmCategory: existingData.fireAlarmCategory || 'BS 5839-1 Category L2 / Addressable Call Points & Optical Smoke Detectors',
    weeklyAlarmTestingLog: existingData.weeklyAlarmTestingLog ?? true,
    sixMonthAlarmServiceDate: existingData.sixMonthAlarmServiceDate || '2025-09-12',
    emergencyLightingTestedMonthly: existingData.emergencyLightingTestedMonthly ?? true,
    annual3HrEmergencyLightingDate: existingData.annual3HrEmergencyLightingDate || '2025-08-20',
    extinguishersAnnualServiceDate: existingData.extinguishersAnnualServiceDate || '2025-07-15',
    gasSafetyCP12InDate: existingData.gasSafetyCP12InDate || '2025-10-01',
    fireDrillFrequency: existingData.fireDrillFrequency || 'Twice yearly',
    onSiteEscortName: existingData.onSiteEscortName || quote.clientName || 'Facility Manager',
    onSiteEscortPhone: existingData.onSiteEscortPhone || '07700 900123',
    paperworkDeskReady: existingData.paperworkDeskReady ?? true,
  });

  if (!isOpen) return null;

  const updateField = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setErrorMsg('');
    try {
      const res = await api.submitPreAssessment(quote.id, formData);
      setSuccessMsg('Pre-assessment questionnaire draft saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save draft.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');

    try {
      const res = await api.submitPreAssessment(quote.id, formData);
      onSuccess(res.quote);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit questionnaire.');
    } finally {
      setIsSaving(false);
    }
  };

  const steps = [
    { id: 1, label: 'Building Info', icon: Building },
    { id: 2, label: 'Occupants', icon: Users },
    { id: 3, label: 'Ignition Sources', icon: Zap },
    { id: 4, label: 'Housekeeping', icon: Flame },
    { id: 5, label: 'Escape & Doors', icon: DoorClosed },
    { id: 6, label: 'Alarms & Logs', icon: FileCheck },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 border border-slate-200 space-y-4 my-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                <FileText className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Pre-Assessment Premises Questionnaire
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Site: <strong className="text-slate-800">{quote.premisesName}</strong> • Lead Assessor:{' '}
              <strong className="text-slate-800">Charlie Hughes (PAS 79-1:2020)</strong>
            </p>
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

        {/* Notice banner */}
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-blue-700 mt-0.5" />
          <div className="leading-snug">
            <strong>Advance Preparation:</strong> Completing these technical details in advance enables the lead
            assessor to prepare the statutory survey beforehand and ensures your on-site inspection takes{' '}
            <strong>no longer than 3 hours</strong>. Please have all corresponding logbooks ready on the desk.
          </div>
        </div>

        {/* Step progress tabs */}
        <div className="flex items-center justify-between overflow-x-auto pb-2 border-b border-slate-100 gap-1 text-xs">
          {steps.map((s) => {
            const Icon = s.icon;
            const isCur = activeStep === s.id;
            const isDone = activeStep > s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStep(s.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  isCur
                    ? 'bg-blue-700 text-white shadow-xs'
                    : isDone
                    ? 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Step Contents */}
        <form onSubmit={handleFinalSubmit} className="space-y-4 text-xs">
          {/* STEP 1: Building Info */}
          {activeStep === 1 && (
            <div className="space-y-3 animate-in fade-in">
              <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1">
                Section 1: General Building & Structural Specifications
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Approximate Construction Year
                  </label>
                  <input
                    type="text"
                    value={formData.approxYearBuilt}
                    onChange={(e) => updateField('approxYearBuilt', e.target.value)}
                    placeholder="e.g. 1995 or Victorian circa 1890"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Main Construction Method
                  </label>
                  <input
                    type="text"
                    value={formData.constructionType}
                    onChange={(e) => updateField('constructionType', e.target.value)}
                    placeholder="e.g. Traditional cavity brickwork & concrete floors"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Number of Storeys</label>
                  <input
                    type="number"
                    value={formData.numberOfFloors}
                    onChange={(e) => updateField('numberOfFloors', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Number of Basements</label>
                  <input
                    type="number"
                    value={formData.numberOfBasements}
                    onChange={(e) => updateField('numberOfBasements', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Approximate Floor Area (m²)
                  </label>
                  <input
                    type="number"
                    value={formData.approxFloorAreaSqM}
                    onChange={(e) => updateField('approxFloorAreaSqM', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Number of Units / Flats</label>
                  <input
                    type="text"
                    value={formData.numberOfUnitsFlats}
                    onChange={(e) => updateField('numberOfUnitsFlats', e.target.value)}
                    placeholder="e.g. Single commercial office or 8 residential flats"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  External Wall Cladding / Facade System
                </label>
                <input
                  type="text"
                  value={formData.externalFacadeCladding}
                  onChange={(e) => updateField('externalFacadeCladding', e.target.value)}
                  placeholder="e.g. Masonry brickwork, timber rainscreen, insulated render, etc."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Occupants */}
          {activeStep === 2 && (
            <div className="space-y-3 animate-in fade-in">
              <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1">
                Section 2: Occupants, Sleeping Profile & Hours
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Maximum Occupancy at Peak Times
                  </label>
                  <input
                    type="number"
                    value={formData.maxOccupancy}
                    onChange={(e) => updateField('maxOccupancy', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Number of Employees</label>
                  <input
                    type="number"
                    value={formData.numberOfEmployees}
                    onChange={(e) => updateField('numberOfEmployees', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Operating Hours</label>
                  <input
                    type="text"
                    value={formData.operatingHours}
                    onChange={(e) => updateField('operatingHours', e.target.value)}
                    placeholder="e.g. 08:30 - 17:30 Monday to Friday"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Designated Assembly Point
                  </label>
                  <input
                    type="text"
                    value={formData.assemblyPointLocation}
                    onChange={(e) => updateField('assemblyPointLocation', e.target.value)}
                    placeholder="e.g. Main visitor car park by signpost"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sleepingRiskOnSite}
                    onChange={(e) => updateField('sleepingRiskOnSite', e.target.checked)}
                    className="rounded text-blue-700"
                  />
                  <span className="font-semibold text-slate-800">
                    Are there any sleeping occupants or overnight accommodation on the premises?
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.publicVisitorsAllowed}
                    onChange={(e) => updateField('publicVisitorsAllowed', e.target.checked)}
                    className="rounded text-blue-700"
                  />
                  <span className="font-medium text-slate-700">
                    Members of the general public or unescorted visitors access the premises
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.peepsInPlace}
                    onChange={(e) => updateField('peepsInPlace', e.target.checked)}
                    className="rounded text-blue-700"
                  />
                  <span className="font-medium text-slate-700">
                    Personal Emergency Evacuation Plans (PEEPs) in place for mobility-impaired persons
                  </span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mobility & Vulnerable Occupant Details
                </label>
                <input
                  type="text"
                  value={formData.disabledPersonsMobility}
                  onChange={(e) => updateField('disabledPersonsMobility', e.target.value)}
                  placeholder="e.g. Ground floor level access, ramp fitted, evacuation chair on 1st floor stairwell"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Ignition Sources */}
          {activeStep === 3 && (
            <div className="space-y-3 animate-in fade-in">
              <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1">
                Section 3: Electrical Safety, Lithium Batteries & Heating
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fixed Wiring (EICR) Certificate Status
                  </label>
                  <select
                    value={formData.eicrStatus}
                    onChange={(e) => updateField('eicrStatus', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  >
                    <option value="Satisfactory - In Date">Satisfactory - In Date (&lt;5 years old)</option>
                    <option value="Due for Renewal">Due for Renewal / Inspection Booked</option>
                    <option value="Unsatisfactory / Remediations Required">Unsatisfactory / Remediations Required</option>
                    <option value="Unknown / No Certificate Available">Unknown / No Certificate Available</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">EICR Last Inspection Date</label>
                  <input
                    type="date"
                    value={formData.eicrLastTestDate}
                    onChange={(e) => updateField('eicrLastTestDate', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Portable Appliance Testing (PAT)
                  </label>
                  <input
                    type="text"
                    value={formData.patTestingStatus}
                    onChange={(e) => updateField('patTestingStatus', e.target.value)}
                    placeholder="e.g. Completed within last 12 months"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PAT Last Test Date</label>
                  <input
                    type="date"
                    value={formData.patLastTestDate}
                    onChange={(e) => updateField('patLastTestDate', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lithium-Ion Battery Charging (E-bikes, power tools, commercial devices)
                </label>
                <input
                  type="text"
                  value={formData.lithiumBatteryCharging}
                  onChange={(e) => updateField('lithiumBatteryCharging', e.target.value)}
                  placeholder="e.g. Dedicated metal charging cabinet; charging prohibited unattended"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.trailingLeadsManaged}
                    onChange={(e) => updateField('trailingLeadsManaged', e.target.checked)}
                    className="rounded text-blue-700"
                  />
                  <span className="font-medium text-slate-700">
                    Trailing leads and extension cables are routed safely without daisy-chaining
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.cubeAdaptorsProhibited}
                    onChange={(e) => updateField('cubeAdaptorsProhibited', e.target.checked)}
                    className="rounded text-blue-700"
                  />
                  <span className="font-medium text-slate-700">
                    High-risk multi-way cube adaptors are strictly prohibited on site
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!formData.portableHeatersUsed}
                    onChange={(e) => updateField('portableHeatersUsed', !e.target.checked)}
                    className="rounded text-blue-700"
                  />
                  <span className="font-medium text-slate-700">
                    No high-risk portable bar/fan/halogen heaters are permitted in offices
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: Housekeeping & Outside Contractors */}
          {activeStep === 4 && (
            <div className="space-y-3 animate-in fade-in">
              <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1">
                Section 4: Housekeeping, Waste Storage & Hazardous Substances
              </h4>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  External Combustible Waste Storage Arrangements
                </label>
                <input
                  type="text"
                  value={formData.wasteStorageArrangement}
                  onChange={(e) => updateField('wasteStorageArrangement', e.target.value)}
                  placeholder="e.g. Commercial 1100L wheelie bins locked in compound >6m from building"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Flammable Liquids / Compressed Gas / COSHH Storage
                </label>
                <input
                  type="text"
                  value={formData.flammableLiquidsStored}
                  onChange={(e) => updateField('flammableLiquidsStored', e.target.value)}
                  placeholder="e.g. Minimal janitorial chemicals stored in locked metal COSHH cabinet"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hotWorkPermitInPlace}
                    onChange={(e) => updateField('hotWorkPermitInPlace', e.target.checked)}
                    className="rounded text-blue-700"
                  />
                  <span className="font-semibold text-slate-800">
                    Hot Work Permit procedure enforced for all outside contractors (welding, cutting, roofing)
                  </span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Smoking Control Policy on Site
                </label>
                <input
                  type="text"
                  value={formData.smokingPolicy}
                  onChange={(e) => updateField('smokingPolicy', e.target.value)}
                  placeholder="e.g. Non-combustible wall-mounted ashtray in designated open-air zone"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Escape & Fire Doors */}
          {activeStep === 5 && (
            <div className="space-y-3 animate-in fade-in">
              <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1">
                Section 5: Means of Escape & Fire Door Condition
              </h4>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Fire Doors Specification & Condition
                </label>
                <input
                  type="text"
                  value={formData.fireDoorsCondition}
                  onChange={(e) => updateField('fireDoorsCondition', e.target.value)}
                  placeholder="e.g. FD30S doors with overhead hydraulic closers and smoke seals"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!formData.fireDoorsWedgedOpen}
                    onChange={(e) => updateField('fireDoorsWedgedOpen', !e.target.checked)}
                    className="rounded text-blue-700"
                  />
                  <span className="font-semibold text-slate-800">
                    Fire doors are NEVER wedged open or propped with fire extinguishers or wedges
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.escapeRoutesClear}
                    onChange={(e) => updateField('escapeRoutesClear', e.target.checked)}
                    className="rounded text-blue-700"
                  />
                  <span className="font-medium text-slate-700">
                    All escape corridors and emergency staircases are strictly free from storage and trip hazards
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.finalExitDoorsUnlocked}
                    onChange={(e) => updateField('finalExitDoorsUnlocked', e.target.checked)}
                    className="rounded text-blue-700"
                  />
                  <span className="font-medium text-slate-700">
                    Final fire exits open easily without the use of a key, code, or special tool
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.panicBarsOperational}
                    onChange={(e) => updateField('panicBarsOperational', e.target.checked)}
                    className="rounded text-blue-700"
                  />
                  <span className="font-medium text-slate-700">
                    Push bars / panic bolts latch and release smoothly with light bodily pressure
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 6: Alarms, Emergency Lighting & On-Site Logbooks */}
          {activeStep === 6 && (
            <div className="space-y-3 animate-in fade-in">
              <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1">
                Section 6: Warning Systems & On-Site Compliance Paperwork
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fire Alarm System Specification
                  </label>
                  <input
                    type="text"
                    value={formData.fireAlarmCategory}
                    onChange={(e) => updateField('fireAlarmCategory', e.target.value)}
                    placeholder="e.g. BS 5839-1 Category L2 addressable system"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    6-Monthly Alarm Service Date
                  </label>
                  <input
                    type="date"
                    value={formData.sixMonthAlarmServiceDate}
                    onChange={(e) => updateField('sixMonthAlarmServiceDate', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Annual Emergency Lighting 3-Hr Test
                  </label>
                  <input
                    type="date"
                    value={formData.annual3HrEmergencyLightingDate}
                    onChange={(e) => updateField('annual3HrEmergencyLightingDate', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Annual Fire Extinguisher Service
                  </label>
                  <input
                    type="date"
                    value={formData.extinguishersAnnualServiceDate}
                    onChange={(e) => updateField('extinguishersAnnualServiceDate', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    On-Site Escort Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.onSiteEscortName}
                    onChange={(e) => updateField('onSiteEscortName', e.target.value)}
                    placeholder="Person accompanying Charlie Hughes"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    On-Site Escort Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.onSiteEscortPhone}
                    onChange={(e) => updateField('onSiteEscortPhone', e.target.value)}
                    placeholder="Direct mobile number on the day"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2 text-emerald-900">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.paperworkDeskReady}
                    onChange={(e) => updateField('paperworkDeskReady', e.target.checked)}
                    className="rounded text-emerald-700 focus:ring-emerald-600"
                  />
                  <span className="font-bold text-xs">
                    I confirm that all physical logbooks (Fire Alarm, Emergency Lighting, EICR, Gas CP12) will be
                    available on the desk for the assessor upon arrival.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div>
              {activeStep > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveStep(activeStep - 1)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium flex items-center space-x-1 shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft</span>
              </button>

              {activeStep < 6 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep(activeStep + 1)}
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold flex items-center space-x-1 shadow-xs"
                >
                  <span>Next Section</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg font-bold flex items-center space-x-1.5 shadow-xs transition"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isSaving ? 'Submitting...' : 'Submit Questionnaire to Assessor'}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

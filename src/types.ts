// Data Types for UK Fire Risk Assessment Operations System

export type UserRole =
  | 'PLATFORM_ADMIN'
  | 'ASSESSOR_ADMIN'
  | 'ASSESSOR'
  | 'TEAM_MEMBER'
  | 'CLIENT_ADMIN'
  | 'CLIENT_USER'
  // Backward compatibility aliases
  | 'OWNER'
  | 'ADMIN'
  | 'ASSISTANT'
  | 'CLIENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organisationId?: string;
  clientId?: string; // If role is client
  organisationName?: string;
  position?: string;
  telephone?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type OrganisationType = 'PLATFORM' | 'ASSESSOR_COMPANY' | 'CLIENT';

export interface Organisation {
  id: string;
  name: string;
  tradingName?: string;
  type: OrganisationType;
  companyNumber?: string;
  address: string;
  postcode: string;
  website?: string;
  email: string;
  telephone: string;
  mainContactName?: string;
  mainContactEmail?: string;
  status: 'Lead' | 'Enquiry' | 'Quoted' | 'Active' | 'Archived';
  assignedAssessorId?: string;
  tags?: string[];
  notes?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  organisationId: string;
  name: string;
  jobTitle?: string;
  email: string;
  telephone?: string;
  phone?: string;
  mobile?: string;
  contactType: 'Primary' | 'Site Keyholder' | 'Finance / Billing' | 'Responsible Person' | 'Technical / Facilities' | string;
  isPrimary: boolean;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Invitation {
  id: string;
  email: string;
  name?: string;
  recipientName?: string;
  organisationId: string;
  organisationName?: string;
  role: UserRole;
  status: 'Pending' | 'Accepted' | 'Expired' | 'Cancelled';
  token: string;
  invitedByUserId: string;
  invitedByName?: string;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
}

export type ClientStatus =
  | 'Lead'
  | 'Enquiry'
  | 'Quoted'
  | 'Quote Accepted'
  | 'Awaiting Payment'
  | 'Booked'
  | 'Active Client'
  | 'Completed'
  | 'Archived'
  | 'Declined';

export interface Client {
  id: string;
  companyName: string;
  tradingName?: string;
  registrationNumber?: string;
  clientType: 'Commercial' | 'Residential Landlord' | 'Managing Agent' | 'Charity / Non-profit' | 'Public Sector' | 'Other';
  contactName: string;
  position?: string;
  email: string;
  telephone: string;
  mobile?: string;
  billingAddress: string;
  correspondenceAddress?: string;
  website?: string;
  preferredContactMethod: 'Email' | 'Telephone' | 'Mobile';
  notes?: string;
  status: ClientStatus;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UKJurisdiction = 'England & Wales' | 'Scotland' | 'Northern Ireland';

export type PremisesType =
  | 'Offices & Commercial'
  | 'Shops & Retail'
  | 'Warehouses & Industrial'
  | 'Residential Flats / HMO Common Parts'
  | 'Care Homes & Healthcare'
  | 'Hotels & Sleeping Accommodation'
  | 'Educational Premises & Nurseries'
  | 'Places of Assembly & Leisure'
  | 'Restaurants, Pubs & Hospitality'
  | 'Mixed-Use Building'
  | 'Other';

export type PremisesStatus =
  | 'Enquiry'
  | 'Awaiting information'
  | 'Ready for assessment'
  | 'Booked'
  | 'Assessment completed'
  | 'FRA issued'
  | 'Actions outstanding'
  | 'Archived';

export interface Premises {
  id: string;
  clientId: string;
  premisesName: string;
  addressLine1: string;
  addressLine2?: string;
  townCity?: string;
  city?: string;
  county?: string;
  postcode: string;
  country?: string;
  what3words?: string;
  jurisdiction?: UKJurisdiction;
  premisesType: PremisesType | string;
  occupancyType?: string;
  approxFloorAreaSqM?: number;
  numberOfFloors: number;
  numberOfBasements?: number;
  maxOccupancy?: number;
  normalOccupancy?: number;
  openingHours?: string;
  numberOfEmployees?: number;
  numberOfVisitors?: number;
  sleepingAccommodation?: boolean;
  sleepingRisk?: boolean;
  vulnerablePersonsPresent?: boolean;
  disabledPersonsPresent?: boolean;
  publicAccess?: boolean;
  multiOccupancyBuilding?: boolean;
  landlordFreeholder?: string;
  managingAgent?: string;
  responsiblePerson?: string;
  otherResponsiblePersons?: string;
  personAssistingFireSafety?: string;
  premisesContact?: string;
  accessArrangements?: string;
  keyholderInfo?: string;
  alarmKeyholderInfo?: string;
  parkingAccessInfo?: string;
  siteSpecificNotes?: string;
  status: PremisesStatus | string;
  preAssessmentReadinessStatus?: 'READY' | 'IN_PROGRESS' | 'INFORMATION REQUIRED' | string;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
  // UI joins
  clientName?: string;
  client?: Client;
}

export interface OnboardingData {
  premisesId: string;
  businessName: string;
  tradingName?: string;
  businessActivity?: string;
  openingHours?: string;
  shiftPatterns?: string;
  contractorsPresent?: boolean;
  constructionType?: string;
  buildingAge?: string;
  extensionsOrMezzanines?: string;
  sharedAreas?: string;
  adjacentPremisesRisk?: string;
  loneWorkers?: boolean;
  nightWorkers?: boolean;
  childrenPresent?: boolean;
  elderlyPersons?: boolean;
  disabledAssistancePlan?: boolean;
  electricalTestingCurrent?: boolean;
  portableApplianceTesting?: boolean;
  heatingType?: string;
  commercialKitchen?: boolean;
  hotWorksCarriedOut?: boolean;
  designatedSmokingAreas?: boolean;
  flammableLiquidsGases?: boolean;
  lithiumIonCharging?: boolean;
  wasteStorageExternal?: boolean;
  arsonVulnerabilityIdentified?: boolean;
  fireAlarmType?: string;
  emergencyLightingFitted?: boolean;
  extinguishersServicedRecently?: boolean;
  sprinklerSystemFitted?: boolean;
  smokeControlFitted?: boolean;
  fireDoorsInspected?: boolean;
  dryWetRiserPresent?: boolean;
  disabledRefugeOrEvacChairs?: boolean;
  existingFraAvailable?: boolean;
  previousFraDate?: string;
  writtenFirePolicy?: boolean;
  emergencyPlanInPlace?: boolean;
  staffFireTrainingConducted?: boolean;
  fireWardensAppointed?: boolean;
  routineFireDrills?: boolean;
  previousEnforcementAction?: string;
  updatedAt: string;
}

export interface Enquiry {
  id: string;
  clientId?: string;
  premisesId?: string;
  quoteId?: string;
  name: string;
  company: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  companyName?: string;
  email: string;
  telephone: string;
  position?: string;
  premisesAddress: string;
  premisesType: PremisesType;
  approxSizeSqM: number;
  numberOfFloors: number;
  numberOfEmployees: number;
  maxOccupancy: number;
  openingHours?: string;
  sleepingAccommodation: boolean;
  publicAccess: boolean;
  vulnerablePersons: boolean;
  existingFireAlarm: boolean;
  emergencyLighting: boolean;
  fireExtinguishers: boolean;
  sprinklers: boolean;
  smokeControl: boolean;
  commercialKitchen: boolean;
  dangerousSubstances: boolean;
  previousFra: boolean;
  previousFraDate?: string;
  reasonForNewFra: string;
  additionalNotes?: string;
  uploadedDocumentNames?: string[];
  indicativePrice?: number;
  status: 'New Enquiry' | 'Information Review' | 'Quoted' | 'Declined' | 'Approved';
  createdAt: string;
}

export type QuoteStatus =
  | 'Draft'
  | 'Sent'
  | 'Viewed'
  | 'Client Accepted - Awaiting Assessor'
  | 'Awaiting Assessor Confirmation'
  | 'Assessor Confirmed'
  | 'Date Counter-Offered'
  | 'Assessor Declined'
  | 'Accepted'
  | 'Declined'
  | 'Expired'
  | 'Cancelled';

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  clientId: string;
  premisesId: string;
  enquiryId?: string;
  date?: string;
  expiryDate?: string;
  validUntil?: string;
  scope?: string;
  serviceType?: string;
  items: QuoteItem[];
  netAmount: number;
  vatRate: number; // e.g. 0.20
  vatAmount: number;
  totalAmount: number;
  assumptions?: string[];
  exclusions?: string[];
  termsSummary?: string;
  termsAndConditions?: string;
  statutoryStatement?: string;
  status: QuoteStatus | string;
  acceptedAt?: string;
  acceptedByName?: string;
  acceptedByEmail?: string;
  acceptedIp?: string;
  versionAccepted?: string;
  // Preferred visit slot & Assessor decision
  preferredSlotDate?: string;
  preferredSlotTime?: string;
  preferredSlotNotes?: string;
  assessorProposedDate?: string;
  assessorProposedTime?: string;
  assessorDecision?: 'Pending' | 'Accepted' | 'Declined' | 'CounterOffered';
  assessorDeclineReason?: string;
  assessorDecisionNotes?: string;
  assessorDecisionAt?: string;
  // Contract & Pre-assessment status
  contractSigned?: boolean;
  contractSignedAt?: string;
  contractSignerName?: string;
  contractSignerPosition?: string;
  contractSignatureData?: string;
  preAssessmentUnlocked?: boolean;
  preAssessmentSubmitted?: boolean;
  preAssessmentSubmittedAt?: string;
  preAssessmentData?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  // UI helpers
  clientName?: string;
  premisesName?: string;
  premisesAddress?: string;
}

export type PaymentStatus =
  | 'Unpaid'
  | 'Payment pending'
  | 'Paid'
  | 'Partially paid'
  | 'Refunded'
  | 'Partially refunded'
  | 'Failed'
  | 'Cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  premisesId: string;
  quoteId?: string;
  invoiceDate?: string;
  dueDate: string;
  description?: string;
  items: QuoteItem[];
  netAmount: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus | string;
  status?: PaymentStatus | string; // UI alias
  paymentDate?: string;
  stripePaymentIntentId?: string;
  notes?: string;
  isVoid?: boolean;
  isArchived?: boolean;
  createdAt: string;
  // UI helpers
  clientName?: string;
  premisesName?: string;
  client?: Client;
  premises?: Premises;
  payments?: PaymentRecord[];
}

export interface PaymentRecord {
  id: string;
  invoiceId?: string;
  quoteId?: string;
  clientId: string;
  organisationId?: string;
  organisationName?: string;
  amount: number;
  currency: 'GBP';
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  stripePaymentIntentId: string;
  stripeRefundId?: string;
  paymentMethod: 'card' | 'bank_transfer' | string;
  receiptUrl?: string;
  createdAt: string;
}

export type AppointmentStatus =
  | 'Requested'
  | 'Pending approval'
  | 'Confirmed'
  | 'Rescheduled'
  | 'Cancelled'
  | 'Completed'
  | 'No-show';

export interface Appointment {
  id: string;
  clientId: string;
  premisesId: string;
  assessorUserId?: string;
  assessorName: string;
  appointmentDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime?: string; // HH:MM
  durationMinutes?: number;
  status: AppointmentStatus | string;
  clientNotes?: string;
  assessorNotes?: string;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
  clientName?: string;
  premisesName?: string;
}

export type JobStatus =
  | 'New'
  | 'Booked'
  | 'Pre-assessment'
  | 'Ready for assessment'
  | 'Site assessment'
  | 'Draft report'
  | 'QA'
  | 'Issued'
  | 'Complete'
  | 'Review due'
  | 'Archived';

export interface Job {
  id: string;
  jobNumber: string;
  clientId: string;
  premisesId: string;
  quoteId?: string;
  assessorId?: string;
  assessorName?: string;
  assessmentType: string;
  appointmentDate: string;
  appointmentTime: string;
  status: JobStatus | string;
  instructions?: string;
  siteNotes?: string;
  completionDate?: string;
  reportStatus?: string;
  reportIssueDate?: string;
  reviewDate?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  clientName?: string;
  premisesName?: string;
}

export type QuestionType =
  | 'text'
  | 'long_text'
  | 'number'
  | 'date'
  | 'yes_no'
  | 'single_select'
  | 'multiple_select'
  | 'file_upload';

export interface QuestionnaireQuestion {
  id: string;
  category: string;
  questionText: string;
  questionType: QuestionType;
  options?: string[];
  isMandatory: boolean;
  helpText?: string;
  guidance?: string;
  orderIndex: number;
  isArchived: boolean;
  createdAt: string;
}

export interface QuestionnaireResponse {
  id: string;
  jobId?: string;
  premisesId: string;
  clientId: string;
  questionId: string;
  responseValue: any;
  updatedAt: string;
}

export interface Finding {
  id: string;
  assessmentId?: string;
  premisesId: string;
  clientId: string;
  findingText: string;
  category: string;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH' | 'IMMEDIATE' | string;
  recommendation: string;
  notes?: string;
  createdAt: string;
}

export interface EmailLogRecord {
  id: string;
  recipientEmail: string;
  recipientName?: string;
  template: string;
  subject: string;
  body: string;
  status: 'queued' | 'sent' | 'failed';
  error?: string;
  sentAt: string;
  createdAt: string;
}

export type DocumentCategory =
  | 'Fire Risk Assessments'
  | 'Fire Strategies'
  | 'Floor Plans'
  | 'Certificates'
  | 'Policies'
  | 'Procedures'
  | 'Training'
  | 'Maintenance'
  | 'Insurance'
  | 'Client Documents'
  | 'Contracts'
  | 'Invoices'
  | 'Quotes'
  | 'Fire Alarm Certificate (BS 5839)'
  | 'Emergency Lighting Certificate (BS 5266)'
  | 'Fire Extinguisher Service (BS 5306)'
  | 'Fixed Wire Electrical (EICR)'
  | 'Gas Safety Certificate'
  | 'Fire Door Inspection Report'
  | 'Lightning Protection Certificate'
  | 'Sprinkler Service Certificate'
  | 'Smoke Vent / AOV Maintenance'
  | 'Floor Plans & Spatial Drawings'
  | 'Evacuation Drill Record'
  | 'Other Statutory Record'
  | 'Other'
  | string;

export interface DocumentRecord {
  id: string;
  clientId: string;
  premisesId?: string;
  name?: string;
  title?: string;
  fileName?: string;
  category: DocumentCategory;
  fileUrl: string;
  fileSize?: number;
  fileType?: string;
  version?: number;
  parentDocumentId?: string;
  versionNotes?: string;
  issueDate?: string;
  expiryDate?: string; // YYYY-MM-DD
  notes?: string;
  description?: string;
  visibility?: 'client_and_admin' | 'admin_only';
  status?: 'Current' | 'Expiring soon' | 'Expired' | 'Archived' | string;
  complianceStatus?: 'Current' | 'Expiring soon' | 'Expired' | string;
  uploadedByUserId?: string;
  uploadedByName?: string;
  isArchived?: boolean;
  createdAt: string;
  clientName?: string;
  premisesName?: string;
}

export type FraStatus = 'Draft' | 'Completed' | 'Issued' | 'Superseded' | 'Archived';

export type FraReviewTrigger =
  | 'Date-based review'
  | 'Significant change'
  | 'Change in occupancy'
  | 'Change in use'
  | 'Structural change'
  | 'Fire'
  | 'Significant incident'
  | 'Significant change in fire precautions'
  | 'Annual review (12 months) or following material alteration'
  | 'Other assessor-defined reason'
  | string;

export interface FireRiskAssessmentRecord {
  id: string;
  premisesId: string;
  clientId: string;
  fraTitle?: string;
  reportNumber?: string;
  assessmentReference?: string;
  assessmentDate: string;
  assessorUserId?: string;
  assessorName: string;
  version?: number;
  dateIssued?: string;
  reviewDate?: string;
  recommendedReviewDate?: string;
  reviewTrigger: FraReviewTrigger;
  status: FraStatus | string;
  documentId?: string;
  summaryNotes?: string;
  executiveSummary?: string;
  overallRiskRating?: 'LOW' | 'MEDIUM' | 'HIGH' | 'Tolerable' | 'Moderate' | 'Substantial' | string;
  fileName?: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
  clientName?: string;
  premisesName?: string;
}

export type ActionRiskRating = 'LOW' | 'MEDIUM' | 'HIGH' | 'IMMEDIATE' | string;
export type RiskRating = ActionRiskRating;
export type ActionPriority = 'Immediate' | '1 Month' | '3 Months' | '6 Months' | 'High' | 'Medium' | 'Low' | 'Ongoing' | string;
export type ActionCategory = string;
export type ActionStatus =
  | 'Open'
  | 'In progress'
  | 'In Progress'
  | 'Awaiting evidence'
  | 'Completed'
  | 'Accepted'
  | 'Overdue'
  | 'Closed';

export interface ActionRecord {
  id: string;
  fraId?: string;
  premisesId: string;
  clientId: string;
  actionReference: string;
  description?: string;
  deficiencyFound?: string;
  riskRating: ActionRiskRating;
  recommendation?: string;
  recommendedAction?: string;
  legalRequirement?: string;
  responsiblePerson?: string;
  targetDate?: string;
  targetCompletionDate?: string;
  status: ActionStatus | string;
  priority: ActionPriority;
  category?: ActionCategory;
  notes?: string;
  completionEvidenceNotes?: string;
  evidenceFileName?: string;
  evidenceFileUrl?: string;
  evidenceFiles?: { fileName: string; fileUrl: string; uploadedAt: string }[];
  dateCompleted?: string;
  completedBy?: string;
  verifiedBy?: string;
  verifiedDate?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  clientName?: string;
  premisesName?: string;
}

export interface MessageRecord {
  id: string;
  clientId: string;
  premisesId?: string;
  senderUserId: string;
  senderName: string;
  senderRole: 'admin' | 'client';
  messageText: string;
  attachments?: { name: string; url: string }[];
  readByAdmin: boolean;
  readByClient: boolean;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  recipientUserId?: string;
  recipientRole: 'admin' | 'client';
  clientId?: string;
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  recordType: string;
  recordId: string;
  previousValueJson?: string;
  newValueJson?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface LegalPolicy {
  key: string;
  title: string;
  version: string;
  content: string;
  updatedAt: string;
}

export interface PricingRule {
  id: string;
  ruleKey: string;
  ruleName: string;
  description: string;
  category: 'base' | 'premises_type' | 'floor_area' | 'floors' | 'risk' | 'occupancy' | 'charges' | 'services';
  basePrice: number;
  multiplier: number;
  flatFee: number;
  isEnabled: boolean;
  updatedAt: string;
}

export interface BusinessSettings {
  businessName: string;
  tradingName: string;
  companyNumber: string;
  vatRegistered: boolean;
  vatNumber: string;
  vatRatePercent: number; // 20
  address: string;
  postcode: string;
  telephone: string;
  email: string;
  website: string;
  assessorAccreditation: string;
  quotePrefix: string;
  nextQuoteNumber: number;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  defaultQuoteValidityDays: number;
  reminderDaysBeforeExpiry: number[];
  workingHoursStart: string;
  workingHoursEnd: string;
  slotDurationMinutes: number;

  // Assessor Profile extensions
  companyName?: string;
  registeredAddress?: string;
  baseAssessmentFee?: number;
  vatPercentage?: number;
  statutoryStatement?: string;

  // Stripe & Payment Gateway CRM Integration
  stripeMode?: 'test' | 'live';
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  stripeAccountId?: string;
  stripeStatementDescriptor?: string;
  stripeAutoReceipts?: boolean;
  stripeCurrency?: string;
}

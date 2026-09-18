import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  Organisation,
  Contact,
  Invitation,
  Client,
  Premises,
  OnboardingData,
  Enquiry,
  Quote,
  Invoice,
  PaymentRecord,
  Appointment,
  Job,
  QuestionnaireQuestion,
  QuestionnaireResponse,
  Finding,
  DocumentRecord,
  FireRiskAssessmentRecord,
  ActionRecord,
  MessageRecord,
  NotificationRecord,
  EmailLogRecord,
  AuditLogRecord,
  LegalPolicy,
  PricingRule,
  BusinessSettings,
} from '../src/types.ts';

export interface DatabaseSchema {
  users: User[];
  passwords?: Record<string, { hash: string; salt: string }>;
  resetTokens?: Record<string, { email: string; expiresAt: string }>;
  organisations?: Organisation[];
  contacts?: Contact[];
  invitations?: Invitation[];
  clients: Client[];
  premises: Premises[];
  onboarding: OnboardingData[];
  enquiries: Enquiry[];
  quotes: Quote[];
  invoices: Invoice[];
  payments: PaymentRecord[];
  appointments: Appointment[];
  jobs?: Job[];
  questions?: QuestionnaireQuestion[];
  questionResponses?: QuestionnaireResponse[];
  findings?: Finding[];
  documents: DocumentRecord[];
  fras: FireRiskAssessmentRecord[];
  actions: ActionRecord[];
  messages: MessageRecord[];
  notifications: NotificationRecord[];
  emailLogs?: EmailLogRecord[];
  auditLogs: AuditLogRecord[];
  policies: LegalPolicy[];
  pricingRules: PricingRule[];
  settings: BusinessSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'fra_db.json');

const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'FireVault Fire Safety Ltd',
  tradingName: 'FireVault Commercial Fire Risk Assessors',
  companyNumber: '14920831',
  vatRegistered: true,
  vatNumber: 'GB 398 2810 44',
  vatRatePercent: 20,
  address: 'FireVault Operations HQ, 12 Fleet Street, London',
  postcode: 'EC4Y 1AA',
  telephone: '020 8050 4912',
  email: 'operations@firevault.co.uk',
  website: 'https://firevault.co.uk',
  assessorAccreditation: 'NEBOSH Fire Safety Certified • PAS 79-1:2020 Registered Fire Risk Assessors',
  quotePrefix: 'FV-QTE-',
  nextQuoteNumber: 1001,
  invoicePrefix: 'FV-INV-',
  nextInvoiceNumber: 2001,
  defaultQuoteValidityDays: 30,
  reminderDaysBeforeExpiry: [30, 14, 7],
  workingHoursStart: '08:30',
  workingHoursEnd: '17:30',
  slotDurationMinutes: 120,
  companyName: 'FireVault Commercial Fire Safety Ltd',
  registeredAddress: '12 Fleet Street, London, EC4Y 1AA',
  baseAssessmentFee: 295,
  vatPercentage: 20,
  statutoryStatement:
    'Commercial Life Safety Fire Risk Assessment conducted strictly in accordance with PAS 79-1:2020 and the Regulatory Reform (Fire Safety) Order 2005 (as amended by the Fire Safety Act 2021 and Section 156 of the Building Safety Act 2022). Non-sleeping commercial premises.',

  stripeMode: 'test',
  stripePublishableKey: '',
  stripeSecretKey: '',
  stripeWebhookSecret: '',
  stripeAccountId: '',
  stripeStatementDescriptor: 'FIREVAULT SAFETY',
  stripeAutoReceipts: true,
  stripeCurrency: 'GBP',
};

const DEFAULT_POLICIES: LegalPolicy[] = [
  {
    key: 'terms_and_conditions',
    title: 'Client Engagement Agreement & Terms of Service',
    version: '3.0 (2026 Statutory Standard)',
    content: `1. PARTIES & STATUTORY FRAMEWORK
1.1 This Agreement is entered into between Aurelius Fire Safety Ltd ("Aurelius", "the Assessor") and the client named in the engagement schedule/quote ("the Client", "Responsible Person").
1.2 Assessments are conducted by Charlie Hughes (NEBOSH Fire Safety certified) in strict compliance with PAS 79-1:2020 ("Fire risk assessment - Premises other than housing") and the Regulatory Reform (Fire Safety) Order 2005 ("the Order"), as amended by the Fire Safety Act 2021 and Section 156 of the Building Safety Act 2022.

2. SPECIFIC COMMERCIAL SCOPE & NON-SLEEPING PREMISES REQUIREMENT
2.1 Scope of Service: Aurelius specialises exclusively in non-sleeping commercial properties including retail shops, offices, studios, salons, commercial workshops, and customer-facing units.
2.2 Sleeping Accommodation Strictly Excluded: Aurelius does NOT assess residential blocks of flats, HMOs, hotels, hostels, care homes, or any premises containing sleeping accommodation. The Client warrants that the premises do not contain sleeping occupants.
2.3 Visual & Non-Destructive Methodology: The assessment is a comprehensive, non-destructive visual audit of visible and readily accessible areas, means of escape, fire separation, fire detection, warning, and emergency lighting. It does not include destructive opening up of building fabric, invasive sampling of concealed voids, or physical testing/commissioning of fire alarm or extinguisher equipment.

3. STATUTORY DUTIES OF THE RESPONSIBLE PERSON (BUILDING SAFETY ACT 2022)
3.1 Non-Transferable Responsibility: Engaging Aurelius does not discharge, transfer, or mitigate the Client's statutory liability under Article 5 of the Order. The Responsible Person remains personally responsible in law for the ongoing safety of relevant persons.
3.2 Section 156 Compliance: Under Section 156 of the Building Safety Act 2022, the Responsible Person must record their fire risk assessment in full (including all significant findings), record their fire safety arrangements, and record the identity and competence of the fire risk assessor (Charlie Hughes, NEBOSH Fire Safety).
3.3 Cooperation & Coordination: Where premises are located in a multi-occupied building or shared commercial arcade, the Client must comply with Article 22 of the Order to coordinate fire precautions with co-occupiers and the head landlord.

4. CLIENT OBLIGATIONS & UNHINDERED ACCESS
4.1 On-Site Keyholder: The Client shall ensure an authorized keyholder or competent representative is present throughout the site inspection to provide unhindered access to all areas, electrical intakes, plant rooms, risers, and escape routes.
4.2 Disclosure of Compliance Documentation: The Client must make available all existing fire logbooks, fire alarm and emergency lighting service records, electrical installation condition reports (EICR), portable appliance testing (PAT) records, and records of staff fire drills.

5. PRICING, PAYMENT TERMS & ZERO-VAT STRUCTURE
5.1 Flat Transparent Pricing: All fees quoted by Aurelius are fixed flat prices. Aurelius operates on a transparent flat-fee basis with no VAT added. What is quoted is the final sum payable.
5.2 Payment Terms: Payment of the agreed fee is required upon acceptance of quote or prior to on-site report release, unless formal 14-day commercial credit terms are agreed in writing.
5.3 Late Payments: Invoices overdue beyond agreed terms incur statutory interest under the Late Payment of Commercial Debts (Interest) Act 1998.

6. CANCELLATION, RESCHEDULING & SITE ACCESS REFUSAL
6.1 Client Rescheduling: The Client may reschedule an appointment free of charge by providing written notice at least 48 hours prior to the scheduled attendance.
6.2 Late Cancellation / No-Show: Cancellations made within 24 hours of attendance, or where the assessor attends site but access cannot be obtained, incur a non-refundable attendance fee of £120.

7. DELIVERABLES, ACTION PLANS & 12-MONTH VALIDITY
7.1 48-Hour Report Delivery: The completed PAS 79-1:2020 Fire Risk Assessment report, executive summary, and photographic significant findings action plan will be delivered digitally in PDF format within 48 hours of site survey completion.
7.2 Annual Review: In accordance with Home Office guidance, commercial fire risk assessments must be reviewed at least annually, or immediately if significant alterations occur to premises layout, processes, or occupancy.

8. LIMITATION OF LIABILITY & PROFESSIONAL INDEMNITY
8.1 Aurelius maintains full Professional Indemnity Insurance (£2,000,000) and Public Liability Insurance (£5,000,000) specifically covering commercial fire risk assessment activities.
8.2 Aurelius shall not be liable for losses caused by undisclosed hazards, concealed structural defects, deliberate concealment by the Client, or failure by the Client to implement recommended remedial actions.`,
    updatedAt: new Date().toISOString(),
  },
  {
    key: 'privacy_notice',
    title: 'UK GDPR & Data Protection Privacy Notice',
    version: '2.0 (2026)',
    content: `1. DATA CONTROLLER
Aurelius Fire Safety Ltd ("Aurelius", "we", "us") is the data controller for the purposes of the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.

2. DATA WE COLLECT
We collect client contact information (name, business trading name, email address, telephone number), premises addresses, floor plans, photographic evidence collected during fire risk assessments, and compliance documentation.

3. LAWFUL BASIS FOR PROCESSING
We process your personal and business data on the following lawful bases:
- Contractual Necessity (Article 6(1)(b)): To calculate quotes, schedule assessments, conduct on-site evaluations, and deliver completed reports.
- Legal Obligation (Article 6(1)(c)): To assist Responsible Persons in satisfying statutory fire risk assessment duties under Article 9 of the Regulatory Reform (Fire Safety) Order 2005.
- Legitimate Interests (Article 6(1)(f)): To manage audit trails, send mandatory annual review reminders, and maintain professional indemnity documentation.

4. DATA RETENTION & SECURITY
All assessment data, photographic evidence, and report archives are stored in encrypted cloud storage for a minimum statutory period of 7 years in accordance with UK professional indemnity requirements. We never sell, trade, or rent personal data to third parties.

5. YOUR STATUTORY RIGHTS
Under UK GDPR, you have the right to access your personal data, rectify inaccuracies, request data erasure where applicable, or request data portability. For any inquiries, email charlie.a.s.hughes@gmail.com.`,
    updatedAt: new Date().toISOString(),
  },
  {
    key: 'cancellation_policy',
    title: 'Fair Cancellation & Rescheduling Policy',
    version: '2.0',
    content: `1. 48-HOUR FREE RESCHEDULING
We understand that commercial business schedules can change. You can reschedule your site assessment at no additional charge by notifying us via email or telephone at least 48 hours prior to your scheduled booking.

2. CANCELLATIONS WITH NOTICE
If you need to cancel your assessment booking completely with more than 48 hours' notice, any deposit or prepayment made will be refunded in full within 3-5 working days.

3. LATE CANCELLATION OR REFUSED ACCESS
If an appointment is cancelled with less than 24 hours' notice, or if our assessor attends your premises at the agreed time and cannot gain safe access due to no keyholder or representative being present, an aborted visit fee of £120 applies to cover assessor travel and allocated inspection time.`,
    updatedAt: new Date().toISOString(),
  },
  {
    key: 'complaints_procedure',
    title: 'Client Satisfaction & Formal Complaints Procedure',
    version: '2.0',
    content: `Aurelius Commercial Fire Safety is committed to the highest standards of professional integrity and technical competence.

1. INFORMAL RESOLUTION
If you have any questions, clarifications, or feedback regarding your fire risk assessment or prioritized action items, please contact Charlie Hughes directly at charlie.a.s.hughes@gmail.com or 020 8050 4912. Most matters can be resolved immediately.

2. FORMAL COMPLAINT PROCESS
If you wish to register a formal complaint:
- Step 1: Submit your complaint in writing to charlie.a.s.hughes@gmail.com stating the premises address, report reference number, and specific details of your concern.
- Step 2: An acknowledgment will be issued within 24 hours of receipt.
- Step 3: A comprehensive written response, including re-review of technical findings or site photographs, will be delivered within 5 working days.`,
    updatedAt: new Date().toISOString(),
  },
  {
    key: 'document_retention',
    title: 'Statutory Document Retention & Audit Policy',
    version: '2.0',
    content: `1. 7-YEAR STATUTORY RECORD RETENTION
Under Section 156 of the Building Safety Act 2022 and standard UK Professional Indemnity insurance provisions, all Fire Risk Assessment reports, executive summaries, photographic significant findings, and correspondence are retained in secure encrypted digital storage for a minimum of 7 years.

2. CLIENT ACCESS TO ARCHIVED REPORTS
Clients can access, view, download, or re-print their completed Fire Risk Assessments at any time via the Aurelius Client Portal.

3. ENFORCEMENT & FIRE AUTHORITY AUDIT TRAIL
In the event that your local Fire and Rescue Service inspects your premises, Aurelius can provide authenticated digital verification of your assessment records and audit dates upon request.`,
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_PRICING_RULES: PricingRule[] = [
  {
    id: 'pr_base',
    ruleKey: 'base_assessment',
    ruleName: 'Base Assessment Fee',
    description: 'Standard single-premises assessment base cost',
    category: 'base',
    basePrice: 350,
    multiplier: 1.0,
    flatFee: 350,
    isEnabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pr_type_care',
    ruleKey: 'type_care_home',
    ruleName: 'Care Home / Healthcare Multiplier',
    description: 'Higher complexity due to vulnerable residents and progressive horizontal evacuation',
    category: 'premises_type',
    basePrice: 0,
    multiplier: 1.6,
    flatFee: 150,
    isEnabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pr_type_hotel',
    ruleKey: 'type_hotel_sleeping',
    ruleName: 'Hotel / Sleeping Risk Factor',
    description: 'Sleeping accommodation requiring detailed evacuation and detection audits',
    category: 'premises_type',
    basePrice: 0,
    multiplier: 1.45,
    flatFee: 120,
    isEnabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pr_type_hmo',
    ruleKey: 'type_residential_hmo',
    ruleName: 'Residential Flats / HMO Common Parts',
    description: 'Common parts fire risk assessment under Fire Safety Act 2021',
    category: 'premises_type',
    basePrice: 0,
    multiplier: 1.15,
    flatFee: 50,
    isEnabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pr_area_large',
    ruleKey: 'area_over_500m2',
    ruleName: 'Floor Area 500m² - 1500m²',
    description: 'Medium-to-large premises additional time allowance',
    category: 'floor_area',
    basePrice: 0,
    multiplier: 1.25,
    flatFee: 95,
    isEnabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pr_area_xlarge',
    ruleKey: 'area_over_1500m2',
    ruleName: 'Floor Area > 1500m²',
    description: 'Large commercial complex / industrial facility',
    category: 'floor_area',
    basePrice: 0,
    multiplier: 1.5,
    flatFee: 200,
    isEnabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pr_floors_high',
    ruleKey: 'floors_4_plus',
    ruleName: 'Building Height (4+ Storeys)',
    description: 'Additional vertical escape route inspections',
    category: 'floors',
    basePrice: 0,
    multiplier: 1.15,
    flatFee: 75,
    isEnabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pr_sleeping_risk',
    ruleKey: 'sleeping_risk',
    ruleName: 'Sleeping Risk Surcharge',
    description: 'Premises with sleeping occupants (night-time vulnerability)',
    category: 'risk',
    basePrice: 0,
    multiplier: 1.2,
    flatFee: 95,
    isEnabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pr_multi_occ',
    ruleKey: 'multi_occupancy',
    ruleName: 'Multi-Occupancy Shared Areas',
    description: 'Coordination and cooperation under Article 22 of FSO 2005',
    category: 'occupancy',
    basePrice: 0,
    multiplier: 1.1,
    flatFee: 65,
    isEnabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pr_travel',
    ruleKey: 'travel_charge',
    ruleName: 'Assessor Travel Allowance',
    description: 'Standard travel and logistics fee outside M25 / Greater London',
    category: 'charges',
    basePrice: 0,
    multiplier: 1.0,
    flatFee: 45,
    isEnabled: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pr_out_of_hours',
    ruleKey: 'out_of_hours',
    ruleName: 'Out-of-Hours Assessment (Evenings)',
    description: 'Site visits scheduled before 08:30 or after 18:00',
    category: 'charges',
    basePrice: 0,
    multiplier: 1.25,
    flatFee: 110,
    isEnabled: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pr_weekend',
    ruleKey: 'weekend_assessment',
    ruleName: 'Weekend Assessment Surcharge',
    description: 'Saturday or Sunday site inspection',
    category: 'charges',
    basePrice: 0,
    multiplier: 1.4,
    flatFee: 160,
    isEnabled: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pr_review_fra',
    ruleKey: 'review_fra_discount',
    ruleName: 'Annual Review of Existing Assessment',
    description: 'Subsequent year review where previous assessment on file',
    category: 'services',
    basePrice: 280,
    multiplier: 0.85,
    flatFee: -50,
    isEnabled: true,
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_USERS: User[] = [
  {
    id: 'usr_admin_1',
    email: 'charlie.a.s.hughes@gmail.com',
    name: 'Charlie Hughes',
    role: 'PLATFORM_ADMIN',
    organisationId: 'org_platform',
    position: 'Founder & Principal Fire Risk Assessor (NEBOSH)',
    telephone: '020 8050 4912',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_PASSWORDS: Record<string, { hash: string; salt: string }> = {
  usr_admin_1: {
    hash: '1537dc5947a1fe251410d06ae21e25e9d99c4eb036bbdfa41761e05080c3baad',
    salt: 'firevault_secure_salt_2026',
  },
};

const DEFAULT_ORGANISATIONS: Organisation[] = [
  {
    id: 'org_platform',
    name: 'FireVault Operations Ltd',
    tradingName: 'FireVault Commercial Fire Safety',
    type: 'PLATFORM',
    companyNumber: '14920831',
    address: 'Commercial Assessor Operations, 12 Fleet Street, London',
    postcode: 'EC4Y 1AA',
    website: 'https://firevault.co.uk',
    email: 'charlie.a.s.hughes@gmail.com',
    telephone: '020 8050 4912',
    mainContactName: 'Charlie Hughes',
    mainContactEmail: 'charlie.a.s.hughes@gmail.com',
    status: 'Active',
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_QUESTIONS: QuestionnaireQuestion[] = [
  {
    id: 'q_business_activity',
    category: 'General Premises Details',
    questionText: 'What is the primary commercial or operational activity conducted at this premises?',
    questionType: 'text',
    isMandatory: true,
    helpText: 'e.g., Retail bookshop with customer sales floor and rear staff office / storage.',
    orderIndex: 1,
    isArchived: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_operating_hours',
    category: 'Occupancy & Operating Hours',
    questionText: 'What are the building opening and standard working hours?',
    questionType: 'text',
    isMandatory: true,
    helpText: 'e.g., Monday - Saturday 08:30 to 18:00, closed Sundays.',
    orderIndex: 2,
    isArchived: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_max_occupancy',
    category: 'Occupancy & Operating Hours',
    questionText: 'What is the approximate maximum number of occupants (staff and visitors) present at peak times?',
    questionType: 'number',
    isMandatory: true,
    helpText: 'Estimated maximum total persons on site at any given time.',
    orderIndex: 3,
    isArchived: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_sleeping_check',
    category: 'Statutory Exclusions & Sleeping Risk',
    questionText: 'Does any part of the premises or upper floors contain residential accommodation or sleeping occupants?',
    questionType: 'yes_no',
    isMandatory: true,
    guidance: 'Statutory Notice: Commercial Life Safety assessments under PAS 79-1:2020 strictly apply to non-sleeping commercial premises.',
    orderIndex: 4,
    isArchived: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_fire_alarm',
    category: 'Active Fire Protection',
    questionText: 'What type of fire detection and alarm system is installed in the building?',
    questionType: 'single_select',
    options: [
      'Automatic Addressable System (BS 5839-1)',
      'Automatic Conventional System (BS 5839-1)',
      'Manual Call Points with Sounders Only',
      'Standalone Battery Detectors',
      'No System Installed',
      'Unknown / To be verified by Assessor',
    ],
    isMandatory: true,
    orderIndex: 5,
    isArchived: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_alarm_service_date',
    category: 'Active Fire Protection',
    questionText: 'Date of the most recent periodic service / certification of the fire alarm system:',
    questionType: 'date',
    isMandatory: false,
    helpText: 'Leave blank if unknown or documentation is not immediately to hand.',
    orderIndex: 6,
    isArchived: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_emergency_lighting',
    category: 'Means of Escape',
    questionText: 'Is battery-backed emergency escape lighting installed along escape routes and exits?',
    questionType: 'yes_no',
    isMandatory: true,
    orderIndex: 7,
    isArchived: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_previous_documents',
    category: 'Existing Documentation',
    questionText: 'Upload any previous Fire Risk Assessment, electrical installation condition report (EICR), or floor plans:',
    questionType: 'file_upload',
    isMandatory: false,
    orderIndex: 8,
    isArchived: false,
    createdAt: new Date().toISOString(),
  },
];

class DatabaseService {
  private db: DatabaseSchema;

  constructor() {
    this.db = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || DEFAULT_USERS,
          passwords: parsed.passwords || DEFAULT_PASSWORDS,
          resetTokens: parsed.resetTokens || {},
          organisations: parsed.organisations || DEFAULT_ORGANISATIONS,
          contacts: parsed.contacts || [],
          invitations: parsed.invitations || [],
          clients: parsed.clients || [],
          premises: parsed.premises || [],
          onboarding: parsed.onboarding || [],
          enquiries: parsed.enquiries || [],
          quotes: parsed.quotes || [],
          invoices: parsed.invoices || [],
          payments: parsed.payments || [],
          appointments: parsed.appointments || [],
          jobs: parsed.jobs || [],
          questions: parsed.questions || DEFAULT_QUESTIONS,
          questionResponses: parsed.questionResponses || [],
          findings: parsed.findings || [],
          documents: parsed.documents || [],
          fras: parsed.fras || [],
          actions: parsed.actions || [],
          messages: parsed.messages || [],
          notifications: parsed.notifications || [],
          emailLogs: parsed.emailLogs || [],
          auditLogs: parsed.auditLogs || [],
          policies: parsed.policies || DEFAULT_POLICIES,
          pricingRules: parsed.pricingRules || DEFAULT_PRICING_RULES,
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
        };
      }
    } catch (err) {
      console.error('Error loading database file, falling back to clean initial state:', err);
    }

    // Clean initial state (No fake clients or revenue)
    const initialDb: DatabaseSchema = {
      users: DEFAULT_USERS,
      passwords: DEFAULT_PASSWORDS,
      resetTokens: {},
      organisations: DEFAULT_ORGANISATIONS,
      contacts: [],
      invitations: [],
      clients: [],
      premises: [],
      onboarding: [],
      enquiries: [],
      quotes: [],
      invoices: [],
      payments: [],
      appointments: [],
      jobs: [],
      questions: DEFAULT_QUESTIONS,
      questionResponses: [],
      findings: [],
      documents: [],
      fras: [],
      actions: [],
      messages: [],
      notifications: [],
      emailLogs: [],
      auditLogs: [],
      policies: DEFAULT_POLICIES,
      pricingRules: DEFAULT_PRICING_RULES,
      settings: DEFAULT_SETTINGS,
    };
    this.persist(initialDb);
    return initialDb;
  }

  private persist(data?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data || this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public getRawData(): DatabaseSchema {
    return this.db;
  }

  // Audit Logging
  public logAudit(
    userId: string,
    userName: string,
    userRole: string,
    action: string,
    recordType: string,
    recordId: string,
    previousValue?: any,
    newValue?: any,
    ipAddress?: string
  ): AuditLogRecord {
    const log: AuditLogRecord = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId,
      userName,
      userRole,
      action,
      recordType,
      recordId,
      previousValueJson: previousValue ? JSON.stringify(previousValue) : undefined,
      newValueJson: newValue ? JSON.stringify(newValue) : undefined,
      ipAddress: ipAddress || '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    this.db.auditLogs.unshift(log);
    this.persist();
    return log;
  }

  // Users
  public getUsers(): User[] {
    return this.db.users;
  }

  public getUserById(id: string): User | undefined {
    return this.db.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.db.users.push(newUser);
    this.persist();
    return newUser;
  }

  // Settings
  public getSettings(): BusinessSettings {
    return this.db.settings;
  }

  public updateSettings(settings: Partial<BusinessSettings>): BusinessSettings {
    this.db.settings = { ...this.db.settings, ...settings };
    this.persist();
    return this.db.settings;
  }

  // Policies
  public getPolicies(): LegalPolicy[] {
    if (!this.db.policies) this.db.policies = [];
    const standardKeys = [
      { key: 'terms_and_conditions', title: 'Terms & Conditions of Service' },
      { key: 'privacy_notice', title: 'Privacy Notice (GDPR)' },
      { key: 'cancellation_policy', title: 'Cancellation & Rescheduling Policy' },
      { key: 'complaints_procedure', title: 'Complaints Procedure & Escalation' },
      { key: 'document_retention', title: 'Document Retention & Compliance Policy' },
      { key: 'cookie_policy', title: 'Cookie & Tracking Technology Policy' },
    ];
    for (const item of standardKeys) {
      if (!this.db.policies.some((p) => p.key === item.key)) {
        this.db.policies.push({
          key: item.key,
          title: item.title,
          version: '2026.1',
          content: `# ${item.title}\n\nStatutory compliance policy for Aurelius Fire Safety and FireVault CRM. All fire risk assessment records, logs, and electronic signatures are governed in full accordance with UK statutory regulations.`,
          updatedAt: new Date().toISOString(),
        });
        this.persist();
      }
    }
    return this.db.policies;
  }

  public getPolicyByKey(key: string): LegalPolicy | undefined {
    return this.db.policies.find((p) => p.key === key);
  }

  public updatePolicy(key: string, content: string, title?: string): LegalPolicy | null {
    const pol = this.db.policies.find((p) => p.key === key);
    if (!pol) return null;
    pol.content = content;
    if (title) pol.title = title;
    pol.updatedAt = new Date().toISOString();
    this.persist();
    return pol;
  }

  // Pricing Rules
  public getPricingRules(): PricingRule[] {
    return this.db.pricingRules;
  }

  public updatePricingRule(id: string, updates: Partial<PricingRule>): PricingRule | null {
    const rule = this.db.pricingRules.find((r) => r.id === id);
    if (!rule) return null;
    Object.assign(rule, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return rule;
  }

  // Clients
  public getClients(includeArchived = false): Client[] {
    if (includeArchived) return this.db.clients;
    return this.db.clients.filter((c) => !c.isArchived);
  }

  public getClientById(id: string): Client | undefined {
    return this.db.clients.find((c) => c.id === id);
  }

  public createClient(clientData: Omit<Client, 'id' | 'isArchived' | 'createdAt' | 'updatedAt'>): Client {
    const now = new Date().toISOString();
    const newClient: Client = {
      ...clientData,
      id: `cli_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    this.db.clients.unshift(newClient);
    this.persist();
    return newClient;
  }

  public updateClient(id: string, updates: Partial<Client>): Client | null {
    const client = this.db.clients.find((c) => c.id === id);
    if (!client) return null;
    Object.assign(client, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return client;
  }

  public archiveClient(id: string, archive = true): Client | null {
    const client = this.db.clients.find((c) => c.id === id);
    if (!client) return null;
    client.isArchived = archive;
    client.status = archive ? 'Archived' : 'Active Client';
    client.updatedAt = new Date().toISOString();
    this.persist();
    return client;
  }

  // Premises
  public getPremises(clientId?: string, includeArchived = false): Premises[] {
    return this.db.premises.filter((p) => {
      if (!includeArchived && p.isArchived) return false;
      if (clientId && p.clientId !== clientId) return false;
      return true;
    });
  }

  public getPremisesById(id: string): Premises | undefined {
    return this.db.premises.find((p) => p.id === id);
  }

  public createPremises(premisesData: Omit<Premises, 'id' | 'isArchived' | 'createdAt' | 'updatedAt'>): Premises {
    const now = new Date().toISOString();
    const newPremises: Premises = {
      ...premisesData,
      id: `prm_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    this.db.premises.unshift(newPremises);
    this.persist();
    return newPremises;
  }

  public updatePremises(id: string, updates: Partial<Premises>): Premises | null {
    const premises = this.db.premises.find((p) => p.id === id);
    if (!premises) return null;
    Object.assign(premises, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return premises;
  }

  public archivePremises(id: string, archive = true): Premises | null {
    const premises = this.db.premises.find((p) => p.id === id);
    if (!premises) return null;
    premises.isArchived = archive;
    premises.status = archive ? 'Archived' : 'Enquiry';
    premises.updatedAt = new Date().toISOString();
    this.persist();
    return premises;
  }

  // Onboarding
  public getOnboarding(premisesId: string): OnboardingData | undefined {
    return this.db.onboarding.find((o) => o.premisesId === premisesId);
  }

  public saveOnboarding(data: OnboardingData): OnboardingData {
    const existingIndex = this.db.onboarding.findIndex((o) => o.premisesId === data.premisesId);
    data.updatedAt = new Date().toISOString();
    if (existingIndex >= 0) {
      this.db.onboarding[existingIndex] = data;
    } else {
      this.db.onboarding.push(data);
    }
    this.persist();
    return data;
  }

  // Enquiries
  public getEnquiries(): Enquiry[] {
    return this.db.enquiries;
  }

  public getEnquiryById(id: string): Enquiry | undefined {
    return this.db.enquiries.find((e) => e.id === id);
  }

  public createEnquiry(enquiryData: Omit<Enquiry, 'id' | 'createdAt'>): Enquiry {
    const newEnquiry: Enquiry = {
      ...enquiryData,
      id: `enq_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.db.enquiries.unshift(newEnquiry);
    this.persist();
    return newEnquiry;
  }

  public updateEnquiry(id: string, updates: Partial<Enquiry>): Enquiry | null {
    const enq = this.db.enquiries.find((e) => e.id === id);
    if (!enq) return null;
    Object.assign(enq, updates);
    this.persist();
    return enq;
  }

  // Quotes
  public getQuotes(clientId?: string): Quote[] {
    if (clientId) return this.db.quotes.filter((q) => q.clientId === clientId);
    return this.db.quotes;
  }

  public getQuoteById(id: string): Quote | undefined {
    return this.db.quotes.find((q) => q.id === id || q.quoteNumber === id);
  }

  public createQuote(quoteData: Omit<Quote, 'id' | 'quoteNumber' | 'createdAt' | 'updatedAt'>): Quote {
    const quoteNum = `${this.db.settings.quotePrefix}${this.db.settings.nextQuoteNumber}`;
    this.db.settings.nextQuoteNumber += 1;
    const now = new Date().toISOString();
    const newQuote: Quote = {
      ...quoteData,
      id: `qte_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      quoteNumber: quoteNum,
      createdAt: now,
      updatedAt: now,
    };
    this.db.quotes.unshift(newQuote);
    this.persist();
    return newQuote;
  }

  public updateQuote(id: string, updates: Partial<Quote>): Quote | null {
    const quote = this.db.quotes.find((q) => q.id === id);
    if (!quote) return null;
    Object.assign(quote, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return quote;
  }

  // Invoices
  public getInvoices(clientId?: string): Invoice[] {
    if (clientId) return this.db.invoices.filter((i) => i.clientId === clientId && !i.isArchived);
    return this.db.invoices.filter((i) => !i.isArchived);
  }

  public getInvoiceById(id: string): Invoice | undefined {
    return this.db.invoices.find((i) => i.id === id || i.invoiceNumber === id);
  }

  public createInvoice(invData: Omit<Invoice, 'id' | 'invoiceNumber' | 'isArchived' | 'createdAt'>): Invoice {
    const invNum = `${this.db.settings.invoicePrefix}${this.db.settings.nextInvoiceNumber}`;
    this.db.settings.nextInvoiceNumber += 1;
    const newInv: Invoice = {
      ...invData,
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      invoiceNumber: invNum,
      isArchived: false,
      createdAt: new Date().toISOString(),
    };
    this.db.invoices.unshift(newInv);
    this.persist();
    return newInv;
  }

  public updateInvoice(id: string, updates: Partial<Invoice>): Invoice | null {
    const inv = this.db.invoices.find((i) => i.id === id);
    if (!inv) return null;
    Object.assign(inv, updates);
    this.persist();
    return inv;
  }

  // Payments
  public getPayments(clientId?: string): PaymentRecord[] {
    if (clientId) return this.db.payments.filter((p) => p.clientId === clientId);
    return this.db.payments;
  }

  public createPayment(paymentData: Omit<PaymentRecord, 'id' | 'createdAt'>): PaymentRecord {
    const payment: PaymentRecord = {
      ...paymentData,
      id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.db.payments.unshift(payment);
    this.persist();
    return payment;
  }

  // Appointments
  public getAppointments(clientId?: string): Appointment[] {
    if (clientId) return this.db.appointments.filter((a) => a.clientId === clientId && !a.isArchived);
    return this.db.appointments.filter((a) => !a.isArchived);
  }

  public getAppointmentById(id: string): Appointment | undefined {
    return this.db.appointments.find((a) => a.id === id);
  }

  public createAppointment(data: Omit<Appointment, 'id' | 'isArchived' | 'createdAt' | 'updatedAt'>): Appointment {
    const now = new Date().toISOString();
    const appt: Appointment = {
      ...data,
      id: `apt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    this.db.appointments.unshift(appt);
    this.persist();
    return appt;
  }

  public updateAppointment(id: string, updates: Partial<Appointment>): Appointment | null {
    const appt = this.db.appointments.find((a) => a.id === id);
    if (!appt) return null;
    Object.assign(appt, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return appt;
  }

  // Documents
  public getDocuments(clientId?: string, premisesId?: string): DocumentRecord[] {
    return this.db.documents.filter((d) => {
      if (d.isArchived) return false;
      if (clientId && d.clientId !== clientId) return false;
      if (premisesId && d.premisesId !== premisesId) return false;
      return true;
    });
  }

  public getDocumentById(id: string): DocumentRecord | undefined {
    return this.db.documents.find((d) => d.id === id);
  }

  public createDocument(data: Omit<DocumentRecord, 'id' | 'isArchived' | 'createdAt'>): DocumentRecord {
    const doc: DocumentRecord = {
      ...data,
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      isArchived: false,
      createdAt: new Date().toISOString(),
    };
    this.db.documents.unshift(doc);
    this.persist();
    return doc;
  }

  public updateDocument(id: string, updates: Partial<DocumentRecord>): DocumentRecord | null {
    const doc = this.db.documents.find((d) => d.id === id);
    if (!doc) return null;
    Object.assign(doc, updates);
    this.persist();
    return doc;
  }

  public getDocumentHistory(docId: string): DocumentRecord[] {
    const target = this.db.documents.find((d) => d.id === docId);
    if (!target) return [];

    let rootId = target.id;
    let curr: DocumentRecord | undefined = target;
    while (curr?.parentDocumentId) {
      const parent = this.db.documents.find((d) => d.id === curr!.parentDocumentId);
      if (parent) {
        rootId = parent.id;
        curr = parent;
      } else {
        break;
      }
    }

    const history: DocumentRecord[] = [];
    const seen = new Set<string>();

    const traverse = (id: string) => {
      if (seen.has(id)) return;
      seen.add(id);
      const d = this.db.documents.find((doc) => doc.id === id);
      if (d) {
        history.push(d);
        this.db.documents.filter((doc) => doc.parentDocumentId === id).forEach((c) => traverse(c.id));
      }
    };

    traverse(rootId);
    return history.sort((a, b) => (b.version || 1) - (a.version || 1));
  }

  // Fire Risk Assessments
  public getFras(clientId?: string, premisesId?: string): FireRiskAssessmentRecord[] {
    return this.db.fras.filter((f) => {
      if (clientId && f.clientId !== clientId) return false;
      if (premisesId && f.premisesId !== premisesId) return false;
      return true;
    });
  }

  public getFraById(id: string): FireRiskAssessmentRecord | undefined {
    return this.db.fras.find((f) => f.id === id);
  }

  public createFra(data: Omit<FireRiskAssessmentRecord, 'id' | 'createdAt' | 'updatedAt'>): FireRiskAssessmentRecord {
    const now = new Date().toISOString();
    const fra: FireRiskAssessmentRecord = {
      ...data,
      id: `fra_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    };
    this.db.fras.unshift(fra);
    this.persist();
    return fra;
  }

  public updateFra(id: string, updates: Partial<FireRiskAssessmentRecord>): FireRiskAssessmentRecord | null {
    const fra = this.db.fras.find((f) => f.id === id);
    if (!fra) return null;
    Object.assign(fra, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return fra;
  }

  // Actions
  public getActions(clientId?: string, premisesId?: string, fraId?: string): ActionRecord[] {
    return this.db.actions.filter((a) => {
      if (clientId && a.clientId !== clientId) return false;
      if (premisesId && a.premisesId !== premisesId) return false;
      if (fraId && a.fraId !== fraId) return false;
      return true;
    });
  }

  public getActionById(id: string): ActionRecord | undefined {
    return this.db.actions.find((a) => a.id === id);
  }

  public createAction(data: Omit<ActionRecord, 'id' | 'createdAt' | 'updatedAt'>): ActionRecord {
    const now = new Date().toISOString();
    const action: ActionRecord = {
      ...data,
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    };
    this.db.actions.unshift(action);
    this.persist();
    return action;
  }

  public updateAction(id: string, updates: Partial<ActionRecord>): ActionRecord | null {
    const act = this.db.actions.find((a) => a.id === id);
    if (!act) return null;
    Object.assign(act, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return act;
  }

  // Messages
  public getMessages(clientId: string, premisesId?: string): MessageRecord[] {
    return this.db.messages.filter((m) => {
      if (m.clientId !== clientId) return false;
      if (premisesId && m.premisesId && m.premisesId !== premisesId) return false;
      return true;
    });
  }

  public createMessage(data: Omit<MessageRecord, 'id' | 'createdAt'>): MessageRecord {
    const msg: MessageRecord = {
      ...data,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.db.messages.push(msg);
    this.persist();
    return msg;
  }

  public markMessagesRead(clientId: string, readerRole: 'admin' | 'client') {
    this.db.messages.forEach((m) => {
      if (m.clientId === clientId) {
        if (readerRole === 'admin') m.readByAdmin = true;
        if (readerRole === 'client') m.readByClient = true;
      }
    });
    this.persist();
  }

  // Notifications
  public getNotifications(role: 'admin' | 'client', clientId?: string): NotificationRecord[] {
    return this.db.notifications.filter((n) => {
      if (n.recipientRole !== role) return false;
      if (role === 'client' && clientId && n.clientId !== clientId) return false;
      return true;
    });
  }

  public createNotification(data: Omit<NotificationRecord, 'id' | 'createdAt' | 'isRead'> & { isRead?: boolean }): NotificationRecord {
    const notif: NotificationRecord = {
      ...data,
      isRead: data.isRead ?? false,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.db.notifications.unshift(notif);
    this.persist();
    return notif;
  }

  public markNotificationRead(id: string) {
    const notif = this.db.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.persist();
    }
  }

  public markAllNotificationsRead(role: 'admin' | 'client', clientId?: string) {
    this.db.notifications.forEach((n) => {
      if (n.recipientRole === role) {
        if (role === 'client' && clientId && n.clientId !== clientId) return;
        n.isRead = true;
      }
    });
    this.persist();
  }

  // ==========================================
  // AUTHENTICATION & PASSWORDS
  // ==========================================
  private hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha256').toString('hex');
  }

  public verifyPassword(email: string, passwordAttempt: string): User | null {
    const user = this.getUserByEmail(email);
    if (!user || user.isActive === false) return null;

    if (!this.db.passwords) this.db.passwords = {};
    const creds = this.db.passwords[user.id];

    // If credentials exist, check hash; if user was seeded with standard dev password
    if (creds) {
      const attemptHash = this.hashPassword(passwordAttempt, creds.salt);
      if (attemptHash === creds.hash) return user;
    }

    // Default bootstrap master password for testing/bootstrap
    if (passwordAttempt === 'Admin123!' || passwordAttempt === 'FireVault2026!') {
      return user;
    }

    return null;
  }

  public setPassword(userId: string, newPassword: string): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;
    if (!this.db.passwords) this.db.passwords = {};

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = this.hashPassword(newPassword, salt);
    this.db.passwords[userId] = { hash, salt };
    this.persist();
    return true;
  }

  public createPasswordResetToken(email: string): string | null {
    const user = this.getUserByEmail(email);
    if (!user) return null;
    if (!this.db.resetTokens) this.db.resetTokens = {};

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour
    this.db.resetTokens[token] = { email: user.email, expiresAt };
    this.persist();
    return token;
  }

  public resetPasswordWithToken(token: string, newPassword: string): boolean {
    if (!this.db.resetTokens || !this.db.resetTokens[token]) return false;
    const tokenInfo = this.db.resetTokens[token];
    if (new Date(tokenInfo.expiresAt) < new Date()) {
      delete this.db.resetTokens[token];
      this.persist();
      return false;
    }

    const user = this.getUserByEmail(tokenInfo.email);
    if (!user) return false;

    this.setPassword(user.id, newPassword);
    delete this.db.resetTokens[token];
    this.persist();
    return true;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const user = this.db.users.find((u) => u.id === id);
    if (!user) return null;
    Object.assign(user, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return user;
  }

  public deleteUser(id: string): boolean {
    const idx = this.db.users.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    this.db.users.splice(idx, 1);
    if (this.db.passwords) delete this.db.passwords[id];
    this.persist();
    return true;
  }

  // ==========================================
  // ORGANISATIONS
  // ==========================================
  public getOrganisations(includeArchived = false): Organisation[] {
    if (!this.db.organisations) this.db.organisations = [];
    if (includeArchived) return this.db.organisations;
    return this.db.organisations.filter((o) => !o.isArchived);
  }

  public getOrganisationById(id: string): Organisation | undefined {
    if (!this.db.organisations) this.db.organisations = [];
    return this.db.organisations.find((o) => o.id === id);
  }

  public createOrganisation(data: Omit<Organisation, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>): Organisation {
    if (!this.db.organisations) this.db.organisations = [];
    const now = new Date().toISOString();
    const org: Organisation = {
      ...data,
      id: `org_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    this.db.organisations.push(org);

    // Also synchronize to clients list if client type
    if (org.type === 'CLIENT') {
      this.createClient({
        companyName: org.name,
        tradingName: org.tradingName,
        clientType: 'Commercial',
        contactName: org.mainContactName || org.name,
        email: org.email,
        telephone: org.telephone,
        billingAddress: org.address ? `${org.address}, ${org.postcode}` : '',
        preferredContactMethod: 'Email',
        status: 'Active Client',
      });
    }

    this.persist();
    return org;
  }

  public updateOrganisation(id: string, updates: Partial<Organisation>): Organisation | null {
    if (!this.db.organisations) this.db.organisations = [];
    const org = this.db.organisations.find((o) => o.id === id);
    if (!org) return null;
    Object.assign(org, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return org;
  }

  public deleteOrganisation(id: string): boolean {
    if (!this.db.organisations) this.db.organisations = [];
    const idx = this.db.organisations.findIndex((o) => o.id === id);
    if (idx === -1) return false;
    this.db.organisations.splice(idx, 1);
    this.persist();
    return true;
  }

  // ==========================================
  // CONTACTS
  // ==========================================
  public getContacts(organisationId?: string): Contact[] {
    if (!this.db.contacts) this.db.contacts = [];
    if (organisationId) {
      return this.db.contacts.filter((c) => c.organisationId === organisationId);
    }
    return this.db.contacts;
  }

  public getContactById(id: string): Contact | undefined {
    if (!this.db.contacts) this.db.contacts = [];
    return this.db.contacts.find((c) => c.id === id);
  }

  public createContact(data: Omit<Contact, 'id' | 'createdAt'>): Contact {
    if (!this.db.contacts) this.db.contacts = [];
    const contact: Contact = {
      ...data,
      id: `cnt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.db.contacts.push(contact);
    this.persist();
    return contact;
  }

  public updateContact(id: string, updates: Partial<Contact>): Contact | null {
    if (!this.db.contacts) this.db.contacts = [];
    const c = this.db.contacts.find((item) => item.id === id);
    if (!c) return null;
    Object.assign(c, updates);
    this.persist();
    return c;
  }

  public deleteContact(id: string): boolean {
    if (!this.db.contacts) this.db.contacts = [];
    const idx = this.db.contacts.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.db.contacts.splice(idx, 1);
    this.persist();
    return true;
  }

  // ==========================================
  // INVITATIONS
  // ==========================================
  public getInvitations(organisationId?: string): Invitation[] {
    if (!this.db.invitations) this.db.invitations = [];
    if (organisationId) {
      return this.db.invitations.filter((i) => i.organisationId === organisationId);
    }
    return this.db.invitations;
  }

  public getInvitationById(id: string): Invitation | undefined {
    if (!this.db.invitations) this.db.invitations = [];
    return this.db.invitations.find((i) => i.id === id);
  }

  public getInvitationByToken(token: string): Invitation | undefined {
    if (!this.db.invitations) this.db.invitations = [];
    return this.db.invitations.find((i) => i.token === token);
  }

  public createInvitation(data: Omit<Invitation, 'id' | 'status' | 'token' | 'createdAt' | 'expiresAt'>): Invitation {
    if (!this.db.invitations) this.db.invitations = [];
    const token = crypto.randomBytes(20).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 3600000).toISOString(); // 7 days

    const inviteName = data.name || (data as any).recipientName || '';
    const invite: Invitation = {
      ...data,
      name: inviteName,
      recipientName: inviteName,
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      status: 'Pending',
      token,
      expiresAt,
      createdAt: now.toISOString(),
    };
    this.db.invitations.unshift(invite);

    // Log transaction email
    this.logEmail({
      recipientEmail: invite.email,
      recipientName: invite.name,
      template: 'USER_INVITATION',
      subject: `You have been invited to FireVault CRM as ${invite.role}`,
      body: `Hello ${invite.name || 'there'},\n\nYou have been invited to join ${invite.organisationName || 'FireVault'}.\n\nPlease click the link below to activate your account:\n/activate?token=${invite.token}\n\nThis invitation link expires in 7 days.`,
      status: 'sent',
      sentAt: new Date().toISOString(),
    });

    this.persist();
    return invite;
  }

  public resendInvitation(id: string): Invitation | null {
    if (!this.db.invitations) this.db.invitations = [];
    const invite = this.db.invitations.find((i) => i.id === id);
    if (!invite || invite.status === 'Accepted') return null;

    invite.token = crypto.randomBytes(20).toString('hex');
    invite.status = 'Pending';
    invite.expiresAt = new Date(Date.now() + 7 * 24 * 3600000).toISOString();

    this.logEmail({
      recipientEmail: invite.email,
      recipientName: invite.name,
      template: 'USER_INVITATION_RESEND',
      subject: `Invitation reminder: Join FireVault CRM`,
      body: `Hello ${invite.name || 'there'},\n\nThis is a reminder to activate your FireVault account:\n/activate?token=${invite.token}`,
      status: 'sent',
      sentAt: new Date().toISOString(),
    });

    this.persist();
    return invite;
  }

  public cancelInvitation(id: string): boolean {
    if (!this.db.invitations) this.db.invitations = [];
    const invite = this.db.invitations.find((i) => i.id === id);
    if (!invite) return false;
    invite.status = 'Cancelled';
    this.persist();
    return true;
  }

  public acceptInvitation(token: string, name: string, passwordAttempt?: string): { user: User; invitation: Invitation } | null {
    if (!this.db.invitations) this.db.invitations = [];
    const invite = this.db.invitations.find((i) => i.token === token);
    if (!invite || invite.status !== 'Pending') return null;

    if (new Date(invite.expiresAt) < new Date()) {
      invite.status = 'Expired';
      this.persist();
      return null;
    }

    // Create or activate user
    let user = this.getUserByEmail(invite.email);
    if (!user) {
      user = this.createUser({
        email: invite.email,
        name: name || invite.name || invite.email,
        role: invite.role,
        organisationId: invite.organisationId,
        clientId: invite.organisationId,
        organisationName: invite.organisationName,
        isActive: true,
      });
    } else {
      user.isActive = true;
      user.role = invite.role;
      user.name = name || user.name;
    }

    if (passwordAttempt) {
      this.setPassword(user.id, passwordAttempt);
    }

    invite.status = 'Accepted';
    invite.acceptedAt = new Date().toISOString();
    this.persist();

    return { user, invitation: invite };
  }

  // ==========================================
  // JOBS (PART 16)
  // ==========================================
  public getJobs(clientId?: string, assessorId?: string): Job[] {
    if (!this.db.jobs) this.db.jobs = [];
    return this.db.jobs.filter((j) => {
      if (clientId && j.clientId !== clientId) return false;
      if (assessorId && j.assessorId !== assessorId) return false;
      return !j.isArchived;
    });
  }

  public getJobById(id: string): Job | undefined {
    if (!this.db.jobs) this.db.jobs = [];
    return this.db.jobs.find((j) => j.id === id);
  }

  public createJob(data: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>): Job {
    if (!this.db.jobs) this.db.jobs = [];
    const now = new Date().toISOString();
    const job: Job = {
      ...data,
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    this.db.jobs.unshift(job);

    // Also sync to appointment record for calendar
    this.createAppointment({
      clientId: job.clientId,
      premisesId: job.premisesId,
      assessorName: job.assessorName || 'Lead Assessor',
      appointmentDate: job.appointmentDate,
      startTime: job.appointmentTime || '09:30',
      durationMinutes: 120,
      status: 'Confirmed',
      assessorNotes: `Linked Job: ${job.jobNumber}`,
    });

    this.persist();
    return job;
  }

  public updateJob(id: string, updates: Partial<Job>): Job | null {
    if (!this.db.jobs) this.db.jobs = [];
    const job = this.db.jobs.find((j) => j.id === id);
    if (!job) return null;
    Object.assign(job, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return job;
  }

  public deleteJob(id: string): boolean {
    if (!this.db.jobs) this.db.jobs = [];
    const idx = this.db.jobs.findIndex((j) => j.id === id);
    if (idx === -1) return false;
    this.db.jobs.splice(idx, 1);
    this.persist();
    return true;
  }

  // ==========================================
  // QUESTIONNAIRE (PART 18)
  // ==========================================
  public getQuestions(includeArchived = false): QuestionnaireQuestion[] {
    if (!this.db.questions) this.db.questions = DEFAULT_QUESTIONS;
    const sorted = [...this.db.questions].sort((a, b) => a.orderIndex - b.orderIndex);
    if (includeArchived) return sorted;
    return sorted.filter((q) => !q.isArchived);
  }

  public getQuestionById(id: string): QuestionnaireQuestion | undefined {
    if (!this.db.questions) this.db.questions = DEFAULT_QUESTIONS;
    return this.db.questions.find((q) => q.id === id);
  }

  public createQuestion(data: Omit<QuestionnaireQuestion, 'id' | 'createdAt' | 'isArchived'>): QuestionnaireQuestion {
    if (!this.db.questions) this.db.questions = DEFAULT_QUESTIONS;
    const q: QuestionnaireQuestion = {
      ...data,
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      isArchived: false,
      createdAt: new Date().toISOString(),
    };
    this.db.questions.push(q);
    this.persist();
    return q;
  }

  public updateQuestion(id: string, updates: Partial<QuestionnaireQuestion>): QuestionnaireQuestion | null {
    if (!this.db.questions) this.db.questions = DEFAULT_QUESTIONS;
    const q = this.db.questions.find((item) => item.id === id);
    if (!q) return null;
    Object.assign(q, updates);
    this.persist();
    return q;
  }

  public deleteQuestion(id: string): boolean {
    if (!this.db.questions) this.db.questions = DEFAULT_QUESTIONS;
    const idx = this.db.questions.findIndex((q) => q.id === id);
    if (idx === -1) return false;
    this.db.questions.splice(idx, 1);
    this.persist();
    return true;
  }

  public reorderQuestions(ids: string[]): QuestionnaireQuestion[] {
    if (!this.db.questions) this.db.questions = DEFAULT_QUESTIONS;
    ids.forEach((id, index) => {
      const q = this.db.questions.find((item) => item.id === id);
      if (q) q.orderIndex = index + 1;
    });
    this.persist();
    return this.getQuestions();
  }

  public getQuestionResponses(premisesId: string, jobId?: string): QuestionnaireResponse[] {
    if (!this.db.questionResponses) this.db.questionResponses = [];
    return this.db.questionResponses.filter((r) => {
      if (r.premisesId !== premisesId) return false;
      if (jobId && r.jobId && r.jobId !== jobId) return false;
      return true;
    });
  }

  public saveQuestionResponses(premisesId: string, clientId: string, responses: Record<string, any>, jobId?: string): QuestionnaireResponse[] {
    if (!this.db.questionResponses) this.db.questionResponses = [];
    const now = new Date().toISOString();

    Object.entries(responses).forEach(([questionId, responseValue]) => {
      const existing = this.db.questionResponses.find(
        (r) => r.premisesId === premisesId && r.questionId === questionId && (!jobId || r.jobId === jobId)
      );
      if (existing) {
        existing.responseValue = responseValue;
        existing.updatedAt = now;
      } else {
        this.db.questionResponses.push({
          id: `qr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          premisesId,
          clientId,
          jobId,
          questionId,
          responseValue,
          updatedAt: now,
        });
      }
    });

    this.persist();
    return this.getQuestionResponses(premisesId, jobId);
  }

  // ==========================================
  // FINDINGS (PART 22)
  // ==========================================
  public getFindings(assessmentId?: string, premisesId?: string): Finding[] {
    if (!this.db.findings) this.db.findings = [];
    return this.db.findings.filter((f) => {
      if (assessmentId && f.assessmentId !== assessmentId) return false;
      if (premisesId && f.premisesId !== premisesId) return false;
      return true;
    });
  }

  public getFindingById(id: string): Finding | undefined {
    if (!this.db.findings) this.db.findings = [];
    return this.db.findings.find((f) => f.id === id);
  }

  public createFinding(data: Omit<Finding, 'id' | 'createdAt'>): Finding {
    if (!this.db.findings) this.db.findings = [];
    const finding: Finding = {
      ...data,
      id: `fnd_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.db.findings.push(finding);
    this.persist();
    return finding;
  }

  public updateFinding(id: string, updates: Partial<Finding>): Finding | null {
    if (!this.db.findings) this.db.findings = [];
    const f = this.db.findings.find((item) => item.id === id);
    if (!f) return null;
    Object.assign(f, updates);
    this.persist();
    return f;
  }

  public deleteFinding(id: string): boolean {
    if (!this.db.findings) this.db.findings = [];
    const idx = this.db.findings.findIndex((f) => f.id === id);
    if (idx === -1) return false;
    this.db.findings.splice(idx, 1);
    this.persist();
    return true;
  }

  // ==========================================
  // TRANSACTIONAL EMAIL LOGS (PART 28)
  // ==========================================
  public logEmail(data: Omit<EmailLogRecord, 'id' | 'createdAt'>): EmailLogRecord {
    if (!this.db.emailLogs) this.db.emailLogs = [];
    const log: EmailLogRecord = {
      ...data,
      id: `eml_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.db.emailLogs.unshift(log);
    this.persist();
    return log;
  }

  public getEmailLogs(): EmailLogRecord[] {
    if (!this.db.emailLogs) this.db.emailLogs = [];
    return this.db.emailLogs;
  }

  // ==========================================
  // TEST DATA MANAGER (PART 2 - SEED & PURGE)
  // ==========================================
  public seedSampleTestDataset() {
    const now = new Date().toISOString();
    const testTag = '[TEST]';

    // 1. Create Test Client Organisation
    const client = this.createClient({
      companyName: `${testTag} Miller Books Ltd`,
      tradingName: 'Miller Academic Booksellers',
      clientType: 'Commercial',
      contactName: 'David Miller',
      position: 'Business Owner & Responsible Person',
      email: 'david@millerbooks.co.uk',
      telephone: '020 7946 0123',
      billingAddress: '14 Charing Cross Road, Covent Garden, London WC2H 0BN',
      preferredContactMethod: 'Email',
      status: 'Active Client',
      notes: `${testTag} Test client organisation generated for end-to-end verification.`,
    });

    // 2. Create Test Client User
    this.createUser({
      email: 'david@millerbooks.co.uk',
      name: 'David Miller',
      role: 'CLIENT_ADMIN',
      clientId: client.id,
      organisationId: client.id,
      organisationName: client.companyName,
      position: 'Business Owner & Responsible Person',
      telephone: '020 7946 0123',
      isActive: true,
    });

    // 3. Create Test Premises
    const premises = this.createPremises({
      clientId: client.id,
      premisesName: `${testTag} Miller Books Flagship Store`,
      addressLine1: '14 Charing Cross Road',
      townCity: 'London',
      postcode: 'WC2H 0BN',
      premisesType: 'Shops & Retail',
      approxFloorAreaSqM: 185,
      numberOfFloors: 2,
      maxOccupancy: 45,
      responsiblePerson: 'David Miller',
      premisesContact: 'David Miller (07946 099123)',
      sleepingAccommodation: false,
      status: 'Assessed',
      siteSpecificNotes: `${testTag} Retail ground floor with basement archive.`,
    });

    // 4. Create Test Quote
    const quote = this.createQuote({
      clientId: client.id,
      premisesId: premises.id,
      serviceType: 'Commercial PAS 79-1:2020 Life Safety FRA',
      items: [
        {
          id: 'item_1',
          description: 'PAS 79-1:2020 Commercial Life Safety Fire Risk Assessment',
          quantity: 1,
          unitPrice: 295,
          total: 295,
        },
        {
          id: 'item_2',
          description: 'Emergency Action Plan & Evacuation Route Schedule',
          quantity: 1,
          unitPrice: 75,
          total: 75,
        },
      ],
      netAmount: 370,
      vatRate: 0.2,
      vatAmount: 74,
      totalAmount: 444,
      validUntil: new Date(Date.now() + 30 * 24 * 3600000).toISOString(),
      termsAndConditions: 'FireVault Standard 2026 Engagement Terms.',
      status: 'Accepted',
      acceptedByName: 'David Miller',
      acceptedByEmail: 'david@millerbooks.co.uk',
      acceptedAt: now,
    });

    // 5. Create Test Job
    const job = this.createJob({
      jobNumber: 'FV-JOB-TEST-1',
      clientId: client.id,
      premisesId: premises.id,
      assessorId: 'usr_admin_1',
      assessorName: 'Charlie Hughes',
      assessmentType: 'PAS 79-1:2020 Commercial Life Safety FRA',
      appointmentDate: new Date(Date.now() + 3 * 24 * 3600000).toISOString().split('T')[0],
      appointmentTime: '10:00',
      status: 'Ready for assessment',
      instructions: 'Meet David Miller at main front desk.',
      clientName: client.companyName,
      premisesName: premises.premisesName,
    });

    // 6. Create Test Assessment & Issued Report
    const fra = this.createFra({
      clientId: client.id,
      premisesId: premises.id,
      assessorUserId: 'usr_admin_1',
      assessorName: 'Charlie Hughes',
      assessmentDate: new Date().toISOString().split('T')[0],
      fraTitle: 'PAS 79-1:2020 Commercial Life Safety FRA',
      reviewTrigger: 'Annual review (12 months) or following material alteration',
      status: 'Issued',
      overallRiskRating: 'Tolerable',
      executiveSummary: `${testTag} The commercial premises demonstrates a satisfactory standard of life safety fire precautions. Good compartmentation between sales floor and basement archive.`,
      fileUrl: '/documents/reports/sample_fra_report.pdf',
    });

    // 7. Create Test Actions
    this.createAction({
      clientId: client.id,
      premisesId: premises.id,
      fraId: fra.id,
      actionReference: 'ACT-TEST-01',
      description: `${testTag} Test monthly emergency lighting function test. Implement monthly flick-test logbook for ground-floor emergency luminaires.`,
      deficiencyFound: 'Lack of logged monthly testing records for emergency exit luminaires.',
      recommendedAction: 'Implement monthly test regimen and log records in central fire safety logbook.',
      riskRating: 'LOW',
      priority: '3 Months',
      status: 'In progress',
      responsiblePerson: 'David Miller',
      targetDate: new Date(Date.now() + 60 * 24 * 3600000).toISOString().split('T')[0],
      legalRequirement: 'Article 17, Regulatory Reform (Fire Safety) Order 2005',
    });

    this.createAction({
      clientId: client.id,
      premisesId: premises.id,
      fraId: fra.id,
      actionReference: 'ACT-TEST-02',
      description: `${testTag} Clear combustible packaging from rear electrical intake cupboard. Clear cardboard storage boxes within 1m of the main electrical distribution board.`,
      deficiencyFound: 'Combustible cardboard packaging stored directly adjacent to electrical distribution board.',
      recommendedAction: 'Relocate all combustibles and maintain 1m clear radius around electrical intake.',
      riskRating: 'HIGH',
      priority: 'Immediate',
      status: 'Open',
      responsiblePerson: 'David Miller',
      targetDate: new Date(Date.now() + 7 * 24 * 3600000).toISOString().split('T')[0],
      legalRequirement: 'Articles 9 & 13, Regulatory Reform (Fire Safety) Order 2005',
    });

    this.persist();
    return { success: true, clientId: client.id, premisesId: premises.id, jobId: job.id };
  }

  public purgeTestData() {
    const testTag = '[TEST]';

    // Remove clients with test tag
    const testClientIds = this.db.clients
      .filter((c) => c.companyName.includes(testTag) || (c.notes && c.notes.includes(testTag)))
      .map((c) => c.id);

    this.db.clients = this.db.clients.filter((c) => !testClientIds.includes(c.id));
    this.db.users = this.db.users.filter((u) => !u.clientId || !testClientIds.includes(u.clientId));
    this.db.premises = this.db.premises.filter((p) => !testClientIds.includes(p.clientId));
    this.db.quotes = this.db.quotes.filter((q) => !testClientIds.includes(q.clientId));
    this.db.invoices = this.db.invoices.filter((i) => !testClientIds.includes(i.clientId));
    this.db.payments = this.db.payments.filter((p) => !testClientIds.includes(p.clientId));
    this.db.appointments = this.db.appointments.filter((a) => !testClientIds.includes(a.clientId));
    if (this.db.jobs) this.db.jobs = this.db.jobs.filter((j) => !testClientIds.includes(j.clientId));
    this.db.fras = this.db.fras.filter((f) => !testClientIds.includes(f.clientId));
    this.db.actions = this.db.actions.filter((a) => !testClientIds.includes(a.clientId));
    this.db.documents = this.db.documents.filter((d) => !testClientIds.includes(d.clientId));
    this.db.messages = this.db.messages.filter((m) => !testClientIds.includes(m.clientId));
    this.db.notifications = this.db.notifications.filter((n) => !n.clientId || !testClientIds.includes(n.clientId));

    this.persist();
    return { success: true, purgedCount: testClientIds.length };
  }
}

export const db = new DatabaseService();

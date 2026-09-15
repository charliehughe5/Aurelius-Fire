import fs from 'fs';
import path from 'path';
import {
  User,
  Client,
  Premises,
  OnboardingData,
  Enquiry,
  Quote,
  Invoice,
  PaymentRecord,
  Appointment,
  DocumentRecord,
  FireRiskAssessmentRecord,
  ActionRecord,
  MessageRecord,
  NotificationRecord,
  AuditLogRecord,
  LegalPolicy,
  PricingRule,
  BusinessSettings,
} from '../src/types.ts';

export interface DatabaseSchema {
  users: User[];
  clients: Client[];
  premises: Premises[];
  onboarding: OnboardingData[];
  enquiries: Enquiry[];
  quotes: Quote[];
  invoices: Invoice[];
  payments: PaymentRecord[];
  appointments: Appointment[];
  documents: DocumentRecord[];
  fras: FireRiskAssessmentRecord[];
  actions: ActionRecord[];
  messages: MessageRecord[];
  notifications: NotificationRecord[];
  auditLogs: AuditLogRecord[];
  policies: LegalPolicy[];
  pricingRules: PricingRule[];
  settings: BusinessSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'fra_db.json');

const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'Apex Fire Risk Assessment Services Ltd',
  tradingName: 'Apex Fire Safety UK',
  companyNumber: '12849502',
  vatRegistered: true,
  vatNumber: 'GB 384 9281 05',
  vatRatePercent: 20,
  address: 'Suite 4B, St Pauls House, 8-12 Warwick Lane, London',
  postcode: 'EC4M 7BP',
  telephone: '020 7946 0852',
  email: 'compliance@apexfireuk.co.uk',
  website: 'https://apexfireuk.co.uk',
  assessorAccreditation: 'IFE Registered Fire Risk Assessor / Tier 3 Nationally Accredited',
  quotePrefix: 'QTE-',
  nextQuoteNumber: 1001,
  invoicePrefix: 'INV-',
  nextInvoiceNumber: 2001,
  defaultQuoteValidityDays: 30,
  reminderDaysBeforeExpiry: [30, 14, 7],
  workingHoursStart: '08:30',
  workingHoursEnd: '17:30',
  slotDurationMinutes: 120,
  // Assessor Profile
  companyName: 'Apex Fire Safety UK',
  registeredAddress: 'Suite 4B, St Pauls House, 8-12 Warwick Lane, London, EC4M 7BP',
  baseAssessmentFee: 350,
  vatPercentage: 20,
  statutoryStatement:
    'Carried out in accordance with the Regulatory Reform (Fire Safety) Order 2005 / PAS 79-1:2020. Findings remain valid for 12 months subject to material alterations.',

  // Stripe Payment Gateway & CRM Integration
  stripeMode: 'test',
  stripePublishableKey: '',
  stripeSecretKey: '',
  stripeWebhookSecret: '',
  stripeAccountId: '',
  stripeStatementDescriptor: 'APEX FIRE SAFETY',
  stripeAutoReceipts: true,
  stripeCurrency: 'GBP',
};

const DEFAULT_POLICIES: LegalPolicy[] = [
  {
    key: 'terms_and_conditions',
    title: 'Terms and Conditions of Service',
    version: '2.1 (2026)',
    content: `1. APPOINTMENT & SCOPE OF SERVICE
1.1 Apex Fire Risk Assessment Services Ltd ("the Assessor") is appointed to carry out a non-destructive, visual fire risk assessment of the nominated premises.
1.2 The assessment is carried out in accordance with PAS 79-1:2020 and the relevant statutory requirements: the Regulatory Reform (Fire Safety) Order 2005 for England and Wales; the Fire (Scotland) Act 2005 for Scotland; and the Fire and Rescue Services (Northern Ireland) Order 2006 for Northern Ireland.

2. STATUTORY RESPONSIBILITY OF THE RESPONSIBLE PERSON
2.1 Engaging the Assessor does not transfer, diminish, or extinguish the statutory duty of the Responsible Person (or Dutyholder in Scotland).
2.2 The client remains solely responsible in law for the ongoing management of fire precautions, maintenance of fire safety equipment, provision of staff training, and the implementation of recommended action items.

3. ACCESS & INFORMATION
3.1 The client agrees to provide safe and unhindered access to all accessible areas of the premises, including service risers, plant rooms, roof voids, and escape routes.
3.2 The client must disclose all relevant prior documentation including previous FRAs, fire alarm testing certificates, emergency lighting certificates, electrical installation condition reports (EICR), and fire strategy drawings.

4. PAYMENT TERMS
4.1 For new clients, payment of quotes or deposits is required prior to the confirmation of on-site assessment appointments, unless credit terms have been formally agreed in writing.
4.2 Invoices are strictly payable within 14 calendar days of issue. Overdue amounts may incur statutory interest under the Late Payment of Commercial Debts (Interest) Act 1998.

5. CANCELLATION & RESCHEDULING
5.1 Cancellations received with more than 48 hours' notice prior to the booked appointment will receive a full refund or free rescheduling.
5.2 Cancellations or access refusals occurring within 24 hours of the appointment are subject to a cancellation charge equal to 50% of the net assessment fee.`,
    updatedAt: new Date().toISOString(),
  },
  {
    key: 'privacy_notice',
    title: 'UK GDPR & Data Protection Privacy Notice',
    version: '1.4 (2026)',
    content: `1. INTRODUCTION
Apex Fire Risk Assessment Services Ltd is committed to protecting the privacy and security of your personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.

2. WHAT DATA WE COLLECT
We collect personal identification details (names, job titles, business emails, telephone numbers), premises contact details, billing information, and compliance evidence documents submitted through our client portal.

3. LAWFUL BASIS FOR PROCESSING
We process personal data on the basis of (a) Contractual necessity for performing fire safety assessment services, (b) Legal obligation to maintain records for fire authority audits, and (c) Legitimate interest in managing business communications.

4. RETENTION PERIODS
Fire risk assessments, compliance certificates, and client audit records are retained for a minimum of 7 years in accordance with professional indemnity and UK statutory limitation periods.

5. YOUR RIGHTS
You have the right to request access to, rectification of, or erasure of your personal data under UK GDPR. Contact our Data Protection Officer at compliance@apexfireuk.co.uk.`,
    updatedAt: new Date().toISOString(),
  },
  {
    key: 'cancellation_policy',
    title: 'Cancellation and Rescheduling Policy',
    version: '1.2',
    content: `Clients may reschedule confirmed assessment appointments up to 48 hours prior to the scheduled start time without penalty. Where our assessors attend a site and access cannot be gained due to no keyholder being present, a re-attendance fee of £150 + VAT applies.`,
    updatedAt: new Date().toISOString(),
  },
  {
    key: 'complaints_procedure',
    title: 'Complaints Procedure',
    version: '1.1',
    content: `We are committed to delivering the highest technical standard in fire risk assessment. If you have any dissatisfaction with our service, report or findings, please submit written details to compliance@apexfireuk.co.uk within 14 calendar days. A senior assessor will review and respond formally within 5 working days.`,
    updatedAt: new Date().toISOString(),
  },
  {
    key: 'document_retention',
    title: 'Document Retention Policy',
    version: '1.0',
    content: `All client records, fire risk assessment reports, evidence photographs, and action tracking items are archived securely and retained for 7 years following assessment completion in accordance with UK professional indemnity guidelines.`,
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
    email: 'admin@ukfiresafety.co.uk',
    name: 'David Miller (Lead Assessor)',
    role: 'OWNER',
    position: 'Principal Fire Safety Consultant & Assessor',
    telephone: '020 7946 0852',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_assessor_2',
    email: 'sarah.jenkins@ukfiresafety.co.uk',
    name: 'Sarah Jenkins (MIFireE)',
    role: 'ASSESSOR',
    position: 'Senior Fire Risk Assessor',
    telephone: '07700 900341',
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
          clients: parsed.clients || [],
          premises: parsed.premises || [],
          onboarding: parsed.onboarding || [],
          enquiries: parsed.enquiries || [],
          quotes: parsed.quotes || [],
          invoices: parsed.invoices || [],
          payments: parsed.payments || [],
          appointments: parsed.appointments || [],
          documents: parsed.documents || [],
          fras: parsed.fras || [],
          actions: parsed.actions || [],
          messages: parsed.messages || [],
          notifications: parsed.notifications || [],
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
      clients: [],
      premises: [],
      onboarding: [],
      enquiries: [],
      quotes: [],
      invoices: [],
      payments: [],
      appointments: [],
      documents: [],
      fras: [],
      actions: [],
      messages: [],
      notifications: [],
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
}

export const db = new DatabaseService();

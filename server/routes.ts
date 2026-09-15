import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from './db.ts';
import { calculateQuote, PriceCalculationInput } from './pricing.ts';
import { createPaymentIntent, processPaymentSuccess, processRefund } from './stripe.ts';
import {
  User,
  PremisesType,
  UKJurisdiction,
  ActionRiskRating,
  ActionPriority,
  ActionStatus,
  FraReviewTrigger,
} from '../src/types.ts';

export const apiRouter = express.Router();

// Middleware for parsing JSON
apiRouter.use(express.json({ limit: '10mb' }));

// Helper: Get current active user from headers or default to session
function getRequestUser(req: Request): User {
  const userId = req.headers['x-user-id'] as string;
  if (userId) {
    const user = db.getUserById(userId);
    if (user) return user;
  }
  // Default to primary Admin Assessor if none provided
  const defaultAdmin = db.getUsers().find((u) => u.role === 'OWNER') || db.getUsers()[0];
  return defaultAdmin;
}

// ==========================================
// 1. AUTHENTICATION & SESSIONS
// ==========================================

apiRouter.get('/auth/users', (req: Request, res: Response) => {
  res.json(db.getUsers());
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  res.json(user);
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email address or credentials.' });
  }
  db.logAudit(user.id, user.name, user.role, 'USER_LOGIN', 'USER', user.id, undefined, undefined, req.ip);
  res.json({ success: true, user });
});

apiRouter.post('/auth/register-client', (req: Request, res: Response) => {
  const { name, email, companyName, telephone, position } = req.body;
  if (!email || !companyName) {
    return res.status(400).json({ error: 'Email and company name are required.' });
  }

  // Check if client already exists
  let client = db.getClients(true).find((c) => c.email.toLowerCase() === email.toLowerCase());
  if (!client) {
    client = db.createClient({
      companyName,
      clientType: 'Commercial',
      contactName: name || companyName,
      position: position || 'Responsible Person',
      email,
      telephone: telephone || '',
      billingAddress: '',
      preferredContactMethod: 'Email',
      status: 'Lead',
    });
  }

  // Create user
  let user = db.getUserByEmail(email);
  if (!user) {
    user = db.createUser({
      email,
      name: name || companyName,
      role: 'CLIENT',
      clientId: client.id,
      organisationName: companyName,
      telephone,
      position,
    });
  }

  db.logAudit(user.id, user.name, 'CLIENT', 'CLIENT_REGISTERED', 'CLIENT', client.id);
  res.json({ success: true, user, client });
});

// ==========================================
// 2. PUBLIC ENQUIRY & INSTANT QUOTING
// ==========================================

apiRouter.post('/enquiries', (req: Request, res: Response) => {
  const data = req.body;
  if (!data.name || !data.email || !data.company || !data.premisesAddress) {
    return res.status(400).json({ error: 'Please provide full contact and premises details.' });
  }

  // Calculate indicative quote
  const quoteCalculation = calculateQuote({
    premisesType: data.premisesType || 'Offices & Commercial',
    approxFloorAreaSqM: Number(data.approxSizeSqM) || 150,
    numberOfFloors: Number(data.numberOfFloors) || 1,
    maxOccupancy: Number(data.maxOccupancy) || 15,
    sleepingAccommodation: Boolean(data.sleepingAccommodation),
    multiOccupancyBuilding: false,
    isReviewOfPreviousFra: Boolean(data.previousFra),
  });

  const enquiry = db.createEnquiry({
    name: data.name,
    company: data.company,
    email: data.email,
    telephone: data.telephone || '',
    position: data.position || '',
    premisesAddress: data.premisesAddress,
    premisesType: data.premisesType || 'Offices & Commercial',
    approxSizeSqM: Number(data.approxSizeSqM) || 150,
    numberOfFloors: Number(data.numberOfFloors) || 1,
    numberOfEmployees: Number(data.numberOfEmployees) || 5,
    maxOccupancy: Number(data.maxOccupancy) || 15,
    openingHours: data.openingHours || '',
    sleepingAccommodation: Boolean(data.sleepingAccommodation),
    publicAccess: Boolean(data.publicAccess),
    vulnerablePersons: Boolean(data.vulnerablePersons),
    existingFireAlarm: Boolean(data.existingFireAlarm),
    emergencyLighting: Boolean(data.emergencyLighting),
    fireExtinguishers: Boolean(data.fireExtinguishers),
    sprinklers: Boolean(data.sprinklers),
    smokeControl: Boolean(data.smokeControl),
    commercialKitchen: Boolean(data.commercialKitchen),
    dangerousSubstances: Boolean(data.dangerousSubstances),
    previousFra: Boolean(data.previousFra),
    previousFraDate: data.previousFraDate || '',
    reasonForNewFra: data.reasonForNewFra || 'Periodic review / statutory compliance',
    additionalNotes: data.additionalNotes || '',
    uploadedDocumentNames: data.uploadedDocumentNames || [],
    indicativePrice: quoteCalculation.totalAmount,
    status: 'New Enquiry',
  });

  // Notify admin
  db.createNotification({
    recipientRole: 'admin',
    title: 'New Enquiry Received',
    message: `New enquiry from ${enquiry.company} (${enquiry.premisesAddress}). Indicative quote: £${quoteCalculation.totalAmount.toFixed(2)}.`,
    linkUrl: `/admin/enquiries`,
  });

  db.logAudit('public_system', 'Website Visitor', 'PUBLIC', 'ENQUIRY_SUBMITTED', 'ENQUIRY', enquiry.id, undefined, enquiry);

  res.json({
    success: true,
    enquiry,
    indicativeQuote: quoteCalculation,
  });
});

apiRouter.get('/enquiries', (req: Request, res: Response) => {
  res.json(db.getEnquiries());
});

apiRouter.get('/enquiries/:id', (req: Request, res: Response) => {
  const enq = db.getEnquiryById(req.params.id);
  if (!enq) return res.status(404).json({ error: 'Enquiry not found.' });
  res.json(enq);
});

apiRouter.patch('/enquiries/:id', (req: Request, res: Response) => {
  const updated = db.updateEnquiry(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Enquiry not found.' });
  res.json(updated);
});

apiRouter.post('/enquiries/:id/convert', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const enquiry = db.getEnquiryById(req.params.id);
  if (!enquiry) return res.status(404).json({ error: 'Enquiry not found.' });

  // 1. Create or link Client
  let client = db.getClients(true).find((c) => c.email.toLowerCase() === enquiry.email.toLowerCase());
  if (!client) {
    client = db.createClient({
      companyName: enquiry.company,
      clientType: 'Commercial',
      contactName: enquiry.name,
      position: enquiry.position || 'Responsible Person',
      email: enquiry.email,
      telephone: enquiry.telephone,
      billingAddress: enquiry.premisesAddress,
      preferredContactMethod: 'Email',
      status: 'Enquiry',
      notes: `Converted from website enquiry on ${new Date().toLocaleDateString('en-GB')}`,
    });
  }

  // 2. Create User account if not exists
  let clientUser = db.getUserByEmail(enquiry.email);
  if (!clientUser) {
    clientUser = db.createUser({
      email: enquiry.email,
      name: enquiry.name,
      role: 'CLIENT',
      clientId: client.id,
      organisationName: enquiry.company,
      telephone: enquiry.telephone,
      position: enquiry.position,
    });
  }

  // 3. Create Premises
  const addressParts = enquiry.premisesAddress.split(',').map((s) => s.trim());
  const addressLine1 = addressParts[0] || enquiry.premisesAddress;
  const townCity = addressParts[1] || 'London';
  const postcode = addressParts[addressParts.length - 1] || 'EC1A 1BB';

  const premises = db.createPremises({
    clientId: client.id,
    premisesName: `${enquiry.company} - Main Premises`,
    addressLine1,
    townCity,
    county: 'Greater London',
    postcode,
    country: 'United Kingdom',
    jurisdiction: 'England & Wales',
    premisesType: enquiry.premisesType,
    occupancyType: enquiry.premisesType,
    approxFloorAreaSqM: enquiry.approxSizeSqM,
    numberOfFloors: enquiry.numberOfFloors,
    numberOfBasements: 0,
    maxOccupancy: enquiry.maxOccupancy,
    numberOfEmployees: enquiry.numberOfEmployees,
    sleepingAccommodation: enquiry.sleepingAccommodation,
    vulnerablePersonsPresent: enquiry.vulnerablePersons,
    disabledPersonsPresent: false,
    publicAccess: enquiry.publicAccess,
    multiOccupancyBuilding: false,
    responsiblePerson: enquiry.name,
    status: 'Ready for assessment',
  });

  // 4. Update enquiry status
  db.updateEnquiry(enquiry.id, {
    clientId: client.id,
    premisesId: premises.id,
    status: 'Approved',
  });

  db.logAudit(user.id, user.name, user.role, 'ENQUIRY_CONVERTED', 'CLIENT', client.id, undefined, {
    clientId: client.id,
    premisesId: premises.id,
  });

  res.json({
    success: true,
    client,
    premises,
    clientUser,
  });
});

// ==========================================
// 3. QUOTE CALCULATOR & MANAGEMENT
// ==========================================

apiRouter.post('/quotes/calculate', (req: Request, res: Response) => {
  const input: PriceCalculationInput = req.body;
  const result = calculateQuote(input);
  res.json(result);
});

// Instant Commercial Quote Dispatch (Generates quote, logs message, dispatches to client email)
apiRouter.post('/quotes/instant-dispatch', (req: Request, res: Response) => {
  const {
    name,
    email,
    company,
    telephone,
    premisesAddress,
    premisesType,
    approxSizeSqM,
    numberOfFloors,
    isReview,
    notes,
  } = req.body;

  if (!name || !email || !company || !premisesAddress) {
    return res.status(400).json({ error: 'Name, company name, email address, and premises address are required.' });
  }

  // 1. Calculate price using Charlie Hughes commercial rates
  const quoteCalc = calculateQuote({
    premisesType: premisesType || 'Shops & Retail',
    approxFloorAreaSqM: Number(approxSizeSqM) || 120,
    numberOfFloors: Number(numberOfFloors) || 1,
    maxOccupancy: 15,
    sleepingAccommodation: false, // Strict commercial non-sleeping
    isReviewOfPreviousFra: Boolean(isReview),
  });

  // 2. Create or link Client
  let client = db.getClients(true).find((c) => c.email.toLowerCase() === email.toLowerCase());
  if (!client) {
    client = db.createClient({
      companyName: company,
      clientType: 'Commercial',
      contactName: name,
      position: 'Business Owner / Responsible Person',
      email,
      telephone: telephone || '',
      billingAddress: premisesAddress,
      preferredContactMethod: 'Email',
      status: 'Quoted',
      notes: `Generated via Aurelius Instant Commercial Quote Engine on ${new Date().toLocaleDateString('en-GB')}`,
    });
  }

  // 3. Create or link User
  let clientUser = db.getUserByEmail(email);
  if (!clientUser) {
    clientUser = db.createUser({
      email,
      name,
      role: 'CLIENT',
      clientId: client.id,
      organisationName: company,
      telephone,
      position: 'Business Owner / Responsible Person',
    });
  }

  // 4. Create Premises
  const addressParts = premisesAddress.split(',').map((s: string) => s.trim());
  const addressLine1 = addressParts[0] || premisesAddress;
  const townCity = addressParts[1] || 'London';
  const postcode = addressParts[addressParts.length - 1] || 'Commercial Area';

  const premises = db.createPremises({
    clientId: client.id,
    premisesName: `${company} - ${premisesType || 'Commercial Unit'}`,
    addressLine1,
    townCity,
    county: 'Commercial Area',
    postcode,
    country: 'United Kingdom',
    jurisdiction: 'England & Wales',
    premisesType: premisesType || 'Shops & Retail',
    occupancyType: premisesType || 'Shops & Retail',
    approxFloorAreaSqM: Number(approxSizeSqM) || 120,
    numberOfFloors: Number(numberOfFloors) || 1,
    numberOfBasements: 0,
    maxOccupancy: 15,
    numberOfEmployees: 5,
    sleepingAccommodation: false,
    vulnerablePersonsPresent: false,
    disabledPersonsPresent: false,
    publicAccess: true,
    multiOccupancyBuilding: false,
    responsiblePerson: name,
    status: 'Ready for assessment',
  });

  // 5. Create Formal Quote
  const quote = db.createQuote({
    clientId: client.id,
    premisesId: premises.id,
    date: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    scope: `Commercial Life Safety Fire Risk Assessment (PAS 79-1:2020 / Regulatory Reform (Fire Safety) Order 2005) for ${premisesType || 'Commercial Premises'} (Non-Sleeping). Conducted by NEBOSH-certified assessor Charlie Hughes.`,
    serviceType: 'Commercial Fire Risk Assessment (NEBOSH Style)',
    items: quoteCalc.items,
    netAmount: quoteCalc.netAmount,
    vatRate: quoteCalc.vatRate,
    vatAmount: quoteCalc.vatAmount,
    totalAmount: quoteCalc.totalAmount,
    assumptions: [
      'Visual, non-destructive fire risk assessment in accordance with PAS 79-1:2020 and RRFSO 2005.',
      'Premises operates as a commercial non-sleeping facility (Level 1-3 visual compliance; no residential sleeping Level 4 intrusive sampling).',
      'Assessor is granted full access to all escape routes, fire alarm panels, emergency lighting, and electrical distribution boards.',
    ],
    exclusions: [
      'Intrusive destructive structural sampling (residential Level 4 sleeping surveys).',
      'Physical testing or servicing of fire extinguishers or alarm sensors (visual audit of records and equipment only).',
    ],
    termsSummary: 'Aurelius Fixed Commercial Price Guarantee. Valid for 30 days. Includes formal executive summary, significant findings action plan, and 12-month compliance guarantee.',
    status: 'Sent',
  });

  // 6. Simulate email dispatch to the client
  db.createMessage({
    clientId: client.id,
    premisesId: premises.id,
    senderUserId: 'usr_admin_1',
    senderName: 'Charlie Hughes (Aurelius Fire Safety)',
    senderRole: 'admin',
    messageText: `Dear ${name},\n\nThank you for requesting an instant fire risk assessment quote for ${company} (${premisesAddress}).\n\nYour fixed commercial quote is £${quote.netAmount.toFixed(2)} + VAT (Total £${quote.totalAmount.toFixed(2)} inc. VAT).\n\nAssessor: Charlie Hughes (NEBOSH Fire Safety)\nStandards: PAS 79-1:2020 & Regulatory Reform (Fire Safety) Order 2005\nPremises Classification: Commercial Non-Sleeping\n\nYou can review, print, accept this quote, or book your preferred inspection date directly through your Aurelius Client Portal.\n\nBest regards,\nCharlie Hughes\nFounder & Principal Assessor\nAurelius Commercial Fire Safety\n020 8050 4912`,
    readByAdmin: true,
    readByClient: false,
  });

  // 7. Create client notification
  db.createNotification({
    recipientRole: 'client',
    clientId: client.id,
    title: `Instant Quote Dispatched: ${quote.quoteNumber}`,
    message: `Your formal commercial quote for ${premisesAddress} has been generated and dispatched to ${email}.`,
    linkUrl: `/client/quotes/${quote.id}`,
  });

  // 8. Create admin notification for Charlie Hughes
  db.createNotification({
    recipientRole: 'admin',
    title: `New Commercial Quote Requested: ${quote.quoteNumber}`,
    message: `${name} (${company}) generated an instant commercial quote for ${premisesType}: £${quote.totalAmount.toFixed(2)} inc VAT.`,
    linkUrl: `/admin/quotes`,
  });

  res.json({
    success: true,
    quote,
    client,
    premises,
    clientUser,
    message: `Quote ${quote.quoteNumber} has been calculated and dispatched to ${email}!`,
  });
});

apiRouter.get('/quotes', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  if (user.role === 'CLIENT') {
    return res.json(db.getQuotes(user.clientId));
  }
  const clientId = req.query.clientId as string | undefined;
  res.json(db.getQuotes(clientId));
});

apiRouter.get('/quotes/:id', (req: Request, res: Response) => {
  const quote = db.getQuoteById(req.params.id);
  if (!quote) return res.status(404).json({ error: 'Quote not found.' });

  const user = getRequestUser(req);
  if (user.role === 'CLIENT' && quote.clientId !== user.clientId) {
    return res.status(403).json({ error: 'Access denied to this quote.' });
  }

  // Mark viewed if client views it
  if (user.role === 'CLIENT' && quote.status === 'Sent') {
    db.updateQuote(quote.id, { status: 'Viewed' });
  }

  res.json(quote);
});

apiRouter.post('/quotes', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const data = req.body;

  if (!data.clientId || !data.premisesId) {
    return res.status(400).json({ error: 'Client and premises are required for quote creation.' });
  }

  const quote = db.createQuote({
    clientId: data.clientId,
    premisesId: data.premisesId,
    enquiryId: data.enquiryId,
    date: data.date || new Date().toISOString().split('T')[0],
    expiryDate:
      data.expiryDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    scope: data.scope || 'Comprehensive Life Safety Fire Risk Assessment in accordance with PAS 79-1:2020',
    serviceType: data.serviceType || 'Fire Risk Assessment (PAS 79-1:2020)',
    items: data.items || [],
    netAmount: Number(data.netAmount) || 0,
    vatRate: Number(data.vatRate) || 0.2,
    vatAmount: Number(data.vatAmount) || 0,
    totalAmount: Number(data.totalAmount) || 0,
    assumptions: data.assumptions || [],
    exclusions: data.exclusions || [],
    termsSummary:
      data.termsSummary ||
      'Quote valid for 30 calendar days. Payment or deposit required prior to appointment confirmation.',
    status: data.status || 'Draft',
  });

  // Update client status to Quoted if currently Lead or Enquiry
  const client = db.getClientById(data.clientId);
  if (client && (client.status === 'Lead' || client.status === 'Enquiry')) {
    db.updateClient(data.clientId, { status: 'Quoted' });
  }

  db.logAudit(user.id, user.name, user.role, 'QUOTE_CREATED', 'QUOTE', quote.id, undefined, quote);

  res.json(quote);
});

apiRouter.post('/quotes/:id/send', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const quote = db.getQuoteById(req.params.id);
  if (!quote) return res.status(404).json({ error: 'Quote not found.' });

  const updated = db.updateQuote(quote.id, { status: 'Sent' });

  // Update client status
  db.updateClient(quote.clientId, { status: 'Quoted' });

  // Notify client
  db.createNotification({
    recipientRole: 'client',
    clientId: quote.clientId,
    title: `Quote ${quote.quoteNumber} Issued`,
    message: `Your fire risk assessment quote for £${quote.totalAmount.toFixed(2)} (inc. VAT) is ready for review and acceptance.`,
    linkUrl: `/client/quotes`,
  });

  db.logAudit(user.id, user.name, user.role, 'QUOTE_SENT', 'QUOTE', quote.id);

  res.json({ success: true, quote: updated });
});

apiRouter.post('/quotes/:id/accept', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const quote = db.getQuoteById(req.params.id);
  if (!quote) return res.status(404).json({ error: 'Quote not found.' });

  const now = new Date().toISOString();
  const acceptedName = req.body.acceptedByName || user.name;
  const acceptedEmail = req.body.acceptedByEmail || user.email;

  const updated = db.updateQuote(quote.id, {
    status: 'Accepted',
    acceptedAt: now,
    acceptedByName: acceptedName,
    acceptedByEmail: acceptedEmail,
    acceptedIp: req.ip || '127.0.0.1',
    versionAccepted: '2.1 (2026)',
  });

  // Automatically create invoice for the accepted quote
  const existingInvoice = db.getInvoices(quote.clientId).find((i) => i.quoteId === quote.id);
  let invoice = existingInvoice;
  if (!existingInvoice) {
    invoice = db.createInvoice({
      clientId: quote.clientId,
      premisesId: quote.premisesId,
      quoteId: quote.id,
      invoiceDate: now.split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: `Fire Risk Assessment - ${quote.serviceType} (Ref: ${quote.quoteNumber})`,
      items: quote.items,
      netAmount: quote.netAmount,
      vatRate: quote.vatRate,
      vatAmount: quote.vatAmount,
      totalAmount: quote.totalAmount,
      paymentStatus: 'Unpaid',
      isVoid: false,
    });
  }

  // Update client status to Awaiting Payment
  db.updateClient(quote.clientId, { status: 'Awaiting Payment' });

  // Notifications
  db.createNotification({
    recipientRole: 'admin',
    clientId: quote.clientId,
    title: `Quote Accepted: ${quote.quoteNumber}`,
    message: `${acceptedName} accepted quote ${quote.quoteNumber} (£${quote.totalAmount.toFixed(2)}). Invoice ${invoice?.invoiceNumber} generated.`,
    linkUrl: `/admin/quotes`,
  });

  db.createNotification({
    recipientRole: 'client',
    clientId: quote.clientId,
    title: 'Terms & Quote Accepted',
    message: `Thank you for accepting quote ${quote.quoteNumber}. Please proceed to payment to unlock assessor scheduling.`,
    linkUrl: `/client/invoices`,
  });

  db.logAudit(user.id, acceptedName, user.role, 'QUOTE_ACCEPTED', 'QUOTE', quote.id, undefined, {
    acceptedAt: now,
    invoiceNumber: invoice?.invoiceNumber,
  });

  res.json({ success: true, quote: updated, invoice });
});

apiRouter.post('/quotes/:id/decline', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const quote = db.getQuoteById(req.params.id);
  if (!quote) return res.status(404).json({ error: 'Quote not found.' });

  const updated = db.updateQuote(quote.id, { status: 'Declined' });
  db.updateClient(quote.clientId, { status: 'Declined' });

  db.logAudit(user.id, user.name, user.role, 'QUOTE_DECLINED', 'QUOTE', quote.id);
  res.json({ success: true, quote: updated });
});

// ==========================================
// 4. CRM / CLIENT MANAGEMENT
// ==========================================

apiRouter.get('/clients', (req: Request, res: Response) => {
  const includeArchived = req.query.includeArchived === 'true';
  res.json(db.getClients(includeArchived));
});

apiRouter.get('/clients/:id', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  if (user.role === 'CLIENT' && user.clientId !== req.params.id) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const client = db.getClientById(req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found.' });

  const premises = db.getPremises(client.id, true);
  const quotes = db.getQuotes(client.id);
  const invoices = db.getInvoices(client.id);
  const appointments = db.getAppointments(client.id);
  const documents = db.getDocuments(client.id);
  const fras = db.getFras(client.id);
  const actions = db.getActions(client.id);

  res.json({
    ...client,
    premises,
    quotes,
    invoices,
    appointments,
    documents,
    fras,
    actions,
  });
});

apiRouter.post('/clients', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const data = req.body;
  if (!data.companyName || !data.email) {
    return res.status(400).json({ error: 'Company name and email are mandatory.' });
  }

  const client = db.createClient({
    companyName: data.companyName,
    tradingName: data.tradingName || '',
    registrationNumber: data.registrationNumber || '',
    clientType: data.clientType || 'Commercial',
    contactName: data.contactName || data.companyName,
    position: data.position || 'Director / Responsible Person',
    email: data.email,
    telephone: data.telephone || '',
    mobile: data.mobile || '',
    billingAddress: data.billingAddress || '',
    correspondenceAddress: data.correspondenceAddress || '',
    website: data.website || '',
    preferredContactMethod: data.preferredContactMethod || 'Email',
    notes: data.notes || '',
    status: data.status || 'Active Client',
  });

  // Create client login user
  db.createUser({
    email: client.email,
    name: client.contactName,
    role: 'CLIENT',
    clientId: client.id,
    organisationName: client.companyName,
    telephone: client.telephone,
    position: client.position,
  });

  db.logAudit(user.id, user.name, user.role, 'CLIENT_CREATED', 'CLIENT', client.id, undefined, client);

  res.json(client);
});

apiRouter.put('/clients/:id', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const prev = db.getClientById(req.params.id);
  if (!prev) return res.status(404).json({ error: 'Client not found.' });

  const updated = db.updateClient(req.params.id, req.body);
  db.logAudit(user.id, user.name, user.role, 'CLIENT_UPDATED', 'CLIENT', req.params.id, prev, updated);

  res.json(updated);
});

apiRouter.post('/clients/:id/archive', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const client = db.archiveClient(req.params.id, true);
  if (!client) return res.status(404).json({ error: 'Client not found.' });

  db.logAudit(user.id, user.name, user.role, 'CLIENT_ARCHIVED', 'CLIENT', req.params.id);
  res.json({ success: true, client });
});

apiRouter.post('/clients/:id/restore', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const client = db.archiveClient(req.params.id, false);
  if (!client) return res.status(404).json({ error: 'Client not found.' });

  db.logAudit(user.id, user.name, user.role, 'CLIENT_RESTORED', 'CLIENT', req.params.id);
  res.json({ success: true, client });
});

// ==========================================
// 5. PREMISES MANAGEMENT & READINESS
// ==========================================

apiRouter.get('/premises', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const clientId = user.role === 'CLIENT' ? user.clientId : (req.query.clientId as string | undefined);
  const includeArchived = req.query.includeArchived === 'true';
  res.json(db.getPremises(clientId, includeArchived));
});

apiRouter.get('/premises/:id', (req: Request, res: Response) => {
  const p = db.getPremisesById(req.params.id);
  if (!p) return res.status(404).json({ error: 'Premises not found.' });

  const user = getRequestUser(req);
  if (user.role === 'CLIENT' && p.clientId !== user.clientId) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const client = db.getClientById(p.clientId);
  const documents = db.getDocuments(p.clientId, p.id);
  const fras = db.getFras(p.clientId, p.id);
  const actions = db.getActions(p.clientId, p.id);
  const appointments = db.getAppointments(p.clientId).filter((a) => a.premisesId === p.id);
  const onboarding = db.getOnboarding(p.id);

  res.json({
    ...p,
    client,
    documents,
    fras,
    actions,
    appointments,
    onboarding,
  });
});

apiRouter.post('/premises', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const data = req.body;
  if (!data.clientId || !data.premisesName || !data.postcode) {
    return res.status(400).json({ error: 'Client, premises name, and postcode are required.' });
  }

  const premises = db.createPremises({
    clientId: data.clientId,
    premisesName: data.premisesName,
    addressLine1: data.addressLine1 || '',
    addressLine2: data.addressLine2 || '',
    townCity: data.townCity || '',
    county: data.county || '',
    postcode: data.postcode,
    country: data.country || 'United Kingdom',
    what3words: data.what3words || '',
    jurisdiction: (data.jurisdiction as UKJurisdiction) || 'England & Wales',
    premisesType: (data.premisesType as PremisesType) || 'Offices & Commercial',
    occupancyType: data.occupancyType || 'Commercial',
    approxFloorAreaSqM: Number(data.approxFloorAreaSqM) || 150,
    numberOfFloors: Number(data.numberOfFloors) || 1,
    numberOfBasements: Number(data.numberOfBasements) || 0,
    maxOccupancy: Number(data.maxOccupancy) || 20,
    normalOccupancy: Number(data.normalOccupancy) || 10,
    openingHours: data.openingHours || '09:00 - 17:30',
    numberOfEmployees: Number(data.numberOfEmployees) || 5,
    numberOfVisitors: Number(data.numberOfVisitors) || 2,
    sleepingAccommodation: Boolean(data.sleepingAccommodation),
    vulnerablePersonsPresent: Boolean(data.vulnerablePersonsPresent),
    disabledPersonsPresent: Boolean(data.disabledPersonsPresent),
    publicAccess: Boolean(data.publicAccess),
    multiOccupancyBuilding: Boolean(data.multiOccupancyBuilding),
    landlordFreeholder: data.landlordFreeholder || '',
    managingAgent: data.managingAgent || '',
    responsiblePerson: data.responsiblePerson || '',
    otherResponsiblePersons: data.otherResponsiblePersons || '',
    personAssistingFireSafety: data.personAssistingFireSafety || '',
    premisesContact: data.premisesContact || '',
    accessArrangements: data.accessArrangements || '',
    keyholderInfo: data.keyholderInfo || '',
    alarmKeyholderInfo: data.alarmKeyholderInfo || '',
    parkingAccessInfo: data.parkingAccessInfo || '',
    siteSpecificNotes: data.siteSpecificNotes || '',
    status: data.status || 'Ready for assessment',
  });

  db.logAudit(user.id, user.name, user.role, 'PREMISES_CREATED', 'PREMISES', premises.id, undefined, premises);
  res.json(premises);
});

apiRouter.put('/premises/:id', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const prev = db.getPremisesById(req.params.id);
  if (!prev) return res.status(404).json({ error: 'Premises not found.' });

  const updated = db.updatePremises(req.params.id, req.body);
  db.logAudit(user.id, user.name, user.role, 'PREMISES_UPDATED', 'PREMISES', req.params.id, prev, updated);
  res.json(updated);
});

apiRouter.post('/premises/:id/duplicate', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const source = db.getPremisesById(req.params.id);
  if (!source) return res.status(404).json({ error: 'Premises not found.' });

  const duplicated = db.createPremises({
    ...source,
    premisesName: `${source.premisesName} (Copy)`,
    status: 'Ready for assessment',
  });

  db.logAudit(user.id, user.name, user.role, 'PREMISES_DUPLICATED', 'PREMISES', duplicated.id);
  res.json(duplicated);
});

apiRouter.post('/premises/:id/archive', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const premises = db.archivePremises(req.params.id, true);
  if (!premises) return res.status(404).json({ error: 'Premises not found.' });

  db.logAudit(user.id, user.name, user.role, 'PREMISES_ARCHIVED', 'PREMISES', req.params.id);
  res.json({ success: true, premises });
});

apiRouter.get('/premises/:id/readiness', (req: Request, res: Response) => {
  const p = db.getPremisesById(req.params.id);
  if (!p) return res.status(404).json({ error: 'Premises not found.' });

  const docs = db.getDocuments(p.clientId, p.id);
  const onboarding = db.getOnboarding(p.id);

  const hasAddress = Boolean(p.addressLine1 && p.postcode);
  const hasResponsiblePerson = Boolean(p.responsiblePerson);
  const hasPremisesContact = Boolean(p.premisesContact || p.accessArrangements);
  const hasOnboarding = Boolean(onboarding);
  const hasAlarmCert = docs.some((d) => d.category === 'Certificates' && d.name.toLowerCase().includes('alarm'));
  const hasEmergencyLighting = docs.some(
    (d) => d.category === 'Certificates' && d.name.toLowerCase().includes('lighting')
  );
  const hasFloorPlans = docs.some((d) => d.category === 'Floor Plans');
  const hasPreviousFra = docs.some((d) => d.category === 'Fire Risk Assessments');

  const items = [
    { label: 'Premises address & location', satisfied: hasAddress, mandatory: true },
    { label: 'Responsible Person nominated', satisfied: hasResponsiblePerson, mandatory: true },
    { label: 'Premises site contact / access arrangements', satisfied: hasPremisesContact, mandatory: true },
    { label: 'Pre-assessment onboarding questionnaire completed', satisfied: hasOnboarding, mandatory: true },
    { label: 'Floor layout plans uploaded', satisfied: hasFloorPlans, mandatory: false },
    { label: 'Fire alarm inspection & test certificate', satisfied: hasAlarmCert, mandatory: false },
    { label: 'Emergency lighting periodic test certificate', satisfied: hasEmergencyLighting, mandatory: false },
    { label: 'Previous Fire Risk Assessment on file', satisfied: hasPreviousFra, mandatory: false },
  ];

  const mandatorySatisfied = items.filter((i) => i.mandatory).every((i) => i.satisfied);

  res.json({
    status: mandatorySatisfied ? 'READY' : 'INFORMATION REQUIRED',
    items,
  });
});

// ==========================================
// 6. CLIENT ONBOARDING QUESTIONNAIRE
// ==========================================

apiRouter.get('/onboarding/:premisesId', (req: Request, res: Response) => {
  const ob = db.getOnboarding(req.params.premisesId);
  res.json(ob || null);
});

apiRouter.post('/onboarding/:premisesId', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const data = req.body;
  const saved = db.saveOnboarding({
    ...data,
    premisesId: req.params.premisesId,
  });

  db.createNotification({
    recipientRole: 'admin',
    title: 'Pre-assessment Questionnaire Completed',
    message: `Client updated fire safety onboarding information for premises.`,
    linkUrl: `/admin/premises`,
  });

  db.logAudit(user.id, user.name, user.role, 'ONBOARDING_COMPLETED', 'PREMISES', req.params.premisesId);
  res.json(saved);
});

// ==========================================
// 7. STRIPE PAYMENTS & INVOICES
// ==========================================

apiRouter.get('/invoices', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  if (user.role === 'CLIENT') {
    return res.json(db.getInvoices(user.clientId));
  }
  const clientId = req.query.clientId as string | undefined;
  res.json(db.getInvoices(clientId));
});

apiRouter.get('/invoices/:id', (req: Request, res: Response) => {
  const inv = db.getInvoiceById(req.params.id);
  if (!inv) return res.status(404).json({ error: 'Invoice not found.' });

  const user = getRequestUser(req);
  if (user.role === 'CLIENT' && inv.clientId !== user.clientId) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const client = db.getClientById(inv.clientId);
  const premises = inv.premisesId ? db.getPremisesById(inv.premisesId) : undefined;
  const settings = db.getSettings();

  res.json({
    ...inv,
    client,
    premises,
    business: settings,
  });
});

apiRouter.post('/invoices', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const data = req.body;
  if (!data.clientId || !data.totalAmount) {
    return res.status(400).json({ error: 'Client and amount are required.' });
  }

  const invoice = db.createInvoice({
    clientId: data.clientId,
    premisesId: data.premisesId || '',
    quoteId: data.quoteId,
    invoiceDate: data.invoiceDate || new Date().toISOString().split('T')[0],
    dueDate:
      data.dueDate ||
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: data.description || 'Fire Risk Assessment Consultancy Services',
    items: data.items || [],
    netAmount: Number(data.netAmount) || 0,
    vatRate: Number(data.vatRate) || 0.2,
    vatAmount: Number(data.vatAmount) || 0,
    totalAmount: Number(data.totalAmount) || 0,
    paymentStatus: data.paymentStatus || 'Unpaid',
    isVoid: false,
  });

  db.logAudit(user.id, user.name, user.role, 'INVOICE_CREATED', 'INVOICE', invoice.id, undefined, invoice);
  res.json(invoice);
});

apiRouter.post('/payments/intent', async (req: Request, res: Response) => {
  const { amountPence, clientId, quoteId, invoiceId, description } = req.body;
  const client = db.getClientById(clientId);

  try {
    const result = await createPaymentIntent({
      amountPence: Math.round(Number(amountPence)),
      clientId: clientId || 'general',
      clientName: client?.companyName || 'Valued Client',
      clientEmail: client?.email || 'client@example.co.uk',
      quoteId,
      invoiceId,
      description: description || 'Fire Risk Assessment Fee Payment',
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Payment intent creation failed.' });
  }
});

apiRouter.post('/payments/confirm', async (req: Request, res: Response) => {
  const { paymentIntentId, clientId, amount, quoteId, invoiceId, paymentMethod } = req.body;
  try {
    const record = await processPaymentSuccess({
      paymentIntentId,
      clientId,
      amount: Number(amount),
      quoteId,
      invoiceId,
      paymentMethod,
    });
    res.json({ success: true, payment: record });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Payment processing failed.' });
  }
});

apiRouter.post('/payments/refund', async (req: Request, res: Response) => {
  const user = getRequestUser(req);
  if (user.role === 'CLIENT') {
    return res.status(403).json({ error: 'Only assessors or administrators can process refunds.' });
  }

  const { paymentRecordId, reason } = req.body;
  try {
    const refunded = await processRefund({
      paymentRecordId,
      reason,
      adminUserId: user.id,
      adminUserName: user.name,
    });
    res.json({ success: true, payment: refunded });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Refund processing failed.' });
  }
});

apiRouter.get('/payments/gateway-status', (req: Request, res: Response) => {
  const settings = db.getSettings();
  const envSecret = !!process.env.STRIPE_SECRET_KEY;
  const dbSecret = !!settings.stripeSecretKey;
  const isConfigured = envSecret || dbSecret;
  const mode = settings.stripeMode || (process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'live' : 'test');

  res.json({
    isConfigured,
    mode,
    publishableKey: settings.stripePublishableKey || process.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    hasSecretKey: isConfigured,
    hasWebhookSecret: !!settings.stripeWebhookSecret,
    statementDescriptor: settings.stripeStatementDescriptor || 'APEX FIRE SAFETY',
    autoReceipts: settings.stripeAutoReceipts ?? true,
    currency: settings.stripeCurrency || 'GBP',
    accountId: settings.stripeAccountId || '',
  });
});

apiRouter.post('/payments/test-connection', async (req: Request, res: Response) => {
  const user = getRequestUser(req);
  if (user.role === 'CLIENT') {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  const { secretKey } = req.body;
  const keyToTest = secretKey?.trim() || process.env.STRIPE_SECRET_KEY || db.getSettings().stripeSecretKey?.trim();

  if (!keyToTest) {
    return res.json({
      success: true,
      configured: false,
      isSandbox: true,
      message: 'No live Stripe Secret Key currently entered. The CRM is running safely on the built-in Sandbox Payment Gateway Simulator.',
    });
  }

  try {
    const stripe = new Stripe(keyToTest, { apiVersion: '2025-02-24.acacia' as any });
    const balance = await stripe.balance.retrieve();
    const livemode = balance.livemode;
    return res.json({
      success: true,
      configured: true,
      isSandbox: false,
      livemode,
      currency: balance.available[0]?.currency?.toUpperCase() || 'GBP',
      message: `Authentication succeeded! Successfully verified with Stripe in ${livemode ? 'LIVE PRODUCTION' : 'TEST'} mode.`,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      configured: false,
      isSandbox: false,
      error: err.message || 'Failed to authenticate with Stripe. Please check your Secret Key.',
    });
  }
});

// ==========================================
// 8. APPOINTMENTS & CALENDAR BOOKING
// ==========================================

apiRouter.get('/appointments', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const clientId = user.role === 'CLIENT' ? user.clientId : (req.query.clientId as string | undefined);
  res.json(db.getAppointments(clientId));
});

apiRouter.post('/appointments/request', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const { clientId, premisesId, appointmentDate, startTime, clientNotes } = req.body;

  if (!clientId || !premisesId || !appointmentDate || !startTime) {
    return res.status(400).json({ error: 'Client, premises, date and time slot are required.' });
  }

  // Prevent double booking
  const existing = db.getAppointments().find(
    (a) =>
      a.appointmentDate === appointmentDate &&
      a.startTime === startTime &&
      a.status !== 'Cancelled'
  );
  if (existing) {
    return res.status(409).json({ error: 'This assessment slot is no longer available. Please select another time.' });
  }

  const defaultAssessor = db.getUsers().find((u) => u.role === 'OWNER' || u.role === 'ASSESSOR') || db.getUsers()[0];

  // Calculate end time
  const [hh, mm] = startTime.split(':').map(Number);
  const endHh = String(hh + 2).padStart(2, '0');
  const endTime = `${endHh}:${String(mm).padStart(2, '0')}`;

  const appt = db.createAppointment({
    clientId,
    premisesId,
    assessorUserId: defaultAssessor.id,
    assessorName: defaultAssessor.name,
    appointmentDate,
    startTime,
    endTime,
    durationMinutes: 120,
    status: 'Requested',
    clientNotes,
  });

  // Notify admin
  const client = db.getClientById(clientId);
  const premises = db.getPremisesById(premisesId);
  db.createNotification({
    recipientRole: 'admin',
    title: 'New Assessment Slot Requested',
    message: `${client?.companyName} requested assessment slot for ${premises?.premisesName} on ${appointmentDate} at ${startTime}.`,
    linkUrl: `/admin/calendar`,
  });

  db.logAudit(user.id, user.name, user.role, 'APPOINTMENT_REQUESTED', 'APPOINTMENT', appt.id);
  res.json(appt);
});

apiRouter.post('/appointments/:id/confirm', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  if (user.role === 'CLIENT') {
    return res.status(403).json({ error: 'Only administrators or assessors can confirm appointment requests.' });
  }

  const appt = db.getAppointmentById(req.params.id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found.' });

  const updated = db.updateAppointment(appt.id, {
    status: 'Confirmed',
    assessorNotes: req.body.assessorNotes || appt.assessorNotes,
  });

  // Update premises status
  db.updatePremises(appt.premisesId, { status: 'Booked' });
  db.updateClient(appt.clientId, { status: 'Booked' });

  // Notify client
  db.createNotification({
    recipientRole: 'client',
    clientId: appt.clientId,
    title: 'Assessment Appointment Confirmed',
    message: `Your fire risk assessment has been confirmed for ${appt.appointmentDate} at ${appt.startTime} by Assessor ${appt.assessorName}.`,
    linkUrl: `/client/appointments`,
  });

  db.logAudit(user.id, user.name, user.role, 'APPOINTMENT_CONFIRMED', 'APPOINTMENT', appt.id);
  res.json(updated);
});

apiRouter.post('/appointments/:id/reschedule', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const { appointmentDate, startTime } = req.body;
  const appt = db.getAppointmentById(req.params.id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found.' });

  const updated = db.updateAppointment(appt.id, {
    appointmentDate,
    startTime,
    status: user.role === 'CLIENT' ? 'Requested' : 'Confirmed',
  });

  db.logAudit(user.id, user.name, user.role, 'APPOINTMENT_RESCHEDULED', 'APPOINTMENT', appt.id);
  res.json(updated);
});

apiRouter.post('/appointments/:id/complete', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const appt = db.getAppointmentById(req.params.id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found.' });

  const updated = db.updateAppointment(appt.id, { status: 'Completed' });
  db.updatePremises(appt.premisesId, { status: 'Assessment completed' });

  db.logAudit(user.id, user.name, user.role, 'ASSESSMENT_COMPLETED', 'APPOINTMENT', appt.id);
  res.json(updated);
});

apiRouter.post('/appointments/:id/cancel', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const appt = db.getAppointmentById(req.params.id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found.' });

  const updated = db.updateAppointment(appt.id, { status: 'Cancelled' });
  db.logAudit(user.id, user.name, user.role, 'APPOINTMENT_CANCELLED', 'APPOINTMENT', appt.id);
  res.json(updated);
});

// ==========================================
// 9. DOCUMENT MANAGEMENT & COMPLIANCE
// ==========================================

apiRouter.get('/documents', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const clientId = user.role === 'CLIENT' ? user.clientId : (req.query.clientId as string | undefined);
  const premisesId = req.query.premisesId as string | undefined;

  let docs = db.getDocuments(clientId, premisesId);
  if (user.role === 'CLIENT') {
    docs = docs.filter((d) => d.visibility === 'client_and_admin');
  }

  // Update expiry statuses dynamically
  const nowStr = new Date().toISOString().split('T')[0];
  const thirtyDaysStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const processed = docs.map((d) => {
    if (d.expiryDate) {
      if (d.expiryDate < nowStr) {
        d.status = 'Expired';
      } else if (d.expiryDate <= thirtyDaysStr) {
        d.status = 'Expiring soon';
      } else {
        d.status = 'Current';
      }
    }
    return d;
  });

  res.json(processed);
});

apiRouter.post('/documents/upload', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const { clientId, premisesId, name, category, fileUrl, fileSize, fileType, expiryDate, description, visibility } =
    req.body;

  if (!name || !category) {
    return res.status(400).json({ error: 'Document name and category are required.' });
  }

  const effectiveClientId = user.role === 'CLIENT' ? (user.clientId || clientId) : clientId;

  const doc = db.createDocument({
    clientId: effectiveClientId,
    premisesId,
    name,
    category,
    fileUrl: fileUrl || `data:application/pdf;base64,JVBERi0xLjQKJcTl8uXr...`,
    fileSize: Number(fileSize) || 102400,
    fileType: fileType || 'application/pdf',
    version: 1,
    expiryDate,
    description: description || '',
    visibility: visibility || 'client_and_admin',
    status: 'Current',
    uploadedByUserId: user.id,
    uploadedByName: user.name,
  });

  if (user.role === 'CLIENT') {
    db.createNotification({
      recipientRole: 'admin',
      clientId: effectiveClientId,
      title: 'New Client Document Uploaded',
      message: `${user.name} uploaded compliance document: ${name} (${category}).`,
      linkUrl: `/admin/documents`,
    });
  }

  db.logAudit(user.id, user.name, user.role, 'DOCUMENT_UPLOADED', 'DOCUMENT', doc.id, undefined, { name, category });
  res.json(doc);
});

apiRouter.post('/documents/:id/archive', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const doc = db.getDocumentById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Document not found.' });

  const updated = db.updateDocument(doc.id, { isArchived: true, status: 'Archived' });
  db.logAudit(user.id, user.name, user.role, 'DOCUMENT_ARCHIVED', 'DOCUMENT', doc.id);
  res.json({ success: true, document: updated });
});

// ==========================================
// 10. FIRE RISK ASSESSMENTS (EXTERNAL DELIVERY)
// ==========================================

apiRouter.get('/fras', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const clientId = user.role === 'CLIENT' ? user.clientId : (req.query.clientId as string | undefined);
  const premisesId = req.query.premisesId as string | undefined;

  let fras = db.getFras(clientId, premisesId);
  // Clients only see Issued FRAs
  if (user.role === 'CLIENT') {
    fras = fras.filter((f) => f.status === 'Issued');
  }

  res.json(fras);
});

apiRouter.get('/fras/:id', (req: Request, res: Response) => {
  const fra = db.getFraById(req.params.id);
  if (!fra) return res.status(404).json({ error: 'Fire risk assessment not found.' });

  const user = getRequestUser(req);
  if (user.role === 'CLIENT' && fra.clientId !== user.clientId) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const premises = db.getPremisesById(fra.premisesId);
  const actions = db.getActions(fra.clientId, fra.premisesId, fra.id);

  res.json({
    ...fra,
    premises,
    actions,
  });
});

apiRouter.post('/fras', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  if (user.role === 'CLIENT') {
    return res.status(403).json({ error: 'Only assessors can upload completed FRAs.' });
  }

  const data = req.body;
  if (!data.premisesId || !data.clientId || !data.assessmentReference) {
    return res.status(400).json({ error: 'Premises, client, and assessment reference are required.' });
  }

  // Create document entry for the uploaded report
  const doc = db.createDocument({
    clientId: data.clientId,
    premisesId: data.premisesId,
    name: `Fire Risk Assessment Report - ${data.assessmentReference}`,
    category: 'Fire Risk Assessments',
    fileUrl: data.fileUrl || `data:application/pdf;base64,JVBERi0xLjQKJcTl8uXr...`,
    fileSize: data.fileSize || 2048500,
    fileType: 'application/pdf',
    version: Number(data.version) || 1,
    visibility: 'client_and_admin',
    status: 'Current',
    uploadedByUserId: user.id,
    uploadedByName: user.name,
  });

  const fra = db.createFra({
    premisesId: data.premisesId,
    clientId: data.clientId,
    fraTitle: data.fraTitle || `Fire Risk Assessment (PAS 79-1:2020)`,
    assessmentReference: data.assessmentReference,
    assessmentDate: data.assessmentDate || new Date().toISOString().split('T')[0],
    assessorUserId: user.id,
    assessorName: user.name,
    version: Number(data.version) || 1,
    reviewDate:
      data.reviewDate ||
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reviewTrigger: (data.reviewTrigger as FraReviewTrigger) || 'Date-based review',
    status: (data.status as any) || 'Completed',
    documentId: doc.id,
    summaryNotes: data.summaryNotes || '',
    overallRiskRating: data.overallRiskRating || 'MEDIUM',
  });

  db.logAudit(user.id, user.name, user.role, 'FRA_UPLOADED', 'FRA', fra.id, undefined, fra);
  res.json(fra);
});

apiRouter.post('/fras/:id/issue', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  if (user.role === 'CLIENT') {
    return res.status(403).json({ error: 'Only assessors can issue FRAs to clients.' });
  }

  const fra = db.getFraById(req.params.id);
  if (!fra) return res.status(404).json({ error: 'FRA not found.' });

  const now = new Date().toISOString();
  const updated = db.updateFra(fra.id, {
    status: 'Issued',
    dateIssued: now,
  });

  // Update premises status
  db.updatePremises(fra.premisesId, { status: 'FRA issued' });

  // Notify client
  db.createNotification({
    recipientRole: 'client',
    clientId: fra.clientId,
    title: 'Your Fire Risk Assessment is now available',
    message: `Assessor ${fra.assessorName} has issued your Fire Risk Assessment (${fra.assessmentReference}). You can view the report and review any fire safety actions in your portal.`,
    linkUrl: `/client/fras`,
  });

  db.logAudit(user.id, user.name, user.role, 'FRA_ISSUED', 'FRA', fra.id);
  res.json({ success: true, fra: updated });
});

// ==========================================
// 11. FIRE SAFETY ACTIONS & EVIDENCE
// ==========================================

apiRouter.get('/actions', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const clientId = user.role === 'CLIENT' ? user.clientId : (req.query.clientId as string | undefined);
  const premisesId = req.query.premisesId as string | undefined;
  const fraId = req.query.fraId as string | undefined;

  let actions = db.getActions(clientId, premisesId, fraId);

  // Check for overdue status
  const nowStr = new Date().toISOString().split('T')[0];
  actions = actions.map((a) => {
    if (a.status !== 'Completed' && a.status !== 'Closed' && a.targetDate < nowStr) {
      a.status = 'Overdue';
    }
    return a;
  });

  res.json(actions);
});

apiRouter.post('/actions', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  if (user.role === 'CLIENT') {
    return res.status(403).json({ error: 'Only assessors can create fire safety action findings.' });
  }

  const data = req.body;
  if (!data.premisesId || !data.clientId || !data.description || !data.recommendation) {
    return res.status(400).json({ error: 'Premises, client, description, and recommendation are required.' });
  }

  const action = db.createAction({
    fraId: data.fraId || '',
    premisesId: data.premisesId,
    clientId: data.clientId,
    actionReference: data.actionReference || `ACT-${Date.now().toString().slice(-4)}`,
    description: data.description,
    riskRating: (data.riskRating as ActionRiskRating) || 'MEDIUM',
    recommendation: data.recommendation,
    responsiblePerson: data.responsiblePerson || 'Responsible Person',
    targetDate:
      data.targetDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: (data.status as ActionStatus) || 'Open',
    priority: (data.priority as ActionPriority) || 'Medium',
    notes: data.notes || '',
  });

  // Notify client
  db.createNotification({
    recipientRole: 'client',
    clientId: data.clientId,
    title: 'New Fire Safety Action Assigned',
    message: `A new action item (${action.actionReference}) with ${action.riskRating} risk has been assigned to your premises.`,
    linkUrl: `/client/actions`,
  });

  db.logAudit(user.id, user.name, user.role, 'ACTION_CREATED', 'ACTION', action.id, undefined, action);
  res.json(action);
});

apiRouter.post('/actions/:id/client-update', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const action = db.getActionById(req.params.id);
  if (!action) return res.status(404).json({ error: 'Action not found.' });

  const { notes, completionEvidenceNotes, evidenceFile, markCompleted } = req.body;

  const currentEvidence = action.evidenceFiles || [];
  if (evidenceFile && evidenceFile.fileName) {
    currentEvidence.push({
      fileName: evidenceFile.fileName,
      fileUrl: evidenceFile.fileUrl || '',
      uploadedAt: new Date().toISOString(),
    });
  }

  const newStatus = markCompleted ? 'Completed' : action.status === 'Open' ? 'In progress' : action.status;

  const updated = db.updateAction(action.id, {
    status: newStatus,
    notes: notes || action.notes,
    completionEvidenceNotes: completionEvidenceNotes || action.completionEvidenceNotes,
    evidenceFiles: currentEvidence,
    dateCompleted: markCompleted ? new Date().toISOString().split('T')[0] : action.dateCompleted,
    completedBy: markCompleted ? user.name : action.completedBy,
  });

  // Notify assessor
  db.createNotification({
    recipientRole: 'admin',
    clientId: action.clientId,
    title: `Action Item Updated (${action.actionReference})`,
    message: `${user.name} submitted progress / completion evidence for action ${action.actionReference}.`,
    linkUrl: `/admin/actions`,
  });

  db.logAudit(user.id, user.name, user.role, 'ACTION_CLIENT_UPDATED', 'ACTION', action.id, undefined, {
    status: newStatus,
    evidenceCount: currentEvidence.length,
  });

  res.json(updated);
});

apiRouter.post('/actions/:id/verify-close', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  if (user.role === 'CLIENT') {
    return res.status(403).json({ error: 'Only assessors can verify and close action items.' });
  }

  const action = db.getActionById(req.params.id);
  if (!action) return res.status(404).json({ error: 'Action not found.' });

  const now = new Date().toISOString();
  const updated = db.updateAction(action.id, {
    status: 'Closed',
    verifiedBy: user.name,
    verifiedDate: now,
  });

  db.createNotification({
    recipientRole: 'client',
    clientId: action.clientId,
    title: `Action Item Verified & Closed (${action.actionReference})`,
    message: `Assessor ${user.name} reviewed and confirmed satisfactory completion of action ${action.actionReference}.`,
    linkUrl: `/client/actions`,
  });

  db.logAudit(user.id, user.name, user.role, 'ACTION_CLOSED', 'ACTION', action.id);
  res.json(updated);
});

// ==========================================
// 12. MESSAGING & CLIENT COMMUNICATIONS
// ==========================================

apiRouter.get('/messages', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const clientId = user.role === 'CLIENT' ? user.clientId! : (req.query.clientId as string);
  if (!clientId) {
    return res.status(400).json({ error: 'Client ID is required.' });
  }
  const premisesId = req.query.premisesId as string | undefined;
  res.json(db.getMessages(clientId, premisesId));
});

apiRouter.post('/messages', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const { clientId, premisesId, messageText, attachments } = req.body;

  if (!clientId || !messageText) {
    return res.status(400).json({ error: 'Client ID and message text are required.' });
  }

  const msg = db.createMessage({
    clientId,
    premisesId,
    senderUserId: user.id,
    senderName: user.name,
    senderRole: user.role === 'CLIENT' ? 'client' : 'admin',
    messageText,
    attachments,
    readByAdmin: user.role !== 'CLIENT',
    readByClient: user.role === 'CLIENT',
  });

  if (user.role === 'CLIENT') {
    db.createNotification({
      recipientRole: 'admin',
      clientId,
      title: 'New Client Message',
      message: `${user.name}: "${messageText.slice(0, 80)}..."`,
      linkUrl: `/admin/messages`,
    });
  } else {
    db.createNotification({
      recipientRole: 'client',
      clientId,
      title: 'Message from Assessor',
      message: `${user.name}: "${messageText.slice(0, 80)}..."`,
      linkUrl: `/client/messages`,
    });
  }

  res.json(msg);
});

// ==========================================
// 13. NOTIFICATIONS
// ==========================================

apiRouter.get('/notifications', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const role = user.role === 'CLIENT' ? 'client' : 'admin';
  const clientId = user.role === 'CLIENT' ? user.clientId : undefined;
  res.json(db.getNotifications(role, clientId));
});

apiRouter.post('/notifications/:id/read', (req: Request, res: Response) => {
  db.markNotificationRead(req.params.id);
  res.json({ success: true });
});

apiRouter.post('/notifications/read-all', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const role = user.role === 'CLIENT' ? 'client' : 'admin';
  const clientId = user.role === 'CLIENT' ? user.clientId : undefined;
  db.markAllNotificationsRead(role, clientId);
  res.json({ success: true });
});

// ==========================================
// 14. POLICIES, SETTINGS & PRICING RULES
// ==========================================

apiRouter.get('/policies', (req: Request, res: Response) => {
  res.json(db.getPolicies());
});

apiRouter.get('/policies/:key', (req: Request, res: Response) => {
  const p = db.getPolicyByKey(req.params.key);
  if (!p) return res.status(404).json({ error: 'Policy not found.' });
  res.json(p);
});

apiRouter.put('/policies/:key', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  if (user.role === 'CLIENT') return res.status(403).json({ error: 'Unauthorized.' });

  const updated = db.updatePolicy(req.params.key, req.body.content, req.body.title);
  if (!updated) return res.status(404).json({ error: 'Policy not found.' });

  db.logAudit(user.id, user.name, user.role, 'POLICY_UPDATED', 'POLICY', req.params.key);
  res.json(updated);
});

apiRouter.get('/pricing-rules', (req: Request, res: Response) => {
  res.json(db.getPricingRules());
});

apiRouter.put('/pricing-rules/:id', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  if (user.role === 'CLIENT') return res.status(403).json({ error: 'Unauthorized.' });

  const updated = db.updatePricingRule(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Rule not found.' });

  db.logAudit(user.id, user.name, user.role, 'PRICING_RULE_UPDATED', 'PRICING', req.params.id);
  res.json(updated);
});

apiRouter.get('/settings', (req: Request, res: Response) => {
  res.json(db.getSettings());
});

apiRouter.put('/settings', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  if (user.role === 'CLIENT') return res.status(403).json({ error: 'Unauthorized.' });

  const updated = db.updateSettings(req.body);
  db.logAudit(user.id, user.name, user.role, 'SETTINGS_UPDATED', 'SETTINGS', 'global');
  res.json(updated);
});

// ==========================================
// 15. AUDIT LOGS & REPORTING
// ==========================================

apiRouter.get('/audit', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  if (user.role === 'CLIENT') return res.status(403).json({ error: 'Unauthorized.' });
  res.json(db.getRawData().auditLogs);
});

apiRouter.get('/reports/dashboard', (req: Request, res: Response) => {
  const data = db.getRawData();
  const now = new Date().toISOString().split('T')[0];

  // Authentic live figures computed directly from relational store
  const newEnquiriesCount = data.enquiries.filter((e) => e.status === 'New Enquiry').length;
  const quotesAwaitingResponse = data.quotes.filter((q) => q.status === 'Sent' || q.status === 'Viewed').length;
  const quotesAccepted = data.quotes.filter((q) => q.status === 'Accepted').length;
  const paymentsReceivedTotal = data.payments
    .filter((p) => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0);
  const outstandingInvoicesTotal = data.invoices
    .filter((i) => i.paymentStatus === 'Unpaid' && !i.isVoid)
    .reduce((sum, i) => sum + i.totalAmount, 0);
  const upcomingAssessments = data.appointments.filter(
    (a) => (a.status === 'Confirmed' || a.status === 'Requested') && a.appointmentDate >= now
  ).length;
  const assessmentsCompleted = data.appointments.filter((a) => a.status === 'Completed').length;
  const reportsAwaitingUpload = data.premises.filter((p) => p.status === 'Assessment completed').length;
  const overdueActionsCount = data.actions.filter(
    (a) => a.status !== 'Completed' && a.status !== 'Closed' && a.targetDate < now
  ).length;
  const totalClients = data.clients.filter((c) => !c.isArchived).length;
  const totalPremises = data.premises.filter((p) => !p.isArchived).length;

  res.json({
    newEnquiriesCount,
    quotesAwaitingResponse,
    quotesAccepted,
    paymentsReceivedTotal,
    outstandingInvoicesTotal,
    upcomingAssessments,
    assessmentsCompleted,
    reportsAwaitingUpload,
    overdueActionsCount,
    totalClients,
    totalPremises,
    recentClients: data.clients.slice(0, 5),
    recentPremises: data.premises.slice(0, 5),
    recentEnquiries: data.enquiries.slice(0, 5),
  });
});

apiRouter.get('/reports/portfolio', (req: Request, res: Response) => {
  const clients = db.getClients();
  const allPremises = db.getPremises();
  const allFras = db.getFras();
  const allActions = db.getActions();
  const allInvoices = db.getInvoices();
  const allAppointments = db.getAppointments();

  const portfolio = allPremises.map((p) => {
    const client = clients.find((c) => c.id === p.clientId);
    const clientFras = allFras.filter((f) => f.premisesId === p.id);
    const latestFra = clientFras.sort(
      (a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
    )[0];
    const actions = allActions.filter((a) => a.premisesId === p.id);
    const openActions = actions.filter((a) => a.status !== 'Completed' && a.status !== 'Closed');
    const now = new Date().toISOString().split('T')[0];
    const overdueActions = openActions.filter((a) => a.targetDate < now);
    const invoices = allInvoices.filter((i) => i.premisesId === p.id);
    const hasUnpaidInvoice = invoices.some((i) => i.paymentStatus === 'Unpaid');
    const appt = allAppointments.find((a) => a.premisesId === p.id && a.status === 'Confirmed');

    return {
      premisesId: p.id,
      premisesName: p.premisesName,
      postcode: p.postcode,
      premisesType: p.premisesType,
      clientId: p.clientId,
      clientName: client?.companyName || 'Unknown Client',
      clientStatus: client?.status || 'Lead',
      jurisdiction: p.jurisdiction,
      status: p.status,
      latestFraTitle: latestFra?.fraTitle || 'No FRA on file',
      fraReference: latestFra?.assessmentReference || '—',
      fraDate: latestFra?.assessmentDate || '—',
      reviewDate: latestFra?.reviewDate || '—',
      reviewTrigger: latestFra?.reviewTrigger || '—',
      openActionsCount: openActions.length,
      overdueActionsCount: overdueActions.length,
      paymentStatus: hasUnpaidInvoice ? 'Unpaid' : 'Up to date',
      appointmentDate: appt?.appointmentDate || '—',
      appointmentTime: appt?.startTime || '—',
    };
  });

  res.json(portfolio);
});

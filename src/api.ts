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
  QuoteItem,
} from './types';

class ApiService {
  private activeUserId: string = '';

  public setActiveUserId(userId: string) {
    this.activeUserId = userId;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (this.activeUserId) {
      headers.set('x-user-id', this.activeUserId);
    }

    const res = await fetch(`/api${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || `HTTP ${res.status}: Request failed`);
    }

    return res.json();
  }

  // Auth
  public getUsers() {
    return this.request<User[]>('/auth/users');
  }

  public getMe() {
    return this.request<User>('/auth/me');
  }

  public login(email: string) {
    return this.request<{ success: boolean; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  public registerClient(data: {
    name: string;
    email: string;
    companyName: string;
    telephone?: string;
    position?: string;
  }) {
    return this.request<{ success: boolean; user: User; client: Client }>('/auth/register-client', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Enquiries
  public submitEnquiry(data: Partial<Enquiry>) {
    return this.request<{ success: boolean; enquiry: Enquiry; indicativeQuote: any }>('/enquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public getEnquiries() {
    return this.request<Enquiry[]>('/enquiries');
  }

  public getEnquiry(id: string) {
    return this.request<Enquiry>(`/enquiries/${id}`);
  }

  public updateEnquiry(id: string, updates: Partial<Enquiry>) {
    return this.request<Enquiry>(`/enquiries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  public convertEnquiry(id: string) {
    return this.request<{ success: boolean; client: Client; premises: Premises; clientUser: User }>(
      `/enquiries/${id}/convert`,
      { method: 'POST' }
    );
  }

  // Quotes
  public calculateQuote(input: any) {
    return this.request<any>('/quotes/calculate', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  public instantDispatchQuote(data: {
    name: string;
    email: string;
    company: string;
    telephone?: string;
    premisesAddress: string;
    premisesType: string;
    approxSizeSqM: number;
    numberOfFloors: number;
    isReview?: boolean;
    notes?: string;
  }) {
    return this.request<{
      success: boolean;
      quote: Quote;
      client: Client;
      premises: Premises;
      clientUser: User;
      message: string;
    }>('/quotes/instant-dispatch', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public getQuotes(clientId?: string) {
    const q = clientId ? `?clientId=${clientId}` : '';
    return this.request<Quote[]>(`/quotes${q}`);
  }

  public getQuote(id: string) {
    return this.request<Quote>(`/quotes/${id}`);
  }

  public createQuote(data: Partial<Quote>) {
    return this.request<Quote>('/quotes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public sendQuote(id: string) {
    return this.request<{ success: boolean; quote: Quote }>(`/quotes/${id}/send`, { method: 'POST' });
  }

  public acceptQuote(id: string, acceptedByName?: string, acceptedByEmail?: string) {
    return this.request<{ success: boolean; quote: Quote; invoice: Invoice }>(`/quotes/${id}/accept`, {
      method: 'POST',
      body: JSON.stringify({ acceptedByName, acceptedByEmail }),
    });
  }

  public declineQuote(id: string) {
    return this.request<{ success: boolean; quote: Quote }>(`/quotes/${id}/decline`, { method: 'POST' });
  }

  // Clients
  public getClients(includeArchived = false) {
    return this.request<Client[]>(`/clients?includeArchived=${includeArchived}`);
  }

  public getClient(id: string) {
    return this.request<any>(`/clients/${id}`);
  }

  public createClient(data: Partial<Client>) {
    return this.request<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public updateClient(id: string, data: Partial<Client>) {
    return this.request<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public archiveClient(id: string) {
    return this.request<{ success: boolean; client: Client }>(`/clients/${id}/archive`, { method: 'POST' });
  }

  public restoreClient(id: string) {
    return this.request<{ success: boolean; client: Client }>(`/clients/${id}/restore`, { method: 'POST' });
  }

  // Premises
  public getPremises(clientId?: string, includeArchived = false) {
    let q = `?includeArchived=${includeArchived}`;
    if (clientId) q += `&clientId=${clientId}`;
    return this.request<Premises[]>(`/premises${q}`);
  }

  public getPremisesById(id: string) {
    return this.request<any>(`/premises/${id}`);
  }

  public createPremises(data: Partial<Premises>) {
    return this.request<Premises>('/premises', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public updatePremises(id: string, data: Partial<Premises>) {
    return this.request<Premises>(`/premises/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public duplicatePremises(id: string) {
    return this.request<Premises>(`/premises/${id}/duplicate`, { method: 'POST' });
  }

  public archivePremises(id: string) {
    return this.request<{ success: boolean; premises: Premises }>(`/premises/${id}/archive`, { method: 'POST' });
  }

  public getPremisesReadiness(id: string) {
    return this.request<{ status: 'READY' | 'INFORMATION REQUIRED'; items: { label: string; satisfied: boolean; mandatory: boolean }[] }>(
      `/premises/${id}/readiness`
    );
  }

  // Onboarding
  public getOnboarding(premisesId: string) {
    return this.request<OnboardingData | null>(`/onboarding/${premisesId}`);
  }

  public saveOnboarding(premisesId: string, data: Partial<OnboardingData>) {
    return this.request<OnboardingData>(`/onboarding/${premisesId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Invoices & Payments
  public getInvoices(clientId?: string) {
    const q = clientId ? `?clientId=${clientId}` : '';
    return this.request<Invoice[]>(`/invoices${q}`);
  }

  public getInvoice(id: string) {
    return this.request<any>(`/invoices/${id}`);
  }

  public createInvoice(data: Partial<Invoice>) {
    return this.request<Invoice>('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public createPaymentIntent(params: {
    amountPence: number;
    clientId: string;
    quoteId?: string;
    invoiceId?: string;
    description?: string;
  }) {
    return this.request<any>('/payments/intent', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  public confirmPayment(params: {
    paymentIntentId: string;
    clientId: string;
    amount: number;
    quoteId?: string;
    invoiceId?: string;
    paymentMethod?: 'card' | 'bank_transfer';
  }) {
    return this.request<{ success: boolean; payment: PaymentRecord }>('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  public refundPayment(paymentRecordId: string, reason?: string) {
    return this.request<{ success: boolean; payment: PaymentRecord }>('/payments/refund', {
      method: 'POST',
      body: JSON.stringify({ paymentRecordId, reason }),
    });
  }

  public getStripeGatewayStatus() {
    return this.request<{
      isConfigured: boolean;
      mode: 'test' | 'live';
      publishableKey: string;
      hasSecretKey: boolean;
      hasWebhookSecret: boolean;
      statementDescriptor: string;
      autoReceipts: boolean;
      currency: string;
      accountId?: string;
    }>('/payments/gateway-status');
  }

  public testStripeConnection(data?: { secretKey?: string }) {
    return this.request<{
      success: boolean;
      configured: boolean;
      isSandbox: boolean;
      livemode?: boolean;
      currency?: string;
      message?: string;
      error?: string;
    }>('/payments/test-connection', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  // Appointments
  public getAppointments(clientId?: string) {
    const q = clientId ? `?clientId=${clientId}` : '';
    return this.request<Appointment[]>(`/appointments${q}`);
  }

  public requestAppointment(data: {
    clientId: string;
    premisesId: string;
    appointmentDate: string;
    startTime: string;
    clientNotes?: string;
  }) {
    return this.request<Appointment>('/appointments/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public confirmAppointment(id: string, assessorNotes?: string) {
    return this.request<Appointment>(`/appointments/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ assessorNotes }),
    });
  }

  public rescheduleAppointment(id: string, appointmentDate: string, startTime: string) {
    return this.request<Appointment>(`/appointments/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ appointmentDate, startTime }),
    });
  }

  public completeAppointment(id: string) {
    return this.request<Appointment>(`/appointments/${id}/complete`, { method: 'POST' });
  }

  public cancelAppointment(id: string) {
    return this.request<Appointment>(`/appointments/${id}/cancel`, { method: 'POST' });
  }

  // Documents
  public getDocuments(clientId?: string, premisesId?: string) {
    let q = '';
    const params = [];
    if (clientId) params.push(`clientId=${clientId}`);
    if (premisesId) params.push(`premisesId=${premisesId}`);
    if (params.length) q = `?${params.join('&')}`;
    return this.request<DocumentRecord[]>(`/documents${q}`);
  }

  public uploadDocument(data: Partial<DocumentRecord>) {
    return this.request<DocumentRecord>('/documents/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public archiveDocument(id: string) {
    return this.request<{ success: boolean; document: DocumentRecord }>(`/documents/${id}/archive`, {
      method: 'POST',
    });
  }

  // FRAs
  public getFras(clientId?: string, premisesId?: string) {
    let q = '';
    const params = [];
    if (clientId) params.push(`clientId=${clientId}`);
    if (premisesId) params.push(`premisesId=${premisesId}`);
    if (params.length) q = `?${params.join('&')}`;
    return this.request<FireRiskAssessmentRecord[]>(`/fras${q}`);
  }

  public getFra(id: string) {
    return this.request<any>(`/fras/${id}`);
  }

  public uploadFra(data: Partial<FireRiskAssessmentRecord>) {
    return this.request<FireRiskAssessmentRecord>('/fras', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public issueFra(id: string) {
    return this.request<{ success: boolean; fra: FireRiskAssessmentRecord }>(`/fras/${id}/issue`, {
      method: 'POST',
    });
  }

  // Actions
  public getActions(clientId?: string, premisesId?: string, fraId?: string) {
    let q = '';
    const params = [];
    if (clientId) params.push(`clientId=${clientId}`);
    if (premisesId) params.push(`premisesId=${premisesId}`);
    if (fraId) params.push(`fraId=${fraId}`);
    if (params.length) q = `?${params.join('&')}`;
    return this.request<ActionRecord[]>(`/actions${q}`);
  }

  public createAction(data: Partial<ActionRecord>) {
    return this.request<ActionRecord>('/actions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public updateActionClient(
    id: string,
    data: {
      notes?: string;
      completionEvidenceNotes?: string;
      evidenceFile?: { fileName: string; fileUrl: string };
      markCompleted?: boolean;
    }
  ) {
    return this.request<ActionRecord>(`/actions/${id}/client-update`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public verifyAndCloseAction(id: string) {
    return this.request<ActionRecord>(`/actions/${id}/verify-close`, { method: 'POST' });
  }

  // Messages
  public getMessages(clientId: string, premisesId?: string) {
    let q = `?clientId=${clientId}`;
    if (premisesId) q += `&premisesId=${premisesId}`;
    return this.request<MessageRecord[]>(`/messages${q}`);
  }

  public sendMessage(data: { clientId: string; premisesId?: string; messageText: string }) {
    return this.request<MessageRecord>('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Notifications
  public getNotifications() {
    return this.request<NotificationRecord[]>('/notifications');
  }

  public markNotificationRead(id: string) {
    return this.request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'POST' });
  }

  public markAllNotificationsRead() {
    return this.request<{ success: boolean }>('/notifications/read-all', { method: 'POST' });
  }

  // Reports
  public getDashboardReport() {
    return this.request<any>('/reports/dashboard');
  }

  public getPortfolioReport() {
    return this.request<any[]>('/reports/portfolio');
  }

  // Settings & Policies
  public getSettings() {
    return this.request<BusinessSettings>('/settings');
  }

  public updateSettings(data: Partial<BusinessSettings>) {
    return this.request<BusinessSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public getPolicies() {
    return this.request<LegalPolicy[]>('/policies');
  }

  public updatePolicy(key: string, content: string, title?: string) {
    return this.request<LegalPolicy>(`/policies/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ content, title }),
    });
  }

  public getPricingRules() {
    return this.request<PricingRule[]>('/pricing-rules');
  }

  public updatePricingRule(id: string, updates: Partial<PricingRule>) {
    return this.request<PricingRule>(`/pricing-rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  public getAuditLogs() {
    return this.request<AuditLogRecord[]>('/audit');
  }
}

export const api = new ApiService();

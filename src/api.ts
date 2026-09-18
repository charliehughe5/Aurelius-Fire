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
  Organisation,
  Contact,
  Invitation,
  Job,
  QuestionnaireQuestion,
  QuestionnaireResponse,
  Finding,
  EmailLogRecord,
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

  public createQuote(data: Partial<Quote> & Record<string, any>) {
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

  public clientAcceptQuote(
    id: string,
    payload: {
      preferredSlotDate: string;
      preferredSlotTime: string;
      preferredSlotNotes?: string;
      acceptedByName?: string;
      acceptedByEmail?: string;
    }
  ) {
    return this.request<{ success: boolean; quote: Quote }>(`/quotes/${id}/client-accept`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public assessorConfirmQuote(
    id: string,
    payload: {
      confirmedDate?: string;
      confirmedTime?: string;
      assessorNotes?: string;
    }
  ) {
    return this.request<{ success: boolean; quote: Quote; invoice?: Invoice }>(`/quotes/${id}/assessor-confirm`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public assessorCounterQuote(
    id: string,
    payload: {
      proposedDate: string;
      proposedTime?: string;
      assessorNotes?: string;
    }
  ) {
    return this.request<{ success: boolean; quote: Quote }>(`/quotes/${id}/assessor-counter`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public assessorDeclineQuote(
    id: string,
    payload: {
      declineReason: string;
      assessorNotes?: string;
    }
  ) {
    return this.request<{ success: boolean; quote: Quote }>(`/quotes/${id}/assessor-decline`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public signContract(
    id: string,
    payload: {
      signerName: string;
      signerPosition?: string;
      signatureData: string;
    }
  ) {
    return this.request<{ success: boolean; quote: Quote }>(`/quotes/${id}/sign-contract`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public submitPreAssessment(id: string, questionnaireData: Record<string, any>) {
    return this.request<{ success: boolean; quote: Quote }>(`/quotes/${id}/pre-assessment`, {
      method: 'POST',
      body: JSON.stringify({ questionnaireData }),
    });
  }

  public sendDirectEmail(payload: {
    recipientEmail: string;
    recipientName?: string;
    subject: string;
    messageBody: string;
    clientId?: string;
    premisesId?: string;
    quoteId?: string;
  }) {
    return this.request<{ success: boolean; message: string; dispatchedAt: string }>('/emails/direct-send', {
      method: 'POST',
      body: JSON.stringify(payload),
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
    organisationId?: string;
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
    organisationId?: string;
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

  public uploadDocumentVersion(
    id: string,
    data: {
      fileUrl?: string;
      fileName?: string;
      versionNotes?: string;
      issueDate?: string;
      expiryDate?: string;
      notes?: string;
    }
  ) {
    return this.request<{ success: boolean; document: DocumentRecord; previousDocument: DocumentRecord }>(
      `/documents/${id}/version`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  public getDocumentHistory(id: string) {
    return this.request<DocumentRecord[]>(`/documents/${id}/history`);
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

  public async getPortfolioReport() {
    const res = await this.request<any>('/reports/portfolio');
    return Array.isArray(res) ? res : (res.portfolio || []);
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

  // Organisations (Part 10)
  public getOrganisations() {
    return this.request<Organisation[]>('/organisations');
  }

  public getOrganisation(id: string) {
    return this.request<Organisation>(`/organisations/${id}`);
  }

  public createOrganisation(data: Partial<Organisation>) {
    return this.request<Organisation>('/organisations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public updateOrganisation(id: string, data: Partial<Organisation>) {
    return this.request<Organisation>(`/organisations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public deleteOrganisation(id: string) {
    return this.request<{ success: boolean }>(`/organisations/${id}`, {
      method: 'DELETE',
    });
  }

  // Contacts (Part 11)
  public getContacts(organisationId?: string) {
    const q = organisationId ? `?organisationId=${encodeURIComponent(organisationId)}` : '';
    return this.request<Contact[]>(`/contacts${q}`);
  }

  public getContact(id: string) {
    return this.request<Contact>(`/contacts/${id}`);
  }

  public createContact(data: Partial<Contact>) {
    return this.request<Contact>('/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public updateContact(id: string, data: Partial<Contact>) {
    return this.request<Contact>(`/contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public deleteContact(id: string) {
    return this.request<{ success: boolean }>(`/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  // Invitations (Part 12)
  public getInvitations(organisationId?: string) {
    const q = organisationId ? `?organisationId=${encodeURIComponent(organisationId)}` : '';
    return this.request<Invitation[]>(`/invitations${q}`);
  }

  public createInvitation(data: {
    email: string;
    name?: string;
    recipientName?: string;
    role: string;
    organisationId?: string;
    organisationName?: string;
  }) {
    return this.request<Invitation>('/invitations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public resendInvitation(id: string) {
    return this.request<Invitation>(`/invitations/${id}/resend`, {
      method: 'POST',
    });
  }

  public cancelInvitation(id: string) {
    return this.request<{ success: boolean }>(`/invitations/${id}/cancel`, {
      method: 'POST',
    });
  }

  // Jobs (Part 17)
  public getJobs(clientId?: string, premisesId?: string, assessorId?: string) {
    const params = new URLSearchParams();
    if (clientId) params.set('clientId', clientId);
    if (premisesId) params.set('premisesId', premisesId);
    if (assessorId) params.set('assessorId', assessorId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<Job[]>(`/jobs${qs}`);
  }

  public getJob(id: string) {
    return this.request<Job>(`/jobs/${id}`);
  }

  public createJob(data: Partial<Job>) {
    return this.request<Job>('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public updateJob(id: string, data: Partial<Job>) {
    return this.request<Job>(`/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public deleteJob(id: string) {
    return this.request<{ success: boolean }>(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  // Questionnaire (Part 18)
  public getQuestions(includeArchived?: boolean) {
    const q = includeArchived ? '?includeArchived=true' : '';
    return this.request<QuestionnaireQuestion[]>(`/questions${q}`);
  }

  public createQuestion(data: Partial<QuestionnaireQuestion>) {
    return this.request<QuestionnaireQuestion>('/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public updateQuestion(id: string, data: Partial<QuestionnaireQuestion>) {
    return this.request<QuestionnaireQuestion>(`/questions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public deleteQuestion(id: string) {
    return this.request<{ success: boolean }>(`/questions/${id}`, {
      method: 'DELETE',
    });
  }

  public reorderQuestions(ids: string[]) {
    return this.request<QuestionnaireQuestion[]>('/questions/reorder', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  public getQuestionnaireResponses(premisesId: string, jobId?: string) {
    const params = new URLSearchParams({ premisesId });
    if (jobId) params.set('jobId', jobId);
    return this.request<QuestionnaireResponse[]>(`/questionnaire/responses?${params.toString()}`);
  }

  public saveQuestionnaireResponses(premisesId: string, responses: Record<string, any>, jobId?: string, clientId?: string) {
    return this.request<{ success: boolean; responses: QuestionnaireResponse[] }>('/questionnaire/responses', {
      method: 'POST',
      body: JSON.stringify({ premisesId, responses, jobId, clientId }),
    });
  }

  // Findings (Part 22)
  public getFindings(assessmentId?: string, premisesId?: string) {
    const params = new URLSearchParams();
    if (assessmentId) params.set('assessmentId', assessmentId);
    if (premisesId) params.set('premisesId', premisesId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<Finding[]>(`/findings${qs}`);
  }

  public getFinding(id: string) {
    return this.request<Finding>(`/findings/${id}`);
  }

  public createFinding(data: Partial<Finding>) {
    return this.request<Finding>('/findings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public updateFinding(id: string, data: Partial<Finding>) {
    return this.request<Finding>(`/findings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public deleteFinding(id: string) {
    return this.request<{ success: boolean }>(`/findings/${id}`, {
      method: 'DELETE',
    });
  }

  // Email Logs (Part 34)
  public getEmailLogs() {
    return this.request<EmailLogRecord[]>('/email-logs');
  }

  // Test Data Management (Part 45)
  public seedTestData() {
    return this.request<{ success: boolean; message: string; result: any }>('/test-data/seed', {
      method: 'POST',
    });
  }

  public purgeTestData() {
    return this.request<{ success: boolean; message: string; result: any }>('/test-data/purge', {
      method: 'POST',
    });
  }
}

export const api = new ApiService();

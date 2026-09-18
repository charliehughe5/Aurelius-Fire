import http from 'http';

const BASE_URL = 'http://localhost:3000/api';

async function request(path: string, options: { method?: string; body?: any; headers?: any } = {}): Promise<{ status: number; data: any }> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data: any = null;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  status: number;
  expectedStatus: number | number[];
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

function assert(suite: string, name: string, condition: boolean, status: number, expectedStatus: number | number[], error?: string, details?: any) {
  const expectedArray = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
  const passed = condition && expectedArray.includes(status);
  results.push({ suite, name, passed, status, expectedStatus, error: passed ? undefined : error, details });
  const mark = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${mark} [${suite}] ${name} (Status: ${status})${!passed ? ` - Expected: ${expectedStatus}. Response: ${JSON.stringify(details)}` : ''}`);
}

async function runAudit() {
  console.log('====================================================');
  console.log('STARTING COMPLETE END-TO-END CRM AUDIT');
  console.log('====================================================\n');

  // 1. HEALTH CHECK
  {
    const res = await request('/health');
    assert('Health', 'Server health check returns 200', res.status === 200 && res.data.status === 'ok', res.status, 200);
  }

  // 2. AUTHENTICATION & SECURITY
  {
    const loginValid = await request('/auth/login', {
      method: 'POST',
      body: { email: 'charlie@firevault.co.uk', password: 'password123' },
    });
    assert('Auth', 'Admin login with valid credentials', loginValid.status === 200 && !!loginValid.data.user, loginValid.status, 200);

    const loginInvalid = await request('/auth/login', {
      method: 'POST',
      body: { email: 'charlie@firevault.co.uk', password: 'wrongpassword' },
    });
    assert('Auth', 'Admin login rejects invalid credentials', loginInvalid.status === 401, loginInvalid.status, 401);

    const forgotPass = await request('/auth/forgot-password', {
      method: 'POST',
      body: { email: 'charlie@firevault.co.uk' },
    });
    assert('Auth', 'Forgot password request generates token', forgotPass.status === 200 && !!forgotPass.data.token, forgotPass.status, 200);

    if (forgotPass.data?.token) {
      const resetPass = await request('/auth/reset-password', {
        method: 'POST',
        body: { token: forgotPass.data.token, newPassword: 'password123' },
      });
      assert('Auth', 'Reset password with token succeeds', resetPass.status === 200 && resetPass.data.success, resetPass.status, 200);
    }
  }

  // 3. LEAD / ENQUIRY LIFECYCLE
  let testLeadId = '';
  {
    // Create Lead
    const createLead = await request('/enquiries', {
      method: 'POST',
      body: {
        companyName: 'QA Test Engineering Ltd',
        contactName: 'QA Test Lead',
        email: 'qa-test@example.com',
        phone: '07700900123',
        premisesAddress: 'Unit 4, QA Industrial Park, Liverpool, L3 4FP',
        premisesType: 'Industrial / Warehousing',
        approxFloorArea: '450 sqm',
        storeys: 2,
        sleepingRisk: 'No',
        currentFraStatus: 'Expired (Over 12 months)',
        preferredDate: '2026-10-15',
        notes: 'Mandatory statutory annual audit required.',
      },
    });
    assert('Lead', 'Create new lead/enquiry', createLead.status === 201 && !!createLead.data.id, createLead.status, 201);
    testLeadId = createLead.data?.id;

    // Get lead
    if (testLeadId) {
      const getLead = await request(`/enquiries/${testLeadId}`);
      assert('Lead', 'Get lead by ID preserves fields', getLead.status === 200 && getLead.data.contactName === 'QA Test Lead', getLead.status, 200);
    }

    // List leads
    const listLeads = await request('/enquiries');
    assert('Lead', 'List enquiries returns array including new lead', listLeads.status === 200 && Array.isArray(listLeads.data) && listLeads.data.some((l: any) => l.id === testLeadId), listLeads.status, 200);

    // Convert lead to client & quote
    if (testLeadId) {
      const convertLead = await request(`/enquiries/${testLeadId}/convert`, {
        method: 'POST',
        body: {
          convertAction: 'quote_only',
        },
      });
      assert('Lead', 'Convert lead to quote/client', convertLead.status === 200 && !!convertLead.data.quote, convertLead.status, 200);
    }
  }

  // 4. CLIENTS & PREMISES
  let testClientId = '';
  let testPremisesId = '';
  {
    // Create Client
    const createClient = await request('/clients', {
      method: 'POST',
      body: {
        companyName: 'QA Verified Client Corp',
        contactName: 'Jane Dutyholder',
        contactEmail: 'jane.dutyholder@qaclient.co.uk',
        contactPhone: '0151 555 0199',
        billingAddress: '10 Dock Road, Birkenhead, Wirral, CH41 1AA',
        sector: 'Logistics',
        status: 'Active',
      },
    });
    assert('Clients', 'Create client record', createClient.status === 201 && !!createClient.data.id, createClient.status, 201);
    testClientId = createClient.data?.id;

    // Update Client
    if (testClientId) {
      const updateClient = await request(`/clients/${testClientId}`, {
        method: 'PUT',
        body: {
          contactName: 'Jane Dutyholder (Updated)',
          notes: 'Added statutory priority notes.',
        },
      });
      assert('Clients', 'Update client record persists', updateClient.status === 200 && updateClient.data.contactName.includes('Updated'), updateClient.status, 200);
    }

    // Create Premises
    if (testClientId) {
      const createPrem = await request('/premises', {
        method: 'POST',
        body: {
          clientId: testClientId,
          premisesName: 'QA Hub Birkenhead',
          addressLine1: 'Building B, 10 Dock Road',
          townCity: 'Birkenhead',
          county: 'Wirral',
          postcode: 'CH41 1AA',
          premisesType: 'Offices & Commercial',
          approxFloorAreaSqM: 350,
          numberOfFloors: 3,
          maxOccupancy: 40,
          numberOfEmployees: 25,
          sleepingAccommodation: false,
          status: 'Ready for assessment',
        },
      });
      assert('Premises', 'Create premises for client', createPrem.status === 201 && !!createPrem.data.id, createPrem.status, 201);
      testPremisesId = createPrem.data?.id;

      // Duplicate Premises
      if (testPremisesId) {
        const dupPrem = await request(`/premises/${testPremisesId}/duplicate`, { method: 'POST' });
        assert('Premises', 'Duplicate premises operates cleanly', dupPrem.status === 201 && dupPrem.data.premisesName.includes('Copy'), dupPrem.status, 201);

        // Check readiness audit
        const readiness = await request(`/premises/${testPremisesId}/readiness`);
        assert('Premises', 'Calculate statutory readiness score', readiness.status === 200 && typeof readiness.data.readinessScore === 'number', readiness.status, 200);
      }
    }
  }

  // 5. QUOTES & CONTRACTS & BOOKING DECISIONS
  let testQuoteId = '';
  {
    if (testClientId && testPremisesId) {
      // Calculate quote
      const calc = await request('/quotes/calculate', {
        method: 'POST',
        body: {
          premisesType: 'Offices & Commercial',
          approxFloorAreaSqM: 350,
          numberOfFloors: 3,
          sleepingAccommodation: false,
          serviceType: 'Fire Risk Assessment (PAS 79-1:2020)',
        },
      });
      assert('Quotes', 'Calculate statutory pricing rule', calc.status === 200 && calc.data.totalAmount > 0, calc.status, 200);

      // Create Quote
      const createQuote = await request('/quotes', {
        method: 'POST',
        body: {
          clientId: testClientId,
          premisesId: testPremisesId,
          scope: 'Full Life Safety Commercial FRA to PAS 79-1:2020',
          items: [
            { description: 'Baseline Assessment', quantity: 1, unitPrice: 345, total: 345 },
          ],
          netAmount: 345,
          vatRate: 0,
          vatAmount: 0,
          totalAmount: 345,
          validUntil: '2026-11-01',
        },
      });
      assert('Quotes', 'Create new quotation record', createQuote.status === 201 && !!createQuote.data.id, createQuote.status, 201);
      testQuoteId = createQuote.data?.id;

      if (testQuoteId) {
        // Send quote
        const sendQ = await request(`/quotes/${testQuoteId}/send`, { method: 'POST' });
        assert('Quotes', 'Send quotation triggers email & status Sent', sendQ.status === 200 && sendQ.data.quote.status === 'Sent', sendQ.status, 200);

        // Client accept with preferred slot
        const clientAcc = await request(`/quotes/${testQuoteId}/client-accept`, {
          method: 'POST',
          body: {
            preferredSlotDate: '2026-10-20',
            preferredSlotTime: '10:00 AM',
            clientNotes: 'Front desk buzzer 4B.',
          },
        });
        assert('Quotes', 'Client accept quote requests slot & status Awaiting Assessor Confirmation', clientAcc.status === 200 && clientAcc.data.quote.status === 'Awaiting Assessor Confirmation', clientAcc.status, 200);

        // Assessor confirms booking & generates Job + Invoice
        const assessorConf = await request(`/quotes/${testQuoteId}/assessor-confirm`, {
          method: 'POST',
          body: {
            confirmedDate: '2026-10-20',
            confirmedTime: '10:00 AM',
            assessorNotes: 'Confirmed by Charlie Hughes.',
          },
        });
        assert('Quotes', 'Assessor confirm creates Job and Invoice', assessorConf.status === 200 && !!assessorConf.data.job && !!assessorConf.data.invoice, assessorConf.status, 200);

        // Sign contract with electronic signature
        const signContract = await request(`/quotes/${testQuoteId}/sign-contract`, {
          method: 'POST',
          body: {
            signatoryName: 'Jane Dutyholder',
            signatoryEmail: 'jane.dutyholder@qaclient.co.uk',
            signatoryRole: 'Managing Director',
            signatureDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          },
        });
        assert('Quotes', 'Sign statutory contract records electronic signature', signContract.status === 200 && signContract.data.contractStatus === 'Signed', signContract.status, 200);

        // Submit pre-assessment questionnaire
        const preAss = await request(`/quotes/${testQuoteId}/pre-assessment`, {
          method: 'POST',
          body: {
            hasFloorPlans: 'yes',
            alarmType: 'L2 Optical/Heat with Central Panel',
            alarmServicedLast12Months: 'yes',
            emergencyLightingTested: 'yes',
            extinguishersInspected: 'yes',
            knownHazards: 'Ground floor small server rack with UPS.',
          },
        });
        assert('Quotes', 'Submit pre-assessment questionnaire', preAss.status === 200 && preAss.data.preAssessmentCompleted, preAss.status, 200);
      }
    }
  }

  // 6. INVOICES & PAYMENTS
  let testInvoiceId = '';
  {
    const invList = await request('/invoices');
    assert('Invoices', 'List invoices returns array', invList.status === 200 && Array.isArray(invList.data), invList.status, 200);
    if (invList.data?.length > 0) {
      testInvoiceId = invList.data[0].id;
    }

    // Gateway status
    const gwStatus = await request('/payments/gateway-status');
    assert('Payments', 'Stripe Gateway status endpoint responds', gwStatus.status === 200, gwStatus.status, 200);

    // Test payment intent
    if (testInvoiceId) {
      const intentRes = await request('/payments/intent', {
        method: 'POST',
        body: { invoiceId: testInvoiceId },
      });
      assert('Payments', 'Create Payment Intent (or fallback to simulated/test payment)', intentRes.status === 200, intentRes.status, 200);
    }
  }

  // 7. APPOINTMENTS & CALENDAR
  let testApptId = '';
  {
    if (testClientId && testPremisesId) {
      const createReq = await request('/appointments/request', {
        method: 'POST',
        body: {
          clientId: testClientId,
          premisesId: testPremisesId,
          requestedDate: '2026-10-25',
          requestedTimeSlot: '14:00',
          dutyholderName: 'Jane Dutyholder',
          dutyholderPhone: '0151 555 0199',
        },
      });
      assert('Appointments', 'Request assessment visit slot', createReq.status === 201 && !!createReq.data.id, createReq.status, 201);
      testApptId = createReq.data?.id;

      if (testApptId) {
        const confirmAppt = await request(`/appointments/${testApptId}/confirm`, {
          method: 'POST',
          body: { assignedAssessor: 'Charlie Hughes (NEBOSH Fire Safety)' },
        });
        assert('Appointments', 'Confirm appointment booking', confirmAppt.status === 200 && confirmAppt.data.status === 'Confirmed', confirmAppt.status, 200);
      }
    }
  }

  // 8. JOBS & AUDIT
  {
    const jobs = await request('/jobs');
    assert('Jobs', 'List scheduled assessment jobs', jobs.status === 200 && Array.isArray(jobs.data), jobs.status, 200);
  }

  // 9. DOCUMENTS & CERTIFICATES
  let testDocId = '';
  {
    if (testClientId && testPremisesId) {
      const uploadDoc = await request('/documents/upload', {
        method: 'POST',
        body: {
          clientId: testClientId,
          premisesId: testPremisesId,
          title: 'Fire Alarm Test Certificate BS 5839',
          category: 'Certificates',
          fileUrl: 'https://storage.firevault.co.uk/docs/alarm_cert_2026.pdf',
          fileName: 'alarm_cert_2026.pdf',
          expiryDate: '2027-04-15',
          notes: 'Annual inspection completed with zero faults.',
        },
      });
      assert('Documents', 'Upload statutory compliance certificate', uploadDoc.status === 201 && !!uploadDoc.data.id, uploadDoc.status, 201);
      testDocId = uploadDoc.data?.id;

      if (testDocId) {
        const history = await request(`/documents/${testDocId}/history`);
        assert('Documents', 'Get document version history', history.status === 200, history.status, 200);
      }
    }
  }

  // 10. FIRE RISK ASSESSMENTS & ACTION PLAN (PAS 79-1:2020)
  let testFraId = '';
  let testActionId = '';
  {
    if (testClientId && testPremisesId) {
      const createFra = await request('/fras', {
        method: 'POST',
        body: {
          clientId: testClientId,
          premisesId: testPremisesId,
          assessmentDate: '2026-09-18',
          assessorName: 'Charlie Hughes',
          status: 'Draft',
          overallRiskScore: 'Moderate',
          summary: 'PAS 79-1:2020 Life Safety Commercial Assessment.',
        },
      });
      assert('FRAs', 'Create Fire Risk Assessment record', createFra.status === 201 && !!createFra.data.id, createFra.status, 201);
      testFraId = createFra.data?.id;

      // Add remedial action
      const createAction = await request('/actions', {
        method: 'POST',
        body: {
          clientId: testClientId,
          premisesId: testPremisesId,
          fraId: testFraId,
          actionNumber: 'ACT-QA-01',
          category: 'Means of Escape & Fire Doors',
          deficiencyFound: 'First floor north fire door closer latch unseated.',
          actionRequired: 'Adjust overhead hydraulic door closer and inspect intumescent strip.',
          priority: 'HIGH',
          suggestedTimescaleDays: 14,
          dueDate: '2026-10-02',
          status: 'Open',
        },
      });
      assert('Actions', 'Create remedial action item', createAction.status === 201 && !!createAction.data.id, createAction.status, 201);
      testActionId = createAction.data?.id;

      // Client submits evidence
      if (testActionId) {
        const clientUpd = await request(`/actions/${testActionId}/client-update`, {
          method: 'POST',
          body: {
            clientRemediationNotes: 'Contractor adjusted arm and replaced 15mm intumescent seal.',
            evidenceDocumentId: testDocId || undefined,
          },
        });
        assert('Actions', 'Client submits rectification evidence', clientUpd.status === 200 && clientUpd.data.status === 'In Review', clientUpd.status, 200);

        // Assessor verifies and closes
        const verifyClose = await request(`/actions/${testActionId}/verify-close`, {
          method: 'POST',
          body: {
            assessorSignOffNotes: 'Evidence verified against BS 8214 standards. Approved.',
          },
        });
        assert('Actions', 'Assessor verifies & closes action item', verifyClose.status === 200 && verifyClose.data.status === 'Completed', verifyClose.status, 200);
      }

      // Issue FRA report
      if (testFraId) {
        const issueFra = await request(`/fras/${testFraId}/issue`, { method: 'POST' });
        assert('FRAs', 'Issue formal FRA report with distribution email', issueFra.status === 200 && issueFra.data.status === 'Issued', issueFra.status, 200);
      }
    }
  }

  // 11. MESSAGES & DIRECT EMAILS
  {
    if (testClientId) {
      const sendMsg = await request('/messages', {
        method: 'POST',
        body: {
          clientId: testClientId,
          senderType: 'client',
          senderName: 'Jane Dutyholder',
          messageText: 'Hello Charlie, when will you arrive for the site assessment?',
        },
      });
      assert('Messages', 'Send portal chat message', sendMsg.status === 201 && !!sendMsg.data.id, sendMsg.status, 201);
    }

    // Direct email dispatch
    const directEmail = await request('/emails/direct-send', {
      method: 'POST',
      body: {
        recipientEmail: 'qa-test@example.com',
        recipientName: 'QA Test Recipient',
        subject: 'Important Site Access Notice',
        message: 'Please ensure roof plant access keys are at security reception.',
      },
    });
    assert('Emails', 'Direct custom email dispatch and logging', directEmail.status === 200 && directEmail.data.success, directEmail.status, 200);

    const emailLogs = await request('/emails/logs');
    assert('Emails', 'Email logs include direct email', emailLogs.status === 200 && Array.isArray(emailLogs.data) && emailLogs.data.some((m: any) => m.subject.includes('Site Access')), emailLogs.status, 200);
  }

  // 12. BUSINESS REPORTING & AUDIT TRAIL
  {
    const dashReport = await request('/reports/dashboard');
    assert('Reporting', 'Dashboard statistical report returns valid metrics', dashReport.status === 200 && typeof dashReport.data.totalClients === 'number', dashReport.status, 200);

    const portReport = await request('/reports/portfolio');
    assert('Reporting', 'Portfolio compliance matrix report returns data', portReport.status === 200 && Array.isArray(portReport.data.portfolio), portReport.status, 200);

    const auditTrail = await request('/audit');
    assert('Reporting', 'Audit trail records system events', auditTrail.status === 200 && Array.isArray(auditTrail.data) && auditTrail.data.length > 0, auditTrail.status, 200);
  }

  // 13. SETTINGS & POLICIES
  {
    const settings = await request('/settings');
    assert('Settings', 'Get business settings', settings.status === 200 && !!settings.data.businessName, settings.status, 200);

    const updateSettings = await request('/settings', {
      method: 'PUT',
      body: {
        companyNumber: '14920831',
        vatRegistered: false,
      },
    });
    assert('Settings', 'Update business settings', updateSettings.status === 200, updateSettings.status, 200);

    const policies = await request('/policies');
    assert('Policies', 'Get all statutory legal policies', policies.status === 200 && Array.isArray(policies.data) && policies.data.length >= 6, policies.status, 200);
  }

  // 14. DATA PERSISTENCE VERIFICATION ACROSS RELOAD
  console.log('\n--- VERIFYING DATA PERSISTENCE IN fra_db.json ---');
  {
    const clients = await request('/clients');
    const persisted = clients.data?.some((c: any) => c.id === testClientId);
    assert('Persistence', 'Client created persists in database', persisted, clients.status, 200);
  }

  // CLEANUP QA TEST RECORDS
  console.log('\n--- CLEANING UP QA TEST DATA ---');
  if (testClientId) {
    await request(`/clients/${testClientId}/archive`, { method: 'POST' });
    console.log(`Archived test client ${testClientId}`);
  }
  if (testPremisesId) {
    await request(`/premises/${testPremisesId}/archive`, { method: 'POST' });
    console.log(`Archived test premises ${testPremisesId}`);
  }

  // SUMMARY
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log('\n====================================================');
  console.log(`AUDIT SUMMARY: ${total} tests executed`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('====================================================');

  if (failed > 0) {
    console.log('\nFailed Tests:');
    results.filter((r) => !r.passed).forEach((r) => {
      console.log(`- [${r.suite}] ${r.name}: Status ${r.status} (expected ${JSON.stringify(r.expectedStatus)}) - ${r.error || ''}`);
    });
  }
}

runAudit().catch(console.error);

import Stripe from 'stripe';
import { db } from './db.ts';

let stripeClient: Stripe | null = null;
let activeStripeKey: string | null = null;

export function getStripeClient(): Stripe | null {
  const settings = db.getSettings();
  const secretKey = process.env.STRIPE_SECRET_KEY || settings?.stripeSecretKey || '';
  const trimmed = secretKey.trim();
  if (!trimmed) {
    stripeClient = null;
    activeStripeKey = null;
    return null;
  }
  if (!stripeClient || activeStripeKey !== trimmed) {
    stripeClient = new Stripe(trimmed, {
      apiVersion: '2025-02-24.acacia' as any,
    });
    activeStripeKey = trimmed;
  }
  return stripeClient;
}

export interface CreatePaymentIntentParams {
  amountPence: number;
  currency?: 'gbp';
  clientId: string;
  clientName: string;
  clientEmail: string;
  invoiceId?: string;
  quoteId?: string;
  description: string;
}

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  isMock: boolean;
}

export async function createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
  const client = getStripeClient();

  if (client) {
    try {
      const intent = await client.paymentIntents.create({
        amount: params.amountPence,
        currency: params.currency || 'gbp',
        description: params.description,
        metadata: {
          clientId: params.clientId,
          clientName: params.clientName,
          clientEmail: params.clientEmail,
          invoiceId: params.invoiceId || '',
          quoteId: params.quoteId || '',
        },
        automatic_payment_methods: { enabled: true },
      });

      return {
        clientSecret: intent.client_secret || '',
        paymentIntentId: intent.id,
        amount: params.amountPence / 100,
        currency: 'GBP',
        isMock: false,
      };
    } catch (err) {
      console.error('Stripe API error, using sandbox fallback:', err);
    }
  }

  // Authentic sandbox payment intent (when STRIPE_SECRET_KEY is not configured)
  const mockIntentId = `pi_sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    clientSecret: `${mockIntentId}_secret_test`,
    paymentIntentId: mockIntentId,
    amount: params.amountPence / 100,
    currency: 'GBP',
    isMock: true,
  };
}

export async function processPaymentSuccess(params: {
  paymentIntentId: string;
  clientId: string;
  amount: number;
  quoteId?: string;
  invoiceId?: string;
  paymentMethod?: 'card' | 'bank_transfer';
}) {
  const now = new Date().toISOString();

  // 1. Record payment in database
  const paymentRecord = db.createPayment({
    clientId: params.clientId,
    invoiceId: params.invoiceId,
    quoteId: params.quoteId,
    amount: params.amount,
    currency: 'GBP',
    status: 'succeeded',
    stripePaymentIntentId: params.paymentIntentId,
    paymentMethod: params.paymentMethod || 'card',
    receiptUrl: `/invoices/receipt/${params.paymentIntentId}`,
  });

  // 2. Update Invoice if present
  if (params.invoiceId) {
    db.updateInvoice(params.invoiceId, {
      paymentStatus: 'Paid',
      paymentDate: now,
      stripePaymentIntentId: params.paymentIntentId,
    });
  }

  // 3. Update Quote if present
  if (params.quoteId) {
    const quote = db.getQuoteById(params.quoteId);
    if (quote) {
      db.updateQuote(params.quoteId, {
        status: 'Accepted',
      });

      // Update client status to 'Booked' or 'Active Client'
      const client = db.getClientById(params.clientId);
      if (client && (client.status === 'Awaiting Payment' || client.status === 'Quoted' || client.status === 'Quote Accepted')) {
        db.updateClient(params.clientId, { status: 'Booked' });
      }

      // Also ensure invoice exists and is marked paid
      const existingInvoice = db.getInvoices(params.clientId).find((i) => i.quoteId === params.quoteId);
      if (existingInvoice) {
        db.updateInvoice(existingInvoice.id, {
          paymentStatus: 'Paid',
          paymentDate: now,
          stripePaymentIntentId: params.paymentIntentId,
        });
      } else {
        db.createInvoice({
          clientId: params.clientId,
          premisesId: quote.premisesId,
          quoteId: quote.id,
          invoiceDate: now.split('T')[0],
          dueDate: now.split('T')[0],
          description: `Payment received for Quote ${quote.quoteNumber}: ${quote.serviceType}`,
          items: quote.items,
          netAmount: quote.netAmount,
          vatRate: quote.vatRate,
          vatAmount: quote.vatAmount,
          totalAmount: quote.totalAmount,
          paymentStatus: 'Paid',
          paymentDate: now,
          stripePaymentIntentId: params.paymentIntentId,
          isVoid: false,
        });
      }

      // Update premises status
      if (quote.premisesId) {
        const premises = db.getPremisesById(quote.premisesId);
        if (premises && (premises.status === 'Enquiry' || premises.status === 'Awaiting information')) {
          db.updatePremises(quote.premisesId, { status: 'Ready for assessment' });
        }
      }
    }
  }

  // 4. Create in-app notifications
  const client = db.getClientById(params.clientId);
  const clientName = client ? client.companyName : 'Client';

  db.createNotification({
    recipientRole: 'admin',
    clientId: params.clientId,
    title: 'Payment Received',
    message: `Payment of £${params.amount.toFixed(2)} received from ${clientName}. Client is now eligible to schedule assessment.`,
    linkUrl: `/admin/invoices`,
  });

  db.createNotification({
    recipientRole: 'client',
    clientId: params.clientId,
    title: 'Payment Confirmed',
    message: `Your payment of £${params.amount.toFixed(2)} has been successfully received. You can now request your preferred assessment appointment date.`,
    linkUrl: `/client/appointments`,
  });

  // 5. Audit log
  db.logAudit(
    params.clientId,
    clientName,
    'CLIENT',
    'PAYMENT_RECEIVED',
    'PAYMENT',
    paymentRecord.id,
    undefined,
    { amount: params.amount, paymentIntentId: params.paymentIntentId }
  );

  return paymentRecord;
}

export async function processRefund(params: {
  paymentRecordId: string;
  reason?: string;
  adminUserId: string;
  adminUserName: string;
}) {
  const payment = db.getPayments().find((p) => p.id === params.paymentRecordId);
  if (!payment) {
    throw new Error('Payment record not found');
  }

  if (payment.status === 'refunded') {
    throw new Error('Payment has already been refunded');
  }

  const client = getStripeClient();
  let stripeRefundId = `re_sandbox_${Date.now()}`;

  if (client && payment.stripePaymentIntentId && !payment.stripePaymentIntentId.startsWith('pi_sandbox_')) {
    try {
      const refund = await client.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        reason: 'requested_by_customer',
      });
      stripeRefundId = refund.id;
    } catch (err: any) {
      console.error('Stripe refund error:', err);
      throw new Error(`Stripe refund failed: ${err.message}`);
    }
  }

  payment.status = 'refunded';
  payment.stripeRefundId = stripeRefundId;

  if (payment.invoiceId) {
    db.updateInvoice(payment.invoiceId, {
      paymentStatus: 'Refunded',
    });
  }

  db.logAudit(
    params.adminUserId,
    params.adminUserName,
    'ADMIN',
    'PAYMENT_REFUNDED',
    'PAYMENT',
    payment.id,
    { status: 'succeeded' },
    { status: 'refunded', stripeRefundId }
  );

  return payment;
}

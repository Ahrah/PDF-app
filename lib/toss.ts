/**
 * Toss Payments Billing API integration
 * Documentation: https://docs.tosspayments.com/reference/billing
 */

import { PRICING } from './pricing';

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY;
const TOSS_API_BASE = 'https://api.tosspayments.com/v1';

if (!TOSS_SECRET_KEY && process.env.NODE_ENV === 'production') {
  console.warn('TOSS_SECRET_KEY is not set. Billing features will not work.');
}

function getAuthHeader(): string {
  if (!TOSS_SECRET_KEY) {
    throw new Error('TOSS_SECRET_KEY environment variable is not configured');
  }
  return `Basic ${Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64')}`;
}

export interface TossBillingAuthResponse {
  mId: string;
  customerKey: string;
  authenticatedAt: string;
  method: string;
  billingKey: string;
}

export interface TossPaymentResponse {
  mId: string;
  version: string;
  paymentKey: string;
  orderId: string;
  orderName: string;
  currency: string;
  method: string;
  totalAmount: number;
  balanceAmount: number;
  suppliedAmount: number;
  vat: number;
  status: string;
  requestedAt: string;
  approvedAt: string;
  useEscrow: boolean;
  cultureExpense: boolean;
  card?: {
    company: string;
    number: string;
    installmentPlanMonths: number;
    isInterestFree: boolean;
    approveNo: string;
    useCardPoint: boolean;
    cardType: string;
    ownerType: string;
    acquireStatus: string;
    receiptUrl: string;
  };
  billingKey?: string;
  customerKey?: string;
}

export interface TossError {
  code: string;
  message: string;
}

/**
 * Exchange authKey for billingKey (after user completes card registration)
 */
export async function issueBillingKey(
  authKey: string,
  customerKey: string
): Promise<TossBillingAuthResponse> {
  const response = await fetch(`${TOSS_API_BASE}/billing/authorizations/issue`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      authKey,
      customerKey,
    }),
  });

  if (!response.ok) {
    const error: TossError = await response.json();
    throw new Error(`Toss Billing Auth failed: ${error.code} - ${error.message}`);
  }

  return response.json();
}

/**
 * Charge a payment using billingKey
 */
export async function chargePayment(params: {
  billingKey: string;
  customerKey: string;
  orderId: string;
  amount: number;
  orderName: string;
  customerEmail?: string;
}): Promise<TossPaymentResponse> {
  const response = await fetch(`${TOSS_API_BASE}/billing/${params.billingKey}`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
      'Idempotency-Key': params.orderId,
    },
    body: JSON.stringify({
      customerKey: params.customerKey,
      amount: params.amount,
      orderId: params.orderId,
      orderName: params.orderName,
      customerEmail: params.customerEmail,
    }),
  });

  if (!response.ok) {
    const error: TossError = await response.json();
    throw new Error(`Toss Payment failed: ${error.code} - ${error.message}`);
  }

  return response.json();
}

/**
 * Cancel a payment
 */
export async function cancelPayment(
  paymentKey: string,
  cancelReason: string
): Promise<TossPaymentResponse> {
  const response = await fetch(`${TOSS_API_BASE}/payments/${paymentKey}/cancel`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cancelReason,
    }),
  });

  if (!response.ok) {
    const error: TossError = await response.json();
    throw new Error(`Toss Cancel failed: ${error.code} - ${error.message}`);
  }

  return response.json();
}

/**
 * Generate a unique orderId for idempotent billing
 */
export function generateOrderId(userId: string, timestamp: number = Date.now()): string {
  return `ORDER_${userId.slice(0, 8)}_${timestamp}`;
}

/**
 * Generate stable customerKey for a user
 */
export function generateCustomerKey(userId: string): string {
  return `CUSTOMER_${userId}`;
}

/**
 * Get default order name for recurring billing
 */
export function getDefaultOrderName(month: string): string {
  return `견적함 프리미엄 플랜 (${month})`;
}

/**
 * Check if Toss integration is configured
 */
export function isTossConfigured(): boolean {
  return !!TOSS_SECRET_KEY && !!process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
}

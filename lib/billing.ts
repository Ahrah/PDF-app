/**
 * Subscription and payment database operations
 */

import { getSupabaseAdmin } from './supabase';
import { PRICING } from './pricing';

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'locked';
export type PaymentStatus = 'pending' | 'approved' | 'failed' | 'canceled' | 'refunded';

export interface Subscription {
  id: string;
  userId: string;
  status: SubscriptionStatus;
  billingKey: string | null;
  customerKey: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  nextBillingAt: string | null;
  canceledAt: string | null;
  failCount: number;
  lastFailureCode: string | null;
  lastFailureMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  subscriptionId: string | null;
  orderId: string;
  paymentKey: string | null;
  amount: number;
  status: PaymentStatus;
  approvedAt: string | null;
  failedAt: string | null;
  failureCode: string | null;
  failureMessage: string | null;
  rawResponse: any;
  createdAt: string;
  updatedAt: string;
}

function mapSubscription(row: any): Subscription {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    billingKey: row.billing_key,
    customerKey: row.customer_key,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    nextBillingAt: row.next_billing_at,
    canceledAt: row.canceled_at,
    failCount: row.fail_count,
    lastFailureCode: row.last_failure_code,
    lastFailureMessage: row.last_failure_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPayment(row: any): Payment {
  return {
    id: row.id,
    userId: row.user_id,
    subscriptionId: row.subscription_id,
    orderId: row.order_id,
    paymentKey: row.payment_key,
    amount: row.amount,
    status: row.status,
    approvedAt: row.approved_at,
    failedAt: row.failed_at,
    failureCode: row.failure_code,
    failureMessage: row.failure_message,
    rawResponse: row.raw_response,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ---------- Subscriptions ----------

export async function getSubscription(userId: string): Promise<Subscription | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapSubscription(data) : null;
}

export async function createSubscription(params: {
  userId: string;
  customerKey: string;
  billingKey: string;
}): Promise<Subscription> {
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const { data, error } = await getSupabaseAdmin()
    .from('subscriptions')
    .insert({
      user_id: params.userId,
      customer_key: params.customerKey,
      billing_key: params.billingKey,
      status: 'active',
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      next_billing_at: periodEnd.toISOString(),
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapSubscription(data);
}

export async function updateSubscription(
  userId: string,
  updates: Partial<Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<Subscription | null> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.status !== undefined) patch.status = updates.status;
  if (updates.billingKey !== undefined) patch.billing_key = updates.billingKey;
  if (updates.currentPeriodStart !== undefined) patch.current_period_start = updates.currentPeriodStart;
  if (updates.currentPeriodEnd !== undefined) patch.current_period_end = updates.currentPeriodEnd;
  if (updates.nextBillingAt !== undefined) patch.next_billing_at = updates.nextBillingAt;
  if (updates.canceledAt !== undefined) patch.canceled_at = updates.canceledAt;
  if (updates.failCount !== undefined) patch.fail_count = updates.failCount;
  if (updates.lastFailureCode !== undefined) patch.last_failure_code = updates.lastFailureCode;
  if (updates.lastFailureMessage !== undefined) patch.last_failure_message = updates.lastFailureMessage;

  const { data, error } = await getSupabaseAdmin()
    .from('subscriptions')
    .update(patch)
    .eq('user_id', userId)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data ? mapSubscription(data) : null;
}

export async function cancelSubscription(userId: string): Promise<Subscription | null> {
  return updateSubscription(userId, {
    status: 'canceled',
    canceledAt: new Date().toISOString(),
  });
}

/**
 * Get all subscriptions that are due for billing (status=active, next_billing_at <= now)
 */
export async function getSubscriptionsDueForBilling(): Promise<Subscription[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('subscriptions')
    .select('*')
    .eq('status', 'active')
    .lte('next_billing_at', new Date().toISOString());
  if (error) throw error;
  return (data || []).map(mapSubscription);
}

// ---------- Payments ----------

export async function createPayment(params: {
  userId: string;
  subscriptionId: string | null;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  paymentKey?: string;
  approvedAt?: string;
  failureCode?: string;
  failureMessage?: string;
  rawResponse?: any;
}): Promise<Payment> {
  const { data, error } = await getSupabaseAdmin()
    .from('payments')
    .insert({
      user_id: params.userId,
      subscription_id: params.subscriptionId || null,
      order_id: params.orderId,
      payment_key: params.paymentKey || null,
      amount: params.amount,
      status: params.status,
      approved_at: params.approvedAt || null,
      failed_at: params.status === 'failed' ? new Date().toISOString() : null,
      failure_code: params.failureCode || null,
      failure_message: params.failureMessage || null,
      raw_response: params.rawResponse || null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapPayment(data);
}

export async function getPaymentsByUser(userId: string): Promise<Payment[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapPayment);
}

export async function getPaymentByOrderId(orderId: string): Promise<Payment | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('payments')
    .select('*')
    .eq('order_id', orderId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapPayment(data) : null;
}

/**
 * Mark user as premium (is_premium = true) when they have an active subscription
 */
export async function updateUserPremiumStatus(userId: string, isPremium: boolean): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from('app_users')
    .update({ is_premium: isPremium, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
}

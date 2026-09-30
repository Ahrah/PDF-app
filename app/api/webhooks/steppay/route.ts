import { NextRequest, NextResponse } from 'next/server';
import { applyStepPayPayment, applyStepPaySubscription } from '@/lib/db';
import {
  isActiveSubscriptionStatus,
  isPremiumProduct,
  verifyStepPaySignature,
} from '@/lib/steppay';

export async function POST(request: NextRequest) {
  const secret = process.env.STEPPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('STEPPAY_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Webhook is not configured' }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get('steppay-signature') || '';
  if (!verifyStepPaySignature(signature, rawBody, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const timestamp = Number(payload.timestamp);
  if (!Number.isSafeInteger(timestamp) || timestamp <= 0) {
    return NextResponse.json({ error: 'Invalid timestamp' }, { status: 400 });
  }

  if (!isPremiumProduct(payload.data)) {
    return NextResponse.json({ received: true, ignored: 'unrelated_product' });
  }

  let matched = false;
  if (payload.event === 'payment.completed' && payload.data?.status === 'COMPLETE') {
    const email = String(payload.data?.payer?.email || '').trim().toLowerCase();
    if (!email) return NextResponse.json({ received: true, matched: false });
    matched = await applyStepPayPayment(
      email,
      payload.data?.customerId ? String(payload.data.customerId) : undefined,
      timestamp
    );
  } else if (
    payload.event === 'subscription.created' ||
    payload.event === 'subscription.updated'
  ) {
    const customerId = String(payload.data?.customerId || '');
    const subscriptionId = String(payload.data?.subscriptionId || '');
    if (!customerId || !subscriptionId) {
      return NextResponse.json({ received: true, matched: false });
    }
    matched = await applyStepPaySubscription(
      customerId,
      subscriptionId,
      isActiveSubscriptionStatus(payload.data?.status),
      timestamp
    );
  }

  if (!matched) console.warn('Unmatched or duplicate StepPay webhook', payload.event);
  return NextResponse.json({ received: true, matched });
}

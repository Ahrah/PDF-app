import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { issueBillingKey, chargePayment, generateOrderId, getDefaultOrderName, generateCustomerKey } from '@/lib/toss';
import { createSubscription, createPayment, updateUserPremiumStatus, getSubscription } from '@/lib/billing';
import { PRICING } from '@/lib/pricing';
import { getUserById } from '@/lib/db';

/**
 * Complete billing registration:
 * 1. Exchange authKey for billingKey
 * 2. Charge first payment immediately
 * 3. Create subscription record
 * 4. Mark user as premium
 */
export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const { authKey } = await request.json();
    if (!authKey) {
      return NextResponse.json({ error: 'authKey가 필요합니다.' }, { status: 400 });
    }

    // Check if user already has an active subscription
    const existing = await getSubscription(session.userId);
    if (existing && existing.status === 'active') {
      return NextResponse.json(
        { error: '이미 활성화된 구독이 있습니다.' },
        { status: 400 }
      );
    }

    const customerKey = generateCustomerKey(session.userId);
    
    // Step 1: Exchange authKey for billingKey
    const billingAuth = await issueBillingKey(authKey, customerKey);

    // Step 2: Charge first payment immediately
    const orderId = generateOrderId(session.userId);
    const user = await getUserById(session.userId);
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const payment = await chargePayment({
      billingKey: billingAuth.billingKey,
      customerKey,
      orderId,
      amount: PRICING.MONTHLY_PRICE_KRW,
      orderName: getDefaultOrderName(currentMonth),
      customerEmail: user?.email,
    });

    // Step 3: Record payment
    await createPayment({
      userId: session.userId,
      subscriptionId: null, // will update after creating subscription
      orderId,
      amount: PRICING.MONTHLY_PRICE_KRW,
      status: 'approved',
      paymentKey: payment.paymentKey,
      approvedAt: payment.approvedAt,
      rawResponse: payment,
    });

    // Step 4: Create subscription
    const subscription = await createSubscription({
      userId: session.userId,
      customerKey,
      billingKey: billingAuth.billingKey,
    });

    // Step 5: Mark user as premium
    await updateUserPremiumStatus(session.userId, true);

    return NextResponse.json({
      success: true,
      subscription: {
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        nextBillingAt: subscription.nextBillingAt,
      },
      payment: {
        orderId: payment.orderId,
        amount: payment.totalAmount,
        approvedAt: payment.approvedAt,
      },
    });
  } catch (error: any) {
    console.error('Failed to complete billing registration:', error);
    
    // Create failed payment record
    try {
      const orderId = generateOrderId(session.userId);
      await createPayment({
        userId: session.userId,
        subscriptionId: null,
        orderId,
        amount: PRICING.MONTHLY_PRICE_KRW,
        status: 'failed',
        failureCode: error.code || 'UNKNOWN',
        failureMessage: error.message,
        rawResponse: error,
      });
    } catch (paymentRecordError) {
      console.error('Failed to record failed payment:', paymentRecordError);
    }

    return NextResponse.json(
      { error: error.message || '결제 등록에 실패했습니다. 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}

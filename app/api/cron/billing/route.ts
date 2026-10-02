import { NextResponse } from 'next/server';
import { getSubscriptionsDueForBilling, updateSubscription, createPayment, updateUserPremiumStatus } from '@/lib/billing';
import { chargePayment, generateOrderId, getDefaultOrderName, generateCustomerKey } from '@/lib/toss';
import { PRICING } from '@/lib/pricing';
import { getUserById } from '@/lib/db';

const CRON_SECRET = process.env.CRON_SECRET;
const MAX_FAIL_COUNT = 3; // Lock subscription after 3 failed charges

/**
 * Recurring billing cron job
 * Protected by CRON_SECRET header
 * Should be called daily by Vercel Cron
 */
export async function POST(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    errors: [] as string[],
  };

  try {
    const subscriptions = await getSubscriptionsDueForBilling();
    results.processed = subscriptions.length;

    for (const subscription of subscriptions) {
      try {
        // Skip if no billing key
        if (!subscription.billingKey) {
          results.errors.push(`Subscription ${subscription.id}: No billing key`);
          continue;
        }

        const user = await getUserById(subscription.userId);
        if (!user) {
          results.errors.push(`Subscription ${subscription.id}: User not found`);
          continue;
        }

        const orderId = generateOrderId(subscription.userId);
        const currentMonth = new Date().toISOString().slice(0, 7);

        // Charge payment
        const payment = await chargePayment({
          billingKey: subscription.billingKey,
          customerKey: subscription.customerKey,
          orderId,
          amount: PRICING.MONTHLY_PRICE_KRW,
          orderName: getDefaultOrderName(currentMonth),
          customerEmail: user.email,
        });

        // Record successful payment
        await createPayment({
          userId: subscription.userId,
          subscriptionId: subscription.id,
          orderId,
          amount: PRICING.MONTHLY_PRICE_KRW,
          status: 'approved',
          paymentKey: payment.paymentKey,
          approvedAt: payment.approvedAt,
          rawResponse: payment,
        });

        // Update subscription period
        const now = new Date();
        const nextPeriodEnd = new Date(now);
        nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);

        await updateSubscription(subscription.userId, {
          currentPeriodStart: now.toISOString(),
          currentPeriodEnd: nextPeriodEnd.toISOString(),
          nextBillingAt: nextPeriodEnd.toISOString(),
          failCount: 0,
          lastFailureCode: null,
          lastFailureMessage: null,
        });

        results.succeeded++;
      } catch (error: any) {
        results.failed++;
        const failCount = (subscription.failCount || 0) + 1;

        // Record failed payment
        try {
          const orderId = generateOrderId(subscription.userId);
          await createPayment({
            userId: subscription.userId,
            subscriptionId: subscription.id,
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

        // Update subscription with failure
        const updates: any = {
          failCount,
          lastFailureCode: error.code || 'UNKNOWN',
          lastFailureMessage: error.message,
        };

        // Move to past_due after first failure, lock after MAX_FAIL_COUNT
        if (failCount === 1) {
          updates.status = 'past_due';
        } else if (failCount >= MAX_FAIL_COUNT) {
          updates.status = 'locked';
          // Remove premium status when locked
          await updateUserPremiumStatus(subscription.userId, false);
        }

        await updateSubscription(subscription.userId, updates);

        results.errors.push(
          `Subscription ${subscription.id} (${subscription.userId}): ${error.message}`
        );
      }
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Cron billing error:', error);
    return NextResponse.json(
      { error: error.message, results },
      { status: 500 }
    );
  }
}

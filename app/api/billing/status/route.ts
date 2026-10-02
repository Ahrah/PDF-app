import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getSubscription, getPaymentsByUser } from '@/lib/billing';
import { isTossConfigured } from '@/lib/toss';

/**
 * Get current billing status and payment history
 */
export async function GET() {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    if (!isTossConfigured()) {
      return NextResponse.json({
        configured: false,
        subscription: null,
        payments: [],
      });
    }

    const [subscription, payments] = await Promise.all([
      getSubscription(session.userId),
      getPaymentsByUser(session.userId),
    ]);

    return NextResponse.json({
      configured: true,
      subscription,
      payments,
    });
  } catch (error) {
    console.error('Failed to get billing status:', error);
    return NextResponse.json(
      { error: '결제 정보를 불러오지 못했습니다.' },
      { status: 500 }
    );
  }
}

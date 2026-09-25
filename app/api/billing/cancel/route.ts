import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getSubscription, cancelSubscription } from '@/lib/billing';

/**
 * Cancel subscription - stops future charges but keeps access until period end
 */
export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const subscription = await getSubscription(session.userId);
    if (!subscription) {
      return NextResponse.json(
        { error: '구독 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (subscription.status === 'canceled') {
      return NextResponse.json(
        { error: '이미 해지된 구독입니다.' },
        { status: 400 }
      );
    }

    await cancelSubscription(session.userId);

    return NextResponse.json({
      success: true,
      message: '구독이 해지되었습니다. 현재 기간 종료일까지 서비스를 이용하실 수 있습니다.',
      currentPeriodEnd: subscription.currentPeriodEnd,
    });
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    return NextResponse.json(
      { error: '구독 해지에 실패했습니다.' },
      { status: 500 }
    );
  }
}

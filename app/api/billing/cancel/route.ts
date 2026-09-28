import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { cancelHubSubscription } from '@/lib/hubCheckout';

const QUOTE_PRO_PRODUCT_ID = 'quote-pro';

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const result = await cancelHubSubscription(session.userId, QUOTE_PRO_PRODUCT_ID);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to cancel hub subscription:', error);
    const message = error instanceof Error ? error.message : '구독 해지에 실패했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

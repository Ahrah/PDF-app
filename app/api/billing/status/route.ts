import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getHubSubscriptionStatus } from '@/lib/hubCheckout';

const QUOTE_PRO_PRODUCT_ID = 'quote-pro';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const status = await getHubSubscriptionStatus(session.userId, QUOTE_PRO_PRODUCT_ID);
    return NextResponse.json(status);
  } catch (error) {
    console.error('Failed to fetch hub subscription status:', error);
    return NextResponse.json({ error: '구독 상태를 가져오지 못했습니다.' }, { status: 500 });
  }
}

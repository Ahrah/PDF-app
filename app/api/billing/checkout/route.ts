import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createHubCheckoutUrl } from '@/lib/hubCheckout';

// 상품 id는 허브(chwimilab-hub)의 lib/products.ts가 단일 소스다 — 여기서는 그 id 문자열만 참조한다.
const QUOTE_PRO_PRODUCT_ID = 'quote-pro';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const origin = new URL(request.url).origin;

  try {
    const hubCheckoutUrl = await createHubCheckoutUrl({
      userId: session.userId,
      productId: QUOTE_PRO_PRODUCT_ID,
      returnUrl: `${origin}/billing`,
    });
    return NextResponse.json({ url: hubCheckoutUrl });
  } catch (error) {
    console.error('Failed to create hub checkout url:', error);
    return NextResponse.json({ error: '결제 페이지를 여는 데 실패했습니다.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { generateCustomerKey } from '@/lib/toss';

/**
 * Initialize billing registration - returns customerKey for Toss SDK
 */
export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const customerKey = generateCustomerKey(session.userId);
    
    return NextResponse.json({
      customerKey,
      clientKey: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
    });
  } catch (error) {
    console.error('Failed to initialize billing:', error);
    return NextResponse.json(
      { error: '결제 초기화에 실패했습니다.' },
      { status: 500 }
    );
  }
}

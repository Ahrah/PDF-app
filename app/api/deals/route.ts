import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDeals, createDeal } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  try {
    const deals = await getDeals(session.userId);
    return NextResponse.json(deals);
  } catch (error) {
    return NextResponse.json({ error: '거래 목록을 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const deal = await createDeal(session.userId, body);
    return NextResponse.json(deal);
  } catch (error) {
    const message = error instanceof Error ? error.message : '거래를 저장하지 못했습니다.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

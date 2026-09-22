import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSeller, updateSeller } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  try {
    const seller = await getSeller(session.userId);
    return NextResponse.json(seller);
  } catch (error) {
    return NextResponse.json({ error: '판매자 정보를 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const seller = await updateSeller(session.userId, body);
    return NextResponse.json(seller);
  } catch (error) {
    return NextResponse.json({ error: '판매자 정보를 저장하지 못했습니다.' }, { status: 500 });
  }
}

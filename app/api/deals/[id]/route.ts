import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDeal, updateDeal, deleteDeal } from '@/lib/db';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    const deal = await getDeal(session.userId, id);
    if (!deal) {
      return NextResponse.json({ error: '거래를 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json(deal);
  } catch (error) {
    return NextResponse.json({ error: '거래 정보를 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    const body = await request.json();
    const deal = await updateDeal(session.userId, id, body);
    if (!deal) {
      return NextResponse.json({ error: '거래를 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json(deal);
  } catch (error) {
    return NextResponse.json({ error: '거래를 수정하지 못했습니다.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    const success = await deleteDeal(session.userId, id);
    if (!success) {
      return NextResponse.json({ error: '거래를 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: '거래를 삭제하지 못했습니다.' }, { status: 500 });
  }
}

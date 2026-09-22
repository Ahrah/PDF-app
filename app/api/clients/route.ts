import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getClients, createClient } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  try {
    const clients = await getClients(session.userId);
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    return NextResponse.json({ error: '고객 목록을 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const client = await createClient(session.userId, body);
    return NextResponse.json(client);
  } catch (error) {
    const message = error instanceof Error ? error.message : '고객을 저장하지 못했어요.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

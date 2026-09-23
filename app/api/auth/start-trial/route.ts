import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { startTrial } from '@/lib/db';

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const trialEndsAt = await startTrial(session.userId);
    if (!trialEndsAt) {
      return NextResponse.json({ error: '이미 체험을 시작했습니다.' }, { status: 400 });
    }
    return NextResponse.json({ trialEndsAt });
  } catch (error) {
    console.error('Start trial error:', error);
    return NextResponse.json({ error: '체험을 시작하지 못했습니다.' }, { status: 500 });
  }
}

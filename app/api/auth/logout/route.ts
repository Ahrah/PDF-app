import { NextResponse } from 'next/server';
import { getClearSessionCookieHeader } from '@/lib/auth';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    response.headers.set('Set-Cookie', getClearSessionCookieHeader());
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: '로그아웃에 실패했습니다.' },
      { status: 500 }
    );
  }
}

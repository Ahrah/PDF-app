import { NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/db';
import { hashPassword, createSession, getSessionCookieHeader } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 6자 이상이어야 합니다.' },
        { status: 400 }
      );
    }
    
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: '이미 가입된 이메일입니다.' },
        { status: 400 }
      );
    }
    
    const passwordHash = await hashPassword(password);
    
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 30);
    
    const user = await createUser({
      email,
      passwordHash,
      trialEndsAt: trialEndsAt.toISOString(),
    });
    
    const token = await createSession({
      userId: user.id,
      email: user.email,
    });
    
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        trialEndsAt: user.trialEndsAt,
      },
    });
    
    response.headers.set('Set-Cookie', getSessionCookieHeader(token));
    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: '회원가입에 실패했습니다.' },
      { status: 500 }
    );
  }
}

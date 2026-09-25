import { NextResponse } from 'next/server';
import { createUser, getUserByEmail, isSignupRateLimited, recordSignupAttempt } from '@/lib/db';
import { hashPassword, createSession, getSessionCookieHeader, getClientIp } from '@/lib/auth';
import { isDisposableEmail } from '@/lib/disposable-email-domains';

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

    if (isDisposableEmail(email)) {
      return NextResponse.json(
        { error: '일회용 이메일 주소는 가입할 수 없습니다.' },
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

    // IP is absent in local dev (no proxy sets x-forwarded-for) — don't
    // block signups when we can't tell IPs apart.
    const ip = getClientIp(request);
    if (ip && (await isSignupRateLimited(ip))) {
      return NextResponse.json(
        { error: '짧은 시간에 너무 많은 계정이 가입되었습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Trial no longer auto-starts on signup — the user has to explicitly
    // hit "체험하기" (see /api/auth/start-trial). A plain signup gets the
    // free plan (3 docs/month + watermark) until they do.
    const user = await createUser({
      email,
      passwordHash,
      trialEndsAt: null,
    });

    if (ip) {
      await recordSignupAttempt(ip, email);
    }

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

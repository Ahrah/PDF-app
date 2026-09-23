import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'default-secret-change-in-production'
);

const PROTECTED_PREFIXES = ['/clients', '/deals', '/settings'];
const ADMIN_PREFIX = '/admin';

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);
  const isProtected =
    isAdminRoute ||
    PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get('session')?.value;
  if (!token) {
    return isAdminRoute ? notFound() : redirectToLogin(request);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (isAdminRoute) {
      const email = typeof payload.email === 'string' ? payload.email.toLowerCase() : '';
      if (!getAdminEmails().includes(email)) {
        // 일반 회원에게는 관리자 경로가 아예 존재하지 않는 것처럼 보이게 한다.
        return notFound();
      }
    }
    return NextResponse.next();
  } catch {
    return isAdminRoute ? notFound() : redirectToLogin(request);
  }
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}

function notFound() {
  return new NextResponse('Not Found', { status: 404 });
}

export const config = {
  matcher: ['/clients/:path*', '/deals/:path*', '/settings/:path*', '/admin/:path*'],
};

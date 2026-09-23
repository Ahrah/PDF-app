import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'default-secret-change-in-production'
);

export interface SessionData {
  userId: string;
  email: string;
  [key: string]: unknown;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(data: SessionData): Promise<string> {
  const token = await new SignJWT(data)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
  
  return token;
}

export async function verifySession(token: string): Promise<SessionData | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as SessionData;
  } catch (error) {
    return null;
  }
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) return null;

  return verifySession(token);
}

/** Throws-style guard for API routes: returns the session or null (caller returns 401). */
export async function requireSession(): Promise<SessionData | null> {
  return getSession();
}

export function getSessionCookieHeader(token: string): string {
  const maxAge = 60 * 60 * 24 * 30;
  const secure = process.env.NODE_ENV === 'production' ? 'Secure; ' : '';
  return `session=${token}; HttpOnly; ${secure}SameSite=Lax; Max-Age=${maxAge}; Path=/`;
}

export function getClearSessionCookieHeader(): string {
  return 'session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/';
}

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string): boolean {
  return getAdminEmails().includes(email.trim().toLowerCase());
}

/** Returns the session only if it belongs to an admin (ADMIN_EMAILS), else null. */
export async function getAdminSession(): Promise<SessionData | null> {
  const session = await getSession();
  if (!session || !isAdminEmail(session.email)) return null;
  return session;
}

export function isTrialActive(trialEndsAt: string | null): boolean {
  return !!trialEndsAt && new Date(trialEndsAt) > new Date();
}

export function getRemainingTrialDays(trialEndsAt: string | null): number {
  if (!trialEndsAt) return 0;
  const now = new Date();
  const endsAt = new Date(trialEndsAt);
  const diff = endsAt.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

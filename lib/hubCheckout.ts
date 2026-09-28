import { SignJWT } from 'jose';

// chwimilab-hub의 lib/hubToken.ts와 짝을 이루는 발급 쪽. 페이로드 형태와
// HUB_AUTH_SECRET을 반드시 동일하게 유지해야 허브에서 검증이 통과한다.

function getSecret(): Uint8Array {
  const secret = process.env.HUB_AUTH_SECRET;
  if (!secret) {
    throw new Error('HUB_AUTH_SECRET 환경 변수가 설정되지 않았습니다.');
  }
  return new TextEncoder().encode(secret);
}

export function getHubUrl(): string {
  const url = process.env.HUB_URL;
  if (!url) {
    throw new Error('HUB_URL 환경 변수가 설정되지 않았습니다.');
  }
  return url;
}

const CHECKOUT_TOKEN_TTL_SECONDS = 10 * 60;

export async function createHubCheckoutUrl(params: {
  userId: string;
  productId: string;
  returnUrl: string;
}): Promise<string> {
  const token = await new SignJWT({
    appId: 'quote',
    userId: params.userId,
    productId: params.productId,
    returnUrl: params.returnUrl,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + CHECKOUT_TOKEN_TTL_SECONDS)
    .sign(getSecret());

  const hubUrl = new URL('/checkout', getHubUrl());
  hubUrl.searchParams.set('token', token);
  return hubUrl.toString();
}

const APP_REQUEST_TOKEN_TTL_SECONDS = 60;

async function createAppRequestToken(
  userId: string,
  purpose: 'subscription_status' | 'cancel_subscription'
): Promise<string> {
  return new SignJWT({ appId: 'quote', externalUserId: userId, purpose })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + APP_REQUEST_TOKEN_TTL_SECONDS)
    .sign(getSecret());
}

export interface HubSubscriptionStatus {
  subscription: {
    status: 'active' | 'past_due' | 'canceled';
    currentPeriodEnd: string;
    nextBillingAt: string;
    canceledAt: string | null;
  } | null;
  payments: Array<{
    orderId: string;
    amount: number;
    status: string;
    createdAt: string;
    productId: string;
  }>;
}

export async function getHubSubscriptionStatus(userId: string, productId: string): Promise<HubSubscriptionStatus> {
  const token = await createAppRequestToken(userId, 'subscription_status');
  const res = await fetch(new URL('/api/subscriptions/status', getHubUrl()).toString(), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) throw new Error('허브에서 구독 상태를 가져오지 못했습니다.');
  return res.json();
}

export async function cancelHubSubscription(userId: string, productId: string): Promise<{ activeUntil: string }> {
  const token = await createAppRequestToken(userId, 'cancel_subscription');
  const res = await fetch(new URL('/api/subscriptions/cancel', getHubUrl()).toString(), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || '구독 해지에 실패했습니다.');
  }
  return res.json();
}

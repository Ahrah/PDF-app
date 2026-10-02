import { createHmac, timingSafeEqual } from 'crypto';

export const STEPPAY_PRODUCT_CODE = 'product_BG6BqoE2N';
export const STEPPAY_PRODUCT_NAME = '견적함 프리미엄';

export function verifyStepPaySignature(
  signature: string,
  payload: string,
  secret: string
): boolean {
  const parts = Object.fromEntries(
    signature.split(',').map((part) => {
      const index = part.indexOf('=');
      return [part.slice(0, index).trim(), part.slice(index + 1).trim()];
    })
  );
  if (!parts.timestamp || !parts.key) return false;

  const expected = createHmac('sha256', secret)
    .update(`${parts.timestamp}.${payload}`)
    .digest();

  return parts.key.split(';').some((key) => {
    const actual = Buffer.from(key, 'base64');
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  });
}

export function isPremiumProduct(data: any): boolean {
  if (data?.productName === STEPPAY_PRODUCT_NAME) return true;
  return Array.isArray(data?.items) && data.items.some(
    (item: any) =>
      item?.productCode === STEPPAY_PRODUCT_CODE ||
      item?.productName === STEPPAY_PRODUCT_NAME
  );
}

export function isActiveSubscriptionStatus(status: unknown): boolean {
  return ['ACTIVE', 'PENDING_PAUSE', 'PENDING_CANCEL', 'QUEUEING'].includes(String(status));
}

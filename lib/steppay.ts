import { createHmac, timingSafeEqual } from 'crypto';

export const STEPPAY_PRODUCT_CODE = 'product_BG6BqoE2N';
export const STEPPAY_PRODUCT_NAME = '견적함 프리미엄';
export const STEPPAY_PRICE_CODE = 'price_IZwH09Bix';

const STEPPAY_API_BASE = 'https://api.steppay.kr';

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

export function isPremiumProduct(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  
  if (obj.productName === STEPPAY_PRODUCT_NAME) return true;
  
  if (Array.isArray(obj.items)) {
    return obj.items.some(
      (item: unknown) => {
        if (!item || typeof item !== 'object') return false;
        const itemObj = item as Record<string, unknown>;
        return itemObj.productCode === STEPPAY_PRODUCT_CODE ||
               itemObj.productName === STEPPAY_PRODUCT_NAME;
      }
    );
  }
  
  return false;
}

export function isActiveSubscriptionStatus(status: unknown): boolean {
  return ['ACTIVE', 'PENDING_PAUSE', 'PENDING_CANCEL', 'QUEUEING'].includes(String(status));
}

export interface StepPayCustomer {
  id: number;
  code: string;
  email: string;
  name?: string;
}

export interface StepPayOrder {
  orderId: number;
  orderCode: string;
  type: string;
  paymentDate: string | null;
  idKey: string;
}

class StepPayAPIError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'StepPayAPIError';
  }
}

async function stepPayRequest<T>(
  path: string,
  options: RequestInit & { secretToken: string }
): Promise<T> {
  const { secretToken, ...fetchOptions } = options;
  
  const response = await fetch(`${STEPPAY_API_BASE}${path}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      'Secret-Token': secretToken,
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new StepPayAPIError(
      response.status,
      `StepPay API error (${response.status}): ${text || response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

export async function findOrCreateStepPayCustomer(
  email: string,
  name: string,
  secretToken: string
): Promise<StepPayCustomer> {
  const searchResult = await stepPayRequest<{ content: StepPayCustomer[] }>(
    `/api/v1/customers?keyword=${encodeURIComponent(email)}&size=20`,
    {
      method: 'GET',
      secretToken,
    }
  );

  const existing = searchResult.content.find(
    (c) => c.email.toLowerCase().trim() === email.toLowerCase().trim()
  );
  if (existing) {
    return existing;
  }

  return stepPayRequest<StepPayCustomer>('/api/v1/customers', {
    method: 'POST',
    secretToken,
    body: JSON.stringify({
      name,
      email: email.toLowerCase().trim(),
    }),
  });
}

export async function createStepPayOrder(
  customerId: number,
  productCode: string,
  priceCode: string,
  secretToken: string
): Promise<StepPayOrder> {
  return stepPayRequest<StepPayOrder>('/api/v1/orders', {
    method: 'POST',
    secretToken,
    body: JSON.stringify({
      customerId,
      items: [
        {
          productCode,
          priceCode,
        },
      ],
    }),
  });
}

export async function getStepPayOrder(
  orderCode: string,
  secretToken: string
): Promise<StepPayOrder> {
  return stepPayRequest<StepPayOrder>(`/api/v1/orders/${orderCode}`, {
    method: 'GET',
    secretToken,
  });
}

export function buildStepPayPaymentUrl(
  orderCode: string,
  successUrl: string,
  errorUrl: string,
  cancelUrl: string
): string {
  const params = new URLSearchParams({
    successUrl,
    errorUrl,
    cancelUrl,
  });
  return `${STEPPAY_API_BASE}/api/public/orders/${orderCode}/pay?${params}`;
}

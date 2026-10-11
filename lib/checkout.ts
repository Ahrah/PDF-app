export const PREMIUM_CHECKOUT_URL =
  'https://531c90e8-ea33-4cf7-8c3d-a888b1d9fa78.mystore.steppay.kr/products/product_BG6BqoE2N';

export const PREMIUM_MANAGE_URL =
  'https://531c90e8-ea33-4cf7-8c3d-a888b1d9fa78.mystore.steppay.kr/my-page/subscription-manager';

export async function initiateCheckout(email: string, name?: string): Promise<string> {
  const response = await fetch('/api/checkout/steppay', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, name }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to initiate checkout');
  }

  const data = await response.json();
  return data.paymentUrl;
}

export function supportsAPICheckout(): boolean {
  return typeof window !== 'undefined';
}

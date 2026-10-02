import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import {
  isActiveSubscriptionStatus,
  isPremiumProduct,
  verifyStepPaySignature,
} from './steppay.ts';

test('verifies StepPay signatures and premium events', () => {
  const payload = JSON.stringify({ event: 'payment.completed' });
  const secret = 'test-secret';
  const timestamp = '1706002316';
  const key = createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('base64');

  assert.equal(verifyStepPaySignature(`timestamp=${timestamp},key=${key}`, payload, secret), true);
  assert.equal(verifyStepPaySignature(`timestamp=${timestamp},key=invalid`, payload, secret), false);
  assert.equal(isPremiumProduct({ items: [{ productCode: 'product_BG6BqoE2N' }] }), true);
  assert.equal(isActiveSubscriptionStatus('ACTIVE'), true);
  assert.equal(isActiveSubscriptionStatus('CANCELED'), false);
});

/**
 * Single source of truth for pricing and trial configuration.
 * All hardcoded prices and trial durations throughout the app must reference these constants.
 */

export const PRICING = {
  /** Monthly subscription price in KRW */
  MONTHLY_PRICE_KRW: 4900,
  
  /** Trial duration in days */
  TRIAL_DAYS: 30,
  
  /** Free tier monthly quota (number of deals that can be downloaded as PDF) */
  FREE_TIER_MONTHLY_LIMIT: 3,
  
  /** Display name for the plan */
  PLAN_NAME: '프리미엄 플랜',
} as const;

/**
 * Format price for display (e.g., "4,900원")
 */
export function formatPrice(priceKRW: number = PRICING.MONTHLY_PRICE_KRW): string {
  return `${priceKRW.toLocaleString('ko-KR')}원`;
}

/**
 * Format monthly price for display
 */
export function formatMonthlyPrice(): string {
  return `월 ${formatPrice()}`;
}

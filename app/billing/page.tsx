'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useAuth } from '@/lib/auth-context';
import { PRICING, formatMonthlyPrice, formatPrice } from '@/lib/pricing';

declare global {
  interface Window {
    TossPayments: any;
  }
}

interface BillingStatus {
  configured: boolean;
  subscription: {
    status: string;
    currentPeriodEnd: string | null;
    nextBillingAt: string | null;
    canceledAt: string | null;
  } | null;
  payments: Array<{
    id: string;
    orderId: string;
    amount: number;
    status: string;
    approvedAt: string | null;
    createdAt: string;
  }>;
}

export default function BillingPage() {
  const [usage, setUsage] = useState<{ count: number; limit: number }>({ count: 0, limit: PRICING.FREE_TIER_MONTHLY_LIMIT });
  const [trialInfo, setTrialInfo] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [registering, setRegistering] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchSettings();
    fetchBillingStatus();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setUsage({
        count: data.settings.monthlyDealCount,
        limit: data.settings.isPremium ? 999 : PRICING.FREE_TIER_MONTHLY_LIMIT,
      });
      setIsPremium(data.settings.isPremium);
      setTrialInfo(data.trialInfo);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchBillingStatus() {
    try {
      const res = await fetch('/api/billing/status');
      const data = await res.json();
      setBillingStatus(data);
    } catch (error) {
      console.error('Failed to fetch billing status:', error);
    }
  }

  async function handleRegisterCard() {
    setRegistering(true);

    try {
      // Step 1: Get customerKey and clientKey
      const initRes = await fetch('/api/billing/init', { method: 'POST' });
      const { customerKey, clientKey } = await initRes.json();

      if (!clientKey) {
        alert('결제 서비스가 설정되지 않았습니다. 관리자에게 문의하세요.');
        return;
      }

      // Step 2: Load Toss Payments SDK
      const script = document.createElement('script');
      script.src = 'https://js.tosspayments.com/v1';
      script.async = true;
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });

      const tossPayments = window.TossPayments(clientKey);

      // Step 3: Request billing auth (card registration)
      const successUrl = `${window.location.origin}/billing?success=true`;
      const failUrl = `${window.location.origin}/billing?success=false`;

      await tossPayments.requestBillingAuth('카드', {
        customerKey,
        successUrl,
        failUrl,
      });
    } catch (error: any) {
      console.error('Failed to register card:', error);
      alert(error.message || '카드 등록에 실패했습니다. 다시 시도해주세요.');
      setRegistering(false);
    }
  }

  async function handleCancelSubscription() {
    if (!confirm('정말로 구독을 해지하시겠습니까? 현재 기간 종료일까지 서비스를 계속 이용하실 수 있습니다.')) {
      return;
    }

    setCanceling(true);
    try {
      const res = await fetch('/api/billing/cancel', { method: 'POST' });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || '구독 해지에 실패했습니다.');
      }

      alert(data.message);
      await fetchBillingStatus();
      await fetchSettings();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setCanceling(false);
    }
  }

  // Handle redirect back from Toss
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const authKey = params.get('authKey');
    const customerKey = params.get('customerKey');

    if (success === 'true' && authKey && customerKey) {
      completeBillingRegistration(authKey);
    } else if (success === 'false') {
      alert('카드 등록이 취소되었습니다.');
      window.history.replaceState({}, '', '/billing');
    }
  }, []);

  async function completeBillingRegistration(authKey: string) {
    try {
      const res = await fetch('/api/billing/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '결제 등록에 실패했습니다.');
      }

      alert(`결제가 완료되었습니다. (${formatPrice(data.payment.amount)})`);
      window.history.replaceState({}, '', '/billing');
      await fetchBillingStatus();
      await fetchSettings();
    } catch (error: any) {
      alert(error.message);
      window.history.replaceState({}, '', '/billing');
    } finally {
      setRegistering(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const hasActiveSubscription = billingStatus?.subscription?.status === 'active';
  const isCanceled = billingStatus?.subscription?.status === 'canceled';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/" className="text-primary-600 hover:text-primary-700 inline-flex items-center">
          ← 대시보드로
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">사용량 및 결제</h1>

      <div className="space-y-6">
        {trialInfo?.trialActive && (
          <Card className="bg-primary-50 border-primary-200">
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 mb-2">무료 체험 기간</p>
              <p className="text-4xl font-bold text-primary-600 mb-1">
                {trialInfo.remainingDays}일 남음
              </p>
              <p className="text-sm text-gray-600">
                체험 종료일: {new Date(trialInfo.trialEndsAt).toLocaleDateString('ko-KR')}
              </p>
              <div className="mt-4 pt-4 border-t border-primary-200">
                <p className="text-sm text-gray-700">
                  <strong>현재:</strong> 무제한 문서 생성 + 워터마크 제거
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  <strong>체험 종료 후:</strong> 월 {PRICING.FREE_TIER_MONTHLY_LIMIT}건 무료 + 워터마크 포함
                </p>
                <p className="text-sm text-primary-800 mt-2">
                  <strong>{PRICING.PLAN_NAME}:</strong> {formatMonthlyPrice()}으로 계속 무제한 이용
                </p>
              </div>
            </div>
          </Card>
        )}

        {!trialInfo?.trialActive && (
          <Card className="bg-gray-50">
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 mb-2">이번 달 사용량</p>
              <p className="text-4xl font-bold text-gray-900 mb-1">
                {usage.count}/{usage.limit}건
              </p>
              <p className="text-sm text-gray-600">
                한 거래 건에는 견적서와 청구서가 함께 포함됩니다.
              </p>
            </div>
          </Card>
        )}

        {billingStatus?.subscription && (
          <Card className={hasActiveSubscription ? 'bg-success-50 border-success-200' : ''}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">구독 상태</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">상태:</span>
                <span className="font-medium">
                  {billingStatus.subscription.status === 'active' && '활성'}
                  {billingStatus.subscription.status === 'past_due' && '결제 실패'}
                  {billingStatus.subscription.status === 'canceled' && '해지됨'}
                  {billingStatus.subscription.status === 'locked' && '잠김'}
                </span>
              </div>
              {billingStatus.subscription.currentPeriodEnd && (
                <div className="flex justify-between">
                  <span className="text-gray-600">현재 기간 종료:</span>
                  <span className="font-medium">
                    {new Date(billingStatus.subscription.currentPeriodEnd).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              )}
              {billingStatus.subscription.nextBillingAt && !isCanceled && (
                <div className="flex justify-between">
                  <span className="text-gray-600">다음 결제일:</span>
                  <span className="font-medium">
                    {new Date(billingStatus.subscription.nextBillingAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              )}
            </div>

            {hasActiveSubscription && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  variant="secondary"
                  onClick={handleCancelSubscription}
                  disabled={canceling}
                >
                  {canceling ? '처리 중...' : '구독 해지'}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  해지 시 현재 기간 종료일까지 서비스를 이용하실 수 있습니다.
                </p>
              </div>
            )}
          </Card>
        )}

        {!hasActiveSubscription && !isCanceled && billingStatus?.configured && (
          <Card>
            <div className="text-center py-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {PRICING.PLAN_NAME}
              </h2>
              <p className="text-4xl font-bold text-primary-600 mb-1">
                {formatMonthlyPrice()}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                월 단위 자동 결제, 언제든 해지 가능
              </p>
              <Button onClick={handleRegisterCard} disabled={registering} className="px-8">
                {registering ? '처리 중...' : '카드 등록하고 시작하기'}
              </Button>
              <p className="text-xs text-gray-500 mt-3">
                첫 결제는 즉시 진행되며, 이후 매월 자동 결제됩니다.
              </p>
            </div>
          </Card>
        )}

        {!billingStatus?.configured && (
          <Card className="bg-warning-50 border-warning-200">
            <div className="text-center py-6">
              <p className="text-warning-900 font-semibold mb-2">⚠️ 결제 서비스 준비 중</p>
              <p className="text-sm text-warning-800">
                결제 기능이 아직 설정되지 않았습니다. 곧 이용하실 수 있습니다.
              </p>
            </div>
          </Card>
        )}

        {billingStatus?.payments && billingStatus.payments.length > 0 && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">결제 내역</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-2">날짜</th>
                    <th className="text-left py-2">주문번호</th>
                    <th className="text-right py-2">금액</th>
                    <th className="text-right py-2">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {billingStatus.payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-3">
                        {new Date(payment.approvedAt || payment.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="py-3 font-mono text-xs">{payment.orderId}</td>
                      <td className="py-3 text-right font-medium">{formatPrice(payment.amount)}</td>
                      <td className="py-3 text-right">
                        {payment.status === 'approved' && <span className="text-success-600">승인</span>}
                        {payment.status === 'failed' && <span className="text-danger-600">실패</span>}
                        {payment.status === 'canceled' && <span className="text-gray-600">취소</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <Card>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">프리미엄 혜택</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <svg className="h-6 w-6 text-primary-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">워터마크 제거</p>
                <p className="text-sm text-gray-600">전문적인 문서로 고객에게 전달하세요</p>
              </div>
            </div>

            <div className="flex items-start">
              <svg className="h-6 w-6 text-primary-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">로고 및 브랜드 색상 (예정)</p>
                <p className="text-sm text-gray-600">나만의 브랜드 이미지를 만드세요</p>
              </div>
            </div>

            <div className="flex items-start">
              <svg className="h-6 w-6 text-primary-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">문서번호 자동 생성 (예정)</p>
                <p className="text-sm text-gray-600">문서 관리가 한결 쉬워집니다</p>
              </div>
            </div>

            <div className="flex items-start">
              <svg className="h-6 w-6 text-primary-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">입금 상태 추적 및 검색</p>
                <p className="text-sm text-gray-600">미입금 청구서를 한눈에 확인하세요</p>
              </div>
            </div>

            <div className="flex items-start">
              <svg className="h-6 w-6 text-primary-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">무제한 거래 건</p>
                <p className="text-sm text-gray-600">한도 걱정 없이 사용하세요</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

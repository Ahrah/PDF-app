'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useAuth } from '@/lib/auth-context';

export default function BillingPage() {
  const [usage, setUsage] = useState({ count: 0, limit: 3 });
  const [trialInfo, setTrialInfo] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isPaidPremium, setIsPaidPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setUsage({
        count: data.settings.monthlyDealCount,
        limit: data.settings.isPremium ? 999 : 3,
      });
      setIsPremium(data.settings.isPremium);
      setIsPaidPremium(!!data.settings.isPaidPremium);
      setTrialInfo(data.trialInfo);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  }

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [hubStatus, setHubStatus] = useState<any>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (isPaidPremium) fetchHubStatus();
  }, [isPaidPremium]);

  async function fetchHubStatus() {
    try {
      const res = await fetch('/api/billing/status');
      if (!res.ok) return;
      setHubStatus(await res.json());
    } catch (error) {
      console.error('Failed to fetch hub status:', error);
    }
  }

  async function handleCancel() {
    if (!confirm('구독을 해지하시겠어요? 다음 결제일까지는 계속 이용하실 수 있습니다.')) return;
    setCancelLoading(true);
    try {
      const res = await fetch('/api/billing/cancel', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || '구독 해지에 실패했습니다.');
        return;
      }
      await fetchHubStatus();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      alert('구독 해지에 실패했습니다.');
    } finally {
      setCancelLoading(false);
    }
  }

  const handleSubscribe = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/billing/checkout', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.url) {
        alert(data.error || '결제 페이지를 여는 데 실패했습니다.');
        return;
      }
      window.location.href = data.url;
    } catch (error) {
      console.error('Failed to start checkout:', error);
      alert('결제 페이지를 여는 데 실패했습니다.');
    } finally {
      setCheckoutLoading(false);
    }
  };

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/" className="text-primary-600 hover:text-primary-700 inline-flex items-center">
          ← 대시보드로
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">사용량 및 프리미엄</h1>

      <div className="space-y-6">
        {trialInfo?.trialActive ? (
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
                  <strong>체험 종료 후:</strong> 월 3건 무료 + 워터마크 포함
                </p>
                <p className="text-sm text-primary-800 mt-2">
                  <strong>프리미엄 플랜:</strong> 월 4,900원으로 계속 무제한 이용
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="bg-primary-50 border-primary-200">
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

        {!isPaidPremium && (
          <>
            <Card>
              <div className="text-center py-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  프리미엄 플랜
                </h2>
                <p className="text-4xl font-bold text-primary-600 mb-1">
                  월 4,900원
                </p>
                <p className="text-sm text-gray-500">
                  {trialInfo?.trialActive
                    ? '체험 종료 후 프리미엄으로 계속 이용하실 수 있습니다.'
                    : '무료 3건까지 사용 가능하며, 이후에는 월 4,900원입니다.'
                  }
                </p>
              </div>
            </Card>

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
                    <p className="font-medium text-gray-900">로고 및 브랜드 색상</p>
                    <p className="text-sm text-gray-600">나만의 브랜드 이미지를 만드세요</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="h-6 w-6 text-primary-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">문서번호 자동 생성</p>
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

            <Card className="text-center">
              <Button
                onClick={handleSubscribe}
                disabled={checkoutLoading}
                className="w-full sm:w-auto sm:px-12"
              >
                {checkoutLoading ? '이동 중...' : '프리미엄 구독하기'}
              </Button>
              <p className="text-sm text-gray-500 mt-3">
                결제는 취미상점 결제 허브에서 안전하게 처리됩니다
              </p>
            </Card>
          </>
        )}

        {isPaidPremium && (
          <>
            <Card className="text-center py-12">
              <svg className="h-16 w-16 text-primary-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                프리미엄 플랜 사용 중
              </h2>
              <p className="text-gray-600">
                모든 기능을 제한 없이 사용하실 수 있습니다.
              </p>
            </Card>

            {hubStatus?.subscription && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">구독 관리</h3>
                <div className="text-sm text-gray-700 space-y-1 mb-4">
                  <p>
                    상태:{' '}
                    {hubStatus.subscription.status === 'active'
                      ? '자동결제 중'
                      : hubStatus.subscription.status === 'canceled'
                      ? '해지됨 (기간 만료 시 종료)'
                      : '결제 실패 - 재시도 중'}
                  </p>
                  <p>
                    다음 결제일 / 이용 종료일:{' '}
                    {new Date(hubStatus.subscription.currentPeriodEnd).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                {hubStatus.subscription.status !== 'canceled' && (
                  <Button onClick={handleCancel} disabled={cancelLoading} className="bg-gray-200 text-gray-800 hover:bg-gray-300">
                    {cancelLoading ? '처리 중...' : '구독 해지'}
                  </Button>
                )}

                {hubStatus.payments?.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">결제 내역</h4>
                    <table className="w-full text-sm text-left">
                      <thead className="text-gray-500">
                        <tr>
                          <th className="py-1 pr-4">날짜</th>
                          <th className="py-1 pr-4">금액</th>
                          <th className="py-1">상태</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hubStatus.payments.map((p: any) => (
                          <tr key={p.orderId} className="border-t border-gray-100">
                            <td className="py-1 pr-4">{new Date(p.createdAt).toLocaleDateString('ko-KR')}</td>
                            <td className="py-1 pr-4">{p.amount.toLocaleString('ko-KR')}원</td>
                            <td className="py-1">
                              {p.status === 'approved' ? '결제완료' : p.status === 'refunded' ? '환불됨' : p.status === 'failed' ? '실패' : p.status}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

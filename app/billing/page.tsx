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
      setTrialInfo(data.trialInfo);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleNotify = () => {
    alert('출시 알림 신청이 완료되었습니다. 출시 시 연락드리겠습니다.');
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
                  <strong>프리미엄 플랜:</strong> 월 9,900원으로 계속 무제한 이용
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

        {!isPremium && (
          <>
            <Card>
              <div className="text-center py-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  프리미엄 플랜
                </h2>
                <p className="text-4xl font-bold text-primary-600 mb-1">
                  월 9,900원
                </p>
                <p className="text-sm text-gray-500">
                  {trialInfo?.trialActive 
                    ? '체험 종료 후 프리미엄으로 계속 이용하실 수 있습니다.'
                    : '무료 3건까지 사용 가능하며, 이후에는 월 9,900원입니다.'
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
              <Button onClick={handleNotify} className="w-full sm:w-auto sm:px-12">
                출시 알림 받기
              </Button>
              <p className="text-sm text-gray-500 mt-3">
                출시 시 가장 먼저 알려드릴게요
              </p>
            </Card>
            
            <Card className="bg-gray-50">
              <p className="text-xs text-gray-600 text-center">
                ⚠️ 본 서비스는 결제 기능이 없습니다. 자동 결제되지 않으며, 별도의 구독 취소가 필요하지 않습니다.
              </p>
            </Card>
          </>
        )}

        {isPremium && (
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
        )}
      </div>
    </div>
  );
}

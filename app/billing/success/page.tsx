'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/Card';

function BillingSuccessContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams?.get('orderCode');
  
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderCode) {
      setVerifying(false);
      setError('주문 정보가 없습니다.');
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/checkout/verify?orderCode=${orderCode}`);
        const data = await response.json();
        
        if (response.ok && data.verified) {
          setVerified(true);
        } else {
          setError(data.error || '결제 확인에 실패했습니다.');
        }
      } catch {
        setError('결제 확인 중 오류가 발생했습니다.');
      } finally {
        setVerifying(false);
      }
    };

    void verifyPayment();
  }, [orderCode]);

  if (verifying) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">결제를 확인하고 있습니다...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Card className="text-center py-12">
        {verified ? (
          <>
            <svg 
              className="h-16 w-16 text-green-500 mx-auto mb-4" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                clipRule="evenodd" 
              />
            </svg>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              결제가 완료되었습니다!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              프리미엄 플랜이 활성화되었습니다.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-blue-900 mb-2">
                <strong>주문번호:</strong> {orderCode}
              </p>
              <p className="text-sm text-blue-900">
                프리미엄 혜택을 지금 바로 이용하실 수 있습니다.
              </p>
            </div>
            <Link href="/" className="btn btn-primary inline-block">
              대시보드로 이동
            </Link>
          </>
        ) : (
          <>
            <svg 
              className="h-16 w-16 text-amber-500 mx-auto mb-4" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              결제 확인 중
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {error || '결제가 처리 중입니다. 잠시만 기다려 주세요.'}
            </p>
            <div className="bg-amber-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-amber-900 mb-2">
                결제는 성공적으로 완료되었으나, 프리미엄 활성화가 지연되고 있습니다.
              </p>
              <p className="text-sm text-amber-900">
                대시보드에서 &quot;결제를 마쳤어요 · 상태 다시 확인&quot; 버튼을 눌러주세요.
              </p>
            </div>
            <Link href="/billing" className="btn btn-primary inline-block">
              사용량 페이지로 이동
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
        </Card>
      </div>
    }>
      <BillingSuccessContent />
    </Suspense>
  );
}

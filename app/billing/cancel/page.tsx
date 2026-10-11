'use client';

import Link from 'next/link';
import Card from '@/components/Card';

export default function BillingCancelPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Card className="text-center py-12">
        <svg 
          className="h-16 w-16 text-gray-400 mx-auto mb-4" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
            clipRule="evenodd" 
          />
        </svg>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          결제가 취소되었습니다
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          결제창을 닫으셨습니다. 언제든지 다시 시도하실 수 있습니다.
        </p>
        <div className="space-y-3">
          <Link href="/billing" className="btn btn-primary inline-block w-full sm:w-auto sm:px-12">
            다시 시도하기
          </Link>
          <Link href="/" className="btn btn-secondary inline-block w-full sm:w-auto sm:px-12 ml-0 sm:ml-3">
            대시보드로 이동
          </Link>
        </div>
      </Card>
    </div>
  );
}

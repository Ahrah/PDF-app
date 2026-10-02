import Card from '@/components/Card';
import Link from 'next/link';
import { PRICING, formatMonthlyPrice, formatPrice } from '@/lib/pricing';

export default function PricingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">요금제</h1>
        <p className="text-lg text-gray-600">
          견적함은 무료로 시작할 수 있으며, 프리미엄 플랜으로 더 많은 기능을 이용하실 수 있습니다.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">무료 플랜</h2>
            <p className="text-5xl font-bold text-gray-900 mb-2">무료</p>
            <p className="text-sm text-gray-500">신용카드 등록 불필요</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-start">
              <svg className="h-6 w-6 text-primary-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">월 {PRICING.FREE_TIER_MONTHLY_LIMIT}건 문서 생성</p>
                <p className="text-sm text-gray-600">견적서 + 청구서 = 1건</p>
              </div>
            </div>

            <div className="flex items-start">
              <svg className="h-6 w-6 text-gray-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-gray-500">워터마크 포함</p>
                <p className="text-sm text-gray-500">PDF 하단에 작게 표시</p>
              </div>
            </div>

            <div className="flex items-start">
              <svg className="h-6 w-6 text-primary-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">고객 관리</p>
                <p className="text-sm text-gray-600">무제한 고객 등록</p>
              </div>
            </div>

            <div className="flex items-start">
              <svg className="h-6 w-6 text-primary-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">거래 내역 관리</p>
                <p className="text-sm text-gray-600">입금 상태 추적</p>
              </div>
            </div>
          </div>

          <Link href="/signup" className="block w-full text-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
            무료로 시작하기
          </Link>
        </Card>

        <Card className="border-2 border-primary-500 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              추천
            </span>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{PRICING.PLAN_NAME}</h2>
            <p className="text-5xl font-bold text-primary-600 mb-2">{formatPrice()}</p>
            <p className="text-sm text-gray-500">월 단위 자동 결제</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-start">
              <svg className="h-6 w-6 text-primary-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">무제한 문서 생성</p>
                <p className="text-sm text-gray-600">제한 없이 사용</p>
              </div>
            </div>

            <div className="flex items-start">
              <svg className="h-6 w-6 text-primary-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">워터마크 제거</p>
                <p className="text-sm text-gray-600">깔끔한 전문 문서</p>
              </div>
            </div>

            <div className="flex items-start">
              <svg className="h-6 w-6 text-primary-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">로고 및 브랜드 색상 (예정)</p>
                <p className="text-sm text-gray-600">나만의 브랜드 이미지</p>
              </div>
            </div>

            <div className="flex items-start">
              <svg className="h-6 w-6 text-primary-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">문서번호 자동 생성 (예정)</p>
                <p className="text-sm text-gray-600">효율적인 문서 관리</p>
              </div>
            </div>

            <div className="flex items-start">
              <svg className="h-6 w-6 text-primary-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">입금 상태 추적 및 검색</p>
                <p className="text-sm text-gray-600">미입금 청구서 한눈에</p>
              </div>
            </div>
          </div>

          <Link href="/billing" className="block w-full text-center px-4 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
            프리미엄 시작하기
          </Link>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-primary-50 via-white to-indigo-50 border-primary-100">
        <div className="text-center py-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {PRICING.TRIAL_DAYS}일 무료 체험
          </h3>
          <p className="text-gray-700 mb-6">
            회원가입 후 대시보드에서 무료 체험을 시작하실 수 있습니다.<br />
            {PRICING.TRIAL_DAYS}일간 프리미엄 플랜의 모든 기능을 제한 없이 사용해보세요.
          </p>
          <div className="bg-white border border-primary-200 rounded-lg p-4 inline-block">
            <p className="text-sm font-semibold text-primary-900 mb-2">
              ✓ 체험 종료 후 자동 결제되지 않습니다
            </p>
            <p className="text-sm text-gray-600">
              체험 기간이 끝나면 무료 플랜(월 {PRICING.FREE_TIER_MONTHLY_LIMIT}건)으로 자동 전환되며,
              원하실 때 언제든 프리미엄으로 업그레이드하실 수 있습니다.
            </p>
          </div>
        </div>
      </Card>

      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500">
          더 궁금한 사항이 있으신가요?{' '}
          <Link href="/terms" className="text-primary-600 hover:underline">
            이용약관
          </Link>
          {' '}또는{' '}
          <Link href="/privacy" className="text-primary-600 hover:underline">
            개인정보처리방침
          </Link>
          을 참고하세요.
        </p>
      </div>
    </div>
  );
}

import Link from 'next/link';
import Card from '@/components/Card';
import { PREMIUM_CHECKOUT_URL } from '@/lib/checkout';

export const metadata = {
  title: '요금제 - 견적함',
  description: '견적함의 무료 플랜과 프리미엄 플랜을 비교하고 구매하세요.',
};

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="text-center mb-10 sm:mb-14">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          요금제
        </h1>
        <p className="text-base sm:text-lg text-gray-600">
          견적함의 무료 플랜과 프리미엄 플랜을 비교해보세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* 무료 플랜 */}
        <Card>
          <div className="text-center py-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">무료 플랜</h2>
            <p className="text-4xl font-bold text-gray-900 mb-1">₩0</p>
            <p className="text-sm text-gray-500 mb-6">월 3건까지 무료</p>

            <div className="text-left space-y-3 mb-6">
              <div className="flex items-start">
                <svg className="h-6 w-6 text-gray-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">월 3건 문서 생성</p>
                  <p className="text-sm text-gray-600">견적서+청구서 = 1건</p>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="h-6 w-6 text-gray-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">기본 고객 관리</p>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="h-6 w-6 text-gray-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">기본 거래 관리</p>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="h-6 w-6 text-gray-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-gray-500">워터마크 포함</p>
                </div>
              </div>
            </div>

            <Link href="/signup" className="btn btn-secondary inline-block w-full">
              무료로 시작하기
            </Link>
          </div>
        </Card>

        {/* 프리미엄 플랜 */}
        <Card className="border-2 border-primary-500 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
              추천
            </span>
          </div>
          <div className="text-center py-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">프리미엄 플랜</h2>
            <p className="text-4xl font-bold text-primary-600 mb-1">₩4,900</p>
            <p className="text-sm text-gray-500 mb-6">매월 자동 결제</p>

            <div className="text-left space-y-3 mb-6">
              <div className="flex items-start">
                <svg className="h-6 w-6 text-primary-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">무제한 문서 생성</p>
                  <p className="text-sm text-gray-600">한도 걱정 없이 사용하세요</p>
                </div>
              </div>

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
            </div>

            <a
              href={PREMIUM_CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary inline-block w-full"
            >
              구매하기
            </a>
          </div>
        </Card>
      </div>

      {/* 30일 무료 체험 안내 */}
      <Card className="bg-gradient-to-br from-primary-50 via-white to-indigo-50 border-primary-100 mb-8">
        <div className="text-center py-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            30일 무료 체험
          </h3>
          <p className="text-gray-600 mb-4">
            회원가입 시 30일간 프리미엄 기능을 무료로 체험할 수 있습니다.
          </p>
          <p className="text-sm text-gray-500">
            체험 종료 후 자동 결제되지 않습니다. 프리미엄을 계속 이용하려면 별도로 구독하세요.
          </p>
        </div>
      </Card>

      {/* 결제 시 주의사항 */}
      <Card className="bg-amber-50 border-amber-200">
        <div className="py-4">
          <h3 className="text-lg font-semibold text-amber-900 mb-2 text-center">
            ⚠️ 결제 시 주의사항
          </h3>
          <div className="space-y-2 text-sm text-amber-900">
            <p>
              • StepPay 결제창에서 입력하는 <strong>이메일</strong>은 견적함 아이디(로그인 이메일)와 
              <strong className="text-amber-800"> 반드시 동일</strong>해야 합니다.
            </p>
            <p>
              • 이메일이 다르면 프리미엄이 자동으로 연결되지 않습니다.
            </p>
            <p>
              • 결제 후 대시보드의 &quot;결제를 마쳤어요 · 상태 다시 확인&quot; 버튼을 눌러 
              프리미엄 활성화를 확인하세요.
            </p>
          </div>
        </div>
      </Card>

      {/* 결제 정보 */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p className="mb-2">스텝페이의 안전한 결제 페이지로 이동합니다</p>
        <p>매월 자동 결제되며, 언제든지 구독을 취소할 수 있습니다</p>
      </div>
    </div>
  );
}

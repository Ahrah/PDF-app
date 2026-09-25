import Card from '@/components/Card';
import Link from 'next/link';
import { PRICING, formatMonthlyPrice } from '@/lib/pricing';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/" className="text-primary-600 hover:text-primary-700 inline-flex items-center">
          ← 대시보드로
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">이용약관</h1>

      <Card>
        <div className="prose prose-gray max-w-none">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. 서비스 소개</h2>
          <p className="text-gray-700 mb-6">
            견적함은 1인 프리랜서를 위한 견적서 및 청구서 관리 도구입니다.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. 서비스 범위</h2>
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>견적서 및 청구서 생성</li>
            <li>고객 정보 관리</li>
            <li>거래 내역 추적</li>
            <li>PDF 문서 다운로드 및 공유</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. 중요 고지사항</h2>
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-6">
            <p className="text-warning-900 font-semibold mb-2">⚠️ 전자세금계산서 아님</p>
            <p className="text-warning-800 text-sm">
              본 서비스로 생성된 문서는 <strong>거래용 견적서·청구서</strong>이며,
              <strong>전자세금계산서가 아닙니다</strong>.
              세금계산서는 홈택스에서 별도로 발급해주세요.
            </p>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. 무료 플랜</h2>
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>월 {PRICING.FREE_TIER_MONTHLY_LIMIT}건까지 무료 (견적서 + 청구서 = 1건)</li>
            <li>PDF 워터마크 포함</li>
            <li>기본 판매자 정보 입력 가능</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">5. {PRICING.PLAN_NAME} ({formatMonthlyPrice()})</h2>
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>워터마크 제거</li>
            <li>로고 및 브랜드 색상</li>
            <li>문서번호 자동 생성</li>
            <li>무제한 거래 건</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">6. 결제 및 구독</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">6.1 결제 방법</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
              <li>프리미엄 플랜은 토스페이먼츠를 통한 신용카드 자동 결제로 제공됩니다.</li>
              <li>첫 결제는 카드 등록 즉시 진행되며, 이후 매월 자동으로 결제됩니다.</li>
              <li>결제일은 최초 결제일 기준으로 매월 동일한 날짜입니다.</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">6.2 무료 체험</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
              <li>{PRICING.TRIAL_DAYS}일 무료 체험은 회원가입 후 대시보드에서 명시적으로 시작해야 합니다.</li>
              <li>체험 기간 중에는 카드 등록이나 결제가 요구되지 않습니다.</li>
              <li>체험 종료 후 자동으로 결제되지 않으며, 무료 플랜(월 {PRICING.FREE_TIER_MONTHLY_LIMIT}건)으로 전환됩니다.</li>
              <li>무료 체험은 1회에 한하여 제공되며, 재가입 시에도 재제공되지 않습니다.</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">6.3 구독 해지</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
              <li>언제든지 결제 페이지에서 구독을 해지하실 수 있습니다.</li>
              <li>해지 시 다음 결제가 중단되며, 현재 결제 기간 종료일까지는 프리미엄 기능을 계속 이용하실 수 있습니다.</li>
              <li>기간 종료 후에는 무료 플랜으로 자동 전환됩니다.</li>
            </ul>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">7. 환불 정책</h2>
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 mb-2">
              <strong>[환불 정책 플레이스홀더]</strong>
            </p>
            <p className="text-sm text-gray-600">
              구체적인 환불 정책은 관련 법령 및 사업자의 정책에 따라 정해집니다.
              실제 서비스 제공 시 명확한 환불 조건(환불 가능 기간, 환불 금액 산정 방법, 환불 신청 절차 등)을 
              이 위치에 명시해야 합니다.
            </p>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">8. 사용자의 책임</h2>
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>정확한 정보 입력</li>
            <li>생성된 문서의 법적 효력 확인</li>
            <li>세금 신고는 별도로 진행</li>
            <li>개인정보 보호</li>
            <li>결제 정보의 정확성 및 유효성 유지</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">9. 면책사항</h2>
          <p className="text-gray-700 mb-6">
            견적함은 도구를 제공할 뿐이며, 생성된 문서의 법적 효력, 세금 신고,
            거래 분쟁에 대해서는 책임지지 않습니다.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">10. 서비스 변경 및 중단</h2>
          <p className="text-gray-700 mb-6">
            서비스는 사전 고지 후 변경되거나 중단될 수 있습니다.
          </p>
        </div>
      </Card>
    </div>
  );
}

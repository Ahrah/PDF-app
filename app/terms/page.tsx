import Card from '@/components/Card';
import Link from 'next/link';

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
            <li>월 3건까지 무료 (견적서 + 청구서 = 1건)</li>
            <li>PDF 워터마크 포함</li>
            <li>기본 판매자 정보 입력 가능</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">5. 프리미엄 플랜 (월 4,900원)</h2>
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>워터마크 제거</li>
            <li>로고 및 브랜드 색상</li>
            <li>문서번호 자동 생성</li>
            <li>무제한 거래 건</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">6. 결제, 해지 및 환불</h2>
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>프리미엄은 월 4,900원이며, 결제는 스텝페이를 통해 처리됩니다.</li>
            <li>30일 무료 체험 종료만으로 자동 결제되지 않으며, 프리미엄을 직접 구독한 경우에만 매월 결제됩니다.</li>
            <li>구독 해지는 스텝페이 구독 관리 페이지에서 할 수 있고, 해지 후에도 이미 결제한 이용 기간이 끝날 때까지 프리미엄을 이용할 수 있습니다.</li>
            <li>결제일로부터 7일 이내이고 프리미엄 기능을 이용하지 않은 경우, 문의 시 결제 금액 전액을 환불합니다.</li>
            <li>그 외 이미 제공된 이용 기간에 대해서는 디지털 서비스 특성상 원칙적으로 환불이 어렵습니다. 다만 결제 오류, 이중 결제, 서비스 장애처럼 운영자 귀책 사유가 있는 경우 문의 시 전액 또는 부분 환불을 검토합니다.</li>
            <li>환불은 스텝페이를 통해 처리되며, 카드사 정책에 따라 보통 3~5영업일이 걸릴 수 있습니다.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">7. 사용자의 책임</h2>
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>정확한 정보 입력</li>
            <li>생성된 문서의 법적 효력 확인</li>
            <li>세금 신고는 별도로 진행</li>
            <li>개인정보 보호</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">8. 면책사항</h2>
          <p className="text-gray-700 mb-6">
            견적함은 도구를 제공할 뿐이며, 생성된 문서의 법적 효력, 세금 신고,
            거래 분쟁에 대해서는 책임지지 않습니다.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">9. 서비스 변경 및 중단</h2>
          <p className="text-gray-700 mb-6">
            서비스는 사전 고지 후 변경되거나 중단될 수 있습니다.
          </p>
        </div>
      </Card>
    </div>
  );
}

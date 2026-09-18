import Card from '@/components/Card';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/" className="text-primary-600 hover:text-primary-700 inline-flex items-center">
          ← 대시보드로
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">개인정보처리방침</h1>

      <Card>
        <div className="prose prose-gray max-w-none">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. 수집하는 개인정보</h2>
          <p className="text-gray-700 mb-6">
            견적함은 서비스 제공을 위해 다음의 정보를 수집합니다:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>판매자 정보: 이름, 상호, 이메일, 연락처, 입금계좌, 사업자등록번호(선택)</li>
            <li>고객 정보: 고객명, 회사명, 이메일(선택), 연락처(선택)</li>
            <li>거래 정보: 견적서 및 청구서 내용, 거래 금액, 날짜</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. 수집하지 않는 정보</h2>
          <p className="text-gray-700 mb-6">
            견적함은 다음의 민감한 정보를 수집하지 않습니다:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>주민등록번호</li>
            <li>카드번호 및 결제 정보</li>
            <li>비밀번호 (현재 버전에서는 인증 기능 미제공)</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. 개인정보의 이용 목적</h2>
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>견적서 및 청구서 생성</li>
            <li>고객 관리</li>
            <li>거래 내역 관리</li>
            <li>서비스 개선</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. 개인정보의 보관</h2>
          <p className="text-gray-700 mb-6">
            수집된 정보는 로컬 저장소에 보관되며, 사용자가 직접 삭제할 수 있습니다.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">5. 개인정보의 삭제</h2>
          <p className="text-gray-700 mb-6">
            사용자는 언제든지 고객 정보 및 거래 문서를 삭제할 수 있습니다.
            삭제된 정보는 복구할 수 없습니다.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">6. 문의</h2>
          <p className="text-gray-700">
            개인정보 처리에 관한 문의사항은 이메일로 연락 주시기 바랍니다.
          </p>
        </div>
      </Card>
    </div>
  );
}

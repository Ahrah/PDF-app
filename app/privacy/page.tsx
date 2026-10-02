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
            <li>회원가입 시: 이메일, 비밀번호(암호화 저장)</li>
            <li>판매자 정보: 이름, 상호, 이메일, 연락처, 입금계좌, 사업자등록번호(선택)</li>
            <li>고객 정보: 고객명, 회사명, 이메일(선택), 연락처(선택)</li>
            <li>거래 정보: 견적서 및 청구서 내용, 거래 금액, 날짜</li>
            <li>결제 정보: 토스페이먼츠를 통한 카드 정보(토큰화되어 저장, 실제 카드번호는 저장하지 않음), 결제 내역</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. 수집하지 않는 정보</h2>
          <p className="text-gray-700 mb-6">
            견적함은 다음의 민감한 정보를 수집하지 않습니다:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>주민등록번호</li>
            <li>실제 신용카드 번호 (토스페이먼츠를 통해 토큰화된 정보만 저장)</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. 개인정보의 이용 목적</h2>
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>견적서 및 청구서 생성</li>
            <li>고객 관리</li>
            <li>거래 내역 관리</li>
            <li>프리미엄 플랜 결제 처리 및 구독 관리</li>
            <li>결제 내역 제공 및 고객 지원</li>
            <li>서비스 개선</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. 개인정보의 보관 및 제3자 제공</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">4.1 보관 기간</h3>
            <p className="text-sm text-gray-700 mb-2">
              수집된 정보는 Supabase 데이터베이스에 안전하게 보관되며, 회원 탈퇴 시까지 보관됩니다.
            </p>
            <p className="text-sm text-gray-700 mb-2">
              결제 관련 정보는 전자상거래법 및 관련 법령에 따라 다음과 같이 보관됩니다:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
              <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
              <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">4.2 제3자 제공</h3>
            <p className="text-sm text-gray-700 mb-2">
              결제 처리를 위해 다음 업체에 최소한의 정보가 제공됩니다:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li><strong>토스페이먼츠:</strong> 결제 처리 (제공 항목: 이메일, 결제 금액, 주문 정보)</li>
            </ul>
          </div>

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

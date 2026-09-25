import Link from 'next/link';
import Button from './Button';
import Card from './Card';
import SampleQuotePreview from './SampleQuotePreview';

const STEPS = [
  { title: '고객·작업 입력', desc: '고객 정보와 품목, 금액을 입력해요.' },
  { title: '견적서 PDF 다운로드', desc: '입력한 내용으로 PDF를 바로 만들어요.' },
  { title: '청구서 전환 · 입금 상태 관리', desc: '견적서를 청구서로 바꾸고 입금 여부를 표시해요.' },
];

export default function LandingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="text-center mb-10 sm:mb-14">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
          견적서 작성부터 입금 확인까지,<br className="hidden sm:block" /> 견적함에서.
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mb-8">
          고객과 작업 내용을 입력하고 견적서 PDF를 만들어보세요.
        </p>
        <Link href="/try">
          <Button className="px-8 py-3 text-base">가입 없이 견적서 만들어보기</Button>
        </Link>
        <p className="mt-3 text-sm text-gray-400">
          또는 <Link href="/signup" className="underline hover:text-gray-600">회원가입하고 시작하기</Link>
        </p>
      </div>

      <div className="mb-10 sm:mb-14">
        <SampleQuotePreview />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 sm:mb-14">
        {STEPS.map((step, i) => (
          <Card key={step.title} padding="sm">
            <p className="text-xs font-semibold text-primary-600 mb-1.5">STEP {i + 1}</p>
            <p className="font-semibold text-gray-900 mb-1">{step.title}</p>
            <p className="text-sm text-gray-500">{step.desc}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-center sm:text-left">
          <div>
            <p className="font-semibold text-gray-900 mb-1">가입 시</p>
            <p className="text-gray-600">월 3건 무료 (워터마크 포함)</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">30일 무료 체험</p>
            <p className="text-gray-600">대시보드에서 한 번 시작 · 무제한 + 워터마크 제거</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">프리미엄</p>
            <p className="text-gray-600">월 4,900원</p>
          </div>
        </div>
      </Card>

      <p className="text-sm text-gray-400 text-center">
        입금 상태는 자동으로 확인되지 않아요. 입금을 확인하신 뒤 직접 표시해주세요.
      </p>
    </div>
  );
}

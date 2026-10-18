import Link from 'next/link';

const REFUND_POLICY_HREF = process.env.NEXT_PUBLIC_REFUND_POLICY_URL || '/refund';

interface PremiumBillingTermsProps {
  compact?: boolean;
  className?: string;
}

export default function PremiumBillingTerms({
  compact = false,
  className = '',
}: PremiumBillingTermsProps) {
  return (
    <div
      className={`space-y-1.5 text-left ${
        compact ? 'text-xs text-gray-500' : 'text-sm text-gray-600'
      } ${className}`}
    >
      <p>이용기간: 결제일로부터 1개월, 해지 전까지 매월 자동 갱신</p>
      <p>
        환불: 이미 제공된 이용 기간에 대해서는 디지털 서비스 특성상 원칙적으로 환불이 어렵습니다.{' '}
        <Link
          href={REFUND_POLICY_HREF}
          className="underline underline-offset-2 hover:text-gray-800"
        >
          환불정책
        </Link>
      </p>
      <p>
        해지: 견적함 &gt; 사용량 및 프리미엄 &gt; 구독·결제수단 관리(스텝페이)에서 언제든 해지
      </p>
    </div>
  );
}

import { redirect } from 'next/navigation';

export default function RefundPage() {
  const refundPolicyUrl = process.env.NEXT_PUBLIC_REFUND_POLICY_URL?.trim();
  if (refundPolicyUrl) {
    redirect(refundPolicyUrl);
  }

  redirect('/terms#refund');
}

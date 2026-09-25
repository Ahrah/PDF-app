import { formatCurrency } from '@/lib/utils';

/**
 * A non-interactive mock of the real quote PDF layout (see lib/pdf.ts /
 * the on-screen preview in app/deals/[id]/quote/page.tsx) — same field
 * structure and labels, filled with fictional sample data only. Used on
 * the logged-out landing page, never real user/client data.
 */
export default function SampleQuotePreview() {
  const items = [
    { name: '로고 디자인', unit: '건', quantity: 1, unitPrice: 300000 },
    { name: '웹사이트 시안 제작', unit: '식', quantity: 1, unitPrice: 450000 },
  ];
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-8 text-sm max-w-md w-full mx-auto">
      <div className="flex justify-between items-start mb-5">
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">견적서</h3>
        <p className="text-xs text-gray-400 mt-1.5">No. SAMPLE01</p>
      </div>

      <div className="space-y-1 mb-5 text-gray-600">
        <div className="flex gap-3">
          <span className="w-16 flex-shrink-0 text-gray-400">공급받는자</span>
          <span className="text-gray-900">(주)예시상회</span>
        </div>
        <div className="flex gap-3">
          <span className="w-16 flex-shrink-0 text-gray-400">거래명</span>
          <span className="text-gray-900">브랜드 리뉴얼 프로젝트</span>
        </div>
        <div className="flex gap-3">
          <span className="w-16 flex-shrink-0 text-gray-400">거래일</span>
          <span className="text-gray-900">2026년 1월 15일</span>
        </div>
      </div>

      <table className="w-full mb-4">
        <thead>
          <tr className="text-xs text-gray-400 border-b border-gray-200">
            <th className="text-left font-normal pb-2">항목</th>
            <th className="text-right font-normal pb-2">수량</th>
            <th className="text-right font-normal pb-2">금액</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.name} className="border-b border-gray-100">
              <td className="py-1.5 pr-2 text-gray-800">{item.name}</td>
              <td className="py-1.5 pr-2 text-right text-gray-600">{item.quantity}{item.unit}</td>
              <td className="py-1.5 text-right font-medium text-gray-900 whitespace-nowrap">
                {formatCurrency(item.quantity * item.unitPrice)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-5">
        <div className="flex justify-between w-40 border-t border-gray-900 pt-1.5">
          <span className="font-bold text-gray-900">합계</span>
          <span className="font-bold text-gray-900">{formatCurrency(subtotal)}</span>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3 text-xs text-gray-400">
        공급자 · 샘플 스튜디오 (예시용 견본입니다)
      </div>
    </div>
  );
}

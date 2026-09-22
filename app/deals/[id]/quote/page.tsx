'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import SharePDF from '@/components/SharePDF';
import PaywallModal from '@/components/PaywallModal';
import { Deal, Client, SellerInfo } from '@/lib/types';
import { formatCurrency, formatDate, formatBusinessNumber } from '@/lib/utils';
import { generatePDF, DocTitleLabel } from '@/lib/pdf';

export default function QuotePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [usage, setUsage] = useState({ count: 0, limit: 3 });
  const [isPremium, setIsPremium] = useState(false);
  const [titleLabel, setTitleLabel] = useState<DocTitleLabel>('견적서');

  useEffect(() => {
    fetchData();
    fetchQuota();
  }, [params.id]);

  async function fetchQuota() {
    try {
      const res = await fetch('/api/quota');
      if (res.ok) {
        const data = await res.json();
        setUsage({ count: data.count, limit: data.limit });
      }
    } catch (error) {
      console.error('Failed to fetch quota:', error);
    }
  }

  async function fetchData() {
    try {
      const [dealRes, settingsRes] = await Promise.all([
        fetch(`/api/deals/${params.id}`),
        fetch('/api/settings'),
      ]);

      const dealData = await dealRes.json();
      const settingsData = await settingsRes.json();

      const clientRes = await fetch(`/api/clients/${dealData.clientId}`);
      const clientData = await clientRes.json();

      const sellerRes = await fetch('/api/seller');
      const sellerData = await sellerRes.json();

      setDeal(dealData);
      setClient(clientData);
      setSeller(sellerData);
      setIsPremium(settingsData.settings.isPremium);

      if (sellerData) {
        await generatePreview(dealData, clientData, sellerData, settingsData.settings.isPremium, titleLabel);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function generatePreview(d: Deal, c: Client, s: SellerInfo, premium: boolean, label: DocTitleLabel) {
    try {
      setGeneratingPDF(true);
      const blob = await generatePDF(d, c, s, premium, label);
      setPdfBlob(blob);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDF를 만들지 못했어요. 다시 시도해 주세요.');
    } finally {
      setGeneratingPDF(false);
    }
  }

  function handleTitleLabelChange(label: DocTitleLabel) {
    setTitleLabel(label);
    if (deal && client && seller) {
      generatePreview(deal, client, seller, isPremium, label);
    }
  }

  async function handleConvertToInvoice() {
    if (!deal) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const dueDate = nextMonth.toISOString().split('T')[0];

      const invoiceData = {
        ...deal,
        type: 'invoice' as const,
        dueDate,
        issueDate: today,
        validUntil: undefined,
      };

      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });

      if (res.ok) {
        const created = await res.json();
        router.push(`/deals/${created.id}/invoice`);
      }
    } catch (error) {
      alert('청구서로 전환하지 못했어요.');
    }
  }

  async function handleMarkAsSent() {
    if (!deal) return;

    try {
      await fetch(`/api/deals/${deal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: '발송함' }),
      });
      
      fetchData();
    } catch (error) {
      alert('상태를 바꾸지 못했어요.');
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!seller && deal && client) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              견적서를 만들려면 먼저 판매자(내) 정보를 등록해야 해요.
            </p>
            <Link href="/settings">
              <Button>판매자 정보 등록하러 가기</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!deal || !client || !seller) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <p className="text-center py-12 text-gray-500">견적서를 찾을 수 없습니다.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/" className="text-primary-600 hover:text-primary-700 inline-flex items-center">
          ← 대시보드로
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">거래명세서 미리보기</h1>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {(['견적서', 'INVOICE'] as DocTitleLabel[]).map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleTitleLabelChange(label)}
                    className={`px-3 py-1.5 text-sm rounded-md transition ${
                      titleLabel === label
                        ? 'bg-white text-gray-900 shadow-sm font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {generatingPDF ? (
              <div className="flex items-center justify-center py-32 text-gray-500">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p>문서를 준비하는 중…</p>
                </div>
              </div>
            ) : pdfBlob ? (
              <div className="border-2 border-gray-200 rounded-lg p-8 bg-gray-50">
                <div className="bg-white p-8 shadow-sm max-w-2xl mx-auto text-sm">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{titleLabel}</h2>
                    <p className="text-xs text-gray-400 mt-2">No. {deal.id.slice(0, 8).toUpperCase()}</p>
                  </div>

                  <div className="space-y-1.5 mb-6">
                    <div className="flex gap-3">
                      <span className="text-gray-500 w-20 flex-shrink-0">공급받는자</span>
                      <span className="text-gray-900">{client.company ? `${client.company}${client.contactName ? ` (${client.contactName})` : ''}` : client.name}</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-gray-500 w-20 flex-shrink-0">거래명</span>
                      <span className="text-gray-900">{deal.title || deal.lineItems[0]?.name || '-'}</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-gray-500 w-20 flex-shrink-0">거래일</span>
                      <span className="text-gray-900">{formatDate(deal.issueDate)}</span>
                    </div>
                    {deal.validUntil && (
                      <div className="flex gap-3">
                        <span className="text-gray-500 w-20 flex-shrink-0">유효기간</span>
                        <span className="text-gray-900">{formatDate(deal.validUntil)}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 mb-4">아래와 같이 계산합니다.</p>

                  <table className="w-full mb-4">
                    <thead>
                      <tr className="text-xs text-gray-500 border-b border-gray-300">
                        <th className="text-left font-normal pb-2">항목</th>
                        <th className="text-left font-normal pb-2">단위</th>
                        <th className="text-right font-normal pb-2">수량</th>
                        <th className="text-right font-normal pb-2">단가</th>
                        <th className="text-right font-normal pb-2">금액</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deal.lineItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-1.5 pr-2 break-words">{item.name}</td>
                          <td className="py-1.5 pr-2 text-gray-600">{item.unit || '-'}</td>
                          <td className="py-1.5 pr-2 text-right">{item.quantity}</td>
                          <td className="py-1.5 pr-2 text-right whitespace-nowrap">{formatCurrency(item.unitPrice)}</td>
                          <td className="py-1.5 text-right whitespace-nowrap font-medium">{formatCurrency(item.quantity * item.unitPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex justify-end mb-6">
                    <div className="w-56 space-y-1.5">
                      <div className="flex justify-between text-gray-600">
                        <span>{deal.vatMode === '포함' ? '소계 (VAT 포함)' : '소계'}</span>
                        <span>{formatCurrency(deal.lineItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0))}</span>
                      </div>
                      {deal.discount > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>할인</span>
                          <span>- {formatCurrency(deal.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-gray-900 pt-1.5 text-lg font-bold text-gray-900">
                        <span>합계</span>
                        <span>{formatCurrency(deal.totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  {(deal.memo || deal.paymentMemo) && (
                    <div className="mb-6">
                      <p className="text-gray-500 mb-1">특이사항</p>
                      <div className="border border-gray-200 rounded p-3 text-gray-700 min-h-12">
                        {deal.type === 'invoice' && deal.paymentMemo ? deal.paymentMemo : deal.memo}
                      </div>
                    </div>
                  )}

                  {!isPremium && (
                    <div className="mb-4 text-center">
                      <p className="text-xs text-gray-400">WATERMARK - FREE PLAN</p>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-gray-500 text-xs mb-1">공급자</p>
                    <p className="font-semibold text-gray-900">{seller.businessName || seller.name}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {seller.businessNumber && `등록번호. ${formatBusinessNumber(seller.businessNumber)}   `}
                      대표자. {seller.name}
                      {seller.businessType && `   업태. ${seller.businessType}`}
                      {seller.businessItem && `   종목. ${seller.businessItem}`}
                    </p>
                    {seller.address && <p className="text-xs text-gray-600">A. {seller.address}</p>}
                    <p className="text-xs text-gray-600">T. {seller.phone}   E. {seller.email}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-400 text-center">
                      본 문서는 거래용 견적서·청구서이며, 전자세금계산서가 아닙니다.<br />
                      세금계산서는 홈택스에서 별도로 발급해주세요.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="space-y-4 lg:sticky lg:top-4">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">문서 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">상태</span>
                  <span className={`badge ${deal.status === '초안' ? 'badge-gray' : 'badge-primary'}`}>
                    {deal.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">금액</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(deal.totalAmount)}</span>
                </div>
              </div>
            </Card>

            {!isPremium && (
              <Card className="bg-gray-50">
                <p className="text-xs text-gray-600">
                  💡 무료 플랜 PDF에는 워터마크가 포함됩니다.
                </p>
              </Card>
            )}

            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">사용량</h3>
              <p className="text-sm text-gray-600 mb-2">
                이번 달 <span className="font-semibold text-gray-900">{usage.count}/{usage.limit}건</span> 사용
              </p>
            </Card>

            {pdfBlob && (
              <Card>
                <SharePDF
                  pdfBlob={pdfBlob}
                  fileName={`견적서_${client.name}_${new Date().toISOString().split('T')[0]}.pdf`}
                  clientName={client.name}
                  amount={deal.totalAmount}
                  type="quote"
                  dealId={deal.id}
                  onQuotaExceeded={() => {
                    setShowPaywall(true);
                    fetchQuota();
                  }}
                  onMarkAsSent={handleMarkAsSent}
                />
              </Card>
            )}

            <Card>
              <div className="space-y-3">
                {deal.status === '초안' && (
                  <Button variant="transition" onClick={handleMarkAsSent} fullWidth>
                    발송함으로 표시
                  </Button>
                )}
                <Button variant="transition" onClick={handleConvertToInvoice} fullWidth>
                  청구서로 바꾸기
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        currentCount={usage.count}
      />
    </div>
  );
}

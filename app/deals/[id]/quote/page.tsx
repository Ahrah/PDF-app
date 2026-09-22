'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import SharePDF from '@/components/SharePDF';
import PaywallModal from '@/components/PaywallModal';
import { Deal, Client, SellerInfo } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { generatePDF } from '@/lib/pdf';

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
        await generatePreview(dealData, clientData, sellerData, settingsData.settings.isPremium);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function generatePreview(d: Deal, c: Client, s: SellerInfo, premium: boolean) {
    try {
      setGeneratingPDF(true);
      const blob = await generatePDF(d, c, s, premium);
      setPdfBlob(blob);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDF를 만들지 못했어요. 다시 시도해 주세요.');
    } finally {
      setGeneratingPDF(false);
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
            <h1 className="text-2xl font-bold text-gray-900 mb-6">견적서 미리보기</h1>

            {generatingPDF ? (
              <div className="flex items-center justify-center py-32 text-gray-500">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p>문서를 준비하는 중…</p>
                </div>
              </div>
            ) : pdfBlob ? (
              <div className="border-2 border-gray-200 rounded-lg p-8 bg-gray-50">
                <div className="bg-white p-8 shadow-sm max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">견적서</h2>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-gray-600">발행일: {formatDate(deal.issueDate)}</p>
                    {deal.validUntil && (
                      <p className="text-sm text-gray-600">유효기간: {formatDate(deal.validUntil)}</p>
                    )}
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">공급자 정보</h3>
                    <p className="text-sm text-gray-700">{seller.businessName || seller.name}</p>
                    <p className="text-sm text-gray-600">{seller.phone}</p>
                    <p className="text-sm text-gray-600">{seller.email}</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">고객 정보</h3>
                    <p className="text-sm text-gray-700">{client.name} {client.company && `(${client.company})`}</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">품목</h3>
                    <div className="space-y-2">
                      {deal.lineItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm gap-4">
                          <span className="text-gray-700 break-words min-w-0 flex-1">{item.name} × {item.quantity}</span>
                          <span className="text-gray-900 font-medium flex-shrink-0">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>합계</span>
                      <span>{formatCurrency(deal.totalAmount)}</span>
                    </div>
                  </div>

                  {!isPremium && (
                    <div className="mt-6 text-center">
                      <p className="text-xs text-gray-400">WATERMARK - FREE PLAN</p>
                    </div>
                  )}

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
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
                  <Button variant="secondary" onClick={handleMarkAsSent} fullWidth>
                    발송함으로 표시
                  </Button>
                )}
                <Button variant="secondary" onClick={handleConvertToInvoice} fullWidth>
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

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import SharePDF from '@/components/SharePDF';
import PaywallModal from '@/components/PaywallModal';
import { Deal, Client, SellerInfo } from '@/lib/types';
import { formatCurrency, formatDate, isOverdue } from '@/lib/utils';
import { generatePDF, DocTitleLabel } from '@/lib/pdf';

export default function InvoiceDetailPage() {
  const params = useParams();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [usage, setUsage] = useState({ count: 0, limit: 3 });
  const [titleLabel, setTitleLabel] = useState<DocTitleLabel>('INVOICE');

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
        const blob = await generatePDF(dealData, clientData, sellerData, settingsData.settings.isPremium, titleLabel);
        setPdfBlob(blob);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleTitleLabelChange(label: DocTitleLabel) {
    setTitleLabel(label);
    if (deal && client && seller) {
      const blob = await generatePDF(deal, client, seller, isPremium, label);
      setPdfBlob(blob);
    }
  }

  async function handleStatusChange(newStatus: '발송함' | '입금 완료') {
    if (!deal) return;

    try {
      await fetch(`/api/deals/${deal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
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
              청구서를 만들려면 먼저 판매자(내) 정보를 등록해야 해요.
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
          <p className="text-center py-12 text-gray-500">청구서를 찾을 수 없습니다.</p>
        </Card>
      </div>
    );
  }

  const overdue = isOverdue(deal.dueDate, deal.status);

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
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">청구서</h1>
                <p className="text-gray-600 mt-1">{client.name} {client.company && `(${client.company})`}</p>
              </div>
              <span className={`badge ${deal.status === '입금 완료' ? 'badge-success' : deal.status === '발송함' ? 'badge-primary' : 'badge-gray'}`}>
                {deal.status}
              </span>
            </div>

            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-gray-500">PDF 문서 제목</span>
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

            {overdue && (
              <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg flex items-start">
                <svg className="h-5 w-5 text-danger-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold text-danger-900">연체</p>
                  <p className="text-sm text-danger-700">입금기한이 지났어요.</p>
                </div>
              </div>
            )}

            <div className="bg-primary-50 rounded-lg p-6 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">받을 금액</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(deal.totalAmount)}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">입금 정보</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">입금기한</span>
                    <span className="text-gray-900 font-medium">
                      {deal.dueDate ? formatDate(deal.dueDate) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">입금계좌</span>
                    <span className="text-gray-900 font-medium">{seller.bankAccount}</span>
                  </div>
                </div>
              </div>

              {deal.paymentMemo && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">입금 시 참고</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {deal.paymentMemo}
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">품목</h3>
                <div className="space-y-3">
                  {deal.lineItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start p-3 bg-gray-50 rounded gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 break-words">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity}{item.unit || '개'} × {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900 flex-shrink-0">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {deal.memo && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">메모</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {deal.memo}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="space-y-4 lg:sticky lg:top-4">
            {deal.status !== '입금 완료' && (
              <Card className="bg-primary-50 border-primary-200">
                <p className="text-sm text-primary-800 mb-3">
                  💡 발송함은 직접 표시하는 상태예요. 이메일 전송 기능은 없어요.
                </p>
              </Card>
            )}

            {pdfBlob && deal.status !== '입금 완료' && (
              <Card>
                <SharePDF
                  pdfBlob={pdfBlob}
                  fileName={`청구서_${client.name}_${new Date().toISOString().split('T')[0]}.pdf`}
                  clientName={client.name}
                  amount={deal.totalAmount}
                  dueDate={deal.dueDate ? formatDate(deal.dueDate) : undefined}
                  bankAccount={seller.bankAccount}
                  type="invoice"
                  dealId={deal.id}
                  onQuotaExceeded={() => {
                    setShowPaywall(true);
                    fetchQuota();
                  }}
                  onMarkAsSent={() => handleStatusChange('발송함')}
                />
              </Card>
            )}

            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">상태 변경</h3>
              <div className="space-y-2">
                {deal.status === '초안' && (
                  <Button variant="transition" onClick={() => handleStatusChange('발송함')} fullWidth>
                    발송함으로 표시
                  </Button>
                )}
                {deal.status !== '입금 완료' && (
                  <Button variant="transition" onClick={() => handleStatusChange('입금 완료')} fullWidth>
                    입금 완료로 표시
                  </Button>
                )}
                {deal.status === '입금 완료' && (
                  <div className="text-center py-4">
                    <svg className="h-12 w-12 text-success-500 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-success-700 font-medium">입금 완료</p>
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">문서 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">발행일</span>
                  <span className="text-gray-900">{formatDate(deal.issueDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">고객</span>
                  <span className="text-gray-900">{client.name}</span>
                </div>
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

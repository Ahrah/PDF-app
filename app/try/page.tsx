'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { Client, Deal, LineItem, SellerInfo } from '@/lib/types';
import { calculateTotal, formatCurrency } from '@/lib/utils';
import { generatePDF, downloadBlob } from '@/lib/pdf';
import { saveGuestDraft, loadGuestDraft, GuestQuoteDraft } from '@/lib/guestDraft';

const emptyDraft: GuestQuoteDraft = {
  sellerName: '',
  sellerEmail: '',
  sellerPhone: '',
  clientName: '',
  clientCompany: '',
  issueDate: new Date().toISOString().split('T')[0],
  lineItems: [{ id: '1', name: '', quantity: 1, unitPrice: 0 }],
};

export default function TryGuestQuotePage() {
  const [draft, setDraft] = useState<GuestQuoteDraft>(emptyDraft);
  const [eligible, setEligible] = useState<boolean | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = loadGuestDraft();
    if (saved) setDraft(saved);

    fetch('/api/guest/quote-quota')
      .then((res) => res.json())
      .then((data) => setEligible(!!data.allowed))
      .catch(() => setEligible(true));
  }, []);

  useEffect(() => {
    saveGuestDraft(draft);
  }, [draft]);

  function addLineItem() {
    setDraft({
      ...draft,
      lineItems: [...draft.lineItems, { id: Date.now().toString(), name: '', quantity: 1, unitPrice: 0 }],
    });
  }

  function removeLineItem(id: string) {
    if (draft.lineItems.length > 1) {
      setDraft({ ...draft, lineItems: draft.lineItems.filter((i) => i.id !== id) });
    }
  }

  function updateLineItem(id: string, field: keyof LineItem, value: string | number) {
    setDraft({
      ...draft,
      lineItems: draft.lineItems.map((i) => (i.id === id ? { ...i, [field]: value } : i)),
    });
  }

  const calc = calculateTotal(draft.lineItems, 0, '별도');

  function validate(): string | null {
    if (!draft.sellerName.trim()) return '공급자 이름 또는 상호명을 입력해주세요.';
    if (!draft.clientName.trim() && !draft.clientCompany.trim()) return '고객 이름 또는 회사명을 입력해주세요.';
    if (draft.lineItems.length === 0 || draft.lineItems.some((i) => !i.name.trim())) {
      return '품목을 하나 이상 입력해주세요.';
    }
    if (draft.lineItems.some((i) => i.quantity <= 0 || i.unitPrice < 0)) {
      return '수량과 단가를 확인해주세요.';
    }
    return null;
  }

  async function handleDownload() {
    if (downloading) return;
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setDownloading(true);

    try {
      const res = await fetch('/api/guest/quote-quota', { method: 'POST' });
      if (res.status === 403) {
        setEligible(false);
        return;
      }
      if (!res.ok) throw new Error('failed');

      const fakeSeller: SellerInfo = {
        userId: 'guest',
        name: draft.sellerName,
        email: draft.sellerEmail,
        phone: draft.sellerPhone,
        bankAccount: '',
      };
      const fakeClient: Client = {
        id: 'guest',
        userId: 'guest',
        customerType: '개인',
        name: draft.clientName || draft.clientCompany,
        company: draft.clientCompany || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const fakeDeal: Deal = {
        id: 'guest',
        userId: 'guest',
        clientId: 'guest',
        type: 'quote',
        status: '초안',
        issueDate: draft.issueDate,
        lineItems: draft.lineItems,
        discount: 0,
        vatMode: '별도',
        totalAmount: calc.total,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const blob = await generatePDF(fakeDeal, fakeClient, fakeSeller, false);
      downloadBlob(blob, `견적서_체험_${draft.issueDate}.pdf`);
      setDownloaded(true);
    } catch (err) {
      setError('PDF를 만들지 못했어요. 입력한 내용은 유지했으니 다시 시도해주세요.');
    } finally {
      setDownloading(false);
    }
  }

  if (eligible === false) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Card>
          <p className="text-gray-700 mb-4">이미 무료 체험을 사용하셨어요.</p>
          <p className="text-sm text-gray-500 mb-6">
            계속 이용하시려면 회원가입 후 월 3건 무료 플랜이나 30일 체험을 이용해주세요.
          </p>
          <Link href="/signup">
            <Button>무료로 시작하기</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">가입 없이 견적서 만들어보기</h1>
      <p className="text-sm text-gray-500 mb-6">
        회원가입 없이 지금 바로 견적서 PDF를 만들어볼 수 있어요. 워터마크가 포함됩니다.
      </p>

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6 text-sm text-primary-800">
        체험 내용은 계정에 저장되지 않아요. PDF를 내려받거나 가입 후 저장해주세요.
      </div>

      {error && (
        <p role="alert" className="text-sm text-danger-700 bg-danger-50 border border-danger-200 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="space-y-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">공급자 정보</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="sellerName">이름 또는 상호명 *</label>
              <input
                id="sellerName"
                className="input"
                value={draft.sellerName}
                onChange={(e) => setDraft({ ...draft, sellerName: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="sellerPhone">연락처</label>
              <input
                id="sellerPhone"
                className="input"
                value={draft.sellerPhone}
                onChange={(e) => setDraft({ ...draft, sellerPhone: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="sellerEmail">이메일</label>
              <input
                id="sellerEmail"
                type="email"
                className="input"
                value={draft.sellerEmail}
                onChange={(e) => setDraft({ ...draft, sellerEmail: e.target.value })}
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">고객 정보</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="clientName">고객 이름</label>
              <input
                id="clientName"
                className="input"
                value={draft.clientName}
                onChange={(e) => setDraft({ ...draft, clientName: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="clientCompany">회사명</label>
              <input
                id="clientCompany"
                className="input"
                value={draft.clientCompany}
                onChange={(e) => setDraft({ ...draft, clientCompany: e.target.value })}
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">작성일 및 품목</h2>
          <div className="mb-4">
            <label className="label" htmlFor="issueDate">작성일</label>
            <input
              id="issueDate"
              type="date"
              className="input"
              value={draft.issueDate}
              onChange={(e) => setDraft({ ...draft, issueDate: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            {draft.lineItems.map((item, index) => (
              <div key={item.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-700">품목 {index + 1}</span>
                  {draft.lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLineItem(item.id)}
                      className="text-danger-600 hover:text-danger-700 text-sm"
                    >
                      제거
                    </button>
                  )}
                </div>
                <div>
                  <label className="label" htmlFor={`item-name-${item.id}`}>품목명 *</label>
                  <input
                    id={`item-name-${item.id}`}
                    className="input"
                    value={item.name}
                    onChange={(e) => updateLineItem(item.id, 'name', e.target.value)}
                    placeholder="예: 웹사이트 디자인"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label" htmlFor={`item-qty-${item.id}`}>수량 *</label>
                    <input
                      id={`item-qty-${item.id}`}
                      type="number"
                      min="1"
                      className="input"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, 'quantity', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor={`item-price-${item.id}`}>단가 (원) *</label>
                    <input
                      id={`item-price-${item.id}`}
                      type="number"
                      min="0"
                      step="1000"
                      className="input"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(item.id, 'unitPrice', Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={addLineItem} fullWidth>+ 품목 추가</Button>
          </div>

          <div className="text-right mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-600">합계: </span>
            <span className="text-lg font-bold text-gray-900">{formatCurrency(calc.total)}</span>
          </div>
        </Card>

        <Button onClick={handleDownload} disabled={downloading} fullWidth className="py-3 text-base">
          {downloading ? '확인 중...' : 'PDF 다운로드'}
        </Button>

        {downloaded && (
          <Card className="bg-primary-50 border-primary-200 text-center">
            <p className="text-sm text-primary-800 mb-3">
              PDF를 받으셨어요. 계정을 만들어 고객 관리, 청구서 전환, 입금 상태 관리까지 이용해보세요.
            </p>
            <Link href="/signup">
              <Button>가입하고 저장하기</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}

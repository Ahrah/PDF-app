'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { Client, LineItem, VATMode } from '@/lib/types';
import { calculateTotal, formatCurrency } from '@/lib/utils';

function NewDealForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get('clientId');

  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState(preselectedClientId || '');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', name: '', quantity: 1, unitPrice: 0 },
  ]);
  const [discount, setDiscount] = useState(0);
  const [vatMode, setVATMode] = useState<VATMode>('별도');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchClients() {
      const res = await fetch('/api/clients');
      const data = await res.json();
      setClients(data);
      setClientsLoading(false);
    }
    fetchClients();
  }, []);

  function addLineItem() {
    setLineItems([
      ...lineItems,
      { id: Date.now().toString(), name: '', quantity: 1, unitPrice: 0 },
    ]);
  }

  function removeLineItem(id: string) {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  }

  function updateLineItem(id: string, field: keyof LineItem, value: string | number) {
    setLineItems(lineItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!clientId) {
      newErrors.client = '고객을 선택해 주세요.';
    }

    if (lineItems.length === 0 || lineItems.some(item => !item.name.trim())) {
      newErrors.lineItems = '품목을 하나 이상 추가해 주세요.';
    }

    if (lineItems.some(item => item.quantity <= 0 || item.unitPrice < 0)) {
      newErrors.amounts = '수량과 단가는 0 이상이어야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);

    try {
      const calc = calculateTotal(lineItems, discount, vatMode);
      
      const deal = {
        clientId,
        type: 'quote' as const,
        status: '초안' as const,
        issueDate,
        validUntil: validUntil || undefined,
        lineItems,
        discount,
        vatMode,
        memo: memo || undefined,
        totalAmount: calc.total,
      };

      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deal),
      });

      if (res.ok) {
        const created = await res.json();
        router.push(`/deals/${created.id}/quote`);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      alert('저장하지 못했어요. 입력한 내용은 유지됩니다.');
    } finally {
      setLoading(false);
    }
  }

  const calc = calculateTotal(lineItems, discount, vatMode);

  if (clientsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">새 견적서 만들기</h1>
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              견적서를 만들려면 먼저 고객을 등록해야 해요.
            </p>
            <Link href="/clients">
              <Button>고객 등록하러 가기</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">새 견적서 만들기</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {Object.keys(errors).length > 0 && (
              <Card className="bg-danger-50 border-danger-200">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-danger-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-semibold text-danger-900">입력 오류</p>
                    <ul className="text-sm text-danger-700 mt-1 space-y-1">
                      {Object.values(errors).map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            )}

            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. 고객 선택</h2>
              <div>
                <label className="label">고객 *</label>
                <select
                  required
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className={errors.client ? 'input-error' : 'input'}
                >
                  <option value="">고객을 선택해 주세요</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.company && `(${client.company})`}
                    </option>
                  ))}
                </select>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. 작성일 및 유효기간</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">작성일 *</label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">견적 유효기간</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="input"
                  />
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. 품목</h2>
              <div className="space-y-4">
                {lineItems.map((item, index) => (
                  <div key={item.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-700">품목 {index + 1}</span>
                      {lineItems.length > 1 && (
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
                      <label className="label">품목명 *</label>
                      <input
                        type="text"
                        required
                        value={item.name}
                        onChange={(e) => updateLineItem(item.id, 'name', e.target.value)}
                        className="input"
                        placeholder="예: 웹사이트 디자인"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">수량 *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', Number(e.target.value))}
                          className="input"
                          inputMode="numeric"
                        />
                      </div>
                      <div>
                        <label className="label">단가 (원) *</label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="1000"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(item.id, 'unitPrice', Number(e.target.value))}
                          className="input"
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-600">소계: </span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </span>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={addLineItem} fullWidth>
                  + 품목 추가
                </Button>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. 할인 및 부가세</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">할인 (원)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="input"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="label">부가세</label>
                  <select
                    value={vatMode}
                    onChange={(e) => setVATMode(e.target.value as VATMode)}
                    className="input"
                  >
                    <option value="없음">없음</option>
                    <option value="별도">별도 (10% 추가)</option>
                    <option value="포함">포함 (금액에 포함됨)</option>
                  </select>
                  <p className="mt-2 text-sm text-primary-600">
                    💡 잘 모르겠다면 '별도'를 선택하세요.
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. 메모 (선택)</h2>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={4}
                className="input"
                placeholder="고객에게 전달할 메시지가 있다면 입력해 주세요"
              />
            </Card>

            <div className="lg:hidden">
              <Button type="submit" disabled={loading} fullWidth>
                {loading ? '저장 중...' : '미리보기'}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-4 space-y-6">
              <Card className="bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-4">받을 금액 합계</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">소계</span>
                    <span className="font-medium text-gray-900">{formatCurrency(calc.subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">할인</span>
                      <span className="font-medium text-danger-600">-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  {calc.vat > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">부가세 (10%)</span>
                      <span className="font-medium text-gray-900">{formatCurrency(calc.vat)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-300">
                    <span>합계</span>
                    <span className="text-primary-600">{formatCurrency(calc.total)}</span>
                  </div>
                </div>
              </Card>

              <div className="hidden lg:block">
                <Button type="submit" disabled={loading} fullWidth>
                  {loading ? '저장 중...' : '미리보기'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function NewDealPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <NewDealForm />
    </Suspense>
  );
}

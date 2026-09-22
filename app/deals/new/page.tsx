'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { Client, CustomerType, LineItem, VATMode } from '@/lib/types';
import { calculateTotal, formatCurrency } from '@/lib/utils';

const emptyNewClient = {
  customerType: '개인' as CustomerType,
  name: '',
  company: '',
  email: '',
  phone: '',
};

function NewDealForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get('clientId');

  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState(preselectedClientId || '');
  const [clientMode, setClientMode] = useState<'existing' | 'new'>(preselectedClientId ? 'existing' : 'existing');
  const [clientSearch, setClientSearch] = useState('');
  const [newClient, setNewClient] = useState(emptyNewClient);

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
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setClients(data);
      setClientsLoading(false);
    }
    fetchClients();
  }, [router]);

  const selectedClient = clients.find((c) => c.id === clientId);

  const filteredClients = useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    const sorted = [...clients].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (!q) return sorted.slice(0, 8);
    return sorted
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.company && c.company.toLowerCase().includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.phone && c.phone.includes(q))
      )
      .slice(0, 8);
  }, [clients, clientSearch]);

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

    if (clientMode === 'existing' && !clientId) {
      newErrors.client = '고객을 선택해 주세요.';
    }
    if (clientMode === 'new' && !newClient.name.trim() && !newClient.company.trim()) {
      newErrors.client = '새 고객의 이름 또는 회사명을 입력해 주세요.';
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
      let effectiveClientId = clientId;

      if (clientMode === 'new') {
        const clientRes = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newClient),
        });
        if (!clientRes.ok) {
          const data = await clientRes.json();
          throw new Error(data.error || '고객 등록에 실패했습니다.');
        }
        const createdClient = await clientRes.json();
        effectiveClientId = createdClient.id;
      }

      const calc = calculateTotal(lineItems, discount, vatMode);

      const deal = {
        clientId: effectiveClientId,
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
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : '저장하지 못했어요. 입력한 내용은 유지됩니다.');
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

              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setClientMode('existing')}
                  className={`flex-1 py-2 rounded-full border text-sm font-medium transition-colors ${
                    clientMode === 'existing'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  기존 고객 선택
                </button>
                <button
                  type="button"
                  onClick={() => { setClientMode('new'); setClientId(''); }}
                  className={`flex-1 py-2 rounded-full border text-sm font-medium transition-colors ${
                    clientMode === 'new'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  새 고객 등록
                </button>
              </div>

              {clientMode === 'existing' ? (
                clients.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">등록된 고객이 없어요.</p>
                    <Button type="button" variant="secondary" onClick={() => setClientMode('new')}>
                      새 고객으로 등록하기
                    </Button>
                  </div>
                ) : (
                  <div>
                    {selectedClient ? (
                      <div className="flex items-center justify-between p-3 bg-primary-50 border border-primary-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            {selectedClient.company || selectedClient.name}
                          </p>
                          {selectedClient.company && (
                            <p className="text-sm text-gray-500">{selectedClient.contactName || selectedClient.name}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setClientId('')}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          변경
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <svg
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
                            <path d="M17 17l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                          </svg>
                          <input
                            type="text"
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                            placeholder="고객명, 회사명, 이메일, 연락처로 검색"
                            className={errors.client ? 'input-error rounded-full pl-11' : 'input-search'}
                            autoFocus
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-2 mb-1">
                          {clientSearch ? '검색 결과' : '최근 등록한 고객'}
                        </p>
                        <div className="space-y-1 max-h-64 overflow-y-auto">
                          {filteredClients.length === 0 ? (
                            <p className="text-sm text-gray-400 py-3">일치하는 고객이 없어요.</p>
                          ) : (
                            filteredClients.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => { setClientId(c.id); setClientSearch(''); }}
                                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-gray-50 transition-colors"
                              >
                                <p className="font-medium text-gray-900">{c.company || c.name}</p>
                                <p className="text-sm text-gray-500">
                                  {[c.company && c.contactName, c.email, c.phone].filter(Boolean).join(' · ')}
                                </p>
                              </button>
                            ))
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {(['개인', '사업자'] as CustomerType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewClient({ ...newClient, customerType: type })}
                        className={`flex-1 py-2 rounded-full border text-sm font-medium transition-colors ${
                          newClient.customerType === type
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="label">회사명</label>
                    <input
                      type="text"
                      value={newClient.company}
                      onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">{newClient.company ? '담당자명' : '고객명'} *</label>
                    <input
                      type="text"
                      value={newClient.name}
                      onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                      className={errors.client ? 'input-error' : 'input'}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">이메일</label>
                      <input
                        type="email"
                        value={newClient.email}
                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                        className="input"
                        inputMode="email"
                      />
                    </div>
                    <div>
                      <label className="label">연락처</label>
                      <input
                        type="tel"
                        value={newClient.phone}
                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                        className="input"
                        inputMode="tel"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">이 고객은 견적서 저장 시 고객 목록에 자동으로 등록돼요.</p>
                </div>
              )}
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
                    step="10"
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

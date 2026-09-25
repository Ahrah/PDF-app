'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import DealStatusControls from '@/components/DealStatusControls';
import LandingPage from '@/components/LandingPage';
import GuestDraftBanner from '@/components/GuestDraftBanner';
import { Deal, Client, DealStatus } from '@/lib/types';
import { formatCurrency, formatDate, isOverdue } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { PRICING } from '@/lib/pricing';

export default function HomePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [usage, setUsage] = useState({ count: 0, limit: PRICING.FREE_TIER_MONTHLY_LIMIT });
  const [trialInfo, setTrialInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  async function fetchData() {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const [dealsRes, clientsRes, settingsRes] = await Promise.all([
        fetch('/api/deals'),
        fetch('/api/clients'),
        fetch('/api/settings'),
      ]);

      const dealsData = dealsRes.ok ? await dealsRes.json() : [];
      const clientsData = clientsRes.ok ? await clientsRes.json() : [];
      const settingsData = settingsRes.ok ? await settingsRes.json() : null;

      setDeals(dealsData);
      setClients(clientsData);
      if (settingsData) {
        setUsage({
          count: settingsData.settings.monthlyDealCount,
          limit: settingsData.settings.isPremium ? 999 : PRICING.FREE_TIER_MONTHLY_LIMIT,
        });
        setTrialInfo(settingsData.trialInfo);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [user]);

  async function handleStartTrial() {
    try {
      const res = await fetch('/api/auth/start-trial', { method: 'POST' });
      if (!res.ok) throw new Error('failed');
      await fetchData();
    } catch (error) {
      alert('체험을 시작하지 못했어요. 다시 시도해주세요.');
    }
  }

  async function handleStatusChange(dealId: string, status: DealStatus) {
    const previous = deals.find((d) => d.id === dealId)?.status;
    if (!previous) return;

    setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, status } : d)));

    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('failed');
    } catch (error) {
      setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, status: previous } : d)));
      alert('상태를 변경하지 못했어요. 다시 시도해주세요.');
    }
  }

  const recentDeals = deals.slice(0, 5).sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const unpaidDeals = deals.filter(d =>
    d.type === 'invoice' && d.status !== '입금 완료'
  );

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyBilled = deals
    .filter((d) => d.type === 'invoice' && d.issueDate.startsWith(currentMonth))
    .reduce((sum, d) => sum + d.totalAmount, 0);
  const totalUnpaid = unpaidDeals.reduce((sum, d) => sum + d.totalAmount, 0);
  const dueSoon = unpaidDeals
    .filter((d) => d.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 3);
  const recentClients = clients
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return '알 수 없음';
    return client.company || client.name;
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <GuestDraftBanner />

      {trialInfo && !trialInfo.trialStarted && (
        <Card padding="none" className="mb-8 overflow-hidden bg-gradient-to-br from-primary-50 via-white to-indigo-50 border-primary-100">
          <div className="h-1.5 bg-gradient-to-r from-violet-500 via-primary-500 to-primary-600" />
          <div className="text-center py-8 px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{PRICING.TRIAL_DAYS}일 무료 체험을 시작해보세요</h2>
            <p className="text-sm text-gray-600 mb-6">
              무제한 문서 생성과 워터마크 제거를 {PRICING.TRIAL_DAYS}일간 무료로 이용할 수 있어요. 지금은 월 {PRICING.FREE_TIER_MONTHLY_LIMIT}건 무료 플랜이에요.
            </p>
            <Button className="px-8" onClick={handleStartTrial}>체험하기</Button>
          </div>
        </Card>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        {user && (
          <Link href="/deals/new">
            <Button>새 견적서 만들기</Button>
          </Link>
        )}
      </div>

      {user && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card padding="sm" className={totalUnpaid > 0 ? 'bg-danger-50 border-danger-100' : undefined}>
            <div className="w-9 h-9 rounded-lg bg-danger-100 text-danger-600 flex items-center justify-center mb-3">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2.5" y="5.5" width="15" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M2.5 8.5h15" stroke="currentColor" strokeWidth="1.6" />
                <path d="M5.5 12h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1.5">입금대기 금액</p>
            <p className={`text-2xl font-semibold tabular-nums ${totalUnpaid > 0 ? 'text-danger-700' : 'text-gray-900'}`}>
              {formatCurrency(totalUnpaid)}
            </p>
          </Card>
          <Card padding="sm">
            <div className="w-9 h-9 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center mb-3">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.5 2.5h9l1.5 1.5v13.5h-12V4l1.5-1.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M7 8h6M7 11h6M7 14h3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1.5">이번 달 청구 금액</p>
            <p className="text-2xl font-semibold tabular-nums text-gray-900">{formatCurrency(monthlyBilled)}</p>
          </Card>
          <Card padding="sm">
            <div className="w-9 h-9 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center mb-3">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.6" />
                <path d="M10 5.5V10l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1.5">
              {trialInfo?.trialActive ? '무료 체험' : '이번 달 사용량'}
            </p>
            <p className="text-2xl font-semibold tabular-nums text-gray-900">
              {trialInfo?.trialActive ? `${trialInfo.remainingDays}일 남음` : `${usage.count}/${usage.limit}건`}
            </p>
          </Card>
          <Card padding="sm">
            <div className="w-9 h-9 rounded-lg bg-success-100 text-success-600 flex items-center justify-center mb-3">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7.5" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.6" />
                <path d="M2.5 17c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M13 8.5a2.5 2.5 0 100-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M12.5 12.1c2.2.4 3.9 2.3 3.9 4.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1.5">등록 고객</p>
            <p className="text-2xl font-semibold tabular-nums text-gray-900">{clients.length}명</p>
          </Card>
        </div>
      )}

      {user && (
        <div className="mb-8 flex justify-end">
          <Link href="/billing">
            <Button variant="secondary">프리미엄 보기</Button>
          </Link>
        </div>
      )}

      {user && deals.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">아직 문서가 없어요. 첫 견적서를 만들어 볼까요?</p>
            <Link href="/deals/new">
              <Button>새 견적서 만들기</Button>
            </Link>
          </div>
        </Card>
      ) : user ? (
        <div className="space-y-8">
          {dueSoon.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">결제기한 임박</h2>
              <Card>
                <div className="space-y-3">
                  {dueSoon.map((deal) => {
                    const overdue = isOverdue(deal.dueDate, deal.status);
                    return (
                      <div
                        key={deal.id}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Link href={`/deals/${deal.id}/invoice`} className="flex justify-between items-start gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 break-words">
                              {getClientName(deal.clientId)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {deal.dueDate ? `입금기한: ${formatDate(deal.dueDate)}` : ''}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(deal.totalAmount)}
                            </p>
                            {overdue && <span className="badge-danger">연체</span>}
                          </div>
                        </Link>
                        <DealStatusControls deal={deal} onStatusChange={handleStatusChange} />
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-4">직접 발송한 뒤 표시하는 상태예요.</p>
              </Card>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">최근 문서</h2>
            <Card>
              <div className="space-y-3">
                {recentDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Link
                      href={`/deals/${deal.id}/${deal.type === 'quote' ? 'quote' : 'invoice'}`}
                      className="flex justify-between items-start gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 break-words">
                          {getClientName(deal.clientId)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {deal.type === 'quote' ? '견적서' : '청구서'} · {deal.status}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(deal.totalAmount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(deal.issueDate)}
                        </p>
                      </div>
                    </Link>

                    <DealStatusControls deal={deal} onStatusChange={handleStatusChange} />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4">직접 발송한 뒤 표시하는 상태예요.</p>
            </Card>
          </div>

          {recentClients.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">최근 고객</h2>
                <Link href="/clients" className="text-sm text-primary-600 hover:text-primary-700">전체 보기</Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {recentClients.map((client) => (
                  <Link
                    key={client.id}
                    href={`/clients/${client.id}`}
                    className="p-3 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                  >
                    <p className="font-medium text-gray-900 text-sm truncate">{client.company || client.name}</p>
                    {client.phone && <p className="text-xs text-gray-500 truncate">{client.phone}</p>}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

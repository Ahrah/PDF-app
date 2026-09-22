'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { Deal, Client } from '@/lib/types';
import { formatCurrency, formatDate, isOverdue } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

export default function HomePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [usage, setUsage] = useState({ count: 0, limit: 3 });
  const [trialInfo, setTrialInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
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
            limit: settingsData.settings.isPremium ? 999 : 3,
          });
          setTrialInfo(settingsData.trialInfo);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

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

  if (loading) {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {!user && (
        <Card className="mb-8 bg-primary-50 border-primary-200">
          <div className="text-center py-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              🎉 30일 무료 체험 시작하기
            </h2>
            <div className="max-w-2xl mx-auto mb-6">
              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="border-r border-gray-200 pr-4 last:border-r-0">
                    <p className="font-semibold text-gray-900 mb-1">체험 기간</p>
                    <p className="text-gray-600">가입일로부터 30일</p>
                  </div>
                  <div className="border-r border-gray-200 pr-4 last:border-r-0">
                    <p className="font-semibold text-gray-900 mb-1">체험 후 제한</p>
                    <p className="text-gray-600">월 3건 + 워터마크</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">프리미엄</p>
                    <p className="text-gray-600">월 9,900원</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                회원가입 후 30일간 무제한 문서 생성 및 워터마크 제거를 이용하실 수 있습니다.<br />
                체험 종료 후 자동 결제되지 않으며, 월 3건 무료 플랜으로 전환됩니다.
              </p>
            </div>
            <Link href="/signup">
              <Button className="px-8">지금 시작하기</Button>
            </Link>
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
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 mb-1.5">입금대기 금액</p>
            <p className={`text-2xl font-semibold tabular-nums ${totalUnpaid > 0 ? 'text-danger-700' : 'text-gray-900'}`}>
              {formatCurrency(totalUnpaid)}
            </p>
          </Card>
          <Card padding="sm">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 mb-1.5">이번 달 청구 금액</p>
            <p className="text-2xl font-semibold tabular-nums text-gray-900">{formatCurrency(monthlyBilled)}</p>
          </Card>
          <Card padding="sm">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 mb-1.5">
              {trialInfo?.trialActive ? '무료 체험' : '이번 달 사용량'}
            </p>
            <p className="text-2xl font-semibold tabular-nums text-gray-900">
              {trialInfo?.trialActive ? `${trialInfo.remainingDays}일 남음` : `${usage.count}/${usage.limit}건`}
            </p>
          </Card>
          <Card padding="sm">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 mb-1.5">등록 고객</p>
            <p className="text-2xl font-semibold tabular-nums text-gray-900">{clients.length}명</p>
          </Card>
        </div>
      )}

      {user && usage.limit !== 999 && !trialInfo?.trialActive && (
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
                      <Link
                        key={deal.id}
                        href={`/deals/${deal.id}/invoice`}
                        className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start gap-4">
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
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">최근 문서</h2>
            <Card>
              <div className="space-y-3">
                {recentDeals.map((deal) => (
                  <Link
                    key={deal.id}
                    href={`/deals/${deal.id}/${deal.type === 'quote' ? 'quote' : 'invoice'}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-4">
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
                    </div>
                  </Link>
                ))}
              </div>
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

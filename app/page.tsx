'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { Deal, Client } from '@/lib/types';
import { formatCurrency, formatDate, isOverdue } from '@/lib/utils';

export default function HomePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [usage, setUsage] = useState({ count: 0, limit: 3 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dealsRes, clientsRes, settingsRes] = await Promise.all([
          fetch('/api/deals'),
          fetch('/api/clients'),
          fetch('/api/settings'),
        ]);

        const dealsData = await dealsRes.json();
        const clientsData = await clientsRes.json();
        const settingsData = await settingsRes.json();

        setDeals(dealsData);
        setClients(clientsData);
        setUsage({
          count: settingsData.settings.monthlyDealCount,
          limit: settingsData.settings.isPremium ? 999 : 3,
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const recentDeals = deals.slice(0, 5).sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const unpaidDeals = deals.filter(d => 
    d.type === 'invoice' && d.status !== '입금 완료'
  );

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : '알 수 없음';
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <Link href="/deals/new">
          <Button>새 견적서 만들기</Button>
        </Link>
      </div>

      <div className="mb-8">
        <Card>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">이번 달 사용량</p>
              <p className="text-2xl font-bold text-gray-900">
                {usage.count}/{usage.limit}건
              </p>
            </div>
            {usage.limit !== 999 && (
              <Link href="/billing">
                <Button variant="secondary">프리미엄 보기</Button>
              </Link>
            )}
          </div>
        </Card>
      </div>

      {deals.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">아직 문서가 없어요. 첫 견적서를 만들어 볼까요?</p>
            <Link href="/deals/new">
              <Button>새 견적서 만들기</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {unpaidDeals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">미입금 청구서</h2>
              <Card>
                <div className="space-y-3">
                  {unpaidDeals.map((deal) => {
                    const overdue = isOverdue(deal.dueDate, deal.status);
                    return (
                      <Link
                        key={deal.id}
                        href={`/deals/${deal.id}/invoice`}
                        className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              {getClientName(deal.clientId)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {deal.dueDate ? `입금기한: ${formatDate(deal.dueDate)}` : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(deal.totalAmount)}
                            </p>
                            {overdue && (
                              <span className="inline-block px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded">
                                연체
                              </span>
                            )}
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
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {getClientName(deal.clientId)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {deal.type === 'quote' ? '견적서' : '청구서'} · {deal.status}
                        </p>
                      </div>
                      <div className="text-right">
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
        </div>
      )}
    </div>
  );
}

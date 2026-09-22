'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { Client, Deal } from '@/lib/types';
import { formatCurrency, formatDate, formatBusinessNumber } from '@/lib/utils';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  async function fetchData() {
    try {
      const [clientRes, dealsRes] = await Promise.all([
        fetch(`/api/clients/${params.id}`),
        fetch('/api/deals'),
      ]);

      if (clientRes.status === 401 || dealsRes.status === 401) {
        router.push('/login');
        return;
      }

      const clientData = clientRes.ok ? await clientRes.json() : null;
      const dealsData = dealsRes.ok ? await dealsRes.json() : [];

      setClient(clientData);
      setDeals(dealsData.filter((d: Deal) => d.clientId === params.id));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/clients/${params.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push('/clients');
      }
    } catch (error) {
      alert('고객을 삭제하지 못했어요.');
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <p className="text-center py-12 text-gray-500">고객을 찾을 수 없습니다.</p>
        </Card>
      </div>
    );
  }

  const totalBilled = deals
    .filter((d) => d.type === 'invoice')
    .reduce((sum, d) => sum + d.totalAmount, 0);
  const unpaid = deals
    .filter((d) => d.type === 'invoice' && d.status !== '입금 완료')
    .reduce((sum, d) => sum + d.totalAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/clients" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
          ← 고객 목록으로
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold text-gray-900">{client.company || client.name}</h1>
          <span className="badge-gray">{client.customerType}</span>
        </div>
        {client.company && client.contactName && (
          <p className="text-gray-500 mt-1">담당자: {client.contactName}</p>
        )}
      </div>

      {deals.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-gray-50">
            <p className="text-sm text-gray-600">누적 청구액</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalBilled)}</p>
          </Card>
          <Card className={unpaid > 0 ? 'bg-danger-50' : 'bg-gray-50'}>
            <p className="text-sm text-gray-600">미수금</p>
            <p className={`text-xl font-bold ${unpaid > 0 ? 'text-danger-700' : 'text-gray-900'}`}>
              {formatCurrency(unpaid)}
            </p>
          </Card>
        </div>
      )}

      <div className="space-y-6">
        <Card>
          <h2 className="text-xl font-semibold mb-4">고객 정보</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {client.email && (
              <div>
                <dt className="text-xs text-gray-500">이메일</dt>
                <dd className="text-gray-900 break-all">{client.email}</dd>
              </div>
            )}
            {client.phone && (
              <div>
                <dt className="text-xs text-gray-500">연락처</dt>
                <dd className="text-gray-900">{client.phone}</dd>
              </div>
            )}
            {client.businessNumber && (
              <div>
                <dt className="text-xs text-gray-500">사업자등록번호</dt>
                <dd className="text-gray-900">{formatBusinessNumber(client.businessNumber)}</dd>
              </div>
            )}
            {client.address && (
              <div>
                <dt className="text-xs text-gray-500">주소</dt>
                <dd className="text-gray-900 break-words">{client.address}</dd>
              </div>
            )}
          </dl>
          {client.memo && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <dt className="text-xs text-gray-500 mb-1">메모</dt>
              <dd className="text-gray-700 whitespace-pre-wrap break-words">{client.memo}</dd>
            </div>
          )}
          {!client.email && !client.phone && !client.businessNumber && !client.address && !client.memo && (
            <p className="text-gray-400 text-sm">등록된 추가 정보가 없어요.</p>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">관련 문서 ({deals.length})</h2>
          {deals.length === 0 ? (
            <p className="text-gray-500">이 고객과의 문서가 아직 없어요.</p>
          ) : (
            <div className="space-y-3">
              {deals
                .slice()
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .map((deal) => (
                  <Link
                    key={deal.id}
                    href={`/deals/${deal.id}/${deal.type === 'quote' ? 'quote' : 'invoice'}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 break-words">
                          {deal.type === 'quote' ? '견적서' : '청구서'}
                        </p>
                        <p className="text-sm text-gray-500">{deal.status}</p>
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
          )}
        </Card>

        <div className="flex space-x-4">
          <Link href={`/deals/new?clientId=${client.id}`} className="flex-1">
            <Button className="w-full">이 고객으로 새 견적서 만들기</Button>
          </Link>
        </div>

        <Card>
          <h2 className="text-xl font-semibold mb-4 text-red-600">위험 영역</h2>
          <p className="text-gray-600 mb-4">
            이 고객과 관련 문서를 삭제할까요? 되돌릴 수 없어요.
          </p>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            고객 삭제
          </Button>
        </Card>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="고객 삭제 확인"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            정말로 {client.company || client.name}과(와) 관련된 모든 데이터를 삭제하시겠습니까?
          </p>
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className="flex-1">
              취소
            </Button>
            <Button variant="danger" onClick={handleDelete} className="flex-1">
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { Client, Deal } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

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

      const clientData = await clientRes.json();
      const dealsData = await dealsRes.json();

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/clients" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
          ← 고객 목록으로
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
        {client.company && <p className="text-gray-500">{client.company}</p>}
      </div>

      <div className="space-y-6">
        <Card>
          <h2 className="text-xl font-semibold mb-4">연락처 정보</h2>
          <div className="space-y-2">
            {client.email && (
              <p className="text-gray-600">이메일: {client.email}</p>
            )}
            {client.phone && (
              <p className="text-gray-600">연락처: {client.phone}</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">관련 문서</h2>
          {deals.length === 0 ? (
            <p className="text-gray-500">이 고객과의 문서가 아직 없어요.</p>
          ) : (
            <div className="space-y-3">
              {deals.map((deal) => (
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
            <Button className="w-full">이 고객으로 견적서 만들기</Button>
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
            정말로 {client.name}과(와) 관련된 모든 데이터를 삭제하시겠습니까?
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

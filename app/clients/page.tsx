'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { Client, CustomerType } from '@/lib/types';

const emptyForm = {
  customerType: '개인' as CustomerType,
  name: '',
  company: '',
  contactName: '',
  email: '',
  phone: '',
  businessNumber: '',
  address: '',
  memo: '',
};

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      const res = await fetch('/api/clients');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() && !formData.company.trim()) {
      setFormError('고객명 또는 회사명 중 하나는 입력해 주세요.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData(emptyForm);
        fetchClients();
      } else {
        const data = await res.json();
        setFormError(data.error || '고객을 저장하지 못했어요. 다시 시도해 주세요.');
      }
    } catch (error) {
      setFormError('네트워크 오류가 발생했어요. 연결을 확인하고 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  }

  const q = search.trim().toLowerCase();
  const filteredClients = clients.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.company && c.company.toLowerCase().includes(q)) ||
      (c.contactName && c.contactName.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
  );

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-900">고객 관리</h1>
        <div className="flex gap-2">
          <Link href="/clients/import">
            <Button variant="secondary">고객 일괄등록</Button>
          </Link>
          <Button onClick={() => setShowModal(true)}>고객 추가</Button>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="고객명, 회사명, 이메일, 연락처로 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
        />
      </div>

      {filteredClients.length === 0 && search === '' ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">등록된 고객이 없어요. 자주 보내는 고객을 먼저 등록해 보세요.</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setShowModal(true)}>고객 추가</Button>
              <Link href="/clients/import">
                <Button variant="secondary">엑셀로 일괄등록</Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : filteredClients.length === 0 ? (
        <Card>
          <p className="text-center py-12 text-gray-500">검색 결과가 없어요.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-medium text-gray-900 break-words min-w-0">
                  {client.company || client.name}
                </p>
                <span className="badge-gray flex-shrink-0">{client.customerType}</span>
              </div>
              {client.company && client.contactName && (
                <p className="text-sm text-gray-600 break-words">{client.contactName} 담당자</p>
              )}
              {!client.company && client.contactName && (
                <p className="text-sm text-gray-500 break-words">{client.contactName}</p>
              )}
              {client.email && <p className="text-sm text-gray-500 break-all">{client.email}</p>}
              {client.phone && <p className="text-sm text-gray-500">{client.phone}</p>}
            </Link>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="고객 추가">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
              <p className="text-sm text-danger-700">{formError}</p>
            </div>
          )}

          <div>
            <label className="label">고객 유형</label>
            <div className="flex gap-2">
              {(['개인', '사업자'] as CustomerType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, customerType: type })}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    formData.customerType === type
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">회사명 {formData.customerType === '사업자' && '*'}</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">
              {formData.company ? '담당자명' : '고객명'} {!formData.company && '*'}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value, contactName: e.target.value })}
              className="input"
              placeholder={formData.company ? '담당자 이름' : '고객 이름'}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">이메일</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                inputMode="email"
              />
            </div>
            <div>
              <label className="label">연락처</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
                inputMode="tel"
              />
            </div>
          </div>

          {formData.customerType === '사업자' && (
            <div>
              <label className="label">사업자등록번호</label>
              <input
                type="text"
                value={formData.businessNumber}
                onChange={(e) => setFormData({ ...formData, businessNumber: e.target.value.replace(/[^0-9-]/g, '') })}
                className="input"
                placeholder="123-45-67890"
                inputMode="numeric"
              />
            </div>
          )}

          <div>
            <label className="label">주소</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">메모</label>
            <textarea
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              className="input"
              rows={2}
            />
          </div>

          <div className="flex space-x-3">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
              취소
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

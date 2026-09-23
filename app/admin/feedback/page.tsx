'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/Card';
import Modal from '@/components/Modal';
import { FeedbackSubmission, FeedbackStatus, FeedbackType } from '@/lib/types';

const TYPE_LABEL: Record<FeedbackType, string> = {
  feature_request: '서비스 의견',
  support_issue: '1:1 불편사항',
};

const STATUS_LABEL: Record<FeedbackStatus, string> = {
  new: '신규',
  in_review: '검토 중',
  done: '처리 완료',
};

const STATUS_BADGE: Record<FeedbackStatus, string> = {
  new: 'badge-danger',
  in_review: 'badge-primary',
  done: 'badge-success',
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<FeedbackSubmission[]>([]);
  const [newCount, setNewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [typeFilter, setTypeFilter] = useState<FeedbackType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<FeedbackSubmission | null>(null);

  useEffect(() => {
    const timeout = setTimeout(fetchItems, search ? 300 : 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, statusFilter, search]);

  async function fetchItems() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/admin/feedback?${params.toString()}`);
      if (res.status === 403) {
        setForbidden(true);
        return;
      }
      const data = await res.json();
      setItems(data.items || []);
      setNewCount(data.newCount || 0);
    } catch (error) {
      console.error('Failed to fetch admin feedback:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, status: FeedbackStatus) {
    const previous = items.find((i) => i.id === id)?.status;
    if (!previous) return;

    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    if (selected?.id === id) setSelected((prev) => (prev ? { ...prev, status } : prev));
    if (status === 'new') setNewCount((c) => c + 1);
    if (previous === 'new' && status !== 'new') setNewCount((c) => Math.max(0, c - 1));

    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('failed');
    } catch (error) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: previous } : i)));
      if (selected?.id === id) setSelected((prev) => (prev ? { ...prev, status: previous } : prev));
      alert('상태를 변경하지 못했어요. 다시 시도해주세요.');
    }
  }

  if (forbidden) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-gray-500">접근 권한이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">사용자 접수</h1>
        {newCount > 0 && (
          <span className="badge-danger">신규 {newCount}건</span>
        )}
      </div>

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 flex-shrink-0">
            {(['all', 'feature_request', 'support_issue'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 text-sm rounded-md transition ${
                  typeFilter === t ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'all' ? '전체' : TYPE_LABEL[t]}
              </button>
            ))}
          </div>

          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 flex-shrink-0">
            {(['all', 'new', 'in_review', 'done'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-sm rounded-md transition ${
                  statusFilter === s ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {s === 'all' ? '전체' : STATUS_LABEL[s]}
              </button>
            ))}
          </div>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이메일 또는 제목 검색"
            aria-label="이메일 또는 제목 검색"
            className="input-search flex-1"
          />
        </div>
      </Card>

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-16 bg-gray-200 rounded-lg" />
          <div className="h-16 bg-gray-200 rounded-lg" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <p className="text-center py-12 text-gray-500">접수된 내용이 없어요.</p>
        </Card>
      ) : (
        <Card padding="none">
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(item)}
                className="w-full text-left p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4"
              >
                <div className="min-w-0 sm:flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`badge ${item.type === 'support_issue' ? 'badge-primary' : 'badge-gray'}`}>
                      {TYPE_LABEL[item.type]}
                    </span>
                    <span className="text-xs text-gray-400">{item.category}</span>
                    <span className={`badge ${STATUS_BADGE[item.status]}`}>{STATUS_LABEL[item.status]}</span>
                  </div>
                  <p className="font-medium text-gray-900 break-words">
                    {item.title || item.content.slice(0, 40)}
                  </p>
                  <p className="text-sm text-gray-500 break-words">
                    {item.userName ? `${item.userName} · ` : ''}{item.userEmail}
                  </p>
                </div>
                <p className="text-xs text-gray-400 sm:flex-shrink-0 sm:whitespace-nowrap">
                  {formatDateTime(item.createdAt)}
                </p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {selected && (
        <Modal isOpen onClose={() => setSelected(null)} title={selected.title || TYPE_LABEL[selected.type]} size="lg">
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`badge ${selected.type === 'support_issue' ? 'badge-primary' : 'badge-gray'}`}>
                {TYPE_LABEL[selected.type]}
              </span>
              <span className="badge-gray">{selected.category}</span>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-gray-500">회원 이름</dt>
                <dd className="text-gray-900">{selected.userName || '-'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">회원 이메일</dt>
                <dd className="text-gray-900 break-all">{selected.userEmail}</dd>
              </div>
              <div>
                <dt className="text-gray-500">접수 시간</dt>
                <dd className="text-gray-900">{formatDateTime(selected.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">접수 당시 페이지</dt>
                <dd className="text-gray-900 break-all">{selected.pagePath || '-'}</dd>
              </div>
            </dl>

            <div>
              <p className="label">내용</p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap break-words">
                {selected.content}
              </div>
            </div>

            <div>
              <p className="label">처리 상태</p>
              <div className="flex gap-2 flex-wrap">
                {(['new', 'in_review', 'done'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleStatusChange(selected.id, s)}
                    aria-pressed={selected.status === s}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                      selected.status === s
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {selected.status === s && (
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                        <path d="M4 10.5l3.5 3.5L16 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

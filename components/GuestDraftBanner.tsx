'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from './Card';
import Button from './Button';
import { calculateTotal } from '@/lib/utils';
import { loadGuestDraft, clearGuestDraft, GuestQuoteDraft } from '@/lib/guestDraft';

/**
 * Shown on the dashboard for a logged-in user who has a leftover guest
 * quote draft in localStorage (from /try, before they signed up). Saving
 * is one explicit click that reuses the normal authenticated /api/clients
 * + /api/deals endpoints exactly once, then clears the draft so it can't
 * be saved twice.
 */
export default function GuestDraftBanner() {
  const router = useRouter();
  const [draft, setDraft] = useState<GuestQuoteDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setDraft(loadGuestDraft());
  }, []);

  if (!draft) return null;

  const hasContent = draft.lineItems.some((i) => i.name.trim()) || draft.clientName.trim() || draft.clientCompany.trim();
  if (!hasContent) return null;

  async function handleDiscard() {
    clearGuestDraft();
    setDraft(null);
  }

  async function handleSave() {
    if (!draft || saving) return;
    setSaving(true);
    setError('');
    try {
      const clientRes = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerType: '개인',
          name: draft.clientName || draft.clientCompany,
          company: draft.clientCompany || undefined,
        }),
      });
      if (!clientRes.ok) throw new Error('client failed');
      const client = await clientRes.json();

      const calc = calculateTotal(draft.lineItems, 0, '별도');
      const dealRes = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          type: 'quote',
          status: '초안',
          issueDate: draft.issueDate,
          lineItems: draft.lineItems,
          discount: 0,
          vatMode: '별도',
          totalAmount: calc.total,
        }),
      });
      if (!dealRes.ok) throw new Error('deal failed');
      const deal = await dealRes.json();

      clearGuestDraft();
      setDraft(null);
      router.push(`/deals/${deal.id}/quote`);
    } catch (err) {
      setError('저장하지 못했어요. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card padding="none" className="mb-8 overflow-hidden border-primary-200">
      <div className="p-6">
        <h2 className="font-semibold text-gray-900 mb-1">체험 중 작성하신 견적서가 있어요</h2>
        <p className="text-sm text-gray-500 mb-4">계정에 저장하면 고객 목록과 문서함에서 계속 관리할 수 있어요.</p>
        {error && <p role="alert" className="text-sm text-danger-700 mb-3">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : '계정에 저장하기'}
          </Button>
          <Button variant="secondary" onClick={handleDiscard} disabled={saving}>
            저장 안 함
          </Button>
        </div>
      </div>
    </Card>
  );
}

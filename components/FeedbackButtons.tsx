'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Modal from './Modal';
import Button from './Button';
import {
  FeedbackType,
  FEATURE_REQUEST_CATEGORIES,
  SUPPORT_ISSUE_CATEGORIES,
} from '@/lib/types';

interface FormState {
  category: string;
  title: string;
  content: string;
}

const EMPTY_FORM: FormState = { category: '', title: '', content: '' };

const CONFIG: Record<
  FeedbackType,
  {
    modalTitle: string;
    intro: string;
    categories: readonly string[];
    categoryLabel: string;
    hasTitle: boolean;
    contentLabel: string;
    contentMin: number;
    contentMax: number;
    successMessage: string;
  }
> = {
  feature_request: {
    modalTitle: '서비스 의견 보내기',
    intro: '견적함에 바라는 기능이나 개선 의견을 알려주세요.',
    categories: FEATURE_REQUEST_CATEGORIES,
    categoryLabel: '유형',
    hasTitle: false,
    contentLabel: '요청사항',
    contentMin: 10,
    contentMax: 2000,
    successMessage:
      '소중한 의견을 보내주셔서 감사합니다. 남겨주신 내용을 꼼꼼히 검토해 앞으로 더 편리한 견적함을 만드는 데 반영하겠습니다.',
  },
  support_issue: {
    modalTitle: '1:1 불편사항 접수',
    intro:
      '사용 중 불편하거나 정상적으로 동작하지 않는 부분을 알려주세요. 별도로 이메일을 보내지 않아도 운영자가 확인할 수 있습니다.',
    categories: SUPPORT_ISSUE_CATEGORIES,
    categoryLabel: '문제 유형',
    hasTitle: true,
    contentLabel: '자세한 내용',
    contentMin: 10,
    contentMax: 3000,
    successMessage: '불편사항이 접수되었습니다. 회원 정보와 함께 안전하게 저장되며, 운영자가 내용을 확인하겠습니다.',
  },
};

function FeedbackModal({ type, onClose }: { type: FeedbackType; onClose: () => void }) {
  const pathname = usePathname();
  const cfg = CONFIG[type];
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    if (!cfg.categories.includes(form.category)) {
      setError(`${cfg.categoryLabel}을(를) 선택해주세요.`);
      return;
    }
    if (cfg.hasTitle && !form.title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    const contentLen = form.content.trim().length;
    if (contentLen < cfg.contentMin || contentLen > cfg.contentMax) {
      setError(`${cfg.contentLabel}은 ${cfg.contentMin}~${cfg.contentMax}자 사이로 입력해주세요.`);
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          category: form.category,
          title: cfg.hasTitle ? form.title.trim() : undefined,
          content: form.content.trim(),
          pagePath: pathname,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error);
      }
      setForm(EMPTY_FORM);
      setSuccess(true);
    } catch (err) {
      setError('접수하지 못했어요. 내용을 유지했으니 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setSuccess(false);
    setError('');
    onClose();
  }

  return (
    <Modal isOpen onClose={handleClose} title={cfg.modalTitle} size="md">
      {success ? (
        <div className="py-2 space-y-4">
          <div className="flex items-start gap-3 bg-success-50 border border-success-200 rounded-lg p-4">
            <svg className="h-5 w-5 text-success-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-gray-800">{cfg.successMessage}</p>
          </div>
          <Button onClick={handleClose} fullWidth>확인</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">{cfg.intro}</p>

          {error && (
            <p role="alert" className="text-sm text-danger-700 bg-danger-50 border border-danger-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label htmlFor={`${type}-category`} className="label">{cfg.categoryLabel} *</label>
            <select
              id={`${type}-category`}
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input"
            >
              <option value="" disabled>선택해주세요</option>
              {cfg.categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {cfg.hasTitle && (
            <div>
              <label htmlFor={`${type}-title`} className="label">불편사항 제목 *</label>
              <input
                id={`${type}-title`}
                type="text"
                required
                maxLength={100}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input"
                placeholder="예: PDF 다운로드가 안 돼요"
              />
              <p className="mt-1 text-xs text-gray-400">{form.title.length}/100자</p>
            </div>
          )}

          <div>
            <label htmlFor={`${type}-content`} className="label">{cfg.contentLabel} *</label>
            <textarea
              id={`${type}-content`}
              required
              rows={5}
              minLength={cfg.contentMin}
              maxLength={cfg.contentMax}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="input"
              placeholder={type === 'feature_request' ? '어떤 기능이 있으면 좋을지 자유롭게 적어주세요.' : '언제, 어떤 상황에서 문제가 발생했는지 적어주시면 확인에 도움이 돼요.'}
            />
            <p className="mt-1 text-xs text-gray-400">
              {form.content.trim().length}/{cfg.contentMax}자 (최소 {cfg.contentMin}자)
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose} fullWidth disabled={submitting}>
              취소
            </Button>
            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? '접수 중...' : '접수하기'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default function FeedbackButtons() {
  const [open, setOpen] = useState<FeedbackType | null>(null);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">도움 및 의견</h2>
      <p className="text-sm text-gray-500 mb-4">견적함을 더 좋게 만들 의견이나, 사용 중 겪은 불편함을 알려주세요.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setOpen('feature_request')}
          className="text-left p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/40 transition-colors"
        >
          <p className="font-medium text-gray-900">💡 서비스 의견 보내기</p>
          <p className="text-xs text-gray-500 mt-1">기능 제안, 개선 요청, 아이디어를 자유롭게 남겨주세요.</p>
        </button>

        <button
          type="button"
          onClick={() => setOpen('support_issue')}
          className="text-left p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/40 transition-colors"
        >
          <p className="font-medium text-gray-900">🛠️ 1:1 불편사항 접수</p>
          <p className="text-xs text-gray-500 mt-1">오류, 데이터 문제 등 겪은 문제를 운영자에게 직접 접수해요.</p>
        </button>
      </div>

      {open && <FeedbackModal type={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

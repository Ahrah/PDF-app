'use client';

import { Deal, DealStatus } from '@/lib/types';

interface DealStatusControlsProps {
  deal: Deal;
  onStatusChange: (dealId: string, status: DealStatus) => void;
}

function StatusCheckbox({
  label,
  checked,
  disabled,
  onClick,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) onClick();
      }}
      disabled={disabled}
      aria-pressed={checked}
      title={disabled ? '입금 완료 상태에서는 해제할 수 없어요.' : undefined}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
        checked
          ? 'bg-primary-600 border-primary-600 text-white'
          : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
      } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      <span
        className={`flex items-center justify-center w-3.5 h-3.5 rounded-sm border flex-shrink-0 ${
          checked ? 'border-white' : 'border-gray-400'
        }`}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 20 20" fill="none">
            <path d="M4 10.5l3.5 3.5L16 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}

/**
 * 초안 / 발송함 / 입금 완료 is a single status field, not independent flags —
 * checking 입금 완료 jumps straight there (발송 완료로 간주), and unchecking
 * it drops back to 발송함, never all the way to 초안.
 */
export default function DealStatusControls({ deal, onStatusChange }: DealStatusControlsProps) {
  const sent = deal.status !== '초안';
  const paid = deal.status === '입금 완료';

  return (
    <div
      className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100"
      onClick={(e) => e.stopPropagation()}
    >
      <StatusCheckbox
        label="발송 완료"
        checked={sent}
        disabled={paid}
        onClick={() => onStatusChange(deal.id, sent ? '초안' : '발송함')}
      />
      {deal.type === 'invoice' && (
        <StatusCheckbox
          label="입금 완료"
          checked={paid}
          onClick={() => onStatusChange(deal.id, paid ? '발송함' : '입금 완료')}
        />
      )}
    </div>
  );
}

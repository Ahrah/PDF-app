'use client';

import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { PRICING, formatMonthlyPrice } from '@/lib/pricing';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCount: number;
}

export default function PaywallModal({ isOpen, onClose, currentCount }: PaywallModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleNotify = async () => {
    if (!email) {
      setMessage('이메일을 입력해주세요.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ 출시 알림 신청이 완료되었습니다!');
        setTimeout(() => {
          onClose();
          setEmail('');
          setMessage('');
        }, 2000);
      } else {
        setMessage(data.error || '오류가 발생했습니다.');
      }
    } catch (error) {
      setMessage('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="무료 한도 초과" size="md">
      <div className="space-y-4">
        <div className="text-center py-2">
          <p className="text-lg text-gray-900 mb-2">
            무료 {PRICING.FREE_TIER_MONTHLY_LIMIT}건까지 사용 가능하며,<br />
            이후에는 {formatMonthlyPrice()}입니다.
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">
            이번 달 사용량: <span className="font-semibold">{currentCount}/{PRICING.FREE_TIER_MONTHLY_LIMIT}건</span>
          </p>
          <p className="text-sm text-gray-500">
            한 거래 건에는 견적서와 청구서가 함께 포함됩니다.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">프리미엄 혜택</h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              워터마크 제거
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              로고 및 브랜드 색상
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              문서번호 자동 생성
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              입금 상태 추적 및 검색
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              무제한 거래 건
            </li>
          </ul>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            출시 알림 받기
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 주소를 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-2"
            disabled={loading}
          />
          {message && (
            <p className={`text-sm mb-2 ${message.startsWith('✅') ? 'text-success-600' : 'text-danger-600'}`}>
              {message}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} fullWidth disabled={loading}>
            나중에 보기
          </Button>
          <Button onClick={handleNotify} fullWidth disabled={loading}>
            {loading ? '처리중...' : '출시 알림 받기'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

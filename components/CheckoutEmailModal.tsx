'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import { initiateCheckout, PREMIUM_CHECKOUT_URL } from '@/lib/checkout';
import { useAuth } from '@/lib/auth-context';

interface CheckoutEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutEmailModal({ isOpen, onClose }: CheckoutEmailModalProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('이메일을 입력해 주세요.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('올바른 이메일 형식을 입력해 주세요.');
      return;
    }

    setLoading(true);

    try {
      const paymentUrl = await initiateCheckout(trimmedEmail, user?.displayName);
      window.location.href = paymentUrl;
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      if (errorMessage.includes('not configured')) {
        window.open(PREMIUM_CHECKOUT_URL, '_blank', 'noopener,noreferrer');
        onClose();
      } else {
        setError(errorMessage || '결제 페이지로 이동하는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setEmail(user?.email || '');
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="프리미엄 구매하기" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-900 font-semibold mb-2">
            ⚠️ 중요: 이메일 확인
          </p>
          <p className="text-sm text-amber-900 mb-2">
            아래 입력하는 <strong>이메일</strong>은 견적함 아이디(로그인 이메일)와 
            <strong className="text-amber-800"> 반드시 동일</strong>해야 합니다.
          </p>
          <p className="text-sm text-amber-900">
            이메일이 다르면 프리미엄이 자동으로 연결되지 않습니다.
          </p>
        </div>

        <div>
          <label htmlFor="checkout-email" className="block text-sm font-medium text-gray-700 mb-2">
            견적함 아이디 이메일
          </label>
          <input
            id="checkout-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="input w-full"
            required
            disabled={loading}
            autoFocus={!user?.email}
          />
          {user?.email && (
            <p className="mt-2 text-sm text-gray-600">
              현재 로그인된 아이디: <span className="font-semibold break-all">{user.email}</span>
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleCancel} 
            fullWidth
            disabled={loading}
          >
            취소
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            fullWidth
            disabled={loading}
          >
            {loading ? '처리 중...' : '결제창으로 이동'}
          </Button>
        </div>

        <p className="text-xs text-center text-gray-500">
          스텝페이의 안전한 결제 페이지로 이동합니다
        </p>
      </form>
    </Modal>
  );
}

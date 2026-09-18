'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { SellerInfo } from '@/lib/types';
import { validateBusinessNumber, formatBusinessNumber } from '@/lib/utils';

export default function SettingsPage() {
  const [seller, setSeller] = useState<SellerInfo>({
    name: '',
    businessName: '',
    email: '',
    phone: '',
    bankAccount: '',
    businessNumber: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSeller();
  }, []);

  async function fetchSeller() {
    try {
      const res = await fetch('/api/seller');
      const data = await res.json();
      if (data) {
        setSeller(data);
      }
    } catch (error) {
      console.error('Failed to fetch seller:', error);
    } finally {
      setLoading(false);
    }
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!seller.name.trim()) {
      newErrors.name = '이름을 입력해 주세요.';
    }

    if (!seller.email.trim()) {
      newErrors.email = '이메일을 입력해 주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(seller.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (!seller.phone.trim()) {
      newErrors.phone = '연락처를 입력해 주세요.';
    }

    if (!seller.bankAccount.trim()) {
      newErrors.bankAccount = '입금계좌를 입력해 주세요.';
    }

    if (seller.businessNumber && !validateBusinessNumber(seller.businessNumber)) {
      newErrors.businessNumber = '사업자번호 형식을 확인해 주세요. (10자리 숫자)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/seller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seller),
      });

      if (res.ok) {
        alert('설정을 저장했습니다.');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      alert('저장하지 못했어요. 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">설정</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">기본 정보</h2>
          <div className="space-y-4">
            <div>
              <label className="label">이름 *</label>
              <input
                type="text"
                required
                value={seller.name}
                onChange={(e) => setSeller({ ...seller, name: e.target.value })}
                className={errors.name ? 'input-error' : 'input'}
              />
              {errors.name && <p className="mt-1 text-sm text-danger-600">{errors.name}</p>}
            </div>

            <div>
              <label className="label">상호 (선택)</label>
              <input
                type="text"
                value={seller.businessName || ''}
                onChange={(e) => setSeller({ ...seller, businessName: e.target.value })}
                className="input"
                placeholder="사업자명 또는 브랜드명"
              />
            </div>

            <div>
              <label className="label">이메일 *</label>
              <input
                type="email"
                required
                value={seller.email}
                onChange={(e) => setSeller({ ...seller, email: e.target.value })}
                className={errors.email ? 'input-error' : 'input'}
              />
              {errors.email && <p className="mt-1 text-sm text-danger-600">{errors.email}</p>}
            </div>

            <div>
              <label className="label">연락처 *</label>
              <input
                type="tel"
                required
                value={seller.phone}
                onChange={(e) => setSeller({ ...seller, phone: e.target.value })}
                className={errors.phone ? 'input-error' : 'input'}
                placeholder="010-1234-5678"
              />
              {errors.phone && <p className="mt-1 text-sm text-danger-600">{errors.phone}</p>}
            </div>

            <div>
              <label className="label">입금계좌 *</label>
              <input
                type="text"
                required
                value={seller.bankAccount}
                onChange={(e) => setSeller({ ...seller, bankAccount: e.target.value })}
                className={errors.bankAccount ? 'input-error' : 'input'}
                placeholder="국민은행 123-456-789012"
              />
              {errors.bankAccount && <p className="mt-1 text-sm text-danger-600">{errors.bankAccount}</p>}
              <p className="mt-1 text-sm text-gray-500">청구서에 표시됩니다</p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">사업자 정보 (선택)</h2>
          <div className="space-y-4">
            <div>
              <label className="label">사업자등록번호</label>
              <input
                type="text"
                value={seller.businessNumber || ''}
                onChange={(e) => setSeller({ ...seller, businessNumber: e.target.value })}
                className={errors.businessNumber ? 'input-error' : 'input'}
                placeholder="123-45-67890"
              />
              {errors.businessNumber && <p className="mt-1 text-sm text-danger-600">{errors.businessNumber}</p>}
              <p className="mt-1 text-sm text-gray-500">10자리 숫자</p>
            </div>

            <div>
              <label className="label">사업장 주소</label>
              <input
                type="text"
                value={seller.address || ''}
                onChange={(e) => setSeller({ ...seller, address: e.target.value })}
                className="input"
              />
            </div>
          </div>
        </Card>

        <Card className="bg-gray-50 border-gray-300">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">프리미엄 기능 🔒</h2>
          <div className="space-y-4 opacity-60">
            <div>
              <label className="label">로고</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-sm text-gray-600">로고와 브랜드 색은 프리미엄에서 사용할 수 있어요.</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-50">
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              <strong>개인정보 보호:</strong> 주민등록번호·카드번호는 받지 않아요.
            </p>
            <p className="text-sm text-gray-700">
              <strong>고지:</strong> 본 문서는 거래용 견적서·청구서이며, 전자세금계산서가 아닙니다. 세금계산서는 홈택스에서 별도로 발급해주세요.
            </p>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import FeedbackButtons from '@/components/FeedbackButtons';
import { SellerInfo } from '@/lib/types';
import { validateBusinessNumber, autoFormatBusinessNumber } from '@/lib/utils';

export default function SettingsPage() {
  const [seller, setSeller] = useState<SellerInfo>({
    userId: '',
    name: '',
    businessName: '',
    businessType: '',
    businessItem: '',
    email: '',
    phone: '',
    bankAccount: '',
    businessNumber: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDemo, setIsDemo] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    fetchSeller();
  }, []);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('새 비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || '비밀번호를 변경하지 못했습니다.');
        return;
      }
      setPasswordSuccess('비밀번호가 변경되었습니다.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPasswordError('네트워크 오류가 발생했습니다.');
    } finally {
      setPasswordSaving(false);
    }
  }

  async function fetchSeller() {
    try {
      const res = await fetch('/api/seller');
      const data = await res.json();
      if (data) {
        setSeller(data);
        setIsDemo(data.businessName?.includes('(데모)') || false);
      }
    } catch (error) {
      console.error('Failed to fetch seller:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSeed() {
    if (!confirm('데모 데이터를 생성하면 기존 데이터가 모두 삭제됩니다. 계속하시겠습니까?')) {
      return;
    }
    
    setSeedLoading(true);
    try {
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' }),
      });
      
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        window.location.reload();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('데모 데이터 생성에 실패했습니다.');
    } finally {
      setSeedLoading(false);
    }
  }

  async function handleReset() {
    if (!confirm('모든 데이터를 삭제합니다. 복구할 수 없습니다. 계속하시겠습니까?')) {
      return;
    }
    
    setSeedLoading(true);
    try {
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        window.location.reload();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('데이터 초기화에 실패했습니다.');
    } finally {
      setSeedLoading(false);
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

      {isDemo && (
        <Card className="mb-6 bg-warning-50 border-warning-300">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-warning-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold text-warning-900">데모 데이터 사용 중</p>
              <p className="text-sm text-warning-700 mt-1">현재 데모 데이터로 앱을 체험하고 있습니다. 실제 데이터를 입력하려면 아래에서 초기화하세요.</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">데모 데이터 관리</h2>
        <p className="text-sm text-gray-600 mb-4">
          앱을 처음 사용하시나요? 데모 데이터를 생성하면 예시 고객과 견적서가 자동으로 만들어집니다.
        </p>
        <div className="flex space-x-3">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleSeed}
            disabled={seedLoading}
          >
            {seedLoading ? '생성 중...' : '데모 데이터 생성'}
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleReset}
            disabled={seedLoading}
          >
            {seedLoading ? '초기화 중...' : '모든 데이터 초기화'}
          </Button>
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">비밀번호 변경</h2>
        {passwordError && (
          <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg">
            <p className="text-sm text-danger-700">{passwordError}</p>
          </div>
        )}
        {passwordSuccess && (
          <div className="mb-4 p-3 bg-success-50 border border-success-200 rounded-lg">
            <p className="text-sm text-success-700">{passwordSuccess}</p>
          </div>
        )}
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="label">현재 비밀번호</label>
            <input
              type="password"
              required
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="input"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">새 비밀번호</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="input"
                placeholder="6자 이상"
              />
            </div>
            <div>
              <label className="label">새 비밀번호 확인</label>
              <input
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="input"
              />
            </div>
          </div>
          <Button type="submit" variant="secondary" disabled={passwordSaving}>
            {passwordSaving ? '변경 중...' : '비밀번호 변경'}
          </Button>
        </form>
      </Card>

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
                inputMode="tel"
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
                onChange={(e) => {
                  setSeller({ ...seller, businessNumber: autoFormatBusinessNumber(e.target.value) });
                }}
                className={errors.businessNumber ? 'input-error' : 'input'}
                placeholder="123-45-67890"
                inputMode="numeric"
              />
              {errors.businessNumber && <p className="mt-1 text-sm text-danger-600">{errors.businessNumber}</p>}
              <p className="mt-1 text-sm text-gray-500">숫자만 입력하면 자동으로 123-45-67890 형식으로 입력돼요.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">업태 (선택)</label>
                <input
                  type="text"
                  value={seller.businessType || ''}
                  onChange={(e) => setSeller({ ...seller, businessType: e.target.value })}
                  className="input"
                  placeholder="예: 서비스업"
                />
              </div>
              <div>
                <label className="label">종목 (선택)</label>
                <input
                  type="text"
                  value={seller.businessItem || ''}
                  onChange={(e) => setSeller({ ...seller, businessItem: e.target.value })}
                  className="input"
                  placeholder="예: 시각디자인"
                />
              </div>
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

      <Card className="mt-6">
        <FeedbackButtons />
      </Card>
    </div>
  );
}

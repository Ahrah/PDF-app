'use client';

import { useState } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 30);
  const formattedEndDate = trialEndDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    if (!agreed) {
      setError('이용약관 및 개인정보처리방침에 동의해주세요.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '회원가입에 실패했습니다.');
        setLoading(false);
        return;
      }

      // Full navigation (not router.push) so AuthProvider remounts and
      // picks up the new session cookie immediately.
      window.location.href = '/';
    } catch (err) {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/" className="text-primary-600 hover:text-primary-700 inline-flex items-center">
          ← 홈으로
        </Link>
      </div>

      <Card>
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">회원가입</h1>
          <p className="text-gray-600">견적함에 오신 것을 환영합니다</p>
        </div>

        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-primary-900 mb-2">30일 무료 체험</h3>
          <ul className="text-sm text-primary-800 space-y-1">
            <li>• <strong>체험 기간:</strong> 가입일로부터 30일 ({formattedEndDate}까지)</li>
            <li>• <strong>체험 혜택:</strong> 무제한 문서 생성, 워터마크 제거</li>
            <li>• <strong>체험 종료 후:</strong> 월 3건 무료 + 워터마크 포함</li>
            <li>• <strong>프리미엄:</strong> 월 9,900원으로 계속 무제한 이용</li>
          </ul>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="6자 이상"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="비밀번호 재입력"
              required
            />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">개인정보 수집 및 이용</h4>
            <p className="text-xs text-gray-600 mb-2">
              • <strong>수집 목적:</strong> 회원 가입, 서비스 제공, 무료 체험 기간 관리
            </p>
            <p className="text-xs text-gray-600 mb-2">
              • <strong>수집 항목:</strong> 이메일, 비밀번호(암호화 저장)
            </p>
            <p className="text-xs text-gray-600 mb-2">
              • <strong>보관 기간:</strong> 회원 탈퇴 시까지
            </p>
            <p className="text-xs text-gray-600">
              자세한 내용은 <Link href="/privacy" className="text-primary-600 hover:underline">개인정보처리방침</Link>을 참고하세요.
            </p>
          </div>

          <div className="flex items-start">
            <input
              id="agreed"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1"
            />
            <label htmlFor="agreed" className="ml-2 text-sm text-gray-700">
              <Link href="/terms" className="text-primary-600 hover:underline">이용약관</Link> 및{' '}
              <Link href="/privacy" className="text-primary-600 hover:underline">개인정보처리방침</Link>에 동의합니다.
            </label>
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? '가입 중...' : '회원가입'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              로그인
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            ⚠️ 본 서비스는 결제 기능이 없습니다. 30일 체험 종료 후 자동 결제되지 않으며, 월 3건 무료 플랜으로 전환됩니다.
          </p>
        </div>
      </Card>
    </div>
  );
}

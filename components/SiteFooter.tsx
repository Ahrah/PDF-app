'use client';

import Link from 'next/link';

/**
 * Site footer with business information for the seller (취미상점).
 * All real values must come from environment variables or config.
 * NEVER fabricate real-looking registration numbers, phone numbers, or emails.
 */

const BUSINESS_INFO = {
  name: process.env.NEXT_PUBLIC_BUSINESS_NAME || '취미상점',
  owner: process.env.NEXT_PUBLIC_BUSINESS_OWNER || '[대표자명]',
  registrationNumber: process.env.NEXT_PUBLIC_BUSINESS_REGISTRATION_NUMBER || '[사업자등록번호]',
  ecommerceNumber: process.env.NEXT_PUBLIC_ECOMMERCE_REGISTRATION_NUMBER || '[통신판매업신고번호]',
  address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || '[사업장 주소]',
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || '[이메일]',
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '[전화번호]',
};

export default function SiteFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">견적함</h3>
            <p className="text-sm text-gray-600 mb-2">
              프리랜서를 위한 간편한 견적서 및 청구서 관리 도구
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">링크</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pricing" className="text-gray-600 hover:text-primary-600">
                  요금제
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-primary-600">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-primary-600">
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">사업자 정보</h3>
            <dl className="space-y-1 text-sm text-gray-600">
              <div>
                <dt className="inline font-medium">상호: </dt>
                <dd className="inline">{BUSINESS_INFO.name}</dd>
              </div>
              <div>
                <dt className="inline font-medium">대표자: </dt>
                <dd className="inline">{BUSINESS_INFO.owner}</dd>
              </div>
              <div>
                <dt className="inline font-medium">사업자등록번호: </dt>
                <dd className="inline">{BUSINESS_INFO.registrationNumber}</dd>
              </div>
              <div>
                <dt className="inline font-medium">통신판매업신고번호: </dt>
                <dd className="inline">{BUSINESS_INFO.ecommerceNumber}</dd>
              </div>
              <div>
                <dt className="inline font-medium">주소: </dt>
                <dd className="inline">{BUSINESS_INFO.address}</dd>
              </div>
              <div>
                <dt className="inline font-medium">이메일: </dt>
                <dd className="inline">{BUSINESS_INFO.email}</dd>
              </div>
              <div>
                <dt className="inline font-medium">전화번호: </dt>
                <dd className="inline">{BUSINESS_INFO.phone}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} {BUSINESS_INFO.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

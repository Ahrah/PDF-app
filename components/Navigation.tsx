'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

// Sized via explicit width/height attributes rather than Tailwind classes —
// these are SVG icons rendered before the app's own CSS can be relied on to
// constrain them, so intrinsic sizing must not depend on a utility class
// surviving the production CSS build.
interface IconProps {
  size?: number;
  className?: string;
}

function HomeIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9.5L10 3l7 6.5M4.5 8v8a1 1 0 001 1h3v-4.5h3V17h3a1 1 0 001-1V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UsersIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7.5" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2.5 17c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M13 8.5a2.5 2.5 0 100-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12.5 12.1c2.2.4 3.9 2.3 3.9 4.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M10 2.7v1.8M10 15.5v1.8M17.3 10h-1.8M4.5 10H2.7M15.1 4.9l-1.27 1.27M6.16 13.84L4.9 15.1M15.1 15.1l-1.27-1.27M6.16 6.16L4.9 4.9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Navigation() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  const links = [
    { href: '/', label: '홈', Icon: HomeIcon },
    { href: '/clients', label: '고객', Icon: UsersIcon },
    { href: '/settings', label: '설정', Icon: SettingsIcon },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-semibold tracking-tight text-gray-900">
                견적함
              </Link>
            </div>
            {user && (
              <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
                {links.map(({ href, label, Icon }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`inline-flex items-center gap-1.5 px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'border-primary-600 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <Icon size={18} />
                      {label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <>
                    <span className="hidden sm:inline text-sm text-gray-500">{user.email}</span>
                    <button
                      onClick={logout}
                      className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      로그아웃
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      로그인
                    </Link>
                    <Link
                      href="/signup"
                      className="text-sm font-medium bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      무료로 시작하기
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {user && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {links.map(({ href, label, Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 pl-3 pr-4 py-2 border-l-2 text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 border-primary-600 text-primary-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Icon size={20} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { AuthProvider } from "@/lib/auth-context";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

const SITE_URL = "https://pdf-app-dusky.vercel.app";
const TITLE = "견적함 | 프리랜서 견적·청구서";
const DESCRIPTION = "견적서를 PDF로 만들고, 청구서와 입금 상태를 한곳에서 관리하세요.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "견적함",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>
        <AuthProvider>
          <Navigation />
          <main className="min-h-dvh bg-gray-50">
            {children}
          </main>
          <footer className="bg-white border-t border-gray-200 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <p className="text-sm text-gray-500 text-center">
                본 문서는 거래용 견적서·청구서이며, 전자세금계산서가 아닙니다. 세금계산서는 홈택스에서 별도로 발급해주세요.
              </p>
              <div className="mt-4 flex justify-center space-x-6 text-sm text-gray-500">
                <Link href="/pricing">요금제</Link>
                <Link href="/privacy">개인정보처리방침</Link>
                <Link href="/terms">이용약관</Link>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-500 text-center space-y-1">
                <p>
                  <strong>상호명:</strong> 취미상점 | <strong>대표자:</strong> {process.env.NEXT_PUBLIC_BUSINESS_OWNER || '[대표자명]'}
                </p>
                <p>
                  <strong>사업자등록번호:</strong> {process.env.NEXT_PUBLIC_BUSINESS_NUMBER || '[사업자등록번호]'} | 
                  <strong> 통신판매업신고번호:</strong> {process.env.NEXT_PUBLIC_COMMERCE_NUMBER || '[통신판매업신고번호]'}
                </p>
                <p>
                  <strong>전화:</strong> 010-5308-6879 | 
                  <strong> 이메일:</strong> {process.env.NEXT_PUBLIC_CONTACT_EMAIL || '[이메일]'}
                </p>
                <p>
                  <strong>주소:</strong> {process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || '[사업장 주소]'}
                </p>
                <p className="mt-2 text-gray-400">
                  환불정책: {process.env.NEXT_PUBLIC_REFUND_POLICY_URL ? (
                    <Link href={process.env.NEXT_PUBLIC_REFUND_POLICY_URL} className="underline">환불정책 보기</Link>
                  ) : '[환불정책]'}
                </p>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}

import Link from "next/link";

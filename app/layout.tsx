import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "견적함 - 프리랜서 견적서/청구서",
  description: "프리랜서를 위한 간편한 견적서 및 청구서 관리 도구",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Navigation />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-sm text-gray-500 text-center">
              본 문서는 거래용 견적서·청구서이며, 전자세금계산서가 아닙니다. 세금계산서는 홈택스에서 별도로 발급해주세요.
            </p>
            <div className="mt-4 flex justify-center space-x-6 text-sm text-gray-500">
              <Link href="/privacy">개인정보처리방침</Link>
              <Link href="/terms">이용약관</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

import Link from "next/link";

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
                <Link href="/privacy">개인정보처리방침</Link>
                <Link href="/terms">이용약관</Link>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}

import Link from "next/link";

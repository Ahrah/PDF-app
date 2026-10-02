import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navigation from "@/components/Navigation";
import SiteFooter from "@/components/SiteFooter";
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
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <Navigation />
          <main className="flex-1 bg-gray-50">
            {children}
          </main>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}

import Link from "next/link";

import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Pretendard(가변 폰트)를 next/font/local로 자체 호스팅 — 외부 CDN 의존 없이
// 안정적으로 서빙되고, Next.js가 자동으로 preload/font-display를 최적화한다.
const pretendard = localFont({
  src: "../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Vercel이 배포마다 자동으로 주입하는 값 — OG/트위터 이미지 절대 URL을 올바르게
// 만들기 위함(로컬에서는 localhost로 대체). 별도 환경변수 설정 불필요.
const siteUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ZEN-A | 함께 발견하는 공구",
  description: "뷰티·패션 인플루언서 공동구매 검색·아카이브 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

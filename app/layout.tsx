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

const title = "ZEN-A | 함께 발견하는 공구";
const description = "뷰티·패션 인플루언서 공동구매 검색·아카이브 서비스";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  // openGraph/twitter를 명시하지 않으면 title/description만으로는 og:title 등이
  // 자동 생성되지 않는다. 이미지는 app/opengraph-image.tsx(1200x630, 파일
  // 컨벤션)가 자동으로 채워주므로 여기선 title/description/type만 지정.
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "ZEN-A",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
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

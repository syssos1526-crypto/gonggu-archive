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

// VERCEL_URL은 "이번 배포"의 해시 URL이라 Deployment Protection에 걸려
// 카카오톡 등 외부 크롤러가 og:image를 못 가져온다(302 → vercel.com SSO 로그인
// 페이지로 리다이렉트되는 것을 실측 확인함). VERCEL_PROJECT_PRODUCTION_URL은
// 프로젝트의 고정 프로덕션 도메인(gonggu-archive.vercel.app)이라 항상 공개
// 접근 가능 — 이걸 우선 사용하고, 없을 때만 VERCEL_URL/localhost로 대체.
// 둘 다 Vercel이 배포마다 자동 주입하는 값이라 별도 환경변수 설정 불필요.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

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

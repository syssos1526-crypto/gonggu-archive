import Link from 'next/link'
import type { ReactNode } from 'react'

// 로그인/회원가입 전용 최소 레이아웃 — 검색창·카테고리 내비가 있는 전체 헤더는
// 이 화면에서만 숨기고, 아이콘+ZEN-A 워드마크만 간결하게 노출한다.
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="px-5 py-6 sm:px-0">
        <div className="mx-auto flex max-w-[460px] items-center">
          <Link href="/" className="inline-flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/zen-a-icon.png"
              alt="ZEN-A"
              className="h-8 w-8 shrink-0 rounded-md object-cover"
            />
            <span className="text-base font-light tracking-[0.3em] text-primary">ZEN-A</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[460px] px-5 pb-20 pt-4 sm:px-0">{children}</main>
    </div>
  )
}

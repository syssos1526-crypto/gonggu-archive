import Link from 'next/link'
import type { ReactNode } from 'react'

// 관리자 전용 최소 레이아웃 — 공개 화면의 검색바/카테고리 내비 없이,
// 업무용으로 빠르게 훑고 입력할 수 있는 간결한 헤더만 둔다.
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-neutral-200 bg-white px-5 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-[0.2em] text-primary">ZEN-A</span>
            <span className="rounded-full bg-lavender/30 px-2 py-0.5 text-[11px] font-bold text-lavender-foreground">
              ADMIN
            </span>
          </Link>
          <Link href="/" className="text-xs font-medium text-neutral-500 hover:text-neutral-700">
            공개 사이트로
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8">{children}</main>
    </div>
  )
}

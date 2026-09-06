import Link from 'next/link'
import type { ReactNode } from 'react'

export type BottomNavKey = 'home' | 'search' | 'feed' | 'mypage'

const NAV_ITEMS: {
  key: BottomNavKey
  label: string
  href: string
  icon: (active: boolean) => ReactNode
}[] = [
  {
    key: 'home',
    label: '홈',
    href: '/',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path
          d="M4 11.5 12 4l8 7.5M6 9.8V20h5v-5.5h2V20h5V9.8"
          stroke="currentColor"
          strokeWidth={active ? 2.1 : 1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: 'search',
    label: '검색',
    href: '/search',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth={active ? 2.1 : 1.6} />
        <path d="M19.5 19.5 15.8 15.8" stroke="currentColor" strokeWidth={active ? 2.1 : 1.6} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'feed',
    label: '관심공구',
    href: '/feed',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path
          d="M12 20.5s-7-4.35-9.5-8.5C.9 8.9 2.3 5.5 5.5 5.5c1.9 0 3.4 1.1 4.5 2.6C11.1 6.6 12.6 5.5 14.5 5.5c3.2 0 4.6 3.4 3 6.5-2.5 4.15-9.5 8.5-9.5 8.5z"
          stroke="currentColor"
          strokeWidth={active ? 2.1 : 1.6}
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: 'mypage',
    label: '마이',
    href: '/mypage',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth={active ? 2.1 : 1.6} />
        <path
          d="M4.5 20c1.4-3.6 4.6-5.5 7.5-5.5s6.1 1.9 7.5 5.5"
          stroke="currentColor"
          strokeWidth={active ? 2.1 : 1.6}
          strokeLinecap="round"
        />
      </svg>
    ),
  },
]

// 모바일 전용 하단 고정 내비 — 데스크톱(sm 이상)에서는 기존 헤더/카테고리
// 내비만 쓰고 완전히 숨긴다. 서버 컴포넌트인 PageShell에서 현재 페이지가
// 무엇인지 activeNav prop으로 명시적으로 넘겨받아, 클라이언트 훅
// (usePathname 등) 없이도 활성 탭을 표시한다.
export function MobileBottomNav({ active }: { active?: BottomNavKey }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] sm:hidden"
      aria-label="주요 메뉴"
    >
      <ul className="flex items-stretch justify-between">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.key
          return (
            <li key={item.key} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold ${
                  isActive ? 'text-primary' : 'text-neutral-400'
                }`}
              >
                {item.icon(isActive)}
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

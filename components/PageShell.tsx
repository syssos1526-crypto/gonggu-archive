import type { ReactNode } from 'react'
import { SiteHeader } from '@/components/SiteHeader'
import { CategoryNav } from '@/components/CategoryNav'
import { MobileBottomNav, type BottomNavKey } from '@/components/MobileBottomNav'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { CategorySlug } from '@/lib/queries/category'

export async function PageShell({
  searchValue,
  activeCategory,
  activeNav,
  children,
}: {
  searchValue?: string
  activeCategory?: 'all' | CategorySlug
  activeNav?: BottomNavKey
  children: ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <>
      <SiteHeader searchValue={searchValue} userEmail={user?.email ?? null} />
      <CategoryNav active={activeCategory} />
      {/* w-full 필수: <body>가 flex flex-col이라 Fragment를 거쳐 main이 그
          직속 flex item이 되는데, mx-auto(가로 auto margin)가 cross-axis
          align-items:stretch를 무시하고 콘텐츠 크기로 줄어든 뒤 가운데
          정렬되게 만든다 — 그 결과 그리드 안 카드 내용물(이미지 개수·크기)에
          따라 카테고리 탭마다 main 자체의 폭/좌우 위치가 달라지는 버그였다.
          w-full로 폭을 먼저 100%로 고정해야 max-w-7xl+mx-auto가 항상
          똑같은 위치·폭으로만 동작한다. 하단 고정 모바일 내비만큼 콘텐츠가
          가려지지 않도록 여백도 확보. */}
      <main className="mx-auto w-full max-w-7xl p-4 pb-20 sm:p-8 sm:pb-8">{children}</main>
      <MobileBottomNav active={activeNav} />
    </>
  )
}

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
      {/* 하단 고정 모바일 내비만큼 콘텐츠가 가려지지 않도록 여백 확보 */}
      <main className="mx-auto max-w-7xl p-4 pb-20 sm:p-8 sm:pb-8">{children}</main>
      <MobileBottomNav active={activeNav} />
    </>
  )
}

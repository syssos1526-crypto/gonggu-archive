import type { ReactNode } from 'react'
import { SiteHeader } from '@/components/SiteHeader'
import { CategoryNav } from '@/components/CategoryNav'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { CategorySlug } from '@/lib/queries/category'

export async function PageShell({
  searchValue,
  activeCategory,
  children,
}: {
  searchValue?: string
  activeCategory?: 'all' | CategorySlug
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
      <main className="mx-auto max-w-7xl p-4 sm:p-8">{children}</main>
    </>
  )
}

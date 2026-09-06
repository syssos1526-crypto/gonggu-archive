import { supabase } from '@/lib/supabase'
import { GROUP_BUY_SELECT, toHomeGroupBuy, type GroupBuyRow } from '@/lib/queries/groupBuyShared'
import type { BrandSummary, HomeGroupBuy } from '@/types/domain'

export async function getOngoingGroupBuys(limit = 10): Promise<HomeGroupBuy[]> {
  // start_date/end_date는 date 컬럼이라 날짜 문자열로만 비교(시각 포함 비교 시
  // "오늘 종료"인 공구가 자정 직후 곧바로 제외되는 버그가 생김). "오늘 종료"는
  // 별도 섹션이 있으므로 여기서는 내일 이후에 끝나는 것만 진행중으로 취급.
  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('group_buys')
    .select(GROUP_BUY_SELECT)
    .lte('start_date', today)
    .gt('end_date', today)
    .order('end_date', { ascending: true })
    .limit(limit)

  if (error) throw error

  return ((data ?? []) as unknown as GroupBuyRow[])
    .map(toHomeGroupBuy)
    .filter((row): row is HomeGroupBuy => row !== null)
}

export async function getEndingTodayGroupBuys(limit = 10): Promise<HomeGroupBuy[]> {
  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('group_buys')
    .select(GROUP_BUY_SELECT)
    .lte('start_date', today)
    .eq('end_date', today)
    .limit(limit)

  if (error) throw error

  return ((data ?? []) as unknown as GroupBuyRow[])
    .map(toHomeGroupBuy)
    .filter((row): row is HomeGroupBuy => row !== null)
}

// 오픈 예정: 시작일이 오늘보다 뒤(today < start_date). 날짜 문자열로만 비교.
export async function getUpcomingGroupBuys(limit = 10): Promise<HomeGroupBuy[]> {
  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('group_buys')
    .select(GROUP_BUY_SELECT)
    .gt('start_date', today)
    .order('start_date', { ascending: true })
    .limit(limit)

  if (error) throw error

  return ((data ?? []) as unknown as GroupBuyRow[])
    .map(toHomeGroupBuy)
    .filter((row): row is HomeGroupBuy => row !== null)
}

// 최근 종료: 종료일이 오늘보다 앞(end_date < today), 최근에 끝난 순.
export async function getRecentlyEndedGroupBuys(limit = 10): Promise<HomeGroupBuy[]> {
  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('group_buys')
    .select(GROUP_BUY_SELECT)
    .lt('end_date', today)
    .order('end_date', { ascending: false })
    .limit(limit)

  if (error) throw error

  return ((data ?? []) as unknown as GroupBuyRow[])
    .map(toHomeGroupBuy)
    .filter((row): row is HomeGroupBuy => row !== null)
}

export async function getPopularBrands(limit = 10): Promise<BrandSummary[]> {
  const { data, error } = await supabase
    .from('group_buys')
    .select('product:products(brand)')

  if (error) throw error

  const counts = new Map<string, number>()
  for (const row of (data ?? []) as unknown as { product: { brand: string } | null }[]) {
    if (!row.product) continue
    counts.set(row.product.brand, (counts.get(row.product.brand) ?? 0) + 1)
  }

  return Array.from(counts, ([brand, groupBuyCount]) => ({ brand, groupBuyCount }))
    .sort((a, b) => b.groupBuyCount - a.groupBuyCount)
    .slice(0, limit)
}

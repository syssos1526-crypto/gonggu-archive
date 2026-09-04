import { supabase } from '@/lib/supabase'
import {
  buildMatchFilter,
  GROUP_BUY_SELECT,
  toHomeGroupBuy,
  type GroupBuyRow,
} from '@/lib/queries/groupBuyShared'
import type {
  HomeGroupBuy,
  InfluencerSummary,
  ProductSummary,
} from '@/types/domain'

async function findMatchingProductIds(query: string): Promise<string[]> {
  const [byName, byBrand] = await Promise.all([
    supabase.from('products').select('id').ilike('name', `%${query}%`),
    supabase.from('products').select('id').ilike('brand', `%${query}%`),
  ])
  if (byName.error) throw byName.error
  if (byBrand.error) throw byBrand.error

  const ids = new Set<string>()
  for (const row of byName.data ?? []) ids.add(row.id)
  for (const row of byBrand.data ?? []) ids.add(row.id)
  return Array.from(ids)
}

async function findMatchingInfluencerIds(query: string): Promise<string[]> {
  const { data, error } = await supabase.from('influencers').select('id').ilike('name', `%${query}%`)
  if (error) throw error
  return (data ?? []).map((row) => row.id)
}

export async function searchOngoingGroupBuys(query: string): Promise<HomeGroupBuy[]> {
  const [productIds, influencerIds] = await Promise.all([
    findMatchingProductIds(query),
    findMatchingInfluencerIds(query),
  ])
  const matchFilter = buildMatchFilter(productIds, influencerIds)
  if (!matchFilter) return []

  // date 컬럼이라 날짜 문자열로만 비교. 검색의 "진행중"은 홈과 달리 오늘 종료되는
  // 것도 포함(검색에는 별도의 "오늘 종료" 탭이 없어 여기서 빠지면 갈 곳이 없어짐).
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('group_buys')
    .select(GROUP_BUY_SELECT)
    .or(matchFilter)
    .lte('start_date', today)
    .gte('end_date', today)
    .order('end_date', { ascending: true })

  if (error) throw error

  return ((data ?? []) as unknown as GroupBuyRow[])
    .map(toHomeGroupBuy)
    .filter((row): row is HomeGroupBuy => row !== null)
}

export async function searchPastGroupBuys(query: string, limit = 20): Promise<HomeGroupBuy[]> {
  const [productIds, influencerIds] = await Promise.all([
    findMatchingProductIds(query),
    findMatchingInfluencerIds(query),
  ])
  const matchFilter = buildMatchFilter(productIds, influencerIds)
  if (!matchFilter) return []

  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('group_buys')
    .select(GROUP_BUY_SELECT)
    .or(matchFilter)
    .lt('end_date', today)
    .order('end_date', { ascending: false })
    .limit(limit)

  if (error) throw error

  return ((data ?? []) as unknown as GroupBuyRow[])
    .map(toHomeGroupBuy)
    .filter((row): row is HomeGroupBuy => row !== null)
}

export async function searchProducts(query: string, limit = 30): Promise<ProductSummary[]> {
  const [byName, byBrand] = await Promise.all([
    supabase.from('products').select('id, brand, name, image_url').ilike('name', `%${query}%`),
    supabase.from('products').select('id, brand, name, image_url').ilike('brand', `%${query}%`),
  ])
  if (byName.error) throw byName.error
  if (byBrand.error) throw byBrand.error

  const productsById = new Map<string, { id: string; brand: string; name: string; image_url: string | null }>()
  for (const row of [...(byName.data ?? []), ...(byBrand.data ?? [])]) {
    productsById.set(row.id, row)
  }
  const products = Array.from(productsById.values())
  if (products.length === 0) return []

  const ids = products.map((p) => p.id)
  const { data: groupBuyRows, error: gbError } = await supabase
    .from('group_buys')
    .select('product_id, created_at')
    .in('product_id', ids)
  if (gbError) throw gbError

  const countByProduct = new Map<string, number>()
  const lastDateByProduct = new Map<string, string>()
  for (const row of groupBuyRows ?? []) {
    countByProduct.set(row.product_id, (countByProduct.get(row.product_id) ?? 0) + 1)
    const prevDate = lastDateByProduct.get(row.product_id)
    if (!prevDate || row.created_at > prevDate) lastDateByProduct.set(row.product_id, row.created_at)
  }

  return products
    .map((p) => ({
      id: p.id,
      brand: p.brand,
      name: p.name,
      image_url: p.image_url,
      groupBuyCount: countByProduct.get(p.id) ?? 0,
      lastGroupBuyDate: lastDateByProduct.get(p.id) ?? null,
    }))
    .sort((a, b) => b.groupBuyCount - a.groupBuyCount)
    .slice(0, limit)
}

export async function searchInfluencers(query: string, limit = 30): Promise<InfluencerSummary[]> {
  const { data: influencers, error } = await supabase
    .from('influencers')
    .select('id, name, profile_image_url, follower_count, trust_score')
    .ilike('name', `%${query}%`)
  if (error) throw error
  if (!influencers || influencers.length === 0) return []

  const ids = influencers.map((i) => i.id)
  const { data: groupBuyRows, error: gbError } = await supabase
    .from('group_buys')
    .select('influencer_id')
    .in('influencer_id', ids)
  if (gbError) throw gbError

  const countByInfluencer = new Map<string, number>()
  for (const row of groupBuyRows ?? []) {
    countByInfluencer.set(row.influencer_id, (countByInfluencer.get(row.influencer_id) ?? 0) + 1)
  }

  return influencers
    .map((i) => ({
      id: i.id,
      name: i.name,
      profile_image_url: i.profile_image_url,
      follower_count: i.follower_count,
      trust_score: i.trust_score,
      groupBuyCount: countByInfluencer.get(i.id) ?? 0,
    }))
    .sort((a, b) => b.groupBuyCount - a.groupBuyCount)
    .slice(0, limit)
}

// interests RLS가 "본인 행만" 조회 가능하도록 되어 있어, 이 함수로는 전체 사용자
// 기준 인기도 집계가 불가능하다(로그인 안 한 방문자는 0건, 로그인 사용자는 본인
// 관심 표시만 보임). 스키마/RLS 변경 없이 쓸 수 있는 범위로만 방어적으로 구현.
export async function getInterestCounts(
  column: 'product_id' | 'influencer_id',
  targetIds: string[]
): Promise<Map<string, number>> {
  if (targetIds.length === 0) return new Map()

  try {
    const { data, error } = await supabase
      .from('interests')
      .select(column)
      .in(column, targetIds)
    if (error) throw error

    const counts = new Map<string, number>()
    for (const row of (data ?? []) as unknown as Record<string, string | null>[]) {
      const id = row[column]
      if (!id) continue
      counts.set(id, (counts.get(id) ?? 0) + 1)
    }
    return counts
  } catch {
    return new Map()
  }
}

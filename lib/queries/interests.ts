import type { SupabaseClient } from '@supabase/supabase-js'
import { GROUP_BUY_SELECT, toHomeGroupBuy, type GroupBuyRow } from '@/lib/queries/groupBuyShared'
import type { HomeGroupBuy, InfluencerSummary } from '@/types/domain'

export async function getInterestedProductIds(
  supabase: SupabaseClient,
  userId: string,
  productIds: string[]
): Promise<Set<string>> {
  if (productIds.length === 0) return new Set()

  const { data, error } = await supabase
    .from('interests')
    .select('product_id')
    .eq('user_id', userId)
    .in('product_id', productIds)
  if (error) throw error

  return new Set((data ?? []).map((row) => row.product_id as string))
}

export async function getInterestedInfluencerIds(
  supabase: SupabaseClient,
  userId: string,
  influencerIds: string[]
): Promise<Set<string>> {
  if (influencerIds.length === 0) return new Set()

  const { data, error } = await supabase
    .from('interests')
    .select('influencer_id')
    .eq('user_id', userId)
    .in('influencer_id', influencerIds)
  if (error) throw error

  return new Set((data ?? []).map((row) => row.influencer_id as string))
}

// 마이페이지 "관심 공구": 관심 등록한 상품들의 공구 이력을 상태(진행중 우선) 순으로.
export async function getInterestedProductGroupBuys(
  supabase: SupabaseClient,
  userId: string
): Promise<HomeGroupBuy[]> {
  const { data: interestRows, error: interestError } = await supabase
    .from('interests')
    .select('product_id')
    .eq('user_id', userId)
    .not('product_id', 'is', null)
  if (interestError) throw interestError

  const productIds = (interestRows ?? []).map((row) => row.product_id as string)
  if (productIds.length === 0) return []

  const { data, error } = await supabase
    .from('group_buys')
    .select(GROUP_BUY_SELECT)
    .in('product_id', productIds)
    .order('start_date', { ascending: false })
  if (error) throw error

  const statusOrder = { ongoing: 0, ended_today: 0, upcoming: 1, ended: 2 }
  return ((data ?? []) as unknown as GroupBuyRow[])
    .map(toHomeGroupBuy)
    .filter((row): row is HomeGroupBuy => row !== null)
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
}

// 마이페이지 "관심 인플루언서"
export async function getInterestedInfluencers(
  supabase: SupabaseClient,
  userId: string
): Promise<InfluencerSummary[]> {
  const { data: interestRows, error: interestError } = await supabase
    .from('interests')
    .select('influencer_id')
    .eq('user_id', userId)
    .not('influencer_id', 'is', null)
  if (interestError) throw interestError

  const influencerIds = (interestRows ?? []).map((row) => row.influencer_id as string)
  if (influencerIds.length === 0) return []

  const { data: influencers, error } = await supabase
    .from('influencers')
    .select('id, name, profile_image_url, follower_count, trust_score')
    .in('id', influencerIds)
  if (error) throw error
  if (!influencers || influencers.length === 0) return []

  const { data: groupBuyRows, error: gbError } = await supabase
    .from('group_buys')
    .select('influencer_id')
    .in('influencer_id', influencerIds)
  if (gbError) throw gbError

  const countByInfluencer = new Map<string, number>()
  for (const row of groupBuyRows ?? []) {
    countByInfluencer.set(row.influencer_id, (countByInfluencer.get(row.influencer_id) ?? 0) + 1)
  }

  return influencers.map((influencer) => ({
    id: influencer.id,
    name: influencer.name,
    profile_image_url: influencer.profile_image_url,
    follower_count: influencer.follower_count,
    trust_score: influencer.trust_score,
    groupBuyCount: countByInfluencer.get(influencer.id) ?? 0,
  }))
}

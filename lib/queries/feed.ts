import type { SupabaseClient } from '@supabase/supabase-js'
import {
  buildMatchFilter,
  GROUP_BUY_SELECT,
  toHomeGroupBuy,
  type GroupBuyRow,
} from '@/lib/queries/groupBuyShared'
import type { FeedGroupBuy, InterestReason } from '@/types/domain'

export async function getInterestFeed(
  supabase: SupabaseClient,
  userId: string
): Promise<FeedGroupBuy[]> {
  const { data: interestRows, error: interestError } = await supabase
    .from('interests')
    .select('product_id, influencer_id')
    .eq('user_id', userId)
  if (interestError) throw interestError

  const productIds = (interestRows ?? [])
    .map((row) => row.product_id as string | null)
    .filter((id): id is string => id != null)
  const influencerIds = (interestRows ?? [])
    .map((row) => row.influencer_id as string | null)
    .filter((id): id is string => id != null)

  if (productIds.length === 0 && influencerIds.length === 0) return []

  const matchFilter = buildMatchFilter(productIds, influencerIds)
  if (!matchFilter) return []

  // date 컬럼이라 날짜 문자열로만 비교 — 오늘 종료(ended_today)까지는 포함하고
  // 이미 끝난 공구는 쿼리 단계에서 아예 제외한다.
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('group_buys')
    .select(GROUP_BUY_SELECT)
    .or(matchFilter)
    .gte('end_date', today)
    .order('end_date', { ascending: true })
  if (error) throw error

  const productIdSet = new Set(productIds)
  const influencerIdSet = new Set(influencerIds)

  return ((data ?? []) as unknown as GroupBuyRow[])
    .map(toHomeGroupBuy)
    .filter((row) => row !== null)
    .map((groupBuy) => {
      const reasons: InterestReason[] = []
      if (productIdSet.has(groupBuy.product_id)) reasons.push('product')
      if (influencerIdSet.has(groupBuy.influencer_id)) reasons.push('influencer')
      return { ...groupBuy, reasons }
    })
}

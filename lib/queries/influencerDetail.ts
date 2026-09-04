import { supabase } from '@/lib/supabase'
import { GROUP_BUY_SELECT, toHomeGroupBuy, type GroupBuyRow } from '@/lib/queries/groupBuyShared'
import type { HomeGroupBuy } from '@/types/domain'
import type { Influencer } from '@/types/database'

export async function getInfluencerById(id: string): Promise<Influencer | null> {
  const { data, error } = await supabase
    .from('influencers')
    .select('id, name, instagram_handle, profile_image_url, follower_count, trust_score')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getGroupBuysByInfluencer(
  influencerId: string,
  limit = 30
): Promise<HomeGroupBuy[]> {
  const { data, error } = await supabase
    .from('group_buys')
    .select(GROUP_BUY_SELECT)
    .eq('influencer_id', influencerId)
    .order('start_date', { ascending: false })
    .limit(limit)

  if (error) throw error

  return ((data ?? []) as unknown as GroupBuyRow[])
    .map(toHomeGroupBuy)
    .filter((row): row is HomeGroupBuy => row !== null)
}

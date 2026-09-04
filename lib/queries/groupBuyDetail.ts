import { supabase } from '@/lib/supabase'
import { GROUP_BUY_SELECT, toHomeGroupBuy, type GroupBuyRow } from '@/lib/queries/groupBuyShared'
import type { HomeGroupBuy } from '@/types/domain'

export async function getGroupBuyById(id: string): Promise<HomeGroupBuy | null> {
  const { data, error } = await supabase
    .from('group_buys')
    .select(GROUP_BUY_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return toHomeGroupBuy(data as unknown as GroupBuyRow)
}

export async function getOtherGroupBuysForProduct(
  productId: string,
  excludeId: string,
  limit = 10
): Promise<HomeGroupBuy[]> {
  const { data, error } = await supabase
    .from('group_buys')
    .select(GROUP_BUY_SELECT)
    .eq('product_id', productId)
    .neq('id', excludeId)
    .order('start_date', { ascending: false })
    .limit(limit)

  if (error) throw error

  return ((data ?? []) as unknown as GroupBuyRow[])
    .map(toHomeGroupBuy)
    .filter((row): row is HomeGroupBuy => row !== null)
}

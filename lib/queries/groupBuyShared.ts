import { computeGroupBuyStatus } from '@/lib/groupBuyStatus'
import type { HomeGroupBuy } from '@/types/domain'

export const GROUP_BUY_SELECT = `
  id, product_id, influencer_id, price, original_price, start_date, end_date, purchase_url, created_at,
  product:products(id, brand, name, image_url, category),
  influencer:influencers(id, name, profile_image_url, trust_score)
`

export type GroupBuyRow = {
  id: string
  product_id: string
  influencer_id: string
  price: number
  original_price: number | null
  start_date: string
  end_date: string
  purchase_url: string | null
  created_at: string
  product: HomeGroupBuy['product'] | null
  influencer: HomeGroupBuy['influencer'] | null
}

// product_id/influencer_id 목록에 대한 OR 조건 문자열. search.ts와 feed.ts가 공유.
export function buildMatchFilter(productIds: string[], influencerIds: string[]): string | null {
  const filters: string[] = []
  if (productIds.length > 0) filters.push(`product_id.in.(${productIds.join(',')})`)
  if (influencerIds.length > 0) filters.push(`influencer_id.in.(${influencerIds.join(',')})`)
  return filters.length > 0 ? filters.join(',') : null
}

export function toHomeGroupBuy(row: GroupBuyRow): HomeGroupBuy | null {
  if (!row.product || !row.influencer) return null

  return {
    id: row.id,
    product_id: row.product_id,
    influencer_id: row.influencer_id,
    price: row.price,
    original_price: row.original_price,
    start_date: row.start_date,
    end_date: row.end_date,
    purchase_url: row.purchase_url,
    created_at: row.created_at,
    product: row.product,
    influencer: row.influencer,
    status: computeGroupBuyStatus(row.start_date, row.end_date),
  }
}

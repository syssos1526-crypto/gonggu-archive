// 화면에서 실제 사용하는 조합/파생 타입.
// database.ts의 raw 테이블 타입을 조합해 만든다.

import type { GroupBuy, Influencer, Product } from './database'

export interface GroupBuyWithRelations extends GroupBuy {
  product: Pick<Product, 'id' | 'brand' | 'name' | 'image_url' | 'category'>
  influencer: Pick<Influencer, 'id' | 'name' | 'profile_image_url' | 'trust_score'>
}

export type GroupBuyStatus = 'upcoming' | 'ongoing' | 'ended_today' | 'ended'

export interface HomeGroupBuy extends GroupBuyWithRelations {
  status: GroupBuyStatus
}

export interface BrandSummary {
  brand: string
  groupBuyCount: number
}

export interface ProductSummary {
  id: string
  brand: string
  name: string
  image_url: string | null
  groupBuyCount: number
  lastGroupBuyDate: string | null
}

export interface InfluencerSummary {
  id: string
  name: string
  profile_image_url: string | null
  follower_count: number
  trust_score: number
  groupBuyCount: number
}

export type InterestReason = 'product' | 'influencer'

export interface FeedGroupBuy extends HomeGroupBuy {
  reasons: InterestReason[]
}

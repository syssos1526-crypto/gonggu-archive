// Supabase 원본 테이블 row 타입 (수동 정의).
// 추후 `supabase gen types typescript`로 생성한 결과물로 교체 권장.

export interface Product {
  id: string
  brand: string
  name: string
  category: string
  image_url: string | null
}

export interface Influencer {
  id: string
  instagram_handle: string
  name: string
  profile_image_url: string | null
  follower_count: number
  trust_score: number
}

export interface GroupBuy {
  id: string
  product_id: string
  influencer_id: string
  price: number
  original_price: number | null
  start_date: string
  end_date: string
  purchase_url: string | null
  created_at: string
}

export interface User {
  id: string
  email: string
}

// interests는 product_id/influencer_id 두 개의 개별 FK 컬럼을 갖고,
// 한 행에는 둘 중 하나만 채워짐(각각 (user_id, product_id) / (user_id, influencer_id)
// UNIQUE 제약으로 중복 방지). target_type/target_id 같은 폴리모픽 컬럼이 아님.
export interface Interest {
  id: string
  user_id: string
  product_id: string | null
  influencer_id: string | null
  created_at: string
}

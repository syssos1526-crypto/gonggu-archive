import { supabase } from '@/lib/supabase'
import { buildMatchFilter } from '@/lib/queries/groupBuyShared'

export interface AdminGroupBuyRow {
  id: string
  created_at: string
  start_date: string
  end_date: string
  product: { brand: string; name: string } | null
  influencer: { name: string } | null
}

// 홈/검색/카테고리 등 기존 공개 조회와 동일하게 anon 싱글턴을 사용한다.
// 이 데이터는 로그인 여부와 무관한 공개 정보라 세션 인지 클라이언트가 필요
// 없고, anon에는 이미 SELECT 권한이 확인돼 있다(쓰기 전용 service role
// 클라이언트는 여기서 쓰지 않는다).
export async function getRecentGroupBuysForAdmin(limit = 20): Promise<AdminGroupBuyRow[]> {
  const { data, error } = await supabase
    .from('group_buys')
    .select(
      'id, created_at, start_date, end_date, product:products(brand, name), influencer:influencers(name)'
    )
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error

  return (data ?? []) as unknown as AdminGroupBuyRow[]
}

export interface AdminProductRow {
  id: string
  brand: string
  name: string
  category: string
  image_url: string | null
}

const ADMIN_PRODUCT_SELECT = 'id, brand, name, category, image_url'

// 상품 목록·검색은 공개 검색과 동일하게 anon 싱글턴으로 조회한다(이미 SELECT
// 권한이 확인된 공개 데이터). 브랜드/상품명 각각 ilike 후 합치는 방식은
// lib/queries/search.ts의 searchProducts와 동일한 패턴.
export async function getAdminProducts(query?: string, limit = 50): Promise<AdminProductRow[]> {
  const q = (query ?? '').trim()

  if (!q) {
    const { data, error } = await supabase
      .from('products')
      .select(ADMIN_PRODUCT_SELECT)
      .order('brand', { ascending: true })
      .limit(limit)
    if (error) throw error
    return data ?? []
  }

  const [byName, byBrand] = await Promise.all([
    supabase.from('products').select(ADMIN_PRODUCT_SELECT).ilike('name', `%${q}%`).limit(limit),
    supabase.from('products').select(ADMIN_PRODUCT_SELECT).ilike('brand', `%${q}%`).limit(limit),
  ])
  if (byName.error) throw byName.error
  if (byBrand.error) throw byBrand.error

  const byId = new Map<string, AdminProductRow>()
  for (const row of [...(byName.data ?? []), ...(byBrand.data ?? [])]) {
    byId.set(row.id, row)
  }
  return Array.from(byId.values()).slice(0, limit)
}

export async function getAdminProductById(id: string): Promise<AdminProductRow | null> {
  const { data, error } = await supabase
    .from('products')
    .select(ADMIN_PRODUCT_SELECT)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

export interface AdminGroupBuyDetailRow {
  id: string
  price: number
  original_price: number | null
  start_date: string
  end_date: string
  purchase_url: string | null
  post_url: string | null
  product: { id: string; brand: string; name: string; image_url: string | null } | null
  influencer: { id: string; name: string } | null
}

const ADMIN_GROUP_BUY_SELECT = `
  id, price, original_price, start_date, end_date, purchase_url, post_url,
  product:products(id, brand, name, image_url),
  influencer:influencers(id, name)
`

// 상품/공구 관리 목록·검색은 공개 검색과 동일하게 anon 싱글턴으로 조회한다
// (이미 SELECT 권한이 확인된 공개 데이터). 검색은 lib/queries/search.ts와
// 동일하게 상품/인플루언서 id를 먼저 찾은 뒤 buildMatchFilter로 OR 조건을
// 만드는 방식 — PostgREST 임베드 컬럼에 직접 ilike를 걸지 않는다.
export async function getAdminGroupBuys(
  query?: string,
  limit = 50
): Promise<AdminGroupBuyDetailRow[]> {
  const q = (query ?? '').trim()

  if (!q) {
    const { data, error } = await supabase
      .from('group_buys')
      .select(ADMIN_GROUP_BUY_SELECT)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data ?? []) as unknown as AdminGroupBuyDetailRow[]
  }

  const [byProductName, byProductBrand, byInfluencerName] = await Promise.all([
    supabase.from('products').select('id').ilike('name', `%${q}%`),
    supabase.from('products').select('id').ilike('brand', `%${q}%`),
    supabase.from('influencers').select('id').ilike('name', `%${q}%`),
  ])
  if (byProductName.error) throw byProductName.error
  if (byProductBrand.error) throw byProductBrand.error
  if (byInfluencerName.error) throw byInfluencerName.error

  const productIds = Array.from(
    new Set([...(byProductName.data ?? []), ...(byProductBrand.data ?? [])].map((row) => row.id))
  )
  const influencerIds = (byInfluencerName.data ?? []).map((row) => row.id)

  const matchFilter = buildMatchFilter(productIds, influencerIds)
  if (!matchFilter) return []

  const { data, error } = await supabase
    .from('group_buys')
    .select(ADMIN_GROUP_BUY_SELECT)
    .or(matchFilter)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as unknown as AdminGroupBuyDetailRow[]
}

export async function getAdminGroupBuyById(id: string): Promise<AdminGroupBuyDetailRow | null> {
  const { data, error } = await supabase
    .from('group_buys')
    .select(ADMIN_GROUP_BUY_SELECT)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as unknown as AdminGroupBuyDetailRow | null
}

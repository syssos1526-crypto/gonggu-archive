import { supabase } from '@/lib/supabase'

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

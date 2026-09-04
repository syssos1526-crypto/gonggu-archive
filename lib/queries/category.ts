import { supabase } from '@/lib/supabase'
import { GROUP_BUY_SELECT, toHomeGroupBuy, type GroupBuyRow } from '@/lib/queries/groupBuyShared'
import type { HomeGroupBuy } from '@/types/domain'

export type CategorySlug = 'beauty' | 'fashion' | 'food-health' | 'living'

// dbCategories: 실제 products.category 원문 값(2026-09 기준 조회 결과) 그대로 매핑.
// '뷰티' 메뉴는 세부 카테고리로 나뉜 '스킨케어'/'클렌징'도 함께 포함(사용자 확인 완료).
// 값 자체는 임의로 바꾸거나 새로 만들지 않음 — DB에 없는 값(예: '식품/건강')은
// 매칭되는 상품이 생기기 전까지 그냥 빈 목록으로 표시됨.
export const CATEGORY_CONFIG: Record<CategorySlug, { label: string; dbCategories: string[] }> = {
  beauty: { label: '뷰티', dbCategories: ['뷰티', '스킨케어', '클렌징'] },
  fashion: { label: '패션', dbCategories: ['패션'] },
  'food-health': { label: '식품/건강', dbCategories: ['식품/건강'] },
  living: { label: '리빙', dbCategories: ['리빙'] },
}

export function isCategorySlug(value: string): value is CategorySlug {
  return Object.prototype.hasOwnProperty.call(CATEGORY_CONFIG, value)
}

export async function getCategoryGroupBuys(slug: CategorySlug, limit = 60): Promise<HomeGroupBuy[]> {
  const { dbCategories } = CATEGORY_CONFIG[slug]

  const { data: products, error: productError } = await supabase
    .from('products')
    .select('id')
    .in('category', dbCategories)
  if (productError) throw productError

  const productIds = (products ?? []).map((product) => product.id)
  if (productIds.length === 0) return []

  // date 컬럼이라 날짜 문자열로만 비교 — 종료된 공구는 목록에서 제외.
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('group_buys')
    .select(GROUP_BUY_SELECT)
    .in('product_id', productIds)
    .gte('end_date', today)
    .order('end_date', { ascending: true })
    .limit(limit)
  if (error) throw error

  return ((data ?? []) as unknown as GroupBuyRow[])
    .map(toHomeGroupBuy)
    .filter((row): row is HomeGroupBuy => row !== null)
}

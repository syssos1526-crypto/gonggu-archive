import { requireAdminUser } from '@/lib/auth/admin'
import { createAdminSupabaseClient, describeAdminSupabaseError } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// event_logs는 RLS상 authenticated가 "본인 행만" 볼 수 있어(scripts/add-event-logs.sql),
// 동의한 테스트 사용자들이 실제로 로그를 남기기 시작한 지금은 관리자 세션
// 클라이언트로 조회하면 다른 사용자의 로그가 보이지 않는다. 그래서 event_logs
// 조회만 requireAdminUser() 통과 후 service_role 클라이언트(admin)로 전환한다
// (scripts/grant-service-role-event-logs-select.sql, SELECT만 — INSERT/UPDATE/
// DELETE 없음. anon/authenticated 권한과 event_logs RLS 정책은 그대로 둔다).
// group_buys/products/influencers는 이미 anon/authenticated에 SELECT가 있는
// 공개 데이터라 기존 세션 클라이언트를 그대로 쓴다 — service_role은 이 파일의
// event_logs 조회 외에는 쓰지 않는다.
//
// 여기서는 user_id/이메일 등 개인 식별 정보를 조회·표시하지 않는다(집계 건수만).
//
// PostgREST는 SQL의 GROUP BY/집계를 직접 지원하지 않아, 이 파일의 모든 함수는
// scripts/analytics-queries.sql과 같은 질문에 답하되 원시 행을 가져와 이
// 프로젝트의 기존 관례(getInterestCounts, getPopularBrands 등)와 동일하게
// JS에서 직접 집계한다.

export interface EventTypeCount {
  eventType: string
  count: number
}

// 1) 최근 7일 이벤트 유형별 수
export async function getEventTypeCountsLast7Days(): Promise<EventTypeCount[]> {
  await requireAdminUser()

  let admin: ReturnType<typeof createAdminSupabaseClient>
  try {
    admin = createAdminSupabaseClient()
  } catch (error) {
    throw new Error(describeAdminSupabaseError(error))
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await admin
    .from('event_logs')
    .select('event_type')
    .gte('created_at', sevenDaysAgo)
  if (error) throw new Error(describeAdminSupabaseError(error))

  const counts = new Map<string, number>()
  for (const row of data ?? []) {
    counts.set(row.event_type, (counts.get(row.event_type) ?? 0) + 1)
  }

  return Array.from(counts, ([eventType, count]) => ({ eventType, count })).sort(
    (a, b) => b.count - a.count
  )
}

export interface TopSearchQuery {
  query: string
  searchCount: number
  avgResultCount: number | null
}

// 2) 많이 검색한 검색어와 평균 검색 결과 수
export async function getTopSearchQueries(limit = 10): Promise<TopSearchQuery[]> {
  await requireAdminUser()

  let admin: ReturnType<typeof createAdminSupabaseClient>
  try {
    admin = createAdminSupabaseClient()
  } catch (error) {
    throw new Error(describeAdminSupabaseError(error))
  }

  const { data, error } = await admin
    .from('event_logs')
    .select('metadata')
    .eq('event_type', 'search_submitted')
  if (error) throw new Error(describeAdminSupabaseError(error))

  const byQuery = new Map<string, { count: number; resultCountSum: number; resultCountN: number }>()
  for (const row of (data ?? []) as { metadata: Record<string, unknown> | null }[]) {
    const query = row.metadata && typeof row.metadata.query === 'string' ? row.metadata.query : null
    if (!query) continue

    const entry = byQuery.get(query) ?? { count: 0, resultCountSum: 0, resultCountN: 0 }
    entry.count += 1
    const resultCount = row.metadata?.result_count
    if (typeof resultCount === 'number' && Number.isFinite(resultCount)) {
      entry.resultCountSum += resultCount
      entry.resultCountN += 1
    }
    byQuery.set(query, entry)
  }

  return Array.from(byQuery, ([query, entry]) => ({
    query,
    searchCount: entry.count,
    avgResultCount: entry.resultCountN > 0 ? entry.resultCountSum / entry.resultCountN : null,
  }))
    .sort((a, b) => b.searchCount - a.searchCount)
    .slice(0, limit)
}

export interface GroupBuyEngagement {
  groupBuyId: string
  productName: string
  brand: string
  viewCount: number
  purchaseClickCount: number
  interestAddedCount: number
}

// 3) 공구별 상세 조회·관심 등록·구매 링크 클릭 수
// interest_added는 group_buy_id가 아닌 product_id 기준 이벤트라, 같은 상품의
// 공구 이력이 여러 건이면 각 공구에 동일하게 반영된다(analytics-queries.sql과 동일 근사).
export async function getGroupBuyEngagement(limit = 20): Promise<GroupBuyEngagement[]> {
  await requireAdminUser()

  let admin: ReturnType<typeof createAdminSupabaseClient>
  try {
    admin = createAdminSupabaseClient()
  } catch (error) {
    throw new Error(describeAdminSupabaseError(error))
  }
  const supabase = await createServerSupabaseClient()

  const [groupBuysResult, viewClickLogsResult, interestLogsResult] = await Promise.all([
    supabase.from('group_buys').select('id, product_id, product:products(name, brand)'),
    admin
      .from('event_logs')
      .select('group_buy_id, event_type')
      .in('event_type', ['group_buy_viewed', 'purchase_link_clicked'])
      .not('group_buy_id', 'is', null),
    admin
      .from('event_logs')
      .select('product_id')
      .eq('event_type', 'interest_added')
      .not('product_id', 'is', null),
  ])
  if (groupBuysResult.error) throw groupBuysResult.error
  if (viewClickLogsResult.error) throw new Error(describeAdminSupabaseError(viewClickLogsResult.error))
  if (interestLogsResult.error) throw new Error(describeAdminSupabaseError(interestLogsResult.error))

  const viewCountByGroupBuy = new Map<string, number>()
  const purchaseClickCountByGroupBuy = new Map<string, number>()
  for (const row of viewClickLogsResult.data ?? []) {
    if (!row.group_buy_id) continue
    const map = row.event_type === 'group_buy_viewed' ? viewCountByGroupBuy : purchaseClickCountByGroupBuy
    map.set(row.group_buy_id, (map.get(row.group_buy_id) ?? 0) + 1)
  }

  const interestCountByProduct = new Map<string, number>()
  for (const row of interestLogsResult.data ?? []) {
    if (!row.product_id) continue
    interestCountByProduct.set(row.product_id, (interestCountByProduct.get(row.product_id) ?? 0) + 1)
  }

  type GroupBuyRow = { id: string; product_id: string; product: { name: string; brand: string } | null }

  return ((groupBuysResult.data ?? []) as unknown as GroupBuyRow[])
    .map((gb) => ({
      groupBuyId: gb.id,
      productName: gb.product?.name ?? '(삭제된 상품)',
      brand: gb.product?.brand ?? '',
      viewCount: viewCountByGroupBuy.get(gb.id) ?? 0,
      purchaseClickCount: purchaseClickCountByGroupBuy.get(gb.id) ?? 0,
      interestAddedCount: interestCountByProduct.get(gb.product_id) ?? 0,
    }))
    .filter((row) => row.viewCount > 0 || row.purchaseClickCount > 0 || row.interestAddedCount > 0)
    .sort((a, b) => b.viewCount - a.viewCount || b.purchaseClickCount - a.purchaseClickCount)
    .slice(0, limit)
}

export interface InfluencerEngagement {
  influencerId: string
  influencerName: string
  viewCount: number
  purchaseClickCount: number
}

// 4) 인플루언서별 공구 조회·구매 링크 클릭 수
export async function getInfluencerEngagement(limit = 20): Promise<InfluencerEngagement[]> {
  await requireAdminUser()

  let admin: ReturnType<typeof createAdminSupabaseClient>
  try {
    admin = createAdminSupabaseClient()
  } catch (error) {
    throw new Error(describeAdminSupabaseError(error))
  }
  const supabase = await createServerSupabaseClient()

  const [influencersResult, logsResult] = await Promise.all([
    supabase.from('influencers').select('id, name'),
    admin
      .from('event_logs')
      .select('influencer_id, event_type')
      .in('event_type', ['group_buy_viewed', 'purchase_link_clicked'])
      .not('influencer_id', 'is', null),
  ])
  if (influencersResult.error) throw influencersResult.error
  if (logsResult.error) throw new Error(describeAdminSupabaseError(logsResult.error))

  const viewCountByInfluencer = new Map<string, number>()
  const purchaseClickCountByInfluencer = new Map<string, number>()
  for (const row of logsResult.data ?? []) {
    if (!row.influencer_id) continue
    const map = row.event_type === 'group_buy_viewed' ? viewCountByInfluencer : purchaseClickCountByInfluencer
    map.set(row.influencer_id, (map.get(row.influencer_id) ?? 0) + 1)
  }

  return (influencersResult.data ?? [])
    .map((influencer) => ({
      influencerId: influencer.id,
      influencerName: influencer.name,
      viewCount: viewCountByInfluencer.get(influencer.id) ?? 0,
      purchaseClickCount: purchaseClickCountByInfluencer.get(influencer.id) ?? 0,
    }))
    .filter((row) => row.viewCount > 0 || row.purchaseClickCount > 0)
    .sort((a, b) => b.viewCount - a.viewCount || b.purchaseClickCount - a.purchaseClickCount)
    .slice(0, limit)
}

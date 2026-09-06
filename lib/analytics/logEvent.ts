import type { SupabaseClient } from '@supabase/supabase-js'

export type AnalyticsEventType =
  | 'search_submitted'
  | 'interest_added'
  | 'interest_removed'
  | 'group_buy_viewed'
  | 'purchase_link_clicked'

interface LogEventInput {
  supabase: SupabaseClient
  userId: string
  eventType: AnalyticsEventType
  groupBuyId?: string | null
  productId?: string | null
  influencerId?: string | null
  metadata?: Record<string, unknown> | null
}

// 최선형(best-effort) 로깅 — event_logs insert가 실패해도(테이블 미생성 등)
// 기존 검색/관심/상세/구매링크 기능은 절대 막지 않는다. 실패는 콘솔에만 남김.
export async function logEvent({
  supabase,
  userId,
  eventType,
  groupBuyId = null,
  productId = null,
  influencerId = null,
  metadata = null,
}: LogEventInput): Promise<void> {
  try {
    const { error } = await supabase.from('event_logs').insert({
      user_id: userId,
      event_type: eventType,
      group_buy_id: groupBuyId,
      product_id: productId,
      influencer_id: influencerId,
      metadata,
    })
    if (error) {
      console.error(`[event_logs] ${eventType} 기록 실패:`, error.message)
    }
  } catch (error) {
    console.error(`[event_logs] ${eventType} 기록 중 예외:`, error)
  }
}

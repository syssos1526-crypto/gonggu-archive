import { NextResponse } from 'next/server'
import { logEvent } from '@/lib/analytics/logEvent'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// 구매 링크 클릭을 기록한 뒤 실제 구매처 URL로 안전하게 이동시키는 내부 경로.
// 목적지는 항상 서버가 조회한 group_buys.purchase_url이며, 클라이언트가
// 임의의 URL을 지정할 수 없어 오픈 리다이렉트 위험이 없다.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ groupBuyId: string }> }
) {
  const { groupBuyId } = await params
  const { origin } = new URL(request.url)
  const supabase = await createServerSupabaseClient()

  const { data: groupBuy } = await supabase
    .from('group_buys')
    .select('id, product_id, influencer_id, purchase_url')
    .eq('id', groupBuyId)
    .maybeSingle()

  if (!groupBuy || !groupBuy.purchase_url) {
    return NextResponse.redirect(`${origin}/group-buys/${groupBuyId}`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    await logEvent({
      supabase,
      userId: user.id,
      eventType: 'purchase_link_clicked',
      groupBuyId: groupBuy.id,
      productId: groupBuy.product_id,
      influencerId: groupBuy.influencer_id,
    })
  }

  return NextResponse.redirect(groupBuy.purchase_url)
}

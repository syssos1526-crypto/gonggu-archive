'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { logEvent } from '@/lib/analytics/logEvent'
import { createServerSupabaseClient } from '@/lib/supabase/server'

async function toggleInterest(column: 'product_id' | 'influencer_id', targetId: string) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: existing, error: selectError } = await supabase
    .from('interests')
    .select('id')
    .eq('user_id', user.id)
    .eq(column, targetId)
    .maybeSingle()
  if (selectError) throw selectError

  if (existing) {
    const { error } = await supabase.from('interests').delete().eq('id', existing.id)
    if (error) throw error
    await logEvent({
      supabase,
      userId: user.id,
      eventType: 'interest_removed',
      productId: column === 'product_id' ? targetId : null,
      influencerId: column === 'influencer_id' ? targetId : null,
    })
  } else {
    const { error } = await supabase.from('interests').insert({ user_id: user.id, [column]: targetId })
    if (error) throw error
    await logEvent({
      supabase,
      userId: user.id,
      eventType: 'interest_added',
      productId: column === 'product_id' ? targetId : null,
      influencerId: column === 'influencer_id' ? targetId : null,
    })
  }

  // 어느 페이지에서 눌렀는지 특정하지 않고 전체를 갱신 — 스키마/성능 최적화보다
  // 정확성을 우선한 단순한 방식(MVP 트래픽 규모에서는 무리 없음).
  revalidatePath('/', 'layout')
}

export async function toggleProductInterest(formData: FormData) {
  const productId = String(formData.get('productId') ?? '')
  if (!productId) return
  await toggleInterest('product_id', productId)
}

export async function toggleInfluencerInterest(formData: FormData) {
  const influencerId = String(formData.get('influencerId') ?? '')
  if (!influencerId) return
  await toggleInterest('influencer_id', influencerId)
}

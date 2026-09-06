'use server'

import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { ADMIN_CATEGORY_OPTIONS, ALL_CATEGORY_VALUES } from '@/lib/admin/constants'
import { requireAdminUser } from '@/lib/auth/admin'
import { supabase } from '@/lib/supabase'
import { createAdminSupabaseClient, describeAdminSupabaseError } from '@/lib/supabase/admin'

export interface InfluencerOption {
  id: string
  name: string
  instagram_handle: string
  profile_image_url: string | null
}

export interface ProductOption {
  id: string
  brand: string
  name: string
  category: string
  image_url: string | null
}

// 공개 검색 페이지와 동일하게 anon 싱글턴으로 조회한다(로그인 여부와 무관한
// 공개 데이터라 세션 인지 클라이언트가 필요 없고, anon에 SELECT 권한이 이미
// 있다). requireAdminUser()가 이미 관리자만 이 액션을 호출할 수 있게 막는다.
export async function searchInfluencersAction(query: string): Promise<InfluencerOption[]> {
  await requireAdminUser()
  const q = query.trim()
  if (!q) return []

  const [byName, byHandle] = await Promise.all([
    supabase
      .from('influencers')
      .select('id, name, instagram_handle, profile_image_url')
      .ilike('name', `%${q}%`)
      .limit(8),
    supabase
      .from('influencers')
      .select('id, name, instagram_handle, profile_image_url')
      .ilike('instagram_handle', `%${q}%`)
      .limit(8),
  ])
  if (byName.error) throw byName.error
  if (byHandle.error) throw byHandle.error

  const byId = new Map<string, InfluencerOption>()
  for (const row of [...(byName.data ?? []), ...(byHandle.data ?? [])]) {
    byId.set(row.id, row)
  }
  return Array.from(byId.values()).slice(0, 8)
}

export async function searchProductsAction(query: string): Promise<ProductOption[]> {
  await requireAdminUser()
  const q = query.trim()
  if (!q) return []

  const [byName, byBrand] = await Promise.all([
    supabase
      .from('products')
      .select('id, brand, name, category, image_url')
      .ilike('name', `%${q}%`)
      .limit(8),
    supabase
      .from('products')
      .select('id, brand, name, category, image_url')
      .ilike('brand', `%${q}%`)
      .limit(8),
  ])
  if (byName.error) throw byName.error
  if (byBrand.error) throw byBrand.error

  const byId = new Map<string, ProductOption>()
  for (const row of [...(byName.data ?? []), ...(byBrand.data ?? [])]) {
    byId.set(row.id, row)
  }
  return Array.from(byId.values()).slice(0, 8)
}

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp'])
const MAX_FILE_SIZE = 5 * 1024 * 1024

export interface UploadImageResult {
  ok: boolean
  imageUrl?: string
  error?: string
}

// authenticated에는 storage.objects 쓰기 권한이 없다 — 업로드는 반드시 이
// 서버 액션(관리자 검증 통과 + service role)에서만 이뤄진다.
export async function uploadProductImageAction(formData: FormData): Promise<UploadImageResult> {
  await requireAdminUser()

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: '업로드할 파일을 선택해주세요.' }
  }
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: '파일 크기는 5MB 이하만 가능합니다.' }
  }

  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!ALLOWED_EXTENSIONS.has(extension) || !ALLOWED_MIME_TYPES.has(file.type)) {
    return { ok: false, error: 'jpg, jpeg, png, webp 형식만 업로드할 수 있습니다.' }
  }

  let admin: ReturnType<typeof createAdminSupabaseClient>
  try {
    admin = createAdminSupabaseClient()
  } catch (error) {
    return { ok: false, error: describeAdminSupabaseError(error) }
  }

  const path = `${randomUUID()}.${extension}`

  const { error: uploadError } = await admin.storage
    .from('product-images')
    .upload(path, file, { contentType: file.type, upsert: false })

  if (uploadError) {
    return { ok: false, error: describeAdminSupabaseError(uploadError) }
  }

  const { data } = admin.storage.from('product-images').getPublicUrl(path)
  return { ok: true, imageUrl: data.publicUrl }
}

export interface CreateGroupBuyState {
  formError?: string
  duplicateWarning?: string
  fieldErrors?: Record<string, string>
}

// 관리자 검증 → (필요 시) 신규 인플루언서/상품 생성 → 공구 생성까지 한 번에 처리.
// PostgREST 위에서 다단계 insert라 진짜 트랜잭션은 아니다: 신규 인플루언서/상품을
// 만든 직후 공구 생성이 실패하면 참조되지 않는 인플루언서/상품 행이 남을 수 있다
// (수정·삭제 UI가 없는 이번 범위와 동일하게, 필요하면 Supabase Table Editor에서
// 직접 정리). 그래서 중복 확인은 아무것도 만들기 전에 먼저 수행한다.
export async function createGroupBuyAction(
  _prevState: CreateGroupBuyState,
  formData: FormData
): Promise<CreateGroupBuyState> {
  await requireAdminUser()

  let admin: ReturnType<typeof createAdminSupabaseClient>
  try {
    admin = createAdminSupabaseClient()
  } catch (error) {
    return { formError: describeAdminSupabaseError(error) }
  }

  const influencerMode = formData.get('influencer_mode') === 'new' ? 'new' : 'existing'
  const productMode = formData.get('product_mode') === 'new' ? 'new' : 'existing'
  const existingInfluencerId = String(formData.get('influencer_id') ?? '').trim()
  const existingProductId = String(formData.get('product_id') ?? '').trim()

  const newInfluencerName = String(formData.get('influencer_name') ?? '').trim()
  const newInfluencerHandle = String(formData.get('influencer_instagram_handle') ?? '').trim()
  const newInfluencerUrl = String(formData.get('influencer_instagram_url') ?? '').trim()

  const newProductBrand = String(formData.get('product_brand') ?? '').trim()
  const newProductName = String(formData.get('product_name') ?? '').trim()
  const newProductCategory = String(formData.get('product_category') ?? '').trim()
  const newProductImageUrl = String(formData.get('product_image_url') ?? '').trim()

  const priceRaw = String(formData.get('price') ?? '').trim()
  const originalPriceRaw = String(formData.get('original_price') ?? '').trim()
  const startDate = String(formData.get('start_date') ?? '').trim()
  const endDate = String(formData.get('end_date') ?? '').trim()
  const purchaseUrl = String(formData.get('purchase_url') ?? '').trim()
  const postUrl = String(formData.get('post_url') ?? '').trim()
  const confirmed = formData.get('confirmed') === 'true'

  const fieldErrors: Record<string, string> = {}

  if (influencerMode === 'new') {
    if (!newInfluencerName) fieldErrors.influencer = '인플루언서 이름을 입력해주세요.'
    else if (!newInfluencerHandle) fieldErrors.influencer = '인스타 핸들을 입력해주세요.'
  } else if (!existingInfluencerId) {
    fieldErrors.influencer = '인플루언서를 선택하거나 새로 등록해주세요.'
  }

  if (productMode === 'new') {
    if (!newProductBrand) fieldErrors.product = '브랜드를 입력해주세요.'
    else if (!newProductName) fieldErrors.product = '상품명을 입력해주세요.'
    else if (!ADMIN_CATEGORY_OPTIONS.includes(newProductCategory)) {
      fieldErrors.product = '카테고리를 선택해주세요.'
    }
  } else if (!existingProductId) {
    fieldErrors.product = '상품을 선택하거나 새로 등록해주세요.'
  }

  const price = Number(priceRaw)
  if (!priceRaw || Number.isNaN(price) || price < 0) {
    fieldErrors.price = '공구가를 숫자로 입력해주세요.'
  }

  let originalPrice: number | null = null
  if (originalPriceRaw) {
    originalPrice = Number(originalPriceRaw)
    if (Number.isNaN(originalPrice) || originalPrice < 0) {
      fieldErrors.original_price = '정가를 숫자로 입력해주세요.'
    }
  }

  if (!startDate) fieldErrors.start_date = '시작일을 입력해주세요.'
  if (!endDate) fieldErrors.end_date = '종료일을 입력해주세요.'
  if (startDate && endDate && endDate < startDate) {
    fieldErrors.end_date = '종료일은 시작일보다 빠를 수 없습니다.'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, formError: '입력값을 확인해주세요.' }
  }

  if (!confirmed) {
    const duplicateMessages: string[] = []

    if (purchaseUrl) {
      const { data, error } = await admin
        .from('group_buys')
        .select('id')
        .eq('purchase_url', purchaseUrl)
        .limit(1)
      if (error) return { formError: describeAdminSupabaseError(error) }
      if ((data?.length ?? 0) > 0) {
        duplicateMessages.push('같은 구매 링크를 사용하는 공구가 이미 있습니다.')
      }
    }

    if (influencerMode === 'existing' && productMode === 'existing') {
      const { data, error } = await admin
        .from('group_buys')
        .select('id')
        .eq('product_id', existingProductId)
        .eq('influencer_id', existingInfluencerId)
        .lte('start_date', endDate)
        .gte('end_date', startDate)
        .limit(1)
      if (error) return { formError: describeAdminSupabaseError(error) }
      if ((data?.length ?? 0) > 0) {
        duplicateMessages.push('같은 상품·인플루언서로 기간이 겹치는 공구가 이미 있습니다.')
      }
    }

    if (duplicateMessages.length > 0) {
      return { duplicateWarning: duplicateMessages.join(' ') }
    }
  }

  let influencerId = existingInfluencerId
  if (influencerMode === 'new') {
    const { data, error } = await admin
      .from('influencers')
      .insert({
        name: newInfluencerName,
        instagram_handle: newInfluencerHandle,
        instagram_url: newInfluencerUrl || null,
      })
      .select('id')
      .single()
    if (error) return { formError: `인플루언서 생성에 실패했습니다: ${describeAdminSupabaseError(error)}` }
    influencerId = data.id
  }

  let productId = existingProductId
  if (productMode === 'new') {
    const { data, error } = await admin
      .from('products')
      .insert({
        brand: newProductBrand,
        name: newProductName,
        category: newProductCategory,
        image_url: newProductImageUrl || null,
      })
      .select('id')
      .single()
    if (error) return { formError: `상품 생성에 실패했습니다: ${describeAdminSupabaseError(error)}` }
    productId = data.id
  }

  const { data: groupBuy, error: groupBuyError } = await admin
    .from('group_buys')
    .insert({
      product_id: productId,
      influencer_id: influencerId,
      price,
      original_price: originalPrice,
      start_date: startDate,
      end_date: endDate,
      purchase_url: purchaseUrl || null,
      post_url: postUrl || null,
    })
    .select('id')
    .single()

  if (groupBuyError) {
    return { formError: `공구 저장에 실패했습니다: ${describeAdminSupabaseError(groupBuyError)}` }
  }

  revalidatePath('/admin')
  redirect(`/group-buys/${groupBuy.id}`)
}

export interface UpdateProductState {
  formError?: string
  fieldErrors?: Record<string, string>
}

// 기존 상품의 브랜드/상품명/카테고리/메인 이미지를 수정한다. 홈/검색/카테고리/
// 공구상세 등 공개 페이지는 모두 force-dynamic이라 매 요청마다 새로 조회하므로,
// products.image_url을 갱신하면 별도 캐시 무효화 없이 바로 반영된다.
// 기존 Storage 파일은 여기서 지우지 않는다(요청된 정책).
export async function updateProductAction(
  _prevState: UpdateProductState,
  formData: FormData
): Promise<UpdateProductState> {
  await requireAdminUser()

  const productId = String(formData.get('product_id') ?? '').trim()
  const brand = String(formData.get('product_brand') ?? '').trim()
  const name = String(formData.get('product_name') ?? '').trim()
  const category = String(formData.get('product_category') ?? '').trim()
  const imageUrl = String(formData.get('product_image_url') ?? '').trim()

  const fieldErrors: Record<string, string> = {}
  if (!productId) fieldErrors.product = '잘못된 상품 요청입니다.'
  if (!brand) fieldErrors.brand = '브랜드를 입력해주세요.'
  if (!name) fieldErrors.name = '상품명을 입력해주세요.'
  if (!ALL_CATEGORY_VALUES.includes(category)) fieldErrors.category = '카테고리를 선택해주세요.'

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, formError: '입력값을 확인해주세요.' }
  }

  let admin: ReturnType<typeof createAdminSupabaseClient>
  try {
    admin = createAdminSupabaseClient()
  } catch (error) {
    return { formError: describeAdminSupabaseError(error) }
  }

  const { error } = await admin
    .from('products')
    .update({ brand, name, category, image_url: imageUrl || null })
    .eq('id', productId)
    .select('id')
    .single()

  if (error) {
    return { formError: `상품 수정에 실패했습니다: ${describeAdminSupabaseError(error)}` }
  }

  revalidatePath('/admin/products')
  redirect('/admin/products')
}

export interface UpdateGroupBuyScheduleState {
  formError?: string
  fieldErrors?: Record<string, string>
}

// 기존 공구의 일정/가격/링크만 수정한다. 상품·인플루언서 연결(product_id/
// influencer_id)은 이번 범위에서 변경하지 않는다. 홈/검색/카테고리/공구상세
// 등 공개 페이지는 모두 force-dynamic이라 다음 요청부터 바로 반영된다.
export async function updateGroupBuyScheduleAction(
  _prevState: UpdateGroupBuyScheduleState,
  formData: FormData
): Promise<UpdateGroupBuyScheduleState> {
  await requireAdminUser()

  const groupBuyId = String(formData.get('group_buy_id') ?? '').trim()
  const priceRaw = String(formData.get('price') ?? '').trim()
  const originalPriceRaw = String(formData.get('original_price') ?? '').trim()
  const startDate = String(formData.get('start_date') ?? '').trim()
  const endDate = String(formData.get('end_date') ?? '').trim()
  const purchaseUrl = String(formData.get('purchase_url') ?? '').trim()
  const postUrl = String(formData.get('post_url') ?? '').trim()

  const fieldErrors: Record<string, string> = {}
  if (!groupBuyId) fieldErrors.groupBuy = '잘못된 공구 요청입니다.'

  const price = Number(priceRaw)
  if (!priceRaw || Number.isNaN(price) || price < 0) {
    fieldErrors.price = '공구가를 숫자로 입력해주세요.'
  }

  let originalPrice: number | null = null
  if (originalPriceRaw) {
    originalPrice = Number(originalPriceRaw)
    if (Number.isNaN(originalPrice) || originalPrice < 0) {
      fieldErrors.original_price = '정가를 숫자로 입력해주세요.'
    }
  }

  if (!startDate) fieldErrors.start_date = '시작일을 입력해주세요.'
  if (!endDate) fieldErrors.end_date = '종료일을 입력해주세요.'
  if (startDate && endDate && endDate < startDate) {
    fieldErrors.end_date = '종료일은 시작일보다 빠를 수 없습니다.'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, formError: '입력값을 확인해주세요.' }
  }

  let admin: ReturnType<typeof createAdminSupabaseClient>
  try {
    admin = createAdminSupabaseClient()
  } catch (error) {
    return { formError: describeAdminSupabaseError(error) }
  }

  const { error } = await admin
    .from('group_buys')
    .update({
      price,
      original_price: originalPrice,
      start_date: startDate,
      end_date: endDate,
      purchase_url: purchaseUrl || null,
      post_url: postUrl || null,
    })
    .eq('id', groupBuyId)
    .select('id')
    .single()

  if (error) {
    return { formError: `공구 수정에 실패했습니다: ${describeAdminSupabaseError(error)}` }
  }

  revalidatePath('/admin/group-buys')
  redirect('/admin/group-buys')
}

import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// /admin 하위 페이지와 관리자 전용 서버 액션 전부 이 함수로 검증한다.
// 로그인하지 않았거나, ADMIN_USER_ID 미설정, 또는 로그인 사용자 id가
// ADMIN_USER_ID와 다르면 404로 처리해 관리자 화면 존재 자체를 드러내지 않는다.
export async function requireAdminUser() {
  const adminUserId = process.env.ADMIN_USER_ID
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!adminUserId || !user || user.id !== adminUserId) {
    notFound()
  }

  return { supabase, user }
}

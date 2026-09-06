import { createClient } from '@supabase/supabase-js'

// 관리자 전용 서버 클라이언트 — 비밀 키로 RLS를 우회한다.
// requireAdminUser() 통과 후, 서버 전용 코드(서버 액션)에서만 호출할 것.
// 클라이언트 컴포넌트나 브라우저에서 실행되는 코드에는 절대 import하지 말 것.
//
// SUPABASE_SECRET_KEY(신규 권장 형식)를 우선 사용하고, 기존 프로젝트 호환을
// 위해 SUPABASE_SERVICE_ROLE_KEY가 있으면 fallback으로만 지원한다.
export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !secretKey) {
    throw new Error('SUPABASE_SECRET_KEY(또는 SUPABASE_SERVICE_ROLE_KEY) 환경변수가 설정되지 않았습니다.')
  }

  return createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// 관리자 서버 액션에서 나오는 에러(Postgrest 에러 객체, storage-js 에러,
// createAdminSupabaseClient()의 설정 누락 Error 등)를 절대 그대로 던지거나
// 화면에 노출하지 않고, 무엇을 확인해야 하는지 알 수 있는 문장으로 바꾼다.
// 키 값 자체는 어떤 경우에도 포함하지 않는다.
export function describeAdminSupabaseError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code)
      : undefined

  if (code === '42501') {
    return (
      '관리자 권한으로 요청하지 못했습니다(권한 거부, 42501). ' +
      'Supabase 대시보드 > Project Settings > API에서 SUPABASE_SECRET_KEY' +
      '(또는 SUPABASE_SERVICE_ROLE_KEY) 값이 올바른 secret/service_role 키인지 ' +
      '.env.local과 Vercel 환경변수에서 다시 확인해주세요.'
    )
  }

  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof (error as { message: unknown }).message === 'string'
        ? (error as { message: string }).message
        : undefined

  if (rawMessage && /bucket not found/i.test(rawMessage)) {
    return (
      'product-images Storage 버킷을 찾을 수 없습니다. ' +
      'scripts/setup-product-images-storage.sql을 Supabase SQL Editor에서 먼저 실행했는지 확인해주세요.'
    )
  }

  return rawMessage ?? '알 수 없는 오류가 발생했습니다.'
}

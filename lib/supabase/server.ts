import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 요청마다 새로 만드는 쿠키 기반 클라이언트 — 로그인 세션이 필요한 서버
// 컴포넌트/서버 액션/라우트 핸들러 전용. 기존 `lib/supabase.ts`(anon 싱글턴,
// 공개 브라우징 쿼리 전용)는 그대로 두고 건드리지 않는다.
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          } catch {
            // 서버 컴포넌트 렌더링 중에는 쿠키를 쓸 수 없음 —
            // 미들웨어가 세션 갱신을 담당하므로 여기서는 무시해도 안전.
          }
        },
      },
    }
  )
}

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// 이메일 확인 링크가 돌아오는 콜백 경로. Supabase 대시보드의
// Authentication > URL Configuration > Redirect URLs에 이 경로를 등록해야 함.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('이메일 확인 링크가 유효하지 않습니다.')}`)
}

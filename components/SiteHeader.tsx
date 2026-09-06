import Link from 'next/link'
import { SearchBar } from '@/components/SearchBar'
import { signOutAction } from '@/lib/actions/auth'

export function SiteHeader({
  searchValue = '',
  userEmail = null,
}: {
  searchValue?: string
  userEmail?: string | null
}) {
  const isLoggedIn = userEmail != null

  return (
    <>
      {/* AI Studio 시안의 Top Utility Bar 구조 재현. "고객센터"는 이번 범위 밖이라 장식만 유지 */}
      <div className="hidden h-7 items-center justify-between border-b border-white/10 bg-primary px-8 text-[11px] text-white/85 sm:flex">
        <div className="flex items-center gap-4">
          <span>앱 다운로드</span>
          <span>즐겨찾기 추가</span>
        </div>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <span className="text-white">{userEmail}</span>
              <form action={signOutAction}>
                <button type="submit" className="hover:text-white">
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-white">
                로그인
              </Link>
              <Link href="/signup" className="hover:text-white">
                회원가입
              </Link>
            </>
          )}
          <span>고객센터</span>
        </div>
      </div>

      <header className="sticky top-0 z-10 bg-primary px-4 py-2.5 shadow-sm sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-6">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 text-lg font-bold tracking-wide text-primary-foreground"
          >
            {/* 공식 브랜드 아이콘 원본, 리사이즈/가공 없이 그대로 사용 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/zen-a-icon.png"
              alt="ZEN-A"
              className="h-9 w-9 shrink-0 rounded-md object-cover"
            />
            ZEN-A
          </Link>

          <div className="sm:max-w-lg sm:flex-1">
            <SearchBar defaultValue={searchValue} />
          </div>

          <div className="flex shrink-0 items-center gap-4 self-end text-primary-foreground/90 sm:self-auto">
            <Link href="/feed" className="flex flex-col items-center gap-0.5" aria-label="관심공구">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M12 20.5s-7-4.35-9.5-8.5C.9 8.9 2.3 5.5 5.5 5.5c1.9 0 3.4 1.1 4.5 2.6C11.1 6.6 12.6 5.5 14.5 5.5c3.2 0 4.6 3.4 3 6.5-2.5 4.15-9.5 8.5-9.5 8.5z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="hidden text-[10px] font-medium sm:block">관심공구</span>
            </Link>
            <Link href="/mypage" className="flex flex-col items-center gap-0.5" aria-label="마이페이지">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="M4.5 20c1.4-3.6 4.6-5.5 7.5-5.5s6.1 1.9 7.5 5.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              <span className="hidden text-[10px] font-medium sm:block">마이페이지</span>
            </Link>
          </div>
        </div>
      </header>
    </>
  )
}

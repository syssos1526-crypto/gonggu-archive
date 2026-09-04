import type { GroupBuyStatus } from '@/types/domain'

// start_date/end_date는 시각 없는 date 컬럼이라, 반드시 달력 날짜(YYYY-MM-DD) 문자열로만
// 비교해야 한다. Date 인스턴스의 전체 timestamp로 비교하면 "end_date가 오늘"인 공구가
// 그날 자정(UTC) 이후부터 곧바로 "종료됨"으로 잘못 판정되는 버그가 생긴다.
function toDateOnly(value: string): string {
  return value.slice(0, 10)
}

export function computeGroupBuyStatus(
  startDate: string,
  endDate: string,
  now: Date = new Date()
): GroupBuyStatus {
  const today = toDateOnly(now.toISOString())
  const start = toDateOnly(startDate)
  const end = toDateOnly(endDate)

  if (today < start) return 'upcoming'
  if (today > end) return 'ended'
  if (today === end) return 'ended_today'
  return 'ongoing'
}

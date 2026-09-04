import { computeGroupBuyStatus } from '@/lib/groupBuyStatus'

function formatMonthDay(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`
}

export function formatFullDate(dateString: string): string {
  const date = new Date(dateString)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(
    date.getDate()
  ).padStart(2, '0')}`
}

export function formatGroupBuyDeadline(
  startDate: string,
  endDate: string,
  now: Date = new Date()
): string {
  const status = computeGroupBuyStatus(startDate, endDate, now)
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (status === 'upcoming') {
    return `${formatMonthDay(start)} 오픈 예정`
  }
  if (status === 'ended') {
    return '종료된 공구'
  }
  if (status === 'ended_today') {
    return '오늘 마감'
  }

  const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return `${formatMonthDay(end)} 마감 (D-${daysLeft})`
}

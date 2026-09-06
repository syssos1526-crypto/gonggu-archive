import Link from 'next/link'
import { formatFullDate } from '@/lib/formatDeadline'
import { getRecentGroupBuysForAdmin } from '@/lib/queries/admin'

export const dynamic = 'force-dynamic'

export default async function AdminHomePage() {
  const recent = await getRecentGroupBuysForAdmin()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">공구 관리</h1>
        <Link
          href="/admin/group-buys/new"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary-dark"
        >
          새 공구 등록
        </Link>
      </div>

      <div className="overflow-x-auto rounded-md border border-neutral-200 bg-white">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-500">
              <th className="px-4 py-3 font-semibold">상품명</th>
              <th className="px-4 py-3 font-semibold">인플루언서</th>
              <th className="px-4 py-3 font-semibold">기간</th>
              <th className="px-4 py-3 font-semibold">등록일</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                  아직 등록된 공구가 없습니다.
                </td>
              </tr>
            )}
            {recent.map((gb) => (
              <tr key={gb.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3 font-medium text-neutral-900">
                  {gb.product ? `${gb.product.brand} · ${gb.product.name}` : '-'}
                </td>
                <td className="px-4 py-3 text-neutral-700">{gb.influencer?.name ?? '-'}</td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-neutral-500">
                  {formatFullDate(gb.start_date)} ~ {formatFullDate(gb.end_date)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-neutral-500">
                  {formatFullDate(gb.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/group-buys/${gb.id}`}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    상세보기
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import Link from 'next/link'
import { formatFullDate } from '@/lib/formatDeadline'
import { computeGroupBuyStatus } from '@/lib/groupBuyStatus'
import { getAdminGroupBuys } from '@/lib/queries/admin'
import type { GroupBuyStatus } from '@/types/domain'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<GroupBuyStatus, string> = {
  upcoming: '공개 예정',
  ongoing: '진행중',
  ended_today: '오늘 마감',
  ended: '종료',
}

export default async function AdminGroupBuysPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const groupBuys = await getAdminGroupBuys(q)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-neutral-900">공구 관리</h1>

      <form action="/admin/group-buys" method="get" className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ''}
          placeholder="상품명, 브랜드 또는 인플루언서명 검색"
          className="h-11 flex-1 rounded-lg border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary-dark"
        >
          검색
        </button>
      </form>

      <div className="overflow-x-auto rounded-md border border-neutral-200 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-500">
              <th className="px-4 py-3 font-semibold">이미지</th>
              <th className="px-4 py-3 font-semibold">상품</th>
              <th className="px-4 py-3 font-semibold">인플루언서</th>
              <th className="px-4 py-3 font-semibold">기간</th>
              <th className="px-4 py-3 font-semibold">가격</th>
              <th className="px-4 py-3 font-semibold">상태</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {groupBuys.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">
                  {q ? '검색 결과가 없습니다.' : '등록된 공구가 없습니다.'}
                </td>
              </tr>
            )}
            {groupBuys.map((groupBuy) => {
              const status = computeGroupBuyStatus(groupBuy.start_date, groupBuy.end_date)
              return (
                <tr key={groupBuy.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3">
                    {groupBuy.product?.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={groupBuy.product.image_url}
                        alt={groupBuy.product.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-neutral-100" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">
                      {groupBuy.product ? `${groupBuy.product.brand} · ${groupBuy.product.name}` : '-'}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{groupBuy.influencer?.name ?? '-'}</td>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-neutral-500">
                    {formatFullDate(groupBuy.start_date)} ~ {formatFullDate(groupBuy.end_date)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-neutral-900">
                    {groupBuy.price.toLocaleString()}원
                    {groupBuy.original_price && (
                      <span className="ml-1 text-xs text-neutral-400 line-through">
                        {groupBuy.original_price.toLocaleString()}원
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        status === 'ongoing'
                          ? 'bg-primary/10 text-primary'
                          : status === 'ended_today'
                            ? 'bg-accent/10 text-accent'
                            : status === 'upcoming'
                              ? 'bg-lavender/30 text-lavender-foreground'
                              : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      {STATUS_LABEL[status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/group-buys/${groupBuy.id}/edit`}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      수정
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

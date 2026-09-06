import Link from 'next/link'
import { ProductThumbnail } from '@/components/ProductThumbnail'
import { PriceComparison } from '@/components/PriceComparison'
import { ProductInterestOverlayButton } from '@/components/InterestButtons'
import { formatGroupBuyDeadline } from '@/lib/formatDeadline'
import type { HomeGroupBuy, InterestReason } from '@/types/domain'

// 관심(공구/인플루언서) 관련 배지는 전부 소프트 라벤더 — 코랄핑크는 긴급성/할인 전용으로 아낀다.
const REASON_LABEL: Record<InterestReason, string> = {
  product: '관심 상품',
  influencer: '관심 인플루언서',
}

export function GroupBuyCard({
  groupBuy,
  isInterested = false,
  reasons,
}: {
  groupBuy: HomeGroupBuy
  isInterested?: boolean
  reasons?: InterestReason[]
}) {
  const deadlineLabel = formatGroupBuyDeadline(groupBuy.start_date, groupBuy.end_date)
  const isUrgent = groupBuy.status === 'ended_today'
  const href = `/group-buys/${groupBuy.id}`

  return (
    <div className="group flex h-full flex-col">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md">
        <Link href={href} className="absolute inset-0">
          <ProductThumbnail
            imageUrl={groupBuy.product.image_url}
            label={groupBuy.product.name}
            brand={groupBuy.product.brand}
            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          />

          <span
            className={`absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold text-white shadow-sm ${
              isUrgent ? 'bg-accent' : 'bg-neutral-900/80'
            }`}
          >
            {deadlineLabel}
          </span>
        </Link>

        {/* 링크(카드 이미지) 위에 겹치는 형제 요소 — <a> 안에 <form>/<button>을 두면
            안 되므로 절대 위치로 분리했다 */}
        <ProductInterestOverlayButton productId={groupBuy.product_id} isInterested={isInterested} />
      </div>

      <Link href={href} className="mt-3 flex flex-1 flex-col gap-1">
        {reasons && reasons.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {reasons.map((reason) => (
              <span
                key={reason}
                className="rounded-sm bg-lavender/40 px-1.5 py-0.5 text-[10px] font-bold text-lavender-foreground"
              >
                {REASON_LABEL[reason]}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <p className="max-w-[55%] truncate text-xs font-bold text-neutral-500">
            {groupBuy.product.brand}
          </p>
          <span className="flex max-w-[45%] shrink-0 items-center gap-0.5 overflow-hidden rounded-sm bg-lavender/30 px-1.5 py-0.5 text-[10px] font-semibold text-lavender-foreground">
            <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5 shrink-0" aria-hidden="true">
              <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="2" />
              <path
                d="M4.5 20c1.4-3.6 4.6-5.5 7.5-5.5s6.1 1.9 7.5 5.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="truncate">{groupBuy.influencer.name}</span>
          </span>
        </div>
        <p className="line-clamp-2 break-keep text-sm font-semibold leading-snug text-neutral-900 group-hover:underline">
          {groupBuy.product.name}
        </p>

        <div className="mt-auto border-t border-neutral-100 pt-2">
          <PriceComparison price={groupBuy.price} originalPrice={groupBuy.original_price} />
        </div>

        {!groupBuy.purchase_url && (
          <p className="text-xs text-neutral-400">구매 링크 준비중</p>
        )}
      </Link>
    </div>
  )
}

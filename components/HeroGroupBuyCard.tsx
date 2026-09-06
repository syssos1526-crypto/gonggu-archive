import Link from 'next/link'
import { ProductThumbnail } from '@/components/ProductThumbnail'
import { formatGroupBuyDeadline } from '@/lib/formatDeadline'
import { getSavings } from '@/lib/priceComparison'
import type { HomeGroupBuy } from '@/types/domain'

// 실제 데이터 기반 히어로 — 마감 라벨은 formatGroupBuyDeadline이 공구의 실제
// status(진행중/오늘마감/공개예정/종료)를 그대로 계산하므로, 진행중 공구가
// 없어 최근 등록 공구로 대체되는 경우에도 상태 문구가 항상 정확하다.
export function HeroGroupBuyCard({ groupBuy }: { groupBuy: HomeGroupBuy }) {
  const deadlineLabel = formatGroupBuyDeadline(groupBuy.start_date, groupBuy.end_date)
  const isUrgent = groupBuy.status === 'ended_today'
  const savings = getSavings(groupBuy.price, groupBuy.original_price)

  return (
    <Link
      href={`/group-buys/${groupBuy.id}`}
      className="group relative block overflow-hidden rounded-2xl bg-neutral-900 shadow-md"
    >
      <ProductThumbnail
        imageUrl={groupBuy.product.image_url}
        label={groupBuy.product.name}
        brand={groupBuy.product.brand}
        className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-105 sm:aspect-[21/9]"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

      {/* isUrgent(accent 배경)일 땐 accent-foreground로 대비 확보(흰 텍스트는
          작은 글씨 기준 AA 미달) */}
      <span
        className={`absolute left-4 top-4 rounded-full px-2.5 py-1 text-xs font-bold ${
          isUrgent ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground'
        }`}
      >
        {deadlineLabel}
      </span>

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
        <p className="text-xs font-bold text-white/70">{groupBuy.product.brand}</p>
        <p className="mt-0.5 line-clamp-2 break-keep text-lg font-bold text-white sm:text-xl">
          {groupBuy.product.name}
        </p>
        <div className="mt-2 flex items-end gap-2">
          {savings && (
            <span className="tabular-nums text-xl font-extrabold leading-none text-accent-dark sm:text-2xl">
              {savings.percent}%
            </span>
          )}
          <span className="tabular-nums text-xl font-extrabold leading-none text-white sm:text-2xl">
            {groupBuy.price.toLocaleString()}원
          </span>
          {savings && (
            <span className="tabular-nums text-xs text-white/50 line-through">
              {groupBuy.original_price?.toLocaleString()}원
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

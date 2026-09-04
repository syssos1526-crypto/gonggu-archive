import Link from 'next/link'
import { ProductThumbnail } from '@/components/ProductThumbnail'
import { formatFullDate } from '@/lib/formatDeadline'
import type { ProductSummary } from '@/types/domain'

export function ProductSummaryCard({ product }: { product: ProductSummary }) {
  const lastDateLabel = product.lastGroupBuyDate
    ? formatFullDate(product.lastGroupBuyDate)
    : '기록 없음'

  return (
    <Link
      href={`/search?q=${encodeURIComponent(product.name)}&tab=group_buys`}
      className="group flex h-full flex-col"
    >
      <ProductThumbnail
        imageUrl={product.image_url}
        label={product.name}
        brand={product.brand}
        className="aspect-[4/5] w-full overflow-hidden rounded-md transition-transform duration-500 group-hover:scale-105"
      />
      <div className="mt-3 flex flex-1 flex-col gap-1">
        <p className="truncate text-xs font-bold text-neutral-500">{product.brand}</p>
        <p className="line-clamp-2 break-keep text-sm font-semibold text-neutral-900 group-hover:underline">
          {product.name}
        </p>
        <p className="mt-auto tabular-nums text-xs text-neutral-400">
          공구 {product.groupBuyCount}회 · 최근 {lastDateLabel}
        </p>
      </div>
    </Link>
  )
}

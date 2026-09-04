import Link from 'next/link'
import type { BrandSummary } from '@/types/domain'

export function PopularBrandChips({ brands }: { brands: BrandSummary[] }) {
  return (
    <div className="flex flex-wrap gap-2.5 rounded-md bg-lavender/15 p-4">
      {brands.map((brand) => (
        <Link
          key={brand.brand}
          href={`/search?q=${encodeURIComponent(brand.brand)}&tab=group_buys`}
          className="flex min-w-[110px] items-center justify-between gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2.5 shadow-sm transition-colors hover:border-lavender-dark"
        >
          <span className="truncate break-keep text-[13px] font-semibold text-neutral-700">
            {brand.brand}
          </span>
          <span className="shrink-0 tabular-nums text-[11px] text-neutral-400">
            {brand.groupBuyCount}회
          </span>
        </Link>
      ))}
    </div>
  )
}

import { getSavings } from '@/lib/priceComparison'

export function PriceComparison({
  price,
  originalPrice,
  size = 'sm',
}: {
  price: number
  originalPrice: number | null
  size?: 'sm' | 'lg'
}) {
  const savings = getSavings(price, originalPrice)
  // 위계: 할인가(가장 큼) > 할인율(중간, 코랄 강조) > 정가(취소선, 가장 작음)
  const priceClass = size === 'lg' ? 'text-2xl' : 'text-xl'
  const percentClass = size === 'lg' ? 'text-lg' : 'text-base'

  return (
    <div>
      {savings && (
        <p className="tabular-nums text-xs text-neutral-400 line-through">
          {originalPrice?.toLocaleString()}원
        </p>
      )}
      <div className="flex items-end gap-2">
        {savings && (
          <span className={`tabular-nums font-bold leading-none text-accent ${percentClass}`}>
            {savings.percent}%
          </span>
        )}
        <span className={`tabular-nums font-extrabold leading-none text-neutral-900 ${priceClass}`}>
          {price.toLocaleString()}원
        </span>
      </div>
      {savings && (
        <p className="mt-1 tabular-nums text-xs font-semibold text-success">
          {savings.amount.toLocaleString()}원 절약
        </p>
      )}
    </div>
  )
}

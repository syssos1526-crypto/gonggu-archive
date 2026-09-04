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
  const priceClass = size === 'lg' ? 'text-2xl' : 'text-lg'
  const percentClass = size === 'lg' ? 'text-xl' : 'text-lg'

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

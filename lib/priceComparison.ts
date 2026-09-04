export interface Savings {
  amount: number
  percent: number
}

export function getSavings(price: number, originalPrice: number | null): Savings | null {
  if (originalPrice == null || originalPrice <= price) return null

  const amount = originalPrice - price
  const percent = Math.round((amount / originalPrice) * 100)
  return { amount, percent }
}

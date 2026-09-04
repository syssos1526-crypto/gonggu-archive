import { toggleInfluencerInterest, toggleProductInterest } from '@/lib/actions/interests'

const HEART_PATH =
  'M12 20.5s-7-4.35-9.5-8.5C.9 8.9 2.3 5.5 5.5 5.5c1.9 0 3.4 1.1 4.5 2.6C11.1 6.6 12.6 5.5 14.5 5.5c3.2 0 4.6 3.4 3 6.5-2.5 4.15-9.5 8.5-9.5 8.5z'

function HeartIcon({ filled, className }: { filled: boolean; className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'} aria-hidden="true">
      <path d={HEART_PATH} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

// 관심(하트)는 소프트 라벤더 — 코랄핑크는 긴급성/할인 전용으로 남겨둔다.

// 카드 이미지 모서리에 얹는 작은 원형 하트 버튼 (관심 공구 = 상품 기준)
export function ProductInterestOverlayButton({
  productId,
  isInterested,
}: {
  productId: string
  isInterested: boolean
}) {
  return (
    <form action={toggleProductInterest} className="absolute top-3 right-3 z-10">
      <input type="hidden" name="productId" value={productId} />
      <button
        type="submit"
        aria-label={isInterested ? '관심 공구 해제' : '관심 공구 등록'}
        aria-pressed={isInterested}
        className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm ${
          isInterested ? 'text-lavender-foreground' : 'text-neutral-400'
        }`}
      >
        <HeartIcon filled={isInterested} className="h-4 w-4" />
      </button>
    </form>
  )
}

// 상세 페이지용 라벨 있는 하트 버튼
export function ProductInterestButton({
  productId,
  isInterested,
}: {
  productId: string
  isInterested: boolean
}) {
  return (
    <form action={toggleProductInterest}>
      <input type="hidden" name="productId" value={productId} />
      <button
        type="submit"
        aria-pressed={isInterested}
        className={`flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-bold ${
          isInterested
            ? 'border-lavender-dark bg-lavender/20 text-lavender-foreground'
            : 'border-neutral-300 text-neutral-500 hover:border-lavender-dark hover:text-lavender-foreground'
        }`}
      >
        <HeartIcon filled={isInterested} className="h-4 w-4" />
        {isInterested ? '관심 공구 해제' : '관심 공구 등록'}
      </button>
    </form>
  )
}

export function InfluencerInterestButton({
  influencerId,
  isInterested,
}: {
  influencerId: string
  isInterested: boolean
}) {
  return (
    <form action={toggleInfluencerInterest}>
      <input type="hidden" name="influencerId" value={influencerId} />
      <button
        type="submit"
        aria-pressed={isInterested}
        className={`flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-bold ${
          isInterested
            ? 'border-lavender-dark bg-lavender/20 text-lavender-foreground'
            : 'border-neutral-300 text-neutral-500 hover:border-lavender-dark hover:text-lavender-foreground'
        }`}
      >
        <HeartIcon filled={isInterested} className="h-4 w-4" />
        {isInterested ? '관심 인플루언서 해제' : '관심 인플루언서 등록'}
      </button>
    </form>
  )
}

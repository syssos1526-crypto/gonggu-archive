import Link from 'next/link'
import { ProductThumbnail } from '@/components/ProductThumbnail'
import type { InfluencerSummary } from '@/types/domain'

export function InfluencerSummaryCard({ influencer }: { influencer: InfluencerSummary }) {
  return (
    <Link
      href={`/influencers/${influencer.id}`}
      className="flex h-full flex-col items-center gap-1 rounded-md border border-neutral-200 bg-white p-4 text-center transition-colors hover:border-lavender-dark"
    >
      <ProductThumbnail
        imageUrl={influencer.profile_image_url}
        label={influencer.name}
        variant="avatar"
        className="h-16 w-16 rounded-full"
      />
      <p className="mt-1 break-keep text-sm font-semibold text-neutral-900">{influencer.name}</p>
      <p className="tabular-nums text-xs text-neutral-400">
        팔로워 {influencer.follower_count.toLocaleString()}명
      </p>
      <p className="tabular-nums text-xs text-neutral-400">신뢰도 {influencer.trust_score}</p>
      <p className="mt-auto tabular-nums text-xs text-neutral-400">
        공구 {influencer.groupBuyCount}회
      </p>
    </Link>
  )
}

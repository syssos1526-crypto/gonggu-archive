import { notFound } from "next/navigation";
import { GroupBuyCard } from "@/components/GroupBuyCard";
import { InfluencerInterestButton } from "@/components/InterestButtons";
import { PageShell } from "@/components/PageShell";
import { ProductThumbnail } from "@/components/ProductThumbnail";
import { Section } from "@/components/Section";
import {
  getGroupBuysByInfluencer,
  getInfluencerById,
} from "@/lib/queries/influencerDetail";
import {
  getInterestedInfluencerIds,
  getInterestedProductIds,
} from "@/lib/queries/interests";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function InfluencerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const influencer = await getInfluencerById(id).catch(() => null);
  if (!influencer) notFound();

  const groupBuys = await getGroupBuysByInfluencer(influencer.id).catch(() => []);

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  let isInfluencerInterested = false;
  let interestedProductIds = new Set<string>();
  if (user) {
    const [influencerIds, productIds] = await Promise.all([
      getInterestedInfluencerIds(supabase, user.id, [influencer.id]),
      getInterestedProductIds(supabase, user.id, groupBuys.map((gb) => gb.product_id)),
    ]);
    isInfluencerInterested = influencerIds.has(influencer.id);
    interestedProductIds = productIds;
  }

  return (
    <PageShell>
      <div className="flex flex-col items-center gap-4 rounded-lg bg-lavender/15 p-6 text-center sm:flex-row sm:text-left">
        <ProductThumbnail
          imageUrl={influencer.profile_image_url}
          label={influencer.name}
          variant="avatar"
          className="h-24 w-24 shrink-0 rounded-full"
        />
        <div className="flex-1">
          <h1 className="break-keep text-2xl font-bold text-neutral-900">{influencer.name}</h1>
          <p className="text-sm text-neutral-500">@{influencer.instagram_handle}</p>
          <p className="mt-1 tabular-nums text-sm text-neutral-500">
            팔로워 {influencer.follower_count.toLocaleString()}명 · 신뢰도 {influencer.trust_score}
          </p>
        </div>
        <InfluencerInterestButton influencerId={influencer.id} isInterested={isInfluencerInterested} />
      </div>

      <div className="mt-10">
        <Section
          title="진행한 공구"
          tone="lavender"
          isEmpty={groupBuys.length === 0}
          emptyText="아직 등록된 공구가 없습니다."
        >
          {groupBuys.map((groupBuy) => (
            <GroupBuyCard
              key={groupBuy.id}
              groupBuy={groupBuy}
              isInterested={interestedProductIds.has(groupBuy.product_id)}
            />
          ))}
        </Section>
      </div>
    </PageShell>
  );
}

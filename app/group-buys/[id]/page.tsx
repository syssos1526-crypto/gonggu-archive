import Link from "next/link";
import { notFound } from "next/navigation";
import { GroupBuyCard } from "@/components/GroupBuyCard";
import { ProductInterestButton } from "@/components/InterestButtons";
import { PageShell } from "@/components/PageShell";
import { PriceComparison } from "@/components/PriceComparison";
import { ProductThumbnail } from "@/components/ProductThumbnail";
import { Section } from "@/components/Section";
import { logEvent } from "@/lib/analytics/logEvent";
import { formatFullDate, formatGroupBuyDeadline } from "@/lib/formatDeadline";
import {
  getGroupBuyById,
  getOtherGroupBuysForProduct,
} from "@/lib/queries/groupBuyDetail";
import { getInterestedProductIds } from "@/lib/queries/interests";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function GroupBuyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const groupBuy = await getGroupBuyById(id).catch(() => null);
  if (!groupBuy) notFound();

  const otherGroupBuys = await getOtherGroupBuysForProduct(groupBuy.product_id, groupBuy.id).catch(
    () => []
  );

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  let interestedProductIds = new Set<string>();
  if (user) {
    const productIds = [groupBuy.product_id, ...otherGroupBuys.map((gb) => gb.product_id)];
    interestedProductIds = await getInterestedProductIds(supabase, user.id, productIds);
    await logEvent({
      supabase,
      userId: user.id,
      eventType: "group_buy_viewed",
      groupBuyId: groupBuy.id,
      productId: groupBuy.product_id,
      influencerId: groupBuy.influencer.id,
    });
  }

  const deadlineLabel = formatGroupBuyDeadline(groupBuy.start_date, groupBuy.end_date);
  const isUrgent = groupBuy.status === "ended_today";

  return (
    <PageShell>
      <div className="grid gap-6 sm:grid-cols-2">
        <ProductThumbnail
          imageUrl={groupBuy.product.image_url}
          label={groupBuy.product.name}
          brand={groupBuy.product.brand}
          className="aspect-[4/5] w-full rounded-md"
        />

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-bold text-neutral-500">{groupBuy.product.brand}</p>
            <h1 className="mt-1 break-keep text-2xl font-bold text-neutral-900">
              {groupBuy.product.name}
            </h1>
            <Link
              href={`/influencers/${groupBuy.influencer.id}`}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-lavender/30 px-3 py-1 text-sm font-semibold text-lavender-foreground hover:bg-lavender/50"
            >
              {groupBuy.influencer.name}의 공구 · 신뢰도{" "}
              <span className="tabular-nums">{groupBuy.influencer.trust_score}</span>
            </Link>
          </div>

          <div className="rounded-md border border-neutral-200 p-4">
            <PriceComparison price={groupBuy.price} originalPrice={groupBuy.original_price} size="lg" />
          </div>

          <div
            className={`rounded-md p-4 text-white ${isUrgent ? "bg-accent" : "bg-neutral-900"}`}
          >
            <p className="text-sm font-bold">{deadlineLabel}</p>
            <p className="mt-1 tabular-nums text-xs text-white/80">
              {formatFullDate(groupBuy.start_date)} ~ {formatFullDate(groupBuy.end_date)}
            </p>
          </div>

          {groupBuy.purchase_url ? (
            <a
              href={`/go/${groupBuy.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-primary px-6 py-3 text-center text-sm font-bold text-primary-foreground hover:bg-primary-dark"
            >
              구매하러 가기
            </a>
          ) : (
            <div className="rounded-full border border-neutral-200 px-6 py-3 text-center text-sm text-neutral-400">
              구매 링크 준비중
            </div>
          )}

          <ProductInterestButton
            productId={groupBuy.product_id}
            isInterested={interestedProductIds.has(groupBuy.product_id)}
          />
        </div>
      </div>

      <div className="mt-10">
        <Section
          title="이 상품의 다른 공구 이력"
          isEmpty={otherGroupBuys.length === 0}
          emptyText="이 상품의 다른 공구 이력이 없습니다."
        >
          {otherGroupBuys.map((item) => (
            <GroupBuyCard
              key={item.id}
              groupBuy={item}
              isInterested={interestedProductIds.has(item.product_id)}
            />
          ))}
        </Section>
      </div>
    </PageShell>
  );
}

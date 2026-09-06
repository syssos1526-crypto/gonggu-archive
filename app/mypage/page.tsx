import { redirect } from "next/navigation";
import { GroupBuyCard } from "@/components/GroupBuyCard";
import { InfluencerSummaryCard } from "@/components/InfluencerSummaryCard";
import { PageShell } from "@/components/PageShell";
import { Section } from "@/components/Section";
import { getErrorMessage } from "@/lib/getErrorMessage";
import {
  getInterestedInfluencers,
  getInterestedProductGroupBuys,
} from "@/lib/queries/interests";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { InfluencerSummary } from "@/types/domain";
import type { HomeGroupBuy } from "@/types/domain";

export const dynamic = "force-dynamic";

type Tab = "products" | "influencers";

function buildMyPageHref(tab: Tab) {
  return `/mypage?tab=${tab}`;
}

export default async function MyPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: rawTab } = await searchParams;
  const tab: Tab = rawTab === "influencers" ? "influencers" : "products";

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let error: string | null = null;
  let groupBuys: HomeGroupBuy[] = [];
  let influencers: InfluencerSummary[] = [];

  try {
    if (tab === "products") {
      groupBuys = await getInterestedProductGroupBuys(supabase, user.id);
    } else {
      influencers = await getInterestedInfluencers(supabase, user.id);
    }
  } catch (e) {
    error = getErrorMessage(e);
  }

  return (
    <PageShell activeNav="mypage">
      <h1 className="text-xl font-bold text-neutral-900">마이페이지</h1>
      <p className="mt-1 text-sm text-neutral-500">{user.email}</p>

      <div className="mt-5 flex gap-6 border-b border-neutral-200">
        <a
          href={buildMyPageHref("products")}
          className={`pb-2 text-sm font-bold ${
            tab === "products"
              ? "border-b-2 border-lavender-dark text-lavender-foreground"
              : "text-neutral-400 hover:text-neutral-700"
          }`}
        >
          관심 공구
        </a>
        <a
          href={buildMyPageHref("influencers")}
          className={`pb-2 text-sm font-bold ${
            tab === "influencers"
              ? "border-b-2 border-lavender-dark text-lavender-foreground"
              : "text-neutral-400 hover:text-neutral-700"
          }`}
        >
          관심 인플루언서
        </a>
      </div>

      <div className="mt-5">
        {error && <p className="text-sm text-red-600">데이터를 불러오지 못했습니다: {error}</p>}

        {!error && tab === "products" && (
          <Section
            title="관심 공구"
            tone="lavender"
            isEmpty={groupBuys.length === 0}
            emptyText="관심 등록한 공구가 없습니다."
          >
            {groupBuys.map((groupBuy) => (
              <GroupBuyCard key={groupBuy.id} groupBuy={groupBuy} isInterested />
            ))}
          </Section>
        )}

        {!error && tab === "influencers" && (
          <Section
            title="관심 인플루언서"
            tone="lavender"
            isEmpty={influencers.length === 0}
            emptyText="관심 등록한 인플루언서가 없습니다."
          >
            {influencers.map((influencer) => (
              <InfluencerSummaryCard key={influencer.id} influencer={influencer} />
            ))}
          </Section>
        )}
      </div>
    </PageShell>
  );
}

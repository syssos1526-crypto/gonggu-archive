import Link from "next/link";
import { redirect } from "next/navigation";
import { GroupBuyCard } from "@/components/GroupBuyCard";
import { PageShell } from "@/components/PageShell";
import { Section } from "@/components/Section";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { getInterestFeed } from "@/lib/queries/feed";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { FeedGroupBuy } from "@/types/domain";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let error: string | null = null;
  let feed: FeedGroupBuy[] = [];

  try {
    feed = await getInterestFeed(supabase, user.id);
  } catch (e) {
    error = getErrorMessage(e);
  }

  const endingToday = feed.filter((gb) => gb.status === "ended_today");
  const ongoing = feed.filter((gb) => gb.status === "ongoing");
  const upcoming = feed.filter((gb) => gb.status === "upcoming");
  const hasNoInterests = !error && feed.length === 0;

  return (
    <PageShell>
      <h1 className="text-xl font-bold text-neutral-900">관심 피드</h1>
      <p className="mt-1 break-keep text-sm text-neutral-500">
        관심 등록한 상품·인플루언서와 연결된, 아직 끝나지 않은 공구예요.
      </p>

      <div className="mt-6">
        {error && <p className="text-sm text-red-600">데이터를 불러오지 못했습니다: {error}</p>}

        {hasNoInterests ? (
          <div className="rounded-md border border-dashed border-lavender-dark/50 bg-lavender/10 px-4 py-10 text-center">
            <p className="break-keep text-sm text-neutral-500">
              아직 관심 등록한 상품이나 인플루언서가 없어요.
            </p>
            <Link
              href="/search"
              className="mt-4 inline-block rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary-dark"
            >
              검색하러 가기
            </Link>
          </div>
        ) : (
          !error && (
            <div className="space-y-9">
              <Section
                title="🔥 오늘 마감"
                tone="accent"
                isEmpty={endingToday.length === 0}
                emptyText="오늘 마감되는 관심 공구가 없습니다."
              >
                {endingToday.map((groupBuy) => (
                  <GroupBuyCard
                    key={groupBuy.id}
                    groupBuy={groupBuy}
                    isInterested={groupBuy.reasons.includes("product")}
                    reasons={groupBuy.reasons}
                  />
                ))}
              </Section>

              <Section
                title="진행 중"
                tone="lavender"
                isEmpty={ongoing.length === 0}
                emptyText="진행 중인 관심 공구가 없습니다."
              >
                {ongoing.map((groupBuy) => (
                  <GroupBuyCard
                    key={groupBuy.id}
                    groupBuy={groupBuy}
                    isInterested={groupBuy.reasons.includes("product")}
                    reasons={groupBuy.reasons}
                  />
                ))}
              </Section>

              <Section
                title="공개 예정"
                tone="lavender"
                isEmpty={upcoming.length === 0}
                emptyText="공개 예정인 관심 공구가 없습니다."
              >
                {upcoming.map((groupBuy) => (
                  <GroupBuyCard
                    key={groupBuy.id}
                    groupBuy={groupBuy}
                    isInterested={groupBuy.reasons.includes("product")}
                    reasons={groupBuy.reasons}
                  />
                ))}
              </Section>
            </div>
          )
        )}
      </div>
    </PageShell>
  );
}

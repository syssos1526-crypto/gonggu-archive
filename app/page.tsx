import Link from "next/link";
import { GroupBuyCard } from "@/components/GroupBuyCard";
import { HeroGroupBuyCard } from "@/components/HeroGroupBuyCard";
import { PageShell } from "@/components/PageShell";
import { PopularBrandChips } from "@/components/PopularBrandChips";
import { Section } from "@/components/Section";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { getInterestedProductIds } from "@/lib/queries/interests";
import {
  getEndingTodayGroupBuys,
  getOngoingGroupBuys,
  getPopularBrands,
  getRecentlyEndedGroupBuys,
  getUpcomingGroupBuys,
} from "@/lib/queries/home";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { BrandSummary, HomeGroupBuy } from "@/types/domain";

// 진행중/오늘종료 판정이 현재 시각 기준이라 정적 프리렌더링을 막아야 함
export const dynamic = "force-dynamic";

const HOME_RECENTLY_ENDED_LIMIT = 4;

type HomeData = {
  ongoing: HomeGroupBuy[]
  endingToday: HomeGroupBuy[]
  upcoming: HomeGroupBuy[]
  recentlyEnded: HomeGroupBuy[]
  popularBrands: BrandSummary[]
}

export default async function Home() {
  let homeData: HomeData | null = null
  let error: string | null = null
  let interestedProductIds = new Set<string>()

  try {
    const [ongoing, endingToday, upcoming, recentlyEnded, popularBrands] = await Promise.all([
      getOngoingGroupBuys(),
      getEndingTodayGroupBuys(),
      getUpcomingGroupBuys(),
      getRecentlyEndedGroupBuys(HOME_RECENTLY_ENDED_LIMIT),
      getPopularBrands(),
    ])
    homeData = { ongoing, endingToday, upcoming, recentlyEnded, popularBrands }

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const productIds = [...ongoing, ...endingToday, ...upcoming, ...recentlyEnded].map(
        (gb) => gb.product_id
      )
      interestedProductIds = await getInterestedProductIds(supabase, user.id, productIds)
    }
  } catch (e) {
    error = getErrorMessage(e)
  }

  // 히어로: 진행중(+오늘마감) 중 마감이 가장 임박한 항목. 그런 공구가 전혀
  // 없으면 오픈 예정 → 최근 종료 순으로 대체하되, formatGroupBuyDeadline이
  // 실제 status를 계산해 보여주므로 라벨은 항상 정확하다(가짜 "마감임박" 없음).
  const heroGroupBuy =
    homeData &&
    ([...homeData.endingToday, ...homeData.ongoing].sort(
      (a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
    )[0] ??
      homeData.upcoming[0] ??
      homeData.recentlyEnded[0] ??
      null)

  return (
    <PageShell activeCategory="all" activeNav="home">
      {error && (
        <p className="text-sm text-red-600">데이터를 불러오지 못했습니다: {error}</p>
      )}

      {homeData && (
        <div className="space-y-9">
          {heroGroupBuy && <HeroGroupBuyCard groupBuy={heroGroupBuy} />}

          {homeData.popularBrands.length > 0 && (
            <section>
              <h2 className="mb-3 border-b-2 border-lavender-dark pb-2 text-lg font-bold text-neutral-900">
                ✨ 실시간 인기 공구 브랜드
              </h2>
              <PopularBrandChips brands={homeData.popularBrands} />
            </section>
          )}

          {/* 오늘 마감/마감 임박 흐름은 기존 그대로 유지 — 비어 있어도 안내 문구를 보여준다 */}
          <Section
            id="today-ending"
            title="🔥 오늘 종료 임박!"
            tone="accent"
            isEmpty={homeData.endingToday.length === 0}
            emptyText="오늘 종료되는 공구가 없습니다."
          >
            {homeData.endingToday.map((groupBuy) => (
              <GroupBuyCard
                key={groupBuy.id}
                groupBuy={groupBuy}
                isInterested={interestedProductIds.has(groupBuy.product_id)}
              />
            ))}
          </Section>

          {/* 아래 세 섹션은 상태별로 완전히 분리해서만 보여주고(진행중/오픈예정/종료
              뒤섞임 없음), 데이터가 없으면 큰 빈 카드 대신 섹션 자체를 숨긴다 */}
          {homeData.ongoing.length > 0 && (
            <Section title="진행 중인 공구" tone="primary" isEmpty={false} emptyText="">
              {homeData.ongoing.map((groupBuy) => (
                <GroupBuyCard
                  key={groupBuy.id}
                  groupBuy={groupBuy}
                  isInterested={interestedProductIds.has(groupBuy.product_id)}
                />
              ))}
            </Section>
          )}

          {homeData.upcoming.length > 0 && (
            <Section title="오픈 예정 공구" tone="lavender" isEmpty={false} emptyText="">
              {homeData.upcoming.map((groupBuy) => (
                <GroupBuyCard
                  key={groupBuy.id}
                  groupBuy={groupBuy}
                  isInterested={interestedProductIds.has(groupBuy.product_id)}
                />
              ))}
            </Section>
          )}

          {homeData.recentlyEnded.length > 0 && (
            <Section
              title="최근 종료된 공구"
              isEmpty={false}
              emptyText=""
              headerAction={
                <Link href="/ended" className="shrink-0 text-xs font-semibold text-primary hover:underline">
                  종료 공구 모아보기
                </Link>
              }
            >
              {homeData.recentlyEnded.map((groupBuy) => (
                <GroupBuyCard
                  key={groupBuy.id}
                  groupBuy={groupBuy}
                  isInterested={interestedProductIds.has(groupBuy.product_id)}
                />
              ))}
            </Section>
          )}
        </div>
      )}
    </PageShell>
  );
}

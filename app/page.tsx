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
  getRecentGroupBuys,
} from "@/lib/queries/home";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { BrandSummary, HomeGroupBuy } from "@/types/domain";

// 진행중/오늘종료 판정이 현재 시각 기준이라 정적 프리렌더링을 막아야 함
export const dynamic = "force-dynamic";

type HomeData = {
  ongoing: HomeGroupBuy[]
  endingToday: HomeGroupBuy[]
  recent: HomeGroupBuy[]
  popularBrands: BrandSummary[]
}

export default async function Home() {
  let homeData: HomeData | null = null
  let error: string | null = null
  let interestedProductIds = new Set<string>()

  try {
    const [ongoing, endingToday, recent, popularBrands] = await Promise.all([
      getOngoingGroupBuys(),
      getEndingTodayGroupBuys(),
      getRecentGroupBuys(),
      getPopularBrands(),
    ])
    homeData = { ongoing, endingToday, recent, popularBrands }

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const productIds = [...ongoing, ...endingToday, ...recent].map((gb) => gb.product_id)
      interestedProductIds = await getInterestedProductIds(supabase, user.id, productIds)
    }
  } catch (e) {
    error = getErrorMessage(e)
  }

  // 히어로: 진행중(+오늘마감) 중 마감이 가장 임박한 항목. 진행중 공구가
  // 전혀 없으면 최근 등록 공구로 대체하되, formatGroupBuyDeadline이 실제
  // status를 계산해 보여주므로 라벨이 항상 정확하다(가짜 "마감임박" 없음).
  const heroGroupBuy =
    homeData &&
    ([...homeData.endingToday, ...homeData.ongoing].sort(
      (a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
    )[0] ??
      homeData.recent[0] ??
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

          <Section
            title="진행 중인 인기 공구"
            tone="primary"
            isEmpty={homeData.ongoing.length === 0}
            emptyText="현재 진행 중인 공구가 없습니다."
          >
            {homeData.ongoing.map((groupBuy) => (
              <GroupBuyCard
                key={groupBuy.id}
                groupBuy={groupBuy}
                isInterested={interestedProductIds.has(groupBuy.product_id)}
              />
            ))}
          </Section>

          <Section
            title="🆕 방금 오픈했어요! 최근 등록 공구"
            tone="lavender"
            isEmpty={homeData.recent.length === 0}
            emptyText="등록된 공구가 없습니다."
          >
            {homeData.recent.map((groupBuy) => (
              <GroupBuyCard
                key={groupBuy.id}
                groupBuy={groupBuy}
                isInterested={interestedProductIds.has(groupBuy.product_id)}
              />
            ))}
          </Section>
        </div>
      )}
    </PageShell>
  );
}

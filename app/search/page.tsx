import { GroupBuyCard } from "@/components/GroupBuyCard";
import { InfluencerSummaryCard } from "@/components/InfluencerSummaryCard";
import { ProductSummaryCard } from "@/components/ProductSummaryCard";
import { Section } from "@/components/Section";
import { EmptyState } from "@/components/EmptyState";
import { PageShell } from "@/components/PageShell";
import { logEvent } from "@/lib/analytics/logEvent";
import { getErrorMessage } from "@/lib/getErrorMessage";
import {
  getInterestCounts,
  searchInfluencers,
  searchOngoingGroupBuys,
  searchPastGroupBuys,
  searchProducts,
} from "@/lib/queries/search";
import { getInterestedProductIds } from "@/lib/queries/interests";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { InfluencerSummary, ProductSummary } from "@/types/domain";

export const dynamic = "force-dynamic";

type Tab = "group_buys" | "products" | "influencers";
type Sort = "count" | "interest";

const TABS: { key: Tab; label: string }[] = [
  { key: "group_buys", label: "공구" },
  { key: "products", label: "상품" },
  { key: "influencers", label: "인플루언서" },
];

const SORTS: { key: Sort; label: string }[] = [
  { key: "count", label: "공구진행순" },
  { key: "interest", label: "관심순" },
];

function buildSearchHref(q: string, tab: Tab, sort?: Sort) {
  const params = new URLSearchParams({ q, tab });
  if (sort) params.set("sort", sort);
  return `/search?${params.toString()}`;
}

async function sortBySort<T extends { id: string; groupBuyCount: number }>(
  items: T[],
  sort: Sort,
  column: "product_id" | "influencer_id"
): Promise<T[]> {
  if (sort !== "interest" || items.length === 0) return items;

  const counts = await getInterestCounts(column, items.map((item) => item.id));
  return [...items].sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0));
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const tab: Tab =
    params.tab === "products" || params.tab === "influencers" ? params.tab : "group_buys";
  const sort: Sort = params.sort === "interest" ? "interest" : "count";

  let error: string | null = null;
  let ongoing: Awaited<ReturnType<typeof searchOngoingGroupBuys>> = [];
  let past: Awaited<ReturnType<typeof searchPastGroupBuys>> = [];
  let products: ProductSummary[] = [];
  let influencers: InfluencerSummary[] = [];
  let interestedProductIds = new Set<string>();

  if (q) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      let resultCount = 0;

      if (tab === "group_buys") {
        ongoing = await searchOngoingGroupBuys(q);
        if (ongoing.length === 0) {
          past = await searchPastGroupBuys(q);
        }

        if (user) {
          const productIds = [...ongoing, ...past].map((gb) => gb.product_id);
          interestedProductIds = await getInterestedProductIds(supabase, user.id, productIds);
        }
        resultCount = ongoing.length > 0 ? ongoing.length : past.length;
      } else if (tab === "products") {
        products = await sortBySort(await searchProducts(q), sort, "product_id");
        resultCount = products.length;
      } else {
        influencers = await sortBySort(await searchInfluencers(q), sort, "influencer_id");
        resultCount = influencers.length;
      }

      if (user) {
        await logEvent({
          supabase,
          userId: user.id,
          eventType: "search_submitted",
          metadata: { query: q, result_count: resultCount },
        });
      }
    } catch (e) {
      error = getErrorMessage(e);
    }
  }

  return (
    <PageShell searchValue={q} activeNav="search">
      {!q ? (
        <EmptyState message="검색어를 입력해주세요." />
      ) : (
        <div className="space-y-6">
          <div>
            <div className="flex gap-6 border-b border-neutral-200">
              {TABS.map((t) => (
                <a
                  key={t.key}
                  href={buildSearchHref(q, t.key)}
                  className={`pb-2 text-sm font-bold ${
                    tab === t.key
                      ? "border-b-2 border-primary text-primary"
                      : "text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  {t.label}
                </a>
              ))}
            </div>

            {tab !== "group_buys" && (
              <div className="mt-3 flex gap-3">
                {SORTS.map((s) => (
                  <a
                    key={s.key}
                    href={buildSearchHref(q, tab, s.key)}
                    className={`text-xs font-medium ${
                      sort === s.key ? "text-primary" : "text-neutral-400 hover:text-neutral-700"
                    }`}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-600">데이터를 불러오지 못했습니다: {error}</p>}

          {!error && tab === "group_buys" && (
            <>
              <Section
                title={`'${q}' 진행중인 공구`}
                tone="primary"
                isEmpty={ongoing.length === 0}
                emptyText="현재 진행 중인 공구가 없습니다."
              >
                {ongoing.map((groupBuy) => (
                  <GroupBuyCard
                    key={groupBuy.id}
                    groupBuy={groupBuy}
                    isInterested={interestedProductIds.has(groupBuy.product_id)}
                  />
                ))}
              </Section>

              {ongoing.length === 0 && (
                <Section
                  title="과거 공구 이력"
                  isEmpty={past.length === 0}
                  emptyText="과거 공구 이력도 없습니다."
                >
                  {past.map((groupBuy) => (
                    <GroupBuyCard
                      key={groupBuy.id}
                      groupBuy={groupBuy}
                      isInterested={interestedProductIds.has(groupBuy.product_id)}
                    />
                  ))}
                </Section>
              )}
            </>
          )}

          {!error && tab === "products" && (
            <Section
              title={`'${q}' 상품 검색 결과`}
              isEmpty={products.length === 0}
              emptyText="일치하는 상품이 없습니다."
            >
              {products.map((product) => (
                <ProductSummaryCard key={product.id} product={product} />
              ))}
            </Section>
          )}

          {!error && tab === "influencers" && (
            <Section
              title={`'${q}' 인플루언서 검색 결과`}
              tone="lavender"
              isEmpty={influencers.length === 0}
              emptyText="일치하는 인플루언서가 없습니다."
            >
              {influencers.map((influencer) => (
                <InfluencerSummaryCard key={influencer.id} influencer={influencer} />
              ))}
            </Section>
          )}
        </div>
      )}
    </PageShell>
  );
}

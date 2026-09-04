import { notFound } from "next/navigation";
import { GroupBuyCard } from "@/components/GroupBuyCard";
import { PageShell } from "@/components/PageShell";
import { Section } from "@/components/Section";
import { getErrorMessage } from "@/lib/getErrorMessage";
import {
  CATEGORY_CONFIG,
  getCategoryGroupBuys,
  isCategorySlug,
} from "@/lib/queries/category";
import { getInterestedProductIds } from "@/lib/queries/interests";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { HomeGroupBuy } from "@/types/domain";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isCategorySlug(slug)) notFound();

  const { label } = CATEGORY_CONFIG[slug];

  let error: string | null = null;
  let groupBuys: HomeGroupBuy[] = [];
  let interestedProductIds = new Set<string>();

  try {
    groupBuys = await getCategoryGroupBuys(slug);

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      interestedProductIds = await getInterestedProductIds(
        supabase,
        user.id,
        groupBuys.map((gb) => gb.product_id)
      );
    }
  } catch (e) {
    error = getErrorMessage(e);
  }

  return (
    <PageShell activeCategory={slug}>
      <h1 className="break-keep text-xl font-bold text-neutral-900">{label} 공구</h1>

      <div className="mt-5">
        {error && (
          <p className="text-sm text-red-600">데이터를 불러오지 못했습니다: {error}</p>
        )}

        {!error && (
          <Section
            title={`진행중인 ${label} 공구`}
            tone="primary"
            isEmpty={groupBuys.length === 0}
            emptyText={`${label} 카테고리에 등록된 공구가 없습니다.`}
          >
            {groupBuys.map((groupBuy) => (
              <GroupBuyCard
                key={groupBuy.id}
                groupBuy={groupBuy}
                isInterested={interestedProductIds.has(groupBuy.product_id)}
              />
            ))}
          </Section>
        )}
      </div>
    </PageShell>
  );
}

import { GroupBuyCard } from "@/components/GroupBuyCard";
import { PageShell } from "@/components/PageShell";
import { Section } from "@/components/Section";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { getRecentlyEndedGroupBuys } from "@/lib/queries/home";
import { getInterestedProductIds } from "@/lib/queries/interests";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { HomeGroupBuy } from "@/types/domain";

export const dynamic = "force-dynamic";

const ENDED_LIST_LIMIT = 60;

export default async function EndedGroupBuysPage() {
  let error: string | null = null;
  let groupBuys: HomeGroupBuy[] = [];
  let interestedProductIds = new Set<string>();

  try {
    groupBuys = await getRecentlyEndedGroupBuys(ENDED_LIST_LIMIT);

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
    <PageShell>
      <h1 className="break-keep text-xl font-bold text-neutral-900">종료된 공구 모아보기</h1>

      <div className="mt-5">
        {error && (
          <p className="text-sm text-red-600">데이터를 불러오지 못했습니다: {error}</p>
        )}

        {!error && (
          <Section
            title="최근 종료된 공구"
            isEmpty={groupBuys.length === 0}
            emptyText="종료된 공구가 없습니다."
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

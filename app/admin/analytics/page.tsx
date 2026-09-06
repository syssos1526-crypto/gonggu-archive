import { requireAdminUser } from "@/lib/auth/admin";
import { getErrorMessage } from "@/lib/getErrorMessage";
import {
  getEventTypeCountsLast7Days,
  getGroupBuyEngagement,
  getInfluencerEngagement,
  getTopSearchQueries,
  type EventTypeCount,
  type GroupBuyEngagement,
  type InfluencerEngagement,
  type TopSearchQuery,
} from "@/lib/queries/analytics";

export const dynamic = "force-dynamic";

const EVENT_TYPE_LABEL: Record<string, string> = {
  search_submitted: "검색",
  interest_added: "관심 등록",
  interest_removed: "관심 해제",
  group_buy_viewed: "공구 상세 조회",
  purchase_link_clicked: "구매 링크 클릭",
};

function eventTypeLabel(eventType: string): string {
  return EVENT_TYPE_LABEL[eventType] ?? eventType;
}

export default async function AdminAnalyticsPage() {
  await requireAdminUser();

  let error: string | null = null;
  let eventTypeCounts: EventTypeCount[] = [];
  let topSearchQueries: TopSearchQuery[] = [];
  let groupBuyEngagement: GroupBuyEngagement[] = [];
  let influencerEngagement: InfluencerEngagement[] = [];

  try {
    [eventTypeCounts, topSearchQueries, groupBuyEngagement, influencerEngagement] = await Promise.all([
      getEventTypeCountsLast7Days(),
      getTopSearchQueries(),
      getGroupBuyEngagement(),
      getInfluencerEngagement(),
    ]);
  } catch (e) {
    error = getErrorMessage(e);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-neutral-900">분석</h1>

      <div className="rounded-md border border-lavender-dark bg-lavender/15 p-4 text-sm text-lavender-foreground">
        현재는 초기 테스트 사용자 로그 수집 단계이며, 사용자 행동을 일반화한 분석 결과가 아닙니다.
      </div>

      {error && (
        <p className="text-sm text-accent-dark">데이터를 불러오지 못했습니다: {error}</p>
      )}

      {!error && (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-neutral-900">최근 7일 이벤트 유형별 수</h2>
            <div className="overflow-x-auto rounded-md border border-neutral-200 bg-white">
              <table className="w-full min-w-[360px] text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-neutral-500">
                    <th className="px-4 py-3 font-semibold">이벤트</th>
                    <th className="px-4 py-3 font-semibold">건수</th>
                  </tr>
                </thead>
                <tbody>
                  {eventTypeCounts.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-neutral-400">
                        최근 7일간 기록된 이벤트가 없습니다.
                      </td>
                    </tr>
                  )}
                  {eventTypeCounts.map((row) => (
                    <tr key={row.eventType} className="border-b border-neutral-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-neutral-900">
                        {eventTypeLabel(row.eventType)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-neutral-700">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-neutral-900">많이 검색한 검색어</h2>
            <div className="overflow-x-auto rounded-md border border-neutral-200 bg-white">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-neutral-500">
                    <th className="px-4 py-3 font-semibold">검색어</th>
                    <th className="px-4 py-3 font-semibold">검색 횟수</th>
                    <th className="px-4 py-3 font-semibold">평균 검색 결과 수</th>
                  </tr>
                </thead>
                <tbody>
                  {topSearchQueries.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-neutral-400">
                        기록된 검색 로그가 없습니다.
                      </td>
                    </tr>
                  )}
                  {topSearchQueries.map((row) => (
                    <tr key={row.query} className="border-b border-neutral-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-neutral-900">{row.query}</td>
                      <td className="px-4 py-3 tabular-nums text-neutral-700">{row.searchCount}</td>
                      <td className="px-4 py-3 tabular-nums text-neutral-700">
                        {row.avgResultCount === null ? "-" : row.avgResultCount.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-neutral-900">공구별 조회·관심·구매 링크 클릭</h2>
            <div className="overflow-x-auto rounded-md border border-neutral-200 bg-white">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-neutral-500">
                    <th className="px-4 py-3 font-semibold">상품</th>
                    <th className="px-4 py-3 font-semibold">상세 조회</th>
                    <th className="px-4 py-3 font-semibold">관심 등록</th>
                    <th className="px-4 py-3 font-semibold">구매 링크 클릭</th>
                  </tr>
                </thead>
                <tbody>
                  {groupBuyEngagement.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-neutral-400">
                        기록된 공구 관련 로그가 없습니다.
                      </td>
                    </tr>
                  )}
                  {groupBuyEngagement.map((row) => (
                    <tr key={row.groupBuyId} className="border-b border-neutral-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-neutral-900">
                        {row.brand ? `${row.brand} · ${row.productName}` : row.productName}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-neutral-700">{row.viewCount}</td>
                      <td className="px-4 py-3 tabular-nums text-neutral-700">{row.interestAddedCount}</td>
                      <td className="px-4 py-3 tabular-nums text-neutral-700">{row.purchaseClickCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-neutral-900">인플루언서별 공구 조회·구매 링크 클릭</h2>
            <div className="overflow-x-auto rounded-md border border-neutral-200 bg-white">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-neutral-500">
                    <th className="px-4 py-3 font-semibold">인플루언서</th>
                    <th className="px-4 py-3 font-semibold">공구 조회</th>
                    <th className="px-4 py-3 font-semibold">구매 링크 클릭</th>
                  </tr>
                </thead>
                <tbody>
                  {influencerEngagement.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-neutral-400">
                        기록된 인플루언서 관련 로그가 없습니다.
                      </td>
                    </tr>
                  )}
                  {influencerEngagement.map((row) => (
                    <tr key={row.influencerId} className="border-b border-neutral-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-neutral-900">{row.influencerName}</td>
                      <td className="px-4 py-3 tabular-nums text-neutral-700">{row.viewCount}</td>
                      <td className="px-4 py-3 tabular-nums text-neutral-700">{row.purchaseClickCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

-- =============================================================================
-- ZEN-A — event_logs 분석 쿼리 모음 (읽기 전용)
-- =============================================================================
-- 이 파일은 조회(SELECT)만 수행하며 어떤 데이터도 바꾸지 않습니다.
-- scripts/add-event-logs.sql을 먼저 실행해 event_logs 테이블이 있어야 하며,
-- 로그가 0건이거나 적더라도 에러 없이 빈 결과를 반환하도록 작성했습니다.
--
-- 주의: 지금은 개발자 본인(단일 사용자)의 로그만 쌓이는 초기 단계입니다.
-- 아래 쿼리 결과는 "쿼리가 의도대로 동작하는지"를 확인하는 용도이며,
-- 실제 사용자 행동의 대표값으로 해석하면 안 됩니다.
-- =============================================================================

-- 1) 최근 7일 이벤트 유형별 수
select
  event_type,
  count(*) as event_count
from public.event_logs
where created_at >= now() - interval '7 days'
group by event_type
order by event_count desc;


-- 2) 많이 검색한 검색어와 평균 검색 결과 수
select
  metadata->>'query' as query,
  count(*) as search_count,
  avg((metadata->>'result_count')::numeric) as avg_result_count
from public.event_logs
where event_type = 'search_submitted'
  and metadata ? 'query'
group by metadata->>'query'
order by search_count desc;


-- 3) 공구별 상세 조회 수 · 관심 등록 수 · 구매 링크 클릭 수
-- 관심 등록(interest_added)은 group_buy_id가 아닌 product_id 기준 이벤트라서,
-- 같은 상품의 group_buys 행 각각에 매칭된다(상품의 공구 이력이 여러 건이면 중복 집계될 수 있음).
select
  gb.id as group_buy_id,
  p.name as product_name,
  count(*) filter (where el.event_type = 'group_buy_viewed') as view_count,
  count(*) filter (where el.event_type = 'purchase_link_clicked') as purchase_click_count,
  count(*) filter (where el.event_type = 'interest_added') as interest_added_count
from public.group_buys gb
join public.products p on p.id = gb.product_id
left join public.event_logs el
  on (el.event_type in ('group_buy_viewed', 'purchase_link_clicked') and el.group_buy_id = gb.id)
  or (el.event_type = 'interest_added' and el.product_id = gb.product_id)
group by gb.id, p.name
order by view_count desc, purchase_click_count desc;


-- 4) 마감 임박 여부별 관심 등록(interest_added) 수
-- 마감 임박 기준: 종료일까지 3일 이하 남은 경우. 상품이 공구 이력을 여러 건
-- 가지면 각 공구의 마감 임박 여부마다 중복 집계될 수 있음(근사치).
select
  case
    when gb.end_date - current_date <= 3 then '마감임박(3일 이내)'
    else '여유있음'
  end as urgency_bucket,
  count(*) as interest_added_count
from public.event_logs el
join public.group_buys gb on gb.product_id = el.product_id
where el.event_type = 'interest_added'
  and el.product_id is not null
group by urgency_bucket;


-- 5) 인플루언서별 공구 조회 수 · 구매 링크 클릭 수
select
  inf.id as influencer_id,
  inf.name as influencer_name,
  count(*) filter (where el.event_type = 'group_buy_viewed') as group_buy_view_count,
  count(*) filter (where el.event_type = 'purchase_link_clicked') as purchase_click_count
from public.influencers inf
left join public.event_logs el
  on el.influencer_id = inf.id
  and el.event_type in ('group_buy_viewed', 'purchase_link_clicked')
group by inf.id, inf.name
order by group_buy_view_count desc, purchase_click_count desc;

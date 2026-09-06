-- =============================================================================
-- ZEN-A — 사용자 행동 이벤트 수집 테이블 (event_logs)
-- =============================================================================
-- 이 파일은 실행하지 않았습니다. Supabase 대시보드 SQL Editor에서 직접
-- 실행해 주세요. 기존 테이블(products/influencers/group_buys/users/interests)과
-- 그 RLS·데이터는 전혀 건드리지 않고, 새 테이블 하나만 추가합니다.
--
-- 중요: 지금은 실제 서비스 사용자가 아니라 개발자 본인(단일 사용자) 계정으로만
-- 로그가 쌓입니다. 이 테이블은 "행동 데이터를 수집·분석할 수 있는 구조"를
-- 만드는 것이 목적이며, 지금 쌓이는 로그 자체를 일반 사용자 행동의 대표값으로
-- 해석하면 안 됩니다(자세한 내용은 docs/portfolio-case-study.md 참고).
-- =============================================================================

begin;

create table if not exists public.event_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  event_type text not null,
  group_buy_id uuid references public.group_buys(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  influencer_id uuid references public.influencers(id) on delete set null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

comment on table public.event_logs is
  'ZEN-A 사용자 행동 이벤트 로그. event_type: search_submitted | interest_added | interest_removed | group_buy_viewed | purchase_link_clicked';

create index if not exists event_logs_user_id_idx on public.event_logs (user_id);
create index if not exists event_logs_event_type_idx on public.event_logs (event_type);
create index if not exists event_logs_created_at_idx on public.event_logs (created_at desc);
create index if not exists event_logs_group_buy_id_idx on public.event_logs (group_buy_id);
create index if not exists event_logs_influencer_id_idx on public.event_logs (influencer_id);

-- RLS: 로그인한 사용자는 "본인이 남긴" 이벤트만 넣고 볼 수 있음(최소 정책).
alter table public.event_logs enable row level security;

create policy "event_logs_insert_own" on public.event_logs
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "event_logs_select_own" on public.event_logs
  for select
  to authenticated
  using (user_id = auth.uid());

-- RLS는 "이미 권한 있는 역할"이 볼 수 있는 행을 제한할 뿐, 테이블 자체 접근
-- 권한은 별도로 GRANT해야 함(이전 users/interests 때와 동일한 이유).
grant select, insert on public.event_logs to authenticated;

commit;

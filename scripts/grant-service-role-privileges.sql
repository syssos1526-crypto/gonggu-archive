-- =============================================================================
-- ZEN-A — service_role 최소 권한 부여 (관리자 공구 등록 기능 42501 수정)
-- =============================================================================
-- 이 파일은 실행하지 않았습니다. Supabase 대시보드 SQL Editor에서 직접
-- 실행해 주세요.
--
-- 진단: SUPABASE_SECRET_KEY 자체는 정상적인 service_role 키이지만(Storage
-- 버킷 목록 조회로 확인됨), products/influencers/group_buys 테이블에
-- service_role 권한이 애초에 전혀 부여돼 있지 않아 42501이 발생했습니다.
-- RLS 우회(service_role의 특성)와 테이블 GRANT는 별개라, service_role이라도
-- GRANT가 없으면 접근이 막힙니다.
--
-- 아래는 lib/actions/admin.ts의 실제 실행 경로만 근거로 한 최소 권한입니다.
-- anon/authenticated 권한과 기존 RLS는 전혀 건드리지 않습니다.
-- users/interests/event_logs는 이 기능의 service_role 코드 경로가 전혀
-- 접근하지 않으므로 권한을 주지 않습니다. UPDATE/DELETE도 코드에 해당
-- 호출이 없어 포함하지 않습니다.
--
-- 근거(파일: lib/actions/admin.ts, createGroupBuyAction):
--   - group_buys: 중복 확인 SELECT 2건(224행, 236행) + 공구 생성
--     `insert(...).select('id')`(286행, INSERT + RETURNING이라 SELECT도 필요)
--   - products: 신규 상품 `insert(...).select('id')`(272행)만 존재 —
--     INSERT뿐 아니라 RETURNING 때문에 SELECT도 필요(직접 테스트로 확인:
--     INSERT만으로는 여전히 42501, Postgres 힌트가 "GRANT SELECT, INSERT"를
--     명시함)
--   - influencers: 신규 인플루언서 `insert(...).select('id')`(257행)만
--     존재 — products와 동일한 이유로 SELECT + INSERT
-- =============================================================================

begin;

grant select, insert on public.group_buys to service_role;
grant select, insert on public.products to service_role;
grant select, insert on public.influencers to service_role;

commit;

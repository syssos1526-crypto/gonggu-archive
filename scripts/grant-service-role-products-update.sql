-- =============================================================================
-- ZEN-A — service_role에 products UPDATE 권한 추가 (관리자 상품 이미지/정보 수정)
-- =============================================================================
-- 이 파일은 실행하지 않았습니다. Supabase 대시보드 SQL Editor에서 직접
-- 실행해 주세요.
--
-- 이전 scripts/grant-service-role-privileges.sql에서 service_role에게
-- products의 SELECT, INSERT만 부여했습니다(당시엔 새 상품 생성만 있었음).
-- 이번에 추가한 "기존 상품 수정"(lib/actions/admin.ts, updateProductAction)이
-- `admin.from('products').update(...)`을 실행하므로 UPDATE 권한만 추가로
-- 필요합니다. SELECT는 이미 부여돼 있어 재요청하지 않습니다.
--
-- anon/authenticated 권한과 기존 RLS는 전혀 건드리지 않습니다.
-- =============================================================================

grant update on public.products to service_role;

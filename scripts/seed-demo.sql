-- =============================================================================
-- 공구 아카이브 — 화면 검증용 데모 데이터 시드 스크립트
-- =============================================================================
-- 이 파일은 자동으로 실행되지 않습니다. 필요할 때 Supabase 대시보드의
-- SQL Editor에 붙여넣어 직접 실행하세요 (schema 변경 없음, products / influencers /
-- group_buys 세 테이블에 INSERT만 수행합니다).
--
-- 특징
-- - id를 전부 고정값(a1000001-.../b2000002-.../c3000003-...)으로 지정해서
--   기존 테스트 행(70d6c287-..., 2d300320-..., 14cb443e-...)과 절대 겹치지 않습니다.
-- - start_date/end_date/created_at은 CURRENT_DATE·NOW() 기준 상대값이라,
--   이 스크립트를 "언제 실행하든" 오늘 종료 / 진행 중 / 최근 등록 / 종료된 공구
--   4가지 상태가 항상 재현됩니다.
-- - ON CONFLICT (id) DO NOTHING 처리로 여러 번 실행해도 안전합니다(중복 삽입 없음).
-- - purchase_url / image_url이 없는 행을 일부 의도적으로 남겨 빈 상태 UI도
--   확인할 수 있게 했습니다.
--
-- 되돌리려면(전부 지우기): 이 파일 대신 별도로 DELETE 스크립트를 요청하세요.
-- (이 파일 자체는 삭제 로직을 포함하지 않습니다.)
-- =============================================================================

begin;

-- 1) products ------------------------------------------------------------
-- 카테고리: 뷰티 / 패션 / 리빙 (리빙은 이번에 새로 추가하는 값이며, 현재 UI의
-- 카테고리 내비게이션은 뷰티·패션만 표시하는 장식용이라 필터링에는 영향 없음)
insert into public.products (id, brand, name, category, image_url, created_at, updated_at) values
  ('a1000001-0000-4000-8000-000000000001', '달바', '퍼스트 스프레이 세럼 100ml', '뷰티',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600',
    now() - interval '200 days', now() - interval '200 days'),
  ('a1000001-0000-4000-8000-000000000002', '라운드랩', '자작나무 수분크림 80ml', '뷰티',
    null, -- 이미지 없음 케이스
    now() - interval '180 days', now() - interval '180 days'),
  ('a1000001-0000-4000-8000-000000000003', '티르티르', '마스크핏 레드쿠션', '뷰티',
    'https://images.unsplash.com/photo-1631730359585-38a4935cbec4?auto=format&fit=crop&q=80&w=600',
    now() - interval '150 days', now() - interval '150 days'),
  ('a1000001-0000-4000-8000-000000000004', '마르디메크르디', '체크 원피스', '패션',
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600',
    now() - interval '160 days', now() - interval '160 days'),
  ('a1000001-0000-4000-8000-000000000005', '무신사 스탠다드', '오버사이즈 후드 집업', '패션',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600',
    now() - interval '140 days', now() - interval '140 days'),
  ('a1000001-0000-4000-8000-000000000006', '오늘의집', '극세사 이불 세트 (Q)', '리빙',
    'https://images.unsplash.com/photo-1616627561950-9f746e330187?auto=format&fit=crop&q=80&w=600',
    now() - interval '170 days', now() - interval '170 days'),
  ('a1000001-0000-4000-8000-000000000007', '마녀공장', '갈락토미 나이아신 에센스', '뷰티',
    'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&q=80&w=600',
    now() - interval '120 days', now() - interval '120 days'),
  ('a1000001-0000-4000-8000-000000000008', '코멧', '스테인리스 텀블러 500ml', '리빙',
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600',
    now() - interval '250 days', now() - interval '250 days')
on conflict (id) do nothing;

-- 2) influencers -----------------------------------------------------------
insert into public.influencers
  (id, name, instagram_handle, instagram_url, follower_count, profile_image_url, trust_score, trust_score_updated_at, created_at, updated_at)
values
  ('b2000002-0000-4000-8000-000000000001', '뷰티마녀', 'beauty_witch', 'https://instagram.com/beauty_witch',
    85000, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    88, now() - interval '10 days', now() - interval '300 days', now() - interval '10 days'),
  ('b2000002-0000-4000-8000-000000000002', '스타일링진', 'style_jin', 'https://instagram.com/style_jin',
    42000, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    76, now() - interval '20 days', now() - interval '280 days', now() - interval '20 days'),
  ('b2000002-0000-4000-8000-000000000003', '홈꾸미기소연', 'home_soyeon', 'https://instagram.com/home_soyeon',
    61000, null, -- 프로필 이미지 없음 케이스
    91, now() - interval '5 days', now() - interval '260 days', now() - interval '5 days'),
  ('b2000002-0000-4000-8000-000000000004', '헬씨라이프민', 'healthy_min', 'https://instagram.com/healthy_min',
    120000, 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&q=80&w=300',
    95, now() - interval '15 days', now() - interval '400 days', now() - interval '15 days'),
  ('b2000002-0000-4000-8000-000000000005', '데일리룩현우', 'dailylook_hyunwoo', 'https://instagram.com/dailylook_hyunwoo',
    33000, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    70, now() - interval '30 days', now() - interval '220 days', now() - interval '30 days'),
  ('b2000002-0000-4000-8000-000000000006', '리빙로그다은', 'livinglog_daeun', 'https://instagram.com/livinglog_daeun',
    54000, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300',
    84, now() - interval '8 days', now() - interval '240 days', now() - interval '8 days'),
  ('b2000002-0000-4000-8000-000000000007', '뷰티크리틱수아', 'beautycritic_sua', 'https://instagram.com/beautycritic_sua',
    27000, 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&q=80&w=300',
    65, now() - interval '25 days', now() - interval '190 days', now() - interval '25 days')
on conflict (id) do nothing;

-- 3) group_buys --------------------------------------------------------
-- 상태 요약 (CURRENT_DATE 기준으로 매번 자동 재계산됨)
--   c...0001, c...0002  : 오늘 종료
--   c...0003 ~ c...0007 : 진행 중 (그중 0006, 0007은 오늘 등록 → 최근 등록에도 노출)
--   c...0008, c...0009  : 종료됨 (0001의 상품은 과거 이력도 함께 보유)
--   c...0010            : 완전히 종료된 단독 상품 (진행중 공구가 전혀 없는 케이스)
insert into public.group_buys
  (id, product_id, influencer_id, price, original_price, start_date, end_date, purchase_url, post_url, created_at, updated_at)
values
  -- 오늘 종료되는 공구 2건
  ('c3000003-0000-4000-8000-000000000001',
    'a1000001-0000-4000-8000-000000000001', 'b2000002-0000-4000-8000-000000000001',
    32000, 45000, current_date - 7, current_date,
    'https://smartstore.naver.com/dalba-official/products/240101', null,
    now() - interval '7 days', now() - interval '7 days'),
  ('c3000003-0000-4000-8000-000000000002',
    'a1000001-0000-4000-8000-000000000003', 'b2000002-0000-4000-8000-000000000007',
    15900, 22000, current_date - 2, current_date,
    null, null, -- 구매 링크 없음 케이스
    now() - interval '2 days', now() - interval '2 days'),

  -- 진행 중인 공구 5건 (카테고리/브랜드 다양화, 0007은 기존 '마녀공장'과 같은 브랜드)
  ('c3000003-0000-4000-8000-000000000003',
    'a1000001-0000-4000-8000-000000000004', 'b2000002-0000-4000-8000-000000000005',
    58000, 89000, current_date - 3, current_date + 4,
    'https://smartstore.naver.com/mardimecredi/products/351022', null,
    now() - interval '3 days', now() - interval '3 days'),
  ('c3000003-0000-4000-8000-000000000004',
    'a1000001-0000-4000-8000-000000000006', 'b2000002-0000-4000-8000-000000000006',
    79000, 120000, current_date - 5, current_date + 8,
    'https://ohou.se/productions/123456/selling', null,
    now() - interval '5 days', now() - interval '5 days'),
  ('c3000003-0000-4000-8000-000000000005',
    'a1000001-0000-4000-8000-000000000002', 'b2000002-0000-4000-8000-000000000004',
    18900, 27000, current_date - 1, current_date + 5,
    'https://smartstore.naver.com/roundlab/products/778812', null,
    now() - interval '1 days', now() - interval '1 days'),
  ('c3000003-0000-4000-8000-000000000006',
    'a1000001-0000-4000-8000-000000000005', 'b2000002-0000-4000-8000-000000000002',
    39000, 59000, current_date, current_date + 11,
    'https://www.musinsastandard.com/products/990234', null,
    now(), now()),
  ('c3000003-0000-4000-8000-000000000007',
    'a1000001-0000-4000-8000-000000000007', 'b2000002-0000-4000-8000-000000000001',
    21000, 28000, current_date, current_date + 7,
    'https://smartstore.naver.com/witchs-pouch/products/554321', null,
    now() - interval '1 hours', now() - interval '1 hours'),

  -- 종료된 공구 2건 (0001은 '달바 세럼'의 과거 이력 — 상품 상세의 "다른 공구 이력" 테스트용)
  ('c3000003-0000-4000-8000-000000000008',
    'a1000001-0000-4000-8000-000000000001', 'b2000002-0000-4000-8000-000000000007',
    35000, 45000, current_date - 60, current_date - 50,
    'https://smartstore.naver.com/dalba-official/products/198877', null,
    now() - interval '60 days', now() - interval '60 days'),
  ('c3000003-0000-4000-8000-000000000009',
    'a1000001-0000-4000-8000-000000000006', 'b2000002-0000-4000-8000-000000000003',
    69000, 99000, current_date - 90, current_date - 80,
    null, null, -- 구매 링크 없음 케이스
    now() - interval '90 days', now() - interval '90 days'),

  -- 완전히 종료된 단독 상품(진행중 이력이 전혀 없는 상품) — 검색 시
  -- "진행 중인 공구 없음 → 과거 이력 표시" 분기 테스트용
  ('c3000003-0000-4000-8000-000000000010',
    'a1000001-0000-4000-8000-000000000008', 'b2000002-0000-4000-8000-000000000006',
    24000, 32000, current_date - 120, current_date - 110,
    'https://smartstore.naver.com/comet-home/products/445566', null,
    now() - interval '120 days', now() - interval '120 days')
on conflict (id) do nothing;

commit;

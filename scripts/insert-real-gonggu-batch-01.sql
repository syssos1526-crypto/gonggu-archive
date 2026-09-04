-- =============================================================================
-- 공구 아카이브 — 실제 공구 데이터 1차 배치(2건) 삽입 스크립트
-- =============================================================================
-- 이 파일은 실행하지 않았습니다. Supabase 대시보드 SQL Editor에서 직접
-- 실행해 주세요. 기존 시드/테스트 데이터는 전혀 건드리지 않고, products /
-- influencers / group_buys 세 테이블에 새 행만 조건부로 추가합니다.
--
-- 사용 컬럼(실제 스키마 조회로 확인한 최소 필요 컬럼만 사용):
--   products:    brand, name, category, image_url
--   influencers: name, instagram_handle, instagram_url
--   group_buys:  product_id, influencer_id, price, original_price,
--                start_date, end_date, purchase_url, post_url
--
-- 참고: influencers.follower_count / trust_score, products의 이미지는
-- 이번에 제공된 정보에 없어서 값을 지어내지 않고 컬럼 자체를 생략했습니다.
-- 이 컬럼들이 NOT NULL 제약이면 이 스크립트가 에러로 실패할 수 있습니다 —
-- 그 경우 실제 팔로워 수/신뢰도 값을 알려주시면 채워서 다시 드리겠습니다.
--
-- 중복 방지: unique 제약 존재 여부에 기대지 않고, 매번 INSERT 전에
-- WHERE NOT EXISTS로 "브랜드+상품명", "인스타 핸들", "상품+인플루언서+기간
-- 또는 동일 구매 URL"이 이미 있는지 직접 확인합니다. 여러 번 실행해도
-- 안전합니다.
-- =============================================================================

begin;

-- ── [1] 사노셀 ──────────────────────────────────────────────────────────

insert into public.products (brand, name, category, image_url)
select '사노셀', '컷앤아웃 애사비 정제 & 애플사이다비니거 콤부차 (피치 2박스 / 56포)', '식품/건강', null
where not exists (
  select 1 from public.products
  where brand = '사노셀'
    and name = '컷앤아웃 애사비 정제 & 애플사이다비니거 콤부차 (피치 2박스 / 56포)'
);

insert into public.influencers (name, instagram_handle, instagram_url)
select '아름', 'lee.a.r', 'https://www.instagram.com/lee.a.r/'
where not exists (
  select 1 from public.influencers where instagram_handle = 'lee.a.r'
);

insert into public.group_buys
  (product_id, influencer_id, price, original_price, start_date, end_date, purchase_url, post_url)
select
  p.id, i.id, 39800, 59600, date '2026-09-01', date '2026-09-05',
  'https://naver.me/GFs4Xs02', 'https://www.instagram.com/p/Dcr0JJGkhLf/'
from public.products p, public.influencers i
where p.brand = '사노셀'
  and p.name = '컷앤아웃 애사비 정제 & 애플사이다비니거 콤부차 (피치 2박스 / 56포)'
  and i.instagram_handle = 'lee.a.r'
  and not exists (
    select 1 from public.group_buys gb
    where (
      gb.product_id = p.id
      and gb.influencer_id = i.id
      and gb.start_date = date '2026-09-01'
      and gb.end_date = date '2026-09-05'
    )
    or gb.purchase_url = 'https://naver.me/GFs4Xs02'
  );

-- ── [2] 성분에디터 ──────────────────────────────────────────────────────

insert into public.products (brand, name, category, image_url)
select '성분에디터', '딥콜라겐 파워 부스팅 마스크 (2BOX / 총 8매)', '뷰티', null
where not exists (
  select 1 from public.products
  where brand = '성분에디터'
    and name = '딥콜라겐 파워 부스팅 마스크 (2BOX / 총 8매)'
);

insert into public.influencers (name, instagram_handle, instagram_url)
select 'may._.mew', 'may._.mew', 'https://www.instagram.com/may._.mew/'
where not exists (
  select 1 from public.influencers where instagram_handle = 'may._.mew'
);

insert into public.group_buys
  (product_id, influencer_id, price, original_price, start_date, end_date, purchase_url, post_url)
select
  p.id, i.id, 31900, 80000, date '2026-08-31', date '2026-09-04',
  'https://m.sungboon.com/product/list02.html?cate_no=586&utm_source=instagram&utm_medium=shopping&utm_content=mk_cm_0831_mew_ig',
  'https://www.instagram.com/p/DcsPy66j7HU/'
from public.products p, public.influencers i
where p.brand = '성분에디터'
  and p.name = '딥콜라겐 파워 부스팅 마스크 (2BOX / 총 8매)'
  and i.instagram_handle = 'may._.mew'
  and not exists (
    select 1 from public.group_buys gb
    where (
      gb.product_id = p.id
      and gb.influencer_id = i.id
      and gb.start_date = date '2026-08-31'
      and gb.end_date = date '2026-09-04'
    )
    or gb.purchase_url = 'https://m.sungboon.com/product/list02.html?cate_no=586&utm_source=instagram&utm_medium=shopping&utm_content=mk_cm_0831_mew_ig'
  );

commit;

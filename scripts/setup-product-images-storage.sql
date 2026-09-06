-- =============================================================================
-- ZEN-A — 관리자 상품 이미지 업로드용 Storage 버킷 설정
-- =============================================================================
-- 이 파일은 실행하지 않았습니다. Supabase 대시보드 SQL Editor에서 직접
-- 실행해 주세요. 기존 테이블/RLS/데이터는 전혀 건드리지 않습니다.
--
-- 업로드는 관리자 검증을 통과한 서버 액션이 service role 키로 직접 수행하므로
-- (RLS 우회), authenticated/anon에게 storage.objects 쓰기 권한을 별도로 주지
-- 않습니다. 아래에서 만드는 것은 "공개 조회용 버킷" 하나뿐입니다.
--
-- public = true인 버킷은 Supabase Storage가 RLS 정책 없이도 GET 요청을
-- 공개로 서빙합니다(공개 카드에 상품 이미지를 보여줘야 하므로 필요).
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

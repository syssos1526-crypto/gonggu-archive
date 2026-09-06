# ZEN-A

뷰티·패션 인플루언서 공동구매(공구) 검색·아카이브 서비스. Next.js + Supabase 기반의
풀스택 웹 애플리케이션이며, 관리자 전용 데이터 관리 도구와 사용자 행동 이벤트
수집·분석 대시보드를 포함한다.

- 배포: https://gonggu-archive.vercel.app
- 포트폴리오 케이스 스터디(문제 정의·데이터 모델·가설·한계): [`docs/portfolio-case-study.md`](docs/portfolio-case-study.md)

## 1. 문제와 타깃 사용자

뷰티·패션 인플루언서들이 진행하는 공동구매(공구) 정보는 인스타그램 등 여러 SNS
채널에 흩어져 있어, 소비자가 "지금 어떤 공구가 열려 있는지", "언제 마감되는지",
"어떤 인플루언서가 믿을 만한지"를 한 곳에서 확인하기 어렵다.

**타깃 사용자**: 여러 인플루언서를 팔로우하며 공구 소식을 놓치고 싶지 않은
뷰티·패션 소비자. ZEN-A는 공구를 검색·카테고리·인플루언서 신뢰도 기준으로 한
곳에 모아 보여주고, 관심 있는 상품·인플루언서를 등록해 마감을 놓치지 않도록
돕는다.

## 2. 핵심 기능

### 사용자 기능

- **홈**: 오늘 마감 임박 히어로 카드, 오늘 종료/진행 중/오픈 예정/최근 종료 공구를
  상태별로 명확히 분리해 노출(상태가 뒤섞이지 않도록 날짜 기준 계산 로직을
  공통 헬퍼로 재사용)
- **검색**: 공구/상품/인플루언서 탭, 공구진행순·관심순 정렬
- **카테고리 필터**: 뷰티(스킨케어·클렌징 포함)/패션/리빙/식품·건강 — 실제 DB
  값 기준으로 매핑
- **공구 상세**: 가격·할인율 비교, 마감 정보, 외부 구매 링크(클릭 이벤트 기록 후
  안전하게 리다이렉트), 같은 상품의 다른 공구 이력
- **인플루언서 상세**: 프로필, 신뢰도, 진행 중인 공구 목록
- **이메일 회원가입/로그인/로그아웃, 이메일 인증**(Supabase Auth)
- **관심(찜) 등록/해제**: 상품·인플루언서 단위, `/mypage`에서 목록 확인
- **`/feed`**: 관심 등록한 상품·인플루언서와 연결된, 아직 끝나지 않은 공구를
  모아 보여주는 개인화 피드(규칙 기반 — 자세한 설명은 5절 참고)
- 모바일 우선 반응형 UI(하단 고정 내비게이션, 이미지 중심 카드 레이아웃),
  ZEN-A 자체 브랜드 컬러 시스템 적용

### 관리자 기능 (`/admin`, 관리자 1인 전용)

- **대시보드**: 최근 등록 공구 목록
- **공구 관리**(`/admin/group-buys`): 목록·검색, 상세 일정(시작/종료일·가격·
  구매 링크·게시물 링크) 수정
- **공구 등록**(`/admin/group-buys/new`): 기존 상품/인플루언서 검색 선택 또는
  신규 등록을 한 화면에서 처리, 상품 이미지는 URL 입력 또는 로컬 파일 업로드
- **상품 관리**(`/admin/products`): 목록·검색, 상품명·브랜드·카테고리·메인
  이미지 수정
- **분석 대시보드**(`/admin/analytics`): 6절 참고

## 3. 아키텍처

```
Next.js 16 (App Router, React 19)
  ├─ Server Components 중심 렌더링, 클라이언트 JS는 관리자 폼 등 꼭 필요한 곳만
  ├─ Server Actions로 모든 쓰기 작업 처리(로그인, 찜, 관리자 CRUD)
  └─ Tailwind CSS 4 디자인 토큰(app/globals.css) 기반 컬러 시스템

Supabase
  ├─ Postgres — products / influencers / group_buys / users / interests / event_logs
  ├─ Auth — 이메일 회원가입·로그인, 이메일 인증, 세션 쿠키(@supabase/ssr)
  ├─ Storage — 관리자 상품 이미지 업로드 전용 버킷(product-images)
  └─ Row Level Security — 모든 테이블에서 역할별 최소 권한만 부여(7절 참고)

Vercel
  └─ 배포·자동 빌드, 프로덕션 도메인 기반 메타데이터(og:image 등) 생성
```

- 서버 컴포넌트에서 두 종류의 Supabase 클라이언트를 목적에 맞게 구분해서 쓴다:
  - **anon 싱글턴**(`lib/supabase.ts`): 로그인 여부와 무관한 공개 조회(홈/검색/
    카테고리/상세)
  - **세션 클라이언트**(`lib/supabase/server.ts`): 로그인한 사용자 본인 데이터
    (찜 여부, 이벤트 기록)
  - **관리자 전용 service-role 클라이언트**(`lib/supabase/admin.ts`): `requireAdminUser()`
    통과 후에만, 관리자 쓰기 작업과 분석 대시보드의 전체 로그 집계에만 사용

## 4. 데이터 모델과 이벤트 설계

핵심 테이블: `products`, `influencers`, `group_buys`(상품·인플루언서 참조),
`users`, `interests`(찜, `product_id`/`influencer_id` 개별 컬럼), `event_logs`
(사용자 행동 이벤트).

`event_logs` 스키마(`scripts/add-event-logs.sql`):

| 컬럼 | 설명 |
|---|---|
| `id` | 이벤트 고유 id |
| `user_id` | 이벤트를 발생시킨 로그인 사용자 |
| `event_type` | 이벤트 종류(아래 표) |
| `group_buy_id` / `product_id` / `influencer_id` | 관련 엔티티(nullable) |
| `metadata` | 이벤트별 부가 정보(jsonb, nullable) |
| `created_at` | 발생 시각 |

수집 이벤트:

| event_type | 발생 시점 | 주요 metadata |
|---|---|---|
| `search_submitted` | 검색 결과 조회 | `query`, `result_count` |
| `interest_added` / `interest_removed` | 찜 등록/해제 | — |
| `group_buy_viewed` | 공구 상세 조회 | — |
| `purchase_link_clicked` | 구매 링크 클릭(`/go/[groupBuyId]` 경유) | — |

로깅은 모두 최선형(best-effort)으로 구현돼, 기록이 실패해도 기존 검색·찜·
상세조회·구매링크 기능은 절대 막히지 않는다(`lib/analytics/logEvent.ts`).

## 5. 추천(피드)에 대한 정직한 설명

`/feed`는 사용자가 직접 등록한 관심 상품·인플루언서를 기준으로, 아직 끝나지
않은 공구를 마감 상태별로 모아 보여주는 **규칙 기반(rule-based) baseline**이다.
협업 필터링이나 학습된 추천 모델이 아니며, 추천 정확도·CTR 등의 성능을 주장하지
않는다. `event_logs`는 이 baseline을 향후 데이터 기반으로 평가·개선하기 위한
수집 인프라로 설계했다.

## 6. 관리자 분석 대시보드 (`/admin/analytics`)

`event_logs`를 관리자만 집계해서 보는 화면. PostgREST가 SQL의 `GROUP BY`를
직접 지원하지 않아, 각 지표는 원시 행을 조회한 뒤 서버에서 집계한다
(`lib/queries/analytics.ts`, 대응하는 읽기 전용 SQL 원본은
`scripts/analytics-queries.sql`).

| 지표 | 정의 |
|---|---|
| 최근 7일 이벤트 유형별 수 | `created_at`이 최근 7일 이내인 로그를 `event_type`별로 카운트 |
| 많이 검색한 검색어 | `search_submitted` 로그를 `metadata.query`로 그룹화, 검색 횟수와 `metadata.result_count` 평균 |
| 공구별 참여도 | 공구별 `group_buy_viewed`/`purchase_link_clicked` 수, 같은 상품의 `interest_added` 수 |
| 인플루언서별 참여도 | 인플루언서별 `group_buy_viewed`/`purchase_link_clicked` 수 |

화면 최상단에 "현재는 초기 테스트 사용자 로그 수집 단계이며, 사용자 행동을
일반화한 분석 결과가 아닙니다" 문구를 고정 표시해, 집계 결과가 통계적으로
일반화된 인사이트가 아님을 항상 드러낸다. 로그가 0건인 지표는 에러 대신
자연스러운 빈 상태 문구를 보여준다.

## 7. 보안 설계

- **Row Level Security**: 모든 테이블에 RLS 적용. `interests`/`event_logs`는
  "본인 행만" 조회·기록 가능하도록 정책이 걸려 있고, 이 정책은 관리자 기능을
  추가하는 과정에서도 완화한 적이 없다.
- **관리자 서버 검증**(`lib/auth/admin.ts`): 서버 전용 환경변수 `ADMIN_USER_ID`와
  로그인 사용자의 실제 id를 비교해, 일치하지 않으면 404를 반환한다(관리자
  화면의 존재 자체를 드러내지 않음). `/admin` 하위 모든 페이지와 모든 관리자
  서버 액션이 각자 이 검증을 다시 수행한다(레이아웃 단 검증에만 의존하지 않음).
- **service-role 키의 서버 전용 사용**: 관리자 쓰기 작업(상품/인플루언서/공구
  생성·수정, Storage 업로드)과 분석 대시보드의 전체 로그 집계에만
  `SUPABASE_SECRET_KEY`(service-role)를 사용하며, `requireAdminUser()` 통과
  이후에만 호출된다. 이 키는 클라이언트 코드에 절대 노출되지 않고, 일반
  `authenticated`/`anon` 역할에는 이 기능들을 위한 새 권한을 부여하지 않았다
  (`scripts/grant-*.sql`이 항상 필요한 최소 권한만 부여하도록 각각 분리돼 있음).
- 구매 링크는 클라이언트가 목적지 URL을 지정할 수 없는 내부 리다이렉트
  (`/go/[groupBuyId]`)를 거쳐, 서버가 조회한 `purchase_url`로만 이동한다(오픈
  리다이렉트 방지).

## 8. 한계

- 현재는 개발자 본인과 동의한 소수 테스트 사용자(지인)만 실제로 로그를 남기는
  **초기 로그 수집 단계**다. 사용자 규모가 작아 어떤 지표도 일반 사용자 행동을
  대표한다고 볼 수 없다.
- 공구 데이터 자체도 수작업으로 추가한 소량의 실 데이터와 데모 데이터가 섞여
  있어, 통계적으로 유의미한 분석 표본은 아직 아니다.
- `/admin/analytics`의 집계 결과는 "데이터 파이프라인이 의도대로 동작하는지"
  확인하는 용도이며, 실제 서비스 인사이트나 추천 성능 개선 효과를 주장하지
  않는다.

## 9. 다음 단계

1. 실제 공구 데이터셋 지속 확장
2. 동의를 받은 테스트 사용자 규모 확대 및 로그 축적
3. `event_logs` 데이터가 충분히 쌓이면, `/feed` baseline 대비 개선된 추천
   로직의 효과를 실제 데이터로 평가

## 10. 로컬 실행

```bash
npm install
npm run dev
```

`http://localhost:3000`에서 확인. `npm run build`로 프로덕션 빌드, `npm run lint`로
ESLint 검사.

### 필요한 환경변수 (이름만 — 실제 값은 각자 Supabase/Vercel 프로젝트에서 발급)

| 변수 | 용도 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 공개(anon) 키 — 브라우저/서버 공통 |
| `ADMIN_USER_ID` | `/admin` 접근을 허용할 관리자의 Supabase auth user id |
| `SUPABASE_SECRET_KEY` | 관리자 쓰기·분석 집계 전용 service-role 키(서버 전용, `NEXT_PUBLIC_` 금지) |

`VERCEL_URL`/`VERCEL_PROJECT_PRODUCTION_URL`은 Vercel이 배포마다 자동 주입하므로
별도 설정이 필요 없다(OG 이미지 등 절대 URL 생성에 사용).

### 데이터베이스 SQL (Supabase SQL Editor에서 직접 실행, 자동 실행되지 않음)

`scripts/` 아래 각 SQL 파일은 실행 목적과 순서를 파일 상단 주석에 명시해 뒀다.
최초 설정 시 `add-event-logs.sql` → `grant-service-role-privileges.sql` →
`setup-product-images-storage.sql` 순으로 실행하고, 이후 기능 추가 시 별도
안내된 `grant-service-role-*.sql`을 필요한 시점에 실행하면 된다. 모든 SQL은
읽기 전용이거나 최소 권한만 부여하도록 작성돼 있으며, 기존 데이터/RLS 정책을
덮어쓰지 않는다.

## 기술 스택

Next.js 16(App Router) · React 19 · TypeScript · Tailwind CSS 4 · Supabase
(Postgres, Auth, Storage) · Vercel

import type {
  CreateGroupBuyState,
  UpdateGroupBuyScheduleState,
  UpdateProductState,
} from '@/lib/actions/admin'
import { CATEGORY_CONFIG } from '@/lib/queries/category'

// 'use server' 파일(lib/actions/admin.ts)은 async 함수 외의 값을 export할 수
// 없어서, 서버 액션과 클라이언트 컴포넌트가 함께 쓰는 상수는 별도 파일로 분리한다.
// (타입만 import하므로 admin.ts와 순환 참조가 생기지 않는다.)

// 새 상품 등록 시 선택 가능한 4개 대표 카테고리만.
export const ADMIN_CATEGORY_OPTIONS = Object.values(CATEGORY_CONFIG).map((c) => c.label)

// 기존 상품 수정 시에는 실제 DB에 있는 세부 카테고리(스킨케어/클렌징 등)도
// 그대로 유지·선택할 수 있어야 해서, 대표 카테고리보다 넓은 전체 집합을 쓴다.
export const ALL_CATEGORY_VALUES = Array.from(
  new Set(Object.values(CATEGORY_CONFIG).flatMap((c) => c.dbCategories))
)

export const initialCreateGroupBuyState: CreateGroupBuyState = {}

export const initialUpdateProductState: UpdateProductState = {}

export const initialUpdateGroupBuyScheduleState: UpdateGroupBuyScheduleState = {}

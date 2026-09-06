import type { CreateGroupBuyState } from '@/lib/actions/admin'
import { CATEGORY_CONFIG } from '@/lib/queries/category'

// 'use server' 파일(lib/actions/admin.ts)은 async 함수 외의 값을 export할 수
// 없어서, 서버 액션과 클라이언트 컴포넌트가 함께 쓰는 상수는 별도 파일로 분리한다.
// (타입만 import하므로 admin.ts와 순환 참조가 생기지 않는다.)
export const ADMIN_CATEGORY_OPTIONS = Object.values(CATEGORY_CONFIG).map((c) => c.label)

export const initialCreateGroupBuyState: CreateGroupBuyState = {}

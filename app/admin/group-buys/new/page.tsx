import { GroupBuyForm } from '@/components/admin/GroupBuyForm'
import { requireAdminUser } from '@/lib/auth/admin'

export const dynamic = 'force-dynamic'

export default async function NewGroupBuyPage() {
  // layout에서 이미 검증하지만, 서버 액션과 마찬가지로 페이지 단위에서도 다시
  // 확인해 방어선을 하나 더 둔다.
  await requireAdminUser()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-neutral-900">새 공구 등록</h1>
      <GroupBuyForm />
    </div>
  )
}

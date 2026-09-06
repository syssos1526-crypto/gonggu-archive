import { notFound } from 'next/navigation'
import { GroupBuyEditForm } from '@/components/admin/GroupBuyEditForm'
import { requireAdminUser } from '@/lib/auth/admin'
import { getAdminGroupBuyById } from '@/lib/queries/admin'

export const dynamic = 'force-dynamic'

export default async function EditGroupBuyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // layout에서 이미 검증하지만, 다른 admin 페이지들과 동일하게 여기서도 재확인.
  await requireAdminUser()

  const { id } = await params
  const groupBuy = await getAdminGroupBuyById(id).catch(() => null)
  if (!groupBuy) notFound()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-neutral-900">공구 수정</h1>
      <GroupBuyEditForm groupBuy={groupBuy} />
    </div>
  )
}

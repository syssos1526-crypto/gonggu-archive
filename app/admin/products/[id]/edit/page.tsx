import { notFound } from 'next/navigation'
import { ProductEditForm } from '@/components/admin/ProductEditForm'
import { requireAdminUser } from '@/lib/auth/admin'
import { getAdminProductById } from '@/lib/queries/admin'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // layout에서 이미 검증하지만, 다른 admin 페이지들과 동일하게 여기서도 재확인.
  await requireAdminUser()

  const { id } = await params
  const product = await getAdminProductById(id).catch(() => null)
  if (!product) notFound()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-neutral-900">상품 수정</h1>
      <ProductEditForm product={product} />
    </div>
  )
}

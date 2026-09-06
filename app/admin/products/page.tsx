import Link from 'next/link'
import { getAdminProducts } from '@/lib/queries/admin'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const products = await getAdminProducts(q)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">상품 관리</h1>
      </div>

      <form action="/admin/products" method="get" className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ''}
          placeholder="브랜드 또는 상품명 검색"
          className="h-11 flex-1 rounded-lg border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary-dark"
        >
          검색
        </button>
      </form>

      <div className="overflow-x-auto rounded-md border border-neutral-200 bg-white">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-500">
              <th className="px-4 py-3 font-semibold">이미지</th>
              <th className="px-4 py-3 font-semibold">브랜드</th>
              <th className="px-4 py-3 font-semibold">상품명</th>
              <th className="px-4 py-3 font-semibold">카테고리</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                  {q ? '검색 결과가 없습니다.' : '등록된 상품이 없습니다.'}
                </td>
              </tr>
            )}
            {products.map((product) => (
              <tr key={product.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3">
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded bg-neutral-100" />
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-neutral-900">{product.brand}</td>
                <td className="px-4 py-3 text-neutral-700">{product.name}</td>
                <td className="px-4 py-3 text-neutral-500">{product.category}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    수정
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

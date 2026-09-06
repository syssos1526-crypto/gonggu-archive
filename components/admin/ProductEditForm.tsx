'use client'

import { useActionState } from 'react'
import { updateProductAction } from '@/lib/actions/admin'
import { ALL_CATEGORY_VALUES, initialUpdateProductState } from '@/lib/admin/constants'
import type { AdminProductRow } from '@/lib/queries/admin'
import { ImageField } from './ImageField'

const INPUT_CLASS =
  'h-11 rounded-lg border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15'
const LABEL_CLASS = 'text-sm font-semibold text-neutral-700'

export function ProductEditForm({ product }: { product: AdminProductRow }) {
  const [state, formAction, isPending] = useActionState(updateProductAction, initialUpdateProductState)

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="product_id" value={product.id} />

      <div className="flex flex-col gap-3 rounded-md border border-neutral-200 bg-white p-4">
        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLASS} htmlFor="product_brand">
            브랜드
          </label>
          <input
            id="product_brand"
            name="product_brand"
            defaultValue={product.brand}
            className={INPUT_CLASS}
          />
          {state.fieldErrors?.brand && <p className="text-xs text-accent">{state.fieldErrors.brand}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLASS} htmlFor="product_name">
            상품명
          </label>
          <input
            id="product_name"
            name="product_name"
            defaultValue={product.name}
            className={INPUT_CLASS}
          />
          {state.fieldErrors?.name && <p className="text-xs text-accent">{state.fieldErrors.name}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLASS} htmlFor="product_category">
            카테고리
          </label>
          <select
            id="product_category"
            name="product_category"
            defaultValue={product.category}
            className={INPUT_CLASS}
          >
            {ALL_CATEGORY_VALUES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {state.fieldErrors?.category && (
            <p className="text-xs text-accent">{state.fieldErrors.category}</p>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold text-neutral-500">메인 이미지</p>
          <ImageField initialImageUrl={product.image_url} />
        </div>
      </div>

      {state.fieldErrors?.product && <p className="text-sm text-accent">{state.fieldErrors.product}</p>}
      {state.formError && <p className="text-sm font-semibold text-accent">{state.formError}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="h-14 rounded-xl bg-primary text-base font-bold text-primary-foreground hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {isPending ? '저장 중...' : '저장'}
      </button>
    </form>
  )
}

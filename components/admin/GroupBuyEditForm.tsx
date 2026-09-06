'use client'

import { useActionState } from 'react'
import { updateGroupBuyScheduleAction } from '@/lib/actions/admin'
import { initialUpdateGroupBuyScheduleState } from '@/lib/admin/constants'
import type { AdminGroupBuyDetailRow } from '@/lib/queries/admin'

const INPUT_CLASS =
  'h-11 rounded-lg border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15'
const LABEL_CLASS = 'text-sm font-semibold text-neutral-700'

export function GroupBuyEditForm({ groupBuy }: { groupBuy: AdminGroupBuyDetailRow }) {
  const [state, formAction, isPending] = useActionState(
    updateGroupBuyScheduleAction,
    initialUpdateGroupBuyScheduleState
  )

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="group_buy_id" value={groupBuy.id} />

      <div className="flex items-center gap-3 rounded-md border border-neutral-200 bg-white p-4">
        {groupBuy.product?.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={groupBuy.product.image_url}
            alt={groupBuy.product.name}
            className="h-14 w-14 shrink-0 rounded object-cover"
          />
        ) : (
          <div className="h-14 w-14 shrink-0 rounded bg-neutral-100" />
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-neutral-900">
            {groupBuy.product ? `${groupBuy.product.brand} · ${groupBuy.product.name}` : '상품 정보 없음'}
          </p>
          <p className="truncate text-xs text-neutral-500">
            {groupBuy.influencer?.name ?? '인플루언서 정보 없음'}
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            상품·인플루언서 연결은 이 화면에서 변경할 수 없습니다.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-neutral-200 bg-white p-4">
        <h3 className="text-sm font-bold text-neutral-900">공구 일정</h3>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className={LABEL_CLASS} htmlFor="price">
              공구가
            </label>
            <input
              id="price"
              name="price"
              type="number"
              inputMode="numeric"
              min={0}
              required
              defaultValue={groupBuy.price}
              className={INPUT_CLASS}
            />
            {state.fieldErrors?.price && <p className="text-xs text-accent-dark">{state.fieldErrors.price}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={LABEL_CLASS} htmlFor="original_price">
              정가 (선택)
            </label>
            <input
              id="original_price"
              name="original_price"
              type="number"
              inputMode="numeric"
              min={0}
              defaultValue={groupBuy.original_price ?? undefined}
              className={INPUT_CLASS}
            />
            {state.fieldErrors?.original_price && (
              <p className="text-xs text-accent-dark">{state.fieldErrors.original_price}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={LABEL_CLASS} htmlFor="start_date">
              시작일
            </label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              required
              defaultValue={groupBuy.start_date}
              className={INPUT_CLASS}
            />
            {state.fieldErrors?.start_date && (
              <p className="text-xs text-accent-dark">{state.fieldErrors.start_date}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={LABEL_CLASS} htmlFor="end_date">
              종료일
            </label>
            <input
              id="end_date"
              name="end_date"
              type="date"
              required
              defaultValue={groupBuy.end_date}
              className={INPUT_CLASS}
            />
            {state.fieldErrors?.end_date && <p className="text-xs text-accent-dark">{state.fieldErrors.end_date}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLASS} htmlFor="purchase_url">
            구매 링크 (선택)
          </label>
          <input
            id="purchase_url"
            name="purchase_url"
            type="url"
            placeholder="https://..."
            defaultValue={groupBuy.purchase_url ?? ''}
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLASS} htmlFor="post_url">
            인스타 게시물 링크 (선택)
          </label>
          <input
            id="post_url"
            name="post_url"
            type="url"
            placeholder="https://instagram.com/..."
            defaultValue={groupBuy.post_url ?? ''}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      {state.fieldErrors?.groupBuy && <p className="text-sm text-accent-dark">{state.fieldErrors.groupBuy}</p>}
      {state.formError && <p className="text-sm font-semibold text-accent-dark">{state.formError}</p>}

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

'use client'

import { useActionState, useState } from 'react'
import { createGroupBuyAction } from '@/lib/actions/admin'
import { initialCreateGroupBuyState } from '@/lib/admin/constants'
import { InfluencerField } from './InfluencerField'
import { ProductField } from './ProductField'

const INPUT_CLASS =
  'h-11 rounded-lg border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15'
const LABEL_CLASS = 'text-sm font-semibold text-neutral-700'

export function GroupBuyForm() {
  const [state, formAction, isPending] = useActionState(
    createGroupBuyAction,
    initialCreateGroupBuyState
  )
  const [confirmed, setConfirmed] = useState(false)

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <InfluencerField error={state.fieldErrors?.influencer} />
      <ProductField error={state.fieldErrors?.product} />

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
              className={INPUT_CLASS}
            />
            {state.fieldErrors?.price && <p className="text-xs text-accent">{state.fieldErrors.price}</p>}
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
              className={INPUT_CLASS}
            />
            {state.fieldErrors?.original_price && (
              <p className="text-xs text-accent">{state.fieldErrors.original_price}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={LABEL_CLASS} htmlFor="start_date">
              시작일
            </label>
            <input id="start_date" name="start_date" type="date" required className={INPUT_CLASS} />
            {state.fieldErrors?.start_date && (
              <p className="text-xs text-accent">{state.fieldErrors.start_date}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={LABEL_CLASS} htmlFor="end_date">
              종료일
            </label>
            <input id="end_date" name="end_date" type="date" required className={INPUT_CLASS} />
            {state.fieldErrors?.end_date && <p className="text-xs text-accent">{state.fieldErrors.end_date}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLASS} htmlFor="purchase_url">
            구매 링크 (선택)
          </label>
          <input id="purchase_url" name="purchase_url" type="url" placeholder="https://..." className={INPUT_CLASS} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLASS} htmlFor="post_url">
            인스타 게시물 링크 (선택)
          </label>
          <input id="post_url" name="post_url" type="url" placeholder="https://instagram.com/..." className={INPUT_CLASS} />
        </div>
      </div>

      {state.duplicateWarning && (
        <div className="flex flex-col gap-2 rounded-md border border-accent/30 bg-accent/10 p-4 text-sm text-accent">
          <p className="font-semibold">{state.duplicateWarning}</p>
          <label className="flex items-center gap-2 text-neutral-700">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300"
            />
            중복을 확인했고, 그래도 저장할게요
          </label>
        </div>
      )}
      <input type="hidden" name="confirmed" value={confirmed ? 'true' : 'false'} />

      {state.formError && <p className="text-sm font-semibold text-accent">{state.formError}</p>}

      <button
        type="submit"
        disabled={isPending || (Boolean(state.duplicateWarning) && !confirmed)}
        className="h-14 rounded-xl bg-primary text-base font-bold text-primary-foreground hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {isPending ? '저장 중...' : state.duplicateWarning ? '그래도 저장' : '공구 등록'}
      </button>
    </form>
  )
}

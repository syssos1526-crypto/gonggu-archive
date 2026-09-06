'use client'

import { useRef, useState, useTransition } from 'react'
import { searchProductsAction, type ProductOption } from '@/lib/actions/admin'
import { ADMIN_CATEGORY_OPTIONS } from '@/lib/admin/constants'
import { ImageField } from './ImageField'

const INPUT_CLASS =
  'h-11 rounded-lg border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15'
const TAB_BUTTON = 'rounded-full px-3 py-1'
const TAB_ACTIVE = 'bg-white text-primary shadow-sm'
const TAB_INACTIVE = 'text-neutral-500'

export function ProductField({ error }: { error?: string }) {
  const [mode, setMode] = useState<'existing' | 'new'>('existing')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ProductOption[]>([])
  const [selected, setSelected] = useState<ProductOption | null>(null)
  const [newBrand, setNewBrand] = useState('')
  const [newName, setNewName] = useState('')
  const [isPending, startTransition] = useTransition()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleQueryChange(value: string) {
    setQuery(value ?? '')
    setSelected(null)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!value.trim()) {
      setResults([])
      return
    }
    timerRef.current = setTimeout(() => {
      startTransition(async () => {
        setResults(await searchProductsAction(value))
      })
    }, 300)
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-neutral-900">상품</h3>
        <div className="flex gap-1 rounded-full bg-neutral-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('existing')}
            className={`${TAB_BUTTON} ${mode === 'existing' ? TAB_ACTIVE : TAB_INACTIVE}`}
          >
            기존 선택
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('new')
              setSelected(null)
            }}
            className={`${TAB_BUTTON} ${mode === 'new' ? TAB_ACTIVE : TAB_INACTIVE}`}
          >
            새로 등록
          </button>
        </div>
      </div>

      <input type="hidden" name="product_mode" value={mode} />
      <input type="hidden" name="product_id" value={selected?.id ?? ''} />

      {mode === 'existing' ? (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={query ?? ''}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="브랜드 또는 상품명 검색"
            className={INPUT_CLASS}
          />
          {selected ? (
            <div className="flex items-center gap-3 rounded-lg bg-lavender/20 px-3 py-2 text-sm">
              {selected.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selected.image_url}
                  alt={selected.name}
                  className="h-10 w-10 shrink-0 rounded object-cover"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-neutral-900">
                  {selected.brand} · {selected.name}
                </p>
                <p className="truncate text-xs text-neutral-500">
                  {selected.category} · {selected.image_url ?? '이미지 없음'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="shrink-0 text-xs text-neutral-500 hover:text-neutral-700"
              >
                선택 해제
              </button>
            </div>
          ) : (
            <>
              {isPending && <p className="text-xs text-neutral-400">검색 중...</p>}
              {results.length > 0 && (
                <ul className="flex flex-col gap-1 rounded-lg border border-neutral-200 p-1">
                  {results.map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(r)
                          setResults([])
                          setQuery(`${r.brand} ${r.name}`)
                        }}
                        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-neutral-50"
                      >
                        <span className="font-medium text-neutral-900">
                          {r.brand} · {r.name}
                        </span>
                        <span className="text-xs text-neutral-400">{r.category}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {!isPending && query.trim() && results.length === 0 && (
                <p className="text-xs text-neutral-400">검색 결과가 없습니다. &quot;새로 등록&quot;을 이용해주세요.</p>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <input
            name="product_brand"
            value={newBrand ?? ''}
            onChange={(e) => setNewBrand(e.target.value ?? '')}
            placeholder="브랜드"
            className={INPUT_CLASS}
          />
          <input
            name="product_name"
            value={newName ?? ''}
            onChange={(e) => setNewName(e.target.value ?? '')}
            placeholder="상품명"
            className={INPUT_CLASS}
          />
          <select name="product_category" defaultValue="" className={INPUT_CLASS}>
            <option value="" disabled>
              카테고리 선택
            </option>
            {ADMIN_CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div>
            <p className="mb-1.5 text-xs font-semibold text-neutral-500">상품 이미지</p>
            <ImageField />
          </div>
        </div>
      )}

      {error && <p className="text-xs text-accent-dark">{error}</p>}
    </div>
  )
}

'use client'

import { useRef, useState, useTransition } from 'react'
import { searchInfluencersAction, type InfluencerOption } from '@/lib/actions/admin'

const INPUT_CLASS =
  'h-11 rounded-lg border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15'
const TAB_BUTTON = 'rounded-full px-3 py-1'
const TAB_ACTIVE = 'bg-white text-primary shadow-sm'
const TAB_INACTIVE = 'text-neutral-500'

export function InfluencerField({ error }: { error?: string }) {
  const [mode, setMode] = useState<'existing' | 'new'>('existing')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<InfluencerOption[]>([])
  const [selected, setSelected] = useState<InfluencerOption | null>(null)
  const [newName, setNewName] = useState('')
  const [newHandle, setNewHandle] = useState('')
  const [newUrl, setNewUrl] = useState('')
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
        setResults(await searchInfluencersAction(value))
      })
    }, 300)
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-neutral-900">인플루언서</h3>
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

      <input type="hidden" name="influencer_mode" value={mode} />
      <input type="hidden" name="influencer_id" value={selected?.id ?? ''} />

      {mode === 'existing' ? (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={query ?? ''}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="이름 또는 인스타 핸들 검색"
            className={INPUT_CLASS}
          />
          {selected ? (
            <div className="flex items-center justify-between rounded-lg bg-lavender/20 px-3 py-2 text-sm">
              <span className="font-semibold text-neutral-900">
                {selected.name}{' '}
                <span className="font-normal text-neutral-500">@{selected.instagram_handle}</span>
              </span>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-xs text-neutral-500 hover:text-neutral-700"
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
                          setQuery(r.name)
                        }}
                        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-neutral-50"
                      >
                        <span className="font-medium text-neutral-900">{r.name}</span>
                        <span className="text-xs text-neutral-400">@{r.instagram_handle}</span>
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
            name="influencer_name"
            value={newName ?? ''}
            onChange={(e) => setNewName(e.target.value ?? '')}
            placeholder="이름"
            className={INPUT_CLASS}
          />
          <input
            name="influencer_instagram_handle"
            value={newHandle ?? ''}
            onChange={(e) => setNewHandle(e.target.value ?? '')}
            placeholder="인스타 핸들 (예: zena_official)"
            className={INPUT_CLASS}
          />
          <input
            name="influencer_instagram_url"
            value={newUrl ?? ''}
            onChange={(e) => setNewUrl(e.target.value ?? '')}
            placeholder="인스타 프로필 URL (선택)"
            className={INPUT_CLASS}
          />
        </div>
      )}

      {error && <p className="text-xs text-accent-dark">{error}</p>}
    </div>
  )
}

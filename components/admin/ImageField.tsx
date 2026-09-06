'use client'

import { useState, type ChangeEvent } from 'react'
import { uploadProductImageAction } from '@/lib/actions/admin'

const TAB_BUTTON = 'rounded-full px-3 py-1'
const TAB_ACTIVE = 'bg-white text-primary shadow-sm'
const TAB_INACTIVE = 'text-neutral-500'

export function ImageField() {
  const [mode, setMode] = useState<'url' | 'upload'>('url')
  const [imageUrl, setImageUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setImageUrl('')
    setPreviewUrl(URL.createObjectURL(file))
    setUploading(true)

    try {
      const formData = new FormData()
      formData.set('file', file)
      const result = await uploadProductImageAction(formData)
      if (result.ok && result.imageUrl) {
        setImageUrl(result.imageUrl)
        setPreviewUrl(result.imageUrl)
      } else {
        setError(result.error ?? '업로드에 실패했습니다.')
        setPreviewUrl(null)
      }
    } catch {
      setError('업로드 중 오류가 발생했습니다.')
      setPreviewUrl(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-fit gap-1 rounded-full bg-neutral-100 p-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`${TAB_BUTTON} ${mode === 'url' ? TAB_ACTIVE : TAB_INACTIVE}`}
        >
          URL 입력
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`${TAB_BUTTON} ${mode === 'upload' ? TAB_ACTIVE : TAB_INACTIVE}`}
        >
          파일 업로드
        </button>
      </div>

      {mode === 'url' ? (
        <input
          type="url"
          value={imageUrl ?? ''}
          onChange={(e) => {
            const value = e.target.value ?? ''
            setImageUrl(value)
            setPreviewUrl(value.trim() || null)
          }}
          placeholder="https://..."
          className="h-11 rounded-lg border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
        />
      ) : (
        <div className="flex flex-col gap-1.5">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="text-sm text-neutral-600 file:mr-3 file:rounded-full file:border-0 file:bg-lavender/30 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-lavender-foreground"
          />
          {uploading && <p className="text-xs text-neutral-400">업로드 중...</p>}
          {error && <p className="text-xs text-accent">{error}</p>}
          <p className="text-xs text-neutral-400">jpg, jpeg, png, webp / 최대 5MB</p>
        </div>
      )}

      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="상품 이미지 미리보기"
          className="h-28 w-28 rounded-lg border border-neutral-200 object-cover"
        />
      )}

      <input type="hidden" name="product_image_url" value={imageUrl ?? ''} />
    </div>
  )
}

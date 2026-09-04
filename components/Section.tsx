import type { ReactNode } from 'react'
import { EmptyState } from '@/components/EmptyState'

export type SectionTone = 'neutral' | 'primary' | 'accent' | 'lavender'

const TONE_BORDER: Record<SectionTone, string> = {
  neutral: 'border-neutral-900',
  primary: 'border-primary',
  accent: 'border-accent',
  lavender: 'border-lavender-dark',
}

export function Section({
  id,
  title,
  tone = 'neutral',
  isEmpty,
  emptyText,
  children,
}: {
  id?: string
  title: string
  tone?: SectionTone
  isEmpty: boolean
  emptyText: string
  children: ReactNode
}) {
  return (
    <section id={id}>
      <h2 className={`border-b-2 pb-2 text-lg font-bold text-neutral-900 ${TONE_BORDER[tone]}`}>
        {title}
      </h2>
      {isEmpty ? (
        <div className="mt-3.5">
          <EmptyState message={emptyText} />
        </div>
      ) : (
        <div className="mt-3.5 grid grid-cols-2 items-stretch gap-4 sm:gap-5 md:grid-cols-4">
          {children}
        </div>
      )}
    </section>
  )
}

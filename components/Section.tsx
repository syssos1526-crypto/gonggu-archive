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
  headerAction,
  children,
}: {
  id?: string
  title: string
  tone?: SectionTone
  isEmpty: boolean
  emptyText: string
  headerAction?: ReactNode
  children: ReactNode
}) {
  return (
    <section id={id}>
      <div className={`flex items-center justify-between gap-3 border-b-2 pb-2 ${TONE_BORDER[tone]}`}>
        <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
        {headerAction}
      </div>
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

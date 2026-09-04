import Link from 'next/link'
import { CATEGORY_CONFIG, type CategorySlug } from '@/lib/queries/category'

type NavKey = 'all' | CategorySlug

const NAV_ITEMS: { key: NavKey; label: string; href: string }[] = [
  { key: 'all', label: '전체', href: '/' },
  { key: 'beauty', label: CATEGORY_CONFIG.beauty.label, href: '/category/beauty' },
  { key: 'fashion', label: CATEGORY_CONFIG.fashion.label, href: '/category/fashion' },
  { key: 'food-health', label: CATEGORY_CONFIG['food-health'].label, href: '/category/food-health' },
  { key: 'living', label: CATEGORY_CONFIG.living.label, href: '/category/living' },
]

export function CategoryNav({ active }: { active?: NavKey }) {
  return (
    <nav className="overflow-x-auto bg-primary-dark px-4 py-2 sm:px-8">
      <ul className="mx-auto flex max-w-7xl items-center gap-2 whitespace-nowrap">
        {NAV_ITEMS.map((item) => (
          <li key={item.key}>
            <Link
              href={item.href}
              aria-current={active === item.key ? 'page' : undefined}
              className={`inline-block rounded-full px-3 py-1 text-sm font-bold transition-colors ${
                active === item.key
                  ? 'bg-white text-primary-dark shadow-sm'
                  : 'text-primary-foreground/75 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
        <li className="ml-2 border-l border-white/20 pl-4">
          <Link
            href="/#today-ending"
            className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground"
          >
            오늘 마감 공구
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
              <path
                d="M12 4a5 5 0 00-5 5v3.2c0 .5-.2 1-.5 1.4L5 15.5h14l-1.5-2c-.3-.4-.5-.9-.5-1.4V9a5 5 0 00-5-5z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M10 18.5a2 2 0 004 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </Link>
        </li>
      </ul>
    </nav>
  )
}

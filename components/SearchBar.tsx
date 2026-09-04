export function SearchBar({ defaultValue = '' }: { defaultValue?: string }) {
  return (
    <form action="/search" role="search" className="w-full">
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="브랜드, 상품, 인플루언서 검색"
        className="w-full rounded-full border-2 border-transparent bg-white px-4 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-white focus:outline-none"
      />
    </form>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-4 py-8 text-center">
      <p className="break-keep text-sm text-neutral-400">{message}</p>
    </div>
  )
}

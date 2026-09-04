export function ProductThumbnail({
  imageUrl,
  label,
  brand,
  variant = "product",
  className = "",
}: {
  imageUrl: string | null;
  label: string;
  brand?: string;
  variant?: "product" | "avatar";
  className?: string;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt={label} className={`object-cover bg-neutral-100 ${className}`} />
    );
  }

  if (variant === "avatar") {
    return (
      <div
        className={`flex items-center justify-center bg-lavender text-lavender-foreground ${className}`}
        aria-label={label}
      >
        <span className="text-lg font-bold">{label.charAt(0)}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-lavender/50 via-neutral-50 to-neutral-50 px-4 text-center ${className}`}
      aria-label={label}
    >
      {brand && (
        <span className="text-[11px] font-bold uppercase tracking-wide text-lavender-foreground/70">
          {brand}
        </span>
      )}
      <span className="line-clamp-2 break-keep text-sm font-bold text-neutral-600">{label}</span>
    </div>
  );
}

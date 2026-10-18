import { cn } from "@/lib/utils";

export function Avatar({ name, src, className }: { name: string; src?: string | null; className?: string }) {
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";
  return (
    <span className={cn("inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-info-soft text-xs font-bold text-primary", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote avatar URLs are arbitrary
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </span>
  );
}

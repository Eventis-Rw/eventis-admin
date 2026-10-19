import Image from "next/image";

import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-card", className)}>
      <Image src="/logo.png" alt="Eventis" width={96} height={96} className="h-full w-full object-contain" priority />
    </span>
  );
}

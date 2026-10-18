import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "info",
  href,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  tone?: "info" | "success" | "warning" | "danger" | "neutral";
  href?: string;
}) {
  const toneClass = {
    info: "bg-info-soft text-primary",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-destructive-soft text-destructive",
    neutral: "bg-muted text-muted-foreground",
  }[tone];

  const body = (
    <Card className={cn("flex items-start justify-between gap-3 p-5", href && "transition-colors hover:border-primary/50")}>
      <div className="min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-1.5 text-3xl font-bold tracking-tight tabular-nums">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <span className={cn("rounded-xl p-2.5", toneClass)}>
        <Icon className="h-5 w-5" aria-hidden />
      </span>
    </Card>
  );

  return href ? <Link href={href} className="block rounded-2xl">{body}</Link> : body;
}

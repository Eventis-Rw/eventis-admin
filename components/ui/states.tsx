import { AlertTriangle, Inbox, Wrench } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function EmptyState({ title, description, className }: { title: string; description?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 px-6 py-14 text-center", className)}>
      <Inbox className="h-8 w-8 text-muted-foreground" aria-hidden />
      <p className="text-sm font-semibold">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export function ErrorState({ title = "Could not load data", message }: { title?: string; message: string }) {
  return (
    <Card role="alert" className="flex items-start gap-3 border-destructive/40 p-5">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{message}</p>
      </div>
    </Card>
  );
}

export function BackendGap({ title, description, needs }: { title: string; description: string; needs: string[] }) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-warning-soft p-2 text-warning">
          <Wrench className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-5 rounded-xl border border-dashed border-border bg-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Backend work required</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm">
          {needs.map((need) => (
            <li key={need}>{need}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

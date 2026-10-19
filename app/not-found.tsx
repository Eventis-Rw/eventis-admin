import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">404</p>
        <h1 className="mt-3 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This console route does not exist.</p>
        <Link href="/eventis" className="mt-6 inline-block">
          <Button>Back to overview</Button>
        </Link>
      </div>
    </main>
  );
}

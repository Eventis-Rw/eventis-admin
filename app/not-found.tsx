import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-6">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">404</p>
        <h1 className="mt-4 text-3xl font-semibold text-zinc-900">Page not found</h1>
        <p className="mt-2 text-sm text-zinc-500">
          This dashboard route does not exist yet. Return to the overview page.
        </p>
        <Link href="/admin/dashboard" className="mt-6 inline-block">
          <Button>Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BrandMark } from "@/components/layout/brand-mark";
import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/permissions";

export const metadata: Metadata = { title: "Sign in" };

const NOTICES: Record<string, string> = {
  forbidden: "This account does not have administrator access.",
  expired: "Your session has expired. Please sign in again.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const session = await getSession().catch(() => null);
  if (session && isAdmin(session.user)) redirect("/eventis");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-3">
          <BrandMark className="h-11 w-11 text-lg" />
          <div>
            <p className="text-lg font-extrabold tracking-tight">EVENTIS</p>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Admin </p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h1 className="text-xl font-bold">Sign in</h1>
          <p className="mb-5 mt-1 text-sm text-muted-foreground">Use your administrator </p>
          <LoginForm next={next} notice={error ? NOTICES[error] : undefined} />
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">Access is restricted to authorised administrators.</p>
      </div>
    </main>
  );
}

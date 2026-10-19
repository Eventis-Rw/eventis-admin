"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";

import { loginAction, type LoginState } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  const message = state.error ?? notice;

  return (
    <form action={action} className="space-y-4" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {message ? (
        <div role="alert" className="flex items-start gap-2 rounded-xl bg-destructive-soft px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{message}</span>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="phone" className="text-sm font-medium">Phone number</label>
        <Input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="username" placeholder="+250 788 123 456" defaultValue={state.phone} required />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="pin" className="text-sm font-medium">PIN</label>
        <Input id="pin" name="pin" type="password" inputMode="numeric" autoComplete="current-password" maxLength={5} placeholder="5-digit PIN" required />
      </div>

      <Button type="submit" className="w-full" loading={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

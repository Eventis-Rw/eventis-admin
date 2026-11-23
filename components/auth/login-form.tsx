"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";

import { loginAction, type LoginState } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm({
  next,
  notice,
}: {
  next?: string;
  notice?: string;
}) {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );
  const message = state.error ?? notice;

  return (
    <form action={action} className="space-y-4" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {message ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-destructive-soft px-3 py-2.5 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{message}</span>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email address
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="admin@yourdomain.com"
          defaultValue={state.email}
          maxLength={255}
          disabled={pending}
          required
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          maxLength={256}
          disabled={pending}
          required
        />
      </div>

      <Button type="submit" className="w-full" loading={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

"use client";

import { useActionState, type ReactNode } from "react";

type Feedback = { error?: string; message?: string };

export function AdminActionForm({ action, children }: {
  action: (previous: Feedback, data: FormData) => Promise<Feedback>;
  children: ReactNode;
}) {
  const [feedback, dispatch, pending] = useActionState(action, {});
  return (
    <form action={dispatch} className="space-y-2">
      <fieldset disabled={pending} className="space-y-3 disabled:opacity-60">
        {children}
      </fieldset>
      {pending ? <p role="status" className="text-sm text-muted-foreground">Saving…</p> : null}
      {feedback.error ? <p role="alert" className="text-sm text-destructive">{feedback.error}</p> : null}
      {feedback.message ? <p role="status" className="text-sm text-success">{feedback.message}</p> : null}
    </form>
  );
}

"use client";

import { ErrorState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";

export default function ConsoleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <ErrorState
        title="Something went wrong"
        message={error.message.includes("unreachable") ? error.message : "The page could not be rendered. Try again, and check that the Eventis API is running."}
      />
      <Button variant="secondary" onClick={reset}>Try again</Button>
    </div>
  );
}

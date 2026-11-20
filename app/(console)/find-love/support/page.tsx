import { requireAdmin } from "@/lib/session";
import { apiFetch, toResult } from "@/lib/api";
import type { SupportTicket } from "@/lib/find-love/types";
import { USE_MOCK_DATA } from "@/lib/config";
import { ErrorState } from "@/components/ui/states";
import type { Metadata } from "next";

import { SupportView } from "@/components/find-love/support-view";
import { getFindLoveStore } from "@/lib/find-love/store";

export const metadata: Metadata = {
  title: "Messages & Customer Support — FindLove Admin",
  description:
    "Customer support ticket inbox, internal notes, category assignment, and dispute resolution.",
};

export default async function FindLoveSupportPage() {
  const { token } = await requireAdmin();
  const result = USE_MOCK_DATA
    ? { ok: true as const, data: getFindLoveStore().tickets }
    : await toResult(() =>
        apiFetch<SupportTicket[]>("/admin/findlove/support", { token }),
      );
  if (!result.ok)
    return <ErrorState title="Could not load support" message={result.error} />;

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Messages & Customer Support
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Handle member support tickets, payment inquiries, account questions,
          and confidential internal coordination.
        </p>
      </div>

      <SupportView tickets={result.data} live={!USE_MOCK_DATA} />
    </div>
  );
}

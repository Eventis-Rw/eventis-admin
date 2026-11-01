import type { Metadata } from "next";

import { AuditView } from "@/components/find-love/audit-view";
import { getFindLoveStore } from "@/lib/find-love/store";

export const metadata: Metadata = {
  title: "Audit Logs & Security Trail — FindLove Admin",
  description: "Immutable, searchable record of all administrative operations, document access, and financial edits.",
};

export default function FindLoveAuditPage() {
  const store = getFindLoveStore();

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Audit Logs
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review immutable administrative actions, document access requests, pricing modifications, and safety interventions.
        </p>
      </div>

      <AuditView logs={store.auditLogs} />
    </div>
  );
}

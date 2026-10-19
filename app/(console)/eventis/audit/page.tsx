import type { Metadata } from "next";

import { AuditTable } from "@/components/eventis/audit-table";
import { BackendGap } from "@/components/ui/states";
import { loadAudit } from "@/lib/eventis/data";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Audit log" };

export default async function Page() {
  await requireAdmin();
  const entries = await loadAudit();

  if (!entries) {
    return (
      <BackendGap
        title="Audit log is not available yet"
        description="No administrative action is recorded by the backend, so there is no log to display."
        needs={[
        "Persist admin actions (actor, action, target, time) in the API",
        "GET /admin/audit-logs with pagination and filters"
      ]}
      />
    );
  }

  return <AuditTable entries={entries} />;
}

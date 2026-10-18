import type { Metadata } from "next";

import { ReportsTable, type ReportRow } from "@/components/eventis/reports-table";
import { BackendGap } from "@/components/ui/states";
import { loadReports, loadUsers } from "@/lib/eventis/data";
import { fullName } from "@/lib/format";
import { can } from "@/lib/permissions";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Reports & messages" };

export default async function Page() {
  const { token, user } = await requireAdmin();
  const reports = await loadReports();

  if (!reports) {
    return (
      <BackendGap
        title="Reports & messages is not available yet"
        description="The API has no reports or support endpoint, and chat conversations are participant-only. That is good for privacy, so message content will not be exposed."
        needs={[
        "POST /support/reports (called by the mobile app) plus GET /admin/reports with status and target",
        "PATCH /admin/reports/:id to resolve, dismiss or escalate",
        "Metadata-only messaging issue flags; no access to private message bodies"
      ]}
      />
    );
  }

  const users = await loadUsers(token);
  const names = new Map((users.ok ? users.data : []).map((item) => [item.id, fullName(item)]));
  const rows: ReportRow[] = reports.map((report) => ({ ...report, reporterName: names.get(report.reporterId) ?? "Unknown user" }));

  return <ReportsTable reports={rows} canManage={can(user, "reports:manage")} />;
}

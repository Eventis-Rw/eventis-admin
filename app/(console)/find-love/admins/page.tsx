import { requireAdmin } from "@/lib/session";
import { apiFetch, toResult } from "@/lib/api";
import type { AdminAccount } from "@/lib/find-love/types";
import { USE_MOCK_DATA } from "@/lib/config";
import { ErrorState } from "@/components/ui/states";
import type { Metadata } from "next";

import { AdminsView } from "@/components/find-love/admins-view";
import { getFindLoveStore } from "@/lib/find-love/store";

export const metadata: Metadata = {
  title: "Admin Users & Permissions — FindLove Admin",
  description:
    "Manage administrative roles, least-privilege permissions, and staff accounts.",
};

export default async function FindLoveAdminsPage() {
  const { token } = await requireAdmin();
  const result = USE_MOCK_DATA
    ? { ok: true as const, data: getFindLoveStore().admins }
    : await toResult(() =>
        apiFetch<AdminAccount[]>("/admin/findlove/staff", { token }),
      );
  if (!result.ok)
    return <ErrorState title="Could not load admins" message={result.error} />;

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Admin Users & Permissions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enforce role-based access control (RBAC), protect user identity
          documents, and ensure sensitive operations are restricted to
          authorized personnel.
        </p>
      </div>

      <AdminsView admins={result.data} live={!USE_MOCK_DATA} />
    </div>
  );
}

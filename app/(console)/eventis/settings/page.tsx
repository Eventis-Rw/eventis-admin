import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/config";
import { fmtDateTime } from "@/lib/format";
import { rolePermissions, type Permission } from "@/lib/permissions";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Settings" };

const ALL: { key: Permission; label: string }[] = [
  { key: "users:read", label: "View users" },
  { key: "users:manage", label: "Suspend / reactivate users" },
  { key: "events:read", label: "View events" },
  { key: "organisers:read", label: "View organisers" },
];

export default async function SettingsPage() {
  const { user } = await requireAdmin();
  let apiHost = "unknown";
  try {
    apiHost = new URL(API_BASE_URL).host;
  } catch {}

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader title="Your session" description="Verified with the API on every request" />
        <dl className="grid grid-cols-[120px_1fr] gap-3 p-5 text-sm">
          <dt className="text-muted-foreground">Name</dt>
          <dd className="font-medium">{user.displayName ?? "—"}</dd>
          <dt className="text-muted-foreground">Phone</dt>
          <dd className="font-medium">{user.phone}</dd>
          <dt className="text-muted-foreground">Roles</dt>
          <dd className="flex flex-wrap gap-1">{user.roles.map((role) => <Badge key={role} tone="info">{role}</Badge>)}</dd>
          <dt className="text-muted-foreground">Account created</dt>
          <dd className="font-medium">{fmtDateTime(user.createdAt)}</dd>
          <dt className="text-muted-foreground">API host</dt>
          <dd className="font-medium">{apiHost}</dd>
        </dl>
      </Card>

      <Card>
        <CardHeader title="Roles & permissions" description="Console policy. The API remains the source of truth." />
        <div className="overflow-x-auto p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 font-semibold">Permission</th>
                {Object.keys(rolePermissions).map((role) => <th key={role} className="pb-2 font-semibold capitalize">{role}</th>)}
              </tr>
            </thead>
            <tbody>
              {ALL.map(({ key, label }) => (
                <tr key={key} className="border-t border-border">
                  <td className="py-2">{label}</td>
                  {Object.values(rolePermissions).map((perms, index) => <td key={index} className="py-2">{perms.includes(key) ? "Allowed" : "—"}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-xs text-muted-foreground">
            The backend has a single privileged role (admin). Custom roles, role assignment and platform settings need new API endpoints.
          </p>
        </div>
      </Card>
    </div>
  );
}

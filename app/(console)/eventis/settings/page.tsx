import type { Metadata } from "next";
import { ConsoleRolesPanel, EventisSettingsPanel } from "@/components/eventis/console-settings-panel";
import { Card, CardHeader } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/states";
import { apiFetch, toResult } from "@/lib/api";
import { USE_MOCK_DATA } from "@/lib/config";
import { loadConsoleAccess } from "@/lib/eventis/console-access";
import type { ConsoleRoles, EventisSettings } from "@/lib/eventis/console-settings";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Settings & roles" };

export default async function SettingsPage() {
  const { user, token } = await requireAdmin();
  const access = await loadConsoleAccess(token);
  if (!access) return <ErrorState message="Unable to load console permissions." />;
  const [settings, roles] = await Promise.all([
    !USE_MOCK_DATA && (access.unrestricted || access.permissions.includes("settings:manage"))
      ? toResult(() => apiFetch<EventisSettings>("/admin/eventis/settings", { token })) : null,
    !USE_MOCK_DATA && access.unrestricted
      ? toResult(() => apiFetch<ConsoleRoles>("/admin/console-roles", { token })) : null,
  ]);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Your session" />
        <div className="space-y-1 p-5 text-sm">
          <p className="font-semibold">{user.displayName || user.phone}</p>
          <p className="text-muted-foreground">{access.unrestricted ? "Unrestricted administrator" : "Custom console role"}</p>
        </div>
      </Card>
      {USE_MOCK_DATA ? <p className="text-sm text-muted-foreground">Global settings and console roles are available in API mode.</p> : null}
      {settings?.ok ? <EventisSettingsPanel settings={settings.data} /> : settings ? <ErrorState message={settings.error} /> : null}
      {roles?.ok ? <ConsoleRolesPanel data={roles.data} actorId={user.id} /> : roles ? <ErrorState message={roles.error} /> : null}
    </div>
  );
}

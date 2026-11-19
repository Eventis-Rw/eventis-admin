import { AdminActionForm } from "@/components/eventis/admin-action-form";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { assignConsoleRole, saveConsoleRole, saveEventisSettings } from "@/lib/eventis/console-actions";
import { consolePermissions, type ConsolePermission, type ConsoleRoles, type EventisSettings } from "@/lib/eventis/console-settings";

export function EventisSettingsPanel({ settings }: { settings: EventisSettings }) {
  return (
    <Card>
      <CardHeader title="Global Eventis settings" />
      <div className="p-5">
        <AdminActionForm key={settings.revision} action={saveEventisSettings}>
          <input type="hidden" name="revision" value={settings.revision} />
          <label className="block space-y-1 text-sm">Display name
            <Input name="displayName" defaultValue={settings.displayName} required maxLength={80} />
          </label>
          <label className="block space-y-1 text-sm">Support email
            <Input name="supportEmail" type="email" defaultValue={settings.supportEmail ?? ""} maxLength={254} />
          </label>
          <label className="block space-y-1 text-sm">Announcement
            <textarea name="announcement" defaultValue={settings.announcement ?? ""} maxLength={500}
              className="block min-h-24 w-full rounded-xl border border-border bg-input p-3" />
          </label>
          <Button type="submit">Save settings</Button>
        </AdminActionForm>
      </div>
    </Card>
  );
}

function RoleForm({ role, assigned }: { role?: ConsoleRoles["roles"][number]; assigned?: boolean }) {
  return (
    <AdminActionForm action={saveConsoleRole.bind(null, role?.id ?? null)}>
      <label className="block space-y-1 text-sm">Role name
        <Input name="name" defaultValue={role?.name ?? ""} required minLength={2} maxLength={80} />
      </label>
      <fieldset className="grid gap-2 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-semibold">Permissions</legend>
        {(Object.keys(consolePermissions) as ConsolePermission[]).map((permission) => (
          <label key={permission} className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="permissions" value={permission}
              defaultChecked={role?.permissions.includes(permission)} className="mt-1" />
            {consolePermissions[permission]}
          </label>
        ))}
      </fieldset>
      <div className="flex flex-wrap gap-2">
        <Button type="submit">{role ? "Save role" : "Create role"}</Button>
        {role && !assigned ? (
          <Button type="submit" name="operation" value="delete" variant="destructive" formNoValidate>Delete role</Button>
        ) : null}
      </div>
    </AdminActionForm>
  );
}

export function ConsoleRolesPanel({ data, actorId }: { data: ConsoleRoles; actorId: string }) {
  return (
    <Card>
      <CardHeader title="Console roles" description="Assign permissions to existing administrators. Unrestricted administrators manage roles." />
      <div className="space-y-5 p-5">
        <details className="rounded-xl border border-border p-4">
          <summary className="cursor-pointer font-semibold">Create a role</summary>
          <div className="mt-3"><RoleForm /></div>
        </details>
        {data.roles.map((role) => (
          <details key={role.id} className="rounded-xl border border-border p-4">
            <summary className="cursor-pointer font-semibold">{role.name}</summary>
            <div className="mt-3">
              <RoleForm role={role} assigned={data.administrators.some((admin) => admin.consoleRoleId === role.id)} />
            </div>
          </details>
        ))}
        <h3 className="font-semibold">Administrator assignments</h3>
        {data.administrators.map((admin) => (
          <div key={admin.id} className="rounded-xl border border-border p-4">
            <p className="mb-2 text-sm font-semibold">{admin.displayName || admin.phone}</p>
            {admin.id === actorId ? <p className="text-sm text-muted-foreground">Your account · Unrestricted administrator</p> : (
              <AdminActionForm key={admin.consoleRoleId ?? "unrestricted"} action={assignConsoleRole.bind(null, admin.id)}>
                <label className="block space-y-1 text-sm">Assigned role
                  <Select name="roleId" defaultValue={admin.consoleRoleId ?? ""}>
                    <option value="">Unrestricted administrator</option>
                    {data.roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                  </Select>
                </label>
                <Button type="submit" variant="secondary">Save assignment</Button>
              </AdminActionForm>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

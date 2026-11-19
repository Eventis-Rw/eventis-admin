import type { Metadata } from "next";

import { UsersTable } from "@/components/eventis/users-table";
import { ErrorState } from "@/components/ui/states";
import { loadConsoleAccess } from "@/lib/eventis/console-access";
import { loadEvents, loadUsers } from "@/lib/eventis/data";
import { can } from "@/lib/permissions";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  const { token, user } = await requireAdmin();
  const [users, events, access] = await Promise.all([loadUsers(token), loadEvents(token), loadConsoleAccess(token)]);

  if (!users.ok) return <ErrorState message={users.error} />;

  const eventCounts: Record<string, number> = {};
  if (events.ok) for (const event of events.data.items) eventCounts[event.poster_id] = (eventCounts[event.poster_id] ?? 0) + 1;

  return <UsersTable users={users.data} currentUserId={user.id} canManage={can(user, "users:manage") && (!access || access.unrestricted || access.permissions.includes("users:manage"))} canManageAdmins={access ? access.unrestricted : false} eventCounts={eventCounts} />;
}

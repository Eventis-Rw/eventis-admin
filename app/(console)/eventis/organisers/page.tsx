import Link from "next/link";
import type { Metadata } from "next";

import { OrganisersTable, type OrganiserRow } from "@/components/eventis/organisers-table";
import { ErrorState } from "@/components/ui/states";
import { loadEvents, loadUsers } from "@/lib/eventis/data";
import { loadConsoleAccess } from "@/lib/eventis/console-access";
import { organiserWorkflows } from "@/lib/eventis/console-settings";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Organisers" };

export default async function OrganisersPage() {
  const { token } = await requireAdmin();
  const [users, events, access] = await Promise.all([loadUsers(token), loadEvents(token), loadConsoleAccess(token)]);



  const rows: OrganiserRow[] = (users.ok ? users.data : [])
    .filter((user) => user.accountType === "POSTER")
    .map((user) => {
      const mine = events.ok ? events.data.items.filter((event) => event.poster_id === user.id) : [];
      return { user, events: mine.length, published: mine.filter((event) => event.status === "published").length };
    });

  return (
    <div className="space-y-4">
      <nav aria-label="Organiser administration" className="flex flex-wrap gap-3">
        {access?.unrestricted ? <Link href="/eventis/organisers/applications" className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted">Organiser applications</Link> : null}
        {Object.entries(organiserWorkflows).filter(([, item]) => access?.unrestricted || access?.permissions.includes(item.permission)).map(([slug, item]) => (
          <Link key={slug} href={`/eventis/organisers/${slug}`} className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted">{item.title}</Link>
        ))}
      </nav>
      {users.ok ? <OrganisersTable rows={rows} eventsAvailable={events.ok} /> : (
        !access || access.unrestricted || access.permissions.includes("users:read") ? <ErrorState message={users.error} /> : null
      )}
    </div>
  );
}

import type { Metadata } from "next";

import { OrganisersTable, type OrganiserRow } from "@/components/eventis/organisers-table";
import { ErrorState } from "@/components/ui/states";
import { loadEvents, loadUsers } from "@/lib/eventis/data";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Organisers" };

export default async function OrganisersPage() {
  const { token } = await requireAdmin();
  const [users, events] = await Promise.all([loadUsers(token), loadEvents(token)]);

  if (!users.ok) return <ErrorState message={users.error} />;

  const rows: OrganiserRow[] = users.data
    .filter((user) => user.accountType === "POSTER")
    .map((user) => {
      const mine = events.ok ? events.data.items.filter((event) => event.poster_id === user.id) : [];
      return { user, events: mine.length, published: mine.filter((event) => event.status === "published").length };
    });

  return <OrganisersTable rows={rows} eventsAvailable={events.ok} />;
}

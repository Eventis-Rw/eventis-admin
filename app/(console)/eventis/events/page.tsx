import type { Metadata } from "next";

import { EventsTable, type OrganiserInfo } from "@/components/eventis/events-table";
import { ErrorState } from "@/components/ui/states";
import { loadEvents, loadUsers } from "@/lib/eventis/data";
import { fullName } from "@/lib/format";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Events" };

export default async function EventsPage() {
  const { token } = await requireAdmin();
  const [events, users] = await Promise.all([loadEvents(token), loadUsers(token)]);

  if (!events.ok) return <ErrorState message={events.error} />;

  const organisers: Record<string, OrganiserInfo> = {};
  if (users.ok) {
    for (const user of users.data) {
      organisers[user.id] = {
        id: user.id,
        name: user.organizationName ?? fullName(user),
        phone: user.phone,
        email: user.email,
        suspended: user.status === "INACTIVE",
      };
    }
  }

  return (
    <>
      {!users.ok ? <div className="mb-4"><ErrorState title="Organiser details unavailable" message={users.error} /></div> : null}
      <EventsTable events={events.data.items} organisers={organisers} truncatedTotal={events.data.truncated ? events.data.total : undefined} />
    </>
  );
}

import type { Metadata } from "next";

import { BookingsTable, type BookingRow } from "@/components/eventis/bookings-table";
import { BackendGap } from "@/components/ui/states";
import { loadBookings, loadEvents, loadUsers } from "@/lib/eventis/data";
import { fullName } from "@/lib/format";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Bookings & tickets" };

export default async function Page() {
  const { token } = await requireAdmin();
  const bookings = await loadBookings();

  if (!bookings) {
    return (
      <BackendGap
        title="Bookings & tickets is not available yet"
        description="The Eventis API does not expose bookings, orders or tickets to any client, so there is nothing real to list. No sample data is shown."
        needs={[
        "GET /admin/bookings with pagination, status filter and event/user joins",
        "GET /admin/tickets (ticket records, check-in state)",
        "Admin-scoped refund or cancel actions, if required"
      ]}
      />
    );
  }

  const [users, events] = await Promise.all([loadUsers(token), loadEvents(token)]);
  const userNames = new Map((users.ok ? users.data : []).map((user) => [user.id, fullName(user)]));
  const eventTitles = new Map((events.ok ? events.data.items : []).map((event) => [event.id, event.title]));

  const rows: BookingRow[] = bookings.map((booking) => ({
    ...booking,
    eventTitle: eventTitles.get(booking.eventId) ?? "Unknown event",
    userName: userNames.get(booking.userId) ?? "Unknown user",
  }));

  return <BookingsTable bookings={rows} />;
}

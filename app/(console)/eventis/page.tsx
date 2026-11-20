import type { Metadata } from "next";
import { Building2, CalendarDays, Ticket, UserCheck, UserX, Users } from "lucide-react";
import Link from "next/link";

import { BarChart, DonutChart, dailyCounts } from "@/components/shared/charts";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { loadAudit, loadBookings, loadEvents, loadUsers } from "@/lib/eventis/data";
import { fmtDateTime, fmtNumber, fullName } from "@/lib/format";
import { loadConsoleAccess } from "@/lib/eventis/console-access";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Overview" };

export default async function OverviewPage() {
  const { token } = await requireAdmin();
  const access = await loadConsoleAccess(token);
  const [users, events, bookings, audit] = await Promise.all([
    !access || access.unrestricted || access.permissions.includes("users:read")
      ? loadUsers(token) : { ok: false as const, error: "Your role does not include user metrics." },
    !access || access.unrestricted || access.permissions.includes("events:read")
      ? loadEvents(token) : { ok: false as const, error: "Your role does not include event metrics." },
    loadBookings(),
    !access || access.unrestricted || access.permissions.includes("audit:read") ? loadAudit() : null,
  ]);

  const userList = users.ok ? users.data : [];
  const eventList = events.ok ? events.data.items : [];

  const active = userList.filter((user) => user.status === "ACTIVE").length;
  const suspended = userList.length - active;
  const organisers = userList.filter((user) => user.accountType === "POSTER").length;
  const published = eventList.filter((event) => event.status === "published").length;
  const draft = eventList.filter((event) => event.status === "draft").length;
  const cancelled = eventList.filter((event) => event.status === "cancelled").length;

  const userNames = new Map(userList.map((user) => [user.id, fullName(user)]));
  const activity = [
    ...userList.map((user) => ({
      id: `u-${user.id}`,
      at: user.createdAt,
      title: `${fullName(user)} registered`,
      detail: user.accountType === "POSTER" ? "Organiser account" : user.accountType === "LOVE" ? "Find Love account" : "Customer account",
    })),
    ...(audit ?? []).slice(0, 8).map((entry) => ({
      id: `a-${entry.id}`,
      at: entry.createdAt,
      title: entry.action,
      detail: `${entry.target} · by ${entry.actorName}`,
    })),
    ...eventList.map((event) => ({
      id: `e-${event.id}`,
      at: event.created_at,
      title: `Event “${event.title}” created`,
      detail: `By ${userNames.get(event.poster_id) ?? "unknown organiser"} · ${event.status}`,
    })),
  ]
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {!users.ok ? <ErrorState title="User metrics unavailable" message={users.error} /> : null}
      {!events.ok ? <ErrorState title="Event metrics unavailable" message={events.error} /> : null}

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total users" value={users.ok ? fmtNumber(userList.length) : "—"} icon={Users} href="/eventis/users" />
        <StatCard label="Active accounts" value={users.ok ? fmtNumber(active) : "—"} icon={UserCheck} tone="success" hint="Accounts in good standing" href="/eventis/users" />
        <StatCard label="Suspended accounts" value={users.ok ? fmtNumber(suspended) : "—"} icon={UserX} tone={suspended ? "danger" : "neutral"} href="/eventis/users" />
        <StatCard label="Events" value={events.ok ? fmtNumber(events.data.total) : "—"} icon={CalendarDays} hint={events.ok ? `${published} published · ${draft} draft · ${cancelled} cancelled` : undefined} href="/eventis/events" />
        <StatCard label="Organisers" value={users.ok ? fmtNumber(organisers) : "—"} icon={Building2} hint="Accounts registered as organisers" href="/eventis/organisers" />
        {bookings ? (
          <StatCard label="Bookings" value={fmtNumber(bookings.length)} icon={Ticket} hint={`${bookings.filter((booking) => booking.status === "confirmed").length} confirmed · ${bookings.filter((booking) => booking.status === "pending").length} pending`} href="/eventis/bookings" />
        ) : (
          <StatCard label="Bookings" value="Not available" icon={Ticket} tone="warning" hint="The API has no booking/ticket endpoints yet" href="/eventis/bookings" />
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="New registrations" description="Accounts created per day, last 14 days (Kigali time)" />
          <div className="p-5">
            {users.ok ? <BarChart data={dailyCounts(userList.map((user) => user.createdAt), 14)} ariaLabel="Registrations per day for the last 14 days" /> : <EmptyState title="No data" />}
          </div>
        </Card>
        <Card>
          <CardHeader title="Account status" description="Users by standing" />
          <div className="p-5">
            <DonutChart
              ariaLabel="Active versus suspended accounts"
              centerLabel="users"
              slices={[
                { label: "Active", value: active, color: "var(--success)" },
                { label: "Suspended", value: suspended, color: "var(--destructive)" },
              ]}
            />
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader title="Events by status" description="All events, including drafts" />
          <div className="p-5">
            <DonutChart
              ariaLabel="Events by status"
              centerLabel="events"
              slices={[
                { label: "Published", value: published, color: "var(--success)" },
                { label: "Draft", value: draft, color: "var(--accent)" },
                { label: "Cancelled", value: cancelled, color: "var(--destructive)" },
              ]}
            />
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader
            title="Recent platform activity"
            description={audit ? "Registrations, new events and admin actions." : "Registrations and new events available to your role."}
            action={<Link href="/eventis/audit" className="text-xs font-semibold text-primary hover:underline">Audit log status</Link>}
          />
          {activity.length === 0 ? (
            <EmptyState title="No activity yet" description="New registrations and events will appear here." />
          ) : (
            <ol className="divide-y divide-border">
              {activity.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  <Badge tone="neutral" className="shrink-0 font-medium">{fmtDateTime(item.at)}</Badge>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </section>
    </div>
  );
}

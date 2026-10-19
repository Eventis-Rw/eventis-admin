"use client";

import { useState } from "react";

import { PAGE_SIZE, Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SearchInput, Select } from "@/components/ui/input";
import { Drawer } from "@/components/ui/overlay";
import { EmptyState } from "@/components/ui/states";
import { Table, Td, Th } from "@/components/ui/table";
import { fmtDateTime, fmtNumber } from "@/lib/format";
import type { Booking, BookingStatus, TicketStatus } from "@/types";

export interface BookingRow extends Booking {
  eventTitle: string;
  userName: string;
}

const BOOKING_TONE: Record<BookingStatus, "success" | "warning" | "danger" | "neutral"> = {
  confirmed: "success",
  pending: "warning",
  cancelled: "danger",
  refunded: "neutral",
};

const TICKET_TONE: Record<TicketStatus, "success" | "neutral" | "danger"> = { valid: "success", used: "neutral", cancelled: "danger" };

function money(amount: number, currency: string): string {
  return `${fmtNumber(amount)} ${currency}`;
}

export function BookingsTable({ bookings }: { bookings: BookingRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const needle = query.trim().toLowerCase();
  const filtered = bookings.filter((booking) => {
    if (status !== "all" && booking.status !== status) return false;
    if (!needle) return true;
    return [booking.reference, booking.eventTitle, booking.userName].some((value) => value.toLowerCase().includes(needle));
  });

  const current = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const selected = bookings.find((booking) => booking.id === selectedId) ?? null;

  return (
    <>
      <Card>
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-[1fr_180px]">
          <SearchInput aria-label="Search bookings" placeholder="Search reference, event or customer…" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
          <Select aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
            <option value="all">All statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </Select>
        </div>

        {rows.length === 0 ? (
          <EmptyState title="No bookings match your filters" description="Try a different search or clear the filters." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Reference</Th>
                <Th>Event</Th>
                <Th>Customer</Th>
                <Th className="text-right">Tickets</Th>
                <Th className="text-right">Total</Th>
                <Th>Status</Th>
                <Th>Booked</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((booking) => (
                <tr key={booking.id} className="cursor-pointer hover:bg-muted/60" onClick={() => setSelectedId(booking.id)}>
                  <Td className="font-semibold">{booking.reference}</Td>
                  <Td className="max-w-[200px] truncate">{booking.eventTitle}</Td>
                  <Td className="max-w-[160px] truncate">{booking.userName}</Td>
                  <Td className="text-right tabular-nums">{booking.quantity}</Td>
                  <Td className="whitespace-nowrap text-right tabular-nums">{money(booking.totalAmount, booking.currency)}</Td>
                  <Td><Badge tone={BOOKING_TONE[booking.status]} dot className="capitalize">{booking.status}</Badge></Td>
                  <Td className="whitespace-nowrap text-muted-foreground">{fmtDateTime(booking.createdAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        <Pagination page={current} total={filtered.length} onPage={setPage} />
      </Card>

      <Drawer open={selected !== null} onClose={() => setSelectedId(null)} title={selected?.reference ?? ""} description={selected ? `Booking ${selected.id}` : undefined}>
        {selected ? (
          <div className="space-y-5">
            <Badge tone={BOOKING_TONE[selected.status]} dot className="capitalize">{selected.status}</Badge>
            <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Event</dt>
              <dd className="font-medium">{selected.eventTitle}</dd>
              <dt className="text-muted-foreground">Customer</dt>
              <dd className="font-medium">{selected.userName}</dd>
              <dt className="text-muted-foreground">Total</dt>
              <dd className="font-medium">{money(selected.totalAmount, selected.currency)}</dd>
              <dt className="text-muted-foreground">Booked</dt>
              <dd className="font-medium">{fmtDateTime(selected.createdAt)}</dd>
            </dl>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tickets</p>
              <ul className="divide-y divide-border rounded-xl border border-border">
                {selected.tickets.map((ticket) => (
                  <li key={ticket.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                    <span>
                      <span className="block font-medium">{ticket.code}</span>
                      <span className="block text-xs text-muted-foreground">{ticket.tier}</span>
                    </span>
                    <Badge tone={TICKET_TONE[ticket.status]} className="capitalize">{ticket.status}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </Drawer>
    </>
  );
}

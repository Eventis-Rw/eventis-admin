"use client";

import { useState } from "react";
import { Info } from "lucide-react";

import { PAGE_SIZE, Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SearchInput, Select } from "@/components/ui/input";
import { Drawer } from "@/components/ui/overlay";
import { EmptyState } from "@/components/ui/states";
import { Table, Td, Th } from "@/components/ui/table";
import { fmtDate, fmtDateTime, fmtNumber } from "@/lib/format";
import type { AdminEvent, EventStatus } from "@/types";

export interface OrganiserInfo {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  suspended: boolean;
}

const STATUS_LABEL: Record<EventStatus, string> = { published: "Published", draft: "Draft", cancelled: "Cancelled" };

export function EventStatusBadge({ status }: { status: EventStatus }) {
  const tone = status === "published" ? "success" : status === "cancelled" ? "danger" : "neutral";
  return <Badge tone={tone} dot>{STATUS_LABEL[status] ?? status}</Badge>;
}

export function EventsTable({ events, organisers, truncatedTotal }: { events: AdminEvent[]; organisers: Record<string, OrganiserInfo>; truncatedTotal?: number }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const categories = [...new Set(events.map((event) => event.category).filter((value): value is string => Boolean(value)))].sort();
  const needle = query.trim().toLowerCase();

  const filtered = events.filter((event) => {
    if (status !== "all" && event.status !== status) return false;
    if (category !== "all" && event.category !== category) return false;
    if (!needle) return true;
    return [event.title, event.location, event.category, organisers[event.poster_id]?.name].some((value) => value?.toLowerCase().includes(needle));
  });

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const selected = events.find((event) => event.id === selectedId) ?? null;
  const organiser = selected ? organisers[selected.poster_id] : undefined;

  return (
    <>
      <div className="mb-4 flex items-start gap-2 rounded-xl bg-info-soft px-4 py-3 text-sm text-primary">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          Events are read-only here. The API only lets an event&apos;s own organiser edit, cancel or delete it, so admin moderation actions
          (unpublish, cancel, remove) need a new backend endpoint.
          {truncatedTotal ? ` Showing the newest ${fmtNumber(events.length)} of ${fmtNumber(truncatedTotal)} events.` : ""}
        </p>
      </div>

      <Card>
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-[1fr_170px_170px]">
          <SearchInput aria-label="Search events" placeholder="Search title, venue, category, organiser…" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
          <Select aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <Select aria-label="Filter by category" value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}>
            <option value="all">All categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
        </div>

        {rows.length === 0 ? (
          <EmptyState title={events.length === 0 ? "No events yet" : "No events match your filters"} description={events.length === 0 ? "Events created by organisers will appear here." : "Try a different search or clear the filters."} />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Event</Th>
                <Th>Organiser</Th>
                <Th>Date</Th>
                <Th>Category</Th>
                <Th>Status</Th>
                <Th className="text-right">Views</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((event) => (
                <tr key={event.id} className="cursor-pointer hover:bg-muted/60" onClick={() => setSelectedId(event.id)}>
                  <Td>
                    <button type="button" className="text-left" onClick={(e) => { e.stopPropagation(); setSelectedId(event.id); }}>
                      <span className="block max-w-[240px] truncate font-semibold">{event.title}</span>
                      <span className="block max-w-[240px] truncate text-xs text-muted-foreground">{event.location}</span>
                    </button>
                  </Td>
                  <Td className="max-w-[180px] truncate">{organisers[event.poster_id]?.name ?? <span className="text-muted-foreground">Unknown</span>}</Td>
                  <Td className="whitespace-nowrap text-muted-foreground">{fmtDate(event.start_date)} · {event.time}</Td>
                  <Td>{event.category ?? <span className="text-muted-foreground">—</span>}</Td>
                  <Td><EventStatusBadge status={event.status} /></Td>
                  <Td className="text-right tabular-nums">{fmtNumber(event.views_count)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        <Pagination page={current} total={filtered.length} onPage={setPage} />
      </Card>

      <Drawer open={selected !== null} onClose={() => setSelectedId(null)} title={selected?.title ?? ""} description={selected ? `Event ID ${selected.id}` : undefined}>
        {selected ? (
          <div className="space-y-5">
            <EventStatusBadge status={selected.status} />
            <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-3 text-sm">
              <Row label="Date" value={`${fmtDate(selected.start_date)} at ${selected.time}`} />
              <Row label="Venue" value={selected.location} />
              <Row label="Category" value={selected.category} />
              <Row label="Views" value={fmtNumber(selected.views_count)} />
              <Row label="Created" value={fmtDateTime(selected.created_at)} />
              <Row label="Updated" value={fmtDateTime(selected.updated_at)} />
              <Row label="Description" value={selected.description} />
            </dl>
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Organiser</p>
              {organiser ? (
                <div className="mt-2 space-y-1 text-sm">
                  <p className="font-semibold">{organiser.name} {organiser.suspended ? <Badge tone="danger" className="ml-1">Suspended</Badge> : null}</p>
                  <p className="text-muted-foreground">{organiser.phone}</p>
                  {organiser.email ? <p className="text-muted-foreground">{organiser.email}</p> : null}
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Organiser record not found.</p>
              )}
            </div>
          </div>
        ) : null}
      </Drawer>
    </>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-words font-medium">{value || "—"}</dd>
    </>
  );
}

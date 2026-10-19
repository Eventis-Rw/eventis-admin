"use client";

import { useState } from "react";
import Link from "next/link";
import { Info } from "lucide-react";

import { PAGE_SIZE, Pagination } from "@/components/shared/pagination";
import { StatusBadge } from "@/components/eventis/users-table";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SearchInput, Select } from "@/components/ui/input";
import { Drawer } from "@/components/ui/overlay";
import { EmptyState } from "@/components/ui/states";
import { Table, Td, Th } from "@/components/ui/table";
import { fmtDate, fmtDateTime, fullName } from "@/lib/format";
import type { AdminUser } from "@/types";

export interface OrganiserRow {
  user: AdminUser;
  events: number;
  published: number;
}

export function OrganisersTable({ rows: all, eventsAvailable }: { rows: OrganiserRow[]; eventsAvailable: boolean }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const needle = query.trim().toLowerCase();
  const filtered = all.filter(({ user }) => {
    if (status !== "all" && user.status !== status) return false;
    if (!needle) return true;
    return [user.organizationName, fullName(user), user.phone, user.email].some((value) => value?.toLowerCase().includes(needle));
  });

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const selected = all.find(({ user }) => user.id === selectedId) ?? null;

  return (
    <>
      <div className="mb-4 flex items-start gap-2 rounded-xl bg-info-soft px-4 py-3 text-sm text-primary">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          Organisers are accounts registered as organisers. The API has no verification model or workflow yet, so verification status is not
          shown and cannot be changed. Suspend or reactivate an organiser from <Link href="/eventis/users" className="font-semibold underline">Users</Link>.
        </p>
      </div>

      <Card>
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-[1fr_180px]">
          <SearchInput aria-label="Search organisers" placeholder="Search organisation, contact, phone…" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
          <Select aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
            <option value="all">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Suspended</option>
          </Select>
        </div>

        {rows.length === 0 ? (
          <EmptyState title={all.length === 0 ? "No organisers yet" : "No organisers match your filters"} description={all.length === 0 ? "Accounts registered as organisers will appear here." : "Try a different search or clear the filters."} />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Organisation</Th>
                <Th>Contact</Th>
                <Th>Events</Th>
                <Th>Registered</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ user, events, published }) => (
                <tr key={user.id} className="cursor-pointer hover:bg-muted/60" onClick={() => setSelectedId(user.id)}>
                  <Td>
                    <button type="button" className="flex items-center gap-3 text-left" onClick={(e) => { e.stopPropagation(); setSelectedId(user.id); }}>
                      <Avatar name={user.organizationName ?? fullName(user)} src={user.avatarUrl} />
                      <span className="max-w-[220px] truncate font-semibold">{user.organizationName ?? <span className="text-muted-foreground">No organisation name</span>}</span>
                    </button>
                  </Td>
                  <Td>
                    <span className="block">{fullName(user)}</span>
                    <span className="block text-xs text-muted-foreground">{user.email ?? "No email"}</span>
                  </Td>
                  <Td className="tabular-nums">{eventsAvailable ? `${events} (${published} published)` : "—"}</Td>
                  <Td className="whitespace-nowrap text-muted-foreground">{fmtDate(user.createdAt)}</Td>
                  <Td><StatusBadge status={user.status} /></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        <Pagination page={current} total={filtered.length} onPage={setPage} />
      </Card>

      <Drawer open={selected !== null} onClose={() => setSelectedId(null)} title={selected?.user.organizationName ?? (selected ? fullName(selected.user) : "")} description={selected ? `Account ${selected.user.id}` : undefined}>
        {selected ? (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={selected.user.status} />
              <Badge tone="neutral">Verification not tracked</Badge>
            </div>
            <dl className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-3 text-sm">
              {[
                ["Contact person", fullName(selected.user)],
                ["Phone", selected.user.phone],
                ["Email", selected.user.email],
                ["Location", selected.user.location],
                ["Registered", fmtDateTime(selected.user.createdAt)],
                ["Events", eventsAvailable ? `${selected.events} total, ${selected.published} published` : null],
                ["Description", selected.user.organizationDescription],
              ].map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="break-words font-medium">{value || "—"}</dd>
                </div>
              ))}
            </dl>
            <Link href="/eventis/users" className="inline-block text-sm font-semibold text-primary hover:underline">Manage this account in Users →</Link>
          </div>
        ) : null}
      </Drawer>
    </>
  );
}

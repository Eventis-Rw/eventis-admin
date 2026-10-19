"use client";

import { useState } from "react";

import { PAGE_SIZE, Pagination } from "@/components/shared/pagination";
import { Card } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/states";
import { Table, Td, Th } from "@/components/ui/table";
import { fmtDateTime } from "@/lib/format";
import type { AuditEntry } from "@/types";

export function AuditTable({ entries }: { entries: AuditEntry[] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const needle = query.trim().toLowerCase();
  const filtered = entries.filter((entry) => !needle || [entry.action, entry.target, entry.actorName].some((value) => value.toLowerCase().includes(needle)));
  const current = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <Card>
      <div className="border-b border-border p-4">
        <SearchInput aria-label="Search audit log" placeholder="Search action, target or admin…" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No entries match your search" />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>When</Th>
              <Th>Admin</Th>
              <Th>Action</Th>
              <Th>Target</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((entry) => (
              <tr key={entry.id}>
                <Td className="whitespace-nowrap text-muted-foreground">{fmtDateTime(entry.createdAt)}</Td>
                <Td>{entry.actorName}</Td>
                <Td className="font-semibold">{entry.action}</Td>
                <Td>{entry.target}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Pagination page={current} total={filtered.length} onPage={setPage} />
    </Card>
  );
}

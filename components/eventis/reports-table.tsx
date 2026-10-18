"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, ShieldAlert } from "lucide-react";

import { resolveReportAction } from "@/app/(console)/eventis/moderation/actions";
import { PAGE_SIZE, Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchInput, Select } from "@/components/ui/input";
import { Drawer } from "@/components/ui/overlay";
import { EmptyState } from "@/components/ui/states";
import { Table, Td, Th } from "@/components/ui/table";
import { fmtDateTime } from "@/lib/format";
import type { Report, ReportStatus } from "@/types";

export interface ReportRow extends Report {
  reporterName: string;
}

const STATUS_TONE: Record<ReportStatus, "warning" | "success" | "neutral"> = { open: "warning", resolved: "success", dismissed: "neutral" };

export function ReportsTable({ reports, canManage }: { reports: ReportRow[]; canManage: boolean }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const needle = query.trim().toLowerCase();
  const filtered = reports.filter((report) => {
    if (status !== "all" && report.status !== status) return false;
    if (type !== "all" && report.type !== type) return false;
    if (!needle) return true;
    return [report.targetLabel, report.reason, report.reporterName].some((value) => value.toLowerCase().includes(needle));
  });

  const current = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const selected = reports.find((report) => report.id === selectedId) ?? null;

  function resolve(outcome: "resolved" | "dismissed") {
    if (!selected) return;
    startTransition(async () => setNotice(await resolveReportAction(selected.id, outcome)));
  }

  return (
    <>
      {notice ? (
        <div role="status" className={`mb-4 flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium ${notice.ok ? "bg-success-soft text-success" : "bg-destructive-soft text-destructive"}`}>
          <span className="flex items-center gap-2">
            {notice.ok ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <ShieldAlert className="h-4 w-4" aria-hidden />}
            {notice.message}
          </span>
          <button type="button" className="text-xs underline" onClick={() => setNotice(null)}>Dismiss</button>
        </div>
      ) : null}

      <Card>
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-[1fr_160px_160px]">
          <SearchInput aria-label="Search reports" placeholder="Search target, reason or reporter…" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
          <Select aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </Select>
          <Select aria-label="Filter by type" value={type} onChange={(event) => { setType(event.target.value); setPage(1); }}>
            <option value="all">All types</option>
            <option value="user">User</option>
            <option value="event">Event</option>
            <option value="message">Message</option>
          </Select>
        </div>

        {rows.length === 0 ? (
          <EmptyState title="No reports match your filters" description="Try a different search or clear the filters." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Target</Th>
                <Th>Type</Th>
                <Th>Reason</Th>
                <Th>Reported by</Th>
                <Th>Date</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((report) => (
                <tr key={report.id} className="cursor-pointer hover:bg-muted/60" onClick={() => setSelectedId(report.id)}>
                  <Td className="max-w-[200px] truncate font-semibold">{report.targetLabel}</Td>
                  <Td className="capitalize">{report.type}</Td>
                  <Td>{report.reason}</Td>
                  <Td className="max-w-[160px] truncate">{report.reporterName}</Td>
                  <Td className="whitespace-nowrap text-muted-foreground">{fmtDateTime(report.createdAt)}</Td>
                  <Td><Badge tone={STATUS_TONE[report.status]} dot className="capitalize">{report.status}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        <Pagination page={current} total={filtered.length} onPage={setPage} />
      </Card>

      <Drawer
        open={selected !== null}
        onClose={() => setSelectedId(null)}
        title={selected?.targetLabel ?? ""}
        description={selected ? `Report ${selected.id}` : undefined}
        footer={
          selected && canManage && selected.status === "open" ? (
            <>
              <Button variant="secondary" onClick={() => resolve("dismissed")} disabled={pending}>Dismiss</Button>
              <Button variant="success" onClick={() => resolve("resolved")} loading={pending}>Mark resolved</Button>
            </>
          ) : undefined
        }
      >
        {selected ? (
          <div className="space-y-5">
            <Badge tone={STATUS_TONE[selected.status]} dot className="capitalize">{selected.status}</Badge>
            <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Type</dt>
              <dd className="font-medium capitalize">{selected.type}</dd>
              <dt className="text-muted-foreground">Reason</dt>
              <dd className="font-medium">{selected.reason}</dd>
              <dt className="text-muted-foreground">Details</dt>
              <dd className="font-medium">{selected.details}</dd>
              <dt className="text-muted-foreground">Reported by</dt>
              <dd className="font-medium">{selected.reporterName}</dd>
              <dt className="text-muted-foreground">Date</dt>
              <dd className="font-medium">{fmtDateTime(selected.createdAt)}</dd>
            </dl>
            {selected.type === "message" ? <p className="rounded-xl bg-info-soft px-3 py-2 text-sm text-primary">Message content is not shown to protect user privacy.</p> : null}
          </div>
        ) : null}
      </Drawer>
    </>
  );
}

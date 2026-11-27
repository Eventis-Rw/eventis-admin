"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckCircle2, ShieldAlert } from "lucide-react";

import {
  actionReportAction,
  addReportNoteAction,
} from "@/app/(console)/eventis/chat/actions";
import { PAGE_SIZE, Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchInput, Select } from "@/components/ui/input";
import { Drawer } from "@/components/ui/overlay";
import { EmptyState } from "@/components/ui/states";
import { Table, Td, Th } from "@/components/ui/table";
import { fmtDateTime } from "@/lib/format";
import type { ChatReport, ChatReportStatus } from "@/types";

const STATUS_TONE: Record<ChatReportStatus, "warning" | "success" | "neutral" | "danger"> = {
  OPEN: "warning",
  UNDER_REVIEW: "warning",
  REVIEWED: "neutral",
  ACTIONED: "success",
  DISMISSED: "neutral",
};

export function ChatReportsTable({
  reports,
  canManage,
}: {
  reports: ChatReport[];
  canManage: boolean;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ChatReportStatus>("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const needle = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      reports.filter((report) => {
        if (status !== "all" && report.status !== status) return false;
        if (!needle) return true;
        return [report.targetLabel, report.reason, report.reporterLabel]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      }),
    [reports, status, needle],
  );

  const current = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const selected = reports.find((r) => r.id === selectedId) ?? null;

  function open(id: string) {
    setSelectedId(id);
    setReason("");
    setNote("");
    setNotice(null);
  }

  function decide(outcome: "ACTIONED" | "DISMISSED") {
    if (!selected) return;
    startTransition(async () => {
      setNotice(await actionReportAction(selected.id, outcome, reason));
      setReason("");
    });
  }

  function addNote() {
    if (!selected) return;
    startTransition(async () => {
      setNotice(await addReportNoteAction(selected.id, note));
      setNote("");
    });
  }

  return (
    <>
      {notice ? (
        <div
          role="status"
          className={`mb-4 flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium ${notice.ok ? "bg-success-soft text-success" : "bg-destructive-soft text-destructive"}`}
        >
          <span className="flex items-center gap-2">
            {notice.ok ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <ShieldAlert className="h-4 w-4" aria-hidden />}
            {notice.message}
          </span>
          <button type="button" className="text-xs underline" onClick={() => setNotice(null)}>
            Dismiss
          </button>
        </div>
      ) : null}

      <Card>
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-[1fr_180px]">
          <SearchInput
            aria-label="Search reports"
            placeholder="Search target, reason or reporter…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
          <Select
            aria-label="Filter by status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as "all" | ChatReportStatus);
              setPage(1);
            }}
          >
            <option value="all">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="UNDER_REVIEW">Under review</option>
            <option value="ACTIONED">Actioned</option>
            <option value="DISMISSED">Dismissed</option>
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
                <Th>Category</Th>
                <Th>Reported by</Th>
                <Th>Date</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((report) => (
                <tr key={report.id} className="cursor-pointer hover:bg-muted/60" onClick={() => open(report.id)}>
                  <Td className="max-w-[200px] truncate font-semibold">{report.targetLabel}</Td>
                  <Td className="capitalize">{report.type}</Td>
                  <Td>{report.category?.toLowerCase().replace("_", " ") ?? "—"}</Td>
                  <Td className="max-w-[160px] truncate">{report.reporterLabel}</Td>
                  <Td className="whitespace-nowrap text-muted-foreground">{fmtDateTime(report.createdAt)}</Td>
                  <Td>
                    <Badge tone={STATUS_TONE[report.status]} dot className="capitalize">
                      {report.status.toLowerCase().replace("_", " ")}
                    </Badge>
                  </Td>
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
      >
        {selected ? (
          <div className="space-y-5">
            <Badge tone={STATUS_TONE[selected.status]} dot className="capitalize">
              {selected.status.toLowerCase().replace("_", " ")}
            </Badge>
            <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Type</dt>
              <dd className="font-medium capitalize">{selected.type}</dd>
              <dt className="text-muted-foreground">Category</dt>
              <dd className="font-medium">{selected.category?.toLowerCase().replace("_", " ") ?? "—"}</dd>
              <dt className="text-muted-foreground">Reason</dt>
              <dd className="font-medium">{selected.reason}</dd>
              <dt className="text-muted-foreground">Details</dt>
              <dd className="font-medium">{selected.details || "—"}</dd>
              <dt className="text-muted-foreground">Reported by</dt>
              <dd className="font-medium">{selected.reporterLabel}</dd>
              <dt className="text-muted-foreground">Date</dt>
              <dd className="font-medium">{fmtDateTime(selected.createdAt)}</dd>
            </dl>
            {selected.type === "message" ? (
              <p className="rounded-xl bg-info-soft px-3 py-2 text-sm text-primary">
                Message content is not shown to protect user privacy.
              </p>
            ) : null}
            {selected.moderatorNotes ? (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Moderator notes</p>
                <p className="whitespace-pre-wrap rounded-xl border border-border bg-surface p-3 text-sm">
                  {selected.moderatorNotes}
                </p>
              </div>
            ) : null}

            {canManage && selected.status !== "ACTIONED" && selected.status !== "DISMISSED" ? (
              <div className="space-y-3 rounded-xl border border-dashed border-border p-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="chat-report-note">
                    Add a note
                  </label>
                  <textarea
                    id="chat-report-note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={2}
                    placeholder="Internal note for other moderators…"
                    className="mt-1 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring"
                  />
                  <Button variant="secondary" size="sm" className="mt-1.5" onClick={addNote} disabled={pending || !note.trim()}>
                    Save note
                  </Button>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="chat-report-reason">
                    Decision reason (required)
                  </label>
                  <textarea
                    id="chat-report-reason"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    rows={2}
                    placeholder="Explain the decision…"
                    className="mt-1 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring"
                  />
                  <div className="mt-1.5 flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => decide("DISMISSED")} disabled={pending || !reason.trim()}>
                      Dismiss
                    </Button>
                    <Button variant="success" size="sm" onClick={() => decide("ACTIONED")} disabled={pending || !reason.trim()}>
                      Mark actioned
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </Drawer>
    </>
  );
}

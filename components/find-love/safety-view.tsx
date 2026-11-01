"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/overlay";
import { Table, Td, Th } from "@/components/ui/table";
import { resolveSafetyReportAction } from "@/lib/find-love/actions";
import type { ReportStatus, SafetyReport } from "@/lib/find-love/types";

interface SafetyViewProps {
  reports: SafetyReport[];
}

export function SafetyView({ reports: initialReports }: SafetyViewProps) {
  const [reports, setReports] = useState<SafetyReport[]>(initialReports);
  const [selectedReport, setSelectedReport] = useState<SafetyReport | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");
  const [search, setSearch] = useState("");

  // Action Dialog state
  const [actionTaken, setActionTaken] = useState("Temporary warning issued and profile flagged");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [suspendUser, setSuspendUser] = useState(false);
  const [isPending, startTransition] = useTransition();

  const openCases = reports.filter((r) => r.status === "open").length;
  const investigating = reports.filter((r) => r.status === "investigating").length;
  const highSeverity = reports.filter((r) => r.severity === "high" || r.severity === "critical").length;
  const resolved = reports.filter((r) => r.status === "resolved").length;

  const filtered = reports.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const match =
        r.caseNumber.toLowerCase().includes(q) ||
        r.reportingUserName.toLowerCase().includes(q) ||
        r.reportedUserName.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.details.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("reportId", selectedReport.id);
      formData.set("actionTaken", actionTaken);
      formData.set("resolutionNotes", resolutionNotes || "Investigation concluded");
      formData.set("suspendUser", suspendUser ? "true" : "false");
      formData.set("actor", "Moderator Grace");

      const res = await resolveSafetyReportAction(formData);
      if (res.success) {
        setReports((prev) =>
          prev.map((r) =>
            r.id === selectedReport.id
              ? {
                  ...r,
                  status: "resolved",
                  actionTaken,
                  resolutionNotes,
                  updatedAt: new Date().toISOString(),
                }
              : r,
          ),
        );
        setSelectedReport(null);
        setResolutionNotes("");
        setSuspendUser(false);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Metrics Bar */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Open Safety Reports</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-destructive">{openCases}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Requires investigator triage</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Under Investigation</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-warning">{investigating}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Active safety review</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">High Severity Cases</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-destructive">{highSeverity}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Threats / Financial scams</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Resolved (30 Days)</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-success">{resolved}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Closed with action recorded</p>
        </Card>
      </section>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search case number (FL-R-208), member, or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-input pl-9 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReportStatus | "all")}
              className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">All Case Statuses</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader
          title="Safety Complaints & Moderation Reports"
          description="Investigate community flags, harassment reports, and fraudulent profile activity"
        />
        <Table>
          <thead>
            <tr>
              <Th>Case ID</Th>
              <Th>Reported Member</Th>
              <Th>Category</Th>
              <Th>Reporting Member</Th>
              <Th>Severity</Th>
              <Th>Status</Th>
              <Th>Filed Date</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                <Td className="font-mono text-xs font-semibold">{r.caseNumber}</Td>
                <Td>
                  <Link href={`/find-love/users/${r.reportedUserId}`} className="font-semibold text-foreground hover:text-primary">
                    {r.reportedUserName}
                  </Link>
                  <span className="block font-mono text-[10px] text-muted-foreground">{r.reportedUserId}</span>
                </Td>
                <Td>
                  <span className="font-medium text-xs capitalize text-foreground">{r.category.replace("_", " ")}</span>
                  <p className="max-w-xs truncate text-[11px] text-muted-foreground">{r.details}</p>
                </Td>
                <Td>
                  <Link href={`/find-love/users/${r.reportingUserId}`} className="text-xs font-medium text-foreground hover:text-primary">
                    {r.reportingUserName}
                  </Link>
                </Td>
                <Td>
                  <Badge
                    tone={
                      r.severity === "critical" || r.severity === "high"
                        ? "danger"
                        : r.severity === "medium"
                        ? "warning"
                        : "neutral"
                    }
                  >
                    {r.severity}
                  </Badge>
                </Td>
                <Td>
                  <Badge
                    tone={
                      r.status === "open"
                        ? "danger"
                        : r.status === "investigating"
                        ? "warning"
                        : "success"
                    }
                    dot
                  >
                    {r.status}
                  </Badge>
                </Td>
                <Td className="text-xs text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                </Td>
                <Td className="text-right">
                  <Button
                    variant={r.status === "resolved" ? "secondary" : "destructive"}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      setSelectedReport(r);
                      setActionTaken(r.actionTaken || "Formal warning issued and account placed under review");
                    }}
                  >
                    {r.status === "resolved" ? "Review Case" : "Take Action"}
                  </Button>
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <Td colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                  No reports matching current filter.
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

      {/* Moderation Action Modal */}
      {selectedReport && (
        <Dialog
          open={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={`Moderation Investigation: ${selectedReport.caseNumber}`}
          description={`Reported: ${selectedReport.reportedUserName} (${selectedReport.reportedUserId}) by ${selectedReport.reportingUserName}`}
        >
          <form onSubmit={handleResolveSubmit} className="space-y-4 pt-2">
            <div className="rounded-xl border border-border bg-surface p-3.5 text-xs space-y-1.5">
              <p><strong>Category:</strong> <span className="capitalize">{selectedReport.category.replace("_", " ")}</span></p>
              <p><strong>Severity:</strong> <span className="capitalize">{selectedReport.severity}</span></p>
              <p><strong>Reported Date:</strong> {new Date(selectedReport.createdAt).toLocaleString()}</p>
              <div className="mt-2 border-t border-border pt-2">
                <span className="font-semibold text-foreground">Complaint Details:</span>
                <p className="mt-1 text-muted-foreground leading-relaxed">&ldquo;{selectedReport.details}&rdquo;</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">Moderation Action</label>
              <select
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="Temporary warning issued and profile placed on watch">Temporary warning issued</option>
                <option value="Inappropriate content removed and warning issued">Remove reported content</option>
                <option value="Account temporarily suspended for policy violation">Suspend account temporarily</option>
                <option value="Account permanently banned for malicious conduct">Permanently ban account</option>
                <option value="Dismissed as unsubstantiated / false report">Dismiss report (Unsubstantiated)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-border p-3">
              <input
                type="checkbox"
                id="suspendUserCheck"
                checked={suspendUser}
                onChange={(e) => setSuspendUser(e.target.checked)}
                className="h-4 w-4 rounded text-primary focus:ring-primary"
              />
              <label htmlFor="suspendUserCheck" className="text-xs font-semibold text-foreground cursor-pointer">
                Immediately suspend user {selectedReport.reportedUserName} in user ledger
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">
                Investigation Resolution Notes (Mandatory for Audit Trail)
              </label>
              <textarea
                required
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Document your findings, evidence reviewed, and justification for this action..."
                className="mt-1 w-full rounded-xl border border-border bg-input p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="secondary" onClick={() => setSelectedReport(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isPending}>
                Execute Decision
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}

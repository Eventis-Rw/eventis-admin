"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Eye,
  Lock,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/overlay";
import { Table, Td, Th } from "@/components/ui/table";
import { reviewVerificationAction } from "@/lib/find-love/actions";
import type { FindLoveUser, VerificationDocument, VerificationStatus } from "@/lib/find-love/types";

interface VerificationViewProps {
  documents: VerificationDocument[];
  users: FindLoveUser[];
}

export function VerificationView({ documents, users }: VerificationViewProps) {
  const [filter, setFilter] = useState<VerificationStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<VerificationDocument | null>(null);
  const [decision, setDecision] = useState<"verified" | "rejected" | "resubmission_required">("verified");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const userMap = new Map(users.map((u) => [u.id, u]));

  const filteredDocs = documents.filter((doc) => {
    if (filter !== "all" && doc.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const u = userMap.get(doc.userId);
      const match =
        doc.id.toLowerCase().includes(q) ||
        doc.userId.toLowerCase().includes(q) ||
        u?.displayName.toLowerCase().includes(q) ||
        u?.username.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const pendingCount = documents.filter((d) => d.status === "pending").length;
  const verifiedCount = documents.filter((d) => d.status === "verified").length;
  const rejectedCount = documents.filter((d) => d.status === "rejected").length;

  const handleDecisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("docId", selectedDoc.id);
      formData.set("status", decision);
      formData.set("notes", notes || "Administrative review");
      formData.set("reviewer", "Reviewer One");
      await reviewVerificationAction(formData);
      setSelectedDoc(null);
      setNotes("");
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Pending Review Queue</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-warning">{pendingCount}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Requires reviewer attention</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Verified Members</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-success">{verifiedCount}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Passed official verification</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Rejected Submissions</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-destructive">{rejectedCount}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Fraud or ineligible documents</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Average Review Time</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">3.2 hrs</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Within SLA target of 6h</p>
        </Card>
      </section>

      {/* Security alert banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary-soft p-4 text-xs text-foreground">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <p className="font-semibold text-primary">Restricted Identity Document Protocol</p>
          National IDs, passports, and identification photos are protected with short-lived signed URLs. Unrestricted access is prevented and every document opening is permanently recorded in the system audit log.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by member name, username, or User ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-input pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as VerificationStatus | "all")}
              className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">All Submissions</option>
              <option value="pending">Pending Review</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="resubmission_required">Resubmission Required</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Queue Table */}
      <Card>
        <CardHeader
          title="Identity Verification Queue"
          description="Review government identity documents and confirm member profiles"
        />
        <Table>
          <thead>
            <tr>
              <Th>Member</Th>
              <Th>Document Type</Th>
              <Th>Masked Doc Number</Th>
              <Th>Submitted</Th>
              <Th>Reviewer</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.map((doc) => {
              const u = userMap.get(doc.userId);
              return (
                <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                  <Td>
                    <Link href={`/find-love/users/${doc.userId}`} className="font-semibold text-foreground hover:text-primary">
                      {u?.displayName ?? doc.userId}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      @{u?.username ?? "unknown"} · <span className="font-mono text-[11px]">{doc.userId}</span>
                    </p>
                  </Td>
                  <Td>
                    <Badge tone="info">
                      {doc.documentType === "national_id" ? "National ID Card" : "Passport Identity Page"}
                    </Badge>
                  </Td>
                  <Td className="font-mono text-xs">{doc.documentNumberMasked}</Td>
                  <Td className="text-xs text-muted-foreground">
                    {new Date(doc.submittedAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </Td>
                  <Td className="text-xs font-medium text-foreground">{doc.reviewerName || "Unassigned"}</Td>
                  <Td>
                    <Badge
                      tone={
                        doc.status === "verified"
                          ? "success"
                          : doc.status === "pending"
                          ? "warning"
                          : "danger"
                      }
                      dot
                    >
                      {doc.status}
                    </Badge>
                  </Td>
                  <Td className="text-right">
                    <Button
                      variant={doc.status === "pending" ? "primary" : "secondary"}
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => {
                        setSelectedDoc(doc);
                        setDecision(doc.status === "rejected" || doc.status === "resubmission_required" ? doc.status : "verified");
                        setNotes(doc.notes || "");
                      }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {doc.status === "pending" ? "Review" : "View Details"}
                    </Button>
                  </Td>
                </tr>
              );
            })}
            {filteredDocs.length === 0 && (
              <tr>
                <Td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  No verification documents match the filter.
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

      {/* Review Dialog Modal */}
      {selectedDoc && (
        <Dialog
          open={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          title="Audited Identity Document Review"
          description={`Member: ${userMap.get(selectedDoc.userId)?.displayName ?? selectedDoc.userId} (${selectedDoc.userId})`}
        >
          <div className="space-y-4 pt-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">Document Front</span>
                <div className="relative aspect-[16/10] w-full rounded-xl border border-border bg-slate-900 overflow-hidden">
                  <Image src={selectedDoc.frontUrl} alt="Front Document" fill className="object-contain" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">Document Back</span>
                <div className="relative aspect-[16/10] w-full rounded-xl border border-border bg-slate-900 overflow-hidden">
                  {selectedDoc.backUrl ? (
                    <Image src={selectedDoc.backUrl} alt="Back Document" fill className="object-contain" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No back image required
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-3 text-xs">
              <p><strong>Document Type:</strong> {selectedDoc.documentType === "national_id" ? "National ID" : "Passport"}</p>
              <p className="mt-1"><strong>Document Number:</strong> <span className="font-mono">{selectedDoc.documentNumberMasked}</span></p>
              <p className="mt-1"><strong>Submitted:</strong> {new Date(selectedDoc.submittedAt).toLocaleString()}</p>
            </div>

            <form onSubmit={handleDecisionSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground">Decision</label>
                <select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value as "verified" | "rejected" | "resubmission_required")}
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="verified">Approve (Mark as Verified Member)</option>
                  <option value="rejected">Reject (Fake / Altered / Ineligible Document)</option>
                  <option value="resubmission_required">Request Resubmission (Blurry / Cut-off document)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground">Review Notes & Audit Reason</label>
                <textarea
                  required
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record outcome verification notes for the audit trail..."
                  className="mt-1 w-full rounded-xl border border-border bg-input p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button variant="secondary" onClick={() => setSelectedDoc(null)}>
                  Close
                </Button>
                <Button type="submit" variant="primary" loading={isPending}>
                  Submit Decision
                </Button>
              </div>
            </form>
          </div>
        </Dialog>
      )}
    </div>
  );
}

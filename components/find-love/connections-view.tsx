"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/overlay";
import { Table, Td, Th } from "@/components/ui/table";
import type { ConnectionRequest, ConnectionStatus } from "@/lib/find-love/types";

export function ConnectionsView({ initialConnections }: { initialConnections: ConnectionRequest[] }) {
  const [connections] = useState<ConnectionRequest[]>(initialConnections);
  const [filter, setFilter] = useState<ConnectionStatus | "reported" | "all">("all");
  const [search, setSearch] = useState("");
  const [investigatingConn, setInvestigatingConn] = useState<ConnectionRequest | null>(null);

  const filtered = connections.filter((conn) => {
    if (filter === "reported" && !conn.reported) return false;
    if (filter !== "all" && filter !== "reported" && conn.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const match =
        conn.id.toLowerCase().includes(q) ||
        conn.senderName.toLowerCase().includes(q) ||
        conn.recipientName.toLowerCase().includes(q) ||
        conn.senderId.toLowerCase().includes(q) ||
        conn.recipientId.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const acceptedCount = connections.filter((c) => c.status === "accepted").length;
  const pendingCount = connections.filter((c) => c.status === "pending").length;
  const reportedCount = connections.filter((c) => c.reported).length;
  const blockedCount = connections.filter((c) => c.status === "blocked").length;

  return (
    <div className="space-y-6">
      {/* Metrics Bar */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Accepted Matches</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-success">{acceptedCount}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Mutual connections</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Pending Requests</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-warning">{pendingCount}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Awaiting recipient decision</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Blocked Connections</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{blockedCount}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">User blocked counterpart</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Reported Connections</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-destructive">{reportedCount}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Flagged for safety review</p>
        </Card>
      </section>

      {/* Dating Privacy & Integrity Rule */}
      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary-soft p-4 text-xs leading-relaxed text-foreground">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <p className="font-semibold text-primary">Connection Integrity Rule</p>
          Administrators can investigate reported interactions and resolve technical connection issues. In accordance with dating platform standards, administrators cannot accept or reject romantic connections on behalf of members. Connection acceptance must reflect the authentic choice of the user.
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by Request ID, Sender, or Recipient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-input pl-9 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as ConnectionStatus | "reported" | "all")}
              className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">All Requests</option>
              <option value="accepted">Accepted Matches</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="blocked">Blocked</option>
              <option value="reported">Reported Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Connections Table */}
      <Card>
        <CardHeader
          title="Connection Requests"
          description="Live relationship matching requests and safety flags"
        />
        <Table>
          <thead>
            <tr>
              <Th>Request ID</Th>
              <Th>Sender</Th>
              <Th>Recipient</Th>
              <Th>Requested Date</Th>
              <Th>Status</Th>
              <Th>Safety Flag</Th>
              <Th>Last Updated</Th>
              <Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((conn) => (
              <tr key={conn.id} className="hover:bg-muted/30 transition-colors">
                <Td className="font-mono text-xs font-semibold">{conn.id}</Td>
                <Td>
                  <Link href={`/find-love/users/${conn.senderId}`} className="font-semibold text-foreground hover:text-primary">
                    {conn.senderName}
                  </Link>
                  <span className="block font-mono text-[10px] text-muted-foreground">{conn.senderId}</span>
                </Td>
                <Td>
                  <Link href={`/find-love/users/${conn.recipientId}`} className="font-semibold text-foreground hover:text-primary">
                    {conn.recipientName}
                  </Link>
                  <span className="block font-mono text-[10px] text-muted-foreground">{conn.recipientId}</span>
                </Td>
                <Td className="text-xs text-muted-foreground">
                  {new Date(conn.requestedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                </Td>
                <Td>
                  <Badge
                    tone={
                      conn.status === "accepted"
                        ? "success"
                        : conn.status === "pending"
                        ? "warning"
                        : conn.status === "blocked"
                        ? "danger"
                        : "neutral"
                    }
                    dot
                  >
                    {conn.status}
                  </Badge>
                </Td>
                <Td>
                  {conn.reported ? (
                    <Badge tone="danger">Reported: {conn.reportReason}</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">None</span>
                  )}
                </Td>
                <Td className="text-xs text-muted-foreground">
                  {new Date(conn.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                </Td>
                <Td className="text-right">
                  {conn.reported ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setInvestigatingConn(conn)}
                    >
                      Investigate Report
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setInvestigatingConn(conn)}
                    >
                      Details
                    </Button>
                  )}
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <Td colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                  No connection records found.
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

      {/* Investigation Details Dialog */}
      {investigatingConn && (
        <Dialog
          open={!!investigatingConn}
          onClose={() => setInvestigatingConn(null)}
          title={`Connection Request ${investigatingConn.id}`}
          description={`Between ${investigatingConn.senderName} and ${investigatingConn.recipientName}`}
        >
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-border bg-surface p-3">
                <span className="text-muted-foreground font-medium">Sender:</span>
                <p className="mt-1 font-bold text-foreground">{investigatingConn.senderName}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{investigatingConn.senderId}</p>
                <Link href={`/find-love/users/${investigatingConn.senderId}`} className="mt-2 inline-block text-primary font-semibold">
                  Open Sender Profile →
                </Link>
              </div>

              <div className="rounded-xl border border-border bg-surface p-3">
                <span className="text-muted-foreground font-medium">Recipient:</span>
                <p className="mt-1 font-bold text-foreground">{investigatingConn.recipientName}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{investigatingConn.recipientId}</p>
                <Link href={`/find-love/users/${investigatingConn.recipientId}`} className="mt-2 inline-block text-primary font-semibold">
                  Open Recipient Profile →
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-3 text-xs space-y-1.5">
              <p><strong>Status:</strong> <span className="capitalize">{investigatingConn.status}</span></p>
              <p><strong>Initiated:</strong> {new Date(investigatingConn.requestedAt).toLocaleString()}</p>
              <p><strong>Last Updated:</strong> {new Date(investigatingConn.updatedAt).toLocaleString()}</p>
              {investigatingConn.reported ? (
                <div className="mt-2 rounded-lg bg-destructive-soft p-2.5 text-destructive">
                  <strong>Report Details:</strong> {investigatingConn.reportReason}
                </div>
              ) : null}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="secondary" onClick={() => setInvestigatingConn(null)}>
                Close
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

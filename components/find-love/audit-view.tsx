"use client";

import { useState } from "react";
import {
  ScrollText,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import type { AuditLogEntry } from "@/lib/find-love/types";

export function AuditView({ logs: initialLogs }: { logs: AuditLogEntry[] }) {
  const [logs] = useState<AuditLogEntry[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const filtered = logs.filter((log) => {
    if (actionFilter !== "all" && log.action !== actionFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const match =
        log.actorName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.targetId.toLowerCase().includes(q) ||
        log.details?.toLowerCase().includes(q) ||
        log.reason?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const actions = Array.from(new Set(logs.map((l) => l.action)));

  return (
    <div className="space-y-6">
      {/* Immutability Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary-soft p-4 text-xs leading-relaxed text-foreground">
        <ScrollText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <p className="font-semibold text-primary">Tamper-Evident Append-Only Audit Trail</p>
          Every sensitive action performed on the FindLove administration dashboard—including viewing confidential identity documents, approving verifications, altering subscription pricing, refunding payments, and suspending user accounts—is immutably recorded with actor identity, timestamp, and justification.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search audit trail by administrator, target ID (FL-001245), or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-input pl-9 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">All Actions</option>
              {actions.map((act) => (
                <option key={act} value={act}>
                  {act.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">System Audit Records</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Showing {filtered.length} audited administrative events</p>
          </div>
          <Badge tone="neutral">{logs.length} total events</Badge>
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Timestamp</Th>
              <Th>Administrator</Th>
              <Th>Action</Th>
              <Th>Resource Target</Th>
              <Th>Operation Details</Th>
              <Th>Documented Reason</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                <Td className="font-mono text-xs text-muted-foreground tabular-nums">
                  {new Date(log.timestamp).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </Td>
                <Td className="font-semibold text-foreground text-xs">{log.actorName}</Td>
                <Td>
                  <Badge
                    tone={
                      log.action.includes("SUSPEND") || log.action.includes("BAN")
                        ? "danger"
                        : log.action.includes("PRICING") || log.action.includes("PAYMENT")
                        ? "warning"
                        : log.action.includes("APPROVE")
                        ? "success"
                        : "info"
                    }
                  >
                    {log.action.replace(/_/g, " ")}
                  </Badge>
                </Td>
                <Td className="font-mono text-xs">
                  <span className="font-semibold text-foreground">{log.targetId}</span>
                  <span className="block text-[10px] text-muted-foreground">{log.targetType}</span>
                </Td>
                <Td className="text-xs text-foreground max-w-sm">{log.details}</Td>
                <Td className="text-xs text-muted-foreground max-w-xs truncate">{log.reason || "—"}</Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <Td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  No audit log entries found matching criteria.
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

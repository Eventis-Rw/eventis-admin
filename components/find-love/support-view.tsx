"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Search, Send, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Drawer } from "@/components/ui/overlay";
import { Table, Td, Th } from "@/components/ui/table";
import { updateSupportTicketAction } from "@/lib/find-love/actions";
import type {
  SupportTicket,
  TicketPriority,
  TicketStatus,
} from "@/lib/find-love/types";

interface SupportViewProps {
  tickets: SupportTicket[];
  live?: boolean;
}

export function SupportView({
  tickets: initialTickets,
  live,
}: SupportViewProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">(
    "all",
  );
  const [search, setSearch] = useState("");

  const [error, setError] = useState("");
  // Drawer reply & note state
  const [replyText, setReplyText] = useState("");
  const [noteText, setNoteText] = useState("");
  const [isPending, startTransition] = useTransition();

  const openTickets = tickets.filter((t) => t.status === "open").length;
  const inProgress = tickets.filter((t) => t.status === "in_progress").length;
  const highPriority = tickets.filter(
    (t) => t.priority === "high" || t.priority === "urgent",
  ).length;

  const filtered = tickets.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const match =
        t.ticketNumber.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.userName.toLowerCase().includes(q) ||
        t.userId.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("ticketId", selectedTicket.id);
      formData.set("replyContent", replyText);
      formData.set("actor", "Support Agent");

      const res = await updateSupportTicketAction(formData);
      if (!res.success) {
        setError(res.error ?? "Could not update ticket");
        return;
      }
      setError("");
      if (res.success) {
        const newMsg = {
          id: `msg_${Date.now()}`,
          senderName: "Support Agent",
          isStaff: true,
          content: replyText,
          timestamp: new Date().toISOString(),
        };
        const updated = ("ticket" in res ? res.ticket : undefined) ?? {
          ...selectedTicket,
          messages: [...selectedTicket.messages, newMsg],
        };
        setSelectedTicket(updated);
        setTickets((prev) =>
          prev.map((t) => (t.id === selectedTicket.id ? updated : t)),
        );
        setReplyText("");
      }
    });
  };

  const handleAddInternalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !noteText.trim()) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("ticketId", selectedTicket.id);
      formData.set("internalNote", noteText);
      formData.set("actor", "Admin Tester");

      const res = await updateSupportTicketAction(formData);
      if (!res.success) {
        setError(res.error ?? "Could not update ticket");
        return;
      }
      setError("");
      if (res.success) {
        const newNote = {
          id: `note_${Date.now()}`,
          authorName: "Admin Tester",
          note: noteText,
          timestamp: new Date().toISOString(),
        };
        const updated = ("ticket" in res ? res.ticket : undefined) ?? {
          ...selectedTicket,
          internalNotes: [...selectedTicket.internalNotes, newNote],
        };
        setSelectedTicket(updated);
        setTickets((prev) =>
          prev.map((t) => (t.id === selectedTicket.id ? updated : t)),
        );
        setNoteText("");
      }
    });
  };

  const handleUpdateStatus = (newStatus: TicketStatus) => {
    if (!selectedTicket) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("ticketId", selectedTicket.id);
      formData.set("status", newStatus);
      const res = await updateSupportTicketAction(formData);
      if (!res.success) {
        setError(res.error ?? "Could not update ticket");
        return;
      }
      setError("");
      const updated = ("ticket" in res ? res.ticket : undefined) ?? {
        ...selectedTicket,
        status: newStatus,
      };
      setSelectedTicket(updated);
      setTickets((prev) =>
        prev.map((t) => (t.id === selectedTicket.id ? updated : t)),
      );
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {/* Top Stat Bar */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Open Tickets
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-warning">
            {openTickets}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Awaiting agent response
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">
            In Progress
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {inProgress}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Assigned & actively handled
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">
            High Priority Escalations
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-destructive">
            {highPriority}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Safety / Payment disputes
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Avg. First Response Time
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {live ? "N/A" : "14 min"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {live
              ? "Response metrics are not yet collected"
              : "SLA target is under 30m"}
          </p>
        </Card>
      </section>

      {/* Privacy Notice Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary-soft p-4 text-xs text-foreground">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <p className="font-semibold text-primary">
            Separation of Customer Support and Private Dating Messages
          </p>
          Customer support tickets are strictly separate from user-to-user
          dating chats. Administrators cannot browse private dating messages on
          general dashboard screens. Access to message content is strictly
          limited to authorized safety investigations with an immutable audit
          log.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by ticket ID (FL-1024), subject, or username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-input pl-9 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as TicketStatus | "all")
              }
              className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">Status: All</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value as TicketPriority | "all")
              }
              className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">Priority: All</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader
          title="Customer Support Inbox"
          description="Support requests, payment questions, and identity verification inquiries"
        />
        <Table>
          <thead>
            <tr>
              <Th>Ticket Ref</Th>
              <Th>Subject</Th>
              <Th>Member</Th>
              <Th>Category</Th>
              <Th>Assigned To</Th>
              <Th>Priority</Th>
              <Th>Status</Th>
              <Th>Created</Th>
              <Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                <Td className="font-mono text-xs font-semibold">
                  {t.ticketNumber}
                </Td>
                <Td className="font-medium text-foreground max-w-xs truncate">
                  {t.subject}
                </Td>
                <Td>
                  <Link
                    href={`/find-love/users/${t.userId}`}
                    className="font-semibold text-foreground hover:text-primary"
                  >
                    {t.userName}
                  </Link>
                  <span className="block font-mono text-[10px] text-muted-foreground">
                    {t.userId}
                  </span>
                </Td>
                <Td className="text-xs text-muted-foreground capitalize">
                  {t.category.replace("_", " ")}
                </Td>
                <Td className="text-xs font-medium text-foreground">
                  {t.assignedTo || "Unassigned"}
                </Td>
                <Td>
                  <Badge
                    tone={
                      t.priority === "urgent" || t.priority === "high"
                        ? "danger"
                        : t.priority === "normal"
                          ? "neutral"
                          : "info"
                    }
                  >
                    {t.priority}
                  </Badge>
                </Td>
                <Td>
                  <Badge
                    tone={
                      t.status === "open"
                        ? "warning"
                        : t.status === "in_progress"
                          ? "info"
                          : t.status === "resolved"
                            ? "success"
                            : "neutral"
                    }
                    dot
                  >
                    {t.status.replace("_", " ")}
                  </Badge>
                </Td>
                <Td className="text-xs text-muted-foreground">
                  {new Date(t.createdAt).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  })}
                </Td>
                <Td className="text-right">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setSelectedTicket(t)}
                  >
                    Open Ticket
                  </Button>
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <Td
                  colSpan={9}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No support tickets match the selected filters.
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

      {/* Ticket Conversation Drawer */}
      {selectedTicket && (
        <Drawer
          open={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket ${selectedTicket.ticketNumber} — ${selectedTicket.subject}`}
          description={`From ${selectedTicket.userName} (${selectedTicket.userId}) · Category: ${selectedTicket.category.replace("_", " ")}`}
        >
          <div className="space-y-6 pt-2 pb-6">
            {/* Status & Priority Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Status:</span>
                <Badge
                  tone={
                    selectedTicket.status === "resolved" ? "success" : "warning"
                  }
                  dot
                >
                  {selectedTicket.status.replace("_", " ")}
                </Badge>
              </div>

              <div className="flex items-center gap-1.5">
                {selectedTicket.status !== "resolved" ? (
                  <Button
                    variant="success"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleUpdateStatus("resolved")}
                  >
                    <CheckCircle2 className="h-3 w-3" /> Mark Resolved
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleUpdateStatus("in_progress")}
                  >
                    Reopen
                  </Button>
                )}
              </div>
            </div>

            {/* Message Thread */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Support Conversation Thread
              </h3>
              <div className="space-y-3">
                {selectedTicket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.isStaff
                        ? "border border-primary/20 bg-primary-soft/40 ml-4"
                        : "border border-border bg-card mr-4 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between pb-1 text-[11px] font-semibold text-muted-foreground">
                      <span
                        className={
                          msg.isStaff
                            ? "text-primary font-bold"
                            : "text-foreground"
                        }
                      >
                        {msg.senderName} {msg.isStaff ? "(Staff)" : ""}
                      </span>
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-foreground">
                      {msg.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="mt-3 space-y-2">
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type official reply to the member..."
                  className="w-full rounded-xl border border-border bg-input p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={isPending}
                    disabled={!replyText.trim()}
                  >
                    <Send className="h-3.5 w-3.5" /> Send Reply
                  </Button>
                </div>
              </form>
            </div>

            {/* Internal Staff Notes (Private) */}
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span>Internal Staff Notes (Invisible to Member)</span>
              </div>

              <div className="space-y-2">
                {selectedTicket.internalNotes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-xl border border-warning/30 bg-warning-soft/30 p-3 text-xs"
                  >
                    <div className="flex items-center justify-between font-semibold text-foreground">
                      <span>{note.authorName}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {new Date(note.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="mt-1 text-foreground leading-relaxed">
                      {note.note}
                    </p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddInternalNote} className="space-y-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add confidential internal note..."
                  className="h-9 w-full rounded-xl border border-border bg-input px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    loading={isPending}
                    disabled={!noteText.trim()}
                  >
                    Add Note
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
}

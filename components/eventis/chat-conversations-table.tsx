"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckCircle2, ShieldAlert } from "lucide-react";

import {
  removeMemberAction,
  setConversationStatusAction,
  transferOwnershipAction,
} from "@/app/(console)/eventis/chat/actions";
import { PAGE_SIZE, Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchInput, Select } from "@/components/ui/input";
import { Drawer } from "@/components/ui/overlay";
import { EmptyState } from "@/components/ui/states";
import { Table, Td, Th } from "@/components/ui/table";
import { fmtDateTime, fullName } from "@/lib/format";
import type {
  ChatConversationStatus,
  ChatConversationSummary,
  ChatConversationType,
} from "@/types";

const STATUS_TONE: Record<ChatConversationStatus, "success" | "danger" | "neutral"> = {
  ACTIVE: "success",
  SUSPENDED: "danger",
  DELETED: "neutral",
};

function memberLabel(conversation: ChatConversationSummary) {
  const owner = conversation.participants.find((p) => p.role === "OWNER");
  return owner?.profile
    ? fullName({ ...owner.profile, phone: "" })
    : "Unknown";
}

function activeMembers(conversation: ChatConversationSummary) {
  return conversation.participants.filter((p) => p.status === "ACTIVE");
}

export function ChatConversationsTable({
  conversations,
  canManage,
  canSuspend,
  canDelete,
  canManageMembers,
}: {
  conversations: ChatConversationSummary[];
  canManage: boolean;
  canSuspend: boolean;
  canDelete: boolean;
  canManageMembers: boolean;
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | ChatConversationType>("all");
  const [status, setStatus] = useState<"all" | ChatConversationStatus>("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const needle = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      conversations.filter((conversation) => {
        if (type !== "all" && conversation.type !== type) return false;
        if (status !== "all" && conversation.status !== status) return false;
        if (!needle) return true;
        const haystack = [
          conversation.title ?? "",
          conversation.description ?? "",
          ...conversation.participants.map((p) => p.profile?.displayName ?? ""),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(needle);
      }),
    [conversations, type, status, needle],
  );

  const current = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  function openDetail(id: string) {
    setSelectedId(id);
    setReason("");
    setNotice(null);
  }

  function setStatusFor(next: ChatConversationStatus) {
    if (!selected) return;
    startTransition(async () => {
      setNotice(await setConversationStatusAction(selected.id, next, reason));
      setReason("");
    });
  }

  function removeMember(userId: string) {
    if (!selected) return;
    startTransition(async () => {
      setNotice(await removeMemberAction(selected.id, userId, reason));
      setReason("");
    });
  }

  function transferTo(userId: string) {
    if (!selected) return;
    startTransition(async () => {
      setNotice(await transferOwnershipAction(selected.id, userId, reason));
      setReason("");
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
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-[1fr_160px_160px]">
          <SearchInput
            aria-label="Search conversations"
            placeholder="Search by name, description or member…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
          <Select
            aria-label="Filter by type"
            value={type}
            onChange={(event) => {
              setType(event.target.value as "all" | ChatConversationType);
              setPage(1);
            }}
          >
            <option value="all">All conversations</option>
            <option value="GROUP">Groups</option>
            <option value="DIRECT">Direct</option>
          </Select>
          <Select
            aria-label="Filter by status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as "all" | ChatConversationStatus);
              setPage(1);
            }}
          >
            <option value="all">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="DELETED">Deleted</option>
          </Select>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            title="No conversations match your filters"
            description="Try a different search, or clear the filters above."
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Type</Th>
                <Th>Owner / participants</Th>
                <Th>Members</Th>
                <Th>Created</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((conversation) => (
                <tr
                  key={conversation.id}
                  className="cursor-pointer hover:bg-muted/60"
                  onClick={() => openDetail(conversation.id)}
                >
                  <Td className="max-w-[220px] truncate font-semibold">
                    {conversation.type === "GROUP"
                      ? conversation.title || "Untitled group"
                      : conversation.participants.map((p) => p.profile?.displayName ?? "Unknown").join(" & ")}
                  </Td>
                  <Td className="capitalize">{conversation.type.toLowerCase()}</Td>
                  <Td className="max-w-[180px] truncate">{memberLabel(conversation)}</Td>
                  <Td>{activeMembers(conversation).length}</Td>
                  <Td className="whitespace-nowrap text-muted-foreground">{fmtDateTime(conversation.createdAt)}</Td>
                  <Td>
                    <Badge tone={STATUS_TONE[conversation.status]} dot className="capitalize">
                      {conversation.status.toLowerCase()}
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
        title={selected ? (selected.type === "GROUP" ? selected.title || "Untitled group" : "Direct conversation") : ""}
        description={selected ? `${selected.type === "GROUP" ? "Group" : "Direct"} · created ${fmtDateTime(selected.createdAt)}` : undefined}
      >
        {selected ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Badge tone={STATUS_TONE[selected.status]} dot className="capitalize">
                {selected.status.toLowerCase()}
              </Badge>
              {selected.type === "GROUP" ? (
                <Badge tone="neutral">{selected.isPublic ? "Public" : "Private"}</Badge>
              ) : null}
              {selected.requiresApproval ? <Badge tone="warning">Approval required</Badge> : null}
            </div>

            {selected.description ? <p className="text-sm text-muted-foreground">{selected.description}</p> : null}
            {selected.category ? (
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{selected.category}</p>
            ) : null}

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Participants ({activeMembers(selected).length})
              </p>
              <ul className="divide-y divide-border rounded-xl border border-border">
                {selected.participants.map((participant) => (
                  <li key={participant.userId} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {participant.profile ? fullName({ ...participant.profile, phone: "" }) : "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {participant.role.toLowerCase()} · {participant.status.toLowerCase().replace("_", " ")}
                      </p>
                    </div>
                    {canManageMembers && selected.type === "GROUP" && participant.status === "ACTIVE" && participant.role !== "OWNER" ? (
                      <div className="flex shrink-0 gap-1.5">
                        <Button variant="secondary" size="sm" onClick={() => transferTo(participant.userId)} disabled={pending}>
                          Make owner
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => removeMember(participant.userId)} disabled={pending}>
                          Remove
                        </Button>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>

            {canSuspend || canDelete || canManageMembers ? (
              <div className="space-y-2 rounded-xl border border-dashed border-border p-3">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="chat-mod-reason">
                  Reason (required for any action below)
                </label>
                <textarea
                  id="chat-mod-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={2}
                  placeholder="Explain why you're taking this action…"
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring"
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  {canSuspend && selected.status !== "SUSPENDED" ? (
                    <Button variant="secondary" size="sm" onClick={() => setStatusFor("SUSPENDED")} disabled={pending || !reason.trim()}>
                      Suspend
                    </Button>
                  ) : null}
                  {canSuspend && selected.status === "SUSPENDED" ? (
                    <Button variant="success" size="sm" onClick={() => setStatusFor("ACTIVE")} disabled={pending || !reason.trim()}>
                      Restore
                    </Button>
                  ) : null}
                  {canDelete && selected.status !== "DELETED" ? (
                    <Button variant="destructive" size="sm" onClick={() => setStatusFor("DELETED")} disabled={pending || !reason.trim()}>
                      Delete
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}
            {!canManage ? (
              <p className="text-xs text-muted-foreground">Your role has read-only access to Chat Management.</p>
            ) : null}
          </div>
        ) : null}
      </Drawer>
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, ShieldAlert, UserCheck, UserX } from "lucide-react";

import { setUserStatusAction } from "@/app/(console)/eventis/users/actions";
import { PAGE_SIZE, Pagination } from "@/components/shared/pagination";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchInput, Select } from "@/components/ui/input";
import { Dialog, Drawer } from "@/components/ui/overlay";
import { EmptyState } from "@/components/ui/states";
import { Table, Td, Th } from "@/components/ui/table";
import { fmtDate, fmtDateTime, fullName, maskPhone } from "@/lib/format";
import type { AdminUser } from "@/types";

interface Props {
  users: AdminUser[];
  currentUserId: string;
  canManage: boolean;
  canManageAdmins: boolean;
  eventCounts: Record<string, number>;
}

export function UsersTable({ users, currentUserId, canManage, canManageAdmins, eventCounts }: Props) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"suspend" | "activate" | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const needle = query.trim().toLowerCase();
  const filtered = users.filter((user) => {
    if (status !== "all" && user.status !== status) return false;
    if (type !== "all" && user.accountType !== type && !(type === "ADMIN" && user.role === "ADMIN")) return false;
    if (!needle) return true;
    return [fullName(user), user.phone, user.email, user.organizationName].some((value) => value?.toLowerCase().includes(needle));
  });

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const selected = users.find((user) => user.id === selectedId) ?? null;

  function reset<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  function runAction() {
    if (!selected || !confirm) return;
    const action = confirm;
    startTransition(async () => {
      const result = await setUserStatusAction(selected.id, action);
      setNotice(result);
      setConfirm(null);
    });
  }

  const isSelf = selected?.id === currentUserId;

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
          <button type="button" className="text-xs underline" onClick={() => setNotice(null)}>Dismiss</button>
        </div>
      ) : null}

      <Card>
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-[1fr_180px_180px]">
          <SearchInput aria-label="Search users" placeholder="Search name, phone, email, organisation…" value={query} onChange={(event) => reset(setQuery)(event.target.value)} />
          <Select aria-label="Filter by status" value={status} onChange={(event) => reset(setStatus)(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Suspended</option>
          </Select>
          <Select aria-label="Filter by account type" value={type} onChange={(event) => reset(setType)(event.target.value)}>
            <option value="all">All account types</option>
            <option value="CUSTOMER">Customer</option>
            <option value="POSTER">Organiser</option>
            <option value="LOVE">Find Love</option>
            <option value="ADMIN">Administrator</option>
          </Select>
        </div>

        {rows.length === 0 ? (
          <EmptyState title={users.length === 0 ? "No users yet" : "No users match your filters"} description={users.length === 0 ? "Registered accounts will appear here." : "Try a different search or clear the filters."} />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>User</Th>
                <Th>Contact</Th>
                <Th>Type</Th>
                <Th>Registered</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((user) => (
                <tr key={user.id} className="cursor-pointer hover:bg-muted/60" onClick={() => setSelectedId(user.id)}>
                  <Td>
                    <button type="button" className="flex items-center gap-3 text-left" onClick={(event) => { event.stopPropagation(); setSelectedId(user.id); }}>
                      <Avatar name={fullName(user)} src={user.avatarUrl} />
                      <span className="min-w-0">
                        <span className="block max-w-[200px] truncate font-semibold">{fullName(user)}</span>
                        {user.organizationName ? <span className="block max-w-[200px] truncate text-xs text-muted-foreground">{user.organizationName}</span> : null}
                      </span>
                    </button>
                  </Td>
                  <Td>
                    <span className="block tabular-nums">{maskPhone(user.phone)}</span>
                    <span className="block max-w-[200px] truncate text-xs text-muted-foreground">{user.email ?? "No email"}</span>
                  </Td>
                  <Td>
                    <AccountTypeBadge user={user} />
                  </Td>
                  <Td className="whitespace-nowrap text-muted-foreground">{fmtDate(user.createdAt)}</Td>
                  <Td><StatusBadge status={user.status} /></Td>
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
        title={selected ? fullName(selected) : ""}
        description={selected ? `User ID ${selected.id}` : undefined}
        footer={
          selected && canManage && (selected.role !== "ADMIN" || canManageAdmins) ? (
            selected.status === "ACTIVE" ? (
              <Button variant="destructive" disabled={isSelf} onClick={() => setConfirm("suspend")} title={isSelf ? "You cannot suspend your own account" : undefined}>
                <UserX className="h-4 w-4" /> Suspend account
              </Button>
            ) : (
              <Button variant="success" onClick={() => setConfirm("activate")}>
                <UserCheck className="h-4 w-4" /> Reactivate account
              </Button>
            )
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Avatar name={fullName(selected)} src={selected.avatarUrl} className="h-14 w-14 text-base" />
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={selected.status} />
                <AccountTypeBadge user={selected} />
              </div>
            </div>
            {isSelf ? <p className="rounded-xl bg-info-soft px-3 py-2 text-sm text-primary">This is your own account.</p> : null}
            <dl className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-3 text-sm">
              <Detail label="Phone" value={selected.phone} />
              <Detail label="Email" value={selected.email} />
              <Detail label="Display name" value={selected.displayName} />
              <Detail label="Role" value={selected.role === "ADMIN" ? "Administrator" : "Customer"} />
              <Detail label="Registered" value={fmtDateTime(selected.createdAt)} />
              <Detail label="Last updated" value={fmtDateTime(selected.updatedAt)} />
              <Detail label="Location" value={selected.location} />
              <Detail label="Gender" value={selected.gender} />
              <Detail label="Date of birth" value={selected.dateOfBirth ? fmtDate(selected.dateOfBirth) : null} />
              <Detail label="Organisation" value={selected.organizationName} />
              <Detail label="Org. description" value={selected.organizationDescription} />
              <Detail label="Bio" value={selected.bio} />
              {selected.accountType === "POSTER" ? <Detail label="Events posted" value={String(eventCounts[selected.id] ?? 0)} /> : null}
            </dl>
            {!canManage ? <p className="text-xs text-muted-foreground">You have read-only access to users.</p> : null}
          </div>
        ) : null}
      </Drawer>

      <Dialog
        open={confirm !== null && selected !== null}
        onClose={() => (pending ? undefined : setConfirm(null))}
        title={confirm === "suspend" ? "Suspend this account?" : "Reactivate this account?"}
        description={selected ? fullName(selected) : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)} disabled={pending}>Cancel</Button>
            <Button variant={confirm === "suspend" ? "destructive" : "success"} onClick={runAction} loading={pending}>
              {confirm === "suspend" ? "Suspend" : "Reactivate"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          {confirm === "suspend"
            ? "The user will no longer be able to sign in. You can reactivate the account at any time."
            : "The user will be able to sign in again."}
        </p>
        {confirm === "suspend" && selected?.role === "ADMIN" ? (
          <p className="mt-3 rounded-xl bg-warning-soft px-3 py-2 text-sm text-warning">This account is an administrator.</p>
        ) : null}
      </Dialog>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-words font-medium">{value || "—"}</dd>
    </>
  );
}

export function StatusBadge({ status }: { status: AdminUser["status"] }) {
  return status === "ACTIVE" ? <Badge tone="success" dot>Active</Badge> : <Badge tone="danger" dot>Suspended</Badge>;
}

function AccountTypeBadge({ user }: { user: AdminUser }) {
  if (user.role === "ADMIN") return <Badge tone="warning">Administrator</Badge>;
  if (user.accountType === "POSTER") return <Badge tone="info">Organiser</Badge>;
  if (user.accountType === "LOVE") return <Badge tone="neutral">Find Love</Badge>;
  return <Badge tone="neutral">Customer</Badge>;
}

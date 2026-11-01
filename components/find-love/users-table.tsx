"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Search,
  UserCheck,
  UserX,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/overlay";
import { Table, Td, Th } from "@/components/ui/table";
import { updateUserStatusAction } from "@/lib/find-love/actions";
import type { AccountType, FindLoveUser, SubscriptionStatus, VerificationStatus } from "@/lib/find-love/types";

export function UsersTable({ initialUsers }: { initialUsers: FindLoveUser[] }) {
  const [users, setUsers] = useState<FindLoveUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [accountType, setAccountType] = useState<AccountType | "all">("all");
  const [accountStatus, setAccountStatus] = useState<string>("all");
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | "all">("all");
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | "all">("all");
  const [unmaskedPhones, setUnmaskedPhones] = useState<Record<string, boolean>>({});

  // Status modification modal state
  const [statusModalUser, setStatusModalUser] = useState<FindLoveUser | null>(null);
  const [newStatus, setNewStatus] = useState<"active" | "suspended" | "banned">("suspended");
  const [statusReason, setStatusReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const togglePhone = (userId: string) => {
    setUnmaskedPhones((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const maskPhone = (phone: string, unmasked: boolean) => {
    if (unmasked) return phone;
    if (phone.length < 8) return "••••••••";
    return phone.slice(0, 4) + " ••• ••" + phone.slice(-2);
  };

  const filteredUsers = users.filter((u) => {
    if (search) {
      const q = search.toLowerCase();
      const match =
        u.id.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q);
      if (!match) return false;
    }
    if (accountType !== "all" && u.accountType !== accountType) return false;
    if (accountStatus !== "all" && u.accountStatus !== accountStatus) return false;
    if (verificationStatus !== "all" && u.verificationStatus !== verificationStatus) return false;
    if (subscriptionStatus !== "all" && u.subscriptionStatus !== subscriptionStatus) return false;
    return true;
  });

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalUser) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("userId", statusModalUser.id);
      formData.set("status", newStatus);
      formData.set("reason", statusReason || "Administrative decision");
      formData.set("actor", "Admin Tester");

      const res = await updateUserStatusAction(formData);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === statusModalUser.id ? { ...u, accountStatus: newStatus, suspendReason: statusReason } : u,
          ),
        );
        setStatusModalUser(null);
        setStatusReason("");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top filters card */}
      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden />
            <input
              type="text"
              placeholder="Search by ID (FL-001245), username, name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-input pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Account Type Filter */}
          <div>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value as AccountType | "all")}
              aria-label="Filter by account type"
              className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">Account: All Tiers</option>
              <option value="public">Public Account</option>
              <option value="private">Private Account</option>
            </select>
          </div>

          {/* Account Status Filter */}
          <div>
            <select
              value={accountStatus}
              onChange={(e) => setAccountStatus(e.target.value)}
              aria-label="Filter by account status"
              className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">Status: All</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
          </div>

          {/* Verification Status */}
          <div>
            <select
              value={verificationStatus}
              onChange={(e) => setVerificationStatus(e.target.value as VerificationStatus | "all")}
              aria-label="Filter by verification status"
              className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">Verification: All</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending Review</option>
              <option value="rejected">Rejected</option>
              <option value="not_submitted">Not Submitted</option>
            </select>
          </div>

          {/* Subscription Status */}
          <div>
            <select
              value={subscriptionStatus}
              onChange={(e) => setSubscriptionStatus(e.target.value as SubscriptionStatus | "all")}
              aria-label="Filter by subscription status"
              className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">Subscription: All</option>
              <option value="active">Active Plan</option>
              <option value="past_due">Past Due</option>
              <option value="expired">Expired</option>
              <option value="trial">Trial</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
          <span>
            Showing <strong className="font-semibold text-foreground">{filteredUsers.length}</strong> of{" "}
            {users.length} members
          </span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-primary" /> Private Account
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-foreground" /> Public Account
            </span>
          </div>
        </div>
      </Card>

      {/* Users Data Table */}
      <Card>
        <CardHeader
          title="Registered Members"
          description="Click any member to open full profile, review documents, and manage subscriptions"
        />
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <Th>Member Profile</Th>
                <Th>Gender / Age</Th>
                <Th>Location</Th>
                <Th>Telephone</Th>
                <Th>Account Tier</Th>
                <Th>Verification</Th>
                <Th>Subscription</Th>
                <Th>Account Status</Th>
                <Th>Joined Date</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const unmasked = !!unmaskedPhones[user.id];
                return (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    {/* Member profile info */}
                    <Td>
                      <Link href={`/find-love/users/${user.id}`} className="group flex items-center gap-3">
                        <Avatar name={user.displayName} src={user.avatarUrl} className="h-10 w-10 ring-1 ring-border group-hover:ring-primary" />
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                            {user.displayName}
                            {user.verificationStatus === "verified" ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                            ) : null}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{user.username} · <span className="font-mono text-[11px]">{user.id}</span>
                          </p>
                        </div>
                      </Link>
                    </Td>

                    {/* Gender & Age */}
                    <Td>
                      <span className="text-sm font-medium">{user.gender}</span>
                      <span className="block text-xs text-muted-foreground">{user.age} yrs</span>
                    </Td>

                    {/* Location */}
                    <Td>
                      <span className="text-sm font-medium">{user.country}</span>
                      <span className="block text-xs text-muted-foreground">{user.city}</span>
                    </Td>

                    {/* Telephone with unmask toggle */}
                    <Td>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs tabular-nums text-foreground">
                          {maskPhone(user.phone, unmasked)}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePhone(user.id)}
                          aria-label={unmasked ? "Mask telephone number" : "Reveal telephone number"}
                          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title={unmasked ? "Hide full phone" : "Reveal full phone"}
                        >
                          {unmasked ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </button>
                      </div>
                    </Td>

                    {/* Account Type */}
                    <Td>
                      <Badge tone={user.accountType === "private" ? "info" : "neutral"} dot>
                        {user.accountType === "private" ? "Private" : "Public"}
                      </Badge>
                    </Td>

                    {/* Verification Status */}
                    <Td>
                      <Badge
                        tone={
                          user.verificationStatus === "verified"
                            ? "success"
                            : user.verificationStatus === "pending"
                            ? "warning"
                            : user.verificationStatus === "rejected"
                            ? "danger"
                            : "neutral"
                        }
                        dot
                      >
                        {user.verificationStatus === "verified"
                          ? "Verified"
                          : user.verificationStatus === "pending"
                          ? "Pending"
                          : user.verificationStatus === "rejected"
                          ? "Rejected"
                          : "Not submitted"}
                      </Badge>
                    </Td>

                    {/* Subscription Status */}
                    <Td>
                      <Badge
                        tone={
                          user.subscriptionStatus === "active"
                            ? "success"
                            : user.subscriptionStatus === "past_due"
                            ? "warning"
                            : user.subscriptionStatus === "expired"
                            ? "danger"
                            : "neutral"
                        }
                      >
                        {user.subscriptionStatus.replace("_", " ")}
                      </Badge>
                    </Td>

                    {/* Account Status */}
                    <Td>
                      <Badge
                        tone={
                          user.accountStatus === "active"
                            ? "success"
                            : user.accountStatus === "suspended"
                            ? "danger"
                            : "danger"
                        }
                      >
                        {user.accountStatus}
                      </Badge>
                    </Td>

                    {/* Joined Date */}
                    <Td className="text-xs text-muted-foreground tabular-nums">
                      {new Date(user.joinedAt).toLocaleDateString([], {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Td>

                    {/* Actions */}
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/find-love/users/${user.id}`}>
                          <Button variant="secondary" size="sm" className="h-8 px-2.5 text-xs">
                            Profile <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        {user.accountStatus === "active" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-destructive hover:bg-destructive-soft hover:text-destructive"
                            onClick={() => {
                              setStatusModalUser(user);
                              setNewStatus("suspended");
                            }}
                            title="Suspend Account"
                          >
                            <UserX className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-success hover:bg-success-soft hover:text-success"
                            onClick={() => {
                              setStatusModalUser(user);
                              setNewStatus("active");
                            }}
                            title="Reactivate Account"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </Td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <Td colSpan={10} className="py-8 text-center text-sm text-muted-foreground">
                    No members match the selected search and filter criteria.
                  </Td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Suspend / Status Modification Modal */}
      <Dialog
        open={!!statusModalUser}
        onClose={() => setStatusModalUser(null)}
        title={newStatus === "active" ? "Reactivate Member Account" : "Restrict / Suspend Member Account"}
        description={
          statusModalUser
            ? `User: ${statusModalUser.displayName} (@${statusModalUser.username} · ${statusModalUser.id})`
            : undefined
        }
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-foreground">Select New Account Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as "active" | "suspended" | "banned")}
              className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="active">Active (Full access restored)</option>
              <option value="suspended">Suspended (Temporary restriction)</option>
              <option value="banned">Banned (Permanent access block)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground">
              Reason for Decision (Required for Audit Trail)
            </label>
            <textarea
              required
              rows={3}
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="Provide a documented reason (e.g. Identity document fraud, violation of safety guidelines, resolution of dispute)..."
              className="mt-1 w-full rounded-xl border border-border bg-input p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="secondary" onClick={() => setStatusModalUser(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={newStatus === "active" ? "primary" : "destructive"}
              loading={isPending}
            >
              Confirm Status Change
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input, Select, SearchInput } from "@/components/ui/input";
import { Dialog } from "@/components/ui/overlay";
import { Table, Th, Td } from "@/components/ui/table";
import {
  type Member,
  type Command,
  accessReason,
  activeMembership,
  dateLabel,
  money,
} from "@/lib/find-love/membership-demo";
import {
  type ViewProps,
  Field,
  Reason,
  Status,
  PlanSelect,
  Empty,
  formString,
} from "./shared";
type Action = Extract<Command, { type: "member" }>["action"];
export function Members({
  state,
  now,
  mutate,
  memberId,
}: ViewProps & { memberId?: string }) {
  const [search, setSearch] = useState(""),
    [tier, setTier] = useState("all"),
    [access, setAccess] = useState("all");
  const [selected, setSelected] = useState<Member | null>(null),
    [action, setAction] = useState<Action>("grant");
  const members = state.members.filter(
    (m) =>
      (!memberId || memberId === m.id) &&
      `${m.name} ${m.id} ${m.username}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (tier === "all" || m.membership?.tier === tier) &&
      (access === "all" ||
        (accessReason(m, now) === "Access enabled") === (access === "enabled")),
  );
  function open(m: Member) {
    setSelected(m);
    setAction("grant");
  }
  return (
    <div className="space-y-5">
      {memberId && (
        <Link
          className="text-sm text-primary hover:underline"
          href="/find-love/users"
        >
          ← All members
        </Link>
      )}
      <Card>
        <CardHeader
          title={
            memberId
              ? (members[0]?.name ?? "Member not found")
              : "Memberships & account access"
          }
          description="Expiry, verification and account status jointly determine access. Grants and extensions do not count as collected payments."
        />
        <div className="grid gap-3 p-5 sm:grid-cols-3">
          <SearchInput
            aria-label="Search members"
            placeholder="Name, username or member ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            aria-label="Filter membership tier"
            value={tier}
            onChange={(e) => setTier(e.target.value)}
          >
            <option value="all">All tiers</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </Select>
          <Select
            aria-label="Filter access"
            value={access}
            onChange={(e) => setAccess(e.target.value)}
          >
            <option value="all">All access states</option>
            <option value="enabled">Access enabled</option>
            <option value="blocked">Access blocked</option>
          </Select>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Member</Th>
              <Th>Membership</Th>
              <Th>Expiry</Th>
              <Th>Verification / account</Th>
              <Th>Access</Th>
              <Th>Manage</Th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <Td>
                  <Link
                    href={`/find-love/users/${m.id}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {m.name}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {m.id} · {m.country}
                  </p>
                </Td>
                <Td>
                  <span className="capitalize">
                    {m.membership?.tier ?? "No plan"}
                  </span>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {m.membership
                      ? m.membership.status === "revoked"
                        ? "Revoked"
                        : activeMembership(m, now)
                          ? "Active"
                          : "Expired"
                      : "Awaiting purchase"}
                  </p>
                </Td>
                <Td>
                  {m.membership ? dateLabel(m.membership.expiresAt) : "—"}
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-2">
                    <Status value={m.verification} />
                    <Status value={m.account} />
                  </div>
                </Td>
                <Td>
                  <Status value={accessReason(m, now)} />
                </Td>
                <Td>
                  <Button variant="secondary" size="sm" onClick={() => open(m)}>
                    Manage access
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
        {!members.length && <Empty />}
      </Card>
      {memberId && members[0]?.membership && (
        <Card className="p-5">
          <h2 className="font-semibold">Saved membership terms</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {members[0].membership.planId} ·{" "}
            {money(members[0].membership.price)} at purchase · starts{" "}
            {dateLabel(members[0].membership.startsAt)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(
              members[0].membership.permissions[members[0].membership.tier],
            ).map(([target, allowed]) => (
              <Status
                key={target}
                value={`${target}: ${allowed ? "can initiate" : "cannot initiate"}`}
              />
            ))}
          </div>
        </Card>
      )}
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Manage ${selected?.name ?? "member"}`}
        description="Every change requires a reason and is saved to the demo audit log."
      >
        {selected && (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              if (
                await mutate({
                  type: "member",
                  id: selected.id,
                  action,
                  planId: formString(form, "planId"),
                  days: Number(formString(form, "days")),
                  reason: formString(form, "reason"),
                })
              )
                setSelected(null);
            }}
          >
            <Field label="Action">
              <Select
                value={action}
                onChange={(e) => setAction(e.target.value as Action)}
              >
                <option value="grant">
                  Grant / renew complimentary membership
                </option>
                <option value="extend">Extend membership</option>
                <option value="revoke">Revoke membership</option>
                <option value="suspend">Suspend account</option>
                <option value="restore">Restore account</option>
                <option value="ban">Ban account</option>
              </Select>
            </Field>
            {action === "grant" && (
              <Field label="Enabled plan">
                <PlanSelect
                  state={state}
                  defaultValue={selected.membership?.planId}
                />
              </Field>
            )}
            {action === "extend" && (
              <Field label="Additional days">
                <Input
                  name="days"
                  type="number"
                  min={1}
                  max={365}
                  step={1}
                  required
                  defaultValue={7}
                />
              </Field>
            )}
            <p className="text-xs leading-relaxed text-muted-foreground">
              {action === "grant"
                ? "Complimentary access; no payment or revenue is created. Same-tier renewals keep remaining days. Revoke before switching tiers."
                : action === "extend"
                  ? "Adds days to the existing expiry, or starts from today if expired. Keeps the original price and permissions."
                  : "Suspension and revocation restrict access immediately. Restoring an account still requires verified age and an active membership."}
            </p>
            <Reason />
            <Button type="submit">Apply change</Button>
          </form>
        )}
      </Dialog>
    </div>
  );
}

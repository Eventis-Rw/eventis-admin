"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input, Select, SearchInput } from "@/components/ui/input";
import { Dialog } from "@/components/ui/overlay";
import { Table, Td, Th } from "@/components/ui/table";
import {
  type Payment,
  dateLabel,
  money,
} from "@/lib/find-love/membership-demo";
import {
  type ViewProps,
  Field,
  Reason,
  Status,
  MemberOptions,
  PlanSelect,
  Empty,
  formString,
} from "./shared";
function exportPayments(payments: Payment[], names: Map<string, string>) {
  const rows = [
    ["Payment", "Member", "Plan", "Amount RWF", "Method", "Status", "Date"],
    ...payments.map((p) => [
      p.id,
      names.get(p.memberId) ?? p.memberId,
      p.plan.id,
      p.amount,
      p.method,
      p.status,
      p.createdAt,
    ]),
  ];
  const csv = rows
    .map((row) =>
      row
        .map(
          (value) =>
            `"${String(value)
              .replace(/^[=+@\-]/, "'$&")
              .replaceAll('"', '""')}"`,
        )
        .join(","),
    )
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "findlove-membership-payments.csv";
  link.click();
  URL.revokeObjectURL(url);
}
export function Payments({ state, mutate }: ViewProps) {
  const [checkout, setCheckout] = useState(false),
    [resolving, setResolving] = useState<Payment | null>(null);
  const [query, setQuery] = useState(""),
    [status, setStatus] = useState("all"),
    [tier, setTier] = useState("all"),
    [from, setFrom] = useState(""),
    [until, setUntil] = useState("");
  const names = new Map(state.members.map((m) => [m.id, m.name]));
  const payments = state.payments.filter(
    (p) =>
      (status === "all" || p.status === status) &&
      (tier === "all" || p.plan.tier === tier) &&
      (!from || p.createdAt.slice(0, 10) >= from) &&
      (!until || p.createdAt.slice(0, 10) <= until) &&
      `${p.id} ${p.memberId} ${names.get(p.memberId)} ${p.plan.id}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title="Full-period membership payments"
          description="Simulate checkout outcomes. Successful payments activate or renew access; pending and failed payments do not grant access."
          action={
            <Button onClick={() => setCheckout(true)}>Simulate purchase</Button>
          }
        />
        <div className="grid gap-3 p-5 md:grid-cols-3">
          <SearchInput
            aria-label="Search payment or customer"
            placeholder="Payment, customer or plan"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Select
            aria-label="Payment status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="success">Successful</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </Select>
          <Select
            aria-label="Payment tier"
            value={tier}
            onChange={(e) => setTier(e.target.value)}
          >
            <option value="all">All tiers</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </Select>
          <Field label="From date (UTC)">
            <Input
              type="date"
              value={from}
              max={until || undefined}
              onChange={(e) => setFrom(e.target.value)}
            />
          </Field>
          <Field label="Through date (UTC)">
            <Input
              type="date"
              value={until}
              min={from || undefined}
              onChange={(e) => setUntil(e.target.value)}
            />
          </Field>
          <div className="flex items-end gap-2">
            <Button
              variant="secondary"
              onClick={() => exportPayments(payments, names)}
            >
              Export filtered CSV
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setQuery("");
                setStatus("all");
                setTier("all");
                setFrom("");
                setUntil("");
              }}
            >
              Clear
            </Button>
          </div>
        </div>
        <p className="px-5 pb-4 text-sm text-muted-foreground">
          {payments.length} payments ·{" "}
          {money(
            payments
              .filter((p) => p.status === "success")
              .reduce((sum, p) => sum + p.amount, 0),
          )}{" "}
          collected in this selection
        </p>
        <Table>
          <thead>
            <tr>
              <Th>Payment / date</Th>
              <Th>Member</Th>
              <Th>Purchased plan</Th>
              <Th>Full amount</Th>
              <Th>Method</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <Td>
                  <span className="text-xs">{p.id}</span>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {dateLabel(p.createdAt)}
                  </p>
                </Td>
                <Td>{names.get(p.memberId)}</Td>
                <Td className="capitalize">
                  {p.plan.tier} · {p.plan.period}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.plan.days} days
                  </p>
                </Td>
                <Td>{money(p.amount)}</Td>
                <Td>{p.method}</Td>
                <Td>
                  <Status value={p.status} />
                </Td>
                <Td>
                  {p.status === "pending" ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setResolving(p)}
                    >
                      Resolve payment
                    </Button>
                  ) : (
                    "—"
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
        {!payments.length && <Empty />}
      </Card>
      <Dialog
        open={checkout}
        onClose={() => setCheckout(false)}
        title="Simulate membership purchase"
        description="Demo only. No charge is sent to a payment provider."
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            if (
              mutate({
                type: "checkout",
                id: formString(form, "member"),
                planId: formString(form, "planId"),
                method: formString(form, "method") as Payment["method"],
                outcome: formString(form, "outcome") as Payment["status"],
                reason: formString(form, "reason"),
              })
            )
              setCheckout(false);
          }}
        >
          <Field label="Customer">
            <Select name="member">
              <MemberOptions members={state.members} />
            </Select>
          </Field>
          <Field label="Plan and full payment amount">
            <PlanSelect state={state} />
          </Field>
          <Field label="Payment method">
            <Select name="method">
              <option>MTN MoMo</option>
              <option>Airtel Money</option>
            </Select>
          </Field>
          <Field label="Simulated provider result">
            <Select name="outcome">
              <option value="success">Successful</option>
              <option value="pending">Pending confirmation</option>
              <option value="failed">Failed</option>
            </Select>
          </Field>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Renew the same tier to preserve remaining days. A complimentary
            grant is available under Members. Revoke an active membership before
            switching tiers.
          </p>
          <Reason />
          <Button type="submit" disabled={!state.plans.some((p) => p.active)}>
            Run demo checkout
          </Button>
        </form>
      </Dialog>
      <Dialog
        open={!!resolving}
        onClose={() => setResolving(null)}
        title="Resolve pending payment"
        description="Uses the price and rules saved when checkout started."
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (
              resolving &&
              mutate({
                type: "settle",
                id: resolving.id,
                outcome: formString(e.currentTarget, "outcome") as
                  "success" | "failed",
                reason: formString(e.currentTarget, "reason"),
              })
            )
              setResolving(null);
          }}
        >
          <Field label="Final provider outcome">
            <Select name="outcome">
              <option value="success">Successful</option>
              <option value="failed">Failed</option>
            </Select>
          </Field>
          <Reason />
          <Button type="submit">Confirm demo result</Button>
        </form>
      </Dialog>
    </div>
  );
}
export function Audit({ state }: ViewProps) {
  const [search, setSearch] = useState("");
  const logs = state.audit.filter((e) =>
    `${e.action} ${e.target} ${e.reason}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <Card>
      <CardHeader
        title="Demo activity log"
        description="Changes made in this browser, recorded as Demo Admin. This local log is editable browser data, not a production compliance record."
      />
      <div className="p-5">
        <SearchInput
          aria-label="Search activity"
          placeholder="Action, target or reason"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Table>
        <thead>
          <tr>
            <Th>When</Th>
            <Th>Actor</Th>
            <Th>Action</Th>
            <Th>Target</Th>
            <Th>Reason</Th>
          </tr>
        </thead>
        <tbody>
          {logs.map((entry) => (
            <tr key={entry.id}>
              <Td>
                {new Date(entry.at).toLocaleString("en-GB", {
                  timeZone: "Africa/Kigali",
                })}
              </Td>
              <Td>Demo Admin</Td>
              <Td>
                {entry.action}
                {entry.details && (
                  <p className="mt-1 max-w-xs whitespace-normal text-xs text-muted-foreground">
                    {entry.details}
                  </p>
                )}
              </Td>
              <Td>{entry.target}</Td>
              <Td className="max-w-sm whitespace-normal">{entry.reason}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
      {!logs.length && (
        <Empty>
          No activity yet. Save a plan or manage a member to create an entry.
        </Empty>
      )}
    </Card>
  );
}

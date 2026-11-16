"use client";

import type { ReactNode } from "react";
import { Input, Select } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  type Demo,
  type Member,
  type Command,
  activeMembership,
  accessReason,
  money,
} from "@/lib/find-love/membership-demo";
export type Mutate = (command: Command) => boolean | Promise<boolean>;
export type ViewProps = {
  live?: boolean;
  state: Demo;
  now: number;
  mutate: Mutate;
};
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function Reason({
  label = "Reason for the audit log",
  placeholder = "Explain this change…",
}: { label?: string; placeholder?: string } = {}) {
  return (
    <Field label={label}>
      <Input
        name="reason"
        required
        minLength={5}
        maxLength={500}
        placeholder={placeholder}
      />
    </Field>
  );
}
export function MemberOptions({ members }: { members: Member[] }) {
  return (
    <>
      {members.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name} · {m.id}
        </option>
      ))}
    </>
  );
}
export function PlanSelect({
  state,
  name = "planId",
  defaultValue,
}: {
  state: Demo;
  name?: string;
  defaultValue?: string;
}) {
  return (
    <Select name={name} required defaultValue={defaultValue}>
      {state.plans
        .filter((p) => p.active)
        .map((p) => (
          <option key={p.id} value={p.id}>
            {p.tier} · {p.period} · {money(p.price)} · {p.days} days
          </option>
        ))}
    </Select>
  );
}
export function Status({ value }: { value: string }) {
  return (
    <Badge
      tone={
        [
          "success",
          "verified",
          "active",
          "Access enabled",
          "resolved",
        ].includes(value)
          ? "success"
          : ["failed", "banned", "revoked", "rejected"].includes(value)
            ? "danger"
            : "neutral"
      }
    >
      {value.replaceAll("_", " ")}
    </Badge>
  );
}
export function Metrics({
  state,
  now,
  live,
}: Pick<ViewProps, "state" | "now" | "live">) {
  const metrics = [
    [
      "Membership revenue",
      money(
        state.payments
          .filter((p) => p.status === "success")
          .reduce((sum, p) => sum + p.amount, 0),
      ),
      live
        ? "Recorded received payments only"
        : "Successful demo payments only",
    ],
    [
      "Active memberships",
      state.members.filter((m) => activeMembership(m, now)).length,
      "Paid or administratively granted",
    ],
    [
      "Access enabled",
      state.members.filter((m) => accessReason(m, now) === "Access enabled")
        .length,
      "Verified adults with active accounts",
    ],
    [
      "Pending payments",
      state.payments.filter((p) => p.status === "pending").length,
      "Access waits for confirmation",
    ],
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(([label, value, detail]) => (
        <Card className="p-5" key={label}>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
        </Card>
      ))}
    </div>
  );
}
export function Empty({
  children = "No matching records.",
}: {
  children?: ReactNode;
}) {
  return (
    <p className="px-5 py-10 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}
export function formString(form: HTMLFormElement, key: string) {
  return String(new FormData(form).get(key) ?? "");
}

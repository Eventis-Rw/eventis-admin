"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Dialog } from "@/components/ui/overlay";
import {
  type Plan,
  type Tier,
  connectionDecision,
  money,
} from "@/lib/find-love/membership-demo";
import {
  type ViewProps,
  Field,
  Reason,
  Status,
  MemberOptions,
  formString,
} from "./shared";

export function Plans({ state, mutate }: ViewProps) {
  const [editing, setEditing] = useState<Plan | null>(null);
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/20 bg-primary-soft p-5 text-sm leading-relaxed">
        <strong>Aligned with the mobile catalog.</strong> These RWF prices are
        placeholders awaiting business approval. Each purchase pays for the full
        period. Monthly means 30 days; yearly means 365 days. Price and
        availability changes affect future checkouts.
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {(["public", "private"] as const).map((tier) => (
          <Card key={tier}>
            <CardHeader
              title={`${tier === "public" ? "Public" : "Private"} membership`}
              description={
                tier === "public"
                  ? "Paid entry to FindLove. Default permissions allow initiating connections with Public members."
                  : "Default permissions allow initiating connections with both tiers. Private profiles remain discoverable."
              }
            />
            <div className="divide-y divide-border">
              {state.plans
                .filter((p) => p.tier === tier)
                .map((plan) => (
                  <div
                    className="flex flex-wrap items-center justify-between gap-4 p-5"
                    key={plan.id}
                  >
                    <div>
                      <p className="text-sm font-semibold capitalize">
                        {plan.period === "week"
                          ? "Weekly"
                          : plan.period === "month"
                            ? "Monthly"
                            : "Yearly"}{" "}
                        <span className="ml-2 font-normal text-muted-foreground">
                          {plan.days} days
                        </span>
                      </p>
                      <p className="mt-1 text-xl font-semibold tabular-nums">
                        {money(plan.price)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {plan.id}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Status value={plan.active ? "active" : "disabled"} />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditing(plan)}
                      >
                        Edit plan
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <h2 className="font-semibold">
          What stays with an existing membership?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Its purchased price, expiry and connection permissions are saved
          together. Disabling a plan stops new checkouts; it does not remove
          access already granted. Extensions and early renewals preserve
          remaining days and existing connection permissions. Administrative
          grants are recorded separately from revenue.
        </p>
      </Card>
      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit membership plan"
        description="Changes take effect immediately for future checkouts."
      >
        {editing && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              if (
                mutate({
                  type: "plan",
                  id: editing.id,
                  price: Number(formString(form, "price")),
                  active: formString(form, "active") === "on",
                  reason: formString(form, "reason"),
                })
              )
                setEditing(null);
            }}
          >
            <p className="text-sm capitalize">
              {editing.tier} · {editing.period} · {editing.days} days
            </p>
            <Field label="Full price (RWF)">
              <Input
                name="price"
                type="number"
                min={1}
                step={1}
                required
                defaultValue={editing.price}
              />
            </Field>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                name="active"
                defaultChecked={editing.active}
                className="accent-primary"
              />
              Available for new purchases
            </label>
            <Reason />
            <Button type="submit">Save plan</Button>
          </form>
        )}
      </Dialog>
    </div>
  );
}
export function Rules({ state, now, mutate }: ViewProps) {
  const [sender, setSender] = useState(state.members[1].id),
    [target, setTarget] = useState(state.members[0].id);
  const from = state.members.find((m) => m.id === sender)!,
    to = state.members.find((m) => m.id === target)!;
  return (
    <div className="grid items-start gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader
          title="Connection permissions"
          description="Rows are the initiating tier. New memberships receive these rules; existing memberships retain their saved permissions."
        />
        <form
          key={JSON.stringify(state.permissions)}
          className="space-y-5 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const permissions = structuredClone(state.permissions);
            for (const a of ["public", "private"] as Tier[])
              for (const b of ["public", "private"] as Tier[])
                permissions[a][b] = data.has(`${a}-${b}`);
            mutate({
              type: "rules",
              permissions,
              reason: String(data.get("reason")),
            });
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            {(["public", "private"] as Tier[]).flatMap((a) =>
              (["public", "private"] as Tier[]).map((b) => (
                <label
                  className="flex items-center gap-3 rounded-xl border border-border p-4 text-sm capitalize"
                  key={`${a}-${b}`}
                >
                  <input
                    type="checkbox"
                    name={`${a}-${b}`}
                    defaultChecked={state.permissions[a][b]}
                    className="h-4 w-4 accent-primary"
                  />
                  {a} → {b}
                </label>
              )),
            )}
          </div>
          <Reason />
          <Button type="submit">Save connection rules</Button>
        </form>
      </Card>
      <div className="space-y-5">
        <Card>
          <CardHeader
            title="Check a member’s access"
            description="Uses saved membership permissions, verification, age, account status, country and current expiry."
          />
          <div className="space-y-4 p-5">
            <Field label="Initiating member">
              <Select
                value={sender}
                onChange={(e) => setSender(e.target.value)}
              >
                <MemberOptions members={state.members} />
              </Select>
            </Field>
            <Field label="Recipient">
              <Select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              >
                <MemberOptions members={state.members} />
              </Select>
            </Field>
            <p className="rounded-xl bg-muted p-4 text-sm" role="status">
              {connectionDecision(from, to, now)}
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {connectionDecision(from, to, now, true)}
            </p>
          </div>
        </Card>
        <Card className="space-y-3 p-5 text-sm leading-relaxed">
          <h2 className="font-semibold">Fixed mobile rules</h2>
          <p>
            Both tiers require payment. Public and Private profiles are
            discoverable within the member’s country. A Private member can
            request a Public member, who may accept.
          </p>
          <p className="text-muted-foreground">
            Before connecting, each person may send one text message of up to
            200 characters. Accepted connections unlock unrestricted messaging.
            No incognito, boosts, automatic renewal or installment billing is
            configured here.
          </p>
        </Card>
      </div>
    </div>
  );
}

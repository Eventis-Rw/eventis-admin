"use client";

import { useState, useTransition } from "react";
import {
  Edit2,
  History,
  Lock,
  Sparkles,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/overlay";
import { Table, Td, Th } from "@/components/ui/table";
import { updatePricingAction } from "@/lib/find-love/actions";
import type { PriceHistoryEntry, PricingPlanConfig } from "@/lib/find-love/types";

interface PricingViewProps {
  pricing: PricingPlanConfig[];
  priceHistory: PriceHistoryEntry[];
}

export function PricingView({ pricing, priceHistory }: PricingViewProps) {
  const [plans, setPlans] = useState<PricingPlanConfig[]>(pricing);
  const [history, setHistory] = useState<PriceHistoryEntry[]>(priceHistory);

  // Edit modal
  const [editingPlan, setEditingPlan] = useState<PricingPlanConfig | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editEffectiveDate, setEditEffectiveDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [editReason, setEditReason] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const publicPlans = plans.filter((p) => p.accountType === "public");
  const privatePlans = plans.filter((p) => p.accountType === "private");

  const openEditor = (plan: PricingPlanConfig) => {
    setEditingPlan(plan);
    setEditPrice(plan.price);
    setEditEffectiveDate(new Date().toISOString().slice(0, 10));
    setEditReason("");
  };

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("accountType", editingPlan.accountType);
      formData.set("period", editingPlan.period);
      formData.set("newPrice", String(editPrice));
      formData.set("effectiveDate", editEffectiveDate);
      formData.set("reason", editReason || "Pricing strategy update");
      formData.set("actor", "Finance Lead");

      const res = await updatePricingAction(formData);
      if (res.success) {
        setPlans((prev) =>
          prev.map((p) =>
            p.accountType === editingPlan.accountType && p.period === editingPlan.period
              ? { ...p, price: editPrice, effectiveFrom: editEffectiveDate }
              : p,
          ),
        );
        setHistory((prev) => [
          {
            id: `PH-${Date.now()}`,
            accountType: editingPlan.accountType,
            period: editingPlan.period,
            oldPrice: editingPlan.price,
            newPrice: editPrice,
            currency: editingPlan.currency,
            changedBy: "Finance Lead",
            changedAt: new Date().toISOString(),
            effectiveDate: editEffectiveDate,
            reason: editReason,
          },
          ...prev,
        ]);
        setEditingPlan(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner explaining pricing logic */}
      <div className="flex items-start justify-between gap-4 rounded-2xl border border-primary/20 bg-primary-soft p-5 text-foreground">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="space-y-1 text-xs leading-relaxed">
            <p className="text-sm font-bold text-primary">Public & Private Subscription Architecture</p>
            <p>
              Both <strong>Public</strong> and <strong>Private</strong> account tiers support identical billing periods:{" "}
              <strong>Weekly</strong>, <strong>Monthly</strong>, and <strong>Yearly</strong>. Administrators can independently
              configure pricing for each tier without affecting existing subscriptions.
            </p>
            <p className="text-muted-foreground">
              New prices apply only to new subscriptions or upcoming eligible renewals according to the configured effective date.
            </p>
          </div>
        </div>
      </div>

      {/* Side-by-side Pricing Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Public Accounts Card */}
        <Card className="flex flex-col p-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-foreground">
                <Users className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-bold text-foreground">Public Account Plans</h2>
                <p className="text-xs text-muted-foreground">Standard dating profiles with community search visibility</p>
              </div>
            </div>
            <Badge tone="neutral">Standard Tier</Badge>
          </div>

          <div className="mt-5 space-y-4 flex-1">
            {publicPlans.map((plan) => (
              <div
                key={plan.period}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border/80"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold capitalize text-foreground">{plan.period} Plan</span>
                    <Badge tone="success" dot>Active</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Effective from: {plan.effectiveFrom} · Installments: {plan.installmentOptions.join(", ")}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">{plan.currency}</span>
                    <p className="text-xl font-bold tabular-nums text-foreground">
                      {plan.price.toLocaleString()}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => openEditor(plan)} className="h-8 text-xs">
                    <Edit2 className="h-3 w-3" /> Edit Price
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Private Accounts Card */}
        <Card className="flex flex-col p-6 border-primary/40 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Lock className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-bold text-foreground">Private Account Plans</h2>
                <p className="text-xs text-muted-foreground">VIP matchmaking, incognito browsing, and discreet dating</p>
              </div>
            </div>
            <Badge tone="info">VIP Private Tier</Badge>
          </div>

          <div className="mt-5 space-y-4 flex-1">
            {privatePlans.map((plan) => (
              <div
                key={plan.period}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary-soft/30 p-4 transition-colors hover:border-primary/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold capitalize text-foreground">{plan.period} Plan</span>
                    <Badge tone="success" dot>Active</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Effective from: {plan.effectiveFrom} · Installments: {plan.installmentOptions.join(", ")}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">{plan.currency}</span>
                    <p className="text-xl font-bold tabular-nums text-primary">
                      {plan.price.toLocaleString()}
                    </p>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => openEditor(plan)} className="h-8 text-xs">
                    <Edit2 className="h-3 w-3" /> Edit Price
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Installment Payment Schedules Configuration */}
      <Card className="p-6">
        <CardHeader
          title="Installment Schedule Configuration"
          description="A subscription's billing period and its installment schedule are managed separately"
        />
        <div className="grid gap-4 sm:grid-cols-3 pt-2">
          <div className="rounded-xl border border-border bg-surface p-4">
            <span className="text-xs font-semibold text-muted-foreground">Yearly Installment Rule</span>
            <p className="mt-1 text-sm font-bold text-foreground">4 Installments (Quarterly)</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Example: RWF 120,000 paid in 4 equal installments of RWF 30,000 every 3 months.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <span className="text-xs font-semibold text-muted-foreground">Initial Payment to Activate</span>
            <p className="mt-1 text-sm font-bold text-success">25% (Installment 1)</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Paid features unlock immediately after the first successful installment.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <span className="text-xs font-semibold text-muted-foreground">Overdue Grace Window</span>
            <p className="mt-1 text-sm font-bold text-warning">5 Days Grace Period</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Member retains access during grace period; features restrict only after day 5.
            </p>
          </div>
        </div>
      </Card>

      {/* Price Change Audit Trail */}
      <Card>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Price Change History & Audit Trail</h2>
          </div>
          <Badge tone="neutral">{history.length} changes logged</Badge>
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Account Tier</Th>
              <Th>Billing Period</Th>
              <Th>Previous Price</Th>
              <Th>New Configured Price</Th>
              <Th>Effective From</Th>
              <Th>Changed By</Th>
              <Th>Reason / Justification</Th>
              <Th>Timestamp</Th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id}>
                <Td>
                  <Badge tone={h.accountType === "private" ? "info" : "neutral"}>
                    {h.accountType === "private" ? "Private" : "Public"}
                  </Badge>
                </Td>
                <Td className="capitalize font-semibold text-foreground">{h.period}</Td>
                <Td className="tabular-nums font-mono text-muted-foreground line-through">
                  {h.currency} {h.oldPrice.toLocaleString()}
                </Td>
                <Td className="tabular-nums font-mono font-bold text-foreground">
                  {h.currency} {h.newPrice.toLocaleString()}
                </Td>
                <Td className="text-xs font-medium text-foreground">{h.effectiveDate}</Td>
                <Td className="text-xs text-muted-foreground font-semibold">{h.changedBy}</Td>
                <Td className="text-xs text-muted-foreground max-w-xs truncate">{h.reason}</Td>
                <Td className="text-xs text-muted-foreground tabular-nums">
                  {new Date(h.changedAt).toLocaleDateString()}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {/* Price Editor Modal */}
      {editingPlan && (
        <Dialog
          open={!!editingPlan}
          onClose={() => setEditingPlan(null)}
          title={`Configure ${editingPlan.accountType.toUpperCase()} ${editingPlan.period.toUpperCase()} Price`}
          description="Adjust subscription pricing. Changes apply to future subscriptions and renewals only."
        >
          <form onSubmit={handlePriceSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-foreground">Current Price</label>
              <p className="mt-1 font-mono text-lg font-bold text-muted-foreground">
                {editingPlan.currency} {editingPlan.price.toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">
                New Price ({editingPlan.currency})
              </label>
              <input
                type="number"
                required
                min={1}
                value={editPrice}
                onChange={(e) => setEditPrice(Number(e.target.value))}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-input px-3 text-sm font-semibold tabular-nums text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">Effective Date</label>
              <input
                type="date"
                required
                value={editEffectiveDate}
                onChange={(e) => setEditEffectiveDate(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">
                Change Rationale (Required for Audit Trail)
              </label>
              <textarea
                required
                rows={3}
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="Document the commercial justification for this pricing change..."
                className="mt-1 w-full rounded-xl border border-border bg-input p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="secondary" onClick={() => setEditingPlan(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isPending}>
                Publish Pricing Change
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}

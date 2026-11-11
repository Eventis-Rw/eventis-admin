"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { Check, CreditCard, Pencil, Plus, Save, Ticket, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Dialog } from "@/components/ui/overlay";
import {
  ORGANISER_PLANS_STORAGE_KEY,
  defaultOrganiserCatalog,
  formatPlanMoney,
  organiserPurchase,
  planEntitlement,
  planQuantity,
  validateOrganiserCatalog,
  validateOrganiserPlan,
  type OrganiserCatalog,
  type OrganiserPlan,
  type PlanInterval,
} from "@/lib/organiser-plans";

const CHANGE_EVENT = "eventis-organiser-plans-change";
const textAreaClass =
  "min-h-24 w-full rounded-xl border border-border bg-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring";
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}
function snapshot() {
  try {
    return localStorage.getItem(ORGANISER_PLANS_STORAGE_KEY);
  } catch {
    return null;
  }
}
function subscribe(listener: () => void) {
  const storage = (event: StorageEvent) => {
    if (event.key === ORGANISER_PLANS_STORAGE_KEY || event.key === null)
      listener();
  };
  window.addEventListener("storage", storage);
  window.addEventListener(CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener("storage", storage);
    window.removeEventListener(CHANGE_EVENT, listener);
  };
}
const serverSnapshot = () => null;

export function OrganiserPlans() {
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const loaded = useMemo(() => {
    if (!raw) return { catalog: defaultOrganiserCatalog(), invalid: false };
    try {
      const catalog: OrganiserCatalog = JSON.parse(raw);
      validateOrganiserCatalog(catalog);
      return { catalog, invalid: false };
    } catch {
      return { catalog: defaultOrganiserCatalog(), invalid: true };
    }
  }, [raw]);
  const save = (catalog: OrganiserCatalog) => {
    setMessage("");
    setError("");
    try {
      validateOrganiserCatalog(catalog);
      localStorage.setItem(
        ORGANISER_PLANS_STORAGE_KEY,
        JSON.stringify(catalog),
      );
      window.dispatchEvent(new Event(CHANGE_EVENT));
      setMessage(
        "Plans saved. The new prices and availability apply to all organiser purchases in this preview.",
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Plan settings could not be saved in this browser.",
      );
    }
  };
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Eventis · Organisers
          </p>
          <h1 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            Plans & pricing
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Set platform-wide prices for single posts, post bundles and
            organiser subscriptions.
          </p>
        </div>
        <Link
          href="/eventis/installments"
          className={buttonVariants({ variant: "secondary" })}
        >
          Manage installments
        </Link>
      </header>
      <p className="rounded-xl border border-primary/10 bg-info-soft px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        Frontend demo · Settings are saved in this browser and used by the
        organiser checkout preview. The mobile app keeps its current prices
        until connected to these settings.
      </p>
      {loaded.invalid && (
        <p role="alert" className="rounded-xl bg-warning-soft p-3 text-sm">
          Saved plan settings could not be loaded. Original prices are shown.
          Save to replace the invalid settings.
        </p>
      )}
      {message && (
        <p role="status" className="rounded-xl bg-success-soft p-3 text-sm">
          {message}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-destructive-soft p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      <CatalogEditor
        key={raw ?? "default"}
        initial={loaded.catalog}
        onSave={save}
      />
    </div>
  );
}
function CatalogEditor({
  initial,
  onSave,
}: {
  initial: OrganiserCatalog;
  onSave: (catalog: OrganiserCatalog) => void;
}) {
  const [draft, setDraft] = useState(() => structuredClone(initial));
  const [editing, setEditing] = useState<OrganiserPlan | null>(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [selectedId, setSelectedId] = useState(
    initial.plans.find((p) => p.active)?.id ?? initial.plans[0].id,
  );
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState(
    initial.payment_methods[0],
  );
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const selected =
    draft.plans.find((p) => p.id === selectedId) ?? draft.plans[0];
  const quantity = selected.prices.some((v) => v.quantity === selectedQuantity)
    ? selectedQuantity
    : selected.prices[0].quantity;
  const method = draft.payment_methods.includes(paymentMethod)
    ? paymentMethod
    : draft.payment_methods[0];
  let purchase: ReturnType<typeof organiserPurchase> | null = null;
  let previewError = "";
  try {
    purchase = organiserPurchase(draft, selected.id, quantity);
  } catch (e) {
    previewError =
      e instanceof Error ? e.message : "Unable to preview this plan.";
  }
  const filtered = draft.plans.filter(
    (p) =>
      (!search ||
        `${p.name} ${p.description}`
          .toLowerCase()
          .includes(search.toLowerCase())) &&
      (!type ||
        (type === "post" ? p.interval === "post" : p.interval !== "post")) &&
      (!status || p.active === (status === "active")),
  );
  const updatePlan = (plan: OrganiserPlan) =>
    setDraft((prev) => ({
      ...prev,
      plans: prev.plans.some((p) => p.id === plan.id)
        ? prev.plans.map((p) => (p.id === plan.id ? plan : p))
        : [...prev.plans, plan],
    }));
  const createPlan = () =>
    setEditing({
      id: `organiser_${crypto.randomUUID()}`,
      name: "",
      interval: "month",
      description: "",
      prices: [{ quantity: 1, total: 18000 }],
      features: ["Unlimited event listings"],
      badge: "",
      recommended: false,
      active: true,
    });
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div>
          <p className="text-sm font-semibold">
            {dirty ? "Unsaved plan changes" : "Platform-wide organiser plans"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Prices apply to every organiser choosing a plan. No individual
            customer assignment is needed.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            disabled={!dirty}
            onClick={() => setDraft(structuredClone(initial))}
          >
            Discard changes
          </Button>
          <Button onClick={() => onSave(draft)}>
            <Save className="h-4 w-4" />
            Save all plans
          </Button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Available plans",
            value: draft.plans.filter((p) => p.active).length,
            Icon: CreditCard,
          },
          {
            label: "Post pack options",
            value: draft.plans
              .filter((p) => p.active && p.interval === "post")
              .reduce((sum, p) => sum + p.prices.length, 0),
            Icon: Ticket,
          },
          {
            label: "Subscription plans",
            value: draft.plans.filter((p) => p.active && p.interval !== "post")
              .length,
            Icon: Check,
          },
        ].map(({ label, value, Icon }) => (
          <Card key={label} className="p-5">
            <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
              {label}
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">
              {value}
            </p>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader
          title="Organiser plans"
          description="Single posts and post packs have no expiry. Subscriptions allow unlimited event posting during the purchased period."
          action={
            <Button
              size="sm"
              disabled={draft.plans.length >= 50}
              onClick={createPlan}
            >
              <Plus className="h-4 w-4" />
              Create plan
            </Button>
          }
        />
        <div className="space-y-5 p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Search plans">
              <Input
                type="search"
                placeholder="Search by name or description"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Field>
            <Field label="Plan type">
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">All types</option>
                <option value="post">Single posts & bundles</option>
                <option value="subscription">Subscriptions</option>
              </Select>
            </Field>
            <Field label="Availability">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All plans</option>
                <option value="active">Available</option>
                <option value="inactive">Unavailable</option>
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {filtered.map((plan) => (
              <article
                key={plan.id}
                className={`flex min-w-0 flex-col gap-5 rounded-2xl border p-5 transition-shadow hover:shadow-card ${plan.recommended ? "border-primary/35 bg-primary-soft/25 ring-1 ring-primary/10" : "border-border bg-card"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold tracking-tight">
                        {plan.name}
                      </h2>
                      <Badge tone={plan.active ? "success" : "neutral"}>
                        {plan.active ? "Available" : "Unavailable"}
                      </Badge>
                      {plan.badge && <Badge tone="info">{plan.badge}</Badge>}
                      {plan.recommended && (
                        <Badge tone="warning">Recommended</Badge>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditing(structuredClone(plan))}
                    aria-label={`Edit ${plan.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {plan.prices.map((v) => (
                    <span
                      key={v.quantity}
                      className="min-w-28 rounded-xl border border-border bg-surface px-3.5 py-3 text-sm"
                    >
                      <strong className="block text-lg font-semibold tracking-tight tabular-nums">
                        {formatPlanMoney(v.total)}
                      </strong>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {planQuantity(plan, v.quantity)}
                      </span>
                    </span>
                  ))}
                </div>
                <ul className="space-y-1.5">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={plan.active}
                      onChange={(e) =>
                        updatePlan({ ...plan, active: e.target.checked })
                      }
                    />
                    Available to organisers
                  </label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedId(plan.id);
                      setSelectedQuantity(plan.prices[0].quantity);
                      document
                        .getElementById("organiser-plan-preview")
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                    }}
                  >
                    Preview plan
                  </Button>
                </div>
              </article>
            ))}
          </div>
          {!filtered.length && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No plans match these filters.
            </p>
          )}
        </div>
      </Card>
      <Card>
        <CardHeader
          title="Checkout payment methods"
          description="Available to all organiser purchases."
        />
        <fieldset className="flex flex-wrap gap-5 p-5">
          <legend className="sr-only">Supported payment methods</legend>
          {(
            [
              ["mtn_momo", "MTN Mobile Money"],
              ["airtel_money", "Airtel Money"],
            ] as const
          ).map(([id, name]) => (
            <label key={id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.payment_methods.includes(id)}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    payment_methods: e.target.checked
                      ? [...draft.payment_methods, id]
                      : draft.payment_methods.filter((m) => m !== id),
                  })
                }
              />
              {name}
            </label>
          ))}
        </fieldset>
      </Card>
      <Card id="organiser-plan-preview">
        <CardHeader
          title="Organiser checkout preview"
          description={
            dirty
              ? "Shows your unsaved draft. Save all plans to apply the new rates."
              : "Shows the currently saved plan prices and availability."
          }
        />
        <div className="space-y-5 p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Preview plan">
              <Select
                value={selected.id}
                onChange={(e) => {
                  setSelectedId(e.target.value);
                  setSelectedQuantity(1);
                }}
              >
                {draft.plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.active ? "" : " (unavailable)"}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Post quantity or duration">
              <Select
                value={quantity}
                onChange={(e) => setSelectedQuantity(Number(e.target.value))}
              >
                {selected.prices.map((v) => (
                  <option key={v.quantity} value={v.quantity}>
                    {planQuantity(selected, v.quantity)} ·{" "}
                    {formatPlanMoney(v.total)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Payment method">
              <Select
                value={method ?? ""}
                onChange={(e) =>
                  setPaymentMethod(
                    e.target
                      .value as OrganiserCatalog["payment_methods"][number],
                  )
                }
              >
                {!draft.payment_methods.length && (
                  <option value="">No payment method selected</option>
                )}
                {draft.payment_methods.map((m) => (
                  <option key={m} value={m}>
                    {m === "mtn_momo" ? "MTN Mobile Money" : "Airtel Money"}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          {previewError && (
            <p role="alert" className="rounded-xl bg-warning-soft p-3 text-sm">
              {previewError}
            </p>
          )}
          {purchase && (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-3 rounded-xl border border-border p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {purchase.plan.name}
                  </h3>
                  {purchase.plan.badge && (
                    <Badge tone="info">{purchase.plan.badge}</Badge>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {purchase.plan.description}
                </p>
                <p className="text-sm font-medium">{purchase.entitlement}</p>
                <ul className="space-y-2">
                  {purchase.plan.features.map((f, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col justify-center rounded-xl bg-muted p-5">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Total due at checkout
                </p>
                <p
                  className="mt-2 text-3xl font-bold tabular-nums"
                  data-testid="checkout-total"
                >
                  {formatPlanMoney(purchase.total)}
                </p>
                <p className="mt-2 text-sm">
                  {planQuantity(purchase.plan, purchase.quantity)} · One payment
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {method
                    ? `Pay with ${method === "mtn_momo" ? "MTN Mobile Money" : "Airtel Money"}.`
                    : "Enable a payment method to offer this plan at checkout."}
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                  Preview only. No payment is taken.
                </p>
                {dirty ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Save all plans before setting up installments at this price.
                  </p>
                ) : (
                  <Link
                    className={buttonVariants({
                      variant: "secondary",
                      className: "mt-4",
                    })}
                    href={`/eventis/installments?product=${encodeURIComponent(purchase.plan.id)}&quantity=${purchase.quantity}`}
                  >
                    Set up installments for this purchase
                  </Link>
                )}
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            These are organiser publishing fees. Ticket prices and payments for
            attending events remain organiser-controlled.
          </p>
        </div>
      </Card>
      {editing && (
        <PlanEditor
          plan={editing}
          onClose={() => setEditing(null)}
          onSave={(p) => {
            updatePlan(p);
            setEditing(null);
            setSelectedId(p.id);
            setSelectedQuantity(p.prices[0].quantity);
          }}
        />
      )}
    </div>
  );
}
function PlanEditor({
  plan,
  onClose,
  onSave,
}: {
  plan: OrganiserPlan;
  onClose: () => void;
  onSave: (plan: OrganiserPlan) => void;
}) {
  const [draft, setDraft] = useState(plan);
  const [features, setFeatures] = useState(plan.features.join("\n"));
  const [error, setError] = useState("");
  return (
    <Dialog
      open
      onClose={onClose}
      title={plan.name ? `Edit ${plan.name}` : "Create organiser plan"}
      description="Prices apply to all organisers choosing this plan."
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const next = {
            ...draft,
            name: draft.name.trim(),
            features: features
              .split("\n")
              .map((f) => f.trim())
              .filter(Boolean),
          };
          try {
            validateOrganiserPlan(next);
            onSave(next);
          } catch (e) {
            setError(
              e instanceof Error ? e.message : "Review the plan settings.",
            );
          }
        }}
      >
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Field label="Plan name">
          <Input
            value={draft.name}
            required
            maxLength={120}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </Field>
        <Field label="Billing period">
          <Select
            value={draft.interval}
            onChange={(e) =>
              setDraft({ ...draft, interval: e.target.value as PlanInterval })
            }
          >
            <option value="post">Per post / post bundle</option>
            <option value="month">Monthly</option>
            <option value="quarter">Quarterly (3 months)</option>
            <option value="year">Yearly</option>
          </Select>
        </Field>
        <Field label="Description">
          <textarea
            className={textAreaClass}
            value={draft.description}
            maxLength={1000}
            onChange={(e) =>
              setDraft({ ...draft, description: e.target.value })
            }
          />
        </Field>
        <fieldset className="space-y-3">
          <legend className="mb-2 text-sm font-semibold">
            {draft.interval === "post"
              ? "Single-post and bundle prices"
              : "Subscription durations and prices"}
          </legend>
          {draft.prices.map((v, i) => (
            <div key={i} className="flex items-end gap-2">
              <Field
                label={
                  draft.interval === "post"
                    ? `Posts (option ${i + 1})`
                    : `Duration in ${draft.interval}s (option ${i + 1})`
                }
              >
                <Input
                  required
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={v.quantity}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      prices: draft.prices.map((p, index) =>
                        index === i
                          ? { ...p, quantity: Number(e.target.value) }
                          : p,
                      ),
                    })
                  }
                />
              </Field>
              <Field label={`Total price (RWF, option ${i + 1})`}>
                <Input
                  required
                  type="number"
                  min="1"
                  max="1000000000"
                  step="1"
                  value={v.total}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      prices: draft.prices.map((p, index) =>
                        index === i
                          ? { ...p, total: Number(e.target.value) }
                          : p,
                      ),
                    })
                  }
                />
              </Field>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Remove price option ${i + 1}`}
                disabled={draft.prices.length === 1}
                onClick={() =>
                  setDraft({
                    ...draft,
                    prices: draft.prices.filter((_, index) => index !== i),
                  })
                }
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            size="sm"
            variant="secondary"
            disabled={draft.prices.length >= 20}
            onClick={() => {
              const used = new Set(draft.prices.map((v) => v.quantity));
              const quantity = Array.from(
                { length: 100 },
                (_, i) => i + 1,
              ).find((v) => !used.has(v))!;
              setDraft({
                ...draft,
                prices: [
                  ...draft.prices,
                  {
                    quantity,
                    total: Math.min(1e9, draft.prices[0].total * quantity),
                  },
                ],
              });
            }}
          >
            <Plus className="h-4 w-4" />
            Add price option
          </Button>
          <p className="text-xs text-muted-foreground">
            Enter the exact total for each option. A two-post pack can cost less
            than two separate posts. All prices use whole Rwandan francs.
          </p>
        </fieldset>
        <Field label="Benefits (one per line)">
          <textarea
            className={textAreaClass}
            maxLength={4000}
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
          />
        </Field>
        <Field label="Badge">
          <Input
            value={draft.badge}
            maxLength={80}
            placeholder="e.g. Popular"
            onChange={(e) => setDraft({ ...draft, badge: e.target.value })}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.recommended}
            onChange={(e) =>
              setDraft({ ...draft, recommended: e.target.checked })
            }
          />
          Recommend this plan
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.active}
            onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
          />
          Available to organisers
        </label>
        <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
          {planEntitlement(draft, draft.prices[0].quantity || 1)}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            <Check className="h-4 w-4" />
            Update draft
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Review the checkout preview, then save all plans to apply your
          changes.
        </p>
      </form>
    </Dialog>
  );
}

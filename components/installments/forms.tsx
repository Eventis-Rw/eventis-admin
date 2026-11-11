"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Table, Td, Th } from "@/components/ui/table";
import { money, preview } from "@/lib/installments/engine";
import {
  DEFAULT_TERMS,
  type Command,
  type Customer,
  type RepaymentPlan,
  type Terms,
} from "@/lib/installments/types";
import {
  organiserPurchase,
  planQuantity,
  type OrganiserCatalog,
} from "@/lib/organiser-plans";

export type Run = (command: Command, message: string) => boolean;
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}
export function TermsEditor({
  terms,
  onChange,
  disabled = false,
}: {
  terms: Terms;
  onChange: (terms: Terms) => void;
  disabled?: boolean;
}) {
  const numeric = (
    key: keyof Terms,
    label: string,
    min: number,
    max: number,
    step = "1",
  ) => (
    <Field label={label}>
      <Input
        type="number"
        min={min}
        max={max}
        step={step}
        required
        value={terms[key] as number}
        onChange={(e) => onChange({ ...terms, [key]: Number(e.target.value) })}
      />
    </Field>
  );
  return (
    <fieldset disabled={disabled} className="space-y-4 disabled:opacity-70">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Payment frequency">
          <Select
            value={terms.frequency}
            onChange={(e) =>
              onChange({
                ...terms,
                frequency: e.target.value as Terms["frequency"],
              })
            }
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </Select>
        </Field>
        {numeric("interval", "Interval (frequency units)", 1, 52)}
        {numeric("installment_count", "Installment count", 1, 120)}
        {numeric(
          "initial_payment",
          "Initial payment (fixed amount)",
          0,
          1e9,
          "any",
        )}
        {numeric("interest", "Flat interest (%)", 0, 100, "any")}
        {numeric("late_fee", "Default late fee (fixed amount)", 0, 1e9, "any")}
        {numeric("grace_period_days", "Grace period (days)", 0, 365)}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={terms.partial_payment}
          onChange={(e) =>
            onChange({ ...terms, partial_payment: e.target.checked })
          }
        />
        Allow partial payments
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={terms.early_payment}
          onChange={(e) =>
            onChange({ ...terms, early_payment: e.target.checked })
          }
        />
        Allow early payments
      </label>
    </fieldset>
  );
}
export function RepaymentPlanForm({
  plan,
  run,
  onDone,
}: {
  plan?: RepaymentPlan;
  run: Run;
  onDone: () => void;
}) {
  const [terms, setTerms] = useState(plan?.terms ?? { ...DEFAULT_TERMS });
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        if (
          run(
            {
              type: "save_plan",
              id: plan?.id,
              name: String(data.get("name")),
              description: String(data.get("description")),
              terms,
            },
            "Repayment plan saved. Existing agreements retain their terms.",
          )
        )
          onDone();
      }}
    >
      <Field label="Repayment plan name">
        <Input name="name" required maxLength={120} defaultValue={plan?.name} />
      </Field>
      <Field label="Description">
        <Input
          name="description"
          required
          maxLength={1000}
          defaultValue={plan?.description}
        />
      </Field>
      <TermsEditor terms={terms} onChange={setTerms} />
      <p className="text-xs text-muted-foreground">
        Initial payment and late fee are fixed amounts in the purchase currency.
        Interest applies once to the balance after the initial payment.
      </p>
      <Button type="submit">Save repayment plan</Button>
    </form>
  );
}
export function PreviewRows({
  rows,
  currency,
}: {
  rows: ReturnType<typeof preview>;
  currency: string;
}) {
  return (
    <Table>
      <caption className="sr-only">Calculated payment schedule</caption>
      <thead>
        <tr>
          <Th>Payment</Th>
          <Th>Due date</Th>
          <Th>Amount</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((s, i) => (
          <tr key={i}>
            <Td>{s.initial ? "Initial payment" : `Installment ${s.number}`}</Td>
            <Td>{s.due_date}</Td>
            <Td>{money(s.amount, currency)}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
export function AssignmentForm({
  catalog,
  plans,
  customers,
  today,
  productId,
  quantity: initialQuantity,
  run,
}: {
  catalog: OrganiserCatalog;
  plans: RepaymentPlan[];
  customers: Customer[];
  today: string;
  productId?: string;
  quantity: number;
  run: Run;
}) {
  const [selectedId, setSelectedId] = useState(
    productId ?? catalog.plans.find((p) => p.active)?.id ?? "",
  );
  const [quantity, setQuantity] = useState(initialQuantity);
  const [repayment, setRepayment] = useState(
    plans.find((p) => p.active)?.id ?? "",
  );
  const [customTerms, setCustomTerms] = useState<Terms>({ ...DEFAULT_TERMS });
  const [customer, setCustomer] = useState("");
  const [start, setStart] = useState(today);
  const [customTotal, setCustomTotal] = useState("");
  const [customCurrency, setCustomCurrency] = useState("RWF");
  const [customName, setCustomName] = useState("Custom organiser purchase");
  const [success, setSuccess] = useState(false);
  const product = catalog.plans.find((p) => p.id === selectedId);
  const selectedQuantity = product?.prices.some((p) => p.quantity === quantity)
    ? quantity
    : (product?.prices[0].quantity ?? 1);
  const template = plans.find((p) => p.id === repayment && p.active);
  const terms = template?.terms ?? customTerms;
  let amount = Number(customTotal);
  let currency = customCurrency;
  let purchaseName = customName;
  let error = "";
  if (selectedId)
    try {
      const purchase = organiserPurchase(catalog, selectedId, selectedQuantity);
      amount = purchase.total;
      currency = catalog.currency;
      purchaseName = purchase.plan.name;
    } catch (e) {
      error = e instanceof Error ? e.message : "Choose an organiser product.";
    }
  let rows: ReturnType<typeof preview> = [];
  if (!error && amount)
    try {
      rows = preview(terms, amount, currency, start);
    } catch (e) {
      error = e instanceof Error ? e.message : "Review the payment terms.";
    }
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!rows.length) return;
        if (
          run(
            {
              type: "assign",
              customer_id: customer,
              product_id: selectedId || null,
              product_name: purchaseName,
              quantity: selectedId ? selectedQuantity : 1,
              plan_id: template?.id ?? null,
              total_amount: amount,
              currency,
              start_date: start,
              terms,
            },
            "Installment agreement created with the displayed schedule.",
          )
        )
          setSuccess(true);
      }}
    >
      {success && (
        <p role="status" className="rounded-xl bg-success-soft p-3 text-sm">
          Agreement created. Open Agreements to manage its payments.
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Customer / organiser">
          <Select
            required
            value={customer}
            onChange={(e) => {
              setCustomer(e.target.value);
              setSuccess(false);
            }}
          >
            <option value="">Select a customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · {c.phone}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Organiser product">
          <Select
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value);
              setQuantity(1);
              setSuccess(false);
            }}
          >
            <option value="">Custom purchase</option>
            {catalog.plans.map((p) => (
              <option key={p.id} disabled={!p.active} value={p.id}>
                {p.name}
                {p.active ? "" : " (unavailable)"}
              </option>
            ))}
          </Select>
        </Field>
        {product && (
          <Field label="Post quantity / subscription duration">
            <Select
              value={selectedQuantity}
              onChange={(e) => {
                setQuantity(Number(e.target.value));
                setSuccess(false);
              }}
            >
              {product.prices.map((v) => (
                <option key={v.quantity} value={v.quantity}>
                  {planQuantity(product, v.quantity)} ·{" "}
                  {money(v.total, catalog.currency)}
                </option>
              ))}
            </Select>
          </Field>
        )}
        <Field label="Repayment plan">
          <Select
            value={repayment}
            onChange={(e) => {
              setRepayment(e.target.value);
              setSuccess(false);
            }}
          >
            <option value="">Custom repayment terms</option>
            {plans
              .filter((p) => p.active)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </Select>
        </Field>
        <Field label="Start date">
          <Input
            type="date"
            required
            min="2000-01-01"
            max="2100-12-31"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </Field>
        {selectedId ? (
          <Field label="Purchase price">
            <Input readOnly value={error ? "" : money(amount, currency)} />
          </Field>
        ) : (
          <>
            <Field label="Purchase name">
              <Input
                required
                maxLength={120}
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </Field>
            <Field label="Total amount">
              <Input
                required
                type="number"
                min="0.001"
                max="1000000000"
                step="any"
                value={customTotal}
                onChange={(e) => {
                  setCustomTotal(e.target.value);
                  setSuccess(false);
                }}
              />
            </Field>
            <Field label="Currency">
              <Select
                value={customCurrency}
                onChange={(e) => setCustomCurrency(e.target.value)}
              >
                {["RWF", "USD", "EUR", "KES", "UGX", "KWD"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
          </>
        )}
      </div>
      <details open={!template} className="rounded-xl border border-border p-4">
        <summary className="cursor-pointer text-sm font-semibold">
          {template
            ? "View repayment terms"
            : "Configure custom repayment terms"}
        </summary>
        <div className="mt-4">
          <TermsEditor
            terms={terms}
            onChange={setCustomTerms}
            disabled={!!template}
          />
        </div>
      </details>
      <p className="text-sm text-muted-foreground">
        The initial payment is due on the start date. When there is an initial
        payment, regular installments start one interval later; otherwise the
        first installment is due on the start date. Rounding differences are
        distributed across the schedule.
      </p>
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-destructive-soft p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {rows.length > 0 ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Purchase price" value={money(amount, currency)} />
            <Metric
              label="Initial payment"
              value={money(terms.initial_payment, currency)}
            />
            <Metric
              label="Total with interest"
              value={money(
                rows.reduce((n, s) => n + s.amount, 0),
                currency,
              )}
            />
          </div>
          <div className="rounded-xl border border-border">
            <PreviewRows rows={rows} currency={currency} />
          </div>
        </>
      ) : (
        !error && (
          <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
            Enter a purchase amount to preview the schedule.
          </p>
        )
      )}
      <Button type="submit" disabled={!rows.length || !customer || success}>
        Confirm installment agreement
      </Button>
    </form>
  );
}
export function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-card">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-3 break-words text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
    </div>
  );
}

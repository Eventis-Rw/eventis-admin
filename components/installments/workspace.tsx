"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Download, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Dialog, Drawer } from "@/components/ui/overlay";
import { Table, Td, Th } from "@/components/ui/table";
import { saveBrowserRecord, useBrowserRecord } from "@/lib/browser-record";
import {
  agreementStatus,
  applyCommand,
  balance,
  businessDate,
  check,
  initialInstallmentStore,
  INSTALLMENTS_STORAGE_KEY,
  money,
  paid,
  parseInstallmentStore,
  scheduleStatus,
} from "@/lib/installments/engine";
import type {
  Customer,
  RepaymentPlan,
  Schedule,
} from "@/lib/installments/types";
import {
  defaultOrganiserCatalog,
  ORGANISER_PLANS_STORAGE_KEY,
  validateOrganiserCatalog,
  type OrganiserCatalog,
} from "@/lib/organiser-plans";
import {
  AssignmentForm,
  Field,
  Metric,
  RepaymentPlanForm,
  type Run,
} from "./forms";
import { OperationDialog, type Operation } from "./operation-dialog";

const tabs = [
  "Overview",
  "Repayment plans",
  "Preview & assign",
  "Agreements",
  "Payments",
  "Schedules",
  "Reminders",
  "Reports",
] as const;
type Tab = (typeof tabs)[number];
function readCatalog(raw: string | null): OrganiserCatalog {
  const value = raw ? JSON.parse(raw) : defaultOrganiserCatalog();
  validateOrganiserCatalog(value);
  return value;
}
function Status({ value }: { value: string }) {
  return (
    <Badge
      tone={
        ["paid", "completed", "active", "recorded"].includes(value)
          ? "success"
          : value === "overdue"
            ? "danger"
            : "neutral"
      }
    >
      {value.replaceAll("_", " ")}
    </Badge>
  );
}
function Empty({
  children = "No records match these filters.",
}: {
  children?: React.ReactNode;
}) {
  return (
    <p className="p-8 text-center text-sm text-muted-foreground">{children}</p>
  );
}

export function InstallmentWorkspace({
  customers,
  actor,
  today,
  productId,
  quantity,
}: {
  customers: Customer[];
  actor: string;
  today: string;
  productId?: string;
  quantity: number;
}) {
  const raw = useBrowserRecord(INSTALLMENTS_STORAGE_KEY);
  const catalogRaw = useBrowserRecord(
    ORGANISER_PLANS_STORAGE_KEY,
    "eventis-organiser-plans-change",
  );
  const loaded = useMemo(() => {
    try {
      return { store: parseInstallmentStore(raw), error: "" };
    } catch {
      return {
        store: initialInstallmentStore(),
        error:
          "Saved installment records could not be loaded. Existing browser data has been preserved; changes are blocked until it can be recovered.",
      };
    }
  }, [raw]);
  const catalogData = useMemo(() => {
    try {
      return { catalog: readCatalog(catalogRaw), error: "" };
    } catch {
      return {
        catalog: defaultOrganiserCatalog(),
        error:
          "Saved organiser pricing could not be loaded. Correct it in Plans & pricing before assigning a product.",
      };
    }
  }, [catalogRaw]);
  const store = loaded.store;
  const catalog = catalogData.catalog;
  const [tab, setTab] = useState<Tab>(
    productId ? "Preview & assign" : "Overview",
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [planModal, setPlanModal] = useState<RepaymentPlan | "new" | null>(
    null,
  );
  const [operation, setOperation] = useState<Operation | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [customerFilter, setCustomerFilter] = useState("");
  const [status, setStatus] = useState("");
  const [frequency, setFrequency] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const customerName = (id: string) =>
    customers.find((c) => c.id === id)?.name ?? id;
  const aFor = (id: string) => store.agreements.find((a) => a.id === id)!;
  const run: Run = (command, success) => {
    setError("");
    setMessage("");
    try {
      check(!loaded.error, loaded.error);
      const latest = parseInstallmentStore(
        localStorage.getItem(INSTALLMENTS_STORAGE_KEY),
      );
      const prices =
        command.type === "assign" && command.product_id
          ? readCatalog(localStorage.getItem(ORGANISER_PLANS_STORAGE_KEY))
          : catalog;
      const next = applyCommand(latest, command, customers, prices, actor);
      saveBrowserRecord(INSTALLMENTS_STORAGE_KEY, next);
      setMessage(success);
      return true;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not save records in this browser.",
      );
      return false;
    }
  };
  const open = (op: Operation) => {
    setError("");
    setOperation(op);
  };
  const changeTab = (next: Tab) => {
    setTab(next);
    setStatus("");
    setError("");
    setMessage("");
  };
  const inRange = (date: string) =>
    (!from || businessDate(date) >= from) && (!to || businessDate(date) <= to);
  const baseAgreements = store.agreements.filter(
    (a) =>
      (!customerFilter || a.customer_id === customerFilter) &&
      (!frequency || a.terms.frequency === frequency),
  );
  const ids = new Set(baseAgreements.map((a) => a.id));
  const reportAgreements = baseAgreements.filter(
    (a) => !status || agreementStatus(store, a, today) === status,
  );
  const reportIds = new Set(reportAgreements.map((a) => a.id));
  const agreements = reportAgreements.filter((a) => inRange(a.start_date));
  const schedules = store.schedules.filter(
    (s) =>
      !s.voided &&
      ids.has(s.agreement_id) &&
      inRange(s.due_date) &&
      (!status || scheduleStatus(store, s, today) === status),
  );
  const paymentStatus = (p: (typeof store.payments)[number]) =>
    p.refunded >= p.amount
      ? "refunded"
      : p.refunded > 0
        ? "partially_refunded"
        : "recorded";
  const payments = store.payments.filter(
    (p) =>
      ids.has(p.agreement_id) &&
      inRange(p.created_at) &&
      (!status || paymentStatus(p) === status),
  );
  const refunds = store.refunds.filter((r) => {
    const p = store.payments.find((p) => p.id === r.payment_id)!;
    return ids.has(p.agreement_id) && inRange(r.created_at);
  });
  const currencies = [
    ...new Set(reportAgreements.map((a) => a.currency)),
  ].sort();
  const totals = currencies.map((currency) => {
    const keys = new Set(
      reportAgreements.filter((a) => a.currency === currency).map((a) => a.id),
    );
    const rows = store.schedules.filter(
      (s) =>
        !s.voided &&
        keys.has(s.agreement_id) &&
        !aFor(s.agreement_id).cancelled &&
        inRange(s.due_date),
    );
    const gross = store.payments
      .filter((p) => keys.has(p.agreement_id) && inRange(p.created_at))
      .reduce((sum, p) => sum + p.amount, 0);
    const refunded = store.refunds
      .filter(
        (r) =>
          keys.has(
            store.payments.find((p) => p.id === r.payment_id)!.agreement_id,
          ) && inRange(r.created_at),
      )
      .reduce((sum, r) => sum + r.amount, 0);
    return {
      currency,
      gross,
      refunded,
      net: gross - refunded,
      outstanding: rows.reduce((sum, s) => sum + balance(store, s), 0),
      overdue: rows
        .filter((s) => scheduleStatus(store, s, today) === "overdue")
        .reduce((sum, s) => sum + balance(store, s), 0),
    };
  });
  const statuses =
    tab === "Schedules"
      ? ["upcoming", "due", "partial", "paid", "overdue", "cancelled"]
      : tab === "Payments"
        ? ["recorded", "partially_refunded", "refunded"]
        : ["active", "overdue", "completed", "cancelled"];
  const detail = store.agreements.find((a) => a.id === detailId);
  const clearFilters = () => {
    setCustomerFilter("");
    setStatus("");
    setFrequency("");
    setFrom("");
    setTo("");
  };
  const reportRows = store.schedules.filter(
    (s) => !s.voided && reportIds.has(s.agreement_id) && inRange(s.due_date),
  );
  const download = () => {
    const rows: (string | number)[][] = [
      [
        "Agreement",
        "Customer",
        "Product",
        "Currency",
        "Schedule",
        "Due date",
        "Amount",
        "Fee",
        "Net paid",
        "Outstanding",
        "Status",
      ],
    ];
    for (const s of reportRows) {
      const a = aFor(s.agreement_id);
      rows.push([
        a.id,
        customerName(a.customer_id),
        a.product_name,
        a.currency,
        s.id,
        s.due_date,
        s.amount,
        s.fee,
        paid(store, s),
        a.cancelled ? 0 : balance(store, s),
        scheduleStatus(store, s, today),
      ]);
    }
    const csv = rows
      .map((row) =>
        row
          .map((v) => {
            const value = String(v);
            return `"${(/^[\s]*[=+@-]|^[\t\r]/.test(value) ? "'" : "") + value.replaceAll('"', '""')}"`;
          })
          .join(","),
      )
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `eventis-installments-${today}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };
  const scheduleTable = (rows: Schedule[], actions = true) =>
    rows.length ? (
      <Table>
        <thead>
          <tr>
            <Th>Customer / product</Th>
            <Th>Payment / due date</Th>
            <Th>Amount / fee</Th>
            <Th>Net paid / balance</Th>
            <Th>Status</Th>
            {actions && <Th>Actions</Th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const a = aFor(s.agreement_id);
            const remaining = balance(store, s);
            return (
              <tr key={s.id}>
                <Td>
                  <p className="font-medium">{customerName(a.customer_id)}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.product_name}
                  </p>
                  <button
                    className="text-xs text-primary underline"
                    title={a.id}
                    onClick={() => setDetailId(a.id)}
                  >
                    {a.id.slice(0, 16)}
                  </button>
                </Td>
                <Td>
                  {s.initial ? "Initial payment" : `Installment #${s.number}`}
                  <p className="text-xs text-muted-foreground">{s.due_date}</p>
                  <p className="text-xs text-muted-foreground" title={s.id}>
                    {s.id.slice(0, 16)}
                  </p>
                </Td>
                <Td>
                  {money(s.amount, a.currency)}
                  <p className="text-xs text-muted-foreground">
                    Fee: {money(s.fee, a.currency)}
                  </p>
                </Td>
                <Td>
                  {money(paid(store, s), a.currency)}
                  <p className="text-xs text-muted-foreground">
                    Balance: {money(remaining, a.currency)}
                  </p>
                </Td>
                <Td>
                  <Status value={scheduleStatus(store, s, today)} />
                </Td>
                {actions && (
                  <Td>
                    {remaining > 0 && !a.cancelled && (
                      <div className="flex flex-wrap gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => open({ kind: "pay", id: s.id })}
                        >
                          Pay
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => open({ kind: "due_date", id: s.id })}
                        >
                          Adjust date
                        </Button>
                        {scheduleStatus(store, s, today) === "overdue" &&
                          !s.fee && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => open({ kind: "fee", id: s.id })}
                            >
                              Late fee
                            </Button>
                          )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => open({ kind: "notify", id: s.id })}
                        >
                          Remind
                        </Button>
                      </div>
                    )}
                  </Td>
                )}
              </tr>
            );
          })}
        </tbody>
      </Table>
    ) : (
      <Empty />
    );
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Eventis · Organiser repayments
          </p>
          <h1 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            Installment management
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Split an organiser plan purchase into scheduled payments and track
            the remaining balance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/eventis/plans"
            className={buttonVariants({ variant: "secondary" })}
          >
            Plans & pricing
          </Link>
          <Button onClick={() => changeTab("Preview & assign")}>
            <Plus className="h-4 w-4" />
            New agreement
          </Button>
        </div>
      </header>
      <p className="rounded-xl border border-primary/10 bg-info-soft px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        Frontend demo · Records are saved in this browser. Payments and refunds
        do not transfer funds; SMS and email reminders are simulated. Organiser
        pricing and repayment terms are separate settings.
      </p>
      {loaded.error && (
        <p
          role="alert"
          className="rounded-xl bg-destructive-soft p-3 text-sm text-destructive"
        >
          {loaded.error}
        </p>
      )}
      {catalogData.error && (
        <p role="alert" className="rounded-xl bg-warning-soft p-3 text-sm">
          {catalogData.error}
        </p>
      )}
      {message && (
        <p role="status" className="rounded-xl bg-success-soft p-3 text-sm">
          {message}
        </p>
      )}
      {error && !planModal && !operation && (
        <p
          role="alert"
          className="rounded-xl bg-destructive-soft p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      <ol
        aria-label="How organiser payments work"
        className="grid gap-3 sm:grid-cols-3"
      >
        {[
          {
            number: "01",
            title: "Product plan",
            description: "What the organiser buys and its price.",
          },
          {
            number: "02",
            title: "Repayment plan",
            description: "When they pay, including any initial payment.",
          },
          {
            number: "03",
            title: "Customer agreement",
            description: "Their saved price, schedule and balance.",
          },
        ].map((step) => (
          <li
            key={step.number}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-xs font-semibold tabular-nums text-primary">
              {step.number}
            </span>
            <div>
              <p className="text-sm font-semibold">{step.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <nav
        aria-label="Installment sections"
        className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-1.5 [scrollbar-width:thin]"
      >
        {tabs.map((item) => (
          <button
            key={item}
            aria-current={tab === item ? "page" : undefined}
            onClick={() => changeTab(item)}
            className={`whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium ${tab === item ? "bg-primary-soft text-primary shadow-sm ring-1 ring-primary/15" : "text-muted-foreground hover:bg-muted"}`}
          >
            {item}
          </button>
        ))}
      </nav>
      {["Overview", "Agreements", "Payments", "Schedules", "Reports"].includes(
        tab,
      ) && (
        <Card className="p-4">
          <div className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <Field label="Customer">
              <Select
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
              >
                <option value="">All customers</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Status">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All statuses</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s.replaceAll("_", " ")}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Frequency">
              <Select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="">All frequencies</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </Select>
            </Field>
            <Field label="From date">
              <Input
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => setFrom(e.target.value)}
              />
            </Field>
            <Field label="To date">
              <Input
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => setTo(e.target.value)}
              />
            </Field>
            <Button variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {tab === "Agreements"
              ? "Date range uses agreement start dates."
              : tab === "Payments"
                ? "Date range uses payment and refund recording dates. Payment status filters apply to the receipt table."
                : "Date range uses schedule due dates and receipt/refund recording dates independently. Balances reflect all receipts to date; cancelled agreements are excluded from balances."}{" "}
            Dates use Africa/Kigali.
          </p>
          {from && to && from > to && (
            <p role="alert" className="mt-2 text-sm text-destructive">
              From date must precede to date.
            </p>
          )}
        </Card>
      )}
      {(tab === "Overview" || tab === "Reports") && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Agreements" value={reportAgreements.length} />
            <Metric
              label="Completed"
              value={
                reportAgreements.filter(
                  (a) => agreementStatus(store, a, today) === "completed",
                ).length
              }
            />
            <Metric
              label="Overdue installments"
              value={
                reportRows.filter(
                  (s) => scheduleStatus(store, s, today) === "overdue",
                ).length
              }
            />
          </div>
          {totals.map((t) => (
            <Card key={t.currency}>
              <CardHeader
                title={`${t.currency} collections`}
                description="Currencies are reported separately."
              />
              <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5">
                <Metric
                  label="Gross collected"
                  value={money(t.gross, t.currency)}
                />
                <Metric
                  label="Refunded"
                  value={money(t.refunded, t.currency)}
                />
                <Metric
                  label="Net collected"
                  value={money(t.net, t.currency)}
                />
                <Metric
                  label="Outstanding"
                  value={money(t.outstanding, t.currency)}
                />
                <Metric label="Overdue" value={money(t.overdue, t.currency)} />
              </div>
            </Card>
          ))}
          {!totals.length && (
            <Card>
              <Empty>
                No agreements yet. Choose an organiser product and preview its
                installment schedule to get started.
              </Empty>
            </Card>
          )}
          <Card>
            <CardHeader
              title={
                tab === "Overview"
                  ? "Upcoming and overdue collections"
                  : "Customer payment history"
              }
              action={
                tab === "Reports" ? (
                  <Button size="sm" variant="secondary" onClick={download}>
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => changeTab("Schedules")}
                  >
                    All schedules
                  </Button>
                )
              }
            />
            {scheduleTable(
              tab === "Reports"
                ? reportRows
                : [...reportRows]
                    .filter(
                      (s) =>
                        !aFor(s.agreement_id).cancelled &&
                        balance(store, s) > 0,
                    )
                    .sort((a, b) => a.due_date.localeCompare(b.due_date))
                    .slice(0, 6),
              tab !== "Reports",
            )}
          </Card>
        </>
      )}
      {tab === "Repayment plans" && (
        <Card>
          <CardHeader
            title="Repayment plan templates"
            description="These control payment timing and fees. Product prices stay in Plans & pricing. Template changes apply to new agreements."
            action={
              <Button
                size="sm"
                onClick={() => {
                  setError("");
                  setPlanModal("new");
                }}
              >
                Create repayment plan
              </Button>
            }
          />
          <Table>
            <thead>
              <tr>
                <Th>Plan</Th>
                <Th>Timing</Th>
                <Th>Terms</Th>
                <Th>Payment options</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {store.plans.map((p) => (
                <tr key={p.id}>
                  <Td>
                    <p className="font-semibold">{p.name}</p>
                    <p className="max-w-xs text-xs text-muted-foreground">
                      {p.description}
                    </p>
                  </Td>
                  <Td>
                    {p.terms.frequency} · every {p.terms.interval}
                    <p className="text-xs text-muted-foreground">
                      {p.terms.installment_count} installments
                    </p>
                  </Td>
                  <Td>
                    Initial: {p.terms.initial_payment} · Interest:{" "}
                    {p.terms.interest}%
                    <p className="text-xs text-muted-foreground">
                      Late fee: {p.terms.late_fee} · Grace:{" "}
                      {p.terms.grace_period_days} days
                    </p>
                  </Td>
                  <Td>
                    Partial: {p.terms.partial_payment ? "Yes" : "No"}
                    <br />
                    Early: {p.terms.early_payment ? "Yes" : "No"}
                  </Td>
                  <Td>
                    <Status value={p.active ? "active" : "inactive"} />
                  </Td>
                  <Td>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setError("");
                          setPlanModal(p);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          run(
                            { type: "toggle_plan", id: p.id },
                            p.active
                              ? "Repayment plan deactivated."
                              : "Repayment plan activated.",
                          )
                        }
                      >
                        {p.active ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
      {tab === "Preview & assign" && (
        <Card>
          <CardHeader
            title="Preview and assign installments"
            description="Select an organiser product or custom purchase, then review all amounts and due dates before confirming."
          />
          <div className="p-5">
            <AssignmentForm
              catalog={catalog}
              plans={store.plans}
              customers={customers}
              today={today}
              productId={productId}
              quantity={quantity}
              run={run}
            />
          </div>
        </Card>
      )}
      {tab === "Agreements" && (
        <Card>
          <CardHeader
            title="Customer agreements"
            description="Purchase prices and repayment terms are preserved when pricing changes."
          />
          {agreements.length ? (
            <Table>
              <thead>
                <tr>
                  <Th>Customer / agreement</Th>
                  <Th>Purchase</Th>
                  <Th>Principal / balance</Th>
                  <Th>Repayment</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {agreements.map((a) => {
                  const remaining = store.schedules
                    .filter((s) => s.agreement_id === a.id)
                    .reduce((n, s) => n + balance(store, s), 0);
                  return (
                    <tr key={a.id}>
                      <Td>
                        <p className="font-semibold">
                          {customerName(a.customer_id)}
                        </p>
                        <p
                          className="text-xs text-muted-foreground"
                          title={a.id}
                        >
                          {a.id.slice(0, 16)}
                        </p>
                      </Td>
                      <Td>
                        {a.product_name}
                        <p className="text-xs text-muted-foreground">
                          Quantity: {a.quantity} ·{" "}
                          {a.product_id ? "Linked product" : "Custom purchase"}
                        </p>
                      </Td>
                      <Td>
                        {money(a.total_amount, a.currency)}
                        <p className="text-xs text-muted-foreground">
                          Balance:{" "}
                          {money(a.cancelled ? 0 : remaining, a.currency)}
                        </p>
                      </Td>
                      <Td>
                        {a.terms.frequency}
                        <p className="text-xs text-muted-foreground">
                          From {a.start_date}
                        </p>
                      </Td>
                      <Td>
                        <Status value={agreementStatus(store, a, today)} />
                      </Td>
                      <Td>
                        <div className="flex flex-wrap gap-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setDetailId(a.id)}
                          >
                            View
                          </Button>
                          {!a.cancelled && remaining > 0 && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  open({ kind: "revise", id: a.id })
                                }
                              >
                                Revise
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  open({ kind: "cancel", id: a.id })
                                }
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          ) : (
            <Empty />
          )}
        </Card>
      )}
      {tab === "Payments" && (
        <>
          <Card>
            <CardHeader
              title="Payment receipts"
              action={
                <Button size="sm" onClick={() => open({ kind: "pay" })}>
                  Record payment
                </Button>
              }
            />
            {payments.length ? (
              <Table>
                <thead>
                  <tr>
                    <Th>Customer / purchase</Th>
                    <Th>Reference / method</Th>
                    <Th>Date</Th>
                    <Th>Amount</Th>
                    <Th>Refunded</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {[...payments].reverse().map((p) => {
                    const a = aFor(p.agreement_id);
                    return (
                      <tr key={p.id}>
                        <Td>
                          {customerName(a.customer_id)}
                          <p className="text-xs text-muted-foreground">
                            {a.product_name}
                          </p>
                        </Td>
                        <Td>
                          {p.transaction_reference}
                          <p className="text-xs text-muted-foreground">
                            {p.payment_method}
                          </p>
                          <p
                            title={p.id}
                            className="text-xs text-muted-foreground"
                          >
                            {p.id.slice(0, 16)}
                          </p>
                        </Td>
                        <Td>{businessDate(p.created_at)}</Td>
                        <Td>{money(p.amount, a.currency)}</Td>
                        <Td>{money(p.refunded, a.currency)}</Td>
                        <Td>
                          <Status value={paymentStatus(p)} />
                        </Td>
                        <Td>
                          {p.refunded < p.amount && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => open({ kind: "refund", id: p.id })}
                            >
                              Refund
                            </Button>
                          )}
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            ) : (
              <Empty />
            )}
          </Card>
          <Card>
            <CardHeader
              title="Refund history"
              description="Filtered by customer, frequency and refund date."
            />
            {refunds.length ? (
              <Table>
                <thead>
                  <tr>
                    <Th>Reference</Th>
                    <Th>Date</Th>
                    <Th>Amount</Th>
                    <Th>Reason</Th>
                  </tr>
                </thead>
                <tbody>
                  {refunds.map((r) => {
                    const p = store.payments.find(
                      (p) => p.id === r.payment_id,
                    )!;
                    return (
                      <tr key={r.id}>
                        <Td>{p.transaction_reference}</Td>
                        <Td>{businessDate(r.created_at)}</Td>
                        <Td>
                          {money(r.amount, aFor(p.agreement_id).currency)}
                        </Td>
                        <Td>{r.reason}</Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            ) : (
              <Empty>No refunds recorded.</Empty>
            )}
          </Card>
        </>
      )}
      {tab === "Schedules" && (
        <Card>
          <CardHeader
            title="Payment schedules"
            description={`Today: ${today}. Fees can be applied manually after the grace period.`}
          />
          {scheduleTable(
            [...schedules].sort((a, b) => a.due_date.localeCompare(b.due_date)),
          )}
        </Card>
      )}
      {tab === "Reminders" && (
        <>
          <Card>
            <CardHeader
              title="Unpaid installments"
              description="Use Remind to select SMS, Email or both."
            />
            {scheduleTable(
              store.schedules.filter(
                (s) =>
                  !s.voided &&
                  !aFor(s.agreement_id).cancelled &&
                  balance(store, s) > 0,
              ),
            )}
          </Card>
          <Card>
            <CardHeader title="Reminder history" />
            {store.notices.length ? (
              <Table>
                <thead>
                  <tr>
                    <Th>Customer / product</Th>
                    <Th>Schedule</Th>
                    <Th>Type</Th>
                    <Th>Channels</Th>
                    <Th>Date</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {store.notices.map((n) => (
                    <tr key={n.id}>
                      <Td>
                        {customerName(aFor(n.agreement_id).customer_id)}
                        <p className="text-xs text-muted-foreground">
                          {aFor(n.agreement_id).product_name}
                        </p>
                      </Td>
                      <Td title={n.schedule_id}>
                        {n.schedule_id.slice(0, 16)}
                      </Td>
                      <Td>{n.type}</Td>
                      <Td>{n.channels.join(", ").toUpperCase()}</Td>
                      <Td>{businessDate(n.created_at)}</Td>
                      <Td>
                        <Status value={n.status} />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <Empty>No reminders simulated yet.</Empty>
            )}
          </Card>
        </>
      )}
      <Dialog
        open={!!planModal}
        title={
          planModal === "new" ? "Create repayment plan" : "Edit repayment plan"
        }
        onClose={() => setPlanModal(null)}
      >
        {error && (
          <p role="alert" className="mb-3 text-sm text-destructive">
            {error}
          </p>
        )}
        {planModal && (
          <RepaymentPlanForm
            key={planModal === "new" ? "new" : planModal.id}
            plan={planModal === "new" ? undefined : planModal}
            run={run}
            onDone={() => setPlanModal(null)}
          />
        )}
      </Dialog>
      {operation && (
        <OperationDialog
          key={`${operation.kind}-${operation.id ?? ""}`}
          operation={operation}
          store={store}
          customers={customers}
          today={today}
          run={run}
          error={error}
          onClose={() => setOperation(null)}
        />
      )}
      <Drawer
        open={!!detail}
        title="Agreement details"
        description={
          detail &&
          `${customerName(detail.customer_id)} · ${detail.product_name}`
        }
        onClose={() => setDetailId(null)}
      >
        {detail && (
          <div className="space-y-5">
            <div className="space-y-2 text-sm">
              <p className="break-all">Agreement: {detail.id}</p>
              <p>Customer ID: {detail.customer_id}</p>
              <p>
                Product ID: {detail.product_id ?? "Custom purchase"} · Quantity:{" "}
                {detail.quantity}
              </p>
              <p>Repayment plan ID: {detail.plan_id ?? "Custom terms"}</p>
              <Status value={agreementStatus(store, detail, today)} />
              <p>Principal: {money(detail.total_amount, detail.currency)}</p>
              <p>
                Initial payment:{" "}
                {money(detail.terms.initial_payment, detail.currency)} ·
                Interest: {detail.terms.interest}%
              </p>
              <p>
                {detail.terms.installment_count} installments ·{" "}
                {detail.terms.frequency} · every {detail.terms.interval}
              </p>
              <p>
                Partial payments: {detail.terms.partial_payment ? "Yes" : "No"}{" "}
                · Early payments: {detail.terms.early_payment ? "Yes" : "No"}
              </p>
              <p>
                Grace period: {detail.terms.grace_period_days} days · Default
                late fee: {money(detail.terms.late_fee, detail.currency)}
              </p>
            </div>
            <h3 className="text-sm font-semibold">Current payment schedule</h3>
            {scheduleTable(
              store.schedules.filter(
                (s) => !s.voided && s.agreement_id === detail.id,
              ),
              false,
            )}
            <h3 className="text-sm font-semibold">Receipts</h3>
            {store.payments
              .filter((p) => p.agreement_id === detail.id)
              .map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-border p-3 text-sm"
                >
                  <p>
                    {p.transaction_reference} · {businessDate(p.created_at)}
                  </p>
                  <p>
                    {money(p.amount, detail.currency)} · Refunded:{" "}
                    {money(p.refunded, detail.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.payment_method}
                  </p>
                </div>
              ))}
            <h3 className="text-sm font-semibold">Agreement history</h3>
            {store.audit
              .filter((a) => a.agreement_id === detail.id)
              .map((a) => (
                <div
                  key={a.id}
                  className="border-l-2 border-border pl-3 text-sm"
                >
                  <p className="font-medium">{a.action}</p>
                  <p>{a.reason}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.actor} · {businessDate(a.created_at)}
                  </p>
                </div>
              ))}
          </div>
        )}
      </Drawer>
    </div>
  );
}

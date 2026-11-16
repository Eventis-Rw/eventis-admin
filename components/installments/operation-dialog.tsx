"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Dialog } from "@/components/ui/overlay";
import { balance, money, scheduleStatus } from "@/lib/installments/engine";
import type {
  Command,
  Customer,
  InstallmentStore,
} from "@/lib/installments/types";
import { Field, type Run } from "./forms";

export type Operation = {
  kind: "pay" | "refund" | "revise" | "cancel" | "due_date" | "fee" | "notify";
  id?: string;
};
const titles = {
  pay: "Record payment",
  refund: "Record refund",
  revise: "Revise agreement",
  cancel: "Cancel agreement",
  due_date: "Adjust due date",
  fee: "Apply late fee",
  notify: "Simulate reminder",
};
export function OperationDialog({
  operation,
  store,
  customers,
  today,
  run,
  error,
  onClose,
}: {
  operation: Operation;
  store: InstallmentStore;
  customers: Customer[];
  today: string;
  run: Run;
  error: string;
  onClose: () => void;
}) {
  const available = store.schedules.filter(
    (s) =>
      !s.voided &&
      !store.agreements.find((a) => a.id === s.agreement_id)!.cancelled &&
      balance(store, s) > 0,
  );
  const [scheduleId, setScheduleId] = useState(
    operation.kind === "pay"
      ? (operation.id ?? available[0]?.id ?? "")
      : (operation.id ?? ""),
  );
  const row = store.schedules.find((s) => s.id === scheduleId);
  const payment =
    operation.kind === "refund"
      ? store.payments.find((p) => p.id === operation.id)
      : undefined;
  const agreement = store.agreements.find(
    (a) =>
      a.id ===
      (payment?.agreement_id ??
        (operation.kind === "revise" || operation.kind === "cancel"
          ? operation.id
          : row?.agreement_id)),
  );
  const customer = customers.find((c) => c.id === agreement?.customer_id);
  const currency = agreement?.currency ?? "RWF";
  const [feeType, setFeeType] = useState("fixed");
  const [notificationType, setNotificationType] = useState("reminder");
  const [sms, setSms] = useState(!!customer?.phone);
  const [email, setEmail] = useState(false);
  const reason = (
    <Field label="Reason">
      <Input name="reason" required maxLength={1000} />
    </Field>
  );
  return (
    <Dialog
      open
      title={titles[operation.kind]}
      description={
        customer ? `${customer.name} · ${agreement?.product_name}` : undefined
      }
      onClose={onClose}
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          const val = (key: string) => String(data.get(key) ?? "");
          let cmd: Command;
          switch (operation.kind) {
            case "pay":
              if (!row || !agreement) return;
              cmd = {
                type: "pay",
                agreement_id: agreement.id,
                schedule_id: row.id,
                amount: Number(val("amount")),
                payment_method: val("payment_method"),
                transaction_reference: val("transaction_reference"),
              };
              break;
            case "refund":
              cmd = {
                type: "refund",
                payment_id: operation.id!,
                amount: Number(val("amount")),
                reason: val("reason"),
              };
              break;
            case "revise":
              cmd = {
                type: "revise",
                agreement_id: operation.id!,
                new_start_date: val("new_start_date"),
                new_installment_count: Number(val("new_installment_count")),
                reason: val("reason"),
              };
              break;
            case "cancel":
              cmd = {
                type: "cancel",
                agreement_id: operation.id!,
                reason: val("reason"),
              };
              break;
            case "due_date":
              cmd = {
                type: "due_date",
                schedule_id: operation.id!,
                new_due_date: val("new_due_date"),
                reason: val("reason"),
              };
              break;
            case "fee":
              cmd = {
                type: "fee",
                schedule_id: operation.id!,
                fee_type: feeType as "fixed" | "percentage",
                fee_amount: Number(val("fee_amount")),
                reason: val("reason"),
              };
              break;
            case "notify":
              cmd = {
                type: "notify",
                schedule_id: operation.id!,
                notification_type: notificationType as "reminder" | "overdue",
                channels: [
                  ...(sms ? ["sms" as const] : []),
                  ...(email ? ["email" as const] : []),
                ],
              };
              break;
          }
          if (
            await run(
              cmd,
              operation.kind === "notify"
                ? "Reminder simulated and logged. No message was sent."
                : `${titles[operation.kind]} saved.`,
            )
          )
            onClose();
        }}
      >
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {agreement && (
          <p className="break-all text-xs text-muted-foreground">
            Agreement: {agreement.id}
          </p>
        )}
        {operation.kind === "pay" && (
          <>
            <Field label="Agreement / installment">
              <Select
                value={scheduleId}
                required
                onChange={(e) => setScheduleId(e.target.value)}
              >
                {!available.length && (
                  <option value="">No unpaid installments</option>
                )}
                {available.map((s) => {
                  const a = store.agreements.find(
                    (a) => a.id === s.agreement_id,
                  )!;
                  return (
                    <option key={s.id} value={s.id}>
                      {customers.find((c) => c.id === a.customer_id)?.name} ·{" "}
                      {a.product_name} · {s.due_date} ·{" "}
                      {money(balance(store, s), a.currency)}
                    </option>
                  );
                })}
              </Select>
            </Field>
            {row && (
              <p className="text-sm">
                Balance: {money(balance(store, row), currency)}.{" "}
                {agreement?.terms.partial_payment
                  ? "Partial payments allowed."
                  : "Full installment required."}{" "}
                {agreement?.terms.early_payment
                  ? "Early payments allowed."
                  : "No early payments."}
              </p>
            )}
            <Field label={`Payment amount (${currency})`}>
              <Input
                key={scheduleId}
                name="amount"
                required
                type="number"
                min="0.001"
                max={row ? balance(store, row) : 0}
                step="any"
                defaultValue={row ? balance(store, row) : ""}
              />
            </Field>
            <Field label="Payment method">
              <Select name="payment_method">
                <option>MTN Mobile Money</option>
                <option>Airtel Money</option>
                <option>Bank transfer</option>
                <option>Cash</option>
                <option>Card</option>
              </Select>
            </Field>
            <Field label="Transaction reference">
              <Input name="transaction_reference" required maxLength={160} />
            </Field>
            <p className="text-xs text-muted-foreground">
              Records a demo receipt; no payment provider is charged.
            </p>
          </>
        )}
        {operation.kind === "refund" && payment && (
          <>
            <p className="text-sm">
              Reference: {payment.transaction_reference}
              <br />
              Refundable: {money(payment.amount - payment.refunded, currency)}
            </p>
            <Field label={`Refund amount (${currency})`}>
              <Input
                name="amount"
                type="number"
                required
                min="0.001"
                max={payment.amount - payment.refunded}
                step="any"
                defaultValue={payment.amount - payment.refunded}
              />
            </Field>
            {reason}
            <p className="text-xs text-muted-foreground">
              Reopens the unpaid balance. No funds are transferred.
            </p>
          </>
        )}
        {operation.kind === "revise" && (
          <>
            <Field label="New start date">
              <Input
                name="new_start_date"
                type="date"
                required
                min="2000-01-01"
                max="2100-12-31"
                defaultValue={today}
              />
            </Field>
            <Field label="New installment count">
              <Input
                name="new_installment_count"
                type="number"
                required
                min="1"
                max="120"
                defaultValue={agreement?.terms.installment_count}
              />
            </Field>
            {reason}
            <p className="text-xs text-muted-foreground">
              Only the outstanding balance, including fees, is rescheduled.
              Payment history is preserved and interest is not charged again.
            </p>
          </>
        )}
        {operation.kind === "cancel" && (
          <>
            {reason}
            <p className="text-sm text-destructive">
              Stops collection and reminders. Existing receipts remain in
              history; refunds must be recorded separately.
            </p>
          </>
        )}
        {operation.kind === "due_date" && (
          <>
            <Field label="New due date">
              <Input
                name="new_due_date"
                type="date"
                required
                min="2000-01-01"
                max="2100-12-31"
                defaultValue={row?.due_date}
              />
            </Field>
            {reason}
          </>
        )}
        {operation.kind === "fee" && (
          <>
            <p className="text-sm">
              Grace period: {agreement?.terms.grace_period_days} days. Balance:{" "}
              {row && money(balance(store, row), currency)}
            </p>
            <Field label="Fee type">
              <Select
                value={feeType}
                onChange={(e) => setFeeType(e.target.value)}
              >
                <option value="fixed">Fixed amount</option>
                <option value="percentage">
                  Percentage of outstanding balance
                </option>
              </Select>
            </Field>
            <Field
              label={
                feeType === "fixed"
                  ? `Fee amount (${currency})`
                  : "Fee percentage (%)"
              }
            >
              <Input
                name="fee_amount"
                type="number"
                required
                min="0.001"
                step="any"
                max={feeType === "percentage" ? 100 : 1e9}
                defaultValue={agreement?.terms.late_fee || ""}
              />
            </Field>
            {reason}
            <p className="text-xs text-muted-foreground">
              One fee per schedule, after the grace period expires.
            </p>
          </>
        )}
        {operation.kind === "notify" && (
          <>
            <Field label="Reminder type">
              <Select
                value={notificationType}
                onChange={(e) => setNotificationType(e.target.value)}
              >
                <option value="reminder">Payment reminder</option>
                <option
                  value="overdue"
                  disabled={
                    !row || scheduleStatus(store, row, today) !== "overdue"
                  }
                >
                  Overdue notification
                </option>
              </Select>
            </Field>
            <fieldset className="space-y-3">
              <legend className="mb-2 text-sm font-medium">Channels</legend>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={sms}
                  disabled={!customer?.phone}
                  onChange={(e) => setSms(e.target.checked)}
                />
                SMS {customer?.phone || "(no phone number)"}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={email}
                  disabled={!customer?.email}
                  onChange={(e) => setEmail(e.target.checked)}
                />
                Email {customer?.email || "(no email address)"}
              </label>
            </fieldset>
            <p className="rounded-xl bg-muted p-3 text-sm">
              {customer?.name}, your installment of{" "}
              {row && money(balance(store, row), currency)}{" "}
              {notificationType === "overdue" ? "was due" : "is due"} on{" "}
              {row?.due_date}.
            </p>
            <p className="text-xs text-muted-foreground">
              This frontend demo logs the reminder without sending SMS or email.
            </p>
          </>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            type="submit"
            variant={operation.kind === "cancel" ? "destructive" : "primary"}
            disabled={
              (operation.kind === "pay" && !available.length) ||
              (operation.kind === "notify" && !sms && !email)
            }
          >
            {operation.kind === "notify" ? "Simulate reminder" : "Confirm"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

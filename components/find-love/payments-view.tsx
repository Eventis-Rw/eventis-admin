"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/overlay";
import { Table, Td, Th } from "@/components/ui/table";
import { recordInstallmentPaymentAction, refundTransactionAction } from "@/lib/find-love/actions";
import type { FindLoveUser, Installment, PaymentStatus, Transaction } from "@/lib/find-love/types";

interface PaymentsViewProps {
  installments: Installment[];
  transactions: Transaction[];
  users: FindLoveUser[];
}

export function PaymentsView({ installments, transactions, users }: PaymentsViewProps) {
  const [instList, setInstList] = useState<Installment[]>(installments);
  const [txList, setTxList] = useState<Transaction[]>(transactions);
  const [viewTab, setViewTab] = useState<"installments" | "transactions">("installments");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [search, setSearch] = useState("");

  // Modals
  const [paymentModalInst, setPaymentModalInst] = useState<Installment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("MTN Mobile Money");
  const [paymentReference, setPaymentReference] = useState("");

  const [refundModalTx, setRefundModalTx] = useState<Transaction | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const userMap = new Map(users.map((u) => [u.id, u]));

  // Accurate financial computations
  const successTxs = txList.filter((t) => t.status === "success");
  const confirmedRevenue = successTxs.reduce((sum, t) => sum + t.amount, 0);

  const pendingCount = instList.filter((i) => i.status === "pending").length;
  const overdueInsts = instList.filter((i) => i.status === "overdue");
  const overdueAmount = overdueInsts.reduce((sum, i) => sum + (i.amountDue - i.amountPaid), 0);

  const outstandingInsts = instList.filter(
    (i) => i.status === "pending" || i.status === "upcoming" || i.status === "overdue",
  );
  const totalOutstanding = outstandingInsts.reduce((sum, i) => sum + (i.amountDue - i.amountPaid), 0);

  const filteredInstallments = instList.filter((i) => {
    if (statusFilter !== "all" && i.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const u = userMap.get(i.userId);
      const match =
        i.id.toLowerCase().includes(q) ||
        i.userId.toLowerCase().includes(q) ||
        i.transactionReference?.toLowerCase().includes(q) ||
        u?.displayName.toLowerCase().includes(q) ||
        u?.username.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInst) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("installmentId", paymentModalInst.id);
      formData.set("paymentMethod", paymentMethod);
      formData.set("reference", paymentReference || `PAY-${Math.floor(100000 + Math.random() * 900000)}`);
      formData.set("actor", "Finance Lead");

      const res = await recordInstallmentPaymentAction(formData);
      if (res.success) {
        setInstList((prev) =>
          prev.map((i) =>
            i.id === paymentModalInst.id
              ? {
                  ...i,
                  status: "success",
                  amountPaid: i.amountDue,
                  paymentMethod,
                  transactionReference: paymentReference,
                  paidAt: new Date().toISOString(),
                }
              : i,
          ),
        );
        setPaymentModalInst(null);
      }
    });
  };

  const handleRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundModalTx) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("transactionId", refundModalTx.id);
      formData.set("reason", refundReason);
      formData.set("actor", "Finance Lead");

      const res = await refundTransactionAction(formData);
      if (res.success) {
        setTxList((prev) => prev.map((t) => (t.id === refundModalTx.id ? { ...t, status: "refunded" } : t)));
        setRefundModalTx(null);
        setRefundReason("");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 4 Financial KPI Stat Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 border-success/30 bg-success-soft/20">
          <p className="text-xs font-semibold text-success">Confirmed Revenue</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            RWF {confirmedRevenue.toLocaleString()}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Confirmed & reconciled transactions</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Outstanding Balances</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-warning">
            RWF {totalOutstanding.toLocaleString()}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Unpaid under installment plans</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Overdue Installments</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-destructive">
            RWF {overdueAmount.toLocaleString()}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{overdueInsts.length} past-due payments</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Pending Provider Confirmations</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{pendingCount}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Awaiting MoMo/bank response</p>
        </Card>
      </section>

      {/* Mode toggle and filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewTab("installments")}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${
                viewTab === "installments"
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-muted-foreground hover:bg-muted"
              }`}
            >
              Installment Schedules ({instList.length})
            </button>
            <button
              type="button"
              onClick={() => setViewTab("transactions")}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${
                viewTab === "transactions"
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-muted-foreground hover:bg-muted"
              }`}
            >
              Transactions & Refunds ({txList.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search reference, user ID, name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-xl border border-border bg-input pl-8 pr-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {viewTab === "installments" && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | "all")}
                className="h-9 rounded-xl border border-border bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="all">Status: All</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="upcoming">Upcoming</option>
                <option value="refunded">Refunded</option>
              </select>
            )}
          </div>
        </div>
      </Card>

      {/* Main Table */}
      {viewTab === "installments" ? (
        <Card>
          <CardHeader
            title="Subscription Installment Schedules"
            description="Track every installment, amount paid, and outstanding balance calculated from ledger records"
          />
          <Table>
            <thead>
              <tr>
                <Th>Reference / Plan</Th>
                <Th>Member</Th>
                <Th>Installment</Th>
                <Th>Amount Due</Th>
                <Th>Amount Paid</Th>
                <Th>Balance</Th>
                <Th>Due Date</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filteredInstallments.map((inst) => {
                const u = userMap.get(inst.userId);
                const remBalance = inst.amountDue - inst.amountPaid;

                return (
                  <tr key={inst.id} className="hover:bg-muted/30 transition-colors">
                    <Td>
                      <span className="font-mono text-xs font-semibold text-foreground">
                        {inst.transactionReference || "SCHEDULED"}
                      </span>
                      <p className="text-[11px] text-muted-foreground">{inst.paymentMethod || "Pending provider"}</p>
                    </Td>
                    <Td>
                      <Link href={`/find-love/users/${inst.userId}`} className="font-semibold text-foreground hover:text-primary">
                        {u?.displayName ?? inst.userId}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        @{u?.username} · <span className="font-mono text-[10px]">{inst.userId}</span>
                      </p>
                    </Td>
                    <Td className="text-xs font-medium">
                      {inst.installmentNumber} of {inst.totalInstallments}
                    </Td>
                    <Td className="tabular-nums font-mono text-sm font-semibold text-foreground">
                      RWF {inst.amountDue.toLocaleString()}
                    </Td>
                    <Td className="tabular-nums font-mono text-sm font-semibold text-success">
                      RWF {inst.amountPaid.toLocaleString()}
                    </Td>
                    <Td className="tabular-nums font-mono text-sm font-semibold text-warning">
                      RWF {remBalance.toLocaleString()}
                    </Td>
                    <Td className="text-xs text-muted-foreground">{inst.dueDate}</Td>
                    <Td>
                      <Badge
                        tone={
                          inst.status === "success"
                            ? "success"
                            : inst.status === "pending"
                            ? "warning"
                            : inst.status === "overdue"
                            ? "danger"
                            : "neutral"
                        }
                        dot
                      >
                        {inst.status}
                      </Badge>
                    </Td>
                    <Td className="text-right">
                      {inst.status !== "success" ? (
                        <Button
                          variant="primary"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            setPaymentModalInst(inst);
                            setPaymentReference(`PAY-${Math.floor(100000 + Math.random() * 900000)}`);
                          }}
                        >
                          Confirm Payment
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Reconciled</span>
                      )}
                    </Td>
                  </tr>
                );
              })}
              {filteredInstallments.length === 0 && (
                <tr>
                  <Td colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                    No installments found matching criteria.
                  </Td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      ) : (
        /* Transactions & Refunds view */
        <Card>
          <CardHeader
            title="Confirmed Transactions & Refunds"
            description="Reconciled ledger transactions with payment provider references"
          />
          <Table>
            <thead>
              <tr>
                <Th>Transaction Ref</Th>
                <Th>Member</Th>
                <Th>Tier / Plan</Th>
                <Th>Amount</Th>
                <Th>Payment Method</Th>
                <Th>Status</Th>
                <Th>Date</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {txList.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                  <Td className="font-mono text-xs font-semibold">{tx.reference}</Td>
                  <Td>
                    <Link href={`/find-love/users/${tx.userId}`} className="font-semibold text-foreground hover:text-primary">
                      {tx.userName}
                    </Link>
                    <span className="block font-mono text-[10px] text-muted-foreground">{tx.userId}</span>
                  </Td>
                  <Td className="text-xs font-medium text-foreground">{tx.planTitle}</Td>
                  <Td className="tabular-nums font-mono text-sm font-bold text-foreground">
                    RWF {tx.amount.toLocaleString()}
                  </Td>
                  <Td className="text-xs text-muted-foreground">{tx.paymentMethod}</Td>
                  <Td>
                    <Badge tone={tx.status === "success" ? "success" : tx.status === "refunded" ? "neutral" : "danger"} dot>
                      {tx.status}
                    </Badge>
                  </Td>
                  <Td className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</Td>
                  <Td className="text-right">
                    {tx.status === "success" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-destructive hover:bg-destructive-soft hover:text-destructive"
                        onClick={() => {
                          setRefundModalTx(tx);
                        }}
                      >
                        Refund
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">{tx.status}</span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {/* Record Payment Dialog */}
      {paymentModalInst && (
        <Dialog
          open={!!paymentModalInst}
          onClose={() => setPaymentModalInst(null)}
          title="Confirm Installment Payment"
          description={`Installment ${paymentModalInst.installmentNumber} of ${paymentModalInst.totalInstallments} · Due: RWF ${paymentModalInst.amountDue.toLocaleString()}`}
        >
          <form onSubmit={handleRecordPayment} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-foreground">Payment Provider / Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="MTN Mobile Money">MTN Mobile Money</option>
                <option value="Airtel Money">Airtel Money</option>
                <option value="Visa Card">Visa / Mastercard</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground">Transaction Provider Reference</label>
              <input
                type="text"
                required
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="e.g. PAY-88129"
                className="mt-1 h-10 w-full rounded-xl border border-border bg-input px-3 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="secondary" onClick={() => setPaymentModalInst(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isPending}>
                Confirm & Reconcile
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* Refund Dialog */}
      {refundModalTx && (
        <Dialog
          open={!!refundModalTx}
          onClose={() => setRefundModalTx(null)}
          title="Process Transaction Refund"
          description={`Ref: ${refundModalTx.reference} · Amount: RWF ${refundModalTx.amount.toLocaleString()} for ${refundModalTx.userName}`}
        >
          <form onSubmit={handleRefund} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-foreground">Reason for Refund (Mandatory)</label>
              <textarea
                required
                rows={3}
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="State documented reason for issuing refund..."
                className="mt-1 w-full rounded-xl border border-border bg-input p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="secondary" onClick={() => setRefundModalTx(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" loading={isPending}>
                Execute Refund
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}

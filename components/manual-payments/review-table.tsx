"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { CheckCircle2, ShieldAlert, XCircle } from "lucide-react";

import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, SearchInput, Select } from "@/components/ui/input";
import { Dialog } from "@/components/ui/overlay";
import { EmptyState } from "@/components/ui/states";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, Td, Th } from "@/components/ui/table";
import { fmtDateTime } from "@/lib/format";
import {
  approveManualPaymentAction,
  listManualPaymentsAction,
  rejectManualPaymentAction,
} from "@/lib/manual-payments/actions";
import { formatMinorAmount } from "@/lib/manual-payments/format";
import {
  PROVIDER_LABEL,
  STATUS_LABEL,
  type ManualPaymentAdmin,
  type ManualPaymentMethod,
  type ManualPaymentPlatform,
  type ManualPaymentStatus,
  type ManualPaymentsPage,
} from "@/lib/manual-payments/types";

import { ReceiptViewer } from "./receipt-viewer";

const LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 400;

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}

function userLabel(user: ManualPaymentAdmin["user"]): string {
  return user.display_name || user.email || user.id;
}

export function StatusBadge({ status }: { status: ManualPaymentStatus }) {
  const tone =
    status === "approved" ? "success" : status === "rejected" ? "danger" : status === "under_review" ? "info" : "warning";
  return (
    <Badge tone={tone} dot>
      {STATUS_LABEL[status]}
    </Badge>
  );
}

interface Filters {
  status: ManualPaymentStatus | "all";
  paymentMethodId: string;
  from: string;
  to: string;
  q: string;
}

const emptyFilters: Filters = { status: "all", paymentMethodId: "all", from: "", to: "", q: "" };

export function ManualPaymentsReview({
  platform,
  initialPage,
  methods,
}: {
  platform: ManualPaymentPlatform;
  initialPage: ManualPaymentsPage;
  methods: ManualPaymentMethod[];
}) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [searchDraft, setSearchDraft] = useState("");
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState<ManualPaymentsPage>(initialPage);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ManualPaymentAdmin | null>(null);
  const [, startTransition] = useTransition();
  const requestId = useRef(0);

  function fetchPage(nextFilters: Filters, nextPage: number) {
    const id = ++requestId.current;
    setLoading(true);
    startTransition(async () => {
      const result = await listManualPaymentsAction({
        platform,
        status: nextFilters.status === "all" ? undefined : nextFilters.status,
        payment_method_id: nextFilters.paymentMethodId === "all" ? undefined : nextFilters.paymentMethodId,
        from: nextFilters.from || undefined,
        to: nextFilters.to || undefined,
        q: nextFilters.q || undefined,
        page: nextPage,
        limit: LIMIT,
      });
      if (id !== requestId.current) return;
      setLoading(false);
      if (!result.ok) {
        setLoadError(result.error);
        return;
      }
      setLoadError("");
      setPageData(result.data);
    });
  }

  function applyFilters(next: Filters) {
    setFilters(next);
    setPage(1);
    fetchPage(next, 1);
  }

  function changePage(next: number) {
    setPage(next);
    fetchPage(filters, next);
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      if (searchDraft !== filters.q) applyFilters({ ...filters, q: searchDraft });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft]);

  function refreshAfterDecision(updated: ManualPaymentAdmin) {
    setSelected(updated);
    setPageData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === updated.id ? updated : item)),
    }));
  }

  return (
    <>
      <Card>
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-2 lg:grid-cols-5">
          <SearchInput
            className="sm:col-span-2 lg:col-span-1"
            aria-label="Search by reference, name, email or phone"
            placeholder="Reference, name, email, phone…"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
          />
          <Select
            aria-label="Filter by status"
            value={filters.status}
            onChange={(event) => applyFilters({ ...filters, status: event.target.value as Filters["status"] })}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </Select>
          <Select
            aria-label="Filter by payment method"
            value={filters.paymentMethodId}
            onChange={(event) => applyFilters({ ...filters, paymentMethodId: event.target.value })}
          >
            <option value="all">All payment methods</option>
            {methods.map((method) => (
              <option key={method.id} value={method.id}>
                {PROVIDER_LABEL[method.provider]} · {method.phone_number}
              </option>
            ))}
          </Select>
          <Field label="From">
            <Input
              type="date"
              aria-label="From date"
              value={filters.from}
              onChange={(event) => applyFilters({ ...filters, from: event.target.value })}
            />
          </Field>
          <Field label="To">
            <Input
              type="date"
              aria-label="To date"
              value={filters.to}
              onChange={(event) => applyFilters({ ...filters, to: event.target.value })}
            />
          </Field>
        </div>

        {loadError ? (
          <p role="alert" className="px-4 py-3 text-sm text-destructive">
            {loadError}
          </p>
        ) : null}

        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : pageData.items.length === 0 ? (
          <EmptyState
            title="No submissions match these filters"
            description="Try a different search, status or date range."
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Reference</Th>
                <Th>Member</Th>
                <Th>Plan</Th>
                <Th>Amount</Th>
                <Th>Payment method</Th>
                <Th>Submitted</Th>
                <Th>Status</Th>
                <Th>Review</Th>
              </tr>
            </thead>
            <tbody>
              {pageData.items.map((item) => (
                <tr key={item.id} className="cursor-pointer" onClick={() => setSelected(item)}>
                  <Td className="font-mono text-xs">{item.reference}</Td>
                  <Td>
                    <p className="font-medium">{userLabel(item.user)}</p>
                    {item.user.email ? <p className="text-xs text-muted-foreground">{item.user.email}</p> : null}
                  </Td>
                  <Td>{item.plan.name}</Td>
                  <Td className="tabular-nums">{formatMinorAmount(item.amount_minor, item.currency)}</Td>
                  <Td>
                    <p>{PROVIDER_LABEL[item.payment_method.provider]}</p>
                    <p className="text-xs text-muted-foreground">{item.payment_method.phone_number}</p>
                  </Td>
                  <Td className="whitespace-nowrap text-muted-foreground">{fmtDateTime(item.created_at)}</Td>
                  <Td>
                    <StatusBadge status={item.status} />
                  </Td>
                  <Td>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelected(item);
                      }}
                    >
                      Review
                    </Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        <Pagination page={page} total={pageData.total} onPage={changePage} />
      </Card>

      <ReviewDialog
        key={selected?.id ?? "none"}
        submission={selected}
        onClose={() => setSelected(null)}
        onDecided={refreshAfterDecision}
      />
    </>
  );
}

function ReviewDialog({
  submission,
  onClose,
  onDecided,
}: {
  submission: ManualPaymentAdmin | null;
  onClose: () => void;
  onDecided: (updated: ManualPaymentAdmin) => void;
}) {
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!submission) return null;

  const decided = submission.status === "approved" || submission.status === "rejected";

  function approve() {
    if (!submission) return;
    setError("");
    startTransition(async () => {
      const result = await approveManualPaymentAction(submission.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onDecided({ ...submission, ...result.data });
      setConfirmApprove(false);
    });
  }

  function reject() {
    if (!submission) return;
    const trimmed = reason.trim();
    if (trimmed.length < 3 || trimmed.length > 1000) {
      setError("The rejection reason must be between 3 and 1000 characters.");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await rejectManualPaymentAction(submission.id, trimmed);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onDecided({ ...submission, ...result.data });
      setRejecting(false);
    });
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={`Review ${submission.reference}`}
      description={`${submission.plan.name} · ${formatMinorAmount(submission.amount_minor, submission.currency)}`}
    >
      <div className="space-y-5">
        {error ? (
          <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
            <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden />
            {error}
          </p>
        ) : null}

        <dl className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Member</dt>
          <dd className="font-medium">{userLabel(submission.user)}</dd>
          <dt className="text-muted-foreground">Email</dt>
          <dd>{submission.user.email ?? "—"}</dd>
          <dt className="text-muted-foreground">Plan</dt>
          <dd>
            {submission.plan.name}
            {typeof submission.plan.durationDays === "number" ? ` · ${submission.plan.durationDays} days` : ""}
          </dd>
          <dt className="text-muted-foreground">Amount</dt>
          <dd className="tabular-nums">{formatMinorAmount(submission.amount_minor, submission.currency)}</dd>
          <dt className="text-muted-foreground">Paid to</dt>
          <dd>
            {PROVIDER_LABEL[submission.payment_method.provider]}
            {submission.payment_method.account_name ? ` · ${submission.payment_method.account_name}` : ""} ·{" "}
            <span className="tabular-nums">{submission.payment_method.phone_number}</span>
          </dd>
          <dt className="text-muted-foreground">Submitted</dt>
          <dd>{fmtDateTime(submission.created_at)}</dd>
          <dt className="text-muted-foreground">Status</dt>
          <dd>
            <StatusBadge status={submission.status} />
          </dd>
          {submission.rejection_reason ? (
            <>
              <dt className="text-muted-foreground">Rejection reason</dt>
              <dd>{submission.rejection_reason}</dd>
            </>
          ) : null}
        </dl>

        <div>
          <p className="mb-2 text-sm font-medium">Payment screenshot</p>
          <ReceiptViewer key={submission.id} uploadId={submission.receipt_upload_id} />
        </div>

        {decided ? (
          <p className="rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
            This submission has already been {STATUS_LABEL[submission.status].toLowerCase()}. No further action is
            needed.
          </p>
        ) : rejecting ? (
          <div className="space-y-3 rounded-xl border border-border p-4">
            <Field label="Rejection reason (shown to the member)">
              <textarea
                className="min-h-24 w-full rounded-xl border border-border bg-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring"
                maxLength={1000}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                autoFocus
              />
            </Field>
            <p className="text-xs text-muted-foreground">{reason.trim().length}/1000 characters (minimum 3).</p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setRejecting(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={reject} loading={isPending}>
                <XCircle className="h-4 w-4" />
                Confirm rejection
              </Button>
            </div>
          </div>
        ) : confirmApprove ? (
          <div className="space-y-3 rounded-xl border border-border p-4">
            <p className="text-sm">
              Approving activates the member&apos;s subscription immediately and emails them. This cannot be undone
              from here.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmApprove(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button variant="success" onClick={approve} loading={isPending}>
                <CheckCircle2 className="h-4 w-4" />
                Confirm approval
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="destructive" onClick={() => setRejecting(true)}>
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
            <Button variant="success" onClick={() => setConfirmApprove(true)}>
              <CheckCircle2 className="h-4 w-4" />
              Approve
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
}

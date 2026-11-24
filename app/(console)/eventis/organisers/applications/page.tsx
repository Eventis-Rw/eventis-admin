import Link from "next/link";

import { AdminActionForm } from "@/components/eventis/admin-action-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { apiFetch, toResult } from "@/lib/api";
import { reviewApplication } from "@/lib/eventis/console-actions";
import { requireAdmin } from "@/lib/session";

type Application = {
  id: string;
  status: "PENDING_PAYMENT" | "IN_REVIEW" | "APPROVED" | "REJECTED";
  name: string;
  description: string;
  activities: string;
  location: string;
  website: string | null;
  submittedAt: string | null;
  rejectionReason: string | null;
  user: { displayName: string | null; email: string | null; phone: string | null } | null;
  payment: { id: string; reference: string; status: string; amountMinor: string; currency: string; plan: unknown; paymentMethod: unknown; reviewedAt: string | null; verifiedTransactionId: string | null } | null;
};

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const [{ token }, query] = await Promise.all([requireAdmin(), searchParams]);
  const number = Number(query.page);
  const page = Number.isSafeInteger(number) && number > 0 && number <= 10000 ? number : 1;
  const limit = 20;
  const result = await toResult(() => apiFetch<{ items: Application[]; total: number }>("/admin/organiser-applications", { token, query: { page, limit } }));
  return (
    <div className="space-y-4">
      <Link href="/eventis/organisers" className="text-sm font-semibold text-primary">← Organisers</Link>
      <h1 className="text-xl font-bold">Organiser applications</h1>
      <p className="text-sm text-muted-foreground">Verify receipts in Manual Payments first. Application approval is a separate decision.</p>
      {!result.ok ? <ErrorState message={result.error} /> : (
        <>
          {result.data.items.length === 0 ? <EmptyState title="No applications on this page" /> : null}
          {result.data.items.map((row) => (
            <Card key={row.id}>
              <CardHeader title={row.name} action={<Badge tone="neutral">{row.status}</Badge>} />
              <div className="space-y-3 p-5 text-sm">
                <p>Applicant: {row.user?.displayName || "—"} · {row.user?.email || "—"} · {row.user?.phone || "—"}</p>
                <p>Description: {row.description}</p>
                <p>Activities: {row.activities} · Location: {row.location}</p>
                {row.website ? <p>Website: {row.website}</p> : null}
                <p>Submitted: {row.submittedAt || "Awaiting payment verification"}</p>
                {row.payment ? (
                  <div>
                    <p>Payment: {row.payment.reference} · {row.payment.status} · {row.payment.currency} {row.payment.amountMinor}</p>
                    <p>Verified: {row.payment.reviewedAt || "Not verified"}</p>
                    <p>Provider transaction: {row.payment.verifiedTransactionId || "Not recorded"}</p>
                    <p>Plan: {JSON.stringify(row.payment.plan)} · Method: {JSON.stringify(row.payment.paymentMethod)}</p>
                    <a href={`/api/manual-payments/${encodeURIComponent(row.payment.id)}/receipt`} target="_blank" rel="noreferrer" className="text-primary underline">View receipt</a>
                  </div>
                ) : <p>No payment submitted.</p>}
                {row.rejectionReason ? <p>Rejection reason: {row.rejectionReason}</p> : null}
                {row.status === "IN_REVIEW" ? (
                  <AdminActionForm action={reviewApplication.bind(null, row.id)}>
                    <label className="block max-w-lg space-y-1">Reason for rejection<Input name="rejectionReason" maxLength={1000} /></label>
                    <div className="flex gap-2">
                      <Button type="submit" name="operation" value="approve">Approve application</Button>
                      <Button type="submit" name="operation" value="reject" variant="destructive">Reject application</Button>
                    </div>
                  </AdminActionForm>
                ) : null}
              </div>
            </Card>
          ))}
          <nav aria-label="Result pages" className="flex gap-4 text-sm">
            {page > 1 ? <Link href={`?page=${page - 1}`}>Previous</Link> : null}
            <span>Page {page}</span>
            {page * limit < result.data.total ? <Link href={`?page=${page + 1}`}>Next</Link> : null}
          </nav>
        </>
      )}
    </div>
  );
}

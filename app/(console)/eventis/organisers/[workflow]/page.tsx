import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminActionForm } from "@/components/eventis/admin-action-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { apiFetch, toResult } from "@/lib/api";
import { USE_MOCK_DATA } from "@/lib/config";
import { reviewOrganiser } from "@/lib/eventis/console-actions";
import { organiserWorkflows, type OrganiserWorkflow } from "@/lib/eventis/console-settings";
import { requireAdmin } from "@/lib/session";

type WorkflowRow = {
  id: string;
  status: string;
  legalName?: string;
  registrationNumber?: string;
  representativeName?: string;
  paymentWebsite?: string;
  documentKey?: string;
  rejectionReason?: string;
  eventId?: string;
  eventTitle?: string;
  placement?: string;
  durationDays?: number;
  organiser?: string;
  plan?: { name: string };
  payment?: { reference: string; status: string; amountMinor: string; currency: string };
};

function details(row: WorkflowRow, workflow: OrganiserWorkflow) {
  if (workflow === "verification") return [
    ["Registration number", row.registrationNumber], ["Representative", row.representativeName],
    ["Payment website", row.paymentWebsite], ["Document reference", row.documentKey],
  ];
  if (workflow === "promotions") return [
    ["Event ID", row.eventId], ["Placement", row.placement?.replaceAll("_", " ")],
    ["Duration", row.durationDays ? `${row.durationDays} days` : undefined],
  ];
  return [
    ["Plan", row.plan?.name], ["Payment reference", row.payment?.reference],
    ["Payment status", row.payment?.status],
    ["Amount", row.payment ? `${row.payment.currency} ${row.payment.amountMinor}` : undefined],
  ];
}

export default async function OrganiserWorkflowPage({ params, searchParams }: {
  params: Promise<{ workflow: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ workflow: slug }, query, { token }] = await Promise.all([params, searchParams, requireAdmin()]);
  if (!Object.hasOwn(organiserWorkflows, slug)) notFound();
  const workflow = slug as OrganiserWorkflow;
  const definition = organiserWorkflows[workflow];
  if (USE_MOCK_DATA) return <EmptyState title={definition.title} description="Switch to API mode to manage these records." />;
  const requested = Number(query.page);
  const page = Number.isSafeInteger(requested) && requested > 0 && requested <= 10_000 ? requested : 1;
  const limit = 20;
  const result = await toResult(() => apiFetch<{ items: WorkflowRow[]; total: number }>(definition.endpoint, { token, query: { page, limit } }));
  const url = `/eventis/organisers/${workflow}`;

  return (
    <div className="space-y-4">
      <Link href="/eventis/organisers" className="text-sm font-semibold text-primary hover:underline">← Organisers</Link>
      <h1 className="text-xl font-bold">{definition.title}</h1>
      {!result.ok ? <ErrorState message={result.error} /> : (
        <>
          {result.data.items.length === 0 ? <EmptyState title="No records on this page" /> : null}
          {result.data.items.map((row) => {
            const canReview = workflow === "verification" ? row.status === "PENDING" : workflow === "promotions" && row.status === "REQUESTED";
            const canActivate = workflow === "subscriptions" ? row.status === "PENDING" : workflow === "promotions" && row.status === "APPROVED";
            return (
              <Card key={row.id}>
                <CardHeader title={row.legalName || row.eventTitle || row.organiser || row.id}
                  action={<Badge tone="neutral">{row.status}</Badge>} />
                <div className="space-y-4 p-5">
                  <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    {[...details(row, workflow), ["Rejection reason", row.rejectionReason]].filter(([, value]) => value).map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-muted-foreground">{label}</dt>
                        <dd className="break-all font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  {canReview || canActivate ? (
                    <AdminActionForm key={row.status} action={reviewOrganiser.bind(null, workflow, row.id)}>
                      {canReview ? (
                        <>
                          <label className="block max-w-lg space-y-1 text-sm">Reason for rejection
                            <Input name="rejectionReason" maxLength={2000} />
                          </label>
                          <div className="flex gap-2">
                            <Button type="submit" name="operation" value="approve">Approve</Button>
                            <Button type="submit" name="operation" value="reject" variant="destructive">Reject</Button>
                          </div>
                        </>
                      ) : (
                        <>
                          {workflow === "subscriptions" ? (
                            <label className="flex items-start gap-2 text-sm">
                              <input type="checkbox" name="paymentConfirmed" required className="mt-1" />
                              I verified the payment. Activation starts the subscription and records the linked payment as successful.
                            </label>
                          ) : null}
                          <Button type="submit" name="operation" value="activate">Activate</Button>
                        </>
                      )}
                    </AdminActionForm>
                  ) : null}
                </div>
              </Card>
            );
          })}
          <nav aria-label="Result pages" className="flex gap-4 text-sm">
            {page > 1 ? <Link href={`${url}?page=${page - 1}`} className="text-primary">Previous</Link> : null}
            <span>Page {page}</span>
            {page * limit < result.data.total && page < 10_000 ? <Link href={`${url}?page=${page + 1}`} className="text-primary">Next</Link> : null}
          </nav>
        </>
      )}
    </div>
  );
}

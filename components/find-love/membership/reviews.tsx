"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { SearchInput, Select } from "@/components/ui/input";
import { Dialog } from "@/components/ui/overlay";
import { Table, Th, Td } from "@/components/ui/table";
import {
  type Member,
  type Report,
  adult,
} from "@/lib/find-love/membership-demo";
import {
  type ViewProps,
  Field,
  Reason,
  Status,
  Empty,
  formString,
} from "./shared";
export function Verification({ state, now, mutate, live }: ViewProps) {
  const [selected, setSelected] = useState<Member | null>(null),
    [filter, setFilter] = useState("pending"),
    [search, setSearch] = useState("");
  const members = state.members.filter(
    (m) =>
      (filter === "all" || m.verification === filter) &&
      `${m.name} ${m.id}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <Card>
        <CardHeader
          title="Age verification review"
          description={
            live
              ? "Review submitted verification cases and record approval, rejection or resubmission decisions."
              : "Synthetic review cases demonstrate approval, rejection and resubmission. Real document inspection and automated checks require the backend."
          }
        />
        <div className="flex flex-wrap gap-3 p-5">
          <Select
            className="sm:w-64"
            aria-label="Verification status"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="pending">Pending manual review</option>
            <option value="all">All decisions</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
            <option value="resubmission_required">Resubmission required</option>
          </Select>
          <SearchInput
            className="flex-1"
            aria-label="Search verification"
            placeholder="Member name or ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Member</Th>
              <Th>Document</Th>
              <Th>Age eligibility</Th>
              <Th>Decision</Th>
              <Th>Review</Th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <Td>
                  {m.name}
                  <p className="text-xs text-muted-foreground">{m.id}</p>
                </Td>
                <Td>{m.document}</Td>
                <Td>{adult(m.dob, now) ? "18+" : "Under 18"}</Td>
                <Td>
                  <Status value={m.verification} />
                </Td>
                <Td>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelected(m)}
                  >
                    Review case
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
        {!members.length && <Empty />}
      </Card>
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Review ${selected?.name ?? "verification"}`}
        description={
          live
            ? "Inspect the actual identity document through your verification process before approving the recorded data."
            : "Demo identity data only. Do not upload real identity documents."
        }
      >
        {selected && (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (
                await mutate({
                  type: "verify",
                  id: selected.id,
                  decision: formString(
                    e.currentTarget,
                    "decision",
                  ) as Member["verification"],
                  reason: formString(e.currentTarget, "reason"),
                })
              )
                setSelected(null);
            }}
          >
            <div className="rounded-xl border border-border bg-muted p-4 text-sm leading-relaxed">
              <p>
                {selected.document} ·{" "}
                {live ? "Submitted case" : "Synthetic case"}
              </p>
              <p>Date of birth: {selected.dob}</p>
              <p>
                Age eligibility:{" "}
                {adult(selected.dob, now)
                  ? "Adult (18+)"
                  : "Under 18 — cannot approve"}
              </p>
            </div>
            <Field label="Review decision">
              <Select name="decision" defaultValue="verified">
                <option value="verified" disabled={!adult(selected.dob, now)}>
                  Approve adult verification
                </option>
                <option value="rejected">Reject</option>
                <option value="resubmission_required">
                  Request resubmission
                </option>
              </Select>
            </Field>
            <Reason />
            <p className="text-xs text-muted-foreground">
              Approval does not grant a membership or restore a suspended
              account.
            </p>
            <Button type="submit">Save review decision</Button>
          </form>
        )}
      </Dialog>
    </>
  );
}
export function Safety({ state, mutate, live }: ViewProps) {
  const [selected, setSelected] = useState<Report | null>(null),
    [filter, setFilter] = useState("open");
  const reports = state.reports.filter(
    (r) => filter === "all" || r.status === filter,
  );
  return (
    <>
      <Card>
        <CardHeader
          title="Reports & account moderation"
          description={
            live
              ? "Review reported cases and record decisions. Suspensions and bans restrict the account immediately."
              : "Review synthetic reports, document decisions and suspend or ban the reported account. Account restrictions apply immediately throughout this demo."
          }
        />
        <div className="p-5">
          <Select
            className="sm:w-64"
            aria-label="Report status"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="open">Open reports</option>
            <option value="all">All reports</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </Select>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Case</Th>
              <Th>Reported member</Th>
              <Th>Category</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <Td>{r.id}</Td>
                <Td>{state.members.find((m) => m.id === r.memberId)?.name}</Td>
                <Td>{r.category}</Td>
                <Td>
                  <Status value={r.status} />
                </Td>
                <Td>
                  {r.status === "open" ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelected(r)}
                    >
                      Review report
                    </Button>
                  ) : (
                    "Decision recorded"
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
        {!reports.length && <Empty />}
      </Card>
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Review ${selected?.id ?? "report"}`}
      >
        {selected && (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (
                await mutate({
                  type: "report",
                  id: selected.id,
                  decision: formString(e.currentTarget, "decision") as
                    "resolve" | "dismiss" | "suspend" | "ban",
                  reason: formString(e.currentTarget, "reason"),
                })
              )
                setSelected(null);
            }}
          >
            <p className="text-sm leading-relaxed">{selected.details}</p>
            <Field label="Moderation decision">
              <Select name="decision">
                <option value="resolve">
                  Resolve without account restriction
                </option>
                <option value="dismiss">Dismiss report</option>
                <option value="suspend">Suspend account and resolve</option>
                <option value="ban">Ban account and resolve</option>
              </Select>
            </Field>
            <Reason />
            <Button type="submit">Record moderation decision</Button>
          </form>
        )}
      </Dialog>
    </>
  );
}

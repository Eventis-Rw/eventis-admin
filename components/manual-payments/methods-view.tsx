"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Pencil, Plus, Power, PowerOff, Smartphone, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Dialog } from "@/components/ui/overlay";
import { EmptyState } from "@/components/ui/states";
import { Table, Td, Th } from "@/components/ui/table";
import {
  createManualPaymentMethodAction,
  deleteManualPaymentMethodAction,
  setManualPaymentMethodStatusAction,
  updateManualPaymentMethodAction,
} from "@/lib/manual-payments/methods-actions";
import {
  PROVIDER_LABEL,
  type ManualPaymentMethod,
  type ManualPaymentMethodPlatform,
  type ManualPaymentPlatform,
  type ManualPaymentProvider,
} from "@/lib/manual-payments/types";

const METHOD_PLATFORM_LABEL: Record<ManualPaymentMethodPlatform, string> = {
  findlove: "FindLove",
  organiser: "Events",
  both: "Both",
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}

const textAreaClass =
  "min-h-20 w-full rounded-xl border border-border bg-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring";

type Draft = {
  provider: ManualPaymentProvider;
  platform: ManualPaymentMethodPlatform;
  account_name: string;
  phone_number: string;
  instructions: string;
  currency: string;
  is_active: boolean;
  display_order: number;
};

function emptyDraft(platform: ManualPaymentMethodPlatform): Draft {
  return {
    provider: "mtn_momo",
    platform,
    account_name: "",
    phone_number: "",
    instructions: "",
    currency: "RWF",
    is_active: true,
    display_order: 0,
  };
}

function toDraft(method: ManualPaymentMethod): Draft {
  return {
    provider: method.provider,
    platform: method.platform,
    account_name: method.account_name ?? "",
    phone_number: method.phone_number,
    instructions: method.instructions ?? "",
    currency: method.currency,
    is_active: method.is_active,
    display_order: method.display_order,
  };
}

export function ManualPaymentMethodsView({
  platform,
  items,
}: {
  platform: ManualPaymentPlatform;
  items: ManualPaymentMethod[];
}) {
  const [editing, setEditing] = useState<ManualPaymentMethod | "new" | null>(null);
  const [deleting, setDeleting] = useState<ManualPaymentMethod | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null);
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  const sorted = [...items].sort((a, b) => a.display_order - b.display_order);

  function submitDraft(draft: Draft) {
    setFormError("");
    const payload = {
      provider: draft.provider,
      platform: draft.platform,
      account_name: draft.account_name.trim() || null,
      phone_number: draft.phone_number.trim(),
      instructions: draft.instructions.trim() || null,
      currency: draft.currency.trim() || "RWF",
      is_active: draft.is_active,
      display_order: draft.display_order,
    };
    if (!payload.phone_number) {
      setFormError("Phone number is required.");
      return;
    }
    startTransition(async () => {
      const result =
        editing && editing !== "new"
          ? await updateManualPaymentMethodAction(editing.id, payload)
          : await createManualPaymentMethodAction(payload);
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      setNotice({ ok: true, message: editing === "new" ? "Payment method created." : "Payment method updated." });
      setEditing(null);
    });
  }

  function toggleActive(method: ManualPaymentMethod) {
    startTransition(async () => {
      const result = await setManualPaymentMethodStatusAction(method.id, !method.is_active);
      setNotice(
        result.ok
          ? { ok: true, message: result.data.is_active ? "Payment method activated." : "Payment method deactivated." }
          : { ok: false, message: result.error },
      );
    });
  }

  function confirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const result = await deleteManualPaymentMethodAction(deleting.id);
      setNotice(
        result.ok
          ? { ok: true, message: "Payment method deleted." }
          : { ok: false, message: result.error },
      );
      setDeleting(null);
    });
  }

  return (
    <>
      {notice ? (
        <div
          role="status"
          className={`mb-4 flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium ${notice.ok ? "bg-success-soft text-success" : "bg-destructive-soft text-destructive"}`}
        >
          <span>{notice.message}</span>
          <button type="button" className="text-xs underline" onClick={() => setNotice(null)}>
            Dismiss
          </button>
        </div>
      ) : null}

      <Card>
        <CardHeader
          title="Payment numbers"
          description="MTN Mobile Money and Airtel Money numbers members see when paying out of band. Deactivate a number instead of deleting it once it has been used."
          action={
            <Button size="sm" onClick={() => setEditing("new")}>
              <Plus className="h-4 w-4" />
              New method
            </Button>
          }
        />
        {sorted.length === 0 ? (
          <EmptyState
            title="No payment methods configured"
            description="Add an MTN Mobile Money or Airtel Money number for members to pay to."
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Provider</Th>
                <Th>Platform</Th>
                <Th>Account name</Th>
                <Th>Phone number</Th>
                <Th>Order</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((method) => (
                <tr key={method.id}>
                  <Td>
                    <span className="flex items-center gap-2 font-medium">
                      <Smartphone className="h-4 w-4 text-primary" aria-hidden />
                      {PROVIDER_LABEL[method.provider]}
                    </span>
                  </Td>
                  <Td>
                    <Badge tone={method.platform === "both" ? "info" : "neutral"}>
                      {METHOD_PLATFORM_LABEL[method.platform]}
                    </Badge>
                  </Td>
                  <Td>{method.account_name ?? <span className="text-muted-foreground">—</span>}</Td>
                  <Td className="tabular-nums">{method.phone_number}</Td>
                  <Td className="tabular-nums">{method.display_order}</Td>
                  <Td>
                    <Badge tone={method.is_active ? "success" : "neutral"} dot>
                      {method.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setEditing(method)} aria-label={`Edit ${method.account_name ?? PROVIDER_LABEL[method.provider]}`}>
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => toggleActive(method)} disabled={isPending}>
                        {method.is_active ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                        {method.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleting(method)} aria-label={`Delete ${method.account_name ?? PROVIDER_LABEL[method.provider]}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {editing ? (
        <MethodEditor
          initial={editing === "new" ? emptyDraft(platform) : toDraft(editing)}
          title={editing === "new" ? "New payment method" : `Edit ${editing.account_name ?? PROVIDER_LABEL[editing.provider]}`}
          error={formError}
          pending={isPending}
          onClose={() => {
            setEditing(null);
            setFormError("");
          }}
          onSave={submitDraft}
        />
      ) : null}

      <Dialog
        open={deleting !== null}
        onClose={() => (isPending ? undefined : setDeleting(null))}
        title="Delete this payment method?"
        description={deleting ? (deleting.account_name ?? PROVIDER_LABEL[deleting.provider]) : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} loading={isPending}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          If this method has already been used on a payment submission, the API will refuse the
          delete — deactivate it instead so it stops appearing to members.
        </p>
      </Dialog>
    </>
  );
}

function MethodEditor({
  initial,
  title,
  error,
  pending,
  onClose,
  onSave,
}: {
  initial: Draft;
  title: string;
  error: string;
  pending: boolean;
  onClose: () => void;
  onSave: (draft: Draft) => void;
}) {
  const [draft, setDraft] = useState(initial);

  return (
    <Dialog open onClose={onClose} title={title} description="Visible to members paying for this platform.">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(draft);
        }}
      >
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <Field label="Provider">
          <Select
            value={draft.provider}
            onChange={(event) => setDraft({ ...draft, provider: event.target.value as ManualPaymentProvider })}
          >
            <option value="mtn_momo">MTN Mobile Money</option>
            <option value="airtel_money">Airtel Money</option>
          </Select>
        </Field>
        <Field label="Platform">
          <Select
            value={draft.platform}
            onChange={(event) => setDraft({ ...draft, platform: event.target.value as ManualPaymentMethodPlatform })}
          >
            <option value="findlove">FindLove</option>
            <option value="organiser">Events</option>
            <option value="both">Both</option>
          </Select>
        </Field>
        <Field label="Account name (optional)">
          <Input
            maxLength={120}
            value={draft.account_name}
            onChange={(event) => setDraft({ ...draft, account_name: event.target.value })}
          />
        </Field>
        <Field label="Phone number">
          <Input
            required
            maxLength={30}
            placeholder="e.g. 0788 123 456"
            value={draft.phone_number}
            onChange={(event) => setDraft({ ...draft, phone_number: event.target.value })}
          />
        </Field>
        <Field label="Instructions (optional)">
          <textarea
            className={textAreaClass}
            maxLength={500}
            value={draft.instructions}
            onChange={(event) => setDraft({ ...draft, instructions: event.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Currency">
            <Input
              maxLength={6}
              value={draft.currency}
              onChange={(event) => setDraft({ ...draft, currency: event.target.value.toUpperCase() })}
            />
          </Field>
          <Field label="Display order">
            <Input
              type="number"
              min="0"
              max="999"
              value={draft.display_order}
              onChange={(event) => setDraft({ ...draft, display_order: Number(event.target.value) || 0 })}
            />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.is_active}
            onChange={(event) => setDraft({ ...draft, is_active: event.target.checked })}
          />
          Active (visible to members)
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" loading={pending}>
            Save
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

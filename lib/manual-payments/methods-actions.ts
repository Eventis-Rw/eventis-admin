"use server";

import { revalidatePath } from "next/cache";

import { apiFetch, toResult } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import type { Result } from "@/types";
import type {
  ManualPaymentMethod,
  ManualPaymentMethodPlatform,
  ManualPaymentProvider,
} from "./types";

export interface ManualPaymentMethodCreateInput {
  provider: ManualPaymentProvider;
  platform: ManualPaymentMethodPlatform;
  account_name?: string | null;
  phone_number: string;
  instructions?: string | null;
  currency?: string;
  is_active?: boolean;
  display_order?: number;
}

export type ManualPaymentMethodUpdateInput = Partial<ManualPaymentMethodCreateInput>;

function revalidateMethodPaths() {
  revalidatePath("/find-love/manual-payments/methods");
  revalidatePath("/eventis/manual-payments/methods");
}

export async function createManualPaymentMethodAction(
  input: ManualPaymentMethodCreateInput,
): Promise<Result<ManualPaymentMethod>> {
  const { token } = await requireAdmin();
  const result = await toResult(() =>
    apiFetch<ManualPaymentMethod>("/admin/manual-payment-methods", {
      method: "POST",
      token,
      body: input,
    }),
  );
  if (result.ok) revalidateMethodPaths();
  return result;
}

export async function updateManualPaymentMethodAction(
  id: string,
  input: ManualPaymentMethodUpdateInput,
): Promise<Result<ManualPaymentMethod>> {
  const { token } = await requireAdmin();
  const result = await toResult(() =>
    apiFetch<ManualPaymentMethod>(`/admin/manual-payment-methods/${id}`, {
      method: "PATCH",
      token,
      body: input,
    }),
  );
  if (result.ok) revalidateMethodPaths();
  return result;
}

export async function setManualPaymentMethodStatusAction(
  id: string,
  isActive: boolean,
): Promise<Result<ManualPaymentMethod>> {
  const { token } = await requireAdmin();
  const result = await toResult(() =>
    apiFetch<ManualPaymentMethod>(`/admin/manual-payment-methods/${id}/status`, {
      method: "PATCH",
      token,
      body: { is_active: isActive },
    }),
  );
  if (result.ok) revalidateMethodPaths();
  return result;
}

export async function deleteManualPaymentMethodAction(
  id: string,
): Promise<Result<{ ok: true }>> {
  const { token } = await requireAdmin();
  const result = await toResult(() =>
    apiFetch<{ ok: true }>(`/admin/manual-payment-methods/${id}`, {
      method: "DELETE",
      token,
    }),
  );
  if (result.ok) revalidateMethodPaths();
  return result;
}

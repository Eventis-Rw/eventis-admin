"use server";

import { revalidatePath } from "next/cache";

import { apiFetch, toResult } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import type { Result } from "@/types";
import type {
  ManualPaymentAdmin,
  ManualPaymentPlatform,
  ManualPaymentStatus,
  ManualPaymentSubmission,
  ManualPaymentsPage,
} from "./types";

export interface ManualPaymentsFilter {
  platform: ManualPaymentPlatform;
  status?: ManualPaymentStatus;
  payment_method_id?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  limit?: number;
}

function revalidateReviewPaths() {
  revalidatePath("/find-love/manual-payments");
  revalidatePath("/eventis/manual-payments");
}

export async function listManualPaymentsAction(
  filter: ManualPaymentsFilter,
): Promise<Result<ManualPaymentsPage>> {
  const { token } = await requireAdmin();
  return toResult(() =>
    apiFetch<ManualPaymentsPage>("/admin/manual-payments", {
      token,
      query: {
        platform: filter.platform,
        status: filter.status,
        payment_method_id: filter.payment_method_id,
        from: filter.from,
        to: filter.to,
        q: filter.q,
        page: filter.page ?? 1,
        limit: filter.limit ?? 10,
      },
    }),
  );
}

export async function getManualPaymentAction(
  id: string,
): Promise<Result<ManualPaymentAdmin>> {
  const { token } = await requireAdmin();
  return toResult(() =>
    apiFetch<ManualPaymentAdmin>(`/admin/manual-payments/${id}`, { token }),
  );
}

export async function markManualPaymentUnderReviewAction(
  id: string,
): Promise<Result<ManualPaymentSubmission>> {
  const { token } = await requireAdmin();
  const result = await toResult(() =>
    apiFetch<ManualPaymentSubmission>(`/admin/manual-payments/${id}/review`, {
      method: "PATCH",
      token,
    }),
  );
  if (result.ok) revalidateReviewPaths();
  return result;
}

export async function approveManualPaymentAction(
  id: string,
): Promise<Result<ManualPaymentSubmission>> {
  const { token } = await requireAdmin();
  const result = await toResult(() =>
    apiFetch<ManualPaymentSubmission>(`/admin/manual-payments/${id}/approve`, {
      method: "POST",
      token,
    }),
  );
  if (result.ok) revalidateReviewPaths();
  return result;
}

export async function rejectManualPaymentAction(
  id: string,
  reason: string,
): Promise<Result<ManualPaymentSubmission>> {
  const { token } = await requireAdmin();
  const result = await toResult(() =>
    apiFetch<ManualPaymentSubmission>(`/admin/manual-payments/${id}/reject`, {
      method: "POST",
      token,
      body: { rejection_reason: reason },
    }),
  );
  if (result.ok) revalidateReviewPaths();
  return result;
}

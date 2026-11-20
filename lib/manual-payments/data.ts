import "server-only";

import { apiFetch, toResult } from "@/lib/api";
import type { Result } from "@/types";
import type {
  ManualPaymentMethod,
  ManualPaymentPlatform,
  ManualPaymentsPage,
} from "./types";

export async function loadManualPaymentMethods(
  token: string,
  platform?: ManualPaymentPlatform,
): Promise<Result<ManualPaymentMethod[]>> {
  return toResult(
    async () =>
      (
        await apiFetch<{ items: ManualPaymentMethod[] }>(
          "/admin/manual-payment-methods",
          { token, query: { platform } },
        )
      ).items,
  );
}

export async function loadManualPaymentsPage(
  token: string,
  params: { platform: ManualPaymentPlatform; page?: number; limit?: number },
): Promise<Result<ManualPaymentsPage>> {
  return toResult(() =>
    apiFetch<ManualPaymentsPage>("/admin/manual-payments", {
      token,
      query: {
        platform: params.platform,
        page: params.page ?? 1,
        limit: params.limit ?? 10,
      },
    }),
  );
}

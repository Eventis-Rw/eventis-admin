"use server";
import { revalidatePath } from "next/cache";
import { apiFetch, toResult } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import type { Command, InstallmentStore } from "./types";
export interface LiveInstallmentSnapshot {
  state: InstallmentStore;
  revision: number;
}
export async function saveInstallmentCommand(
  command: Command,
  revision: number,
  requestId: string,
) {
  const { token } = await requireAdmin();
  return toResult(async () => {
    const result = await apiFetch<LiveInstallmentSnapshot>(
      "/admin/installment-workspace/commands",
      {
        method: "POST",
        token,
        body: { command, revision, requestId },
      },
    );
    revalidatePath("/eventis", "layout");
    return result;
  });
}

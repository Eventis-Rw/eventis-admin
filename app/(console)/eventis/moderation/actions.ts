"use server";

import { apiFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";

import { getMockStore, recordMockAudit } from "@/lib/mock/data";
import { USE_MOCK_DATA } from "@/lib/config";
import { requirePermission } from "@/lib/session";
import type { ActionResult } from "../users/actions";

export async function resolveReportAction(
  reportId: string,
  outcome: "resolved" | "dismissed",
): Promise<ActionResult> {
  if (outcome !== "resolved" && outcome !== "dismissed")
    return { ok: false, message: "Invalid request." };
  try {
    await requirePermission("reports:manage");
  } catch {
    return {
      ok: false,
      message: "You do not have permission to manage reports.",
    };
  }
  if (!USE_MOCK_DATA) {
    try {
      const { token } = await requirePermission("reports:manage");
      await apiFetch(`/admin/reports/${encodeURIComponent(reportId)}`, {
        token,
        method: "PATCH",
        body: { outcome },
      });
      revalidatePath("/eventis", "layout");
      return { ok: true, message: "Report updated." };
    } catch (error) {
      return {
        ok: false,
        message:
          error instanceof Error ? error.message : "Could not update report",
      };
    }
  }

  const report = getMockStore().reports.find((item) => item.id === reportId);
  if (!report) return { ok: false, message: "That report no longer exists." };
  report.status = outcome;
  recordMockAudit(
    outcome === "resolved" ? "Resolved report" : "Dismissed report",
    `${report.id} · ${report.reason}`,
  );
  revalidatePath("/eventis", "layout");
  return {
    ok: true,
    message: outcome === "resolved" ? "Report resolved." : "Report dismissed.",
  };
}

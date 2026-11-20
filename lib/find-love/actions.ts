"use server";

import { apiFetch } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { USE_MOCK_DATA } from "@/lib/config";

import { revalidatePath } from "next/cache";

import {
  moderatePhotoItem,
  recordInstallmentPayment,
  refundTransaction,
  resolveSafetyReport,
  reviewVerificationSubmission,
  updatePlanPricing,
  updateSupportTicket,
  updateUserAccountStatus,
} from "./store";
import type {
  AccountType,
  PlanPeriod,
  SupportTicket,
  VerificationStatus,
} from "./types";

async function legacyActionGuard() {
  await requireAdmin();
  return USE_MOCK_DATA
    ? null
    : {
        success: false,
        error: "This legacy action is not connected to the backend yet.",
      };
}

export async function updateUserStatusAction(formData: FormData) {
  const unavailable = await legacyActionGuard();
  if (unavailable) return unavailable;
  const userId = formData.get("userId") as string;
  const status = formData.get("status") as "active" | "suspended" | "banned";
  const reason = (formData.get("reason") as string) || "Administrative action";
  const actor = (formData.get("actor") as string) || "Admin Tester";

  if (!userId || !status) {
    return { success: false, error: "Missing required fields" };
  }

  try {
    updateUserAccountStatus(userId, status, reason, actor);
    revalidatePath("/find-love/users");
    revalidatePath(`/find-love/users/${userId}`);
    revalidatePath("/find-love");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update status",
    };
  }
}

export async function reviewVerificationAction(formData: FormData) {
  const unavailable = await legacyActionGuard();
  if (unavailable) return unavailable;
  const docId = formData.get("docId") as string;
  const status = formData.get("status") as VerificationStatus;
  const notes = (formData.get("notes") as string) || "";
  const reviewer = (formData.get("reviewer") as string) || "Admin Tester";

  if (!docId || !status) {
    return { success: false, error: "Missing required fields" };
  }

  try {
    reviewVerificationSubmission(docId, status, notes, reviewer);
    revalidatePath("/find-love/verification");
    revalidatePath("/find-love/users");
    revalidatePath("/find-love");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to review verification",
    };
  }
}

export async function updatePricingAction(formData: FormData) {
  const unavailable = await legacyActionGuard();
  if (unavailable) return unavailable;
  const accountType = formData.get("accountType") as AccountType;
  const period = formData.get("period") as PlanPeriod;
  const newPrice = Number(formData.get("newPrice"));
  const effectiveDate =
    (formData.get("effectiveDate") as string) ||
    new Date().toISOString().slice(0, 10);
  const reason =
    (formData.get("reason") as string) || "Regular rate adjustment";
  const actor = (formData.get("actor") as string) || "Finance Lead";

  if (!accountType || !period || isNaN(newPrice) || newPrice <= 0) {
    return { success: false, error: "Invalid price parameters" };
  }

  try {
    updatePlanPricing(
      accountType,
      period,
      newPrice,
      effectiveDate,
      reason,
      actor,
    );
    revalidatePath("/find-love/subscriptions");
    revalidatePath("/find-love");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update pricing",
    };
  }
}

export async function recordInstallmentPaymentAction(formData: FormData) {
  const unavailable = await legacyActionGuard();
  if (unavailable) return unavailable;
  const installmentId = formData.get("installmentId") as string;
  const paymentMethod =
    (formData.get("paymentMethod") as string) || "MTN Mobile Money";
  const reference =
    (formData.get("reference") as string) ||
    `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
  const actor = (formData.get("actor") as string) || "Finance Lead";

  if (!installmentId) {
    return { success: false, error: "Missing installment ID" };
  }

  try {
    recordInstallmentPayment(installmentId, paymentMethod, reference, actor);
    revalidatePath("/find-love/payments");
    revalidatePath("/find-love/users");
    revalidatePath("/find-love");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to record payment",
    };
  }
}

export async function refundTransactionAction(formData: FormData) {
  const unavailable = await legacyActionGuard();
  if (unavailable) return unavailable;
  const transactionId = formData.get("transactionId") as string;
  const reason =
    (formData.get("reason") as string) || "Customer refund request approved";
  const actor = (formData.get("actor") as string) || "Finance Lead";

  if (!transactionId) {
    return { success: false, error: "Missing transaction ID" };
  }

  try {
    refundTransaction(transactionId, reason, actor);
    revalidatePath("/find-love/payments");
    revalidatePath("/find-love");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to process refund",
    };
  }
}

export async function moderatePhotoAction(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  if (!USE_MOCK_DATA) {
    const { token } = await requireAdmin();
    try {
      await apiFetch(
        `/admin/findlove/photos/${encodeURIComponent(String(formData.get("photoId") ?? ""))}`,
        {
          token,
          method: "PATCH",
          body: {
            status: formData.get("status"),
            reason: formData.get("reason") ?? "",
          },
        },
      );
      revalidatePath("/find-love/profiles");
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Could not review photo",
      };
    }
  }

  const unavailable = await legacyActionGuard();
  if (unavailable) return unavailable;
  const photoId = formData.get("photoId") as string;
  const status = formData.get("status") as "approved" | "rejected";
  const reason = (formData.get("reason") as string) || "";
  const reviewer = (formData.get("reviewer") as string) || "Moderator Grace";

  if (!photoId || !status) {
    return { success: false, error: "Missing parameters" };
  }

  try {
    moderatePhotoItem(photoId, status, reason, reviewer);
    revalidatePath("/find-love/profiles");
    revalidatePath("/find-love");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to moderate photo",
    };
  }
}

export async function updateSupportTicketAction(
  formData: FormData,
): Promise<{ success: boolean; error?: string; ticket?: SupportTicket }> {
  if (!USE_MOCK_DATA) {
    const { token } = await requireAdmin();
    const id = String(formData.get("ticketId") ?? "");
    try {
      await apiFetch(`/admin/findlove/support/${encodeURIComponent(id)}`, {
        token,
        method: "POST",
        body: {
          status: formData.get("status") ?? undefined,
          reply: formData.get("replyContent") ?? undefined,
          note: formData.get("internalNote") ?? undefined,
          requestId: formData.get("requestId") ?? crypto.randomUUID(),
        },
      });
      const tickets = await apiFetch<SupportTicket[]>(
        "/admin/findlove/support",
        { token },
      );
      revalidatePath("/find-love/support");
      return { success: true, ticket: tickets.find((t) => t.id === id) };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not update support ticket",
      };
    }
  }

  const unavailable = await legacyActionGuard();
  if (unavailable) return unavailable;
  const ticketId = formData.get("ticketId") as string;
  const status = formData.get("status") as SupportTicket["status"] | undefined;
  const priority = formData.get("priority") as
    SupportTicket["priority"] | undefined;
  const assignedTo = formData.get("assignedTo") as string | undefined;
  const replyContent = formData.get("replyContent") as string | undefined;
  const internalNote = formData.get("internalNote") as string | undefined;
  const actor = (formData.get("actor") as string) || "Support Agent";

  if (!ticketId) {
    return { success: false, error: "Missing ticket ID" };
  }

  try {
    updateSupportTicket(
      ticketId,
      { status, priority, assignedTo },
      replyContent,
      internalNote,
      actor,
    );
    revalidatePath("/find-love/support");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update ticket",
    };
  }
}

export async function resolveSafetyReportAction(formData: FormData) {
  const unavailable = await legacyActionGuard();
  if (unavailable) return unavailable;
  const reportId = formData.get("reportId") as string;
  const actionTaken =
    (formData.get("actionTaken") as string) || "Investigation concluded";
  const resolutionNotes = (formData.get("resolutionNotes") as string) || "";
  const suspendUser = formData.get("suspendUser") === "true";
  const actor = (formData.get("actor") as string) || "Moderator Grace";

  if (!reportId) {
    return { success: false, error: "Missing report ID" };
  }

  try {
    resolveSafetyReport(
      reportId,
      actionTaken,
      resolutionNotes,
      suspendUser,
      actor,
    );
    revalidatePath("/find-love/safety");
    revalidatePath("/find-love/users");
    revalidatePath("/find-love");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to resolve report",
    };
  }
}

export async function sendNotificationPreviewAction(id: string) {
  const { token } = await requireAdmin();
  if (USE_MOCK_DATA)
    return { success: true, message: "Demo preview simulated." };
  try {
    return await apiFetch<{ success: boolean; message: string }>(
      `/admin/findlove/notifications/${encodeURIComponent(id)}/preview`,
      { token, method: "POST" },
    );
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Could not save preview",
    };
  }
}

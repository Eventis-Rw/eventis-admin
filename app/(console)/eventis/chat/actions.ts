"use server";

import { revalidatePath } from "next/cache";

import { apiFetch } from "@/lib/api";
import { requirePermission } from "@/lib/session";
import type { ActionResult } from "../users/actions";

function failure(error: unknown, fallback: string): ActionResult {
  return { ok: false, message: error instanceof Error ? error.message : fallback };
}

export async function setConversationStatusAction(
  conversationId: string,
  status: "ACTIVE" | "SUSPENDED" | "DELETED",
  reason: string,
): Promise<ActionResult> {
  if (!reason.trim()) return { ok: false, message: "A reason is required." };
  try {
    const permission = status === "DELETED" ? "chat:groups:delete" : "chat:groups:suspend";
    const { token } = await requirePermission(permission);
    await apiFetch(`/admin/chat/conversations/${conversationId}/status`, {
      token,
      method: "PATCH",
      body: { status, reason },
    });
    revalidatePath("/eventis/chat", "layout");
    return { ok: true, message: "Conversation updated." };
  } catch (error) {
    return failure(error, "Could not update this conversation.");
  }
}

export async function removeMemberAction(
  conversationId: string,
  userId: string,
  reason: string,
): Promise<ActionResult> {
  if (!reason.trim()) return { ok: false, message: "A reason is required." };
  try {
    const { token } = await requirePermission("chat:members:manage");
    await apiFetch(`/admin/chat/conversations/${conversationId}/members/${userId}/remove`, {
      token,
      method: "POST",
      body: { reason },
    });
    revalidatePath("/eventis/chat", "layout");
    return { ok: true, message: "Member removed." };
  } catch (error) {
    return failure(error, "Could not remove this member.");
  }
}

export async function transferOwnershipAction(
  conversationId: string,
  userId: string,
  reason: string,
): Promise<ActionResult> {
  if (!reason.trim()) return { ok: false, message: "A reason is required." };
  try {
    const { token } = await requirePermission("chat:groups:manage");
    await apiFetch(`/admin/chat/conversations/${conversationId}/transfer-ownership`, {
      token,
      method: "POST",
      body: { userId, reason },
    });
    revalidatePath("/eventis/chat", "layout");
    return { ok: true, message: "Ownership transferred." };
  } catch (error) {
    return failure(error, "Could not transfer ownership.");
  }
}

export async function assignReportAction(
  reportId: string,
  assigneeId: string,
): Promise<ActionResult> {
  try {
    const { token } = await requirePermission("chat:reports:manage");
    await apiFetch(`/admin/chat/reports/${reportId}/assign`, {
      token,
      method: "POST",
      body: { assigneeId },
    });
    revalidatePath("/eventis/chat", "layout");
    return { ok: true, message: "Report assigned." };
  } catch (error) {
    return failure(error, "Could not assign this report.");
  }
}

export async function addReportNoteAction(
  reportId: string,
  note: string,
): Promise<ActionResult> {
  if (!note.trim()) return { ok: false, message: "Enter a note first." };
  try {
    const { token } = await requirePermission("chat:reports:manage");
    await apiFetch(`/admin/chat/reports/${reportId}/notes`, {
      token,
      method: "POST",
      body: { note },
    });
    revalidatePath("/eventis/chat", "layout");
    return { ok: true, message: "Note added." };
  } catch (error) {
    return failure(error, "Could not add this note.");
  }
}

export async function actionReportAction(
  reportId: string,
  outcome: "ACTIONED" | "DISMISSED",
  reason: string,
): Promise<ActionResult> {
  if (!reason.trim()) return { ok: false, message: "A reason is required." };
  try {
    const { token } = await requirePermission("chat:moderation:manage");
    await apiFetch(`/admin/chat/reports/${reportId}/action`, {
      token,
      method: "POST",
      body: { outcome, reason },
    });
    revalidatePath("/eventis/chat", "layout");
    return {
      ok: true,
      message: outcome === "ACTIONED" ? "Report actioned." : "Report dismissed.",
    };
  } catch (error) {
    return failure(error, "Could not update this report.");
  }
}

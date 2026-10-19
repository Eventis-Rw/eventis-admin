"use server";

import { revalidatePath } from "next/cache";

import { ApiError, apiFetch } from "@/lib/api";
import { USE_MOCK_DATA } from "@/lib/config";
import { getMockStore, recordMockAudit } from "@/lib/mock/data";
import { requirePermission } from "@/lib/session";

export interface ActionResult {
  ok: boolean;
  message: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function setUserStatusAction(userId: string, action: "suspend" | "activate"): Promise<ActionResult> {
  if ((!USE_MOCK_DATA && !UUID.test(userId)) || (action !== "suspend" && action !== "activate")) {
    return { ok: false, message: "Invalid request." };
  }

  let session;
  try {
    session = await requirePermission("users:manage");
  } catch {
    return { ok: false, message: "You do not have permission to manage users." };
  }

  if (action === "suspend" && session.user.id === userId) {
    return { ok: false, message: "You cannot suspend your own account." };
  }

  if (USE_MOCK_DATA) {
    const target = getMockStore().users.find((user) => user.id === userId);
    if (!target) return { ok: false, message: "That user no longer exists." };
    target.status = action === "suspend" ? "INACTIVE" : "ACTIVE";
    recordMockAudit(action === "suspend" ? "Suspended account" : "Reactivated account", target.displayName ?? target.phone);
    revalidatePath("/eventis", "layout");
    return { ok: true, message: action === "suspend" ? "Account suspended." : "Account reactivated." };
  }

  try {
    await apiFetch(`/admin/users/${userId}/${action}`, { method: "POST", token: session.token });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) return { ok: false, message: "Your session has expired. Reload and sign in again." };
      if (error.status === 403) return { ok: false, message: "The API refused this action for your role." };
      if (error.status === 404) return { ok: false, message: "That user no longer exists." };
      return { ok: false, message: error.message };
    }
    return { ok: false, message: "The action failed. Please try again." };
  }

  revalidatePath("/eventis", "layout");
  return { ok: true, message: action === "suspend" ? "Account suspended." : "Account reactivated." };
}

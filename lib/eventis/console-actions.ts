"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, toResult } from "@/lib/api";
import { USE_MOCK_DATA } from "@/lib/config";
import { requireAdmin } from "@/lib/session";
import { organiserWorkflows, type OrganiserWorkflow } from "./console-settings";

type Feedback = { error?: string; message?: string };

function field(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function submit(path: string, method: "POST" | "PUT" | "PATCH" | "DELETE", body: unknown, refresh: string): Promise<Feedback> {
  const { token } = await requireAdmin();
  if (USE_MOCK_DATA) return { error: "Switch to API mode to save changes." };
  const result = await toResult(() => apiFetch(path, { token, method, body }));
  if (!result.ok) return { error: result.error };
  revalidatePath(refresh);
  return { message: "Saved." };
}

export async function saveEventisSettings(_: Feedback, form: FormData) {
  const displayName = field(form, "displayName");
  const supportEmail = field(form, "supportEmail") || null;
  const announcement = field(form, "announcement") || null;
  if (!displayName) return { error: "Enter the platform display name." };
  const result = await submit("/admin/eventis/settings", "PUT", {
    displayName, supportEmail, announcement, revision: Number(field(form, "revision")),
  }, "/eventis/settings");
  if (result.message) revalidatePath("/eventis", "layout");
  return result;
}

export async function saveConsoleRole(id: string | null, _: Feedback, form: FormData) {
  const name = field(form, "name");
  const permissions = form.getAll("permissions");
  if (field(form, "operation") === "delete" && id) {
    return submit(`/admin/console-roles/${encodeURIComponent(id)}`, "DELETE", undefined, "/eventis/settings");
  }
  if (name.length < 2 || !permissions.length) return { error: "Enter a role name and select at least one permission." };
  return submit(id ? `/admin/console-roles/${encodeURIComponent(id)}` : "/admin/console-roles",
    id ? "PUT" : "POST", { name, permissions }, "/eventis/settings");
}

export async function assignConsoleRole(id: string, _: Feedback, form: FormData) {
  return submit(`/admin/console-roles/assignments/${encodeURIComponent(id)}`, "PUT",
    { roleId: field(form, "roleId") || null }, "/eventis/settings");
}

export async function reviewOrganiser(workflow: OrganiserWorkflow, id: string, _: Feedback, form: FormData) {
  const operation = field(form, "operation");
  const path = `${organiserWorkflows[workflow].endpoint}/${encodeURIComponent(id)}`;
  const refresh = `/eventis/organisers/${workflow}`;
  if (operation === "activate" && workflow !== "verification") {
    if (workflow === "subscriptions" && !form.has("paymentConfirmed")) {
      return { error: "Confirm that you verified the payment before activating." };
    }
    return submit(`${path}/activate`, "POST", undefined, refresh);
  }
  if (workflow === "subscriptions" || !["approve", "reject"].includes(operation)) {
    return { error: "Choose a valid action." };
  }
  const rejectionReason = field(form, "rejectionReason");
  if (operation === "reject" && !rejectionReason) return { error: "Enter a rejection reason." };
  const status = operation === "reject" ? "REJECTED" : workflow === "verification" ? "VERIFIED" : "APPROVED";
  return submit(path, "PATCH", { status, rejectionReason: rejectionReason || null }, refresh);
}

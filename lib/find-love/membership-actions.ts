"use server";
import { revalidatePath } from "next/cache";
import { apiFetch, toResult } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import type { Command, Demo } from "@/lib/find-love/membership-demo";
export interface LiveMembershipSnapshot {
  state: Demo;
  revision: number;
}
export async function saveMembershipCommand(
  command: Command,
  revision: number,
  requestId: string,
) {
  const { token } = await requireAdmin();
  return toResult(async () => {
    const result = await apiFetch<LiveMembershipSnapshot>(
      "/admin/findlove-workspace/commands",
      {
        method: "POST",
        token,
        body: { command, revision, requestId },
      },
    );
    revalidatePath("/find-love", "layout");
    return result;
  });
}

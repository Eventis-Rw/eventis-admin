"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, toResult } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import {
  validateOrganiserCatalog,
  type OrganiserCatalog,
} from "@/lib/organiser-plans";
export type LiveOrganiserCatalog = OrganiserCatalog & { revision: number };
export async function saveOrganiserCatalog(catalog: LiveOrganiserCatalog) {
  const { token } = await requireAdmin();
  return toResult(async () => {
    validateOrganiserCatalog(catalog);
    const result = await apiFetch<LiveOrganiserCatalog>(
      "/admin/organiser-catalog",
      {
        method: "PUT",
        token,
        body: catalog,
      },
    );
    revalidatePath("/eventis", "layout");
    return result;
  });
}

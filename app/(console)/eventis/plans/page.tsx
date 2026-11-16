import type { Metadata } from "next";
import { OrganiserPlans } from "@/components/eventis/organiser-plans";
import { apiFetch } from "@/lib/api";
import { USE_MOCK_DATA } from "@/lib/config";
import type { LiveOrganiserCatalog } from "@/lib/eventis/organiser-catalog-actions";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Plans & pricing" };

export default async function OrganiserPlansPage() {
  const { token } = await requireAdmin();
  if (USE_MOCK_DATA) return <OrganiserPlans />;
  const initialCatalog = await apiFetch<LiveOrganiserCatalog>(
    "/admin/organiser-catalog",
    { token },
  );
  return <OrganiserPlans initialCatalog={initialCatalog} />;
}

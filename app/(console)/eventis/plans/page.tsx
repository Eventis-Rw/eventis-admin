import type { Metadata } from "next";
import { OrganiserPlans } from "@/components/eventis/organiser-plans";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Plans & pricing" };

export default async function OrganiserPlansPage() {
  await requireAdmin();
  return <OrganiserPlans />;
}

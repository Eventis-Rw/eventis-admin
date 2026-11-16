import { requireAdmin } from "@/lib/session";
import { apiFetch, toResult } from "@/lib/api";
import type { NotificationTemplate } from "@/lib/find-love/types";
import { USE_MOCK_DATA } from "@/lib/config";
import { ErrorState } from "@/components/ui/states";
import type { Metadata } from "next";

import { NotificationsView } from "@/components/find-love/notifications-view";
import { getFindLoveStore } from "@/lib/find-love/store";

export const metadata: Metadata = {
  title: "Notifications & Reminders — FindLove Admin",
  description:
    "Configure automated installment reminders, verification notices, and safety announcements.",
};

export default async function FindLoveNotificationsPage() {
  const { token } = await requireAdmin();
  const result = USE_MOCK_DATA
    ? {
        ok: true as const,
        data: { templates: getFindLoveStore().notifications, stats: undefined },
      }
    : await toResult(() =>
        apiFetch<{
          templates: NotificationTemplate[];
          stats: { sent: number; deliveryRate: string; reminders: number };
        }>("/admin/findlove/notifications", { token }),
      );
  if (!result.ok)
    return (
      <ErrorState title="Could not load notifications" message={result.error} />
    );

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Notifications & Reminders
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure automated member notices for installment due dates, overdue
          grace periods, verification results, and subscription renewals.
        </p>
      </div>

      <NotificationsView
        templates={result.data.templates}
        stats={result.data.stats}
      />
    </div>
  );
}

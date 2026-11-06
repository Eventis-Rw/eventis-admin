import type { Metadata } from "next";

import { NotificationsView } from "@/components/find-love/notifications-view";
import { getFindLoveStore } from "@/lib/find-love/store";

export const metadata: Metadata = {
  title: "Notifications & Reminders — FindLove Admin",
  description: "Configure automated installment reminders, verification notices, and safety announcements.",
};

export default function FindLoveNotificationsPage() {
  const store = getFindLoveStore();

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Notifications & Reminders
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure automated member notices for installment due dates, overdue grace periods, verification results, and subscription renewals.
        </p>
      </div>

      <NotificationsView templates={store.notifications} />
    </div>
  );
}

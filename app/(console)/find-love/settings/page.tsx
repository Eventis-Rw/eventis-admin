import type { Metadata } from "next";

import { SettingsView } from "@/components/find-love/settings-view";
import { getFindLoveStore } from "@/lib/find-love/store";

export const metadata: Metadata = {
  title: "System Settings & Business Rules — FindLove Admin",
  description: "Configure installment rules, grace periods, currency, and access restriction parameters.",
};

export default function FindLoveSettingsPage() {
  const store = getFindLoveStore();

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Platform Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure installment schedules, grace periods, overdue policies, and platform currency rules.
        </p>
      </div>

      <SettingsView initialSettings={store.settings} />
    </div>
  );
}

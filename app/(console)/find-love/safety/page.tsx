import type { Metadata } from "next";

import { SafetyView } from "@/components/find-love/safety-view";
import { getFindLoveStore } from "@/lib/find-love/store";

export const metadata: Metadata = {
  title: "Reports & Safety Moderation — FindLove Admin",
  description: "Investigate harassment complaints, scam reports, fake profiles, and enforce community standards.",
};

export default function FindLoveSafetyPage() {
  const store = getFindLoveStore();

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Reports & Community Safety
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review community complaints, investigate abuse and fraud, take disciplinary action, and preserve user trust.
        </p>
      </div>

      <SafetyView reports={store.safetyReports} />
    </div>
  );
}

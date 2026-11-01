import type { Metadata } from "next";

import { SupportView } from "@/components/find-love/support-view";
import { getFindLoveStore } from "@/lib/find-love/store";

export const metadata: Metadata = {
  title: "Messages & Customer Support — FindLove Admin",
  description: "Customer support ticket inbox, internal notes, category assignment, and dispute resolution.",
};

export default function FindLoveSupportPage() {
  const store = getFindLoveStore();

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Messages & Customer Support
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Handle member support tickets, payment inquiries, account questions, and confidential internal coordination.
        </p>
      </div>

      <SupportView tickets={store.tickets} />
    </div>
  );
}

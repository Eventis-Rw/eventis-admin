import type { Metadata } from "next";

import { ConnectionsView } from "@/components/find-love/connections-view";
import { getFindLoveStore } from "@/lib/find-love/store";

export const metadata: Metadata = {
  title: "Connection Requests — FindLove Admin",
  description: "Monitor dating match requests, investigate reported connections, and maintain dating privacy standards.",
};

export default function FindLoveConnectionsPage() {
  const store = getFindLoveStore();

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Connections Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review member matching activity and reported interactions while preserving user autonomy and dating privacy.
        </p>
      </div>

      <ConnectionsView initialConnections={store.connections} />
    </div>
  );
}

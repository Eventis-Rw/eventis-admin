import type { Metadata } from "next";

import { StatisticsView } from "@/components/find-love/statistics-view";
import { getFindLoveStats, getFindLoveStore } from "@/lib/find-love/store";

export const metadata: Metadata = {
  title: "Statistics & Business Analytics — FindLove Admin",
  description: "Comprehensive financial analytics, user growth reports, and data exports for FindLove.",
};

export default function FindLoveStatisticsPage() {
  const store = getFindLoveStore();
  const stats = getFindLoveStats("all");

  return (
    <StatisticsView
      initialStats={stats}
      users={store.users}
      transactions={store.transactions}
    />
  );
}

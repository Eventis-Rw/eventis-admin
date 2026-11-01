import type { Metadata } from "next";

import { FindLoveOverviewDashboard } from "@/components/find-love/overview-dashboard";
import { getFindLoveStats } from "@/lib/find-love/store";

export const metadata: Metadata = {
  title: "FindLove Dashboard — Overview",
  description: "Administrative dashboard for FindLove dating platform",
};

export default function FindLoveOverviewPage() {
  const initialStats = getFindLoveStats("all");
  return <FindLoveOverviewDashboard initialStats={initialStats} />;
}

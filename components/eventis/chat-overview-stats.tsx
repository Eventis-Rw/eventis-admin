import { Flag, MessageCircle, MessagesSquare, ShieldAlert, Users2 } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { fmtNumber } from "@/lib/format";
import type { ChatOverview } from "@/types";

export function ChatOverviewStats({ overview }: { overview: ChatOverview }) {
  return (
    <section aria-label="Chat platform metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total conversations" value={fmtNumber(overview.totalConversations)} icon={MessagesSquare} hint={`${fmtNumber(overview.totalDirect)} direct · ${fmtNumber(overview.totalGroup)} group`} />
      <StatCard label="Active groups" value={fmtNumber(overview.activeGroups)} icon={Users2} tone="success" hint={`${fmtNumber(overview.publicGroups)} public · ${fmtNumber(overview.privateGroups)} private`} />
      <StatCard label="Suspended groups" value={fmtNumber(overview.suspendedGroups)} icon={ShieldAlert} tone={overview.suspendedGroups ? "danger" : "neutral"} />
      <StatCard label="Group members" value={fmtNumber(overview.registeredGroupMembers)} icon={Users2} hint="Active memberships across all groups" />
      <StatCard label="Total messages" value={fmtNumber(overview.totalMessages)} icon={MessageCircle} />
      <StatCard label="Reported conversations" value={fmtNumber(overview.reportedConversations)} icon={Flag} tone={overview.reportedConversations ? "warning" : "neutral"} href="/eventis/chat/reports" />
    </section>
  );
}

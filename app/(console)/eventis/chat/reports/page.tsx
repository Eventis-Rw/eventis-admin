import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ChatReportsTable } from "@/components/eventis/chat-reports-table";
import { ErrorState } from "@/components/ui/states";
import { loadChatReports } from "@/lib/eventis/chat-data";
import { loadConsoleAccess } from "@/lib/eventis/console-access";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Chat Reports" };

export default async function ChatReportsPage() {
  const { token } = await requireAdmin();
  const [reports, access] = await Promise.all([
    loadChatReports(token),
    loadConsoleAccess(token),
  ]);

  if (!reports.ok) return <ErrorState message={reports.error} />;

  const unrestricted = !access || access.unrestricted;
  const canManage = unrestricted || Boolean(access?.permissions.includes("chat:moderation:manage"));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/eventis/chat" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Chat Management
        </Link>
        <h1 className="mt-2 text-xl font-bold tracking-tight">Reports & moderation</h1>
        <p className="text-sm text-muted-foreground">
          Reports against users, groups, direct conversations and messages, extending the same UserReport
          records used across Eventis.
        </p>
      </div>

      <ChatReportsTable reports={reports.data} canManage={canManage} />
    </div>
  );
}

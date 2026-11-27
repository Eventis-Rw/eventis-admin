import type { Metadata } from "next";
import Link from "next/link";

import { ChatConversationsTable } from "@/components/eventis/chat-conversations-table";
import { ChatOverviewStats } from "@/components/eventis/chat-overview-stats";
import { ErrorState } from "@/components/ui/states";
import { loadChatConversations, loadChatOverview } from "@/lib/eventis/chat-data";
import { loadConsoleAccess } from "@/lib/eventis/console-access";
import type { ConsolePermission } from "@/lib/eventis/console-settings";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Chat Management" };

export default async function ChatManagementPage() {
  const { token } = await requireAdmin();
  const [overview, conversations, access] = await Promise.all([
    loadChatOverview(token),
    loadChatConversations(token, { limit: 200 }),
    loadConsoleAccess(token),
  ]);

  const unrestricted = !access || access.unrestricted;
  const has = (permission: ConsolePermission) =>
    unrestricted || Boolean(access?.permissions.includes(permission));

  if (!overview.ok) return <ErrorState message={overview.error} />;
  if (!conversations.ok) return <ErrorState message={conversations.error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Chat Management</h1>
          <p className="text-sm text-muted-foreground">Direct messages and groups, from real backend data.</p>
        </div>
        <Link href="/eventis/chat/reports" className="text-sm font-semibold text-primary hover:underline">
          View reports →
        </Link>
      </div>

      <ChatOverviewStats overview={overview.data} />

      <ChatConversationsTable
        conversations={conversations.data.items}
        canManage={has("chat:groups:manage") || has("chat:groups:suspend") || has("chat:groups:delete") || has("chat:members:manage")}
        canSuspend={has("chat:groups:suspend")}
        canDelete={has("chat:groups:delete")}
        canManageMembers={has("chat:members:manage")}
      />
    </div>
  );
}

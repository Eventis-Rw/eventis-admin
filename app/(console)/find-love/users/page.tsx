import type { Metadata } from "next";

import { UsersTable } from "@/components/find-love/users-table";
import { getFindLoveUsers } from "@/lib/find-love/store";

export const metadata: Metadata = {
  title: "FindLove User Management",
  description: "Search members, filter public and private accounts, verify identity documents, and manage account statuses.",
};

export default function FindLoveUsersPage() {
  const users = getFindLoveUsers();

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">User Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage member accounts, review public/private subscriptions, enforce safety standards, and inspect user profiles.
        </p>
      </div>

      <UsersTable initialUsers={users} />
    </div>
  );
}

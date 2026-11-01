import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { UserProfileView } from "@/components/find-love/user-profile-view";
import { getFindLoveUserById } from "@/lib/find-love/store";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { user } = getFindLoveUserById(id);
  if (!user) return { title: "User Not Found — FindLove" };
  return { title: `${user.displayName} (@${user.username}) — FindLove Profile` };
}

export default async function FindLoveUserProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const userData = getFindLoveUserById(id);

  if (!userData.user) {
    notFound();
  }

  return (
    <UserProfileView
      user={userData.user}
      installments={userData.installments}
      transactions={userData.transactions}
      verificationDoc={userData.verificationDoc}
      connections={userData.connections}
      tickets={userData.tickets}
      safetyReports={userData.safetyReports}
      photos={userData.photos}
      auditLogs={userData.auditLogs}
      initialTab={tab ?? "overview"}
    />
  );
}

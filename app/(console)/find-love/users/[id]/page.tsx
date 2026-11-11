import { notFound } from "next/navigation";
import { MembershipWorkspace } from "@/components/find-love/membership/workspace";
import { seedMembershipDemo } from "@/lib/find-love/membership-demo";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!seedMembershipDemo().members.some(member => member.id === id)) notFound();
  return <MembershipWorkspace view="members" memberId={id} />;
}

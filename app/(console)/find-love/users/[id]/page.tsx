import { MembershipPage } from "@/components/find-love/membership/page";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MembershipPage view="members" memberId={id} />;
}

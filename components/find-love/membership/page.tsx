import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { USE_MOCK_DATA } from "@/lib/config";
import { requireAdmin } from "@/lib/session";
import { seedMembershipDemo } from "@/lib/find-love/membership-demo";
import type { LiveMembershipSnapshot } from "@/lib/find-love/membership-actions";
import { MembershipWorkspace, type MembershipView } from "./workspace";
export async function MembershipPage(props: {
  view?: MembershipView;
  memberId?: string;
}) {
  const { token } = await requireAdmin();
  if (USE_MOCK_DATA) {
    if (
      props.memberId &&
      !seedMembershipDemo().members.some((m) => m.id === props.memberId)
    )
      notFound();
    return <MembershipWorkspace {...props} />;
  }
  const snapshot = await apiFetch<LiveMembershipSnapshot>(
    "/admin/findlove-workspace",
    { token },
  );
  if (
    props.memberId &&
    !snapshot.state.members.some((m) => m.id === props.memberId)
  )
    notFound();
  return <MembershipWorkspace {...props} initialSnapshot={snapshot} />;
}

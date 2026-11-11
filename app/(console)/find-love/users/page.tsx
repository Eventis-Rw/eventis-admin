import type { Metadata } from "next";
import { MembershipWorkspace } from "@/components/find-love/membership/workspace";

export const metadata: Metadata = { title: "FindLove Administration", description: "Demo membership plans, payments and member access controls." };

export default function Page() {
  return <MembershipWorkspace view="members" />;
}

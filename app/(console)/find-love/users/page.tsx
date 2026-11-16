import type { Metadata } from "next";
import { MembershipPage } from "@/components/find-love/membership/page";

export const metadata: Metadata = {
  title: "FindLove Administration",
  description: "Demo membership plans, payments and member access controls.",
};

export default function Page() {
  return <MembershipPage view="members" />;
}

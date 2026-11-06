import type { Metadata } from "next";

import { VerificationView } from "@/components/find-love/verification-view";
import { getFindLoveStore } from "@/lib/find-love/store";

export const metadata: Metadata = {
  title: "Identity Verification Reviews — FindLove Admin",
  description: "Review National ID and passport submissions under restricted access and audit logging.",
};

export default function FindLoveVerificationPage() {
  const store = getFindLoveStore();

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Identity Verification</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review member national ID cards and passports, ensure authenticity, and maintain a trusted dating environment.
        </p>
      </div>

      <VerificationView documents={store.verificationDocs} users={store.users} />
    </div>
  );
}

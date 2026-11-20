import type { Metadata } from "next";

import { ManualPaymentsReview } from "@/components/manual-payments/review-table";
import { ErrorState } from "@/components/ui/states";
import { USE_MOCK_DATA } from "@/lib/config";
import { loadManualPaymentMethods, loadManualPaymentsPage } from "@/lib/manual-payments/data";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Manual Payments — FindLove Admin",
  description: "Review member-submitted payment screenshots and approve or reject FindLove memberships.",
};

export default async function FindLoveManualPaymentsPage() {
  const { token } = await requireAdmin();

  if (USE_MOCK_DATA) {
    return (
      <div className="space-y-6">
        <Header />
        <p className="text-sm text-muted-foreground">
          Manual payment review is driven by the live API and is available in API mode.
        </p>
      </div>
    );
  }

  const [methods, page] = await Promise.all([
    loadManualPaymentMethods(token, "findlove"),
    loadManualPaymentsPage(token, { platform: "findlove" }),
  ]);

  if (!page.ok) return <ErrorState title="Could not load manual payments" message={page.error} />;

  return (
    <div className="space-y-6">
      <Header />
      <ManualPaymentsReview platform="findlove" initialPage={page.data} methods={methods.ok ? methods.data : []} />
    </div>
  );
}

function Header() {
  return (
    <div className="border-b border-border pb-4">
      <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Manual Payments</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Members who paid an MTN Mobile Money or Airtel Money number out of band and uploaded a screenshot as
        proof. Approving activates the membership and emails the member; rejecting requires a reason and also
        emails the member. This is separate from the transaction-reference flow on the Membership Payments page.
      </p>
    </div>
  );
}

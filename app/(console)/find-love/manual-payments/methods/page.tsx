import type { Metadata } from "next";

import { ManualPaymentMethodsView } from "@/components/manual-payments/methods-view";
import { ErrorState } from "@/components/ui/states";
import { USE_MOCK_DATA } from "@/lib/config";
import { loadManualPaymentMethods } from "@/lib/manual-payments/data";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Manual Payment Methods — FindLove Admin",
  description: "Configure the MTN Mobile Money and Airtel Money numbers members pay for FindLove memberships.",
};

export default async function FindLoveManualPaymentMethodsPage() {
  const { token } = await requireAdmin();

  if (USE_MOCK_DATA) {
    return (
      <div className="space-y-6">
        <Header />
        <p className="text-sm text-muted-foreground">
          Manual payment methods are configured against the live API and are available in API mode.
        </p>
      </div>
    );
  }

  const result = await loadManualPaymentMethods(token, "findlove");
  return (
    <div className="space-y-6">
      <Header />
      {result.ok ? (
        <ManualPaymentMethodsView platform="findlove" items={result.data} />
      ) : (
        <ErrorState title="Could not load payment methods" message={result.error} />
      )}
    </div>
  );
}

function Header() {
  return (
    <div className="border-b border-border pb-4">
      <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Manual Payment Methods</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Members paying for a FindLove membership out of band see one of these numbers, then upload a screenshot
        for review on the Manual Payments page. This is separate from the transaction-reference flow on the
        Membership Payments page.
      </p>
    </div>
  );
}

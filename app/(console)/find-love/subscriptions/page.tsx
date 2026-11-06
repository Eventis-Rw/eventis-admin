import type { Metadata } from "next";

import { PricingView } from "@/components/find-love/pricing-view";
import { getFindLoveStore } from "@/lib/find-love/store";

export const metadata: Metadata = {
  title: "Subscription Plans & Pricing — FindLove Admin",
  description: "Configure weekly, monthly, and yearly pricing for public and private accounts.",
};

export default function FindLoveSubscriptionsPage() {
  const store = getFindLoveStore();

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Subscription Plans & Pricing
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set weekly, monthly, and yearly prices separately for Public and Private tiers with installment schedules and complete audit logging.
        </p>
      </div>

      <PricingView pricing={store.pricing} priceHistory={store.priceHistory} />
    </div>
  );
}

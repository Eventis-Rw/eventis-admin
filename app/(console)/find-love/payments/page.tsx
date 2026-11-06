import type { Metadata } from "next";

import { PaymentsView } from "@/components/find-love/payments-view";
import { getFindLoveStore } from "@/lib/find-love/store";

export const metadata: Metadata = {
  title: "Payments & Installments — FindLove Admin",
  description: "Track subscription installments, confirmed revenue, overdue amounts, and transactions.",
};

export default function FindLovePaymentsPage() {
  const store = getFindLoveStore();

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Payments & Installment Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor subscription cash flow, overdue installments, outstanding balances, and confirmed payment-provider reconciliations.
        </p>
      </div>

      <PaymentsView
        installments={store.installments}
        transactions={store.transactions}
        users={store.users}
      />
    </div>
  );
}

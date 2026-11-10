import type { Metadata } from "next";
import { InstallmentWorkspace } from "@/components/installments/workspace";
import { ErrorState } from "@/components/ui/states";
import { loadUsers } from "@/lib/eventis/data";
import { fullName } from "@/lib/format";
import { businessDate } from "@/lib/installments/engine";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Installments" };
export default async function InstallmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; quantity?: string }>;
}) {
  const { token, user } = await requireAdmin();
  const users = await loadUsers(token);
  if (!users.ok) return <ErrorState message={users.error} />;
  const params = await searchParams;
  const customers = users.data
    .filter((u) => u.role === "CUSTOMER")
    .map((u) => ({
      id: u.id,
      name: fullName(u),
      phone: u.phone,
      email: u.email,
    }));
  return (
    <InstallmentWorkspace
      customers={customers}
      actor={user.displayName ?? user.phone}
      today={businessDate(new Date().toISOString())}
      productId={
        typeof params.product === "string" ? params.product : undefined
      }
      quantity={Number(params.quantity) || 1}
    />
  );
}

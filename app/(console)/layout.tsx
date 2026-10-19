import { ConsoleShell } from "@/components/layout/shell";
import { USE_MOCK_DATA } from "@/lib/config";
import { fullName } from "@/lib/format";
import { requireAdmin } from "@/lib/session";

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  const name = user.displayName ?? fullName({ firstName: null, lastName: null, displayName: null, phone: user.phone });
  return (
    <ConsoleShell mock={USE_MOCK_DATA} user={{ name, phone: user.phone, roles: user.roles.map((role) => role.toLowerCase()) }}>
      {children}
    </ConsoleShell>
  );
}

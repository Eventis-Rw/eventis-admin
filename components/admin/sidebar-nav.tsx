import Link from "next/link";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/lib/admin-data";

export function SidebarNav({
  items,
  currentPath,
  onNavigate,
}: {
  items: NavigationItem[];
  currentPath: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-1.5">
      {items.map(({ href, icon: Icon, label }) => {
        const isActive = currentPath === href || (href !== "/admin" && currentPath.startsWith(href));

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              isActive
                ? "bg-zinc-900 text-white shadow-sm"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { BrandMark } from "@/assets/brand-mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { navigationItems, pageTitles } from "@/lib/admin-data";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import { Topbar } from "@/components/admin/topbar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const title = pageTitles[pathname] ?? "Dashboard";

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-zinc-200 bg-white px-4 py-5 transition-transform duration-200 md:static md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <div className="flex items-center gap-3">
              <BrandMark />
              <div>
                <p className="text-sm font-semibold tracking-wide text-zinc-900">EVENTIS</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Admin</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-6 space-y-1">
            <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Workspace
            </p>
            <SidebarNav items={navigationItems} currentPath={pathname} onNavigate={() => setSidebarOpen(false)} />
          </div>

          <div className="mt-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">System health</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-900">99.9% uptime</span>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                Stable
              </span>
            </div>
          </div>
        </aside>

        <div className="fixed inset-0 z-30 bg-zinc-950/30 md:hidden" aria-hidden={!sidebarOpen} style={{ opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? "auto" : "none" }} onClick={() => setSidebarOpen(false)} />

        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar title={title} subtitle="Jump to any report" onMenuClick={() => setSidebarOpen((open) => !open)} />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

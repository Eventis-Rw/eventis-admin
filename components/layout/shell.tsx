"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Check,
  ChevronsUpDown,
  Heart,
  LogOut,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";

import { logoutAction } from "@/app/login/actions";
import { BrandMark } from "@/components/layout/brand-mark";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { platformForPath, platforms, type Platform } from "@/lib/platforms";
import { cn } from "@/lib/utils";

import { type ConsoleAccess, type ConsolePermission, type PublicEventisSettings } from "@/lib/eventis/console-settings";

const eventisAccess: Record<string, ConsolePermission[]> = {
  "/eventis/users": ["users:read"],
  "/eventis/events": ["events:read"],
  "/eventis/plans": ["catalog:manage"],
  "/eventis/installments": ["users:read", "catalog:manage", "installments:manage"],
  "/eventis/organisers": ["users:read", "organisers:verify", "promotions:manage", "subscriptions:activate"],
  "/eventis/moderation": ["reports:manage"],
  "/eventis/audit": ["audit:read"],
};

interface ShellUser {
  name: string;
  phone: string;
  roles: string[];
}

export function ConsoleShell({
  user,
  mock,
  consoleAccess,
  eventisSettings,
  children,
}: {
  user: ShellUser;
  mock: boolean;
  consoleAccess: ConsoleAccess | null;
  eventisSettings: PublicEventisSettings | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const platform = platformForPath(pathname);
  const platformName = platform.id === "eventis" ? eventisSettings?.displayName ?? platform.name : platform.name;
  const navigation = platform.nav.filter((item) => {
    if (!consoleAccess || consoleAccess.unrestricted) return true;
    if (platform.id === "find-love") return consoleAccess.permissions.includes("findlove:manage");
    const required = eventisAccess[item.href];
    if (!required) return item.href !== "/eventis/bookings";
    return item.href === "/eventis/installments"
      ? required.every((permission) => consoleAccess.permissions.includes(permission))
      : required.some((permission) => consoleAccess.permissions.includes(permission));
  });
  const [openAt, setOpenAt] = useState<string | null>(null);
  const menuOpen = openAt === pathname;
  const setMenuOpen = (open: boolean) => setOpenAt(open ? pathname : null);

  const current =
    [...platform.nav]
      .reverse()
      .find(
        (item) =>
          pathname === item.href || pathname.startsWith(`${item.href}/`),
      ) ?? platform.nav[0];

  const findLove = platform.id === "find-love";

  useEffect(() => {
    document.documentElement.classList.toggle("find-love", findLove);
    return () => document.documentElement.classList.remove("find-love");
  }, [findLove]);

  return (
    <div
      className={cn(
        "min-h-screen bg-background lg:grid lg:grid-cols-[260px_1fr]",
        findLove && "find-love",
      )}
    >
      {menuOpen ? (
        <div
          className="fixed inset-0 z-30 bg-overlay lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-border bg-card px-3 py-4 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          menuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-2 pb-4">
          <div className="flex items-center gap-2.5">
            {findLove ? (
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Heart className="h-4 w-4" aria-hidden />
              </span>
            ) : (
              <BrandMark />
            )}
            <div className="leading-tight">
              <p className="text-sm font-extrabold tracking-tight">
                {findLove ? "FIND LOVE" : "EVENTIS"}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Admin
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <PlatformSwitcher platform={platform} />

        <nav
          aria-label={`${platformName} navigation`}
          className="mt-4 flex-1 space-y-0.5 overflow-y-auto"
        >
          {navigation.map((item) => {
            const active = current.href === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary-soft text-primary ring-1 ring-inset ring-primary/10"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="flex-1 truncate">{item.label}</span>
                {!mock && item.status === "unavailable" ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                      active ? "bg-white/20" : "bg-muted",
                    )}
                    title="Needs backend support"
                  >
                    API
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <p className="mt-3 rounded-xl bg-surface px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
          {mock ? (
            <>
              <span className="font-semibold text-foreground">
                Sample data.
              </span>{" "}
              Nothing here is connected to the API yet.
            </>
          ) : (
            <>
              <span className="font-semibold text-foreground">API</span> marks
              areas the backend does not expose yet.
            </>
          )}
        </p>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-card/85 px-4 py-3 backdrop-blur-xl sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="secondary"
              size="icon"
              className="lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                {platformName}
              </p>
              <h1 className="truncate text-lg font-bold leading-tight sm:text-xl">
                {current.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden items-center gap-2.5 rounded-xl border border-border bg-card py-1.5 pl-1.5 pr-3 sm:flex">
              <Avatar name={user.name} className="h-8 w-8" />
              <div className="leading-tight">
                <p className="max-w-[140px] truncate text-sm font-semibold">
                  {user.name}
                </p>
                <p className="text-[11px] capitalize text-muted-foreground">
                  {user.roles.includes("admin")
                    ? "Administrator"
                    : user.roles.join(", ")}
                </p>
              </div>
            </div>
            <form action={logoutAction}>
              <Button
                type="submit"
                variant="secondary"
                size="icon"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </header>

        <main className="flex-1 px-4 py-7 sm:px-7 lg:px-8">
          {!findLove && eventisSettings?.announcement ? (
            <p className="mb-5 rounded-xl border border-border bg-surface p-4 text-sm">{eventisSettings.announcement}</p>
          ) : null}
          {children}
          {!findLove && eventisSettings?.supportEmail ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Support <a className="text-primary underline" href={`mailto:${eventisSettings.supportEmail}`}>{eventisSettings.supportEmail}</a>
            </p>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function PlatformSwitcher({ platform }: { platform: Platform }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) =>
      event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Switch dashboard"
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-left hover:bg-muted"
      >
        <span className="min-w-0">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Dashboard
          </span>
          <span className="block truncate text-sm font-semibold">
            {platform.name}
          </span>
        </span>
        <ChevronsUpDown
          className="h-4 w-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label="Dashboards"
          className="absolute inset-x-0 top-full z-10 mt-1.5 rounded-xl border border-border bg-card p-1 shadow-2xl"
        >
          {Object.values(platforms).map((item) => (
            <li
              key={item.id}
              role="option"
              aria-selected={item.id === platform.id}
            >
              <Link
                href={item.basePath}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-muted"
              >
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {item.name}
                    {!item.enabled ? <Badge tone="warning">Soon</Badge> : null}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.tagline}
                  </span>
                </span>
                {item.id === platform.id ? (
                  <Check className="h-4 w-4 text-primary" aria-hidden />
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() =>
      setDark(document.documentElement.classList.contains("dark")),
    );
    return () => cancelAnimationFrame(id);
  }, []);

  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("eventis-admin-theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  }

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

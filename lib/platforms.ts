import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  ClipboardList,
  Flag,
  LayoutDashboard,
  Building2,
  ScrollText,
  Settings,
  Ticket,
  Users,
} from "lucide-react";

export type PlatformId = "eventis" | "find-love";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  status?: "available" | "partial" | "unavailable";
}

export interface Platform {
  id: PlatformId;
  name: string;
  tagline: string;
  basePath: string;
  enabled: boolean;
  nav: NavItem[];
}

export const platforms: Record<PlatformId, Platform> = {
  eventis: {
    id: "eventis",
    name: "Eventis",
    tagline: "Events, tickets & organisers",
    basePath: "/eventis",
    enabled: true,
    nav: [
      { label: "Overview", href: "/eventis", icon: LayoutDashboard, status: "available" },
      { label: "Users", href: "/eventis/users", icon: Users, status: "available" },
      { label: "Events", href: "/eventis/events", icon: CalendarDays, status: "partial" },
      { label: "Bookings & tickets", href: "/eventis/bookings", icon: Ticket, status: "unavailable" },
      { label: "Organisers", href: "/eventis/organisers", icon: Building2, status: "partial" },
      { label: "Reports & messages", href: "/eventis/moderation", icon: Flag, status: "unavailable" },
      { label: "Audit log", href: "/eventis/audit", icon: ScrollText, status: "unavailable" },
      { label: "Settings & roles", href: "/eventis/settings", icon: Settings, status: "partial" },
    ],
  },
  "find-love": {
    id: "find-love",
    name: "Find Love",
    tagline: "Dating & connections",
    basePath: "/find-love",
    enabled: false,
    nav: [{ label: "Overview", href: "/find-love", icon: ClipboardList, status: "unavailable" }],
  },
};

export function platformForPath(pathname: string): Platform {
  return pathname.startsWith("/find-love") ? platforms["find-love"] : platforms.eventis;
}

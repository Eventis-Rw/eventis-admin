import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BarChart3,
  Bell,
  CalendarDays,
  CreditCard,
  Flag,
  HeartHandshake,
  Images,
  LayoutDashboard,
  Building2,
  MessageSquare,
  ScrollText,
  Settings,
  ShieldAlert,
  Ticket,
  UserCog,
  Users,
  Wallet,
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
    enabled: true,
    nav: [
      { label: "Dashboard", href: "/find-love", icon: LayoutDashboard, status: "available" },
      { label: "User Management", href: "/find-love/users", icon: Users, status: "available" },
      { label: "Identity Verification", href: "/find-love/verification", icon: BadgeCheck, status: "available" },
      { label: "Profiles & Photos", href: "/find-love/profiles", icon: Images, status: "available" },
      { label: "Subscriptions & Pricing", href: "/find-love/subscriptions", icon: CreditCard, status: "available" },
      { label: "Payments & Installments", href: "/find-love/payments", icon: Wallet, status: "available" },
      { label: "Connections", href: "/find-love/connections", icon: HeartHandshake, status: "available" },
      { label: "Messages & Support", href: "/find-love/support", icon: MessageSquare, status: "available" },
      { label: "Reports & Safety", href: "/find-love/safety", icon: ShieldAlert, status: "available" },
      { label: "Statistics & Reports", href: "/find-love/statistics", icon: BarChart3, status: "available" },
      { label: "Notifications", href: "/find-love/notifications", icon: Bell, status: "available" },
      { label: "Admin Users & Permissions", href: "/find-love/admins", icon: UserCog, status: "available" },
      { label: "Audit Logs", href: "/find-love/audit", icon: ScrollText, status: "available" },
      { label: "Settings", href: "/find-love/settings", icon: Settings, status: "available" },
    ],
  },
};

export function platformForPath(pathname: string): Platform {
  return pathname.startsWith("/find-love") ? platforms["find-love"] : platforms.eventis;
}

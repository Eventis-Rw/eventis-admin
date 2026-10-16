import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BriefcaseBusiness,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const navigationItems: NavigationItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Projects", href: "/admin/projects", icon: BriefcaseBusiness },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export const overviewStats = [
  { label: "Total revenue", value: "$184.2K", change: "+12.4%", tone: "success" },
  { label: "Active users", value: "24.8K", change: "+8.1%", tone: "info" },
  { label: "Open tickets", value: "147", change: "-6.3%", tone: "warning" },
  { label: "Conversion rate", value: "4.82%", change: "+1.2%", tone: "success" },
] as const;

export const recentActivity = [
  { id: 1, title: "New enterprise account", detail: "Northwind Labs activated a 12-seat plan", time: "12 min ago" },
  { id: 2, title: "Campaign approved", detail: "Lifecycle campaign was signed off by marketing", time: "48 min ago" },
  { id: 3, title: "Support SLA updated", detail: "Escalation flow adjusted for tier 1 agents", time: "1 hour ago" },
  { id: 4, title: "Data sync complete", detail: "CRM records synced successfully across all teams", time: "3 hours ago" },
] as const;

export const teamMembers = [
  { name: "Olivia Martin", role: "Product Lead", metric: "12 tasks" },
  { name: "Noah Lee", role: "Operations", metric: "9 tasks" },
  { name: "Ava Patel", role: "Customer Success", metric: "15 tasks" },
  { name: "Liam Chen", role: "Engineering", metric: "7 tasks" },
] as const;

export const pipelineItems = [
  { name: "Q3 Expansion", value: "$42.8K", progress: 78, status: "On track" },
  { name: "Retention Playbook", value: "$18.4K", progress: 56, status: "Reviewing" },
  { name: "Automation Upgrade", value: "$31.1K", progress: 91, status: "Healthy" },
] as const;

export const pageTitles: Record<string, string> = {
  "/admin": "Overview",
  "/admin/analytics": "Analytics",
  "/admin/users": "Users",
  "/admin/projects": "Projects",
  "/admin/settings": "Settings",
};

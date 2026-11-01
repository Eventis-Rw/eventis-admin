export type Tone = "neutral" | "info" | "success" | "warning" | "danger";
export type Cell = string | { text: string; tone: Tone };

export interface Section {
  slug: string;
  title: string;
  description: string;
  stats: { label: string; value: string; hint?: string; tone?: Tone }[];
  tableTitle: string;
  columns: string[];
  rows: Cell[][];
  notes?: string[];
}

const b = (text: string, tone: Tone): Cell => ({ text, tone });

export const FIND_LOVE_SECTIONS: Section[] = [
  {
    slug: "users",
    title: "User Management",
    description: "Search members, filter public or private accounts, open profiles and suspend accounts.",
    stats: [
      { label: "Total users", value: "12,450" },
      { label: "Private accounts", value: "7,820", tone: "info" },
      { label: "Public accounts", value: "4,630", tone: "info" },
      { label: "Suspended", value: "58", tone: "danger" },
    ],
    tableTitle: "Members",
    columns: ["User ID", "Username", "Account", "Country", "Verification", "Account status", "Joined"],
    rows: [
      ["FL-001245", "ExampleUser", b("Private", "info"), "Rwanda", b("Verified", "success"), b("Active", "success"), "15 Oct 2026"],
      ["FL-001244", "Aline_K", b("Public", "neutral"), "Rwanda", b("Pending", "warning"), b("Active", "success"), "14 Oct 2026"],
      ["FL-001241", "David.M", b("Private", "info"), "Kenya", b("Not submitted", "neutral"), b("Active", "success"), "13 Oct 2026"],
      ["FL-001237", "GraceU", b("Public", "neutral"), "Uganda", b("Rejected", "danger"), b("Suspended", "danger"), "11 Oct 2026"],
      ["FL-001230", "Moses_R", b("Private", "info"), "Rwanda", b("Verified", "success"), b("Active", "success"), "09 Oct 2026"],
    ],
    notes: ["Phone numbers are masked by default. Passwords are never stored in readable form or shown to administrators."],
  },
  {
    slug: "verification",
    title: "Identity Verification",
    description: "Review National ID and passport submissions. Documents open only in a restricted, audited viewer.",
    stats: [
      { label: "Pending review", value: "86", tone: "warning" },
      { label: "Verified", value: "9,410", tone: "success" },
      { label: "Rejected", value: "312", tone: "danger" },
      { label: "Avg. review time", value: "3.2 hrs" },
    ],
    tableTitle: "Verification queue",
    columns: ["User ID", "Member", "Document", "Submitted", "Reviewer", "Status"],
    rows: [
      ["FL-012940", "Maya N.", "National ID", "12 min ago", "Unassigned", b("Pending", "warning")],
      ["FL-012936", "Aline K.", "Passport", "38 min ago", "Unassigned", b("Pending", "warning")],
      ["FL-012901", "Eric S.", "National ID", "Yesterday", "Admin Tester", b("Verified", "success")],
      ["FL-012877", "Diane U.", "Passport", "2 days ago", "Admin Tester", b("Rejected", "danger")],
    ],
    notes: ["Document numbers and images are never shown in this list. Every document view is written to the audit log."],
  },
  {
    slug: "profiles",
    title: "Profiles & Photos",
    description: "Moderate profile photos and gallery images.",
    stats: [
      { label: "Photos awaiting review", value: "143", tone: "warning" },
      { label: "Approved today", value: "212", tone: "success" },
      { label: "Removed this month", value: "37", tone: "danger" },
      { label: "Flagged by members", value: "18", tone: "warning" },
    ],
    tableTitle: "Moderation queue",
    columns: ["User ID", "Member", "Type", "Uploaded", "Reason", "Status"],
    rows: [
      ["FL-012945", "Sandrine M.", "Profile photo", "5 min ago", "New upload", b("Pending", "warning")],
      ["FL-012611", "Yves H.", "Gallery image", "1 hr ago", "Reported by member", b("Flagged", "danger")],
      ["FL-012598", "Patrick M.", "Gallery image", "3 hrs ago", "New upload", b("Approved", "success")],
      ["FL-012440", "Carine I.", "Profile photo", "Yesterday", "Automated check", b("Removed", "danger")],
    ],
  },
  {
    slug: "subscriptions",
    title: "Subscriptions & Pricing",
    description: "Set weekly, monthly and yearly prices separately for private and public accounts.",
    stats: [
      { label: "Active", value: "7,240", tone: "success" },
      { label: "Past due", value: "124", tone: "warning" },
      { label: "Expired", value: "1,860", tone: "danger" },
      { label: "Renewal rate", value: "68%", tone: "info" },
    ],
    tableTitle: "Price configuration (sample, not saved)",
    columns: ["Account type", "Weekly", "Monthly", "Yearly", "Currency", "Effective from"],
    rows: [
      [b("Private", "info"), "RWF 5,000", "RWF 15,000", "RWF 120,000", "RWF", "01 Nov 2026"],
      [b("Public", "neutral"), "RWF 3,000", "RWF 10,000", "RWF 80,000", "RWF", "01 Nov 2026"],
    ],
    notes: [
      "New prices apply to future subscriptions and renewals only. Existing amounts owed never change.",
      "Statuses are kept separate: Trial, Active, Past Due, Expired and Cancelled.",
    ],
  },
  {
    slug: "payments",
    title: "Payments & Installments",
    description: "Transactions, installment schedules, balances and overdue payments.",
    stats: [
      { label: "Collected (30 days)", value: "RWF 41.2M", tone: "success" },
      { label: "Pending", value: "386", tone: "warning" },
      { label: "Overdue", value: "124", tone: "danger" },
      { label: "Outstanding", value: "RWF 3.42M", tone: "warning" },
    ],
    tableTitle: "Installments",
    columns: ["Reference", "Member", "Plan", "Installment", "Amount", "Due", "Status"],
    rows: [
      ["PAY-88121", "ExampleUser", "Yearly · Private", "1 of 4", "RWF 30,000", "15 Oct", b("Success", "success")],
      ["PAY-88122", "ExampleUser", "Yearly · Private", "2 of 4", "RWF 30,000", "15 Nov", b("Success", "success")],
      ["PAY-88123", "ExampleUser", "Yearly · Private", "3 of 4", "RWF 30,000", "15 Dec", b("Pending", "warning")],
      ["PAY-88124", "ExampleUser", "Yearly · Private", "4 of 4", "RWF 30,000", "15 Jan", b("Upcoming", "neutral")],
      ["PAY-87990", "Aline_K", "Monthly · Public", "1 of 1", "RWF 10,000", "10 Oct", b("Overdue", "danger")],
    ],
    notes: ["Payments become Success only after provider confirmation, never from a button click. Balances come from payment records."],
  },
  {
    slug: "connections",
    title: "Connections",
    description: "Review connection requests. Admins cannot accept or reject on a member's behalf.",
    stats: [
      { label: "Accepted", value: "5,476", tone: "success" },
      { label: "Pending", value: "682", tone: "warning" },
      { label: "Rejected", value: "1,904" },
      { label: "Reported", value: "37", tone: "danger" },
    ],
    tableTitle: "Connection requests",
    columns: ["Request ID", "Sender", "Recipient", "Requested", "Status", "Reported", "Updated"],
    rows: [
      ["FL-C-4981", "ExampleUser", "Maya N.", "26 Oct", b("Accepted", "success"), "No", "27 Oct"],
      ["FL-C-4980", "David.M", "Aline_K", "26 Oct", b("Pending", "warning"), "No", "26 Oct"],
      ["FL-C-4975", "Moses_R", "GraceU", "25 Oct", b("Blocked", "danger"), b("Yes", "danger"), "26 Oct"],
      ["FL-C-4969", "Eric S.", "Diane U.", "24 Oct", b("Rejected", "neutral"), "No", "24 Oct"],
    ],
  },
  {
    slug: "support",
    title: "Messages & Support",
    description: "Support inbox with assignment, priority and internal notes. User chats are never browsed.",
    stats: [
      { label: "Open tickets", value: "42", tone: "warning" },
      { label: "High priority", value: "6", tone: "danger" },
      { label: "Resolved today", value: "58", tone: "success" },
      { label: "Avg. first response", value: "14 min" },
    ],
    tableTitle: "Support inbox",
    columns: ["Ticket", "Subject", "Category", "Assigned to", "Priority", "Status", "Opened"],
    rows: [
      ["FL-1024", "Account verification issue", "Verification", "Admin Tester", b("Normal", "neutral"), b("Open", "warning"), "12 min ago"],
      ["FL-1023", "Payment not reflected", "Payments", "Unassigned", b("Normal", "neutral"), b("In progress", "info"), "1 hr ago"],
      ["FL-1022", "Report of inappropriate behavior", "Safety", "Admin Tester", b("High", "danger"), b("Open", "warning"), "3 hrs ago"],
    ],
    notes: ["Message content is visible only for a documented report or investigation, and every access is logged."],
  },
  {
    slug: "safety",
    title: "Reports & Safety",
    description: "Complaints, blocked users and investigations.",
    stats: [
      { label: "Open reports", value: "37", tone: "danger" },
      { label: "Under investigation", value: "9", tone: "warning" },
      { label: "Blocked users", value: "214" },
      { label: "Resolved (30 days)", value: "161", tone: "success" },
    ],
    tableTitle: "Reports",
    columns: ["Case", "Reported member", "Reason", "Reporter", "Severity", "Status", "Filed"],
    rows: [
      ["FL-R-208", "Moses_R", "Harassment", "GraceU", b("High", "danger"), b("Investigating", "warning"), "41 min ago"],
      ["FL-R-207", "Eric S.", "Fake profile", "Maya N.", b("Medium", "warning"), b("Open", "warning"), "Yesterday"],
      ["FL-R-205", "David.M", "Scam attempt", "Aline_K", b("High", "danger"), b("Open", "warning"), "2 days ago"],
      ["FL-R-199", "Yves H.", "Spam", "Carine I.", b("Low", "neutral"), b("Resolved", "success"), "5 days ago"],
    ],
  },
  {
    slug: "statistics",
    title: "Statistics & Reports",
    description: "Growth, revenue and retention reports with exports.",
    stats: [
      { label: "Growth (30 days)", value: "+10.3%", tone: "success" },
      { label: "Revenue (30 days)", value: "RWF 41.2M", tone: "success" },
      { label: "30-day retention", value: "74%", tone: "info" },
      { label: "Renewal rate", value: "68%", tone: "info" },
    ],
    tableTitle: "Available reports",
    columns: ["Report", "Period", "Format", "Last generated"],
    rows: [
      ["User growth", "Last 30 days", "CSV", "Today"],
      ["Revenue and collections", "This month", "CSV", "Today"],
      ["Subscription renewals", "This year", "CSV", "Yesterday"],
      ["Payment status summary", "Last 7 days", "CSV", "Yesterday"],
    ],
    notes: ["Date filters planned: today, 7 days, 30 days, this month, this year, custom range."],
  },
  {
    slug: "notifications",
    title: "Notifications",
    description: "Payment reminders, verification outcomes and announcements sent to members.",
    stats: [
      { label: "Sent today", value: "1,206" },
      { label: "Delivered", value: "98.4%", tone: "success" },
      { label: "Scheduled", value: "4", tone: "info" },
      { label: "Failed", value: "19", tone: "danger" },
    ],
    tableTitle: "Templates and campaigns",
    columns: ["Name", "Channel", "Audience", "Trigger", "Status"],
    rows: [
      ["Installment due reminder", "Push + SMS", "Members with upcoming installments", "3 days before due", b("Active", "success")],
      ["Overdue payment notice", "Push + SMS", "Overdue members", "After due date", b("Active", "success")],
      ["Verification decision", "Push", "Reviewed members", "On review", b("Active", "success")],
      ["Renewal required", "Push", "Expired subscriptions", "On expiry", b("Draft", "warning")],
    ],
  },
  {
    slug: "admins",
    title: "Admin Users & Permissions",
    description: "Administrator accounts and role-based access to sensitive areas.",
    stats: [
      { label: "Administrators", value: "7" },
      { label: "Super admins", value: "2", tone: "info" },
      { label: "Support agents", value: "3" },
      { label: "Verification reviewers", value: "2" },
    ],
    tableTitle: "Administrators",
    columns: ["Name", "Role", "Can view documents", "Can change pricing", "Last active", "Status"],
    rows: [
      ["Admin Tester", "Super admin", b("Yes", "success"), b("Yes", "success"), "Now", b("Active", "success")],
      ["Reviewer One", "Verification reviewer", b("Yes", "success"), b("No", "neutral"), "2 hrs ago", b("Active", "success")],
      ["Support Agent", "Support", b("No", "neutral"), b("No", "neutral"), "Yesterday", b("Active", "success")],
      ["Finance Lead", "Finance", b("No", "neutral"), b("Yes", "success"), "3 days ago", b("Suspended", "danger")],
    ],
  },
  {
    slug: "audit",
    title: "Audit Logs",
    description: "Immutable record of administrator actions and sensitive data access.",
    stats: [
      { label: "Events today", value: "318" },
      { label: "Document views", value: "41", tone: "warning" },
      { label: "Price changes", value: "2", tone: "info" },
      { label: "Suspensions", value: "5", tone: "danger" },
    ],
    tableTitle: "Recent actions",
    columns: ["Time", "Administrator", "Action", "Target"],
    rows: [
      ["27 Oct 10:41", "Admin Tester", "Viewed identity document", "FL-012901"],
      ["27 Oct 10:12", "Reviewer One", "Approved verification", "FL-012901"],
      ["27 Oct 09:30", "Finance Lead", "Changed monthly price (Private)", "Pricing"],
      ["26 Oct 17:05", "Admin Tester", "Suspended account", "FL-001237"],
    ],
  },
  {
    slug: "settings",
    title: "Settings",
    description: "Platform configuration for installments, grace periods and access rules.",
    stats: [
      { label: "Grace period", value: "5 days" },
      { label: "Max installments", value: "4" },
      { label: "Auto-renew default", value: "On", tone: "success" },
      { label: "Currency", value: "RWF" },
    ],
    tableTitle: "Configuration",
    columns: ["Setting", "Value", "Description"],
    rows: [
      ["Initial payment to activate", "25%", "Share of the price required before access starts"],
      ["Grace period after missed payment", "5 days", "Paid features stay available during this window"],
      ["Overdue suspension", "After 14 days", "Restricts paid features, never deletes data"],
      ["Renewal mode", "Automatic", "Members may switch to manual renewal"],
    ],
    notes: ["Values are samples and are not saved."],
  },
];

export function findSection(slug: string): Section | undefined {
  return FIND_LOVE_SECTIONS.find((section) => section.slug === slug);
}

export const consolePermissions = {
  "users:read": "View users and organiser accounts",
  "users:manage": "Suspend or reactivate customer accounts",
  "events:read": "View events",
  "catalog:manage": "Manage organiser plans and pricing",
  "installments:manage": "Manage Eventis installments",
  "reports:manage": "Review Eventis reports",
  "audit:read": "View the Eventis audit log",
  "findlove:manage": "Manage FindLove",
  "organisers:verify": "Review business verifications",
  "promotions:manage": "Review and activate promotions",
  "subscriptions:activate": "View and activate organiser subscriptions",
  "settings:manage": "Edit global Eventis settings",
} as const;

export type ConsolePermission = keyof typeof consolePermissions;
export type ConsoleAccess = { unrestricted: boolean; permissions: ConsolePermission[] };
export type PublicEventisSettings = { displayName: string; supportEmail: string | null; announcement: string | null };
export type EventisSettings = PublicEventisSettings & { revision: number };
export type ConsoleRoles = {
  roles: { id: string; name: string; permissions: ConsolePermission[] }[];
  administrators: { id: string; displayName: string | null; phone: string; consoleRoleId: string | null }[];
};

export const organiserWorkflows = {
  verification: { title: "Business verification", endpoint: "/admin/business-verifications", permission: "organisers:verify" },
  promotions: { title: "Event promotions", endpoint: "/admin/promotions", permission: "promotions:manage" },
  subscriptions: { title: "Organiser subscriptions", endpoint: "/admin/organiser-subscriptions", permission: "subscriptions:activate" },
} as const;

export type OrganiserWorkflow = keyof typeof organiserWorkflows;

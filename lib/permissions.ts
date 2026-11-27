import type { SessionUser } from "@/types";

export type Permission =
  | "users:read"
  | "users:manage"
  | "events:read"
  | "organisers:read"
  | "bookings:read"
  | "reports:manage"
  | "audit:read"
  | "chat:view"
  | "chat:direct:view"
  | "chat:groups:view"
  | "chat:groups:manage"
  | "chat:groups:suspend"
  | "chat:groups:delete"
  | "chat:members:manage"
  | "chat:reports:view"
  | "chat:reports:manage"
  | "chat:moderation:manage"
  | "chat:analytics:view";

const ROLE_PERMISSIONS: Record<string, readonly Permission[]> = {
  admin: [
    "users:read",
    "users:manage",
    "events:read",
    "organisers:read",
    "bookings:read",
    "reports:manage",
    "audit:read",
    "chat:view",
    "chat:direct:view",
    "chat:groups:view",
    "chat:groups:manage",
    "chat:groups:suspend",
    "chat:groups:delete",
    "chat:members:manage",
    "chat:reports:view",
    "chat:reports:manage",
    "chat:moderation:manage",
    "chat:analytics:view",
  ],
};

export function can(user: Pick<SessionUser, "roles">, permission: Permission): boolean {
  return user.roles.some((role) => ROLE_PERMISSIONS[role.toLowerCase()]?.includes(permission));
}

export function isAdmin(user: Pick<SessionUser, "roles">): boolean {
  return user.roles.some((role) => role.toLowerCase() === "admin");
}

export const rolePermissions = ROLE_PERMISSIONS;

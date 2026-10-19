import type { SessionUser } from "@/types";

export type Permission = "users:read" | "users:manage" | "events:read" | "organisers:read" | "bookings:read" | "reports:manage" | "audit:read";

const ROLE_PERMISSIONS: Record<string, readonly Permission[]> = {
  admin: ["users:read", "users:manage", "events:read", "organisers:read", "bookings:read", "reports:manage", "audit:read"],
};

export function can(user: Pick<SessionUser, "roles">, permission: Permission): boolean {
  return user.roles.some((role) => ROLE_PERMISSIONS[role.toLowerCase()]?.includes(permission));
}

export function isAdmin(user: Pick<SessionUser, "roles">): boolean {
  return user.roles.some((role) => role.toLowerCase() === "admin");
}

export const rolePermissions = ROLE_PERMISSIONS;

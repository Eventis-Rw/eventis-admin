import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ApiError, apiFetch } from "@/lib/api";
import { ACCESS_COOKIE, USE_MOCK_DATA } from "@/lib/config";
import { loadConsoleAccess } from "@/lib/eventis/console-access";
import { MOCK_ADMIN } from "@/lib/mock/data";
import { can, isAdmin, type Permission } from "@/lib/permissions";
import type { SessionUser } from "@/types";

export interface Session {
  token: string;
  user: SessionUser;
}

export const getSession = cache(async (): Promise<Session | null> => {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  if (USE_MOCK_DATA) return { token, user: MOCK_ADMIN };
  try {
    const user = await apiFetch<SessionUser>("/auth/me", { token });
    return { token, user };
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) return null;
    throw error;
  }
});

export async function requireAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/api/session/clear?reason=expired");
  if (!isAdmin(session.user)) redirect("/api/session/clear?reason=forbidden");
  return session;
}

export async function requirePermission(permission: Permission): Promise<Session> {
  const session = await requireAdmin();
  const access = await loadConsoleAccess(session.token);
  if (!can(session.user, permission) || (access && !access.unrestricted && !access.permissions.some((entry) => entry === permission))) throw new ApiError("Permission denied", 403, "FORBIDDEN");
  return session;
}

import "server-only";

import type { AuthTokens } from "@/types";

export function accessCookie(tokens: AuthTokens) {
  const maxAge = Math.max(0, Math.floor((Date.parse(tokens.accessTokenExpiresAt) - Date.now()) / 1000));
  return {
    name: "eventis_admin_at",
    value: tokens.accessToken,
    options: { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge },
  };
}

export function refreshCookie(tokens: AuthTokens) {
  const maxAge = Math.max(0, Math.floor((Date.parse(tokens.refreshTokenExpiresAt) - Date.now()) / 1000));
  return {
    name: "eventis_admin_rt",
    value: tokens.refreshToken,
    options: { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge },
  };
}

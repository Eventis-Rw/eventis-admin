"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { parseAdminLoginInput, safeAdminNext } from "@/lib/admin-login-input";
import { ApiError, apiFetch } from "@/lib/api";
import { accessCookie, refreshCookie } from "@/lib/auth-cookies";
import { ACCESS_COOKIE, REFRESH_COOKIE, USE_MOCK_DATA } from "@/lib/config";
import { isAdmin } from "@/lib/permissions";
import type { AuthSession } from "@/types";

export interface LoginState {
  error?: string;
  email?: string;
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = parseAdminLoginInput(formData);
  if (!parsed.ok) return { email: parsed.email, error: parsed.error };
  const { email, password } = parsed.input;

  if (USE_MOCK_DATA) {
    const expires = new Date(Date.now() + 7 * 86_400_000).toISOString();
    const tokens = {
      accessToken: "mock-access",
      accessTokenExpiresAt: expires,
      refreshToken: "mock-refresh",
      refreshTokenExpiresAt: expires,
    };
    const jar = await cookies();
    const at = accessCookie(tokens);
    const rt = refreshCookie(tokens);
    jar.set(at.name, at.value, at.options);
    jar.set(rt.name, rt.value, rt.options);
    redirect(safeAdminNext(formData.get("next")));
  }

  let session: AuthSession;
  try {
    session = await apiFetch<AuthSession>("/auth/admin/login", {
      method: "POST",
      body: { email, password },
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { error: "Unable to sign in with these credentials.", email };
    }
    if (error instanceof ApiError && error.status === 429) {
      return { error: "Too many attempts. Please wait and try again.", email };
    }
    return {
      error:
        error instanceof ApiError
          ? error.message
          : "Sign-in failed. Try again.",
      email,
    };
  }

  if (!isAdmin(session.user)) {
    await apiFetch("/auth/logout", {
      method: "POST",
      token: session.tokens.accessToken,
      body: { refreshToken: session.tokens.refreshToken },
    }).catch(() => undefined);
    return { error: "This account does not have administrator access.", email };
  }

  const jar = await cookies();
  const at = accessCookie(session.tokens);
  const rt = refreshCookie(session.tokens);
  jar.set(at.name, at.value, at.options);
  jar.set(rt.name, rt.value, rt.options);

  redirect(safeAdminNext(formData.get("next")));
}

export async function logoutAction(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(ACCESS_COOKIE)?.value;
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;
  if (!USE_MOCK_DATA && token && refreshToken) {
    await apiFetch("/auth/logout", {
      method: "POST",
      token,
      body: { refreshToken },
    }).catch(() => undefined);
  }
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
  redirect("/login");
}

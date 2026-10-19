"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ApiError, apiFetch } from "@/lib/api";
import { accessCookie, refreshCookie } from "@/lib/auth-cookies";
import { ACCESS_COOKIE, REFRESH_COOKIE, USE_MOCK_DATA } from "@/lib/config";
import { isAdmin } from "@/lib/permissions";
import type { AuthSession } from "@/types";

export interface LoginState {
  error?: string;
  phone?: string;
}

function normalizePhone(raw: string): string {
  const compact = raw.replace(/[\s()-]/g, "");
  if (compact.startsWith("+")) return compact;
  if (compact.startsWith("250")) return `+${compact}`;
  if (compact.startsWith("0")) return `+250${compact.slice(1)}`;
  return `+${compact}`;
}

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return /^\/(eventis|find-love)(\/[\w\-/]*)?$/.test(next) ? next : "/eventis";
}

function testLoginCredentials(): { phone: string; pin: string } | null {
  if (process.env.NODE_ENV === "production" || process.env.TEST_LOGIN_BYPASS !== "true") return null;
  const phone = process.env.TEST_ADMIN_PHONE;
  const pin = process.env.TEST_ADMIN_PIN;
  return phone && pin ? { phone, pin } : null;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (USE_MOCK_DATA) {
    const expires = new Date(Date.now() + 7 * 86_400_000).toISOString();
    const tokens = { accessToken: "mock-access", accessTokenExpiresAt: expires, refreshToken: "mock-refresh", refreshTokenExpiresAt: expires };
    const jar = await cookies();
    const at = accessCookie(tokens);
    const rt = refreshCookie(tokens);
    jar.set(at.name, at.value, at.options);
    jar.set(rt.name, rt.value, rt.options);
    redirect(safeNext(formData.get("next")));
  }

  const phoneInput = String(formData.get("phone") ?? "");
  const bypass = testLoginCredentials();
  const pin = bypass ? bypass.pin : String(formData.get("pin") ?? "");
  const phone = bypass ? bypass.phone : normalizePhone(phoneInput);

  if (!bypass && !/^\+[1-9]\d{7,14}$/.test(phone)) return { error: "Enter a valid phone number, e.g. +250 788 123 456.", phone: phoneInput };
  if (!bypass && !/^\d{5}$/.test(pin)) return { error: "The PIN must be exactly 5 digits.", phone: phoneInput };

  let session: AuthSession;
  try {
    session = await apiFetch<AuthSession>("/auth/login", { method: "POST", body: { phone, pin } });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { error: "Unable to sign in with these credentials.", phone: phoneInput };
    }
    if (error instanceof ApiError && error.status === 429) {
      return { error: "Too many attempts. Please wait and try again.", phone: phoneInput };
    }
    return { error: error instanceof ApiError ? error.message : "Sign-in failed. Try again.", phone: phoneInput };
  }

  if (!isAdmin(session.user)) {
    await apiFetch("/auth/logout", {
      method: "POST",
      token: session.tokens.accessToken,
      body: { refreshToken: session.tokens.refreshToken },
    }).catch(() => undefined);
    return { error: "This account does not have administrator access.", phone: phoneInput };
  }

  const jar = await cookies();
  const at = accessCookie(session.tokens);
  const rt = refreshCookie(session.tokens);
  jar.set(at.name, at.value, at.options);
  jar.set(rt.name, rt.value, rt.options);

  redirect(safeNext(formData.get("next")));
}

export async function logoutAction(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(ACCESS_COOKIE)?.value;
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;
  if (!USE_MOCK_DATA && token && refreshToken) {
    await apiFetch("/auth/logout", { method: "POST", token, body: { refreshToken } }).catch(() => undefined);
  }
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
  redirect("/login");
}

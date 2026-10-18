import { NextResponse, type NextRequest } from "next/server";

import { accessCookie, refreshCookie } from "@/lib/auth-cookies";
import { API_BASE_URL, ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/config";
import type { AuthTokens } from "@/types";

export async function proxy(request: NextRequest) {
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  if (access) return NextResponse.next();

  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  if (refresh) {
    const tokens = await rotate(refresh);
    if (tokens) {
      const at = accessCookie(tokens);
      const rt = refreshCookie(tokens);
      request.cookies.set(at.name, at.value);
      request.cookies.set(rt.name, rt.value);
      const response = NextResponse.next({ request: { headers: request.headers } });
      response.cookies.set(at.name, at.value, at.options);
      response.cookies.set(rt.name, rt.value, rt.options);
      return response;
    }
  }

  const login = new URL("/login", request.url);
  if (request.method === "GET" && request.nextUrl.pathname !== "/") {
    login.searchParams.set("next", request.nextUrl.pathname);
  }
  const response = NextResponse.redirect(login);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}

async function rotate(refreshToken: string): Promise<AuthTokens | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    return res.ok ? ((await res.json()) as AuthTokens) : null;
  } catch {
    return null;
  }
}

export const config = {
  matcher: ["/", "/eventis/:path*", "/find-love/:path*"],
};

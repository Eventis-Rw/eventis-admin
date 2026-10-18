import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/config";

export function GET(request: NextRequest) {
  const reason = request.nextUrl.searchParams.get("reason");
  const login = new URL("/login", request.url);
  if (reason === "forbidden" || reason === "expired") login.searchParams.set("error", reason);
  const response = NextResponse.redirect(login);
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}

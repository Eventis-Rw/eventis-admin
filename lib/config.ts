import "server-only";

export const API_BASE_URL = (
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:4000"
).replace(/\/+$/, "");

export const ACCESS_COOKIE = "eventis_admin_at";
export const REFRESH_COOKIE = "eventis_admin_rt";

export const USE_MOCK_DATA = process.env.DATA_SOURCE !== "api";

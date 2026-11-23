import "server-only";

function normalizeApiBaseUrl(raw: string): string {
  let cleaned = raw.trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "");
  // Strip Swagger / API docs path if user copied from documentation URL
  cleaned = cleaned.replace(/\/docs(?:\/.*)?$/i, "");
  // Strip trailing /api/v1 or /api if included in base URL to prevent duplicate /api/v1
  cleaned = cleaned.replace(/\/api\/v1\/?$/i, "");
  cleaned = cleaned.replace(/\/api\/?$/i, "");
  return cleaned.replace(/\/+$/, "");
}

export const API_BASE_URL = normalizeApiBaseUrl(
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:4000"
);

export const ACCESS_COOKIE = "eventis_admin_at";
export const REFRESH_COOKIE = "eventis_admin_rt";

const rawDataSource = (process.env.DATA_SOURCE ?? "").trim().replace(/^["']|["']$/g, "").toLowerCase();
// Preview authentication is opt-in and is never available in production.
export const USE_MOCK_DATA = process.env.NODE_ENV !== "production" && rawDataSource === "mock";

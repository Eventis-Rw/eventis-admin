import "server-only";

import { API_BASE_URL } from "@/lib/config";
import type { Result } from "@/types";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  token?: string;
  query?: Record<string, string | number | undefined>;
  body?: unknown;
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = new URL(`${API_BASE_URL}/api/v1${path}`);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined && value !== "")
      url.searchParams.set(key, String(value));
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new ApiError(
      "The Eventis API is unreachable. Check that the backend is running.",
      503,
      "UNREACHABLE",
    );
  }

  if (response.status === 204) return undefined as T;

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const body = (payload ?? {}) as { message?: string; code?: string };
    throw new ApiError(
      body.message ?? `Request failed (${response.status})`,
      response.status,
      body.code,
    );
  }
  return payload as T;
}

export async function toResult<T>(work: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, data: await work() };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401)
        return { ok: false, error: "Your session has expired. Sign in again." };
      if (error.status === 403)
        return {
          ok: false,
          error: "You do not have permission to access this resource.",
        };
      return { ok: false, error: error.message };
    }
    return {
      ok: false,
      error: "Something went wrong while contacting the API.",
    };
  }
}

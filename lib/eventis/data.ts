import "server-only";

import { requireAdmin } from "@/lib/session";
import { cache } from "react";

import { apiFetch, toResult } from "@/lib/api";
import { USE_MOCK_DATA } from "@/lib/config";
import { getMockStore } from "@/lib/mock/data";
import type {
  AdminEvent,
  AdminUser,
  AuditEntry,
  Booking,
  Report,
  Result,
} from "@/types";

const EVENT_PAGE_SIZE = 100;
const EVENT_PAGE_CAP = 20;

export interface EventsPayload {
  items: AdminEvent[];
  total: number;
  truncated: boolean;
}

export const loadUsers = cache(
  async (token: string): Promise<Result<AdminUser[]>> =>
    USE_MOCK_DATA
      ? { ok: true, data: [...getMockStore().users] }
      : toResult(
          async () =>
            (await apiFetch<{ items: AdminUser[] }>("/admin/users", { token }))
              .items,
        ),
);

export const loadEvents = cache(
  async (token: string): Promise<Result<EventsPayload>> =>
    USE_MOCK_DATA
      ? {
          ok: true,
          data: {
            items: [...getMockStore().events],
            total: getMockStore().events.length,
            truncated: false,
          },
        }
      : toResult(async () => {
          const items: AdminEvent[] = [];
          let total = 0;
          for (let page = 1; page <= EVENT_PAGE_CAP; page += 1) {
            const response = await apiFetch<{
              items: AdminEvent[];
              total: number;
            }>("/events/admin/all", {
              token,
              query: { page, limit: EVENT_PAGE_SIZE },
            });
            items.push(...response.items);
            total = response.total;
            if (items.length >= total || response.items.length === 0) break;
          }
          return { items, total, truncated: items.length < total };
        }),
);

export const loadBookings = cache(async (): Promise<Booking[] | null> =>
  USE_MOCK_DATA ? [...getMockStore().bookings] : null,
);

export const loadReports = cache(async (): Promise<Report[] | null> => {
  if (USE_MOCK_DATA) return [...getMockStore().reports];
  const { token } = await requireAdmin();
  return apiFetch<Report[]>("/admin/reports", { token });
});

export const loadAudit = cache(async (): Promise<AuditEntry[] | null> => {
  if (USE_MOCK_DATA) return [...getMockStore().audit];
  const { token } = await requireAdmin();
  return apiFetch<AuditEntry[]>("/admin/audit-logs", { token });
});

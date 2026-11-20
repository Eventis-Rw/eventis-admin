import "server-only";

import { cache } from "react";
import { apiFetch, toResult } from "@/lib/api";
import { USE_MOCK_DATA } from "@/lib/config";
import type { ConsoleAccess, PublicEventisSettings } from "./console-settings";

export const loadConsoleAccess = cache(async (token: string) =>
  USE_MOCK_DATA
    ? { unrestricted: true, permissions: [] } satisfies ConsoleAccess
    : apiFetch<ConsoleAccess>("/me/console-access", { token }).catch(() => null),
);

export const loadPublicEventisSettings = cache(async () =>
  USE_MOCK_DATA ? null : toResult(() => apiFetch<PublicEventisSettings>("/eventis/settings")),
);

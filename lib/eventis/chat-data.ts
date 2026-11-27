import "server-only";

import { cache } from "react";

import { apiFetch, toResult } from "@/lib/api";
import { USE_MOCK_DATA } from "@/lib/config";
import type {
  ChatConversationSummary,
  ChatConversationsPayload,
  ChatConversationStatus,
  ChatConversationType,
  ChatOverview,
  ChatReport,
  Result,
} from "@/types";

const EMPTY_OVERVIEW: ChatOverview = {
  totalConversations: 0,
  totalDirect: 0,
  totalGroup: 0,
  activeGroups: 0,
  publicGroups: 0,
  privateGroups: 0,
  suspendedGroups: 0,
  registeredGroupMembers: 0,
  totalMessages: 0,
  reportedConversations: 0,
};

export const loadChatOverview = cache(
  async (token: string): Promise<Result<ChatOverview>> =>
    USE_MOCK_DATA
      ? { ok: true, data: EMPTY_OVERVIEW }
      : toResult(() => apiFetch<ChatOverview>("/admin/chat/overview", { token })),
);

export const loadChatConversations = cache(
  async (
    token: string,
    query: {
      type?: ChatConversationType;
      status?: ChatConversationStatus;
      query?: string;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<Result<ChatConversationsPayload>> =>
    USE_MOCK_DATA
      ? { ok: true, data: { items: [], page: 1, limit: 20, total: 0 } }
      : toResult(() =>
          apiFetch<ChatConversationsPayload>("/admin/chat/conversations", {
            token,
            query: {
              type: query.type,
              status: query.status,
              query: query.query,
              page: query.page ?? 1,
              limit: query.limit ?? 50,
            },
          }),
        ),
);

export const loadChatConversation = cache(
  async (token: string, id: string): Promise<Result<ChatConversationSummary>> =>
    USE_MOCK_DATA
      ? { ok: false, error: "This conversation is not available in demo mode." }
      : toResult(() =>
          apiFetch<ChatConversationSummary>(`/admin/chat/conversations/${id}`, { token }),
        ),
);

export const loadChatReports = cache(
  async (token: string, status?: string): Promise<Result<ChatReport[]>> =>
    USE_MOCK_DATA
      ? { ok: true, data: [] }
      : toResult(() =>
          apiFetch<ChatReport[]>("/admin/chat/reports", {
            token,
            query: { status },
          }),
        ),
);

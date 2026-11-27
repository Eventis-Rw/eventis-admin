
export type UserStatus = "ACTIVE" | "INACTIVE";
export type UserRole = "CUSTOMER" | "ADMIN";
export type AccountType = "POSTER" | "CUSTOMER" | "LOVE";
export type EventStatus = "draft" | "published" | "cancelled";

export interface AdminUser {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  accountType: AccountType | null;
  displayName: string | null;
  avatarUrl: string | null;
  organizationName: string | null;
  organizationDescription: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  bio: string | null;
  location: string | null;
  interestedIn: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminEvent {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  category: string | null;
  location: string;
  start_date: string;
  time: string;
  status: EventStatus;
  views_count: number;
  poster_id: string;
  created_at: string;
  updated_at: string;
}

export interface SessionUser {
  id: string;
  phone: string;
  displayName: string | null;
  avatarUrl: string | null;
  roles: string[];
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export interface AuthSession {
  user: SessionUser & { firstName?: string | null };
  tokens: AuthTokens;
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export type BookingStatus = "confirmed" | "pending" | "cancelled" | "refunded";
export type TicketStatus = "valid" | "used" | "cancelled";

export interface Ticket {
  id: string;
  code: string;
  tier: string;
  status: TicketStatus;
}

export interface Booking {
  id: string;
  reference: string;
  eventId: string;
  userId: string;
  quantity: number;
  totalAmount: number;
  currency: string;
  status: BookingStatus;
  createdAt: string;
  tickets: Ticket[];
}

export type ReportType = "user" | "event" | "message";
export type ReportStatus = "open" | "resolved" | "dismissed";

export interface Report {
  id: string;
  type: ReportType;
  targetLabel: string;
  targetId: string;
  reporterId: string;
  reason: string;
  details: string;
  status: ReportStatus;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  target: string;
  createdAt: string;
}

// ---------- Chat Management ----------

export type ChatConversationType = "DIRECT" | "GROUP";
export type ChatConversationStatus = "ACTIVE" | "SUSPENDED" | "DELETED";
export type ChatParticipantRole = "OWNER" | "ADMIN" | "MEMBER";
export type ChatParticipantStatus =
  | "ACTIVE"
  | "PENDING_APPROVAL"
  | "REMOVED"
  | "LEFT"
  | "BANNED";

export interface ChatParticipant {
  userId: string;
  role: ChatParticipantRole;
  status: ChatParticipantStatus;
  joinedAt: string;
  profile: {
    id: string;
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  } | null;
}

export interface ChatConversationSummary {
  id: string;
  type: ChatConversationType;
  title: string | null;
  description: string | null;
  category: string | null;
  isPublic: boolean;
  requiresApproval: boolean;
  avatarUrl: string | null;
  status: ChatConversationStatus;
  createdAt: string;
  updatedAt: string;
  participants: ChatParticipant[];
}

export interface ChatConversationsPayload {
  items: ChatConversationSummary[];
  page: number;
  limit: number;
  total: number;
}

export interface ChatOverview {
  totalConversations: number;
  totalDirect: number;
  totalGroup: number;
  activeGroups: number;
  publicGroups: number;
  privateGroups: number;
  suspendedGroups: number;
  registeredGroupMembers: number;
  totalMessages: number;
  reportedConversations: number;
}

export type ChatReportStatus =
  | "OPEN"
  | "UNDER_REVIEW"
  | "REVIEWED"
  | "ACTIONED"
  | "DISMISSED";
export type ChatReportType = "user" | "group" | "conversation" | "message";

export interface ChatReport {
  id: string;
  type: ChatReportType;
  targetLabel: string;
  targetId: string | null;
  reporterId: string;
  reporterLabel: string;
  category: string | null;
  reason: string;
  details: string;
  status: ChatReportStatus;
  assignedTo: string | null;
  moderatorNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

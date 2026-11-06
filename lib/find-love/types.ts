export type AccountType = "public" | "private";

export type AccountStatus = "active" | "suspended" | "banned" | "deletion_pending" | "deleted";

export type VerificationStatus = "not_submitted" | "pending" | "verified" | "rejected" | "resubmission_required";

export type SubscriptionStatus = "trial" | "active" | "past_due" | "expired" | "cancelled";

export type PaymentStatus = "upcoming" | "pending" | "success" | "failed" | "overdue" | "refunded" | "cancelled";

export type PlanPeriod = "weekly" | "monthly" | "yearly";

export type SupportCategory =
  | "account_access"
  | "identity_verification"
  | "subscription_questions"
  | "payment_problems"
  | "refund_requests"
  | "profile_issues"
  | "connection_problems"
  | "abuse_harassment"
  | "fraud_impersonation"
  | "technical_problems";

export type TicketPriority = "low" | "normal" | "high" | "urgent";

export type TicketStatus = "open" | "in_progress" | "waiting_user" | "escalated" | "resolved";

export type ReportCategory =
  | "harassment"
  | "scam"
  | "fake_profile"
  | "impersonation"
  | "inappropriate_photos"
  | "threats"
  | "spam";

export type ReportSeverity = "low" | "medium" | "high" | "critical";

export type ReportStatus = "open" | "investigating" | "resolved" | "dismissed";

export type ConnectionStatus = "pending" | "accepted" | "rejected" | "cancelled" | "blocked";

export type PhotoModerationStatus = "pending" | "approved" | "rejected" | "flagged";

export type AdminRole =
  | "super_admin"
  | "user_admin"
  | "verification_officer"
  | "finance_admin"
  | "support_agent"
  | "safety_officer"
  | "analyst";

export interface VerificationDocument {
  id: string;
  userId: string;
  documentType: "national_id" | "passport";
  documentNumberMasked: string;
  frontUrl: string;
  backUrl?: string;
  submittedAt: string;
  status: VerificationStatus;
  reviewerId?: string;
  reviewerName?: string;
  reviewedAt?: string;
  notes?: string;
  history: {
    action: string;
    reviewer: string;
    timestamp: string;
    notes?: string;
  }[];
}

export interface PhotoModerationItem {
  id: string;
  userId: string;
  userName: string;
  url: string;
  type: "profile" | "gallery";
  status: PhotoModerationStatus;
  uploadedAt: string;
  reason?: string;
  reviewer?: string;
  reviewedAt?: string;
}

export interface Installment {
  id: string;
  subscriptionId: string;
  userId: string;
  installmentNumber: number;
  totalInstallments: number;
  amountDue: number;
  amountPaid: number;
  currency: string;
  dueDate: string;
  status: PaymentStatus;
  paymentMethod?: string;
  transactionReference?: string;
  paidAt?: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  accountType: AccountType;
  planPeriod: PlanPeriod;
  price: number;
  currency: string;
  startDate: string;
  expiryDate: string;
  status: SubscriptionStatus;
  autoRenew: boolean;
  gracePeriodDays: number;
  installments: Installment[];
}

export interface Transaction {
  id: string;
  reference: string;
  userId: string;
  userName: string;
  accountType: AccountType;
  planTitle: string;
  installmentId?: string;
  subscriptionId?: string;
  installmentNumber?: number;
  totalInstallments?: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: "success" | "pending" | "failed" | "refunded";
  date: string;
  confirmedAt?: string;
}

export interface FindLoveUser {
  id: string; // e.g. FL-001245
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone: string; // Full number, e.g. +250788123456
  gender: "Woman" | "Man" | "Other";
  country: string;
  city: string;
  dateOfBirth: string;
  age: number;
  accountType: AccountType;
  accountStatus: AccountStatus;
  verificationStatus: VerificationStatus;
  subscriptionStatus: SubscriptionStatus;
  avatarUrl: string;
  galleryUrls: string[];
  bio: string;
  hobbies: string[];
  relationshipGoals: string;
  joinedAt: string;
  lastActiveAt: string;
  suspendReason?: string;
  verificationDoc?: VerificationDocument;
  subscription?: UserSubscription;
}

export interface ConnectionRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
  requestedAt: string;
  status: ConnectionStatus;
  reported: boolean;
  reportReason?: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  senderName: string;
  isStaff: boolean;
  content: string;
  timestamp: string;
  attachments?: string[];
}

export interface TicketInternalNote {
  id: string;
  authorName: string;
  note: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string; // FL-1024
  userId: string;
  userName: string;
  subject: string;
  category: SupportCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
  internalNotes: TicketInternalNote[];
}

export interface SafetyReport {
  id: string;
  caseNumber: string; // FL-R-208
  reportingUserId: string;
  reportingUserName: string;
  reportedUserId: string;
  reportedUserName: string;
  category: ReportCategory;
  severity: ReportSeverity;
  status: ReportStatus;
  details: string;
  evidenceUrls?: string[];
  assignedReviewer?: string;
  actionTaken?: string;
  createdAt: string;
  updatedAt: string;
  resolutionNotes?: string;
}

export interface PricingPlanConfig {
  accountType: AccountType;
  period: PlanPeriod;
  price: number;
  currency: string;
  active: boolean;
  effectiveFrom: string;
  installmentOptions: number[]; // e.g. [1, 2, 4]
}

export interface PriceHistoryEntry {
  id: string;
  accountType: AccountType;
  period: PlanPeriod;
  oldPrice: number;
  newPrice: number;
  currency: string;
  changedBy: string;
  changedAt: string;
  effectiveDate: string;
  reason: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  trigger: string;
  audience: string;
  channels: ("Push" | "SMS" | "In-app")[];
  content: string;
  status: "active" | "draft" | "disabled";
  sentCount: number;
  deliveredRate: string;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  roleLabel: string;
  canViewDocuments: boolean;
  canChangePricing: boolean;
  canRefundPayments: boolean;
  canSuspendUsers: boolean;
  status: "active" | "suspended";
  lastActiveAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: string;
  reason?: string;
}

export interface PlatformSettings {
  currency: string;
  initialPaymentPercent: number; // e.g. 25 (%)
  gracePeriodDays: number; // e.g. 5
  overdueSuspensionDays: number; // e.g. 14
  maxInstallments: number; // e.g. 4
  autoRenewDefault: boolean;
}

export type DateFilter = "today" | "7d" | "30d" | "this_month" | "this_year" | "all";

export type ManualPaymentPlatform = "findlove" | "organiser";
/** A payment method's scope can be "both"; a submission's own platform (above) never is. */
export type ManualPaymentMethodPlatform = ManualPaymentPlatform | "both";
export type ManualPaymentProvider = "mtn_momo" | "airtel_money";
export type ManualPaymentStatus = "pending" | "under_review" | "approved" | "rejected";

export const PROVIDER_LABEL: Record<ManualPaymentProvider, string> = {
  mtn_momo: "MTN Mobile Money",
  airtel_money: "Airtel Money",
};

export const STATUS_LABEL: Record<ManualPaymentStatus, string> = {
  pending: "Pending",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Rejected",
};

export interface ManualPaymentMethod {
  id: string;
  provider: ManualPaymentProvider;
  platform: ManualPaymentMethodPlatform;
  account_name: string | null;
  phone_number: string;
  instructions: string | null;
  currency: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ManualPaymentPlanSnapshot {
  name: string;
  durationDays?: number;
  [key: string]: unknown;
}

/** Returned by the review/approve/reject endpoints (no `user`). */
export interface ManualPaymentSubmission {
  id: string;
  reference: string;
  platform: ManualPaymentPlatform;
  status: ManualPaymentStatus;
  plan: ManualPaymentPlanSnapshot;
  amount_minor: string;
  currency: string;
  payment_method: {
    provider: ManualPaymentProvider;
    account_name: string | null;
    phone_number: string;
  };
  receipt_upload_id: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

/** Returned by the list/get admin endpoints (includes the submitter). */
export interface ManualPaymentAdmin extends ManualPaymentSubmission {
  user: { id: string; email: string | null; display_name: string | null };
}

export interface ManualPaymentsPage {
  items: ManualPaymentAdmin[];
  page: number;
  limit: number;
  total: number;
}

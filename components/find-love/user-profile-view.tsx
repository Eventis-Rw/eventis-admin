"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  EyeOff,
  HeartHandshake,
  Image as ImageIcon,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ScrollText,
  Shield,
  UserCheck,
  UserX,
  Wallet,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/overlay";
import { Table, Td, Th } from "@/components/ui/table";
import {
  moderatePhotoAction,
  recordInstallmentPaymentAction,
  reviewVerificationAction,
  updateUserStatusAction,
} from "@/lib/find-love/actions";
import type {
  AuditLogEntry,
  ConnectionRequest,
  FindLoveUser,
  Installment,
  PhotoModerationItem,
  SafetyReport,
  SupportTicket,
  Transaction,
  VerificationDocument,
} from "@/lib/find-love/types";

interface UserProfileViewProps {
  user: FindLoveUser;
  installments: Installment[];
  transactions: Transaction[];
  verificationDoc: VerificationDocument | null;
  connections: ConnectionRequest[];
  tickets: SupportTicket[];
  safetyReports: SafetyReport[];
  photos: PhotoModerationItem[];
  auditLogs: AuditLogEntry[];
  initialTab?: string;
}

export function UserProfileView({
  user,
  installments,
  transactions,
  verificationDoc,
  connections,
  tickets,
  safetyReports,
  photos,
  auditLogs,
  initialTab = "overview",
}: UserProfileViewProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [phoneUnmasked, setPhoneUnmasked] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Status Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [accountStatus, setAccountStatus] = useState<"active" | "suspended" | "banned">(
    user.accountStatus === "active" ? "suspended" : "active",
  );
  const [statusReason, setStatusReason] = useState("");

  // Verification Review Modal
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verificationDecision, setVerificationDecision] = useState<"verified" | "rejected" | "resubmission_required">(
    "verified",
  );
  const [verifyNotes, setVerifyNotes] = useState("");

  // Record Payment Modal
  const [paymentModalInstallment, setPaymentModalInstallment] = useState<Installment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("MTN Mobile Money");
  const [paymentReference, setPaymentReference] = useState("");

  // Photo Moderation Modal
  const [photoModalItem, setPhotoModalItem] = useState<PhotoModerationItem | null>(null);
  const [photoDecision, setPhotoDecision] = useState<"approved" | "rejected">("approved");
  const [photoReason, setPhotoReason] = useState("");

  const maskPhone = (phone: string) => {
    if (phoneUnmasked) return phone;
    if (phone.length < 8) return "••••••••";
    return phone.slice(0, 4) + " ••• ••" + phone.slice(-2);
  };

  // Calculations for subscription & payments
  const totalDue = installments.reduce((acc, i) => acc + i.amountDue, 0);
  const totalPaid = installments.reduce((acc, i) => acc + i.amountPaid, 0);
  const balance = totalDue - totalPaid;
  const paidCount = installments.filter((i) => i.status === "success").length;

  const tabs = [
    { id: "overview", label: "Overview", icon: UserCheck },
    { id: "photos", label: "Photos", icon: ImageIcon, count: photos.length || (user.galleryUrls.length + 1) },
    {
      id: "verification",
      label: "Identity Verification",
      icon: BadgeCheck,
      badge: verificationDoc?.status === "pending" ? "Pending" : undefined,
    },
    { id: "subscription", label: "Subscription", icon: CreditCard },
    { id: "payments", label: "Payments", icon: Wallet, count: installments.length },
    { id: "connections", label: "Connections", icon: HeartHandshake, count: connections.length },
    { id: "messages", label: "Messages & Support", icon: MessageSquare, count: tickets.length + safetyReports.length },
    { id: "activity", label: "Activity & Audit", icon: ScrollText, count: auditLogs.length },
  ];

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData();
      formData.set("userId", user.id);
      formData.set("status", accountStatus);
      formData.set("reason", statusReason || "Admin update");
      formData.set("actor", "Admin Tester");
      await updateUserStatusAction(formData);
      setStatusModalOpen(false);
      setStatusReason("");
    });
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationDoc) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("docId", verificationDoc.id);
      formData.set("status", verificationDecision);
      formData.set("notes", verifyNotes);
      formData.set("reviewer", "Admin Tester");
      await reviewVerificationAction(formData);
      setVerifyModalOpen(false);
      setVerifyNotes("");
    });
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInstallment) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("installmentId", paymentModalInstallment.id);
      formData.set("paymentMethod", paymentMethod);
      formData.set("reference", paymentReference || `PAY-${Math.floor(100000 + Math.random() * 900000)}`);
      formData.set("actor", "Finance Lead");
      await recordInstallmentPaymentAction(formData);
      setPaymentModalInstallment(null);
      setPaymentReference("");
    });
  };

  const handlePhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoModalItem) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("photoId", photoModalItem.id);
      formData.set("status", photoDecision);
      formData.set("reason", photoReason);
      formData.set("reviewer", "Moderator Grace");
      await moderatePhotoAction(formData);
      setPhotoModalItem(null);
      setPhotoReason("");
    });
  };

  return (
    <div className="space-y-6">
      {/* Navigation breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/find-love/users" className="hover:text-foreground flex items-center gap-1 font-medium">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Users
        </Link>
        <span>/</span>
        <span className="font-mono text-foreground font-semibold">{user.id}</span>
      </div>

      {/* User Header Profile Card */}
      <Card className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative">
              <Avatar name={user.displayName} src={user.avatarUrl} className="h-20 w-20 ring-4 ring-card shadow-md" />
              {user.verificationStatus === "verified" ? (
                <span className="absolute -bottom-1 -right-1 rounded-full bg-success p-1 text-white shadow" title="Verified Identity">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
              ) : null}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{user.displayName}</h1>
                <span className="font-mono text-sm text-muted-foreground">@{user.username}</span>
                <span className="rounded-lg bg-surface px-2 py-0.5 font-mono text-xs font-semibold text-muted-foreground border border-border">
                  {user.id}
                </span>
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <Badge tone={user.accountStatus === "active" ? "success" : "danger"} dot>
                  {user.accountStatus.toUpperCase()}
                </Badge>
                <Badge tone={user.accountType === "private" ? "info" : "neutral"} dot>
                  {user.accountType === "private" ? "Private Account" : "Public Account"}
                </Badge>
                <Badge
                  tone={
                    user.verificationStatus === "verified"
                      ? "success"
                      : user.verificationStatus === "pending"
                      ? "warning"
                      : user.verificationStatus === "rejected"
                      ? "danger"
                      : "neutral"
                  }
                  dot
                >
                  {user.verificationStatus === "verified"
                    ? "Identity Verified"
                    : user.verificationStatus === "pending"
                    ? "Verification Pending"
                    : user.verificationStatus === "rejected"
                    ? "Verification Rejected"
                    : "ID Not Submitted"}
                </Badge>
                <Badge
                  tone={
                    user.subscriptionStatus === "active"
                      ? "success"
                      : user.subscriptionStatus === "past_due"
                      ? "warning"
                      : "danger"
                  }
                >
                  Subscription: {user.subscriptionStatus}
                </Badge>
              </div>

              <p className="mt-2 text-xs text-muted-foreground flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Joined {new Date(user.joinedAt).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Last active {new Date(user.lastActiveAt).toLocaleDateString([], { day: "numeric", month: "short" })}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setActiveTab("subscription");
              }}
            >
              <CreditCard className="h-4 w-4" /> Subscription
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setActiveTab("payments");
              }}
            >
              <Wallet className="h-4 w-4" /> Payments
            </Button>
            {verificationDoc ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setActiveTab("verification");
                  setVerifyModalOpen(true);
                }}
              >
                <BadgeCheck className="h-4 w-4" /> Review ID
              </Button>
            ) : null}
            <Button
              variant={user.accountStatus === "active" ? "destructive" : "primary"}
              size="sm"
              onClick={() => {
                setAccountStatus(user.accountStatus === "active" ? "suspended" : "active");
                setStatusModalOpen(true);
              }}
            >
              {user.accountStatus === "active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
              {user.accountStatus === "active" ? "Restrict Account" : "Activate Account"}
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex flex-wrap gap-1 border-b border-border pt-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-semibold transition-colors ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined ? (
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${active ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground"}`}>
                    {tab.count}
                  </span>
                ) : null}
                {tab.badge ? <Badge tone="warning" dot>{tab.badge}</Badge> : null}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Personal Information */}
          <Card className="lg:col-span-2">
            <CardHeader title="Personal Information" description="Demographics and contact profile details" />
            <div className="p-5">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Full Name</dt>
                  <dd className="mt-1 text-sm font-semibold text-foreground">{user.displayName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Username</dt>
                  <dd className="mt-1 text-sm font-semibold text-foreground">@{user.username}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Email Address</dt>
                  <dd className="mt-1 flex items-center gap-1.5 text-sm text-foreground">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{user.email}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Telephone (Masked by default)</dt>
                  <dd className="mt-1 flex items-center gap-2 text-sm text-foreground">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-mono">{maskPhone(user.phone)}</span>
                    <button
                      type="button"
                      onClick={() => setPhoneUnmasked(!phoneUnmasked)}
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      title={phoneUnmasked ? "Mask number" : "Reveal full phone"}
                    >
                      {phoneUnmasked ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Gender & Age</dt>
                  <dd className="mt-1 text-sm text-foreground">{user.gender} · {user.age} years old ({user.dateOfBirth})</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Residence & Country</dt>
                  <dd className="mt-1 flex items-center gap-1 text-sm text-foreground">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {user.city}, {user.country}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Account Type</dt>
                  <dd className="mt-1">
                    <Badge tone={user.accountType === "private" ? "info" : "neutral"} dot>
                      {user.accountType === "private" ? "Private Account (Enhanced privacy & VIP matching)" : "Public Account"}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Relationship Goal</dt>
                  <dd className="mt-1 text-sm font-semibold text-primary">{user.relationshipGoals}</dd>
                </div>
              </dl>

              <div className="mt-6 border-t border-border pt-4">
                <h3 className="text-xs font-semibold text-muted-foreground">Short Introduction</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground bg-surface p-3.5 rounded-xl border border-border">
                  &ldquo;{user.bio}&rdquo;
                </p>
              </div>

              <div className="mt-5 border-t border-border pt-4">
                <h3 className="text-xs font-semibold text-muted-foreground">Hobbies & Interests</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {user.hobbies.map((hobby) => (
                    <span key={hobby} className="rounded-lg bg-surface border border-border px-2.5 py-1 text-xs font-medium text-foreground">
                      {hobby}
                    </span>
                  ))}
                </div>
              </div>

              {user.suspendReason ? (
                <div className="mt-5 rounded-xl border border-destructive/20 bg-destructive-soft p-3 text-xs text-destructive">
                  <strong>Account Restriction Notice:</strong> {user.suspendReason}
                </div>
              ) : null}
            </div>
          </Card>

          {/* Quick Summary Cards */}
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-foreground">Financial & Plan Status</h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total Plan Price</span>
                  <span className="text-sm font-bold text-foreground">RWF {totalDue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Amount Paid</span>
                  <span className="text-sm font-bold text-success">RWF {totalPaid.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Outstanding</span>
                  <span className="text-sm font-bold text-warning">RWF {balance.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="text-xs text-muted-foreground">Installments Paid</span>
                  <Badge tone={paidCount === installments.length && installments.length > 0 ? "success" : "info"}>
                    {paidCount} of {installments.length}
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold text-foreground">Security & Password Policy</h3>
              <div className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
                <p className="flex items-start gap-2">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                  Passwords are encrypted using Argon2 / bcrypt. Plaintext passwords are never stored or recoverable by admins.
                </p>
                <p className="flex items-start gap-2">
                  <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  National IDs and sensitive credentials require signed, audited access tokens.
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Photos & Moderation */}
      {activeTab === "photos" && (
        <div className="space-y-6">
          <Card className="p-6">
            <CardHeader
              title="Profile and Gallery Photos"
              description="Moderate profile pictures and uploaded gallery images to protect community safety"
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {/* Profile Photo */}
              <div className="relative group rounded-2xl border-2 border-primary overflow-hidden bg-surface">
                <div className="relative aspect-square w-full">
                  <Image
                    src={user.avatarUrl}
                    alt={`${user.displayName} profile`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge tone="info">Profile Photo</Badge>
                  </div>
                </div>
                <div className="p-3 bg-card border-t border-border flex items-center justify-between">
                  <span className="text-xs font-semibold text-success flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Approved
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive"
                    onClick={() => {
                      setPhotoModalItem({
                        id: `ph_profile_${user.id}`,
                        userId: user.id,
                        userName: user.displayName,
                        url: user.avatarUrl,
                        type: "profile",
                        status: "approved",
                        uploadedAt: user.joinedAt,
                      });
                      setPhotoDecision("rejected");
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </div>

              {/* Gallery Photos */}
              {user.galleryUrls.map((url, index) => (
                <div key={index} className="relative group rounded-2xl border border-border overflow-hidden bg-surface">
                  <div className="relative aspect-square w-full">
                    <Image
                      src={url}
                      alt={`Gallery photo ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge tone="neutral">Gallery #{index + 1}</Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-card border-t border-border flex items-center justify-between">
                    <Badge tone="success" dot>Approved</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-destructive"
                      onClick={() => {
                        setPhotoModalItem({
                          id: `ph_gal_${user.id}_${index}`,
                          userId: user.id,
                          userName: user.displayName,
                          url,
                          type: "gallery",
                          status: "approved",
                          uploadedAt: user.joinedAt,
                        });
                        setPhotoDecision("rejected");
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Identity Verification */}
      {activeTab === "verification" && (
        <div className="space-y-6">
          {verificationDoc ? (
            <Card className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-5 w-5 text-primary" />
                    <h2 className="text-base font-semibold text-foreground">
                      {verificationDoc.documentType === "national_id" ? "National Identification Card" : "Passport Identity Page"}
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground font-mono">
                    Masked Doc Number: {verificationDoc.documentNumberMasked} · Submitted {new Date(verificationDoc.submittedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    tone={
                      verificationDoc.status === "verified"
                        ? "success"
                        : verificationDoc.status === "pending"
                        ? "warning"
                        : "danger"
                    }
                    dot
                  >
                    Status: {verificationDoc.status}
                  </Badge>
                  <Button variant="primary" size="sm" onClick={() => setVerifyModalOpen(true)}>
                    Make Decision
                  </Button>
                </div>
              </div>

              {/* Secure Document Viewer */}
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {/* Front of ID */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span>Front Document</span>
                    <span className="text-[10px] text-primary flex items-center gap-1 font-mono">
                      <Lock className="h-3 w-3" /> Signed Audited URL
                    </span>
                  </div>
                  <div className="relative aspect-[16/10] w-full rounded-2xl border border-border bg-slate-900 overflow-hidden shadow-inner flex items-center justify-center">
                    <Image
                      src={verificationDoc.frontUrl}
                      alt="National ID Front"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white/80 font-mono">
                      AUDITED VIEW
                    </div>
                  </div>
                </div>

                {/* Back of ID */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span>Back Document</span>
                    <span className="text-[10px] text-primary flex items-center gap-1 font-mono">
                      <Lock className="h-3 w-3" /> Signed Audited URL
                    </span>
                  </div>
                  <div className="relative aspect-[16/10] w-full rounded-2xl border border-border bg-slate-900 overflow-hidden shadow-inner flex items-center justify-center">
                    {verificationDoc.backUrl ? (
                      <Image
                        src={verificationDoc.backUrl}
                        alt="National ID Back"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        No back image required for passport submission
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white/80 font-mono">
                      AUDITED VIEW
                    </div>
                  </div>
                </div>
              </div>

              {/* Review notes & history */}
              <div className="mt-6 rounded-xl border border-border bg-surface p-4">
                <h3 className="text-xs font-bold text-foreground">Reviewer Notes & Decision History</h3>
                <p className="mt-1 text-sm text-foreground">{verificationDoc.notes || "No review notes attached."}</p>
                <div className="mt-3 border-t border-border pt-3">
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {verificationDoc.history.map((h, i) => (
                      <li key={i} className="flex items-center justify-between">
                        <span>{h.action} by <strong>{h.reviewer}</strong></span>
                        <span className="font-mono text-[11px]">{new Date(h.timestamp).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <BadgeCheck className="mx-auto h-8 w-8 text-muted-foreground" />
              <h2 className="mt-2 text-base font-semibold text-foreground">No verification documents submitted</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                This member has not yet submitted an official identification document for review.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Tab 4: Subscription */}
      {activeTab === "subscription" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-5">
              <span className="text-xs font-medium text-muted-foreground">Current Plan</span>
              <p className="mt-1 text-2xl font-bold capitalize text-foreground">
                {user.subscription?.planPeriod ?? "Yearly"} · {user.accountType}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Price: RWF {(user.subscription?.price ?? 120000).toLocaleString()}
              </p>
            </Card>
            <Card className="p-5">
              <span className="text-xs font-medium text-muted-foreground">Subscription Status</span>
              <div className="mt-1">
                <Badge
                  tone={
                    user.subscriptionStatus === "active"
                      ? "success"
                      : user.subscriptionStatus === "past_due"
                      ? "warning"
                      : "danger"
                  }
                  dot
                >
                  {user.subscriptionStatus.toUpperCase()}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Expires: {user.subscription?.expiryDate ?? "2027-10-15"}
              </p>
            </Card>
            <Card className="p-5">
              <span className="text-xs font-medium text-muted-foreground">Renewal Setting</span>
              <p className="mt-1 text-base font-bold text-foreground">
                {user.subscription?.autoRenew ? "Automatic Renewal" : "Manual Renewal"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Grace period: 5 days upon missed installment</p>
            </Card>
          </div>

          {user.subscriptionStatus === "expired" && (
            <div className="flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive-soft p-4 text-destructive">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Subscription Expired — Renewal Required</p>
                <p className="text-xs text-destructive/80">
                  Paid features are restricted. User profile and historical payment records remain preserved.
                </p>
              </div>
            </div>
          )}

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground">Subscription Access Control Rules</h3>
            <div className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
              <p>• Initial payment of 25% is required to activate paid features.</p>
              <p>• When an installment fails or is missed, a 5-day grace period is granted before paid access is suspended.</p>
              <p>• User accounts and data are never deleted when a subscription expires without renewal.</p>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 5: Payments & Installments */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          {/* Financial summary stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card className="p-4">
              <p className="text-xs font-medium text-muted-foreground">Total Price</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-foreground">RWF {totalDue.toLocaleString()}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium text-muted-foreground">Amount Paid</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-success">RWF {totalPaid.toLocaleString()}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium text-muted-foreground">Remaining Balance</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-warning">RWF {balance.toLocaleString()}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium text-muted-foreground">Installments Paid</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-foreground">
                {paidCount} of {installments.length}
              </p>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="Installment Payment Schedule"
              description="Real breakdown of all installments, confirmed payments, and outstanding balances"
            />
            <Table>
              <thead>
                <tr>
                  <Th>Installment</Th>
                  <Th>Amount Due</Th>
                  <Th>Amount Paid</Th>
                  <Th>Due Date</Th>
                  <Th>Status</Th>
                  <Th>Reference / Provider</Th>
                  <Th className="text-right">Action</Th>
                </tr>
              </thead>
              <tbody>
                {installments.map((inst) => (
                  <tr key={inst.id}>
                    <Td className="font-semibold text-foreground">
                      Installment {inst.installmentNumber} of {inst.totalInstallments}
                    </Td>
                    <Td className="tabular-nums font-mono">RWF {inst.amountDue.toLocaleString()}</Td>
                    <Td className="tabular-nums font-mono text-success">RWF {inst.amountPaid.toLocaleString()}</Td>
                    <Td className="text-xs text-muted-foreground">{inst.dueDate}</Td>
                    <Td>
                      <Badge
                        tone={
                          inst.status === "success"
                            ? "success"
                            : inst.status === "pending"
                            ? "warning"
                            : inst.status === "overdue"
                            ? "danger"
                            : "neutral"
                        }
                        dot
                      >
                        {inst.status}
                      </Badge>
                    </Td>
                    <Td className="font-mono text-xs">
                      {inst.transactionReference ? (
                        <span>
                          {inst.transactionReference}{" "}
                          <span className="text-muted-foreground">({inst.paymentMethod})</span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td className="text-right">
                      {inst.status !== "success" ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            setPaymentModalInstallment(inst);
                            setPaymentReference(`PAY-${Math.floor(100000 + Math.random() * 900000)}`);
                          }}
                        >
                          Record Payment
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Confirmed</span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>

          {transactions.length > 0 ? (
            <Card>
              <CardHeader
                title="Transaction History & Ledger"
                description="Recorded payment provider transactions and confirmations"
              />
              <Table>
                <thead>
                  <tr>
                    <Th>Transaction Ref</Th>
                    <Th>Amount</Th>
                    <Th>Payment Method</Th>
                    <Th>Status</Th>
                    <Th>Confirmed At</Th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <Td className="font-mono text-xs font-semibold">{tx.reference}</Td>
                      <Td className="font-mono tabular-nums text-success font-semibold">
                        RWF {tx.amount.toLocaleString()}
                      </Td>
                      <Td className="text-xs text-muted-foreground">{tx.paymentMethod}</Td>
                      <Td>
                        <Badge tone={tx.status === "success" ? "success" : "neutral"} dot>
                          {tx.status}
                        </Badge>
                      </Td>
                      <Td className="text-xs text-muted-foreground">
                        {tx.confirmedAt ? new Date(tx.confirmedAt).toLocaleString() : "—"}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          ) : null}
        </div>
      )}

      {/* Tab 6: Connections */}
      {activeTab === "connections" && (
        <Card>
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Connection Requests & Matches</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Dating interactions involving this user. Admins cannot accept romantic requests on behalf of users.
              </p>
            </div>
            <Badge tone="info">{connections.length} total requests</Badge>
          </div>
          <Table>
            <thead>
              <tr>
                <Th>Direction</Th>
                <Th>Counterpart Member</Th>
                <Th>Requested Date</Th>
                <Th>Status</Th>
                <Th>Reported</Th>
              </tr>
            </thead>
            <tbody>
              {connections.map((conn) => {
                const isSender = conn.senderId === user.id;
                const counterpartName = isSender ? conn.recipientName : conn.senderName;
                const counterpartId = isSender ? conn.recipientId : conn.senderId;

                return (
                  <tr key={conn.id}>
                    <Td className="text-xs font-medium text-muted-foreground">
                      {isSender ? "Sent by user →" : "← Received by user"}
                    </Td>
                    <Td>
                      <Link href={`/find-love/users/${counterpartId}`} className="font-semibold text-foreground hover:text-primary">
                        {counterpartName}
                      </Link>
                      <span className="block text-xs text-muted-foreground font-mono">{counterpartId}</span>
                    </Td>
                    <Td className="text-xs text-muted-foreground">{new Date(conn.requestedAt).toLocaleDateString()}</Td>
                    <Td>
                      <Badge
                        tone={
                          conn.status === "accepted"
                            ? "success"
                            : conn.status === "pending"
                            ? "warning"
                            : conn.status === "blocked"
                            ? "danger"
                            : "neutral"
                        }
                        dot
                      >
                        {conn.status}
                      </Badge>
                    </Td>
                    <Td>
                      {conn.reported ? (
                        <Badge tone="danger">Reported: {conn.reportReason}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">No</span>
                      )}
                    </Td>
                  </tr>
                );
              })}
              {connections.length === 0 && (
                <tr>
                  <Td colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                    No connection history recorded for this member.
                  </Td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      )}

      {/* Tab 7: Messages & Support */}
      {activeTab === "messages" && (
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Customer Support Tickets"
              description="Direct inquiries and support conversations opened by this member"
            />
            <Table>
              <thead>
                <tr>
                  <Th>Ticket ID</Th>
                  <Th>Subject</Th>
                  <Th>Category</Th>
                  <Th>Priority</Th>
                  <Th>Status</Th>
                  <Th>Opened Date</Th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id}>
                    <Td className="font-mono text-xs font-semibold">{t.ticketNumber}</Td>
                    <Td className="font-medium text-foreground">{t.subject}</Td>
                    <Td className="text-xs text-muted-foreground">{t.category.replace("_", " ")}</Td>
                    <Td>
                      <Badge tone={t.priority === "high" || t.priority === "urgent" ? "danger" : "neutral"}>
                        {t.priority}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge tone={t.status === "resolved" ? "success" : "warning"} dot>
                        {t.status}
                      </Badge>
                    </Td>
                    <Td className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</Td>
                  </tr>
                ))}
                {tickets.length === 0 && (
                  <tr>
                    <Td colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                      No support tickets opened by this user.
                    </Td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card>

          <Card>
            <CardHeader
              title="Safety & Moderation Reports"
              description="Safety complaints where this member was reporter or reported user"
            />
            <Table>
              <thead>
                <tr>
                  <Th>Case ID</Th>
                  <Th>Role</Th>
                  <Th>Category</Th>
                  <Th>Severity</Th>
                  <Th>Status</Th>
                  <Th>Action Taken</Th>
                </tr>
              </thead>
              <tbody>
                {safetyReports.map((r) => (
                  <tr key={r.id}>
                    <Td className="font-mono text-xs font-semibold">{r.caseNumber}</Td>
                    <Td className="text-xs">
                      {r.reportedUserId === user.id ? (
                        <span className="text-destructive font-semibold">Reported Member</span>
                      ) : (
                        <span className="text-muted-foreground">Reporter</span>
                      )}
                    </Td>
                    <Td className="text-xs font-medium">{r.category.replace("_", " ")}</Td>
                    <Td>
                      <Badge tone={r.severity === "high" || r.severity === "critical" ? "danger" : "warning"}>
                        {r.severity}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge tone={r.status === "resolved" ? "success" : "warning"} dot>
                        {r.status}
                      </Badge>
                    </Td>
                    <Td className="text-xs text-muted-foreground">{r.actionTaken || "Investigation in progress"}</Td>
                  </tr>
                ))}
                {safetyReports.length === 0 && (
                  <tr>
                    <Td colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                      No moderation or safety reports for this member.
                    </Td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card>
        </div>
      )}

      {/* Tab 8: Activity & Audit History */}
      {activeTab === "activity" && (
        <Card>
          <CardHeader
            title="Account Audit Trail"
            description="Immutable log of all administrative operations performed on this account"
          />
          <Table>
            <thead>
              <tr>
                <Th>Timestamp</Th>
                <Th>Administrator</Th>
                <Th>Action</Th>
                <Th>Details / Rationale</Th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <Td className="font-mono text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</Td>
                  <Td className="font-semibold text-foreground">{log.actorName}</Td>
                  <Td>
                    <Badge tone="info">{log.action}</Badge>
                  </Td>
                  <Td className="text-xs text-muted-foreground">{log.details} {log.reason ? `(Reason: ${log.reason})` : ""}</Td>
                </tr>
              ))}
              {auditLogs.length === 0 && (
                <tr>
                  <Td colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                    No administrative audit actions recorded yet.
                  </Td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      )}

      {/* MODAL 1: Account Status Change */}
      <Dialog
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Account Restriction Status"
        description={`Member: ${user.displayName} (${user.id})`}
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-foreground">Select New Status</label>
            <select
              value={accountStatus}
              onChange={(e) => setAccountStatus(e.target.value as "active" | "suspended" | "banned")}
              className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended (Restricts dating access)</option>
              <option value="banned">Banned (Permanent restriction)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground">Reason for Decision (Logged to Audit)</label>
            <textarea
              required
              rows={3}
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="State clear justification..."
              className="mt-1 w-full rounded-xl border border-border bg-input p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="secondary" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isPending}>
              Confirm Status
            </Button>
          </div>
        </form>
      </Dialog>

      {/* MODAL 2: Identity Verification Review */}
      {verificationDoc && (
        <Dialog
          open={verifyModalOpen}
          onClose={() => setVerifyModalOpen(false)}
          title="Review Identity Document Submission"
          description={`User: ${user.displayName} (${user.id})`}
        >
          <form onSubmit={handleVerifySubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-foreground">Verification Decision</label>
              <select
                value={verificationDecision}
                onChange={(e) =>
                  setVerificationDecision(e.target.value as "verified" | "rejected" | "resubmission_required")
                }
                className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="verified">Approve (Mark as Verified Member)</option>
                <option value="rejected">Reject (Document Fraudulent / Ineligible)</option>
                <option value="resubmission_required">Request Resubmission (Blurry scan / Unreadable)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground">Review Notes</label>
              <textarea
                required
                rows={3}
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                placeholder="Document verification check details against national registry..."
                className="mt-1 w-full rounded-xl border border-border bg-input p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="secondary" onClick={() => setVerifyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isPending}>
                Submit Decision
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* MODAL 3: Record Installment Payment */}
      {paymentModalInstallment && (
        <Dialog
          open={!!paymentModalInstallment}
          onClose={() => setPaymentModalInstallment(null)}
          title="Record Installment Payment"
          description={`Installment ${paymentModalInstallment.installmentNumber} of ${paymentModalInstallment.totalInstallments} · Amount: RWF ${paymentModalInstallment.amountDue.toLocaleString()}`}
        >
          <form onSubmit={handlePaymentSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-foreground">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="MTN Mobile Money">MTN Mobile Money</option>
                <option value="Airtel Money">Airtel Money</option>
                <option value="Visa/Mastercard">Visa / Mastercard</option>
                <option value="Bank Transfer">Bank Transfer / Reconciliation</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground">Transaction Reference</label>
              <input
                type="text"
                required
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="e.g. PAY-88125"
                className="mt-1 h-10 w-full rounded-xl border border-border bg-input px-3 text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="secondary" onClick={() => setPaymentModalInstallment(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isPending}>
                Confirm Payment
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* MODAL 4: Photo Moderation */}
      {photoModalItem && (
        <Dialog
          open={!!photoModalItem}
          onClose={() => setPhotoModalItem(null)}
          title="Moderate Photo"
          description={`Member: ${photoModalItem.userName}`}
        >
          <form onSubmit={handlePhotoSubmit} className="space-y-4 pt-2">
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900">
              <Image src={photoModalItem.url} alt="Photo to moderate" fill className="object-contain" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground">Decision</label>
              <select
                value={photoDecision}
                onChange={(e) => setPhotoDecision(e.target.value as "approved" | "rejected")}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="approved">Approve Image</option>
                <option value="rejected">Reject and Remove</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground">Reason / Feedback to User</label>
              <textarea
                required={photoDecision === "rejected"}
                rows={2}
                value={photoReason}
                onChange={(e) => setPhotoReason(e.target.value)}
                placeholder="State reason (e.g. Non-original photo, inappropriate background, watermark)..."
                className="mt-1 w-full rounded-xl border border-border bg-input p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="secondary" onClick={() => setPhotoModalItem(null)}>
                Cancel
              </Button>
              <Button type="submit" variant={photoDecision === "approved" ? "primary" : "destructive"} loading={isPending}>
                Submit Moderation
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}

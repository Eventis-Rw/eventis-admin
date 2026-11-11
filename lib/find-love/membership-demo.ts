export type Tier = "public" | "private";
export type Period = "week" | "month" | "year";
export type Permissions = Record<Tier, Record<Tier, boolean>>;
export interface Plan {
  id: string;
  tier: Tier;
  period: Period;
  days: number;
  price: number;
  active: boolean;
}
export interface Membership {
  tier: Tier;
  status: "active" | "revoked";
  startsAt: string;
  expiresAt: string;
  price: number;
  planId: string;
  permissions: Permissions;
}
export interface Member {
  id: string;
  name: string;
  username: string;
  country: string;
  dob: string;
  account: "active" | "suspended" | "banned";
  verification: "pending" | "verified" | "rejected" | "resubmission_required";
  document: "National ID" | "Passport";
  membership?: Membership;
}
export interface Payment {
  id: string;
  memberId: string;
  plan: Plan;
  permissions: Permissions;
  amount: number;
  method: "MTN MoMo" | "Airtel Money";
  status: "success" | "pending" | "failed";
  createdAt: string;
}
export interface Report {
  id: string;
  memberId: string;
  category: string;
  details: string;
  status: "open" | "resolved" | "dismissed";
}
export interface Entry {
  id: string;
  at: string;
  action: string;
  target: string;
  reason: string;
  details: string;
}
export interface Demo {
  version: 1;
  plans: Plan[];
  permissions: Permissions;
  members: Member[];
  payments: Payment[];
  reports: Report[];
  audit: Entry[];
}
export const MEMBERSHIP_KEY = "eventis.findlove.memberships.v1";
export const DAY = 86_400_000;
export const defaultPermissions = (): Permissions => ({
  public: { public: true, private: false },
  private: { public: true, private: true },
});
export const money = (amount: number) =>
  `RWF ${amount.toLocaleString("en-US")}`;
export const dateLabel = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", {
    timeZone: "Africa/Kigali",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
export function adult(dob: string, now: number): boolean {
  const birth = new Date(dob),
    today = new Date(now);
  if (!Number.isFinite(birth.getTime()) || birth.getTime() > now) return false;
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  if (
    today.getUTCMonth() < birth.getUTCMonth() ||
    (today.getUTCMonth() === birth.getUTCMonth() &&
      today.getUTCDate() < birth.getUTCDate())
  )
    age--;
  return age >= 18;
}
export function activeMembership(member: Member, now: number): boolean {
  const m = member.membership;
  return (
    !!m &&
    m.status === "active" &&
    Number.isFinite(Date.parse(m.expiresAt)) &&
    Date.parse(m.startsAt) <= now &&
    Date.parse(m.expiresAt) > now
  );
}
export function accessReason(member: Member, now: number): string {
  if (member.account !== "active") return `Account ${member.account}`;
  if (!adult(member.dob, now)) return "18+ required";
  if (member.verification !== "verified") return "Verification required";
  if (!activeMembership(member, now))
    return member.membership?.status === "revoked"
      ? "Membership revoked"
      : "Active membership required";
  return "Access enabled";
}
export function connectionDecision(
  sender: Member,
  target: Member,
  now: number,
  accepting = false,
): string {
  if (sender.id === target.id) return "Choose two different members";
  for (const m of [sender, target])
    if (accessReason(m, now) !== "Access enabled")
      return `${m.name}: ${accessReason(m, now)}`;
  if (sender.country !== target.country)
    return "Discovery is limited to the member’s country";
  if (accepting)
    return "Allowed: received requests can be accepted by either tier";
  return sender.membership!.permissions[sender.membership!.tier][
    target.membership!.tier
  ]
    ? "Allowed: connection can be initiated"
    : "Blocked by the sender’s purchased connection permissions";
}
export function seedMembershipDemo(
  now = Date.parse("2026-11-10T09:00:00Z"),
): Demo {
  const plans = (["public", "private"] as const).flatMap((tier) =>
    (["week", "month", "year"] as const).map((period, i) => ({
      id: `findlove_${tier}_${period}`,
      tier,
      period,
      days: [7, 30, 365][i],
      price: (tier === "public" ? [499, 999, 9999] : [999, 2499, 24999])[i],
      active: true,
    })),
  );
  const members: Member[] = [
    {
      id: "FL-001245",
      name: "Aline Keza",
      username: "ExampleUser",
      country: "Rwanda",
      dob: "1997-04-12",
      account: "active",
      verification: "verified",
      document: "National ID",
    },
    {
      id: "FL-001244",
      name: "Aline Kamanzi",
      username: "Aline_K",
      country: "Rwanda",
      dob: "1995-07-21",
      account: "active",
      verification: "verified",
      document: "Passport",
    },
    {
      id: "FL-001241",
      name: "David Mugisha",
      username: "David.M",
      country: "Kenya",
      dob: "1994-02-14",
      account: "active",
      verification: "pending",
      document: "Passport",
    },
    {
      id: "FL-001237",
      name: "Grace Uwimana",
      username: "GraceU",
      country: "Uganda",
      dob: "1996-11-05",
      account: "suspended",
      verification: "rejected",
      document: "National ID",
    },
    {
      id: "FL-001230",
      name: "Moses Rukundo",
      username: "Moses_R",
      country: "Rwanda",
      dob: "1992-03-18",
      account: "active",
      verification: "pending",
      document: "National ID",
    },
    {
      id: "FL-001229",
      name: "Diane Umutesi",
      username: "Diane_U",
      country: "Rwanda",
      dob: "1999-02-08",
      account: "active",
      verification: "verified",
      document: "National ID",
    },
  ];
  members.push(
    {
      id: "FL-012940",
      name: "Maya Niyonsaba",
      username: "Maya_N",
      country: "Rwanda",
      dob: "2000-03-10",
      account: "active",
      verification: "pending",
      document: "National ID",
    },
    {
      id: "FL-012936",
      name: "Eric Shema",
      username: "Eric_S",
      country: "Rwanda",
      dob: "1995-09-18",
      account: "active",
      verification: "pending",
      document: "National ID",
    },
    {
      id: "FL-012877",
      name: "Diane Umutoni",
      username: "Diane_U",
      country: "Rwanda",
      dob: "1998-12-01",
      account: "active",
      verification: "pending",
      document: "National ID",
    },
    {
      id: "FL-012850",
      name: "Patrick Mugabo",
      username: "Patrick_M",
      country: "Rwanda",
      dob: "1991-05-15",
      account: "active",
      verification: "pending",
      document: "National ID",
    },
    {
      id: "FL-012822",
      name: "Carine Ingabire",
      username: "Carine_I",
      country: "Rwanda",
      dob: "1997-01-29",
      account: "active",
      verification: "pending",
      document: "National ID",
    },
    {
      id: "FL-012810",
      name: "Yves Hakizimana",
      username: "Yves_H",
      country: "Rwanda",
      dob: "1993-10-10",
      account: "active",
      verification: "pending",
      document: "National ID",
    },
    {
      id: "FL-012795",
      name: "Sandrine Mukeshimana",
      username: "Sandrine_M",
      country: "Rwanda",
      dob: "2001-06-14",
      account: "active",
      verification: "pending",
      document: "National ID",
    },
  );
  const payments: Payment[] = [];
  members.slice(0, 3).forEach((member, i) => {
    const plan = plans.find(
      (p) =>
        p.tier === (i === 1 ? "public" : "private") && p.period === "month",
    )!;
    const startsAt = new Date(now - 2 * DAY).toISOString();
    member.membership = {
      tier: plan.tier,
      status: "active",
      startsAt,
      expiresAt: new Date(now + 28 * DAY).toISOString(),
      price: plan.price,
      planId: plan.id,
      permissions: defaultPermissions(),
    };
    payments.push({
      id: `FL-PAY-00${i + 1}`,
      memberId: member.id,
      plan: { ...plan },
      permissions: defaultPermissions(),
      amount: plan.price,
      method: i === 1 ? "Airtel Money" : "MTN MoMo",
      status: "success",
      createdAt: startsAt,
    });
  });
  members[5].membership = {
    tier: "public",
    status: "active",
    startsAt: new Date(now - 40 * DAY).toISOString(),
    expiresAt: new Date(now - 10 * DAY).toISOString(),
    price: 999,
    planId: "findlove_public_month",
    permissions: defaultPermissions(),
  };
  return {
    version: 1,
    plans,
    permissions: defaultPermissions(),
    members,
    payments,
    reports: [
      {
        id: "FL-R-208",
        memberId: "FL-001230",
        category: "Spam",
        details:
          "Repeated unsolicited promotional requests. Review the report before deciding on account access.",
        status: "open",
      },
      {
        id: "FL-R-209",
        memberId: "FL-001237",
        category: "Impersonation",
        details:
          "Member reports that this profile uses another person’s identity. Account is suspended pending review.",
        status: "open",
      },
    ],
    audit: [],
  };
}
export type Command =
  | { type: "plan"; id: string; price: number; active: boolean; reason: string }
  | { type: "rules"; permissions: Permissions; reason: string }
  | {
      type: "member";
      id: string;
      action: "grant" | "extend" | "revoke" | "suspend" | "restore" | "ban";
      planId?: string;
      days?: number;
      reason: string;
    }
  | {
      type: "checkout";
      id: string;
      planId: string;
      method: Payment["method"];
      outcome: Payment["status"];
      reason: string;
    }
  | {
      type: "settle";
      id: string;
      outcome: "success" | "failed";
      reason: string;
    }
  | {
      type: "verify";
      id: string;
      decision: Member["verification"];
      reason: string;
    }
  | {
      type: "report";
      id: string;
      decision: "dismiss" | "resolve" | "suspend" | "ban";
      reason: string;
    };
function requireValue(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
function activate(
  member: Member,
  plan: Plan,
  permissions: Permissions,
  now: number,
) {
  const existing = member.membership;
  requireValue(
    !activeMembership(member, now) || existing?.tier === plan.tier,
    "Revoke the current membership before switching tiers. Remaining days are preserved for same-tier renewals.",
  );
  const base = activeMembership(member, now)
    ? Date.parse(existing!.expiresAt)
    : now;
  member.membership = {
    tier: plan.tier,
    status: "active",
    startsAt: new Date(now).toISOString(),
    expiresAt: new Date(base + plan.days * DAY).toISOString(),
    price: plan.price,
    planId: plan.id,
    permissions: structuredClone(
      activeMembership(member, now) ? existing!.permissions : permissions,
    ),
  };
}
export function applyMembershipCommand(
  current: Demo,
  command: Command,
  now: number,
  id: string,
): Demo {
  requireValue(
    command.reason.trim().length >= 5,
    "Provide a reason of at least 5 characters.",
  );
  requireValue(Number.isFinite(now), "Invalid operation time.");
  const state = structuredClone(current);
  let details = "";
  const member =
    "id" in command
      ? state.members.find((m) => m.id === command.id)
      : undefined;
  const plan =
    "planId" in command
      ? state.plans.find((p) => p.id === command.planId)
      : undefined;
  switch (command.type) {
    case "plan": {
      const p = state.plans.find((p) => p.id === command.id);
      requireValue(p, "Plan not found.");
      requireValue(
        Number.isSafeInteger(command.price) && command.price > 0,
        "Price must be a positive whole RWF amount.",
      );
      details = `${p.tier} ${p.period}: RWF ${p.price} → ${command.price}; ${command.active ? "enabled" : "disabled"} for new purchases`;
      p.price = command.price;
      p.active = command.active;
      break;
    }
    case "rules":
      requireValue(
        ["public", "private"].every((a) =>
          ["public", "private"].every(
            (b) =>
              typeof command.permissions[a as Tier]?.[b as Tier] === "boolean",
          ),
        ),
        "All four connection permissions are required.",
      );
      details = `New memberships: ${JSON.stringify(command.permissions)}`;
      state.permissions = structuredClone(command.permissions);
      break;
    case "member":
      requireValue(member, "Member not found.");
      if (command.action === "grant") {
        requireValue(plan?.active, "Choose an enabled plan.");
        requireValue(
          member.account === "active" &&
            member.verification === "verified" &&
            adult(member.dob, now),
          "Grants require an active, verified adult account.",
        );
        activate(member, plan, state.permissions, now);
      } else if (command.action === "extend") {
        requireValue(
          member.membership && member.membership.status !== "revoked",
          "Grant a membership before extending it.",
        );
        requireValue(
          Number.isInteger(command.days) &&
            command.days! > 0 &&
            command.days! <= 365,
          "Extension must be between 1 and 365 days.",
        );
        member.membership.expiresAt = new Date(
          Math.max(now, Date.parse(member.membership.expiresAt)) +
            command.days! * DAY,
        ).toISOString();
      } else if (command.action === "revoke") {
        requireValue(member.membership, "This member has no membership.");
        member.membership.status = "revoked";
      } else
        member.account =
          command.action === "restore"
            ? "active"
            : command.action === "ban"
              ? "banned"
              : "suspended";
      break;
    case "checkout": {
      requireValue(
        member && plan?.active,
        "Choose a member and an enabled plan.",
      );
      requireValue(
        member.account === "active" &&
          member.verification === "verified" &&
          adult(member.dob, now),
        "Checkout requires an active, verified adult account.",
      );
      requireValue(
        !activeMembership(member, now) || member.membership?.tier === plan.tier,
        "Choose the current tier to renew, or revoke it before switching tiers.",
      );
      requireValue(
        !state.payments.some(
          (p) => p.memberId === member.id && p.status === "pending",
        ),
        "Resolve this member’s pending payment before starting another checkout.",
      );
      requireValue(
        ["MTN MoMo", "Airtel Money"].includes(command.method),
        "Unsupported payment method.",
      );
      const payment: Payment = {
        id,
        memberId: member.id,
        plan: { ...plan },
        permissions: structuredClone(state.permissions),
        amount: plan.price,
        method: command.method,
        status: command.outcome,
        createdAt: new Date(now).toISOString(),
      };
      if (payment.status === "success")
        activate(member, payment.plan, payment.permissions, now);
      details = `${plan.id}; RWF ${payment.amount}; ${payment.method}; ${payment.status}`;
      state.payments.unshift(payment);
      break;
    }
    case "settle": {
      const payment = state.payments.find((p) => p.id === command.id);
      requireValue(
        payment?.status === "pending",
        "Only pending payments can be resolved.",
      );
      const owner = state.members.find((m) => m.id === payment.memberId)!;
      if (command.outcome === "success")
        activate(owner, payment.plan, payment.permissions, now);
      payment.status = command.outcome;
      break;
    }
    case "verify":
      requireValue(member, "Member not found.");
      requireValue(
        command.decision !== "verified" || adult(member.dob, now),
        "A member under 18 cannot be verified.",
      );
      member.verification = command.decision;
      break;
    case "report": {
      const report = state.reports.find((r) => r.id === command.id);
      requireValue(report?.status === "open", "This report is already closed.");
      if (command.decision === "suspend" || command.decision === "ban")
        state.members.find((m) => m.id === report.memberId)!.account =
          command.decision === "ban" ? "banned" : "suspended";
      report.status = command.decision === "dismiss" ? "dismissed" : "resolved";
      break;
    }
  }
  state.audit.unshift({
    id,
    at: new Date(now).toISOString(),
    action:
      command.type +
      ("action" in command
        ? `: ${command.action}`
        : "decision" in command
          ? `: ${command.decision}`
          : "outcome" in command
            ? `: ${command.outcome}`
            : " updated"),
    details,
    target: "id" in command ? command.id : "Connection rules",
    reason: command.reason.trim(),
  });
  return state;
}

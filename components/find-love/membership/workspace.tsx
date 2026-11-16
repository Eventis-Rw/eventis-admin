"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  HeartHandshake,
  ShieldCheck,
  CreditCard,
  Users,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { useBrowserRecord, saveBrowserRecord } from "@/lib/browser-record";
import {
  MEMBERSHIP_KEY,
  seedMembershipDemo,
  applyMembershipCommand,
  type Command,
  type Demo,
  accessReason,
} from "@/lib/find-love/membership-demo";
import { Plans, Rules } from "./configuration";
import { Members } from "./members";
import { Audit, Payments } from "./monitoring";
import { Verification, Safety } from "./reviews";
import { Metrics } from "./shared";
import {
  saveMembershipCommand,
  type LiveMembershipSnapshot,
} from "@/lib/find-love/membership-actions";
const initial = seedMembershipDemo();
const views = {
  overview: [
    "FindLove overview",
    "Memberships, payments and trust operations in one place.",
  ],
  plans: [
    "Membership plans & pricing",
    "Two paid tiers. Three durations. Clear control over future purchases.",
  ],
  members: [
    "Members & access",
    "Manage memberships, expiry and account restrictions.",
  ],
  payments: [
    "Membership payments",
    "Monitor full-period purchases and simulate provider outcomes.",
  ],
  rules: [
    "Membership rules",
    "Control connection permissions and check member eligibility.",
  ],
  verification: [
    "Age verification",
    "Review adult eligibility before enabling membership access.",
  ],
  safety: [
    "Reports & safety",
    "Review member reports and enforce account restrictions.",
  ],
  audit: [
    "Activity log",
    "Trace changes made in this browser’s FindLove demo.",
  ],
  statistics: [
    "Membership reporting",
    "Revenue, member access and filtered customer payment history.",
  ],
};
export type MembershipView = keyof typeof views;
export function MembershipWorkspace({
  view = "overview",
  memberId,
  initialSnapshot,
}: {
  view?: MembershipView;
  memberId?: string;
  initialSnapshot?: LiveMembershipSnapshot;
}) {
  const [liveSnapshot, setLiveSnapshot] = useState(initialSnapshot);
  const raw = useBrowserRecord(MEMBERSHIP_KEY);
  const [now, setNow] = useState(Date.parse("2026-11-10T09:00:00Z"));
  const [message, setMessage] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    const update = () => setNow(Date.now());
    const first = setTimeout(update, 0);
    const interval = setInterval(update, 30_000);
    window.addEventListener("focus", update);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
      window.removeEventListener("focus", update);
    };
  }, []);
  const parsed = useMemo(() => {
    if (liveSnapshot) return { state: liveSnapshot.state, valid: true };
    if (!raw) return { state: initial, valid: true };
    try {
      const state = JSON.parse(raw) as Demo;
      if (
        state.version !== 1 ||
        !Array.isArray(state.plans) ||
        state.plans.length !== 6 ||
        !Array.isArray(state.members) ||
        !state.members.length ||
        !Array.isArray(state.payments) ||
        !Array.isArray(state.audit) ||
        !Array.isArray(state.reports) ||
        !state.permissions
      )
        throw new Error();
      return { state, valid: true };
    } catch {
      return { state: initial, valid: false };
    }
  }, [raw, liveSnapshot]);
  const mutate = async (command: Command): Promise<boolean> => {
    try {
      if (liveSnapshot) {
        const result = await saveMembershipCommand(
          command,
          liveSnapshot.revision,
          crypto.randomUUID(),
        );
        if (!result.ok) throw new Error(result.error);
        setLiveSnapshot(result.data);
        setNow(Date.now());
        setError("");
        setMessage("Saved. Related screens are updated.");
        return true;
      }
      if (!parsed.valid)
        throw new Error(
          "Saved demo data could not be read. Reset the demo to continue.",
        );
      // Read the latest record at action time so another tab’s changes are retained.
      const latest = localStorage.getItem(MEMBERSHIP_KEY);
      const current = latest ? (JSON.parse(latest) as Demo) : initial;
      const updated = applyMembershipCommand(
        current,
        command,
        Date.now(),
        crypto.randomUUID(),
      );
      saveBrowserRecord(MEMBERSHIP_KEY, updated);
      setNow(Date.now());
      setError("");
      setMessage("Saved to the FindLove demo. Related screens are updated.");
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save this change.",
      );
      return false;
    }
  };
  const props = { state: parsed.state, now, mutate, live: !!liveSnapshot };
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            FindLove administration
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {views[view][0]}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {liveSnapshot && view === "audit"
              ? "Administrative changes recorded by the backend."
              : liveSnapshot && view === "payments"
                ? "Record external membership payments and monitor their confirmation."
                : views[view][1]}
          </p>
        </div>
        <span className="rounded-full border border-primary/20 bg-primary-soft px-3 py-1.5 text-xs font-medium text-primary">
          {liveSnapshot ? "Live data" : "Frontend demo"}
        </span>
      </div>
      <p className="rounded-xl border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground">
        {liveSnapshot ? (
          "Changes are saved to the backend. Payment entries record money received externally; they do not initiate charges."
        ) : (
          <>
            Saved in this browser only. Prices mirror the mobile app’s
            placeholder catalog. Purchases, reviews and access changes are
            simulated; they do not update mobile accounts or charge real money.
          </>
        )}
      </p>
      {!parsed.valid && (
        <div
          role="alert"
          className="rounded-xl border border-destructive p-4 text-sm"
        >
          Saved data is unreadable.{" "}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (
                window.confirm(
                  "Reset FindLove demo memberships, payments, rules and activity in this browser?",
                )
              ) {
                try {
                  saveBrowserRecord(
                    MEMBERSHIP_KEY,
                    seedMembershipDemo(Date.now()),
                  );
                  setError("");
                } catch {
                  setError(
                    "Browser storage is unavailable. Enable storage to use this demo.",
                  );
                }
              }
            }}
          >
            Reset FindLove demo
          </Button>
        </div>
      )}
      {message && (
        <div
          role="status"
          className="flex items-center justify-between gap-4 rounded-xl border border-success/30 bg-card p-4 text-sm"
        >
          <span>{message}</span>
          <Button variant="ghost" size="sm" onClick={() => setMessage("")}>
            Dismiss
          </Button>
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="fixed bottom-6 right-6 z-[60] max-w-sm rounded-xl border border-destructive bg-card p-5 text-sm shadow-xl"
        >
          <p>{error}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => setError("")}
          >
            Dismiss
          </Button>
        </div>
      )}
      {["overview", "statistics", "payments"].includes(view) && (
        <Metrics {...props} />
      )}
      {view === "plans" && <Plans {...props} />}
      {view === "rules" && <Rules {...props} />}
      {view === "members" && <Members {...props} memberId={memberId} />}
      {(view === "payments" || view === "statistics") && (
        <Payments {...props} />
      )}
      {view === "verification" && <Verification {...props} />}
      {view === "safety" && <Safety {...props} />}
      {view === "audit" && <Audit {...props} />}
      {view === "overview" && (
        <>
          <div className="grid gap-5 md:grid-cols-2">
            {[
              {
                href: "/find-love/subscriptions",
                icon: CreditCard,
                title: "Plans & pricing",
                description: "Edit six prices and control plan availability.",
              },
              {
                href: "/find-love/users",
                icon: Users,
                title: "Members & memberships",
                description: `${parsed.state.members.filter((m) => accessReason(m, now) !== "Access enabled").length} members currently need attention before access is enabled.`,
              },
              {
                href: "/find-love/verification",
                icon: ShieldCheck,
                title: "Verification review",
                description: `${parsed.state.members.filter((m) => m.verification === "pending").length} ${liveSnapshot ? "cases" : "synthetic cases"} awaiting manual review.`,
              },
              {
                href: "/find-love/settings",
                icon: HeartHandshake,
                title: "Connection rules",
                description:
                  "Public and Private privileges, with an access checker.",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <div className="flex items-center justify-between">
                  <item.icon className="h-6 w-6 text-primary" />
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </div>
                <h2 className="mt-5 font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
          <Card>
            <CardHeader
              title="How access works"
              description="Active account + verified adult + active membership with a valid expiry. Both tiers are paid."
            />
            <div className="space-y-3 p-5 text-sm leading-relaxed text-muted-foreground">
              <p>
                Public members can initiate connections with Public members.
                Private members can initiate with both tiers. Both profiles
                remain discoverable; receiving a Private request does not force
                a Public member to upgrade.
              </p>
              <p>
                Connection settings apply to new memberships. A current member’s
                saved permissions are shown in their profile. The rules checker
                uses the saved terms and checks country, verification and
                expiry.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/find-love/payments"
                  className="text-primary hover:underline"
                >
                  Monitor payments →
                </Link>
                <Link
                  href="/find-love/safety"
                  className="text-primary hover:underline"
                >
                  Review safety reports →
                </Link>
                <Link
                  href="/find-love/audit"
                  className="text-primary hover:underline"
                >
                  View activity →
                </Link>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Heart,
  HeartHandshake,
  MessageSquare,
  ShieldAlert,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

import { BarChart, DonutChart } from "@/components/shared/charts";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { DateFilterSelector } from "@/components/find-love/date-filter";
import type { DateFilter } from "@/lib/find-love/types";
import { getFindLoveStats } from "@/lib/find-love/store";

export function FindLoveOverviewDashboard({ initialStats }: { initialStats: ReturnType<typeof getFindLoveStats> }) {
  const [filter, setFilter] = useState<DateFilter>("all");
  const stats = filter === "all" ? initialStats : getFindLoveStats(filter);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Heart className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">FindLove Overview</h1>
              <p className="text-sm text-muted-foreground">
                Live membership, subscription revenue, identity verification, and community activity.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DateFilterSelector value={filter} onChange={setFilter} />
          <Link href="/find-love/users">
            <Button variant="primary" size="sm" className="shadow-sm">
              <UserPlus className="h-4 w-4" />
              Manage Users
            </Button>
          </Link>
        </div>
      </section>

      {/* Primary KPI Metrics */}
      <section aria-label="Essential platform metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total Registered Users"
          value={stats.metrics.totalUsers.toLocaleString()}
          icon={Users}
          hint={`${stats.metrics.privateUsers} Private (${Math.round(
            (stats.metrics.privateUsers / Math.max(1, stats.metrics.totalUsers)) * 100,
          )}%) · ${stats.metrics.publicUsers} Public`}
          href="/find-love/users"
        />
        <StatCard
          label="Confirmed Revenue"
          value={stats.metrics.confirmedRevenueFormatted}
          icon={Wallet}
          tone="success"
          hint="Reconciled & confirmed payments only"
          href="/find-love/payments"
        />
        <StatCard
          label="Outstanding Balance"
          value={stats.metrics.outstandingBalanceFormatted}
          icon={CircleDollarSign}
          tone="warning"
          hint="Unpaid installments under active plans"
          href="/find-love/payments"
        />
        <StatCard
          label="Active Subscriptions"
          value={stats.metrics.activeSubscriptions.toLocaleString()}
          icon={CreditCard}
          tone="success"
          hint={`${stats.metrics.pastDueSubscriptions} past due · ${stats.metrics.expiredSubscriptions} expired`}
          href="/find-love/subscriptions"
        />
        <StatCard
          label="Pending Verification"
          value={stats.metrics.pendingVerifications.toLocaleString()}
          icon={BadgeCheck}
          tone="warning"
          hint={`${stats.metrics.verifiedUsers} verified members`}
          href="/find-love/verification"
        />
        <StatCard
          label="Overdue Installments"
          value={stats.metrics.overdueAmountFormatted}
          icon={Clock3}
          tone="danger"
          hint={`${stats.metrics.overdueCount} installments past scheduled date`}
          href="/find-love/payments"
        />
      </section>

      {/* Secondary Metrics Bar */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center justify-between p-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Accepted Connections</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-foreground">{stats.metrics.acceptedConnections}</p>
          </div>
          <span className="rounded-xl bg-success-soft p-2 text-success">
            <HeartHandshake className="h-5 w-5" />
          </span>
        </Card>
        <Card className="flex items-center justify-between p-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Pending Requests</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-foreground">{stats.metrics.pendingConnections}</p>
          </div>
          <span className="rounded-xl bg-warning-soft p-2 text-warning">
            <Heart className="h-5 w-5" />
          </span>
        </Card>
        <Card className="flex items-center justify-between p-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Open Support Tickets</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-foreground">{stats.metrics.openTickets}</p>
          </div>
          <span className="rounded-xl bg-info-soft p-2 text-primary">
            <MessageSquare className="h-5 w-5" />
          </span>
        </Card>
        <Card className="flex items-center justify-between p-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Open Safety Reports</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-destructive">{stats.metrics.openReports}</p>
          </div>
          <span className="rounded-xl bg-destructive-soft p-2 text-destructive">
            <ShieldAlert className="h-5 w-5" />
          </span>
        </Card>
      </section>

      {/* Charts Section 1: Growth & Accounts */}
      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="User Registration Growth"
            description="Daily registered members over the last 14 days"
          />
          <div className="p-5">
            <BarChart
              data={stats.registrationChart}
              ariaLabel="Daily registered members over the last 14 days"
            />
          </div>
        </Card>
        <Card>
          <CardHeader
            title="Public vs. Private Accounts"
            description="Member distribution across account tiers"
          />
          <div className="p-5">
            <DonutChart
              slices={stats.accountTypeSlices}
              centerLabel="members"
              ariaLabel="Members distribution by account type"
            />
          </div>
        </Card>
      </section>

      {/* Charts Section 2: Payments & Revenue */}
      <section className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader
            title="Payment Status Distribution"
            description="Installment health & collection status"
          />
          <div className="p-5">
            <DonutChart
              slices={stats.paymentStatusSlices}
              centerLabel="installments"
              ariaLabel="Installment payment status distribution"
            />
          </div>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader
            title="Monthly Confirmed Revenue"
            description="Collected revenue in thousands RWF (past 6 months)"
          />
          <div className="p-5">
            <BarChart
              data={stats.revenueChart}
              ariaLabel="Monthly subscription revenue in thousands of Rwandan francs"
            />
          </div>
        </Card>
      </section>

      {/* Operational Queues: Verification & Community Safety */}
      <section className="grid gap-4 xl:grid-cols-3">
        {/* Verification Queue Card */}
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Identity Verification Queue</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                National ID & Passport submissions awaiting administrative review
              </p>
            </div>
            <Link href="/find-love/verification">
              <Button variant="ghost" size="sm" className="text-xs">
                View All Queue <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <Table>
            <thead>
              <tr>
                <Th>Member</Th>
                <Th>Document Type</Th>
                <Th>Submitted</Th>
                <Th>Review Status</Th>
                <Th className="text-right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {stats.verificationQueue.map((item) => (
                <tr key={item.id}>
                  <Td>
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.userId}</p>
                  </Td>
                  <Td>
                    <Badge tone="info">{item.document}</Badge>
                  </Td>
                  <Td className="text-xs text-muted-foreground">
                    {new Date(item.submitted).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Td>
                  <Td>
                    <Badge tone="warning" dot>Pending Review</Badge>
                  </Td>
                  <Td className="text-right">
                    <Link href={`/find-love/users/${item.userId}?tab=verification`}>
                      <Button variant="secondary" size="sm" className="h-7 text-xs">
                        Review
                      </Button>
                    </Link>
                  </Td>
                </tr>
              ))}
              {stats.verificationQueue.length === 0 && (
                <tr>
                  <Td colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                    Verification queue is clear! All documents reviewed.
                  </Td>
                </tr>
              )}
            </tbody>
          </Table>
          <div className="border-t border-border bg-surface px-5 py-3 text-xs text-muted-foreground">
            Document numbers and full identification files are restricted to authorized reviewers with an audited access log.
          </div>
        </Card>

        {/* Safety & Connections Card */}
        <Card className="flex flex-col">
          <CardHeader
            title="Connections & Community Safety"
            description="Real-time dating activity and moderation flags"
          />
          <div className="flex-1 space-y-4 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Accepted Matches</span>
              <Badge tone="success" dot>{stats.metrics.acceptedConnections}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending Requests</span>
              <Badge tone="warning" dot>{stats.metrics.pendingConnections}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Reported Connections</span>
              <Badge tone="danger" dot>{stats.metrics.reportedConnections}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Subscriptions</span>
              <Badge tone="info" dot>{stats.metrics.activeSubscriptions}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Renewal Retention</span>
              <Badge tone="info">{stats.metrics.renewalRate}</Badge>
            </div>

            <div className="mt-4 rounded-xl border border-primary/20 bg-primary-soft p-3 text-xs leading-relaxed text-foreground">
              <p className="font-semibold text-primary">Privacy Protected</p>
              Admins cannot arbitrarily accept romantic connections or read private dating chats without a documented safety report.
            </div>
          </div>
        </Card>
      </section>

      {/* Recent Administrative Activity Feed */}
      <Card>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Recent Administrative & Audit Activity</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Real-time audit log of actions performed by administrators
            </p>
          </div>
          <Link href="/find-love/audit">
            <Button variant="ghost" size="sm" className="text-xs">
              View Audit Log <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <ul className="divide-y divide-border">
          {stats.recentActivity.map((activity, i) => (
            <li key={i} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 hover:bg-muted/40 transition-colors">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                <p className="truncate text-xs text-muted-foreground">{activity.detail}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="neutral">{activity.actor}</Badge>
                <span className="text-xs text-muted-foreground tabular-nums">{activity.time}</span>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

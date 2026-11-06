"use client";

import { useState } from "react";
import {
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Download,
  Wallet,
} from "lucide-react";

import { BarChart, DonutChart } from "@/components/shared/charts";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { DateFilterSelector } from "@/components/find-love/date-filter";
import { getFindLoveStats } from "@/lib/find-love/store";
import type { DateFilter, FindLoveUser, Transaction } from "@/lib/find-love/types";

interface StatisticsViewProps {
  initialStats: ReturnType<typeof getFindLoveStats>;
  users: FindLoveUser[];
  transactions: Transaction[];
}

export function StatisticsView({ initialStats, users, transactions }: StatisticsViewProps) {
  const [period, setPeriod] = useState<DateFilter>("all");
  const stats = period === "all" ? initialStats : getFindLoveStats(period);

  const downloadCSV = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportRevenueCSV = () => {
    const headers = "Transaction Reference,User ID,User Name,Account Type,Plan,Amount,Currency,Payment Method,Status,Date\n";
    const rows = transactions
      .map(
        (t) =>
          `"${t.reference}","${t.userId}","${t.userName}","${t.accountType}","${t.planTitle}",${t.amount},"${t.currency}","${t.paymentMethod}","${t.status}","${t.date}"`,
      )
      .join("\n");
    downloadCSV(`findlove-financial-report-${new Date().toISOString().slice(0, 10)}.csv`, headers + rows);
  };

  const exportUsersCSV = () => {
    const headers = "User ID,Username,Full Name,Email,Gender,Age,Country,City,Account Tier,Status,Verification,Subscription,Joined\n";
    const rows = users
      .map(
        (u) =>
          `"${u.id}","${u.username}","${u.displayName}","${u.email}","${u.gender}",${u.age},"${u.country}","${u.city}","${u.accountType}","${u.accountStatus}","${u.verificationStatus}","${u.subscriptionStatus}","${u.joinedAt}"`,
      )
      .join("\n");
    downloadCSV(`findlove-users-export-${new Date().toISOString().slice(0, 10)}.csv`, headers + rows);
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Export Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Statistics & Financial Reports
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform performance metrics, revenue analytics, subscription renewals, and data exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <DateFilterSelector value={period} onChange={setPeriod} />
          <Button variant="secondary" size="sm" onClick={exportRevenueCSV}>
            <Download className="h-3.5 w-3.5" /> Export Revenue CSV
          </Button>
          <Button variant="primary" size="sm" onClick={exportUsersCSV}>
            <Download className="h-3.5 w-3.5" /> Export Members CSV
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Confirmed Revenue"
          value={stats.metrics.confirmedRevenueFormatted}
          icon={Wallet}
          tone="success"
          hint="Reconciled payments only"
        />
        <StatCard
          label="Outstanding Balance"
          value={stats.metrics.outstandingBalanceFormatted}
          icon={CircleDollarSign}
          tone="warning"
          hint="Installment balance remaining"
        />
        <StatCard
          label="Renewal Retention"
          value={stats.metrics.renewalRate}
          icon={CreditCard}
          tone="info"
          hint={`${stats.metrics.retentionRate} 30-day retention`}
        />
        <StatCard
          label="Verification Rate"
          value={`${Math.round(
            (stats.metrics.verifiedUsers / Math.max(1, stats.metrics.totalUsers)) * 100,
          )}%`}
          icon={CheckCircle2}
          tone="success"
          hint={`${stats.metrics.verifiedUsers} of ${stats.metrics.totalUsers} members`}
        />
      </section>

      {/* Revenue & Growth Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Monthly Revenue Collections"
            description="Reconciled platform revenue (thousands RWF)"
          />
          <div className="p-5">
            <BarChart
              data={stats.revenueChart}
              ariaLabel="Monthly subscription revenue in thousands of Rwandan francs"
            />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Daily Registrations"
            description="Member sign-up volume over the past 14 days"
          />
          <div className="p-5">
            <BarChart
              data={stats.registrationChart}
              ariaLabel="Daily registered members over the last 14 days"
            />
          </div>
        </Card>
      </div>

      {/* Breakdown Donuts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Account Tier Distribution"
            description="Public versus VIP Private account shares"
          />
          <div className="p-5">
            <DonutChart
              slices={stats.accountTypeSlices}
              centerLabel="members"
              ariaLabel="Members by account type"
            />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Payment Status Breakdown"
            description="Status of all subscription transactions"
          />
          <div className="p-5">
            <DonutChart
              slices={stats.paymentStatusSlices}
              centerLabel="installments"
              ariaLabel="Payment statuses"
            />
          </div>
        </Card>
      </div>

      {/* Available Data Reports Table */}
      <Card>
        <CardHeader
          title="Generated Administrative Reports"
          description="Downloadable spreadsheets for finance reconciliation, user metrics, and compliance"
        />
        <Table>
          <thead>
            <tr>
              <Th>Report Name</Th>
              <Th>Category</Th>
              <Th>Period</Th>
              <Th>Format</Th>
              <Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td className="font-semibold text-foreground">Complete Subscription Revenue Ledger</Td>
              <Td className="text-xs text-muted-foreground">Financial & Reconciliations</Td>
              <Td className="text-xs">All Time (YTD)</Td>
              <Td><Badge tone="success">CSV Spreadsheet</Badge></Td>
              <Td className="text-right">
                <Button variant="secondary" size="sm" className="h-7 text-xs" onClick={exportRevenueCSV}>
                  <Download className="h-3 w-3" /> Download
                </Button>
              </Td>
            </tr>
            <tr>
              <Td className="font-semibold text-foreground">Member Registry & Account Tiers</Td>
              <Td className="text-xs text-muted-foreground">User Management & Demographics</Td>
              <Td className="text-xs">All Registered Accounts</Td>
              <Td><Badge tone="success">CSV Spreadsheet</Badge></Td>
              <Td className="text-right">
                <Button variant="secondary" size="sm" className="h-7 text-xs" onClick={exportUsersCSV}>
                  <Download className="h-3 w-3" /> Download
                </Button>
              </Td>
            </tr>
            <tr>
              <Td className="font-semibold text-foreground">Overdue Installments & Recovery List</Td>
              <Td className="text-xs text-muted-foreground">Accounts Receivable</Td>
              <Td className="text-xs">Active Past-due</Td>
              <Td><Badge tone="warning">CSV Spreadsheet</Badge></Td>
              <Td className="text-right">
                <Button variant="secondary" size="sm" className="h-7 text-xs" onClick={exportRevenueCSV}>
                  <Download className="h-3 w-3" /> Download
                </Button>
              </Td>
            </tr>
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

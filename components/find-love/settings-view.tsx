"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Save,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { recordAuditLog } from "@/lib/find-love/store";
import type { PlatformSettings } from "@/lib/find-love/types";

export function SettingsView({ initialSettings }: { initialSettings: PlatformSettings }) {
  const [settings, setSettings] = useState<PlatformSettings>(initialSettings);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    recordAuditLog({
      actorId: "adm_001",
      actorName: "Admin Tester",
      action: "UPDATE_SETTINGS",
      targetType: "PlatformSettings",
      targetId: "global-config",
      details: `Updated platform rules: Grace period ${settings.gracePeriodDays}d, Currency ${settings.currency}, Max installments ${settings.maxInstallments}.`,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary-soft p-4 text-xs leading-relaxed text-foreground">
        <Settings className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <p className="font-semibold text-primary">Platform Lifecycle & Access Rules</p>
          Configure grace periods, maximum installment intervals, initial payment requirements for unlocking paid matchmaking, and default renewal behaviors.
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6">
          <CardHeader
            title="Billing & Installment Policies"
            description="Control how installment payment plans and grace periods operate across the platform"
          />
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-foreground">Platform Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="RWF">RWF — Rwandan Franc</option>
                <option value="USD">USD — US Dollar</option>
                <option value="KES">KES — Kenyan Shilling</option>
                <option value="UGX">UGX — Ugandan Shilling</option>
              </select>
              <p className="mt-1 text-[11px] text-muted-foreground">Standard currency used for subscription rates</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">
                Initial Payment Required to Activate Access (%)
              </label>
              <input
                type="number"
                min={10}
                max={100}
                value={settings.initialPaymentPercent}
                onChange={(e) => setSettings({ ...settings, initialPaymentPercent: Number(e.target.value) })}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-input px-3 text-sm font-semibold tabular-nums text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">Share of total subscription required before paid features unlock</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">
                Missed Payment Grace Period (Days)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={settings.gracePeriodDays}
                onChange={(e) => setSettings({ ...settings, gracePeriodDays: Number(e.target.value) })}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-input px-3 text-sm font-semibold tabular-nums text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">Paid features remain active during this grace window after due date</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">
                Overdue Feature Restriction Period (Days)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={settings.overdueSuspensionDays}
                onChange={(e) => setSettings({ ...settings, overdueSuspensionDays: Number(e.target.value) })}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-input px-3 text-sm font-semibold tabular-nums text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">Restricts paid access after grace period. Never deletes member account.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">Maximum Installments for Yearly Plan</label>
              <select
                value={settings.maxInstallments}
                onChange={(e) => setSettings({ ...settings, maxInstallments: Number(e.target.value) })}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value={1}>1 Installment (Single annual payment)</option>
                <option value={2}>2 Installments (Semi-annual)</option>
                <option value={4}>4 Installments (Quarterly)</option>
                <option value={12}>12 Installments (Monthly)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="autoRenewCheck"
                checked={settings.autoRenewDefault}
                onChange={(e) => setSettings({ ...settings, autoRenewDefault: e.target.checked })}
                className="h-4 w-4 rounded text-primary focus:ring-primary"
              />
              <label htmlFor="autoRenewCheck" className="text-xs font-semibold text-foreground cursor-pointer">
                Enable Automatic Renewal by Default for New Subscriptions
              </label>
            </div>
          </div>

          {saved && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-success-soft p-3 text-xs text-success">
              <CheckCircle2 className="h-4 w-4" /> Platform settings saved and logged to audit trail.
            </div>
          )}

          <div className="mt-6 flex justify-end border-t border-border pt-4">
            <Button type="submit" variant="primary">
              <Save className="h-4 w-4" /> Save Configuration
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

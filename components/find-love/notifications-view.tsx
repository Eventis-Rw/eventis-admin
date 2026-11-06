"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Edit2,
  Send,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/overlay";
import { Table, Td, Th } from "@/components/ui/table";
import type { NotificationTemplate } from "@/lib/find-love/types";

export function NotificationsView({ templates: initialTemplates }: { templates: NotificationTemplate[] }) {
  const [templates] = useState<NotificationTemplate[]>(initialTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [testSent, setTestSent] = useState(false);

  const handleSendTest = () => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Stat Bar */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Notifications Sent (30d)</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">12,852</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Across Push, SMS & In-app</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Delivery Success Rate</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-success">98.4%</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Aggregator confirmed delivery</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Active Templates</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{templates.length}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Standard automated triggers</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Installment Reminders</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-primary">1,420</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Sent 3 days before due</p>
        </Card>
      </section>

      {/* Templates Table */}
      <Card>
        <CardHeader
          title="Automated Notification & Reminder Templates"
          description="System-triggered messages for installments, identity decisions, and subscription renewals"
        />
        <Table>
          <thead>
            <tr>
              <Th>Template Name</Th>
              <Th>Trigger Event</Th>
              <Th>Target Audience</Th>
              <Th>Channels</Th>
              <Th>Status</Th>
              <Th>Delivery Rate</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {templates.map((tpl) => (
              <tr key={tpl.id} className="hover:bg-muted/30 transition-colors">
                <Td className="font-semibold text-foreground">{tpl.name}</Td>
                <Td className="text-xs text-muted-foreground">{tpl.trigger}</Td>
                <Td className="text-xs text-muted-foreground">{tpl.audience}</Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {tpl.channels.map((ch) => (
                      <Badge key={ch} tone="info" className="text-[10px]">
                        {ch}
                      </Badge>
                    ))}
                  </div>
                </Td>
                <Td>
                  <Badge tone={tpl.status === "active" ? "success" : "neutral"} dot>
                    {tpl.status}
                  </Badge>
                </Td>
                <Td className="tabular-nums font-mono text-xs font-semibold text-success">
                  {tpl.deliveredRate}
                </Td>
                <Td className="text-right">
                  <Button variant="secondary" size="sm" className="h-8 text-xs" onClick={() => setSelectedTemplate(tpl)}>
                    <Edit2 className="h-3 w-3" /> Preview & Edit
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {/* Preview Dialog */}
      {selectedTemplate && (
        <Dialog
          open={!!selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          title={`Template: ${selectedTemplate.name}`}
          description={`Trigger: ${selectedTemplate.trigger} · Audience: ${selectedTemplate.audience}`}
        >
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-foreground">Message Content (Supports dynamic tokens)</label>
              <div className="mt-1 rounded-xl border border-border bg-surface p-4 text-xs font-mono leading-relaxed text-foreground">
                {selectedTemplate.content}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 text-xs space-y-1">
              <p><strong>Available Placeholders:</strong></p>
              <p className="text-muted-foreground font-mono text-[11px]">{"{amount}"}, {"{due_date}"}, {"{user_name}"}, {"{reason}"}, {"{plan_title}"}</p>
            </div>

            {testSent && (
              <div className="rounded-xl bg-success-soft p-3 text-xs text-success flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Test notification dispatched to admin preview device.
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <Button variant="secondary" size="sm" onClick={handleSendTest}>
                <Send className="h-3 w-3" /> Send Test Preview
              </Button>
              <Button variant="primary" size="sm" onClick={() => setSelectedTemplate(null)}>
                Done
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

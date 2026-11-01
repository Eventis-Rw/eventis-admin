"use client";

import { useState } from "react";
import {
  Check,
  ShieldCheck,
  UserCog,
  X,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import type { AdminAccount } from "@/lib/find-love/types";

export function AdminsView({ admins }: { admins: AdminAccount[] }) {
  const [adminList] = useState<AdminAccount[]>(admins);

  const permissionsMatrix = [
    { role: "Super Administrator", viewDocs: true, pricing: true, refunds: true, suspend: true, support: true },
    { role: "Verification Officer", viewDocs: true, pricing: false, refunds: false, suspend: false, support: false },
    { role: "Finance Administrator", viewDocs: false, pricing: true, refunds: true, suspend: false, support: false },
    { role: "Safety & Moderation Officer", viewDocs: false, pricing: false, refunds: false, suspend: true, support: true },
    { role: "Customer Support Agent", viewDocs: false, pricing: false, refunds: false, suspend: false, support: true },
    { role: "Read-only Analyst", viewDocs: false, pricing: false, refunds: false, suspend: false, support: false },
  ];

  return (
    <div className="space-y-6">
      {/* RBAC explanation card */}
      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary-soft p-4 text-xs leading-relaxed text-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <p className="font-semibold text-primary">Role-Based Access Control (RBAC) & Least-Privilege Architecture</p>
          Permissions are strictly segregated. Verification officers can review sensitive identification documents without accessing billing or pricing. Finance administrators manage payment adjustments and plan rates without viewing identity documents.
        </div>
      </div>

      {/* Administrators List */}
      <Card>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Active Administrative Accounts</h2>
          </div>
          <Badge tone="info">{adminList.length} staff members</Badge>
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Staff Member</Th>
              <Th>Assigned Role</Th>
              <Th>View Identity Docs</Th>
              <Th>Modify Pricing</Th>
              <Th>Refund Payments</Th>
              <Th>Suspend Accounts</Th>
              <Th>Status</Th>
              <Th>Last Active</Th>
            </tr>
          </thead>
          <tbody>
            {adminList.map((admin) => (
              <tr key={admin.id} className="hover:bg-muted/30 transition-colors">
                <Td>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={admin.name} className="h-8 w-8" />
                    <div>
                      <p className="font-semibold text-foreground">{admin.name}</p>
                      <p className="text-xs text-muted-foreground">{admin.email}</p>
                    </div>
                  </div>
                </Td>
                <Td>
                  <Badge tone={admin.role === "super_admin" ? "info" : "neutral"}>
                    {admin.roleLabel}
                  </Badge>
                </Td>
                <Td>
                  {admin.canViewDocuments ? (
                    <Badge tone="success">Granted</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">Restricted</span>
                  )}
                </Td>
                <Td>
                  {admin.canChangePricing ? (
                    <Badge tone="success">Granted</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">Restricted</span>
                  )}
                </Td>
                <Td>
                  {admin.canRefundPayments ? (
                    <Badge tone="success">Granted</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">Restricted</span>
                  )}
                </Td>
                <Td>
                  {admin.canSuspendUsers ? (
                    <Badge tone="success">Granted</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">Restricted</span>
                  )}
                </Td>
                <Td>
                  <Badge tone={admin.status === "active" ? "success" : "danger"} dot>
                    {admin.status}
                  </Badge>
                </Td>
                <Td className="text-xs text-muted-foreground">
                  {new Date(admin.lastActiveAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {/* Permissions Matrix Table */}
      <Card>
        <CardHeader
          title="Role Permissions Matrix"
          description="Enforced access permissions by administrative role tier"
        />
        <Table>
          <thead>
            <tr>
              <Th>Role</Th>
              <Th>View Sensitive IDs</Th>
              <Th>Pricing Configuration</Th>
              <Th>Financial Refunds</Th>
              <Th>Account Suspensions</Th>
              <Th>Support & Tickets</Th>
            </tr>
          </thead>
          <tbody>
            {permissionsMatrix.map((item) => (
              <tr key={item.role}>
                <Td className="font-semibold text-foreground">{item.role}</Td>
                <Td>
                  {item.viewDocs ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground/40" />
                  )}
                </Td>
                <Td>
                  {item.pricing ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground/40" />
                  )}
                </Td>
                <Td>
                  {item.refunds ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground/40" />
                  )}
                </Td>
                <Td>
                  {item.suspend ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground/40" />
                  )}
                </Td>
                <Td>
                  {item.support ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground/40" />
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

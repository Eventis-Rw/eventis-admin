import {
  BadgeCheck,
  BarChart3,
  Bell,
  CreditCard,
  HeartHandshake,
  Images,
  MessageSquare,
  ScrollText,
  Settings,
  ShieldAlert,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import type { Cell, Section, Tone } from "@/lib/find-love/sections";

const icons: Record<string, LucideIcon> = {
  users: Users,
  verification: BadgeCheck,
  profiles: Images,
  subscriptions: CreditCard,
  payments: Wallet,
  connections: HeartHandshake,
  support: MessageSquare,
  safety: ShieldAlert,
  statistics: BarChart3,
  notifications: Bell,
  admins: UserCog,
  audit: ScrollText,
  settings: Settings,
};

function cellText(cell: Cell) {
  return typeof cell === "string" ? cell : cell.text;
}

function cellTone(cell: Cell): Tone | undefined {
  return typeof cell === "string" ? undefined : cell.tone;
}

export function FindLoveSectionView({ section }: { section: Section }) {
  const Icon = icons[section.slug] ?? Users;

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted-foreground">{section.description}</p>

      <section aria-label="Section metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {section.stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            hint={stat.hint}
            icon={Icon}
            tone={stat.tone === "info" || !stat.tone ? "info" : stat.tone}
          />
        ))}
      </section>

      <Card>
        <CardHeader title={section.tableTitle} />
        <Table>
          <thead>
            <tr>
              {section.columns.map((column) => (
                <Th key={column}>{column}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => {
                  const tone = cellTone(cell);
                  return (
                    <Td key={`${rowIndex}-${cellIndex}`}>
                      {tone ? (
                        <Badge tone={tone} dot>
                          {cellText(cell)}
                        </Badge>
                      ) : (
                        cellText(cell)
                      )}
                    </Td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </Table>
        {section.notes?.length ? (
          <ul className="space-y-1 px-5 py-3 text-xs text-muted-foreground">
            {section.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        ) : null}
      </Card>
    </div>
  );
}

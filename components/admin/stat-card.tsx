import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  change,
  tone,
}: {
  label: string;
  value: string;
  change: string;
  tone: "success" | "info" | "warning";
}) {
  return (
    <Card className="h-full border-zinc-200/70 bg-white/80">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-500">{label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">{value}</p>
          </div>

          <Badge variant={tone === "success" ? "success" : tone === "info" ? "info" : "warning"}>{change}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

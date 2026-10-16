import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const settings = [
  { label: "General preferences", value: "Synced" },
  { label: "Security policies", value: "Verified" },
  { label: "Notifications", value: "Enabled" },
  { label: "Audit trail", value: "Updated" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Card className="border-zinc-200/80 bg-white/80">
        <CardHeader>
          <CardTitle>Workspace settings</CardTitle>
          <CardDescription>System configuration and operational preferences.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {settings.map((setting) => (
            <div key={setting.label} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-zinc-900">{setting.label}</p>
                <Badge variant="success">{setting.value}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

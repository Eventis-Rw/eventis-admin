import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const users = [
  { name: "Ava Thompson", role: "Admin", status: "Active", value: "24 seats" },
  { name: "Marcus Reed", role: "Manager", status: "Active", value: "12 seats" },
  { name: "Sofia Nguyen", role: "Analyst", status: "Invited", value: "6 seats" },
  { name: "Leo Brooks", role: "Support", status: "Paused", value: "4 seats" },
];

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <Card className="border-zinc-200/80 bg-white/80">
        <CardHeader>
          <CardTitle>User access</CardTitle>
          <CardDescription>Administrators and team members with dashboard access.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {users.map((user) => (
            <div key={user.name} className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-zinc-900">{user.name}</p>
                <p className="text-sm text-zinc-500">{user.role}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-500">{user.value}</span>
                <Badge variant={user.status === "Active" ? "success" : user.status === "Invited" ? "info" : "warning"}>{user.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

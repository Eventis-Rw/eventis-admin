import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const channels = [
  { name: "Organic search", value: "42%", delta: "+7.3%" },
  { name: "Paid media", value: "26%", delta: "+2.9%" },
  { name: "Referral", value: "19%", delta: "+4.1%" },
  { name: "Email", value: "13%", delta: "+1.2%" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Sessions", "128.4K", "+18.2%"],
          ["New signups", "8,420", "+9.6%"],
          ["Avg. duration", "06:42", "+1.4m"],
          ["Bounce rate", "23.8%", "-2.1%"],
        ].map(([label, value, delta]) => (
          <Card key={label} className="border-zinc-200/80 bg-white/80">
            <CardContent className="p-5">
              <p className="text-sm text-zinc-500">{label}</p>
              <div className="mt-3 flex items-center justify-between gap-4">
                <p className="text-2xl font-semibold text-zinc-900">{value}</p>
                <Badge variant="success">{delta}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-zinc-200/80 bg-white/80">
          <CardHeader>
            <CardTitle>Traffic overview</CardTitle>
            <CardDescription>Channel performance over the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-end gap-3 rounded-2xl bg-zinc-50 p-4">
              {[42, 58, 66, 81, 76, 91, 88].map((height, index) => (
                <div key={height} className="flex-1 rounded-t-2xl bg-gradient-to-t from-zinc-900 to-zinc-500" style={{ height: `${height}%`, opacity: 0.5 + index * 0.08 }} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 bg-white/80">
          <CardHeader>
            <CardTitle>Channel mix</CardTitle>
            <CardDescription>Current acquisition split.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {channels.map((channel) => (
              <div key={channel.name} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-zinc-900">{channel.name}</span>
                  <span className="text-sm text-zinc-500">{channel.value}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-zinc-200">
                  <div className="h-full rounded-full bg-zinc-900" style={{ width: channel.value }} />
                </div>
                <p className="mt-2 text-xs font-medium text-emerald-600">{channel.delta}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

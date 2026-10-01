import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const projects = [
  { name: "Northwind rollout", status: "Healthy", owner: "Product", percent: "84%" },
  { name: "Lifecycle automation", status: "Review", owner: "Marketing", percent: "61%" },
  { name: "Reporting overhaul", status: "On track", owner: "Data", percent: "72%" },
  { name: "Enterprise migration", status: "Blocked", owner: "Platform", percent: "39%" },
];

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total projects", "26"],
          ["In progress", "12"],
          ["At risk", "3"],
          ["Completed", "11"],
        ].map(([label, value]) => (
          <Card key={label} className="border-zinc-200/80 bg-white/80">
            <CardContent className="p-5">
              <p className="text-sm text-zinc-500">{label}</p>
              <p className="mt-3 text-2xl font-semibold text-zinc-900">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-zinc-200/80 bg-white/80">
        <CardHeader>
          <CardTitle>Portfolio overview</CardTitle>
          <CardDescription>Program progress across the current delivery cycle.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {projects.map((project) => (
            <div key={project.name} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-zinc-900">{project.name}</p>
                  <p className="text-sm text-zinc-500">{project.owner}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-500">{project.percent}</span>
                  <Badge variant={project.status === "Healthy" ? "success" : project.status === "Blocked" ? "destructive" : project.status === "Review" ? "warning" : "info"}>{project.status}</Badge>
                </div>
              </div>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-zinc-200">
                <div className="h-full rounded-full bg-zinc-900" style={{ width: project.percent }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

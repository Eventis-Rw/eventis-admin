"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BellRing,
  CheckCircle2,
  CreditCard,
  Plus,
  Search,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { overviewStats, pipelineItems, recentActivity, teamMembers } from "@/lib/admin-data";

type AccountStatus = "Active" | "Trial" | "At risk";

type Customer = {
  id: string;
  name: string;
  company: string;
  status: AccountStatus;
  plan: string;
  owner: string;
  revenue: string;
};

const initialCustomers: Customer[] = [
  { id: "CUS-1042", name: "Alica Morgan", company: "Northwind Labs", status: "Active", plan: "Enterprise", owner: "Eugene", revenue: "$18.4K" },
  { id: "CUS-2049", name: "Marcus Brooks", company: "Harbor Studio", status: "At risk", plan: "Growth", owner: "Nina", revenue: "$9.2K" },
  { id: "CUS-3356", name: "Shannon Lee", company: "Cinder Works", status: "Trial", plan: "Starter", owner: "Liam", revenue: "$4.7K" },
  { id: "CUS-4821", name: "Priya Shah", company: "Summit One", status: "Active", plan: "Enterprise", owner: "Eugene", revenue: "$26.8K" },
];

const tabs = [
  { id: "overview", label: "Overview", count: 12 },
  { id: "pipeline", label: "Pipeline", count: 6 },
  { id: "customers", label: "Customers", count: 24 },
];

function getStatusVariant(status: string) {
  switch (status) {
    case "Active":
      return "success";
    case "At risk":
      return "warning";
    case "Trial":
      return "info";
    default:
      return "secondary";
  }
}

export function OverviewDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [form, setForm] = useState<{ name: string; company: string; plan: string; status: AccountStatus; owner: string }>({
    name: "",
    company: "",
    plan: "Growth",
    status: "Trial",
    owner: "Eugene",
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesStatus = statusFilter === "all" ? true : customer.status === statusFilter;
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        !search ||
        customer.name.toLowerCase().includes(search) ||
        customer.company.toLowerCase().includes(search) ||
        customer.owner.toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [customers, searchTerm, statusFilter]);

  const handleAddCustomer = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.company.trim()) return;

    const newCustomer: Customer = {
      id: `CUS-${Math.floor(Math.random() * 9000) + 1000}`,
      name: form.name.trim(),
      company: form.company.trim(),
      status: form.status,
      plan: form.plan,
      owner: form.owner,
      revenue: "$0.0K",
    };

    setCustomers((current) => [newCustomer, ...current]);
    setForm({
      name: "",
      company: "",
      plan: "Growth",
      status: "Trial",
      owner: "Eugene",
    });
    setActiveTab("customers");
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 p-6 text-white shadow-[0_24px_50px_rgba(24,24,27,0.2)] sm:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-300">Executive snapshot</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Good morning, Eugene.</h2>
          </div>

          <Button variant="secondary" className="w-fit bg-white text-zinc-900 hover:bg-zinc-100">
            Export report
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-zinc-300">Net pipeline</p>
            <p className="mt-2 text-2xl font-semibold">$1.84M</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-zinc-300">Forecast accuracy</p>
            <p className="mt-2 text-2xl font-semibold">96.2%</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-zinc-300">Team velocity</p>
            <p className="mt-2 text-2xl font-semibold">+18.5%</p>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="w-full sm:w-56">
            <Input
              aria-label="Search customers"
              placeholder="Search customers"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="w-full sm:w-40">
            <Select
              aria-label="Filter status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All status</option>
              <option value="Active">Active</option>
              <option value="Trial">Trial</option>
              <option value="At risk">At risk</option>
            </Select>
          </div>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewStats.map((stat) => (
          <Card key={stat.label} className="h-full border-zinc-200/70 bg-white/80">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-500">{stat.label}</p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">{stat.value}</p>
                </div>
                <Badge variant={stat.tone === "success" ? "success" : stat.tone === "info" ? "info" : "warning"}>{stat.change}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="border-zinc-200/80 bg-white/80">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
            <div>
              <CardTitle>Growth overview</CardTitle>
              <CardDescription>Revenue performance across major segments.</CardDescription>
            </div>
            <Badge variant="success" className="gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              +12.4%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-4">
              {[54, 72, 88, 68].map((height, index) => (
                <div key={height} className="flex h-40 items-end justify-center gap-2 rounded-2xl bg-zinc-50 p-3">
                  <div
                    className={`w-full rounded-xl bg-gradient-to-t ${index % 2 === 0 ? "from-zinc-900 via-zinc-700 to-zinc-400" : "from-emerald-600 via-emerald-500 to-emerald-300"}`}
                    style={{ height: `${height}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 bg-white/80">
          <CardHeader className="pb-4">
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest admin actions and platform updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
                <div className="mt-0.5 rounded-full bg-emerald-100 p-1.5 text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-zinc-900">{item.title}</p>
                  <p className="text-sm text-zinc-500">{item.detail}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-zinc-400">{item.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-zinc-200/80 bg-white/80">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
            <div>
              <CardTitle>Customer pipeline</CardTitle>
              <CardDescription>Accounts requiring attention across the funnel.</CardDescription>
            </div>
            <ArrowUpRight className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipelineItems.map((item) => (
                <div key={item.name} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-zinc-900">{item.name}</p>
                      <p className="text-sm text-zinc-500">{item.value}</p>
                    </div>
                    <Badge variant="secondary">{item.status}</Badge>
                  </div>
                  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-zinc-200">
                    <div className="h-full rounded-full bg-zinc-900" style={{ width: `${item.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 bg-white/80">
          <CardHeader className="pb-4">
            <CardTitle>Team overview</CardTitle>
            <CardDescription>Current workload distribution.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.name} className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                    {member.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900">{member.name}</p>
                    <p className="text-sm text-zinc-500">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <BellRing className="h-3.5 w-3.5" />
                  {member.metric}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {(activeTab === "customers" || activeTab === "overview") && (
        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <Card className="border-zinc-200/80 bg-white/80">
            <CardHeader>
              <CardTitle>Account table</CardTitle>
              <CardDescription>Live customer health and account ownership.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-hidden p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-zinc-900">{customer.name}</p>
                          <p className="text-sm text-zinc-500">{customer.company}</p>
                        </div>
                      </TableCell>
                      <TableCell>{customer.plan}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(customer.status)}>{customer.status}</Badge>
                      </TableCell>
                      <TableCell>{customer.owner}</TableCell>
                      <TableCell className="text-right font-medium text-zinc-900">{customer.revenue}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-zinc-200/80 bg-white/80">
            <CardHeader>
              <CardTitle>Add customer</CardTitle>
              <CardDescription>Create a new account record.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleAddCustomer}>
                <Input
                  label="Contact name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Jordan Miles"
                />

                <Input
                  label="Company"
                  value={form.company}
                  onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
                  placeholder="Aster Labs"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    label="Plan"
                    value={form.plan}
                    onChange={(event) => setForm((current) => ({ ...current, plan: event.target.value }))}
                  >
                    <option value="Starter">Starter</option>
                    <option value="Growth">Growth</option>
                    <option value="Enterprise">Enterprise</option>
                  </Select>

                  <Select
                    label="Status"
                    value={form.status}
                    onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as AccountStatus }))}
                  >
                    <option value="Trial">Trial</option>
                    <option value="Active">Active</option>
                    <option value="At risk">At risk</option>
                  </Select>
                </div>

                <Input
                  label="Owner"
                  value={form.owner}
                  onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))}
                  placeholder="Eugene"
                />

                <Button type="submit" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add account
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-zinc-200/80 bg-white/80">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Monthly growth</p>
              <p className="text-lg font-semibold text-zinc-900">+14.7%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-200/80 bg-white/80">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Collections</p>
              <p className="text-lg font-semibold text-zinc-900">$96.1K</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

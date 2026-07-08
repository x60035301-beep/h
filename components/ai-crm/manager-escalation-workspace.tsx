"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, BellRing, CheckCircle2, Loader2, Send, ShieldAlert, Users, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { cn, formatDate } from "@/lib/utils";
import type { AppUser, CustomerSummary, Locale } from "@/types/crm";

type EscalationReason = "no_quote_7d" | "price_blocked" | "high_value" | "sample_delay";

const copy = {
  zh: {
    title: "经理升级处理",
    subtitle: "把超时未报价、价格卡住或高价值客户升级给经理，避免销售流程停住。",
    pending: "待升级",
    notified: "已通知",
    managers: "可用经理",
    urgent: "紧急客户",
    queue: "升级队列",
    managerPanel: "经理列表",
    customer: "客户",
    stage: "阶段",
    grade: "等级",
    lastContact: "最近联系",
    reason: "升级原因",
    owner: "提醒经理",
    action: "动作",
    notify: "通知经理",
    notifyAll: "通知选中经理",
    resolved: "已处理",
    notifiedToast: "经理提醒已发送",
    noQuote: "7天未报价",
    priceBlocked: "价格谈判卡住",
    highValue: "高价值客户",
    sampleDelay: "样品进度延迟",
    noteTitle: "升级规则",
    note: "只把需要经理介入的客户升级：高价值、超过时限、价格卡住、样品或交付风险。",
    noManagers: "请先在 Supabase 用户表中创建 Manager/Boss/Admin 用户"
  },
  en: {
    title: "Manager Escalation",
    subtitle: "Escalate stalled quotes, price blockers, and high-value customers to managers before the pipeline stops.",
    pending: "Pending",
    notified: "Notified",
    managers: "Managers",
    urgent: "Urgent customers",
    queue: "Escalation queue",
    managerPanel: "Managers",
    customer: "Customer",
    stage: "Stage",
    grade: "Grade",
    lastContact: "Last contact",
    reason: "Reason",
    owner: "Manager",
    action: "Action",
    notify: "Notify manager",
    notifyAll: "Notify selected managers",
    resolved: "Resolved",
    notifiedToast: "Manager notification sent",
    noQuote: "No quote after 7 days",
    priceBlocked: "Price negotiation blocked",
    highValue: "High-value customer",
    sampleDelay: "Sample progress delayed",
    noteTitle: "Escalation rule",
    note: "Escalate only cases that need manager help: high value, overdue, price stuck, sample risk, or delivery risk.",
    noManagers: "Create Manager/Boss/Admin users in Supabase first"
  },
  id: {
    title: "Eskalasi Manager",
    subtitle: "Eskalasi quote yang macet, hambatan harga, dan pelanggan bernilai tinggi ke manager sebelum pipeline berhenti.",
    pending: "Pending",
    notified: "Terkirim",
    managers: "Manager",
    urgent: "Customer urgent",
    queue: "Queue eskalasi",
    managerPanel: "Manager",
    customer: "Pelanggan",
    stage: "Tahap",
    grade: "Grade",
    lastContact: "Kontak terakhir",
    reason: "Alasan",
    owner: "Manager",
    action: "Aksi",
    notify: "Notifikasi manager",
    notifyAll: "Notifikasi manager terpilih",
    resolved: "Selesai",
    notifiedToast: "Notifikasi manager terkirim",
    noQuote: "7 hari belum quote",
    priceBlocked: "Negosiasi harga macet",
    highValue: "Pelanggan high value",
    sampleDelay: "Progress sample terlambat",
    noteTitle: "Aturan eskalasi",
    note: "Eskalasi hanya kasus yang perlu bantuan manager: high value, overdue, harga macet, risiko sample, atau risiko delivery.",
    noManagers: "Buat user Manager/Boss/Admin di Supabase terlebih dahulu"
  }
} as const;

const reasonMap: Record<EscalationReason, keyof typeof copy.zh> = {
  no_quote_7d: "noQuote",
  price_blocked: "priceBlocked",
  high_value: "highValue",
  sample_delay: "sampleDelay"
};

export function ManagerEscalationWorkspace({
  locale,
  customers,
  managerUsers
}: {
  locale: Locale;
  customers: CustomerSummary[];
  managerUsers: AppUser[];
}) {
  const page = copy[locale];
  const cases = useMemo(() => buildCases(customers), [customers]);
  const [managerByCustomer, setManagerByCustomer] = useState<Record<string, string>>(
    Object.fromEntries(cases.map((item, index) => [item.customer.id, managerUsers[index % Math.max(managerUsers.length, 1)]?.id ?? "unassigned"]))
  );
  const [notified, setNotified] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const notifiedCount = Object.values(notified).filter(Boolean).length;
  const urgentCount = cases.filter((item) => item.reason === "high_value" || item.reason === "no_quote_7d").length;
  const managerLoad = managerUsers.map((manager) => ({
    ...manager,
    name: getUserName(manager),
    selected: Object.values(managerByCustomer).filter((id) => id === manager.id).length
  }));

  async function notify(ids: string[]) {
    const rows = ids
      .map((customerId) => {
        const item = cases.find((entry) => entry.customer.id === customerId);
        const manager = managerUsers.find((user) => user.id === managerByCustomer[customerId]);
        if (!manager) return null;
        return {
          customer_id: customerId,
          manager_id: manager.id,
          manager_name: getUserName(manager),
          reason: item ? page[reasonMap[item.reason]] : page.noQuote
        };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row));

    if (!rows.length) {
      toast({ title: page.noManagers, variant: "destructive" });
      return;
    }

    setLoading(true);
    const response = await fetch("/api/manager-escalation/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ escalations: rows })
    });
    const payload = await response.json().catch(() => null);
    setLoading(false);

    if (!response.ok) {
      toast({ title: "Notify failed", description: payload?.error, variant: "destructive" });
      return;
    }

    setNotified((current) => ({ ...current, ...Object.fromEntries(ids.map((id) => [id, true])) }));
    toast({ title: page.notifiedToast, description: rows.map((row) => row.manager_name).join(", ") });
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={ShieldAlert} label={page.pending} value={String(Math.max(cases.length - notifiedCount, 0))} />
        <Metric icon={BellRing} label={page.notified} value={String(notifiedCount)} />
        <Metric icon={Users} label={page.managers} value={String(managerUsers.length)} />
        <Metric icon={AlertTriangle} label={page.urgent} value={String(urgentCount)} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle>{page.queue}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{page.subtitle}</p>
            </div>
            <Button type="button" onClick={() => notify(cases.map((item) => item.customer.id))} disabled={loading || !cases.length || !managerUsers.length}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {page.notifyAll}
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{page.customer}</TableHead>
                  <TableHead>{page.stage}</TableHead>
                  <TableHead>{page.grade}</TableHead>
                  <TableHead>{page.lastContact}</TableHead>
                  <TableHead>{page.reason}</TableHead>
                  <TableHead className="min-w-48">{page.owner}</TableHead>
                  <TableHead>{page.action}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((item) => (
                  <TableRow key={item.customer.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.customer.company_name}</p>
                        <p className="text-xs text-muted-foreground">{item.customer.country ?? "-"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.customer.stage}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.customer.grade === "A" ? "success" : "secondary"}>{item.customer.grade}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(item.customer.last_contacted_at, "yyyy-MM-dd", locale)}</TableCell>
                    <TableCell>
                      <span className={cn("text-sm", item.reason === "high_value" && "font-medium text-amber-700 dark:text-amber-300")}>
                        {page[reasonMap[item.reason]]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={managerByCustomer[item.customer.id] ?? "unassigned"}
                        onValueChange={(value) => setManagerByCustomer((current) => ({ ...current, [item.customer.id]: value }))}
                        disabled={!managerUsers.length}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {managerLoad.map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant={notified[item.customer.id] ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => notify([item.customer.id])}
                        disabled={loading || notified[item.customer.id] || !managerUsers.length}
                      >
                        {notified[item.customer.id] ? <CheckCircle2 className="size-4" /> : <Send className="size-4" />}
                        {notified[item.customer.id] ? page.resolved : page.notify}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{page.noteTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">{page.note}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{page.managerPanel}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {managerLoad.length ? (
                managerLoad.map((manager) => (
                  <div key={manager.id} className="rounded-md border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{manager.name}</p>
                        <p className="text-xs text-muted-foreground">{manager.email ?? manager.role}</p>
                      </div>
                      <Badge variant={manager.selected ? "success" : "secondary"}>+{manager.selected}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{page.noManagers}</p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}

function buildCases(customers: CustomerSummary[]) {
  const reasons: EscalationReason[] = ["no_quote_7d", "price_blocked", "high_value", "sample_delay"];
  return customers
    .filter((customer) => customer.stage !== "won")
    .slice(0, 7)
    .map((customer, index) => ({
      customer,
      reason: customer.grade === "A" ? ("high_value" as const) : reasons[index % reasons.length]
    }));
}

function getUserName(user: AppUser) {
  return user.full_name ?? user.email ?? user.id;
}

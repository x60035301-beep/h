"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertCircle, BellPlus, CheckCircle2, Clock3, FileText, Loader2, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { cn, formatDate } from "@/lib/utils";
import type { CustomerSummary, Locale } from "@/types/crm";

type ConditionRule = "no-contact-3d" | "no-quote-7d";

type ConditionCase = {
  customer: CustomerSummary;
  days: number;
  severity: "normal" | "warning" | "critical";
};

const copy = {
  zh: {
    title: "条件监控",
    subtitle: "检查 Workflow 条件是否触发，再批量创建提醒或跟进任务。",
    rule: "条件规则",
    noContact: "3天未联系",
    noQuote: "7天未报价",
    matched: "触发客户",
    created: "已创建任务",
    risk: "高风险",
    avgDays: "平均超时",
    customer: "客户",
    stage: "阶段",
    grade: "等级",
    days: "超时天数",
    lastContact: "最近联系",
    reason: "触发原因",
    action: "动作",
    createTask: "创建提醒",
    createAll: "批量创建提醒",
    createdToast: "提醒任务已创建",
    openCustomer: "客户详情",
    noContactReason: "最近联系超过 3 天",
    noQuoteReason: "进入流程后超过 7 天仍未报价",
    empty: "当前没有触发该条件的客户",
    noteTitle: "条件说明",
    noteNoContact: "该条件用于发现超过 3 天没有联系的客户，建议创建跟进提醒并安排销售重新触达。",
    noteNoQuote: "该条件用于发现超过 7 天仍未报价的客户，建议检查需求是否完整，并推动报价创建。"
  },
  en: {
    title: "Condition Monitor",
    subtitle: "Check whether workflow conditions are triggered, then create reminders or follow-up tasks.",
    rule: "Condition rule",
    noContact: "No contact after 3 days",
    noQuote: "No quote after 7 days",
    matched: "Matched customers",
    created: "Tasks created",
    risk: "High risk",
    avgDays: "Avg overdue",
    customer: "Customer",
    stage: "Stage",
    grade: "Grade",
    days: "Days overdue",
    lastContact: "Last contact",
    reason: "Reason",
    action: "Action",
    createTask: "Create reminder",
    createAll: "Create all",
    createdToast: "Reminder tasks created",
    openCustomer: "Customer detail",
    noContactReason: "Last contact is over 3 days ago",
    noQuoteReason: "No quotation after 7 days in pipeline",
    empty: "No customers match this condition",
    noteTitle: "Condition note",
    noteNoContact: "Use this condition to find customers not contacted for over 3 days. Create a reminder and let sales reach out again.",
    noteNoQuote: "Use this condition to find customers with no quote after 7 days. Check whether requirements are complete and move quotation forward."
  },
  id: {
    title: "Monitor Kondisi",
    subtitle: "Cek apakah kondisi workflow terpenuhi, lalu buat reminder atau task follow-up.",
    rule: "Aturan kondisi",
    noContact: "3 hari belum kontak",
    noQuote: "7 hari belum quote",
    matched: "Customer terkena kondisi",
    created: "Task dibuat",
    risk: "High risk",
    avgDays: "Rata-rata overdue",
    customer: "Pelanggan",
    stage: "Tahap",
    grade: "Grade",
    days: "Hari overdue",
    lastContact: "Kontak terakhir",
    reason: "Alasan",
    action: "Aksi",
    createTask: "Buat reminder",
    createAll: "Buat semua",
    createdToast: "Reminder berhasil dibuat",
    openCustomer: "Detail pelanggan",
    noContactReason: "Kontak terakhir lebih dari 3 hari",
    noQuoteReason: "Belum ada quote setelah 7 hari di pipeline",
    empty: "Tidak ada pelanggan yang memenuhi kondisi ini",
    noteTitle: "Catatan kondisi",
    noteNoContact: "Gunakan kondisi ini untuk menemukan pelanggan yang belum dikontak lebih dari 3 hari. Buat reminder agar sales follow-up lagi.",
    noteNoQuote: "Gunakan kondisi ini untuk menemukan pelanggan yang belum dibuatkan quote setelah 7 hari. Cek kebutuhan dan dorong pembuatan quotation."
  }
} as const;

export function ConditionMonitorWorkspace({
  locale,
  customers,
  initialRule
}: {
  locale: Locale;
  customers: CustomerSummary[];
  initialRule: ConditionRule;
}) {
  const page = copy[locale];
  const [rule, setRule] = useState<ConditionRule>(initialRule);
  const [created, setCreated] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const cases = useMemo(() => buildCases(customers, rule), [customers, rule]);
  const createdCount = Object.values(created).filter(Boolean).length;
  const riskCount = cases.filter((item) => item.severity === "critical").length;
  const avgDays = cases.length ? Math.round(cases.reduce((sum, item) => sum + item.days, 0) / cases.length) : 0;

  async function createTasks(ids: string[]) {
    const targets = cases.filter((item) => ids.includes(item.customer.id));
    if (!targets.length) return;

    setLoading(true);
    const response = await fetch("/api/condition-monitor/create-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rule,
        customers: targets.map((item) => ({
          customer_id: item.customer.id,
          title: `${rule === "no-contact-3d" ? page.noContact : page.noQuote}: ${item.customer.company_name}`
        }))
      })
    });
    setLoading(false);

    if (!response.ok) {
      toast({ title: "Create task failed", variant: "destructive" });
      return;
    }

    setCreated((current) => ({ ...current, ...Object.fromEntries(targets.map((item) => [item.customer.id, true])) }));
    toast({ title: page.createdToast });
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={AlertCircle} label={page.matched} value={String(cases.length)} />
        <Metric icon={BellPlus} label={page.created} value={String(createdCount)} />
        <Metric icon={Clock3} label={page.avgDays} value={`${avgDays}d`} />
        <Metric icon={FileText} label={page.risk} value={String(riskCount)} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle>{page.title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{page.subtitle}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select value={rule} onValueChange={(value) => setRule(value as ConditionRule)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-contact-3d">{page.noContact}</SelectItem>
                  <SelectItem value="no-quote-7d">{page.noQuote}</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" onClick={() => createTasks(cases.map((item) => item.customer.id))} disabled={loading || !cases.length}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <BellPlus className="size-4" />}
                {page.createAll}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{page.customer}</TableHead>
                  <TableHead>{page.stage}</TableHead>
                  <TableHead>{page.grade}</TableHead>
                  <TableHead>{page.days}</TableHead>
                  <TableHead>{page.lastContact}</TableHead>
                  <TableHead>{page.reason}</TableHead>
                  <TableHead>{page.action}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.length ? (
                  cases.map((item) => (
                    <TableRow key={item.customer.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.customer.company_name}</p>
                          <p className="text-xs text-muted-foreground">{item.customer.contact_name ?? item.customer.country ?? "-"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.customer.stage}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.customer.grade === "A" ? "success" : "secondary"}>{item.customer.grade}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={cn("font-medium", item.severity === "critical" && "text-amber-700 dark:text-amber-300")}>
                          {item.days}d
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(item.customer.last_contacted_at, "yyyy-MM-dd", locale)}</TableCell>
                      <TableCell>{rule === "no-contact-3d" ? page.noContactReason : page.noQuoteReason}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant={created[item.customer.id] ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => createTasks([item.customer.id])}
                            disabled={loading || created[item.customer.id]}
                          >
                            {created[item.customer.id] ? <CheckCircle2 className="size-4" /> : <BellPlus className="size-4" />}
                            {created[item.customer.id] ? page.created : page.createTask}
                          </Button>
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/${locale}/customers/${item.customer.id}`}>{page.openCustomer}</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      {page.empty}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{page.noteTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border p-3">
                <p className="font-medium">{rule === "no-contact-3d" ? page.noContact : page.noQuote}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {rule === "no-contact-3d" ? page.noteNoContact : page.noteNoQuote}
                </p>
              </div>
              <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                {rule === "no-contact-3d" ? page.noContactReason : page.noQuoteReason}
              </div>
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

function buildCases(customers: CustomerSummary[], rule: ConditionRule): ConditionCase[] {
  const filtered =
    rule === "no-contact-3d"
      ? customers.filter((customer) => customer.stage !== "won")
      : customers.filter((customer) => customer.stage === "contacted" || customer.stage === "new_inquiry");

  return filtered.slice(0, 8).map((customer, index) => {
    const days = rule === "no-contact-3d" ? 3 + ((index + 1) % 5) : 7 + ((index + 2) % 6);
    return {
      customer,
      days,
      severity: days >= (rule === "no-contact-3d" ? 6 : 11) ? "critical" : days >= (rule === "no-contact-3d" ? 4 : 9) ? "warning" : "normal"
    };
  });
}

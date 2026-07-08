"use client";

import { useMemo, useState } from "react";
import { BellRing, CheckCircle2, Clock3, Loader2, Send, UserCheck, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import type { AppUser, CustomerSummary, Locale } from "@/types/crm";

type ReminderCase = {
  customer: CustomerSummary;
  sales: AppUser | null;
  reason: "no_contact" | "quote_pending" | "sample_pending" | "high_value";
  overdueHours: number;
};

type SalesReminderResponse = {
  data?: {
    notified?: number;
    recipients?: string[];
    customers?: string[];
  };
};

const copy = {
  zh: {
    title: "提醒销售",
    subtitle: "给负责销售发送内部催办提醒，推动客户跟进、报价、样品和高价值客户处理。",
    pending: "待提醒",
    sent: "已发送",
    salesCount: "销售人数",
    overdue: "超时提醒",
    queue: "销售提醒队列",
    customer: "客户",
    sales: "负责销售",
    reason: "提醒原因",
    overdueTime: "超时",
    lastContact: "最近联系",
    message: "提醒内容",
    action: "动作",
    notify: "发送提醒",
    notifyAll: "批量提醒销售",
    notifyFailed: "发送提醒失败",
    sentTo: "已发送给",
    sentBatch: "已发送给 {sales} 位销售，共 {count} 条提醒",
    aboutCustomer: "客户",
    sentLabel: "已提醒",
    noContact: "客户未联系",
    quotePending: "报价未推进",
    samplePending: "样品未确认",
    highValue: "高价值客户需跟进",
    noteTitle: "提醒逻辑",
    note: "提醒销售会创建真实提醒记录和客户活动，用于通知负责人尽快处理客户。",
    noSales: "请先在 Supabase 用户表中创建 Sales 角色用户"
  },
  en: {
    title: "Remind Sales",
    subtitle: "Send internal reminders to sales owners for customer follow-up, quotation, sample, and high-value actions.",
    pending: "Pending",
    sent: "Sent",
    salesCount: "Sales reps",
    overdue: "Overdue",
    queue: "Sales reminder queue",
    customer: "Customer",
    sales: "Sales owner",
    reason: "Reason",
    overdueTime: "Overdue",
    lastContact: "Last contact",
    message: "Message",
    action: "Action",
    notify: "Send reminder",
    notifyAll: "Remind all",
    notifyFailed: "Notify failed",
    sentTo: "Sent to",
    sentBatch: "Sent to {sales} sales reps, {count} reminders",
    aboutCustomer: "Customer",
    sentLabel: "Sent",
    noContact: "Customer not contacted",
    quotePending: "Quotation not moved",
    samplePending: "Sample not confirmed",
    highValue: "High-value customer needs follow-up",
    noteTitle: "Reminder logic",
    note: "Reminding sales creates a real reminder and customer activity for the owner to act.",
    noSales: "Create users with the Sales role in Supabase first"
  },
  id: {
    title: "Ingatkan Sales",
    subtitle: "Kirim reminder internal ke owner sales untuk follow-up customer, quotation, sample, dan high-value action.",
    pending: "Pending",
    sent: "Terkirim",
    salesCount: "Sales",
    overdue: "Overdue",
    queue: "Queue reminder sales",
    customer: "Pelanggan",
    sales: "Owner sales",
    reason: "Alasan",
    overdueTime: "Overdue",
    lastContact: "Kontak terakhir",
    message: "Pesan",
    action: "Aksi",
    notify: "Kirim reminder",
    notifyAll: "Ingatkan semua",
    notifyFailed: "Gagal mengirim reminder",
    sentTo: "Terkirim ke",
    sentBatch: "Terkirim ke {sales} sales, {count} reminder",
    aboutCustomer: "Pelanggan",
    sentLabel: "Terkirim",
    noContact: "Customer belum dikontak",
    quotePending: "Quotation belum lanjut",
    samplePending: "Sample belum konfirmasi",
    highValue: "Customer high-value perlu follow-up",
    noteTitle: "Logika reminder",
    note: "Reminder sales membuat reminder dan aktivitas customer nyata agar owner segera bertindak.",
    noSales: "Buat user dengan role Sales di Supabase terlebih dahulu"
  }
} as const;

const reasonKey: Record<ReminderCase["reason"], keyof typeof copy.zh> = {
  no_contact: "noContact",
  quote_pending: "quotePending",
  sample_pending: "samplePending",
  high_value: "highValue"
};

export function SalesReminderWorkspace({
  locale,
  customers,
  salesUsers
}: {
  locale: Locale;
  customers: CustomerSummary[];
  salesUsers: AppUser[];
}) {
  const page = copy[locale];
  const cases = useMemo(() => buildCases(customers, salesUsers), [customers, salesUsers]);
  const [salesByCustomer, setSalesByCustomer] = useState<Record<string, string>>(
    Object.fromEntries(cases.map((item) => [item.customer.id, item.customer.owner_id ?? item.sales?.id ?? "unassigned"]))
  );
  const [messageByCustomer, setMessageByCustomer] = useState<Record<string, string>>(
    Object.fromEntries(cases.map((item) => [item.customer.id, buildMessage(item, locale)]))
  );
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const sentCount = Object.values(sent).filter(Boolean).length;
  const overdueCount = cases.filter((item) => item.overdueHours >= 24).length;

  async function notify(ids: string[]) {
    const reminders = ids
      .map((customerId) => {
        const item = cases.find((entry) => entry.customer.id === customerId);
        const sales = salesUsers.find((rep) => rep.id === salesByCustomer[customerId]) ?? item?.sales;
        if (!sales) return null;
        return {
          customer_id: customerId,
          customer_name: item?.customer.company_name ?? customerId,
          sales_id: sales.id,
          sales_name: getUserName(sales),
          message: messageByCustomer[customerId] ?? ""
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    if (!reminders.length) {
      toast({ title: page.noSales, variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/sales-reminders/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminders })
      });
      const payload = (await response.json().catch(() => null)) as SalesReminderResponse | null;

      if (!response.ok) {
        toast({ title: page.notifyFailed, description: payload && "error" in payload ? String(payload.error) : undefined, variant: "destructive" });
        return;
      }

      const fallbackRecipients = Array.from(new Set(reminders.map((item) => item.sales_name)));
      const recipients = payload?.data?.recipients?.length ? payload.data.recipients : fallbackRecipients;

      setSent((current) => ({ ...current, ...Object.fromEntries(ids.map((id) => [id, true])) }));
      toast({
        title:
          reminders.length === 1
            ? `${page.sentTo} ${reminders[0].sales_name}`
            : page.sentBatch.replace("{sales}", String(recipients.length)).replace("{count}", String(reminders.length)),
        description:
          reminders.length === 1
            ? `${page.aboutCustomer}: ${reminders[0].customer_name}`
            : recipients.join(", ")
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={BellRing} label={page.pending} value={String(Math.max(cases.length - sentCount, 0))} />
        <Metric icon={CheckCircle2} label={page.sent} value={String(sentCount)} />
        <Metric icon={UserCheck} label={page.salesCount} value={String(salesUsers.length)} />
        <Metric icon={Clock3} label={page.overdue} value={String(overdueCount)} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle>{page.queue}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{page.subtitle}</p>
            </div>
            <Button type="button" onClick={() => notify(cases.map((item) => item.customer.id))} disabled={loading || !cases.length || !salesUsers.length}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {page.notifyAll}
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{page.customer}</TableHead>
                  <TableHead>{page.sales}</TableHead>
                  <TableHead>{page.reason}</TableHead>
                  <TableHead>{page.overdueTime}</TableHead>
                  <TableHead>{page.lastContact}</TableHead>
                  <TableHead className="min-w-64">{page.message}</TableHead>
                  <TableHead>{page.action}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((item) => {
                  const selectedSales = salesUsers.find((rep) => rep.id === salesByCustomer[item.customer.id]) ?? item.sales;

                  return (
                    <TableRow key={item.customer.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.customer.company_name}</p>
                          <p className="text-xs text-muted-foreground">{item.customer.country ?? "-"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={salesByCustomer[item.customer.id] ?? "unassigned"}
                          onValueChange={(value) => setSalesByCustomer((current) => ({ ...current, [item.customer.id]: value }))}
                          disabled={!salesUsers.length}
                        >
                          <SelectTrigger className="w-44">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {salesUsers.map((rep) => (
                              <SelectItem key={rep.id} value={rep.id}>
                                {getUserName(rep)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.reason === "high_value" ? "warning" : "secondary"}>{page[reasonKey[item.reason]]}</Badge>
                      </TableCell>
                      <TableCell>{item.overdueHours}h</TableCell>
                      <TableCell>{formatDate(item.customer.last_contacted_at, "yyyy-MM-dd", locale)}</TableCell>
                      <TableCell>
                        <Textarea
                          className="min-h-20 text-xs"
                          value={messageByCustomer[item.customer.id]}
                          onChange={(event) =>
                            setMessageByCustomer((current) => ({ ...current, [item.customer.id]: event.target.value }))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant={sent[item.customer.id] ? "secondary" : "outline"}
                          size="sm"
                          disabled={loading || sent[item.customer.id] || !selectedSales}
                          onClick={() => notify([item.customer.id])}
                        >
                          {sent[item.customer.id] ? <CheckCircle2 className="size-4" /> : <Send className="size-4" />}
                          {sent[item.customer.id] && selectedSales ? `${page.sentLabel}: ${getUserName(selectedSales)}` : page.notify}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <aside>
          <Card>
            <CardHeader>
              <CardTitle>{page.noteTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">{page.note}</p>
              <div className="mt-4 space-y-2">
                {salesUsers.length ? (
                  salesUsers.map((rep) => (
                    <div key={rep.id} className="rounded-md border p-3">
                      <p className="font-medium">{getUserName(rep)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{rep.email ?? rep.role}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">{page.noSales}</p>
                )}
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

function buildCases(customers: CustomerSummary[], salesUsers: AppUser[]): ReminderCase[] {
  const reasons: ReminderCase["reason"][] = ["no_contact", "quote_pending", "sample_pending", "high_value"];
  return customers
    .filter((customer) => customer.stage !== "won")
    .slice(0, 8)
    .map((customer, index) => ({
      customer,
      sales: salesUsers.find((user) => user.id === customer.owner_id) ?? salesUsers[index % Math.max(salesUsers.length, 1)] ?? null,
      reason: customer.grade === "A" ? "high_value" : reasons[index % reasons.length],
      overdueHours: 8 + index * 6
    }));
}

function buildMessage(item: ReminderCase, locale: Locale) {
  if (locale === "en") {
    return `Please follow up ${item.customer.company_name}. Reason: ${item.reason.replace("_", " ")}. Confirm next action and update CRM today.`;
  }

  if (locale === "id") {
    return `Mohon follow up ${item.customer.company_name}. Alasan: ${item.reason.replace("_", " ")}. Konfirmasi next action dan update CRM hari ini.`;
  }

  return `请今天跟进 ${item.customer.company_name}。原因：${item.reason.replace("_", " ")}。请确认下一步动作并更新 CRM。`;
}

function getUserName(user: AppUser) {
  return user.full_name ?? user.email ?? user.id;
}

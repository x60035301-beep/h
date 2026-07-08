"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ClipboardList, Loader2, MessageCircle, Phone, Plus, UserCheck, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import type { AppUser, CustomerSummary, Locale } from "@/types/crm";

type Priority = "low" | "medium" | "high";
type Channel = "whatsapp" | "phone" | "email" | "meeting";
type TaskStatus = "todo" | "in_progress" | "done";

type FollowupTask = {
  id: string;
  customer_id: string;
  customer_name: string;
  title: string;
  assignee_id: string | null;
  assignee: string;
  priority: Priority;
  channel: Channel;
  due_at: string;
  next_step: string;
  status: TaskStatus;
};

const copy = {
  zh: {
    title: "跟进任务",
    subtitle: "创建并管理销售需要执行的客户跟进行动，不是提醒通知。",
    create: "创建任务",
    createTitle: "创建跟进任务",
    createDescription: "为客户安排明确的跟进动作、负责人、沟通方式和完成时间。",
    taskTitle: "任务标题",
    customer: "客户",
    assignee: "负责人",
    priority: "优先级",
    channel: "沟通方式",
    dueAt: "完成时间",
    nextStep: "下一步动作",
    save: "保存任务",
    saved: "跟进任务已创建",
    openTasks: "待办任务",
    inProgress: "进行中",
    completed: "已完成",
    highPriority: "高优先级",
    allTasks: "任务列表",
    empty: "暂无跟进任务",
    todo: "待办",
    done: "完成",
    low: "低",
    medium: "中",
    high: "高",
    whatsapp: "WhatsApp",
    phone: "电话",
    email: "邮件",
    meeting: "面谈",
    noAssignees: "请先创建 Sales 或 Manager 用户"
  },
  en: {
    title: "Follow-up Tasks",
    subtitle: "Create and manage sales actions for customer follow-up. This is not a reminder notification.",
    create: "Create task",
    createTitle: "Create follow-up task",
    createDescription: "Assign a concrete customer follow-up action, owner, channel, and due time.",
    taskTitle: "Task title",
    customer: "Customer",
    assignee: "Owner",
    priority: "Priority",
    channel: "Channel",
    dueAt: "Due time",
    nextStep: "Next action",
    save: "Save task",
    saved: "Follow-up task created",
    openTasks: "Open tasks",
    inProgress: "In progress",
    completed: "Completed",
    highPriority: "High priority",
    allTasks: "Task list",
    empty: "No follow-up tasks",
    todo: "To do",
    done: "Done",
    low: "Low",
    medium: "Medium",
    high: "High",
    whatsapp: "WhatsApp",
    phone: "Phone",
    email: "Email",
    meeting: "Meeting",
    noAssignees: "Create Sales or Manager users first"
  },
  id: {
    title: "Task Follow-up",
    subtitle: "Buat dan kelola aksi sales untuk follow-up pelanggan. Ini bukan notifikasi reminder.",
    create: "Buat task",
    createTitle: "Buat task follow-up",
    createDescription: "Assign aksi follow-up pelanggan, owner, channel, dan due time yang jelas.",
    taskTitle: "Judul task",
    customer: "Pelanggan",
    assignee: "Owner",
    priority: "Prioritas",
    channel: "Channel",
    dueAt: "Due time",
    nextStep: "Aksi berikutnya",
    save: "Simpan task",
    saved: "Task follow-up dibuat",
    openTasks: "Task open",
    inProgress: "Berjalan",
    completed: "Selesai",
    highPriority: "Prioritas tinggi",
    allTasks: "Daftar task",
    empty: "Belum ada task follow-up",
    todo: "To do",
    done: "Selesai",
    low: "Low",
    medium: "Medium",
    high: "High",
    whatsapp: "WhatsApp",
    phone: "Telepon",
    email: "Email",
    meeting: "Meeting",
    noAssignees: "Buat user Sales atau Manager terlebih dahulu"
  }
} as const;

export function FollowupTaskWorkspace({
  locale,
  customers,
  assignees
}: {
  locale: Locale;
  customers: CustomerSummary[];
  assignees: AppUser[];
}) {
  const page = copy[locale];
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<FollowupTask[]>([]);
  const firstCustomer = customers[0];
  const firstAssignee = assignees[0];
  const [form, setForm] = useState({
    customer_id: firstCustomer?.id ?? "",
    title: firstCustomer ? `${page.whatsapp} ${firstCustomer.company_name}` : "",
    assignee_id: firstAssignee?.id ?? "",
    priority: "medium" as Priority,
    channel: "whatsapp" as Channel,
    due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    next_step:
      locale === "zh"
        ? "确认客户需求、预算和下一步报价时间"
        : locale === "id"
          ? "Konfirmasi kebutuhan, budget, dan jadwal penawaran"
          : "Confirm needs, budget, and quotation timeline"
  });

  const stats = useMemo(
    () => ({
      open: tasks.filter((task) => task.status === "todo").length,
      progress: tasks.filter((task) => task.status === "in_progress").length,
      done: tasks.filter((task) => task.status === "done").length,
      high: tasks.filter((task) => task.priority === "high").length
    }),
    [tasks]
  );

  useEffect(() => {
    if (searchParams.get("create") !== "1") return;
    setOpen(true);
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("create");
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  function updateForm<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function saveTask() {
    const customer = customers.find((item) => item.id === form.customer_id);
    const assignee = assignees.find((item) => item.id === form.assignee_id);
    if (!customer || !assignee) {
      toast({ title: page.noAssignees, variant: "destructive" });
      return;
    }

    setLoading(true);
    const response = await fetch("/api/followup-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        assignee: getUserName(assignee),
        customer_name: customer.company_name,
        status: "todo"
      })
    });
    const payload = await response.json().catch(() => null);
    setLoading(false);

    if (!response.ok) {
      toast({ title: "Task save failed", description: payload?.error, variant: "destructive" });
      return;
    }

    setTasks((current) => [payload.data, ...current]);
    setOpen(false);
    toast({ title: page.saved });
  }

  function markDone(id: string) {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, status: "done" } : task)));
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={ClipboardList} label={page.openTasks} value={String(stats.open)} />
        <Metric icon={Phone} label={page.inProgress} value={String(stats.progress)} />
        <Metric icon={CheckCircle2} label={page.completed} value={String(stats.done)} />
        <Metric icon={MessageCircle} label={page.highPriority} value={String(stats.high)} />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>{page.title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{page.subtitle}</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button disabled={!customers.length || !assignees.length}>
                <Plus className="size-4" />
                {page.create}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{page.createTitle}</DialogTitle>
                <DialogDescription>{page.createDescription}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <Field label={page.taskTitle}>
                  <Input value={form.title} onChange={(event) => updateForm("title", event.target.value)} />
                </Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={page.customer}>
                    <Select value={form.customer_id} onValueChange={(value) => updateForm("customer_id", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label={page.assignee}>
                    <Select value={form.assignee_id} onValueChange={(value) => updateForm("assignee_id", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {assignees.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {getUserName(user)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label={page.priority}>
                    <Select value={form.priority} onValueChange={(value) => updateForm("priority", value as Priority)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{page.low}</SelectItem>
                        <SelectItem value="medium">{page.medium}</SelectItem>
                        <SelectItem value="high">{page.high}</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label={page.channel}>
                    <Select value={form.channel} onValueChange={(value) => updateForm("channel", value as Channel)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp">{page.whatsapp}</SelectItem>
                        <SelectItem value="phone">{page.phone}</SelectItem>
                        <SelectItem value="email">{page.email}</SelectItem>
                        <SelectItem value="meeting">{page.meeting}</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field label={page.dueAt}>
                  <Input type="datetime-local" value={form.due_at} onChange={(event) => updateForm("due_at", event.target.value)} />
                </Field>
                <Field label={page.nextStep}>
                  <Textarea className="min-h-24" value={form.next_step} onChange={(event) => updateForm("next_step", event.target.value)} />
                </Field>
                <Button onClick={saveTask} disabled={loading || !form.title || !form.next_step}>
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <ClipboardList className="size-4" />}
                  {page.save}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{page.taskTitle}</TableHead>
                <TableHead>{page.customer}</TableHead>
                <TableHead>{page.assignee}</TableHead>
                <TableHead>{page.priority}</TableHead>
                <TableHead>{page.channel}</TableHead>
                <TableHead>{page.dueAt}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length ? (
                tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.next_step}</p>
                      </div>
                    </TableCell>
                    <TableCell>{task.customer_name}</TableCell>
                    <TableCell>{task.assignee}</TableCell>
                    <TableCell>
                      <Badge variant={task.priority === "high" ? "warning" : "secondary"}>{page[task.priority]}</Badge>
                    </TableCell>
                    <TableCell>{page[task.channel]}</TableCell>
                    <TableCell>{formatDate(task.due_at, "yyyy-MM-dd HH:mm", locale)}</TableCell>
                    <TableCell>
                      <Badge variant={task.status === "done" ? "success" : "outline"}>{task.status === "done" ? page.done : task.status === "todo" ? page.todo : page.inProgress}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => markDone(task.id)} disabled={task.status === "done"}>
                        <CheckCircle2 className="size-4" />
                        {page.done}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    {assignees.length ? page.empty : page.noAssignees}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function getUserName(user: AppUser) {
  return user.full_name ?? user.email ?? user.id;
}

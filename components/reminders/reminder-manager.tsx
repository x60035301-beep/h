"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bell, CheckCircle2, Loader2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { reminderTypes } from "@/config/crm";
import { toast } from "@/hooks/use-toast";
import { getDictionary } from "@/lib/dictionaries";
import { formatDate } from "@/lib/utils";
import { reminderSchema, type ReminderInput } from "@/lib/validations";
import type { CustomerSummary, Locale, Reminder } from "@/types/crm";

export function ReminderManager({
  locale,
  reminders,
  customers
}: {
  locale: Locale;
  reminders: Reminder[];
  customers: CustomerSummary[];
}) {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dictionary = getDictionary(locale);
  const copy = dictionary.reminders;
  const typeParam = searchParams.get("type");
  const initialType = reminderTypes.some((type) => type.value === typeParam) ? (typeParam as ReminderInput["type"]) : "followup";

  useEffect(() => {
    if (searchParams.get("create") !== "1") return;
    setOpen(true);
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("create");
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  async function markDone(id: string) {
    const response = await fetch(`/api/reminders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_done: true })
    });
    if (!response.ok) {
      toast({ title: copy.updateFailed, variant: "destructive" });
      return;
    }
    toast({ title: copy.markDoneSuccess });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus />
              {copy.create}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{copy.createTitle}</DialogTitle>
              <DialogDescription>{copy.createDescription}</DialogDescription>
            </DialogHeader>
            <ReminderForm locale={locale} customers={customers} initialType={initialType} onSaved={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {reminders.map((reminder) => (
          <Card key={reminder.id}>
            <CardContent className="flex items-start justify-between gap-4 p-4">
              <div className="flex min-w-0 gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
                  <Bell className="size-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{reminder.title}</p>
                    <Badge variant={reminder.is_done ? "success" : "secondary"}>{dictionary.reminderTypes[reminder.type]}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{formatDate(reminder.due_at, "yyyy-MM-dd HH:mm", locale)}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => markDone(reminder.id)} disabled={reminder.is_done}>
                <CheckCircle2 />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ReminderForm({
  locale,
  customers,
  initialType,
  onSaved
}: {
  locale: Locale;
  customers: CustomerSummary[];
  initialType?: ReminderInput["type"];
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const dictionary = getDictionary(locale);
  const copy = dictionary.reminders;
  const form = useForm<ReminderInput>({
    resolver: zodResolver(reminderSchema) as any,
    defaultValues: {
      customer_id: customers[0]?.id ?? null,
      title: "",
      type: initialType ?? "followup",
      due_at: new Date().toISOString().slice(0, 16),
      is_done: false
    }
  });

  async function onSubmit(values: ReminderInput) {
    setLoading(true);
    const response = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    setLoading(false);
    if (!response.ok) {
      toast({ title: copy.createFailed, variant: "destructive" });
      return;
    }
    toast({ title: copy.createSuccess });
    onSaved?.();
    router.refresh();
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-2">
        <Label>{copy.title}</Label>
        <Input {...form.register("title")} />
      </div>
      <div className="grid gap-2">
        <Label>{copy.customer}</Label>
        <Select value={form.watch("customer_id") ?? ""} onValueChange={(value) => form.setValue("customer_id", value)}>
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
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>{copy.type}</Label>
          <Select value={form.watch("type")} onValueChange={(value) => form.setValue("type", value as ReminderInput["type"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {reminderTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {dictionary.reminderTypes[type.value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>{copy.dueAt}</Label>
          <Input type="datetime-local" {...form.register("due_at")} />
        </div>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : null}
        {copy.save}
      </Button>
    </form>
  );
}

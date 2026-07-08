"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { companyTypes, customerGrades, customerSources, customerStages } from "@/config/crm";
import { toast } from "@/hooks/use-toast";
import { customerSchema, type CustomerInput } from "@/lib/validations";
import type { CustomerSummary } from "@/types/crm";

export function CustomerForm({
  customer,
  onSaved
}: {
  customer?: Partial<CustomerSummary> & { notes?: string | null };
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      company_name: customer?.company_name ?? "",
      contact_name: customer?.contact_name ?? "",
      country: customer?.country ?? "",
      industry: customer?.industry ?? "",
      company_type: customer?.company_type ?? "manufacturer",
      whatsapp: customer?.whatsapp ?? "",
      email: customer?.email ?? "",
      source: customer?.source ?? "Manual",
      grade: customer?.grade ?? "B",
      stage: customer?.stage ?? "new_inquiry",
      notes: customer?.notes ?? ""
    }
  });

  async function onSubmit(values: CustomerInput) {
    setLoading(true);
    const endpoint = customer?.id ? `/api/customers/${customer.id}` : "/api/customers";
    const response = await fetch(endpoint, {
      method: customer?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    setLoading(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      toast({ title: "保存失败", description: payload?.error ?? "Please try again.", variant: "destructive" });
      return;
    }

    toast({ title: customer?.id ? "客户已更新" : "客户已新增" });
    onSaved?.();
    router.refresh();
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="公司名称" error={form.formState.errors.company_name?.message}>
          <Input {...form.register("company_name")} placeholder="PT Comfort Living" />
        </Field>
        <Field label="联系人">
          <Input {...form.register("contact_name")} placeholder="Budi Santoso" />
        </Field>
        <Field label="国家">
          <Input {...form.register("country")} placeholder="Indonesia" />
        </Field>
        <Field label="行业">
          <Input {...form.register("industry")} placeholder="Furniture" />
        </Field>
        <Field label="公司类型">
          <Select value={form.watch("company_type") ?? undefined} onValueChange={(value) => form.setValue("company_type", value as CustomerInput["company_type"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {companyTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="来源">
          <Select value={form.watch("source") ?? undefined} onValueChange={(value) => form.setValue("source", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {customerSources.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="WhatsApp">
          <Input {...form.register("whatsapp")} placeholder="+62 ..." />
        </Field>
        <Field label="邮箱" error={form.formState.errors.email?.message}>
          <Input {...form.register("email")} type="email" placeholder="customer@example.com" />
        </Field>
        <Field label="客户等级">
          <Select value={form.watch("grade")} onValueChange={(value) => form.setValue("grade", value as CustomerInput["grade"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {customerGrades.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="当前阶段">
          <Select value={form.watch("stage")} onValueChange={(value) => form.setValue("stage", value as CustomerInput["stage"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {customerStages.map((stage) => (
                <SelectItem key={stage.value} value={stage.value}>
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field label="备注">
        <Textarea {...form.register("notes")} placeholder="采购偏好、价格区间、装柜要求等" />
      </Field>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : null}
          保存客户
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

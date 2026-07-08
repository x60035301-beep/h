"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { settingsSchema, type SettingsInput } from "@/lib/validations";
import type { CompanySettings } from "@/types/crm";

export function SettingsForm({ settings }: { settings: CompanySettings }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      logo_url: settings.logo_url ?? "",
      company_name: settings.company_name,
      phone: settings.phone ?? "",
      email: settings.email ?? "",
      address: settings.address ?? ""
    }
  });

  async function onSubmit(values: SettingsInput) {
    setLoading(true);
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    setLoading(false);
    if (!response.ok) {
      toast({ title: "设置保存失败", variant: "destructive" });
      return;
    }
    toast({ title: "公司信息已更新" });
    router.refresh();
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>公司信息</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Logo URL">
              <Input {...form.register("logo_url")} />
            </Field>
            <Field label="公司名称">
              <Input {...form.register("company_name")} />
            </Field>
            <Field label="联系电话">
              <Input {...form.register("phone")} />
            </Field>
            <Field label="邮箱">
              <Input {...form.register("email")} />
            </Field>
          </div>
          <Field label="地址">
            <Textarea {...form.register("address")} />
          </Field>
          <Button type="submit" className="w-fit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : null}
            保存设置
          </Button>
        </form>
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { communicationMethods } from "@/config/crm";
import { toast } from "@/hooks/use-toast";
import { followupSchema, type FollowupInput } from "@/lib/validations";

export function FollowupForm({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<FollowupInput>({
    resolver: zodResolver(followupSchema),
    defaultValues: {
      customer_id: customerId,
      method: "whatsapp",
      followed_at: new Date().toISOString().slice(0, 16),
      content: "",
      next_step: ""
    }
  });

  async function onSubmit(values: FollowupInput) {
    setLoading(true);
    const response = await fetch(`/api/customers/${customerId}/followups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    setLoading(false);
    if (!response.ok) {
      toast({ title: "跟进保存失败", variant: "destructive" });
      return;
    }
    toast({ title: "跟进记录已保存" });
    form.reset({ ...form.getValues(), content: "", next_step: "" });
    router.refresh();
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>沟通方式</Label>
          <Select value={form.watch("method")} onValueChange={(value) => form.setValue("method", value as FollowupInput["method"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {communicationMethods.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>跟进时间</Label>
          <Input type="datetime-local" {...form.register("followed_at")} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>跟进内容</Label>
        <Textarea {...form.register("content")} placeholder="记录客户需求、异议、报价反馈..." />
      </div>
      <div className="grid gap-2">
        <Label>下一步计划</Label>
        <Textarea {...form.register("next_step")} placeholder="下一次联系、样品安排、报价调整..." />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : null}
        添加跟进
      </Button>
    </form>
  );
}

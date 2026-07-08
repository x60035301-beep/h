"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { CustomerSummary, Locale, Quotation } from "@/types/crm";

const copy = {
  zh: {
    trigger: "创建订单",
    title: "从报价创建订单",
    description: "选择一张真实报价，系统会生成订单生命周期，并同步客户为已成交。",
    quotation: "报价单",
    placeholder: "选择报价单",
    customer: "客户",
    amount: "金额",
    validUntil: "有效期",
    status: "报价状态",
    noQuotations: "暂无可创建订单的报价。请先创建报价单。",
    submit: "确认创建订单",
    failed: "订单创建失败",
    success: "订单已创建"
  },
  en: {
    trigger: "Create order",
    title: "Create order from quotation",
    description: "Select a real quotation to create an order lifecycle and mark the customer as won.",
    quotation: "Quotation",
    placeholder: "Select quotation",
    customer: "Customer",
    amount: "Amount",
    validUntil: "Valid until",
    status: "Quotation status",
    noQuotations: "No quotations available. Create a quotation first.",
    submit: "Create order",
    failed: "Order create failed",
    success: "Order created"
  },
  id: {
    trigger: "Buat order",
    title: "Buat order dari quotation",
    description: "Pilih quotation nyata untuk membuat siklus order dan tandai customer sebagai menang.",
    quotation: "Quotation",
    placeholder: "Pilih quotation",
    customer: "Pelanggan",
    amount: "Amount",
    validUntil: "Valid sampai",
    status: "Status quotation",
    noQuotations: "Belum ada quotation yang bisa dibuat order. Buat quotation dulu.",
    submit: "Buat order",
    failed: "Gagal membuat order",
    success: "Order dibuat"
  }
} as const;

export function OrderCreateDialog({
  locale,
  quotations,
  customers
}: {
  locale: Locale;
  quotations: Quotation[];
  customers: CustomerSummary[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(quotations[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const text = copy[locale];
  const customerMap = useMemo(() => new Map(customers.map((customer) => [customer.id, customer])), [customers]);
  const selectedQuotation = quotations.find((quotation) => quotation.id === selectedId);
  const selectedCustomer = selectedQuotation ? customerMap.get(selectedQuotation.customer_id) : null;

  async function createOrder() {
    if (!selectedId) return;
    setLoading(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quotation_id: selectedId })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error ?? text.failed);

      toast({ title: text.success, description: payload.data.order_id });
      setOpen(false);
      router.refresh();
      router.push(`/${locale}/orders/${encodeURIComponent(payload.data.order_id)}`);
    } catch (error) {
      toast({ title: text.failed, description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          {text.trigger}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{text.title}</DialogTitle>
          <DialogDescription>{text.description}</DialogDescription>
        </DialogHeader>

        {quotations.length ? (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>{text.quotation}</Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger>
                  <SelectValue placeholder={text.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {quotations.map((quotation) => {
                    const customer = customerMap.get(quotation.customer_id);
                    return (
                      <SelectItem key={quotation.id} value={quotation.id}>
                        {quotation.quotation_no} · {customer?.company_name ?? quotation.customer_id} ·{" "}
                        {formatCurrency(Number(quotation.total_amount ?? 0), quotation.currency)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {selectedQuotation ? (
              <div className="grid gap-3 rounded-lg border bg-muted/20 p-4 sm:grid-cols-2">
                <PreviewItem label={text.customer} value={selectedCustomer?.company_name ?? selectedQuotation.customer_id} />
                <PreviewItem label={text.amount} value={formatCurrency(Number(selectedQuotation.total_amount ?? 0), selectedQuotation.currency)} />
                <PreviewItem label={text.validUntil} value={formatDate(selectedQuotation.valid_until, "yyyy-MM-dd", locale)} />
                <PreviewItem label={text.status} value={selectedQuotation.status} />
              </div>
            ) : null}

            <Button type="button" onClick={createOrder} disabled={loading || !selectedId}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              {text.submit}
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">{text.noQuotations}</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PreviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-medium">{value}</p>
    </div>
  );
}

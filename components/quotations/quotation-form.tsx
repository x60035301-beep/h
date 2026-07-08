"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";

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
import { toast } from "@/hooks/use-toast";
import { currencies } from "@/lib/currencies";
import { formatCurrency } from "@/lib/utils";
import { quotationSchema, type QuotationInput } from "@/lib/validations";
import type { CustomerSummary, Locale, Product } from "@/types/crm";

type QuotationAdvice = {
  materialCostRatio: number;
  laborCostRatio: number;
  packingCostRatio: number;
  freightCostRatio: number;
  suggestedMargin: number;
  minimumPriceNote: string;
  suggestedPriceNote: string;
  riskNotes: string[];
  customerMessage: string;
};

const aiCopy = {
  zh: { button: "AI 报价建议", loading: "AI 分析中", title: "AI 报价建议", failed: "AI 报价建议失败", cost: "成本结构", margin: "建议利润", risk: "风险提醒", message: "客户回复建议" },
  en: { button: "AI quote advice", loading: "Analyzing", title: "AI quote advice", failed: "AI quote advice failed", cost: "Cost structure", margin: "Suggested margin", risk: "Risks", message: "Customer reply" },
  id: { button: "Saran AI", loading: "Menganalisis", title: "Saran penawaran AI", failed: "Saran AI gagal", cost: "Struktur biaya", margin: "Margin disarankan", risk: "Risiko", message: "Balasan customer" }
} as const;

export function QuotationForm({
  locale,
  customers,
  products,
  onSaved
}: {
  locale: Locale;
  customers: CustomerSummary[];
  products: Product[];
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [advice, setAdvice] = useState<QuotationAdvice | null>(null);
  const aiText = aiCopy[locale];
  const form = useForm<QuotationInput>({
    resolver: zodResolver(quotationSchema) as any,
    defaultValues: {
      customer_id: customers[0]?.id ?? "",
      status: "draft",
      currency: "USD",
      notes: "",
      valid_until: "",
      items: [{ product_id: products[0]?.id ?? null, product_name: products[0]?.name ?? "", quantity: 1, unit_price: products[0]?.price ?? 0, notes: "" }]
    }
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });
  const items = form.watch("items");
  const currency = form.watch("currency");
  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_price || 0), 0), [items]);

  async function onSubmit(values: QuotationInput) {
    setLoading(true);
    const response = await fetch("/api/quotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    setLoading(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      toast({ title: "报价创建失败", description: payload?.error ?? "Please try again.", variant: "destructive" });
      return;
    }

    toast({ title: "报价单已创建" });
    onSaved?.();
    router.refresh();
  }

  function selectProduct(index: number, productId: string) {
    const product = products.find((item) => item.id === productId);
    form.setValue(`items.${index}.product_id`, productId);
    if (product) {
      form.setValue(`items.${index}.product_name`, product.name);
      form.setValue(`items.${index}.unit_price`, product.price);
    }
  }

  async function requestAiAdvice() {
    const values = form.getValues();
    const customer = customers.find((item) => item.id === values.customer_id);
    setAiLoading(true);

    try {
      const response = await fetch("/api/ai/quotation-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          quotation: {
            customer,
            currency: values.currency,
            total,
            items: values.items
          }
        })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error ?? aiText.failed);
      setAdvice(payload.data.advice);
    } catch (error) {
      toast({ title: aiText.failed, description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2 sm:col-span-2">
          <Label>客户</Label>
          <Select value={form.watch("customer_id")} onValueChange={(value) => form.setValue("customer_id", value)}>
            <SelectTrigger>
              <SelectValue placeholder="选择客户" />
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
        <div className="grid gap-2">
          <Label>币种</Label>
          <Select value={currency} onValueChange={(value) => form.setValue("currency", value as QuotationInput["currency"])}>
            <SelectTrigger>
              <SelectValue placeholder="选择币种" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((item) => (
                <SelectItem key={item.code} value={item.code}>
                  <span className="flex items-center gap-2">
                    <span className="w-10 font-medium">{item.code}</span>
                    <span className="text-muted-foreground">{item.symbol}</span>
                    <span>{item.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>产品明细</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ product_id: null, product_name: "", quantity: 1, unit_price: 0, notes: "" })}
          >
            <Plus />
            Add item
          </Button>
        </div>
        {fields.map((field, index) => {
          const amount = Number(items[index]?.quantity || 0) * Number(items[index]?.unit_price || 0);
          return (
            <div key={field.id} className="grid gap-3 rounded-lg border p-3 lg:grid-cols-[1.3fr_1fr_120px_120px_120px_40px]">
              <Select value={items[index]?.product_id ?? ""} onValueChange={(value) => selectProduct(index, value)}>
                <SelectTrigger>
                  <SelectValue placeholder="产品" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input {...form.register(`items.${index}.product_name`)} placeholder="Product name" />
              <Input type="number" step="0.01" {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} placeholder="Qty" />
              <Input type="number" step="0.01" {...form.register(`items.${index}.unit_price`, { valueAsNumber: true })} placeholder="Unit price" />
              <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm font-medium">{formatCurrency(amount, currency)}</div>
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
                <Trash2 />
              </Button>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>有效期</Label>
          <Input type="date" {...form.register("valid_until")} />
        </div>
        <div className="grid gap-2">
          <Label>备注</Label>
          <Textarea className="min-h-9" {...form.register("notes")} placeholder="FOB, MOQ, lead time..." />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-muted p-3">
        <span className="text-sm text-muted-foreground">自动计算金额</span>
        <span className="text-lg font-semibold">{formatCurrency(total, currency)}</span>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium">{aiText.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{aiText.cost} / {aiText.margin} / {aiText.risk}</p>
          </div>
          <Button type="button" variant="outline" onClick={requestAiAdvice} disabled={aiLoading || !items.length}>
            {aiLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {aiLoading ? aiText.loading : aiText.button}
          </Button>
        </div>
        {advice ? (
          <div className="mt-4 grid gap-3">
            <div className="grid gap-2 sm:grid-cols-5">
              <AdviceMetric label="Material" value={`${advice.materialCostRatio}%`} />
              <AdviceMetric label="Labor" value={`${advice.laborCostRatio}%`} />
              <AdviceMetric label="Packing" value={`${advice.packingCostRatio}%`} />
              <AdviceMetric label="Freight" value={`${advice.freightCostRatio}%`} />
              <AdviceMetric label={aiText.margin} value={`${advice.suggestedMargin}%`} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <p className="rounded-md bg-muted p-3 text-sm">{advice.suggestedPriceNote}</p>
              <p className="rounded-md bg-muted p-3 text-sm">{advice.minimumPriceNote}</p>
            </div>
            <div className="rounded-md border p-3 text-sm">
              <p className="mb-2 font-medium">{aiText.risk}</p>
              <ul className="list-disc space-y-1 pl-5">
                {advice.riskNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border p-3 text-sm">
              <p className="mb-2 font-medium">{aiText.message}</p>
              <p className="leading-6">{advice.customerMessage}</p>
            </div>
          </div>
        ) : null}
      </div>

      <Button type="submit" disabled={loading || !customers.length}>
        {loading ? <Loader2 className="animate-spin" /> : null}
        创建报价
      </Button>
    </form>
  );
}

function AdviceMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

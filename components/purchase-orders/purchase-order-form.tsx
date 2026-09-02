"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { quotationStatuses } from "@/config/crm";
import { toast } from "@/hooks/use-toast";
import { currencies, getCurrencyName } from "@/lib/currencies";
import { getDictionary } from "@/lib/dictionaries";
import { parsePurchaseOrderNotes } from "@/lib/purchase-order-meta";
import { getPurchaseOrderDensityPrice } from "@/lib/purchase-order-pricing";
import { parseQuotationItemNotes } from "@/lib/quotation-item-meta";
import { calculateFoamLineAmount } from "@/lib/quotation-pricing";
import { formatCurrency } from "@/lib/utils";
import { purchaseOrderSchema, type PurchaseOrderInput } from "@/lib/validations";
import type { CustomerSummary, Locale, PurchaseOrder, PurchaseOrderItem } from "@/types/crm";

const copy = {
  zh: {
    supplier: "供应商", selectSupplier: "选择供应商", status: "状态", currency: "币种", details: "采购明细", add: "新增明细",
    item: "明细", product: "品名", density: "密度", size: "尺寸", qty: "数量", unitPrice: "单价 / m3", volume: "总体积",
    piecePrice: "单片价格", amount: "金额", note: "备注", deliveryDate: "交货日期", address: "收货地址", payment: "付款方式",
    orderNote: "采购单备注", total: "自动核算总额", create: "创建采购单", save: "保存采购单", creating: "正在生成采购单...",
    created: "采购单已创建", updated: "采购单已更新", failed: "采购单保存失败", pdfReady: "采购单 PDF 已自动生成",
    waiting: "填写尺寸、数量和单价后自动核算金额"
  },
  en: {
    supplier: "Supplier", selectSupplier: "Select supplier", status: "Status", currency: "Currency", details: "Purchase items", add: "Add item",
    item: "Item", product: "Product name", density: "Density", size: "Size", qty: "Qty", unitPrice: "Unit price / m3", volume: "Total volume",
    piecePrice: "Piece price", amount: "Amount", note: "Note", deliveryDate: "Delivery date", address: "Delivery address", payment: "Payment terms",
    orderNote: "Purchase order note", total: "Auto calculated total", create: "Create purchase order", save: "Save purchase order", creating: "Generating purchase order...",
    created: "Purchase order created", updated: "Purchase order updated", failed: "Failed to save purchase order", pdfReady: "Purchase order PDF generated",
    waiting: "Enter size, quantity, and unit price to calculate the amount"
  },
  id: {
    supplier: "Pemasok", selectSupplier: "Pilih pemasok", status: "Status", currency: "Mata uang", details: "Detail pembelian", add: "Tambah item",
    item: "Item", product: "Nama barang", density: "Density", size: "Ukuran", qty: "Qty", unitPrice: "Harga satuan / m3", volume: "Total volume",
    piecePrice: "Harga per pcs", amount: "Jumlah", note: "Keterangan", deliveryDate: "Tanggal kirim", address: "Alamat pengiriman", payment: "Cara pembayaran",
    orderNote: "Catatan purchase order", total: "Total otomatis", create: "Buat purchase order", save: "Simpan purchase order", creating: "Membuat purchase order...",
    created: "Purchase order dibuat", updated: "Purchase order diupdate", failed: "Gagal menyimpan purchase order", pdfReady: "PDF purchase order dibuat otomatis",
    waiting: "Isi ukuran, qty, dan harga satuan untuk menghitung jumlah"
  }
} as const;

const emptyItems: PurchaseOrderItem[] = [];

export function PurchaseOrderForm({
  locale,
  customers,
  mode = "create",
  order,
  items: initialItems = emptyItems,
  onSaved
}: {
  locale: Locale;
  customers: CustomerSummary[];
  mode?: "create" | "edit";
  order?: PurchaseOrder;
  items?: PurchaseOrderItem[];
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const text = copy[locale];
  const dictionary = getDictionary(locale);
  const isEdit = mode === "edit" && Boolean(order);
  const defaults = useMemo<PurchaseOrderInput>(() => {
    const meta = parsePurchaseOrderNotes(order?.notes);
    return {
      customer_id: order?.customer_id ?? customers[0]?.id ?? "",
      status: order?.status ?? "draft",
      currency: (order?.currency ?? "IDR") as PurchaseOrderInput["currency"],
      notes: meta.note ?? "",
      valid_until: order?.valid_until ?? "",
      delivery_address: meta.deliveryAddress ?? "",
      payment_terms: meta.paymentTerms ?? "",
      items: initialItems.length
        ? initialItems.map((item) => {
            const itemMeta = parseQuotationItemNotes(item.notes);
            return {
              product_id: item.product_id,
              product_name: item.product_name,
              density: itemMeta.density ?? "",
              specification: itemMeta.specification ?? "",
              size: itemMeta.size ?? "",
              quantity: item.quantity,
              unit_price: item.unit_price,
              notes: itemMeta.note ?? ""
            };
          })
        : [{ product_id: null, product_name: "", density: "", specification: "", size: "", quantity: 1, unit_price: 0, notes: "" }]
    };
  }, [customers, initialItems, order]);
  const form = useForm<PurchaseOrderInput>({ resolver: zodResolver(purchaseOrderSchema) as any, defaultValues: defaults });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });
  const watchedItems = form.watch("items");
  const currency = form.watch("currency");
  const total = watchedItems.reduce((sum, item) => sum + (calculate(item)?.amount ?? 0), 0);
  const densityValues = watchedItems.map((item) => item.density ?? "").join("|");

  useEffect(() => form.reset(defaults), [defaults, form]);

  useEffect(() => {
    watchedItems.forEach((item, index) => {
      const price = getPurchaseOrderDensityPrice(item.density);
      if (price === null) return;

      const currentPrice = Number(form.getValues(`items.${index}.unit_price`) || 0);
      if (currentPrice !== price) {
        form.setValue(`items.${index}.unit_price`, price, { shouldDirty: isEdit, shouldValidate: true });
      }
    });
  }, [densityValues, form, isEdit, watchedItems]);

  async function submit(values: PurchaseOrderInput) {
    let documentWindow: Window | null = null;
    if (!isEdit) {
      documentWindow = window.open("about:blank", "_blank");
      if (documentWindow) documentWindow.document.body.innerHTML = `<p style="font-family:system-ui;padding:24px">${text.creating}</p>`;
    }
    setLoading(true);
    try {
      const response = await fetch(isEdit ? `/api/purchase-orders/${order?.id}` : "/api/purchase-orders", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error ?? text.failed);

      if (!isEdit) {
        const documentUrl = payload?.data?.document_url;
        if (documentWindow && documentUrl) documentWindow.location.href = new URL(documentUrl, window.location.origin).toString();
        else documentWindow?.close();
      }
      toast({ title: isEdit ? text.updated : text.created, description: isEdit ? undefined : text.pdfReady });
      onSaved?.();
      router.refresh();
    } catch (error) {
      documentWindow?.close();
      toast({ title: text.failed, description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={form.handleSubmit(submit)}>
      <div className="grid gap-4 sm:grid-cols-4">
        <Field label={text.supplier} className="sm:col-span-2">
          <Select value={form.watch("customer_id")} onValueChange={(value) => form.setValue("customer_id", value)}>
            <SelectTrigger><SelectValue placeholder={text.selectSupplier} /></SelectTrigger>
            <SelectContent>{customers.map((customer) => <SelectItem key={customer.id} value={customer.id}>{customer.company_name}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label={text.status}>
          <Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value as PurchaseOrderInput["status"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{quotationStatuses.map((status) => <SelectItem key={status.value} value={status.value}>{dictionary.quotationStatuses[status.value]}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label={text.currency}>
          <Select value={currency} onValueChange={(value) => form.setValue("currency", value as PurchaseOrderInput["currency"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{currencies.map((item) => <SelectItem key={item.code} value={item.code}>{item.code} · {getCurrencyName(item.code, locale)}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between"><Label>{text.details}</Label><Button type="button" size="sm" variant="outline" onClick={() => append({ product_id: null, product_name: "", density: "", specification: "", size: "", quantity: 1, unit_price: 0, notes: "" })}><Plus />{text.add}</Button></div>
        <datalist id="po-density-options">{["10D", "12D", "14D", "16D", "18D", "20D", "22D", "24D", "26D", "30D", "32D", "45D"].map((value) => <option key={value} value={value} />)}</datalist>
        <datalist id="po-size-options">{["120 x 180 x 1.5", "200 x 100 x 10", "200 x 160 x 5"].map((value) => <option key={value} value={value} />)}</datalist>
        {fields.map((field, index) => {
          const calculation = calculate(watchedItems[index]);
          return (
            <div key={field.id} className="grid gap-4 rounded-md border p-4 lg:grid-cols-12">
              <div className="flex items-center justify-between border-b pb-3 lg:col-span-12"><span className="font-medium">{text.item} #{index + 1}</span><Button type="button" size="icon" variant="ghost" disabled={fields.length === 1} onClick={() => remove(index)}><Trash2 /></Button></div>
              <Field label={text.product} className="lg:col-span-12"><Input {...form.register(`items.${index}.product_name`)} /></Field>
              <div className="grid gap-3 rounded-md border border-primary/20 bg-primary/5 p-3 md:grid-cols-2 lg:col-span-12">
                <Field label={text.density}><Input list="po-density-options" placeholder="20D" {...form.register(`items.${index}.density`)} /></Field>
                <Field label={text.size}><Input list="po-size-options" placeholder="120 x 180 x 1.5" {...form.register(`items.${index}.size`)} /></Field>
              </div>
              <Field label={text.qty} className="lg:col-span-2"><Input type="number" min="0.01" step="0.01" {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} /></Field>
              <Field label={text.unitPrice} className="lg:col-span-2"><Input type="number" min="0" step="0.01" {...form.register(`items.${index}.unit_price`, { valueAsNumber: true })} /></Field>
              <Readout label={text.volume} value={calculation ? `${calculation.totalVolume.toLocaleString("en-US", { maximumFractionDigits: 4 })} m3` : "-"} />
              <Readout label={text.piecePrice} value={calculation ? formatCurrency(calculation.singlePiecePrice, currency) : "-"} />
              <Readout label={text.amount} value={formatCurrency(calculation?.amount ?? 0, currency)} />
              <Field label={text.note} className="lg:col-span-2"><Input {...form.register(`items.${index}.notes`)} /></Field>
              <p className="rounded-md bg-primary/5 px-3 py-2 text-xs text-muted-foreground lg:col-span-12">{calculation ? `${formatCurrency(calculation.unitPrice, currency)}/m3 × ${calculation.size.cubicMeters.toFixed(4)}m3 × ${calculation.quantity} = ${formatCurrency(calculation.amount, currency)}` : text.waiting}</p>
            </div>
          );
        })}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={text.deliveryDate}><Input type="date" {...form.register("valid_until")} /></Field>
        <Field label={text.address}><Input {...form.register("delivery_address")} /></Field>
        <Field label={text.payment}><Input {...form.register("payment_terms")} /></Field>
        <Field label={text.orderNote}><Textarea className="min-h-9" {...form.register("notes")} /></Field>
      </div>
      <div className="flex items-center justify-between rounded-md bg-muted p-3"><span className="text-sm text-muted-foreground">{text.total}</span><strong className="text-lg">{formatCurrency(total, currency)}</strong></div>
      <Button type="submit" disabled={loading || !customers.length}>{loading ? <Loader2 className="animate-spin" /> : null}{isEdit ? text.save : text.create}</Button>
    </form>
  );
}

function calculate(item: PurchaseOrderInput["items"][number] | undefined) {
  return calculateFoamLineAmount({ unitPrice: Number(item?.unit_price || 0), size: item?.size, quantity: Number(item?.quantity || 0) });
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return <div className={`grid gap-1 ${className ?? ""}`}><Label className="text-xs text-muted-foreground">{label}</Label>{children}</div>;
}

function Readout({ label, value }: { label: string; value: string }) {
  return <Field label={label} className="lg:col-span-2"><div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm font-medium">{value}</div></Field>;
}

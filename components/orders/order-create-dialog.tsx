"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, Loader2, Plus } from "lucide-react";

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { parseQuotationItemNotes } from "@/lib/quotation-item-meta";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { CustomerSummary, Locale, Quotation, QuotationItem } from "@/types/crm";

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
    details: "报价单明细",
    detailsDescription: "创建订单前请核对报价单中的产品、密度、规格、数量和价格。",
    product: "产品",
    density: "密度",
    specification: "规格",
    size: "尺寸",
    quantity: "数量",
    unitPrice: "单价",
    lineAmount: "金额",
    remarks: "备注",
    total: "报价总额",
    openPdf: "查看报价单",
    noItems: "该报价单暂无产品明细。",
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
    details: "Quotation details",
    detailsDescription: "Review products, density, specifications, quantities, and pricing before creating the order.",
    product: "Product",
    density: "Density",
    specification: "Specification",
    size: "Size",
    quantity: "Qty.",
    unitPrice: "Unit price",
    lineAmount: "Amount",
    remarks: "Notes",
    total: "Quotation total",
    openPdf: "Open quotation",
    noItems: "No line items found for this quotation.",
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
    amount: "Jumlah",
    validUntil: "Berlaku sampai",
    status: "Status quotation",
    details: "Detail quotation",
    detailsDescription: "Periksa produk, density, spesifikasi, quantity, dan harga sebelum membuat order.",
    product: "Produk",
    density: "Density",
    specification: "Spesifikasi",
    size: "Ukuran",
    quantity: "Qty.",
    unitPrice: "Harga satuan",
    lineAmount: "Jumlah",
    remarks: "Catatan",
    total: "Total quotation",
    openPdf: "Buka quotation",
    noItems: "Belum ada item untuk quotation ini.",
    noQuotations: "Belum ada quotation yang bisa dibuat order. Buat quotation dulu.",
    submit: "Buat order",
    failed: "Gagal membuat order",
    success: "Order dibuat"
  }
} as const;

const statusLabels = {
  zh: {
    draft: "草稿",
    sent: "已发送",
    accepted: "已接受",
    rejected: "已拒绝",
    expired: "已过期"
  },
  en: {
    draft: "Draft",
    sent: "Sent",
    accepted: "Accepted",
    rejected: "Rejected",
    expired: "Expired"
  },
  id: {
    draft: "Draft",
    sent: "Terkirim",
    accepted: "Diterima",
    rejected: "Ditolak",
    expired: "Kedaluwarsa"
  }
} as const;

export function OrderCreateDialog({
  locale,
  quotations,
  quotationItems,
  customers
}: {
  locale: Locale;
  quotations: Quotation[];
  quotationItems: QuotationItem[];
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
  const selectedItems = useMemo(
    () => quotationItems.filter((item) => item.quotation_id === selectedId),
    [quotationItems, selectedId]
  );

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
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{text.title}</DialogTitle>
          <DialogDescription>{text.description}</DialogDescription>
        </DialogHeader>

        {quotations.length ? (
          <div className="grid gap-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="grid min-w-0 flex-1 gap-2">
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
                <Button asChild type="button" variant="outline">
                  <Link href={`/api/quotations/${selectedQuotation.id}/pdf`} target="_blank" rel="noreferrer">
                    <FileText className="size-4" />
                    {text.openPdf}
                  </Link>
                </Button>
              ) : null}
            </div>

            {selectedQuotation ? (
              <div className="grid gap-3 rounded-lg border bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-4">
                <PreviewItem label={text.customer} value={selectedCustomer?.company_name ?? selectedQuotation.customer_id} />
                <PreviewItem label={text.amount} value={formatCurrency(Number(selectedQuotation.total_amount ?? 0), selectedQuotation.currency)} />
                <PreviewItem label={text.validUntil} value={formatDate(selectedQuotation.valid_until, "yyyy-MM-dd", locale)} />
                <PreviewItem label={text.status} value={formatStatus(selectedQuotation.status, locale)} />
              </div>
            ) : null}

            {selectedQuotation ? (
              <div className="rounded-lg border">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b p-4">
                  <div>
                    <h3 className="font-semibold">{text.details}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{text.detailsDescription}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground">{text.total}</p>
                    <p className="font-semibold">{formatCurrency(Number(selectedQuotation.total_amount ?? 0), selectedQuotation.currency)}</p>
                  </div>
                </div>
                {selectedItems.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[180px]">{text.product}</TableHead>
                        <TableHead>{text.density}</TableHead>
                        <TableHead className="min-w-[160px]">{text.specification}</TableHead>
                        <TableHead className="min-w-[120px]">{text.size}</TableHead>
                        <TableHead className="text-right">{text.quantity}</TableHead>
                        <TableHead className="text-right">{text.unitPrice}</TableHead>
                        <TableHead className="text-right">{text.lineAmount}</TableHead>
                        <TableHead className="min-w-[160px]">{text.remarks}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedItems.map((item) => {
                        const meta = parseQuotationItemNotes(item.notes);
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.product_name}</TableCell>
                            <TableCell>{displayValue(item.density ?? meta.density)}</TableCell>
                            <TableCell>{displayValue(item.specification ?? meta.specification)}</TableCell>
                            <TableCell>{displayValue(item.size ?? meta.size)}</TableCell>
                            <TableCell className="text-right">{formatQuantity(item.quantity)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(Number(item.unit_price ?? 0), selectedQuotation.currency)}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(Number(item.amount ?? 0), selectedQuotation.currency)}</TableCell>
                            <TableCell className="text-muted-foreground">{displayValue(meta.note)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-6 text-center text-sm text-muted-foreground">{text.noItems}</div>
                )}
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

function displayValue(value: string | null | undefined) {
  return value && value.trim().length > 0 ? value : "-";
}

function formatQuantity(value: number) {
  return Number(value ?? 0).toLocaleString("en-US", {
    maximumFractionDigits: 3
  });
}

function formatStatus(status: string, locale: Locale) {
  return statusLabels[locale][status as keyof (typeof statusLabels)[Locale]] ?? status;
}

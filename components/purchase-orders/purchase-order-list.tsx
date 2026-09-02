"use client";

import { Copy, Download, FileText, Loader2, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { PurchaseOrderForm } from "@/components/purchase-orders/purchase-order-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { getDictionary } from "@/lib/dictionaries";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { CustomerSummary, Locale, PurchaseOrder, PurchaseOrderItem } from "@/types/crm";

const copy = {
  zh: { history: "采购单记录", create: "新建采购单", createTitle: "创建采购单", createDescription: "填写供应商、交付信息和产品明细，系统自动核算并生成 PDF。", no: "采购单号", supplier: "供应商", status: "状态", amount: "金额", delivery: "交货日期", created: "创建时间", edit: "编辑采购单", editDescription: "更新采购单和明细。", duplicate: "复制采购单", pdf: "生成采购单", loading: "正在读取采购单...", loadFailed: "读取采购单失败", copied: "采购单已复制", copyFailed: "复制采购单失败", empty: "暂无采购单" },
  en: { history: "Purchase orders", create: "New purchase order", createTitle: "Create purchase order", createDescription: "Enter supplier, delivery, and item details to calculate totals and generate a PDF.", no: "PO No.", supplier: "Supplier", status: "Status", amount: "Amount", delivery: "Delivery date", created: "Created", edit: "Edit purchase order", editDescription: "Update the purchase order and its items.", duplicate: "Copy purchase order", pdf: "Generate PDF", loading: "Loading purchase order...", loadFailed: "Failed to load purchase order", copied: "Purchase order copied", copyFailed: "Failed to copy purchase order", empty: "No purchase orders" },
  id: { history: "Daftar purchase order", create: "Purchase order baru", createTitle: "Buat purchase order", createDescription: "Isi pemasok, pengiriman, dan detail item untuk menghitung total dan membuat PDF.", no: "Nomor PO", supplier: "Pemasok", status: "Status", amount: "Jumlah", delivery: "Tanggal kirim", created: "Dibuat", edit: "Edit purchase order", editDescription: "Update purchase order dan itemnya.", duplicate: "Salin purchase order", pdf: "Buat PDF", loading: "Memuat purchase order...", loadFailed: "Gagal memuat purchase order", copied: "Purchase order disalin", copyFailed: "Gagal menyalin purchase order", empty: "Belum ada purchase order" }
} as const;

export function PurchaseOrderList({ locale, orders, customers }: { locale: Locale; orders: PurchaseOrder[]; customers: CustomerSummary[] }) {
  const text = copy[locale];
  const dictionary = getDictionary(locale);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<{ order: PurchaseOrder; items: PurchaseOrderItem[] } | null>(null);

  async function edit(order: PurchaseOrder) {
    setEditOpen(true);
    setLoading(true);
    setDetail(null);
    try {
      const response = await fetch(`/api/purchase-orders/${order.id}`, { cache: "no-store" });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error ?? text.loadFailed);
      setDetail(payload.data);
    } catch (error) {
      toast({ title: text.loadFailed, description: error instanceof Error ? error.message : undefined, variant: "destructive" });
      setEditOpen(false);
    } finally {
      setLoading(false);
    }
  }

  async function duplicate(id: string) {
    const response = await fetch(`/api/purchase-orders/${id}/copy`, { method: "POST" });
    if (!response.ok) return toast({ title: text.copyFailed, variant: "destructive" });
    toast({ title: text.copied });
    location.reload();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{text.history}</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus />{text.create}</Button></DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
            <DialogHeader><DialogTitle>{text.createTitle}</DialogTitle><DialogDescription>{text.createDescription}</DialogDescription></DialogHeader>
            <PurchaseOrderForm locale={locale} customers={customers} onSaved={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>{text.no}</TableHead><TableHead>{text.supplier}</TableHead><TableHead>{text.status}</TableHead><TableHead>{text.amount}</TableHead><TableHead>{text.delivery}</TableHead><TableHead>{text.created}</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {orders.length ? orders.map((order) => {
              const supplier = customers.find((customer) => customer.id === order.customer_id);
              return <TableRow key={order.id}>
                <TableCell className="font-medium"><span className="flex items-center gap-2"><FileText className="size-4 text-muted-foreground" />{order.quotation_no}</span></TableCell>
                <TableCell>{supplier?.company_name ?? order.customer_id}</TableCell>
                <TableCell><Badge variant={order.status === "accepted" ? "success" : "secondary"}>{dictionary.quotationStatuses[order.status]}</Badge></TableCell>
                <TableCell className="font-medium">{formatCurrency(order.total_amount, order.currency)}</TableCell>
                <TableCell>{order.valid_until ?? "-"}</TableCell>
                <TableCell>{formatDate(order.created_at, "yyyy-MM-dd HH:mm", locale)}</TableCell>
                <TableCell><div className="flex justify-end gap-2">
                  <Button size="icon" variant="ghost" aria-label={text.edit} onClick={() => edit(order)}><Pencil /></Button>
                  <Button size="icon" variant="ghost" aria-label={text.duplicate} onClick={() => duplicate(order.id)}><Copy /></Button>
                  <Button asChild size="sm" variant="outline"><Link href={`/api/purchase-orders/${order.id}/pdf`} target="_blank" rel="noreferrer"><Download />{text.pdf}</Link></Button>
                </div></TableCell>
              </TableRow>;
            }) : <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">{text.empty}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
      <Dialog open={editOpen} onOpenChange={(value) => { setEditOpen(value); if (!value) setDetail(null); }}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader><DialogTitle>{text.edit}</DialogTitle><DialogDescription>{text.editDescription}</DialogDescription></DialogHeader>
          {loading ? <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground"><Loader2 className="mr-2 size-4 animate-spin" />{text.loading}</div> : detail ? <PurchaseOrderForm locale={locale} customers={customers} mode="edit" order={detail.order} items={detail.items} onSaved={() => setEditOpen(false)} /> : null}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

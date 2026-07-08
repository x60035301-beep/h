"use client";

import { useMemo, useState } from "react";
import { Copy, Download, FileCheck2, Printer, Save } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { formatCurrency } from "@/lib/utils";
import type { Locale } from "@/types/crm";

type FinanceOrder = {
  id: string;
  customer: string;
  quotation: string;
  amount: number;
};

const copy = {
  zh: {
    title: "开票工作台",
    invoiceInfo: "发票信息",
    buyer: "买方信息",
    seller: "卖方信息",
    items: "开票明细",
    preview: "发票预览",
    invoiceNo: "发票号",
    invoiceDate: "开票日期",
    dueDate: "到期日期",
    status: "状态",
    draft: "草稿",
    issued: "已开票",
    sent: "已发送",
    buyerName: "客户名称",
    buyerAddress: "客户地址",
    buyerEmail: "客户邮箱",
    sellerName: "销售方",
    sellerAddress: "销售方地址",
    sellerEmail: "销售方邮箱",
    paymentTerm: "付款方式",
    shippingTerm: "贸易条款",
    product: "产品 / 服务",
    quantity: "数量",
    unitPrice: "单价",
    remarks: "备注",
    subtotal: "小计",
    tax: "税费",
    total: "总金额",
    save: "保存开票",
    issue: "确认开票",
    print: "打印 / PDF",
    copyNo: "复制发票号",
    exported: "可通过浏览器打印保存为 PDF",
    saved: "开票信息已保存",
    copied: "发票号已复制"
  },
  en: {
    title: "Invoice Workspace",
    invoiceInfo: "Invoice information",
    buyer: "Buyer",
    seller: "Seller",
    items: "Invoice items",
    preview: "Invoice preview",
    invoiceNo: "Invoice No.",
    invoiceDate: "Invoice date",
    dueDate: "Due date",
    status: "Status",
    draft: "Draft",
    issued: "Issued",
    sent: "Sent",
    buyerName: "Buyer name",
    buyerAddress: "Buyer address",
    buyerEmail: "Buyer email",
    sellerName: "Seller",
    sellerAddress: "Seller address",
    sellerEmail: "Seller email",
    paymentTerm: "Payment term",
    shippingTerm: "Trade term",
    product: "Product / service",
    quantity: "Quantity",
    unitPrice: "Unit price",
    remarks: "Remarks",
    subtotal: "Subtotal",
    tax: "Tax",
    total: "Total",
    save: "Save invoice",
    issue: "Issue invoice",
    print: "Print / PDF",
    copyNo: "Copy invoice no.",
    exported: "Use browser print to save as PDF",
    saved: "Invoice saved",
    copied: "Invoice number copied"
  },
  id: {
    title: "Workspace Invoice",
    invoiceInfo: "Informasi invoice",
    buyer: "Pembeli",
    seller: "Penjual",
    items: "Detail invoice",
    preview: "Preview invoice",
    invoiceNo: "No. invoice",
    invoiceDate: "Tanggal invoice",
    dueDate: "Jatuh tempo",
    status: "Status",
    draft: "Draft",
    issued: "Diterbitkan",
    sent: "Terkirim",
    buyerName: "Nama pembeli",
    buyerAddress: "Alamat pembeli",
    buyerEmail: "Email pembeli",
    sellerName: "Penjual",
    sellerAddress: "Alamat penjual",
    sellerEmail: "Email penjual",
    paymentTerm: "Term pembayaran",
    shippingTerm: "Term dagang",
    product: "Produk / layanan",
    quantity: "Quantity",
    unitPrice: "Harga satuan",
    remarks: "Catatan",
    subtotal: "Subtotal",
    tax: "Pajak",
    total: "Total",
    save: "Simpan invoice",
    issue: "Terbitkan invoice",
    print: "Print / PDF",
    copyNo: "Copy no. invoice",
    exported: "Gunakan browser print untuk simpan PDF",
    saved: "Invoice disimpan",
    copied: "No. invoice disalin"
  }
} as const;

export function InvoiceWorkspace({ locale, order }: { locale: Locale; order: FinanceOrder }) {
  const page = copy[locale];
  const today = new Date().toISOString().slice(0, 10);
  const [invoiceNo, setInvoiceNo] = useState(`INV-${order.id.replace("ORD-", "")}`);
  const [invoiceDate, setInvoiceDate] = useState(today);
  const [dueDate, setDueDate] = useState(addDays(today, 7));
  const [status, setStatus] = useState<"draft" | "issued" | "sent">("draft");
  const [buyerName, setBuyerName] = useState(order.customer);
  const [buyerAddress, setBuyerAddress] = useState("Indonesia");
  const [buyerEmail, setBuyerEmail] = useState("finance@customer.com");
  const [sellerName, setSellerName] = useState("HOMY Sponge Factory");
  const [sellerAddress, setSellerAddress] = useState("Indonesia");
  const [sellerEmail, setSellerEmail] = useState("sales@homyfoam.co.id");
  const [paymentTerm, setPaymentTerm] = useState("T/T 30% deposit, 70% before shipment");
  const [shippingTerm, setShippingTerm] = useState("FOB Surabaya");
  const [productName, setProductName] = useState(`Foam products - ${order.quotation}`);
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(order.amount);
  const [remarks, setRemarks] = useState("Please arrange payment according to the agreed payment term.");

  const subtotal = useMemo(() => quantity * unitPrice, [quantity, unitPrice]);
  const tax = 0;
  const total = subtotal + tax;
  const statusLabel = { draft: page.draft, issued: page.issued, sent: page.sent }[status];

  function saveInvoice(nextStatus = status) {
    setStatus(nextStatus);
    toast({ title: page.saved, description: `${invoiceNo} · ${formatCurrency(total)}` });
  }

  async function copyInvoiceNo() {
    await navigator.clipboard.writeText(invoiceNo);
    toast({ title: page.copied });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{page.invoiceInfo}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label={page.invoiceNo}>
              <Input value={invoiceNo} onChange={(event) => setInvoiceNo(event.target.value)} />
            </Field>
            <Field label={page.status}>
              <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{page.draft}</SelectItem>
                  <SelectItem value="issued">{page.issued}</SelectItem>
                  <SelectItem value="sent">{page.sent}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label={page.invoiceDate}>
              <Input type="date" value={invoiceDate} onChange={(event) => setInvoiceDate(event.target.value)} />
            </Field>
            <Field label={page.dueDate}>
              <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
            </Field>
            <Field label={page.paymentTerm}>
              <Input value={paymentTerm} onChange={(event) => setPaymentTerm(event.target.value)} />
            </Field>
            <Field label={page.shippingTerm}>
              <Input value={shippingTerm} onChange={(event) => setShippingTerm(event.target.value)} />
            </Field>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{page.buyer}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Field label={page.buyerName}>
                <Input value={buyerName} onChange={(event) => setBuyerName(event.target.value)} />
              </Field>
              <Field label={page.buyerEmail}>
                <Input value={buyerEmail} onChange={(event) => setBuyerEmail(event.target.value)} />
              </Field>
              <Field label={page.buyerAddress}>
                <Textarea value={buyerAddress} onChange={(event) => setBuyerAddress(event.target.value)} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{page.seller}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Field label={page.sellerName}>
                <Input value={sellerName} onChange={(event) => setSellerName(event.target.value)} />
              </Field>
              <Field label={page.sellerEmail}>
                <Input value={sellerEmail} onChange={(event) => setSellerEmail(event.target.value)} />
              </Field>
              <Field label={page.sellerAddress}>
                <Textarea value={sellerAddress} onChange={(event) => setSellerAddress(event.target.value)} />
              </Field>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{page.items}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[1fr_120px_160px]">
            <Field label={page.product}>
              <Input value={productName} onChange={(event) => setProductName(event.target.value)} />
            </Field>
            <Field label={page.quantity}>
              <Input type="number" min={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value) || 1)} />
            </Field>
            <Field label={page.unitPrice}>
              <Input type="number" min={0} step="0.01" value={unitPrice} onChange={(event) => setUnitPrice(Number(event.target.value) || 0)} />
            </Field>
            <div className="md:col-span-3">
              <Field label={page.remarks}>
                <Textarea value={remarks} onChange={(event) => setRemarks(event.target.value)} />
              </Field>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit xl:sticky xl:top-20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{page.preview}</CardTitle>
          <Badge variant="secondary">{statusLabel}</Badge>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">{page.invoiceNo}</p>
                <p className="font-semibold">{invoiceNo}</p>
              </div>
              <FileCheck2 className="size-5 text-primary" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Preview label={page.invoiceDate} value={invoiceDate} />
              <Preview label={page.dueDate} value={dueDate} />
              <Preview label={page.buyerName} value={buyerName} />
              <Preview label={page.shippingTerm} value={shippingTerm} />
            </div>
          </div>

          <div className="rounded-lg border p-4 text-sm">
            <div className="flex justify-between gap-3">
              <span>{productName}</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="mt-4 space-y-2 border-t pt-4">
              <Preview label={page.subtotal} value={formatCurrency(subtotal)} />
              <Preview label={page.tax} value={formatCurrency(tax)} />
              <Preview label={page.total} value={formatCurrency(total)} strong />
            </div>
          </div>

          <div className="grid gap-2">
            <Button onClick={() => saveInvoice("issued")}>
              <FileCheck2 className="size-4" />
              {page.issue}
            </Button>
            <Button variant="outline" onClick={() => saveInvoice()}>
              <Save className="size-4" />
              {page.save}
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="size-4" />
              {page.print}
            </Button>
            <Button variant="ghost" onClick={copyInvoiceNo}>
              <Copy className="size-4" />
              {page.copyNo}
            </Button>
          </div>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Download className="size-3" />
            {page.exported}
          </p>
        </CardContent>
      </Card>
    </div>
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

function Preview({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "text-base font-semibold" : "font-medium"}>{value}</span>
    </div>
  );
}

function addDays(dateText: string, days: number) {
  const date = new Date(`${dateText}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

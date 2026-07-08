"use client";

import { useMemo, useState } from "react";
import { Banknote, CheckCircle2, FileUp, Plus, ReceiptText, Save } from "lucide-react";

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
  currency?: string;
  progress: number;
};

type PaymentRecord = {
  id: string;
  date: string;
  method: string;
  amount: number;
  reference: string;
  proof?: string;
};

const copy = {
  zh: {
    title: "收款工作台",
    summary: "收款概览",
    record: "登记收款",
    history: "收款记录",
    receivable: "应收金额",
    received: "已收金额",
    balance: "未收余额",
    rate: "收款进度",
    paymentNo: "收款单号",
    date: "收款日期",
    amount: "本次收款",
    method: "收款方式",
    reference: "银行流水 / 参考号",
    payer: "付款方",
    bank: "收款账户",
    proof: "付款凭证",
    notes: "备注",
    save: "保存收款",
    full: "标记全款到账",
    upload: "上传凭证",
    saved: "收款记录已保存",
    completed: "已标记为全款到账",
    noProof: "未上传",
    statusPaid: "已结清",
    statusPartial: "部分收款",
    statusPending: "待收款"
  },
  en: {
    title: "Payment Workspace",
    summary: "Collection summary",
    record: "Record payment",
    history: "Payment records",
    receivable: "Receivable",
    received: "Received",
    balance: "Balance",
    rate: "Collection progress",
    paymentNo: "Payment No.",
    date: "Payment date",
    amount: "Payment amount",
    method: "Method",
    reference: "Bank ref.",
    payer: "Payer",
    bank: "Receiving account",
    proof: "Payment proof",
    notes: "Notes",
    save: "Save payment",
    full: "Mark fully paid",
    upload: "Upload proof",
    saved: "Payment saved",
    completed: "Marked fully paid",
    noProof: "Not uploaded",
    statusPaid: "Paid",
    statusPartial: "Partially paid",
    statusPending: "Pending"
  },
  id: {
    title: "Workspace Pembayaran",
    summary: "Ringkasan collection",
    record: "Catat pembayaran",
    history: "Riwayat pembayaran",
    receivable: "Piutang",
    received: "Diterima",
    balance: "Sisa",
    rate: "Progress collection",
    paymentNo: "No. pembayaran",
    date: "Tanggal bayar",
    amount: "Jumlah bayar",
    method: "Metode",
    reference: "Ref. bank",
    payer: "Pembayar",
    bank: "Akun penerima",
    proof: "Bukti bayar",
    notes: "Catatan",
    save: "Simpan pembayaran",
    full: "Tandai lunas",
    upload: "Upload bukti",
    saved: "Pembayaran disimpan",
    completed: "Ditandai lunas",
    noProof: "Belum upload",
    statusPaid: "Lunas",
    statusPartial: "Bayar sebagian",
    statusPending: "Menunggu"
  }
} as const;

export function PaymentWorkspace({ locale, order }: { locale: Locale; order: FinanceOrder }) {
  const page = copy[locale];
  const currency = order.currency ?? "USD";
  const today = new Date().toISOString().slice(0, 10);
  const initialDeposit = order.progress > 50 ? Math.round(order.amount * 0.3 * 100) / 100 : 0;
  const [paymentNo, setPaymentNo] = useState(`PAY-${order.id.replace("ORD-", "")}`);
  const [paymentDate, setPaymentDate] = useState(today);
  const [paymentAmount, setPaymentAmount] = useState(Math.max(order.amount - initialDeposit, 0));
  const [method, setMethod] = useState("T/T Bank Transfer");
  const [reference, setReference] = useState("");
  const [payer, setPayer] = useState(order.customer);
  const [bank, setBank] = useState("HOMY USD Account");
  const [proof, setProof] = useState("");
  const [notes, setNotes] = useState("Match payment with invoice and update receivable status.");
  const [records, setRecords] = useState<PaymentRecord[]>(
    initialDeposit
      ? [
          {
            id: `DEP-${order.id.replace("ORD-", "")}`,
            date: today,
            method: "T/T Deposit",
            amount: initialDeposit,
            reference: "Deposit received",
            proof: "bank-slip-deposit.pdf"
          }
        ]
      : []
  );

  const received = useMemo(() => records.reduce((sum, item) => sum + item.amount, 0), [records]);
  const balance = Math.max(order.amount - received, 0);
  const rate = Math.min(100, Math.round((received / order.amount) * 100));
  const status = balance <= 0 ? page.statusPaid : received > 0 ? page.statusPartial : page.statusPending;

  function savePayment() {
    const amount = Math.min(Math.max(paymentAmount, 0), balance || paymentAmount);
    if (!amount) return;
    setRecords((current) => [
      ...current,
      {
        id: paymentNo,
        date: paymentDate,
        method,
        amount,
        reference: reference || "-",
        proof: proof || undefined
      }
    ]);
    setPaymentNo(`PAY-${Date.now()}`);
    setPaymentAmount(Math.max(balance - amount, 0));
    setReference("");
    setProof("");
    toast({ title: page.saved, description: `${formatCurrency(amount, currency)} · ${payer}` });
  }

  function markFullyPaid() {
    if (balance <= 0) return;
    setRecords((current) => [
      ...current,
      {
        id: `BAL-${order.id.replace("ORD-", "")}`,
        date: paymentDate,
        method,
        amount: balance,
        reference: reference || "Balance payment",
        proof: proof || undefined
      }
    ]);
    setPaymentAmount(0);
    toast({ title: page.completed, description: formatCurrency(order.amount, currency) });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
      <Card className="h-fit xl:sticky xl:top-20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{page.summary}</CardTitle>
          <Badge variant={balance <= 0 ? "default" : "secondary"}>{status}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <Metric label={page.receivable} value={formatCurrency(order.amount, currency)} />
          <Metric label={page.received} value={formatCurrency(received, currency)} />
          <Metric label={page.balance} value={formatCurrency(balance, currency)} strong />
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted-foreground">{page.rate}</span>
              <span className="font-medium">{rate}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${rate}%` }} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{page.record}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label={page.paymentNo}>
              <Input value={paymentNo} onChange={(event) => setPaymentNo(event.target.value)} />
            </Field>
            <Field label={page.date}>
              <Input type="date" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} />
            </Field>
            <Field label={page.amount}>
              <Input type="number" min={0} step="0.01" value={paymentAmount} onChange={(event) => setPaymentAmount(Number(event.target.value) || 0)} />
            </Field>
            <Field label={page.method}>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="T/T Bank Transfer">T/T Bank Transfer</SelectItem>
                  <SelectItem value="Wise">Wise</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label={page.reference}>
              <Input value={reference} onChange={(event) => setReference(event.target.value)} />
            </Field>
            <Field label={page.payer}>
              <Input value={payer} onChange={(event) => setPayer(event.target.value)} />
            </Field>
            <Field label={page.bank}>
              <Input value={bank} onChange={(event) => setBank(event.target.value)} />
            </Field>
            <Field label={page.proof}>
              <div className="flex gap-2">
                <Input
                  type="file"
                  onChange={(event) => setProof(event.target.files?.[0]?.name ?? "")}
                />
                <Button type="button" variant="outline">
                  <FileUp className="size-4" />
                  {page.upload}
                </Button>
              </div>
            </Field>
            <div className="md:col-span-2">
              <Field label={page.notes}>
                <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
              </Field>
            </div>
            <div className="flex flex-wrap gap-2 md:col-span-2">
              <Button type="button" onClick={savePayment} disabled={balance <= 0 || paymentAmount <= 0}>
                <Save className="size-4" />
                {page.save}
              </Button>
              <Button type="button" variant="outline" onClick={markFullyPaid} disabled={balance <= 0}>
                <CheckCircle2 className="size-4" />
                {page.full}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{page.history}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {records.map((record) => (
              <div key={record.id} className="grid gap-3 rounded-lg border p-3 md:grid-cols-[1fr_140px_160px] md:items-center">
                <div className="min-w-0">
                  <p className="font-medium">{record.id}</p>
                  <p className="text-sm text-muted-foreground">{record.date} · {record.method}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{record.reference}</p>
                </div>
                <div className="font-semibold">{formatCurrency(record.amount, currency)}</div>
                <Badge variant="secondary" className="w-fit">
                  <ReceiptText className="mr-1 size-3" />
                  {record.proof ?? page.noProof}
                </Badge>
              </div>
            ))}
            {!records.length ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                <Banknote className="mx-auto mb-2 size-5" />
                {page.statusPending}
              </div>
            ) : null}
            {balance > 0 ? (
              <Button variant="outline" onClick={() => setPaymentAmount(balance)}>
                <Plus className="size-4" />
                {formatCurrency(balance, currency)}
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>
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

function Metric({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={strong ? "text-lg font-semibold" : "font-medium"}>{value}</span>
    </div>
  );
}

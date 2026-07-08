import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, CheckCircle2, CircleDashed, Clock3, ExternalLink, FileText, ReceiptText, Truck, UserRound } from "lucide-react";

import { ProgressLine, StageRail } from "@/components/ai-crm/progress-line";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { aiCrmCopy, productionOrders, text } from "@/data/ai-crm";
import { getCustomers, getQuotations } from "@/data/queries";
import { defaultLocale, isLocale } from "@/lib/i18n";
import { findOrderRecord, type CrmOrderRecord } from "@/lib/order-records";
import { formatCurrency } from "@/lib/utils";

const labels = {
  zh: {
    back: "返回订单管理",
    quotation: "关联报价",
    lifecycle: "订单生命周期",
    documents: "订单文档",
    finance: "财务状态",
    production: "生产状态",
    customer360: "进入 Customer 360",
    invoice: "发票",
    payment: "收款",
    issued: "已开票",
    deposit: "已收定金",
    pending: "待处理",
    productionOrder: "生产单",
    internal: "订单内部情况",
    internalDescription: "逐项查看 Quotation、PI、Contract、Production、Shipment、Invoice、Payment 和 After Sales 的负责人、文件和下一步。",
    owner: "负责人",
    document: "文件 / 单号",
    dueAt: "预计时间",
    action: "当前动作",
    completed: "已完成",
    current: "进行中",
    waiting: "待开始",
    open: "进入相关页面",
    openInvoice: "进入开票",
    openPayment: "进入收款"
  },
  en: {
    back: "Back to orders",
    quotation: "Linked quotation",
    lifecycle: "Order lifecycle",
    documents: "Order documents",
    finance: "Finance status",
    production: "Production status",
    customer360: "Open Customer 360",
    invoice: "Invoice",
    payment: "Payment",
    issued: "Issued",
    deposit: "Deposit received",
    pending: "Pending",
    productionOrder: "Production order",
    internal: "Order internal status",
    internalDescription: "Inspect owners, files, next actions, and timing across quotation, PI, contract, production, shipment, invoice, payment, and after sales.",
    owner: "Owner",
    document: "File / No.",
    dueAt: "ETA",
    action: "Current action",
    completed: "Completed",
    current: "In progress",
    waiting: "Waiting",
    open: "Open related page",
    openInvoice: "Open invoice",
    openPayment: "Open payment"
  },
  id: {
    back: "Kembali ke order",
    quotation: "Penawaran terkait",
    lifecycle: "Siklus order",
    documents: "Dokumen order",
    finance: "Status finance",
    production: "Status produksi",
    customer360: "Buka Customer 360",
    invoice: "Invoice",
    payment: "Payment",
    issued: "Sudah dibuat",
    deposit: "DP diterima",
    pending: "Menunggu",
    productionOrder: "Order produksi",
    internal: "Status internal order",
    internalDescription: "Lihat owner, file, action berikutnya, dan waktu untuk quotation, PI, contract, production, shipment, invoice, payment, dan after sales.",
    owner: "Owner",
    document: "File / No.",
    dueAt: "Estimasi",
    action: "Action saat ini",
    completed: "Selesai",
    current: "Berjalan",
    waiting: "Menunggu",
    open: "Buka halaman terkait",
    openInvoice: "Buka invoice",
    openPayment: "Buka payment"
  }
} as const;

export default async function OrderDetailPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: localeParam, id } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const copy = aiCrmCopy[locale];
  const page = labels[locale];
  const orderId = decodeURIComponent(id);
  const [quotations, customers] = await Promise.all([getQuotations(), getCustomers()]);
  const order = findOrderRecord(orderId, quotations, customers);
  if (!order) notFound();
  const production = productionOrders.find((item) => item.customer === order.customer);
  const stageDetails = buildStageDetails(order, locale, production?.order);

  return (
    <div className="page-shell">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href={`/${locale}/orders`}>
          <ArrowLeft className="size-4" />
          {page.back}
        </Link>
      </Button>

      <PageHeader
        title={order.id}
        description={`${order.customer} · ${text(order.status, locale)}`}
        actions={
          <Button asChild variant="outline">
            <Link href={`/${locale}/customers/${order.customerId}`}>
              <ExternalLink className="size-4" />
              {page.customer360}
            </Link>
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-4">
        <Summary label={copy.common.amount} value={formatCurrency(order.amount, order.currency)} />
        <Summary label={copy.common.status} value={text(order.status, locale)} />
        <Summary label={page.quotation} value={order.quotation} />
        <Summary label={copy.common.progress} value={`${order.progress}%`} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{page.lifecycle}</CardTitle>
        </CardHeader>
        <CardContent>
          <StageRail steps={order.steps} progress={order.progress} getHref={(step) => `#stage-${toStageSlug(step)}`} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{page.internal}</CardTitle>
          <p className="text-sm text-muted-foreground">{page.internalDescription}</p>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-2">
          {stageDetails.map((stage, index) => (
            <div
              id={`stage-${toStageSlug(stage.name)}`}
              key={stage.name}
              className="scroll-mt-24 rounded-lg border p-4 transition target:border-primary target:bg-accent/40"
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">{stage.name}</h3>
                    <p className="text-xs text-muted-foreground">{stage.summary}</p>
                  </div>
                </div>
                <StatusBadge status={stage.status} labels={page} />
              </div>

              <div className="grid gap-2 text-sm">
                <Info icon={<UserRound className="size-4" />} label={page.owner} value={stage.owner} />
                <Info icon={<FileText className="size-4" />} label={page.document} value={stage.document} />
                <Info icon={<CalendarDays className="size-4" />} label={page.dueAt} value={stage.dueAt} />
                <Info icon={<Clock3 className="size-4" />} label={page.action} value={stage.action} />
              </div>

              {stage.href ? (
                <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                  <Link href={stage.href}>
                    <ExternalLink className="size-4" />
                    {page.open}
                  </Link>
                </Button>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{page.documents}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {["PI-HOMY-20260704.pdf", "Contract-HOMY-A18K2.pdf", "Invoice-HOMY-A18K2.xlsx"].map((file) => (
              <div key={file} className="flex items-center justify-between rounded-md border p-3 text-sm">
                <span className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />
                  {file}
                </span>
                <Badge variant="secondary">v1</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{page.finance}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Info icon={<ReceiptText className="size-4" />} label={page.invoice} value={page.issued} />
            <Info icon={<ReceiptText className="size-4" />} label={page.payment} value={order.progress > 50 ? page.deposit : page.pending} />
            <ProgressLine value={order.progress > 50 ? 60 : 30} />
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <Button asChild variant="outline">
                <Link href={`/${locale}/orders/${encodeURIComponent(order.id)}/invoice`}>
                  <ExternalLink className="size-4" />
                  {page.openInvoice}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/${locale}/orders/${encodeURIComponent(order.id)}/payment`}>
                  <ExternalLink className="size-4" />
                  {page.openPayment}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{page.production}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Info icon={<Truck className="size-4" />} label={page.productionOrder} value={production?.order ?? "-"} />
            <ProgressLine value={production?.progress ?? order.progress} />
            {production ? (
              <Button asChild variant="outline" className="w-full">
                <Link href={`/${locale}/production/${encodeURIComponent(production.order)}`}>
                  <ExternalLink className="size-4" />
                  {page.production}
                </Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

type OrderRecord = CrmOrderRecord;
type StageStatus = "completed" | "current" | "waiting";
type StageDetail = {
  name: string;
  summary: string;
  owner: string;
  document: string;
  dueAt: string;
  action: string;
  status: StageStatus;
  href?: string;
};

function buildStageDetails(order: OrderRecord, locale: keyof typeof labels, productionOrder?: string): StageDetail[] {
  const completedIndex = Math.floor((Math.min(100, Math.max(0, order.progress)) / 100) * order.steps.length);
  const baseDate = order.id.includes("20260704") ? "2026-07-04" : "2026-07-01";
  const copy = {
    zh: {
      quotation: "报价已确认，可继续查看报价单和产品明细。",
      pi: "PI 已生成，等待客户确认付款安排。",
      contract: "合同条款已归档，包含规格、交期、付款方式和包装要求。",
      production: "生产单已进入工厂排程，可查看生产步骤、图片和视频记录。",
      packing: "包装要求已同步，等待装箱照片和 packing list。",
      shipment: "货运方式、目的港和预计发货时间正在确认。",
      invoice: "发票将在出货资料确认后开具。",
      payment: "财务跟进定金、尾款和应收账款状态。",
      afterSales: "订单完成后进入售后跟进，记录投诉、质量问题和满意度。"
    },
    en: {
      quotation: "Quotation is confirmed and ready for product and price detail review.",
      pi: "PI is generated and waiting for customer payment arrangement.",
      contract: "Contract terms are archived, including specs, lead time, payment, and packing.",
      production: "Production order is scheduled; inspect production steps, photos, and videos.",
      packing: "Packing requirements are synced and waiting for carton photos and packing list.",
      shipment: "Shipping method, destination port, and ETD are under confirmation.",
      invoice: "Invoice will be issued after shipment documents are confirmed.",
      payment: "Finance tracks deposit, balance, and receivables.",
      afterSales: "After completion, track complaints, quality issues, and satisfaction."
    },
    id: {
      quotation: "Quotation sudah dikonfirmasi dan siap dicek detail produk serta harga.",
      pi: "PI sudah dibuat dan menunggu pengaturan pembayaran customer.",
      contract: "Term kontrak tersimpan, termasuk spesifikasi, lead time, pembayaran, dan packing.",
      production: "Order produksi sudah masuk jadwal; cek step produksi, foto, dan video.",
      packing: "Kebutuhan packing sudah disinkronkan dan menunggu foto karton serta packing list.",
      shipment: "Metode pengiriman, port tujuan, dan ETD sedang dikonfirmasi.",
      invoice: "Invoice dibuat setelah dokumen shipment dikonfirmasi.",
      payment: "Finance memantau DP, pelunasan, dan piutang.",
      afterSales: "Setelah selesai, catat komplain, masalah kualitas, dan kepuasan customer."
    }
  }[locale];
  const hrefs: Record<string, string | undefined> = {
    Quotation: `/${locale}/quotations`,
    PI: `/${locale}/files`,
    Contract: `/${locale}/files`,
    Production: productionOrder ? `/${locale}/production/${encodeURIComponent(productionOrder)}` : `/${locale}/production`,
    Packing: productionOrder ? `/${locale}/production/${encodeURIComponent(productionOrder)}` : `/${locale}/files`,
    Shipment: `/${locale}/files`,
    Invoice: `/${locale}/orders/${encodeURIComponent(order.id)}/invoice`,
    Payment: `/${locale}/orders/${encodeURIComponent(order.id)}/payment`,
    "After Sales": `/${locale}/after-sales`
  };
  const summaryByStep: Record<string, string> = {
    Quotation: copy.quotation,
    PI: copy.pi,
    Contract: copy.contract,
    Production: copy.production,
    Packing: copy.packing,
    Shipment: copy.shipment,
    Invoice: copy.invoice,
    Payment: copy.payment,
    "After Sales": copy.afterSales
  };

  return order.steps.map((step, index) => ({
    name: step,
    summary: summaryByStep[step] ?? step,
    owner: ownerForStep(step),
    document: documentForStep(step, order, productionOrder),
    dueAt: dueDate(baseDate, index),
    action: actionForStep(step, order, locale),
    status: index < completedIndex ? "completed" : index === completedIndex ? "current" : "waiting",
    href: hrefs[step]
  }));
}

function ownerForStep(step: string) {
  const owners: Record<string, string> = {
    Quotation: "HOMY Sales",
    PI: "Sales Admin",
    Contract: "Manager",
    Production: "Production",
    Packing: "Warehouse",
    Shipment: "Logistics",
    Invoice: "Finance",
    Payment: "Finance",
    "After Sales": "Customer Service"
  };
  return owners[step] ?? "HOMY Team";
}

function documentForStep(step: string, order: OrderRecord, productionOrder?: string) {
  const suffix = order.id.replace("ORD-", "");
  const documents: Record<string, string> = {
    Quotation: order.quotation,
    PI: `PI-${suffix}.pdf`,
    Contract: `Contract-${suffix}.pdf`,
    Production: productionOrder ?? "-",
    Packing: `Packing-List-${suffix}.xlsx`,
    Shipment: `Shipment-${suffix}.pdf`,
    Invoice: `Invoice-${suffix}.xlsx`,
    Payment: `Payment-${suffix}`,
    "After Sales": `AS-${suffix}`
  };
  return documents[step] ?? "-";
}

function actionForStep(step: string, order: OrderRecord, locale: keyof typeof labels) {
  const actions: Record<keyof typeof labels, Record<string, string>> = {
    zh: {
      Quotation: "检查产品、密度、尺寸、数量、单价和报价有效期。",
      PI: "确认定金条款、客户开票信息和 PI 发送状态。",
      Contract: "确认规格、公差、交期、付款方式和签署状态。",
      Production: `跟进 ${order.id} 的工厂生产进度。`,
      Packing: "确认箱唛、包装照片、体积和毛重。",
      Shipment: "确认货代、ETD、ETA、目的港和出货文件。",
      Invoice: "出货资料确认后开具商业发票。",
      Payment: "跟进定金、尾款、付款凭证和应收风险。",
      "After Sales": "交付后跟进客户反馈，并记录质量问题。"
    },
    en: {
      Quotation: "Check product, density, size, quantity, unit price, and validity.",
      PI: "Confirm deposit terms and customer billing information.",
      Contract: "Confirm specification, tolerance, delivery term, and signature status.",
      Production: `Track factory progress for ${order.id}.`,
      Packing: "Confirm carton mark, package photo, volume, and gross weight.",
      Shipment: "Confirm forwarder, ETD, ETA, destination port, and shipping documents.",
      Invoice: "Issue commercial invoice after shipment data is confirmed.",
      Payment: "Track deposit, balance, payment proof, and receivable risk.",
      "After Sales": "Follow customer feedback after delivery and record quality issues."
    },
    id: {
      Quotation: "Cek produk, density, ukuran, quantity, harga satuan, dan masa berlaku.",
      PI: "Konfirmasi term DP dan informasi billing customer.",
      Contract: "Konfirmasi spesifikasi, toleransi, lead time, pembayaran, dan status tanda tangan.",
      Production: `Pantau progress pabrik untuk ${order.id}.`,
      Packing: "Konfirmasi carton mark, foto packing, volume, dan gross weight.",
      Shipment: "Konfirmasi forwarder, ETD, ETA, port tujuan, dan dokumen shipment.",
      Invoice: "Buat commercial invoice setelah data shipment dikonfirmasi.",
      Payment: "Pantau DP, pelunasan, bukti bayar, dan risiko piutang.",
      "After Sales": "Follow up feedback customer setelah delivery dan catat masalah kualitas."
    }
  };
  const localizedActions = actions[locale];
  return localizedActions[step] ?? localizedActions.Quotation;
}

function dueDate(base: string, offset: number) {
  const date = new Date(`${base}T00:00:00`);
  date.setDate(date.getDate() + offset * 2);
  return date.toISOString().slice(0, 10);
}

function StatusBadge({ status, labels: page }: { status: StageStatus; labels: (typeof labels)[keyof typeof labels] }) {
  const config = {
    completed: { label: page.completed, icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200" },
    current: { label: page.current, icon: Clock3, className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200" },
    waiting: { label: page.waiting, icon: CircleDashed, className: "bg-muted text-muted-foreground" }
  }[status];
  const Icon = config.icon;

  return (
    <Badge variant="secondary" className={config.className}>
      <Icon className="mr-1 size-3" />
      {config.label}
    </Badge>
  );
}

function toStageSlug(step: string) {
  return step.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-2 break-words text-lg font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border p-3">
      <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

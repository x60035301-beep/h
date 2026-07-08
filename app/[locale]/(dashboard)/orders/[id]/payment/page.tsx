import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PaymentWorkspace } from "@/components/finance/payment-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { text } from "@/data/ai-crm";
import { getCustomers, getQuotations } from "@/data/queries";
import { defaultLocale, isLocale } from "@/lib/i18n";
import { findOrderRecord } from "@/lib/order-records";

const copy = {
  zh: {
    back: "返回订单详情",
    title: "收款界面",
    description: "登记收款、上传凭证、跟踪应收余额和收款进度。"
  },
  en: {
    back: "Back to order",
    title: "Payment Interface",
    description: "Record payments, upload proof, and track receivable balance."
  },
  id: {
    back: "Kembali ke order",
    title: "Halaman Pembayaran",
    description: "Catat pembayaran, upload bukti, dan pantau sisa piutang."
  }
} as const;

export default async function OrderPaymentPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: localeParam, id } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const orderId = decodeURIComponent(id);
  const [quotations, customers] = await Promise.all([getQuotations(), getCustomers()]);
  const order = findOrderRecord(orderId, quotations, customers);
  if (!order) notFound();
  const page = copy[locale];

  return (
    <div className="page-shell">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href={`/${locale}/orders/${encodeURIComponent(order.id)}#stage-payment`}>
          <ArrowLeft className="size-4" />
          {page.back}
        </Link>
      </Button>

      <PageHeader title={page.title} description={`${order.id} · ${order.customer} · ${text(order.status, locale)}`} />

      <PaymentWorkspace locale={locale} order={order} />
    </div>
  );
}

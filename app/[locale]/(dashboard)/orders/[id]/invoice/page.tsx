import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { InvoiceWorkspace } from "@/components/finance/invoice-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { orderRecords, text } from "@/data/ai-crm";
import { defaultLocale, isLocale } from "@/lib/i18n";

const copy = {
  zh: {
    back: "返回订单详情",
    title: "开票界面",
    description: "创建、确认、打印和管理订单发票。"
  },
  en: {
    back: "Back to order",
    title: "Invoice Interface",
    description: "Create, issue, print, and manage the order invoice."
  },
  id: {
    back: "Kembali ke order",
    title: "Halaman Invoice",
    description: "Buat, terbitkan, print, dan kelola invoice order."
  }
} as const;

export default async function OrderInvoicePage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: localeParam, id } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const orderId = decodeURIComponent(id);
  const order = orderRecords.find((item) => item.id === orderId);
  if (!order) notFound();
  const page = copy[locale];

  return (
    <div className="page-shell">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href={`/${locale}/orders/${encodeURIComponent(order.id)}#stage-invoice`}>
          <ArrowLeft className="size-4" />
          {page.back}
        </Link>
      </Button>

      <PageHeader title={page.title} description={`${order.id} · ${order.customer} · ${text(order.status, locale)}`} />

      <InvoiceWorkspace locale={locale} order={order} />
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, Eye } from "lucide-react";

import { ProgressLine, StageRail } from "@/components/ai-crm/progress-line";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { aiCrmCopy, orderRecords, text } from "@/data/ai-crm";
import { defaultLocale, isLocale } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

const labels = {
  zh: { quotation: "关联报价", lifecycle: "订单生命周期", detail: "查看内部", progress: "履约进度", hint: "点击阶段可查看该环节内部情况" },
  en: { quotation: "Linked quotation", lifecycle: "Order lifecycle", detail: "View details", progress: "Fulfillment progress", hint: "Click any stage to inspect its internal status" },
  id: { quotation: "Penawaran terkait", lifecycle: "Siklus order", detail: "Lihat detail", progress: "Progres fulfillment", hint: "Klik tahap untuk melihat status internal" }
} as const;

export default async function OrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const copy = aiCrmCopy[locale];
  const page = labels[locale];

  return (
    <div className="page-shell">
      <PageHeader title={copy.pages.orders.title} description={copy.pages.orders.description} />

      <section className="grid gap-4">
        {orderRecords.map((order) => (
          <Card key={order.id} className="transition hover:border-primary/40 hover:shadow-soft">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{order.id}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{order.customer}</p>
                </div>
                <div className="flex flex-wrap items-start justify-end gap-3">
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(order.amount)}</p>
                    <p className="text-xs text-muted-foreground">{text(order.status, locale)}</p>
                  </div>
                  <Button asChild>
                    <Link href={`/${locale}/orders/${encodeURIComponent(order.id)}`}>
                      <Eye className="size-4" />
                      {page.detail}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 md:grid-cols-[240px_1fr]">
                <Link
                  href={`/${locale}/orders/${encodeURIComponent(order.id)}#stage-quotation`}
                  className="rounded-md border p-3 transition hover:border-primary/50 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <p className="text-xs text-muted-foreground">{page.quotation}</p>
                  <p className="mt-1 font-medium">{order.quotation}</p>
                </Link>
                <ProgressLine value={order.progress} label={page.progress} />
              </div>
              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">{page.lifecycle}</p>
                  <p className="text-xs text-muted-foreground">{page.hint}</p>
                </div>
                <StageRail
                  steps={order.steps}
                  progress={order.progress}
                  getHref={(step) => `/${locale}/orders/${encodeURIComponent(order.id)}#stage-${toStageSlug(step)}`}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

function toStageSlug(step: string) {
  return step.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

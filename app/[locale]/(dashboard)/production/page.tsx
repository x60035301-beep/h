import Link from "next/link";
import { Camera, Clock, UserRound } from "lucide-react";

import { ProgressLine } from "@/components/ai-crm/progress-line";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { aiCrmCopy, productionOrders } from "@/data/ai-crm";
import { defaultLocale, isLocale } from "@/lib/i18n";

const labels = {
  zh: { owner: "负责人", media: "图片/视频", start: "开始时间", end: "结束时间", remark: "备注", progress: "生产进度" },
  en: { owner: "Owner", media: "Photo/video", start: "Start time", end: "End time", remark: "Remark", progress: "Production progress" },
  id: { owner: "PIC", media: "Foto/video", start: "Mulai", end: "Selesai", remark: "Catatan", progress: "Progres produksi" }
} as const;

export default async function ProductionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const copy = aiCrmCopy[locale];
  const page = labels[locale];

  return (
    <div className="page-shell">
      <PageHeader title={copy.pages.production.title} description={copy.pages.production.description} />

      <section className="grid gap-4">
        {productionOrders.map((order) => (
          <Link key={order.order} href={`/${locale}/production/${encodeURIComponent(order.order)}`} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Card className="transition hover:border-primary/40 hover:shadow-soft">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>{order.order}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{order.customer}</p>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <UserRound className="size-3" />
                    {page.owner}: {order.owner}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <ProgressLine value={order.progress} label={page.progress} />
                <div className="grid gap-3 lg:grid-cols-7">
                  {order.stages.map((stage) => (
                    <div key={stage.name} className="rounded-md border p-3">
                      <p className="text-sm font-medium">{stage.name}</p>
                      <ProgressLine value={stage.progress} className="mt-3" />
                      <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {page.start}: {stage.progress > 0 ? "2026-07-04" : "-"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Camera className="size-3" />
                          {page.media}: {stage.progress > 0 ? "2" : "0"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}

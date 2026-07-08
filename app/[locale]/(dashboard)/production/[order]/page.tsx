import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Camera, Clock, ClipboardList, UserRound } from "lucide-react";

import { ProgressLine } from "@/components/ai-crm/progress-line";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { aiCrmCopy, productionOrders } from "@/data/ai-crm";
import { defaultLocale, isLocale } from "@/lib/i18n";

const labels = {
  zh: { back: "返回生产管理", owner: "负责人", media: "图片/视频", start: "开始时间", progress: "生产进度", log: "生产记录", remark: "备注", completed: "已完成", inProduction: "生产中", checked: "步骤已完成并检验。", working: "进行中，已上传质检媒体。" },
  en: { back: "Back to production", owner: "Owner", media: "Photo/video", start: "Start time", progress: "Production progress", log: "Production log", remark: "Remark", completed: "Completed", inProduction: "In production", checked: "Step completed and checked.", working: "Work in progress, media attached for inspection." },
  id: { back: "Kembali ke produksi", owner: "PIC", media: "Foto/video", start: "Mulai", progress: "Progres produksi", log: "Log produksi", remark: "Catatan", completed: "Selesai", inProduction: "Dalam produksi", checked: "Tahap selesai dan sudah diperiksa.", working: "Sedang berjalan, media QC sudah dilampirkan." }
} as const;

export default async function ProductionDetailPage({
  params
}: {
  params: Promise<{ locale: string; order: string }>;
}) {
  const { locale: localeParam, order: orderParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const copy = aiCrmCopy[locale];
  const page = labels[locale];
  const orderId = decodeURIComponent(orderParam);
  const order = productionOrders.find((item) => item.order === orderId);
  if (!order) notFound();

  return (
    <div className="page-shell">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href={`/${locale}/production`}>
          <ArrowLeft className="size-4" />
          {page.back}
        </Link>
      </Button>

      <PageHeader
        title={order.order}
        description={`${order.customer} · ${copy.pages.production.title}`}
        actions={
          <Badge variant="secondary" className="gap-1">
            <UserRound className="size-3" />
            {page.owner}: {order.owner}
          </Badge>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Summary label={page.progress} value={`${order.progress}%`} />
        <Summary label={page.owner} value={order.owner} />
        <Summary label={copy.common.status} value={order.progress >= 100 ? page.completed : page.inProduction} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{page.progress}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <ProgressLine value={order.progress} />
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

      <Card>
        <CardHeader>
          <CardTitle>{page.log}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.stages
            .filter((stage) => stage.progress > 0)
            .map((stage) => (
              <div key={stage.name} className="flex items-start gap-3 rounded-md border p-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <ClipboardList className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-medium">{stage.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {page.remark}: {stage.progress >= 100 ? page.checked : page.working}
                  </p>
                </div>
                <Badge variant="outline" className="ml-auto shrink-0">
                  {stage.progress}%
                </Badge>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-2 text-lg font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

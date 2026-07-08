import Link from "next/link";
import { MoveRight } from "lucide-react";

import { ProgressLine } from "@/components/ai-crm/progress-line";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { aiCrmCopy, pipelineStages, text } from "@/data/ai-crm";
import { defaultLocale, isLocale } from "@/lib/i18n";
import { cn, formatCurrency } from "@/lib/utils";

const labels = {
  zh: { dwell: "平均停留", conversion: "成交率", funnel: "漏斗统计", drag: "拖拽更新数据库接口预留" },
  en: { dwell: "Avg dwell", conversion: "Conversion", funnel: "Funnel statistics", drag: "Database update endpoint reserved for drag-and-drop" },
  id: { dwell: "Rata-rata tinggal", conversion: "Konversi", funnel: "Statistik funnel", drag: "Endpoint update database untuk drag-and-drop disiapkan" }
} as const;

export default async function PipelinePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const copy = aiCrmCopy[locale];
  const page = labels[locale];
  const maxAmount = Math.max(...pipelineStages.map((stage) => stage.amount));

  return (
    <div className="page-shell">
      <PageHeader title={copy.pages.pipeline.title} description={copy.pages.pipeline.description} actions={<Badge variant="secondary">{page.drag}</Badge>} />

      <section className="grid gap-3 xl:grid-cols-11">
        {pipelineStages.map((stage, index) => (
          <Link key={stage.key} href={`/${locale}/pipeline/${stage.key}`} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Card className="min-h-48 transition hover:border-primary/40 hover:shadow-soft">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2 xl:flex-col xl:items-start">
                  <span className={cn("h-2 w-10 rounded-full", stage.color)} />
                  {index < pipelineStages.length - 1 ? <MoveRight className="hidden size-4 text-muted-foreground xl:block" /> : null}
                </div>
                <CardTitle className="break-words text-sm">{text(stage.label, locale)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-2xl font-semibold">{stage.count}</p>
                  <p className="text-xs text-muted-foreground">{copy.common.customer}</p>
                </div>
                <p className="text-xs text-muted-foreground">{formatCurrency(stage.amount)}</p>
                <ProgressLine value={(stage.amount / maxAmount) * 100} />
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{page.funnel}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-2">
          {pipelineStages.map((stage) => (
            <div key={stage.key} className="rounded-md border p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", stage.color)} />
                  <span className="font-medium">{text(stage.label, locale)}</span>
                </div>
                <Badge variant="outline">{page.dwell} {stage.dwell} {copy.common.days}</Badge>
              </div>
              <ProgressLine value={stage.conversion} label={`${page.conversion} ${stage.conversion}%`} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

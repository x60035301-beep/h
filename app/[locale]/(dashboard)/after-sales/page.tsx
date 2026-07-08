import Link from "next/link";
import { ImageIcon, MessageSquareWarning, Star, Video, type LucideIcon } from "lucide-react";

import { ProgressLine } from "@/components/ai-crm/progress-line";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { afterSalesCases, afterSalesMedia, aiCrmCopy, text } from "@/data/ai-crm";
import { defaultLocale, isLocale } from "@/lib/i18n";

const labels = {
  zh: { issue: "问题", solution: "解决方案", satisfaction: "满意度", timeline: "售后时间轴", media: "图片", video: "视频" },
  en: { issue: "Issue", solution: "Solution", satisfaction: "Satisfaction", timeline: "After-sales timeline", media: "Images", video: "Videos" },
  id: { issue: "Masalah", solution: "Solusi", satisfaction: "Kepuasan", timeline: "Timeline after sales", media: "Gambar", video: "Video" }
} as const;

export default async function AfterSalesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const copy = aiCrmCopy[locale];
  const page = labels[locale];

  return (
    <div className="page-shell">
      <PageHeader title={copy.pages.afterSales.title} description={copy.pages.afterSales.description} />

      <section className="grid gap-4 xl:grid-cols-2">
        {afterSalesCases.map((item) => {
          const media = afterSalesMedia[item.id as keyof typeof afterSalesMedia] ?? [];
          const imageCount = media.filter((mediaItem) => mediaItem.type === "image").length;
          const videoCount = media.filter((mediaItem) => mediaItem.type === "video").length;

          return (
          <Link
            key={item.id}
            href={`/${locale}/after-sales/${encodeURIComponent(item.id)}`}
            className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Card className="h-full transition hover:border-primary/40 hover:shadow-soft">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>{item.id}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{item.customer}</p>
                  </div>
                  <Badge variant="warning">{text(item.status, locale)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Info icon={MessageSquareWarning} label={page.issue} value={`${text(item.type, locale)} · ${text(item.issue, locale)}`} />
                  <Info icon={Star} label={page.satisfaction} value={`${item.satisfaction}/100`} />
                </div>
                <ProgressLine value={item.satisfaction} label={page.satisfaction} />
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">{page.solution}</p>
                  <p className="mt-1 text-sm">{text(item.solution, locale)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1">
                    <ImageIcon className="size-3" />
                    {page.media}: {imageCount}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Video className="size-3" />
                    {page.video}: {videoCount}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
          );
        })}
      </section>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted p-3">
      <Icon className="mb-2 size-4 text-primary" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

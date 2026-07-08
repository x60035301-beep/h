import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ImageIcon, MessageSquareWarning, Star, Video } from "lucide-react";

import { AfterSalesMediaGallery } from "@/components/after-sales/media-gallery";
import { ProgressLine } from "@/components/ai-crm/progress-line";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { afterSalesCases, afterSalesMedia, aiCrmCopy, text } from "@/data/ai-crm";
import { defaultLocale, isLocale } from "@/lib/i18n";

const labels = {
  zh: { back: "返回售后管理", issue: "问题", solution: "解决方案", satisfaction: "满意度", timeline: "售后时间轴", media: "图片 / 视频", images: "图片", videos: "视频", owner: "客服负责人", created: "售后创建", received: "收到质检媒体", confirmed: "解决方案已确认" },
  en: { back: "Back to after sales", issue: "Issue", solution: "Solution", satisfaction: "Satisfaction", timeline: "After-sales timeline", media: "Images / videos", images: "Images", videos: "Videos", owner: "CS owner", created: "Case created", received: "Inspection media received", confirmed: "Solution confirmed" },
  id: { back: "Kembali ke after sales", issue: "Masalah", solution: "Solusi", satisfaction: "Kepuasan", timeline: "Timeline after sales", media: "Gambar / video", images: "Gambar", videos: "Video", owner: "PIC CS", created: "Case dibuat", received: "Media inspeksi diterima", confirmed: "Solusi dikonfirmasi" }
} as const;

export default async function AfterSalesDetailPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: localeParam, id } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const copy = aiCrmCopy[locale];
  const page = labels[locale];
  const caseId = decodeURIComponent(id);
  const item = afterSalesCases.find((caseItem) => caseItem.id === caseId);
  if (!item) notFound();
  const media = afterSalesMedia[caseId as keyof typeof afterSalesMedia] ?? [];
  const imageCount = media.filter((mediaItem) => mediaItem.type === "image").length;
  const videoCount = media.filter((mediaItem) => mediaItem.type === "video").length;

  return (
    <div className="page-shell">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href={`/${locale}/after-sales`}>
          <ArrowLeft className="size-4" />
          {page.back}
        </Link>
      </Button>

      <PageHeader
        title={item.id}
        description={`${item.customer} · ${text(item.type, locale)}`}
        actions={<Badge variant="warning">{text(item.status, locale)}</Badge>}
      />

      <section className="grid gap-4 md:grid-cols-4">
        <Summary label={page.issue} value={text(item.issue, locale)} />
        <Summary label={copy.common.status} value={text(item.status, locale)} />
        <Summary label={page.owner} value="Nadia CS" />
        <Summary label={page.satisfaction} value={`${item.satisfaction}/100`} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>{page.solution}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border p-4">
              <div className="mb-2 flex items-center gap-2">
                <MessageSquareWarning className="size-4 text-amber-600" />
                <p className="font-medium">{text(item.issue, locale)}</p>
              </div>
              <p className="text-sm text-muted-foreground">{text(item.solution, locale)}</p>
            </div>
            <ProgressLine value={item.satisfaction} label={page.satisfaction} />
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <a href="#after-sales-media">
                  <ImageIcon className="size-3" />
                  {page.images}: {imageCount}
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="#after-sales-media">
                  <Video className="size-3" />
                  {page.videos}: {videoCount}
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{page.timeline}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[page.created, page.received, page.confirmed].map((step, index) => (
              <div key={step} className="flex items-start gap-3 rounded-md border p-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  {index === 2 ? <CheckCircle2 className="size-4" /> : <Star className="size-4" />}
                </span>
                <div>
                  <p className="text-sm font-medium">{step}</p>
                  <p className="mt-1 text-xs text-muted-foreground">2026-07-0{index + 2} 10:00</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <AfterSalesMediaGallery locale={locale} caseId={caseId} media={media} />
    </div>
  );
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

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, ExternalLink, ShieldAlert, Sparkles } from "lucide-react";

import { CustomerAiPanel } from "@/components/ai-crm/customer-ai-panel";
import { ProgressLine } from "@/components/ai-crm/progress-line";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { aiCrmCopy, aiScoreCards, customer360Profiles, text } from "@/data/ai-crm";
import { defaultLocale, isLocale } from "@/lib/i18n";

const labels = {
  zh: { back: "返回 AI 分析", strategy: "推荐销售策略", nextTime: "推荐跟进时间", report: "分析报告", customer360: "进入 Customer 360", riskReason: "风险原因" },
  en: { back: "Back to AI analysis", strategy: "Recommended sales strategy", nextTime: "Recommended follow-up time", report: "Analysis report", customer360: "Open Customer 360", riskReason: "Risk reason" },
  id: { back: "Kembali ke analisis AI", strategy: "Strategi rekomendasi", nextTime: "Waktu follow-up rekomendasi", report: "Laporan analisis", customer360: "Buka Customer 360", riskReason: "Alasan risiko" }
} as const;

export default async function AiCustomerDetailPage({
  params
}: {
  params: Promise<{ locale: string; customer: string }>;
}) {
  const { locale: localeParam, customer: customerParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const copy = aiCrmCopy[locale];
  const page = labels[locale];
  const customerName = decodeURIComponent(customerParam);
  const item = aiScoreCards.find((card) => card.customer === customerName);
  if (!item) notFound();
  const profile = customer360Profiles.default;

  return (
    <div className="page-shell">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href={`/${locale}/ai-analysis`}>
          <ArrowLeft className="size-4" />
          {page.back}
        </Link>
      </Button>

      <PageHeader
        title={item.customer}
        description={`${copy.common.score} ${item.score}/100 · ${copy.common.value}: ${item.value}`}
        actions={
          <Button asChild variant="outline">
            <Link href={`/${locale}/customers/11111111-1111-4111-8111-111111111111`}>
              <ExternalLink className="size-4" />
              {page.customer360}
            </Link>
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <Sparkles className="mb-3 size-5 text-primary" />
            <ProgressLine value={item.score} label={`${copy.common.score} ${item.score}/100`} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <CalendarClock className="mb-3 size-5 text-primary" />
            <ProgressLine value={item.probability} label={`${copy.common.probability} ${item.probability}%`} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <ShieldAlert className="mb-3 size-5 text-amber-600" />
            <ProgressLine value={item.churnRisk} label={`${copy.common.risk} ${item.churnRisk}%`} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>{page.strategy}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="rounded-md bg-muted p-4 text-sm">{text(item.strategy, locale)}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{page.nextTime}: {item.nextTime}</Badge>
              <Badge variant="outline">{copy.common.aiReserved}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{page.report}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.aiReport.map((report) => (
              <div key={report.en} className="rounded-md border p-3 text-sm">
                {text(report, locale)}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <CustomerAiPanel
        locale={locale}
        customer={{
          company: item.customer,
          profile,
          currentScores: item
        }}
      />
    </div>
  );
}

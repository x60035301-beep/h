import Link from "next/link";
import { BrainCircuit, CalendarClock, ShieldAlert, Sparkles, type LucideIcon } from "lucide-react";

import { CustomerAiPanel } from "@/components/ai-crm/customer-ai-panel";
import { ProgressLine } from "@/components/ai-crm/progress-line";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { aiCrmCopy, aiScoreCards, customer360Profiles, text } from "@/data/ai-crm";
import { defaultLocale, isLocale } from "@/lib/i18n";

const labels = {
  zh: { valueAnalysis: "客户价值分析", recommendedTime: "推荐跟进时间", summary: "AI 自动总结", report: "AI 分析报告", strategy: "推荐销售策略" },
  en: { valueAnalysis: "Customer value analysis", recommendedTime: "Recommended follow-up time", summary: "AI summary", report: "AI report", strategy: "Recommended sales strategy" },
  id: { valueAnalysis: "Analisis nilai pelanggan", recommendedTime: "Waktu follow-up rekomendasi", summary: "Ringkasan AI", report: "Laporan AI", strategy: "Strategi rekomendasi" }
} as const;

export default async function AiAnalysisPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const copy = aiCrmCopy[locale];
  const page = labels[locale];
  const profile = customer360Profiles.default;

  return (
    <div className="page-shell">
      <PageHeader title={copy.pages.aiAnalysis.title} description={copy.pages.aiAnalysis.description} />

      <section className="grid gap-4 xl:grid-cols-3">
        {aiScoreCards.map((item) => (
          <Link
            key={item.customer}
            href={`/${locale}/ai-analysis/${encodeURIComponent(item.customer)}`}
            className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Card className="h-full transition hover:border-primary/40 hover:shadow-soft">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{item.customer}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{page.valueAnalysis}: {item.value}</p>
                  </div>
                  <span className="flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <BrainCircuit className="size-5" />
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProgressLine value={item.score} label={`${copy.common.score} ${item.score}/100`} />
                <ProgressLine value={item.probability} label={`${copy.common.probability} ${item.probability}%`} />
                <ProgressLine value={item.churnRisk} label={`${copy.common.risk} ${item.churnRisk}%`} />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarClock className="size-4" />
                  {page.recommendedTime}: {item.nextTime}
                </div>
                <p className="rounded-md bg-muted p-3 text-sm">{text(item.strategy, locale)}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>{page.summary}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">{copy.common.score} {profile.aiScore}</Badge>
              <Badge variant="secondary">{copy.common.probability} {profile.winProbability}%</Badge>
              <Badge variant="warning">{copy.common.risk} {profile.churnRisk}%</Badge>
              <Badge variant="outline">{copy.common.aiReserved}</Badge>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">{text(profile.aiSummary, locale)}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <InfoCard icon={Sparkles} label={copy.customer360.ltv} value={profile.ltv} />
              <InfoCard icon={ShieldAlert} label={copy.customer360.profitMargin} value={profile.profitMargin} />
              <InfoCard icon={CalendarClock} label={copy.customer360.purchaseCycle} value={profile.purchaseCycle} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{page.report}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.aiReport.map((item) => (
              <div key={item.en} className="rounded-md border p-3 text-sm">
                {text(item, locale)}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <CustomerAiPanel
        locale={locale}
        customer={{
          company: aiScoreCards[0]?.customer,
          profile,
          currentScores: aiScoreCards[0]
        }}
      />
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <Icon className="mb-3 size-4 text-primary" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Banknote, Database, Factory, LineChart, TrendingUp } from "lucide-react";

import { ProgressLine } from "@/components/ai-crm/progress-line";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { aiCrmCopy, aiScoreCards, bossMetrics, pipelineStages, text } from "@/data/ai-crm";
import { defaultLocale, isLocale } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

const rankingCopy = {
  zh: {
    country: "国家排行",
    product: "产品排行",
    salesperson: "业务员排行",
    risk: "AI 风险预警",
    efficiency: "生产效率",
    empty: "暂无经营数据",
    emptyDescription: "添加真实客户、报价、订单、收款和生产数据后，这里会自动形成老板驾驶舱。"
  },
  en: {
    country: "Country ranking",
    product: "Product ranking",
    salesperson: "Sales ranking",
    risk: "AI risk alerts",
    efficiency: "Production efficiency",
    empty: "No business data",
    emptyDescription: "Add real customers, quotations, orders, payments, and production records to populate this dashboard."
  },
  id: {
    country: "Ranking negara",
    product: "Ranking produk",
    salesperson: "Ranking sales",
    risk: "Peringatan risiko AI",
    efficiency: "Efisiensi produksi",
    empty: "Belum ada data bisnis",
    emptyDescription: "Tambahkan pelanggan, quotation, order, payment, dan data produksi nyata untuk mengisi dashboard ini."
  }
} as const;

const countryRanking: Array<{ name: string; value: number; share: number }> = [];
const productRanking: Array<{ name: string; value: number; share: number }> = [];
const salesRanking: Array<{ name: string; value: number; share: number }> = [];

const metricIcons = [TrendingUp, Banknote, LineChart, Factory];
const metricLinks = ["/orders", "/orders", "/analytics", "/orders", "/orders", "/production"];

export default async function BossDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const copy = aiCrmCopy[locale];
  const rank = rankingCopy[locale];

  return (
    <div className="page-shell">
      <PageHeader title={copy.pages.boss.title} description={copy.pages.boss.description} />

      {bossMetrics.length ? (
        <section className="section-grid">
          {bossMetrics.map((metric, index) => {
            const Icon = metricIcons[index % metricIcons.length];

            return (
              <Link key={metric.key} href={`/${locale}${metricLinks[index] ?? "/analytics"}`} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Card className="h-full transition hover:border-primary/40 hover:shadow-soft">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm text-muted-foreground">{text(metric.label, locale)}</CardTitle>
                    <span className="flex size-8 items-center justify-center rounded-md bg-muted">
                      <Icon className="size-4" />
                    </span>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold">{metric.value}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                      <ArrowUpRight className="size-3" />
                      {metric.trend}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </section>
      ) : (
        <EmptyState icon={Database} title={rank.empty} description={rank.emptyDescription} />
      )}

      <section className="grid gap-4 xl:grid-cols-3">
        <RankingCard title={rank.country} items={countryRanking} empty={rank.empty} />
        <RankingCard title={rank.product} items={productRanking} empty={rank.empty} />
        <RankingCard title={rank.salesperson} items={salesRanking} empty={rank.empty} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle>{rank.efficiency}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pipelineStages.length ? (
              pipelineStages.slice(6, 10).map((stage) => (
                <div key={stage.key} className="rounded-md border p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{text(stage.label, locale)}</p>
                      <p className="text-xs text-muted-foreground">
                        {stage.count} {copy.common.count} - {formatCurrency(stage.amount)}
                      </p>
                    </div>
                    <Badge variant="secondary">{stage.dwell} {copy.common.days}</Badge>
                  </div>
                  <ProgressLine value={stage.conversion} />
                </div>
              ))
            ) : (
              <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">{rank.empty}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{rank.risk}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiScoreCards.length ? (
              aiScoreCards.map((item) => (
                <Link key={item.customer} href={`/${locale}/ai-analysis/${encodeURIComponent(item.customer)}`} className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <div className="rounded-md border p-3 transition hover:border-primary/40 hover:bg-accent">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 size-4 text-amber-600" />
                      <div>
                        <p className="font-medium">{item.customer}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{text(item.strategy, locale)}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant={item.churnRisk > 25 ? "warning" : "secondary"}>
                            {copy.common.risk} {item.churnRisk}%
                          </Badge>
                          <Badge variant="outline">{copy.common.score} {item.score}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">{rank.empty}</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function RankingCard({ title, items, empty }: { title: string; items: Array<{ name: string; value: number; share: number }>; empty: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length ? (
          items.map((item) => (
            <div key={item.name} className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium">{item.name}</span>
                <span className="text-muted-foreground">{formatCurrency(item.value)}</span>
              </div>
              <ProgressLine value={item.share} />
            </div>
          ))
        ) : (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">{empty}</p>
        )}
      </CardContent>
    </Card>
  );
}

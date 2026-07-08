import { AnalyticsCharts } from "@/components/analytics/analytics-charts";
import { PageHeader } from "@/components/layout/page-header";
import { getAnalyticsData } from "@/data/queries";
import { getDictionary } from "@/lib/dictionaries";
import { defaultLocale, isLocale } from "@/lib/i18n";

export default async function AnalyticsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const dictionary = getDictionary(locale);
  const data = await getAnalyticsData();

  return (
    <div className="page-shell">
      <PageHeader title={dictionary.pages.analytics.title} description={dictionary.pages.analytics.description} />
      <AnalyticsCharts {...data} />
    </div>
  );
}

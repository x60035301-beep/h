import { WorldMapPanel } from "@/components/ai-crm/world-map-panel";
import { PageHeader } from "@/components/layout/page-header";
import { aiCrmCopy } from "@/data/ai-crm";
import { defaultLocale, isLocale } from "@/lib/i18n";

export default async function WorldMapPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const copy = aiCrmCopy[locale];

  return (
    <div className="page-shell">
      <PageHeader title={copy.pages.worldMap.title} description={copy.pages.worldMap.description} />
      <WorldMapPanel locale={locale} />
    </div>
  );
}

import { KnowledgeSearch } from "@/components/ai-crm/knowledge-search";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { aiCrmCopy } from "@/data/ai-crm";
import { defaultLocale, isLocale } from "@/lib/i18n";

export default async function KnowledgeBasePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const copy = aiCrmCopy[locale];

  return (
    <div className="page-shell">
      <PageHeader
        title={copy.pages.knowledgeBase.title}
        description={copy.pages.knowledgeBase.description}
        actions={<Badge variant="secondary">{copy.knowledge.articles}</Badge>}
      />
      <KnowledgeSearch locale={locale} />
    </div>
  );
}

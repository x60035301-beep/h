import { WorkflowWorkspace } from "@/components/ai-crm/workflow-workspace";
import { aiCrmCopy } from "@/data/ai-crm";
import { defaultLocale, isLocale } from "@/lib/i18n";

export default async function WorkflowsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const copy = aiCrmCopy[locale];

  return <WorkflowWorkspace locale={locale} title={copy.pages.workflows.title} description={copy.pages.workflows.description} />;
}

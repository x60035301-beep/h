import { AiChatPanel } from "@/components/ai-crm/ai-chat-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { aiCrmCopy } from "@/data/ai-crm";
import { defaultLocale, isLocale } from "@/lib/i18n";
import type { Locale } from "@/types/crm";

const statusCopy: Record<Locale, string> = {
  zh: "销售助手已启用",
  en: "Sales assistant active",
  id: "Asisten sales aktif"
};

export default async function AiChatPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const copy = aiCrmCopy[locale];

  return (
    <div className="page-shell">
      <PageHeader
        title={copy.pages.aiChat.title}
        description={copy.pages.aiChat.description}
        actions={<Badge variant="success">{statusCopy[locale]}</Badge>}
      />
      <AiChatPanel locale={locale} />
    </div>
  );
}

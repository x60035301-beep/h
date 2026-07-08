import { KanbanBoard } from "@/components/kanban/kanban-board";
import { PageHeader } from "@/components/layout/page-header";
import { getCustomers } from "@/data/queries";
import { getDictionary } from "@/lib/dictionaries";
import { defaultLocale, isLocale } from "@/lib/i18n";

export default async function KanbanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const dictionary = getDictionary(locale);
  const customers = await getCustomers();

  return (
    <div className="page-shell max-w-none">
      <PageHeader title={dictionary.pages.kanban.title} description={dictionary.pages.kanban.description} />
      <KanbanBoard customers={customers} locale={locale} />
    </div>
  );
}

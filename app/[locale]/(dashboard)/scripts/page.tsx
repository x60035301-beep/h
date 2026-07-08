import { PageHeader } from "@/components/layout/page-header";
import { ScriptLibrary } from "@/components/scripts/script-library";
import { getScripts } from "@/data/queries";
import { getDictionary } from "@/lib/dictionaries";
import { defaultLocale, isLocale } from "@/lib/i18n";

export default async function ScriptsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const dictionary = getDictionary(locale);
  const scripts = await getScripts();

  return (
    <div className="page-shell">
      <PageHeader title={dictionary.pages.scripts.title} description={dictionary.pages.scripts.description} />
      <ScriptLibrary locale={locale} scripts={scripts} />
    </div>
  );
}

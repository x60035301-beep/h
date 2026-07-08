import { PageHeader } from "@/components/layout/page-header";
import { SettingsForm } from "@/components/settings/settings-form";
import { getSettings } from "@/data/queries";
import { getDictionary } from "@/lib/dictionaries";
import { defaultLocale, isLocale } from "@/lib/i18n";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const dictionary = getDictionary(locale);
  const settings = await getSettings();

  return (
    <div className="page-shell">
      <PageHeader title={dictionary.pages.settings.title} description={dictionary.pages.settings.description} />
      <SettingsForm settings={settings} locale={locale} />
    </div>
  );
}

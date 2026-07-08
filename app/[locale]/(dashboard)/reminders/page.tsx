import { PageHeader } from "@/components/layout/page-header";
import { ReminderManager } from "@/components/reminders/reminder-manager";
import { getCustomers, getReminders } from "@/data/queries";
import { getDictionary } from "@/lib/dictionaries";
import { defaultLocale, isLocale } from "@/lib/i18n";

export default async function RemindersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const dictionary = getDictionary(locale);
  const [reminders, customers] = await Promise.all([getReminders(), getCustomers()]);

  return (
    <div className="page-shell">
      <PageHeader title={dictionary.pages.reminders.title} description={dictionary.pages.reminders.description} />
      <ReminderManager locale={locale} reminders={reminders} customers={customers} />
    </div>
  );
}
